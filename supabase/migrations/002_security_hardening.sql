-- HSE FieldReady security hardening.
-- Apply only after reviewing the existing 001 schema in the target Supabase project.
-- This migration does NOT create or promote an administrator account.

BEGIN;

-- SECURITY DEFINER functions must use a fixed search_path and fully qualified names.
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = check_user_id
      AND role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;

-- A user can read their own role, but cannot grant or modify roles themselves.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_roles'
      AND policyname = 'Users read own roles'
  ) THEN
    CREATE POLICY "Users read own roles"
      ON public.user_roles
      FOR SELECT TO authenticated
      USING (user_id = (SELECT auth.uid()));
  END IF;
END $$;

-- Remove table-wide access to quiz options. Correct-answer columns must never
-- be returned to an ordinary learner before the quiz has been submitted.
REVOKE ALL ON TABLE public.quiz_options FROM anon, authenticated;
GRANT SELECT (id, question_id, option_index, option_text)
  ON TABLE public.quiz_options TO authenticated;

-- Safe read view. It deliberately omits is_correct and why_incorrect.
CREATE OR REPLACE VIEW public.quiz_options_public
WITH (security_invoker = true)
AS
SELECT id, question_id, option_index, option_text
FROM public.quiz_options;

REVOKE ALL ON public.quiz_options_public FROM PUBLIC;
REVOKE ALL ON public.quiz_options_public FROM anon;
GRANT SELECT ON public.quiz_options_public TO authenticated;

-- Append-only audit log for changes to core published learning content.
CREATE TABLE IF NOT EXISTS public.content_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  entity_table text NOT NULL,
  entity_id text,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_audit_created_at
  ON public.content_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_audit_entity
  ON public.content_audit_log(entity_table, entity_id);

ALTER TABLE public.content_audit_log ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'content_audit_log'
      AND policyname = 'Admins read content audit log'
  ) THEN
    CREATE POLICY "Admins read content audit log"
      ON public.content_audit_log
      FOR SELECT TO authenticated
      USING (public.is_admin((SELECT auth.uid())));
  END IF;
END $$;

REVOKE ALL ON TABLE public.content_audit_log FROM anon, authenticated;
GRANT SELECT ON TABLE public.content_audit_log TO authenticated;

CREATE OR REPLACE FUNCTION public.audit_content_mutation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  row_data jsonb;
  old_json jsonb;
  new_json jsonb;
BEGIN
  IF TG_OP = 'DELETE' THEN
    old_json := to_jsonb(OLD);
    row_data := old_json;
  ELSE
    new_json := to_jsonb(NEW);
    row_data := new_json;
    IF TG_OP = 'UPDATE' THEN
      old_json := to_jsonb(OLD);
    END IF;
  END IF;

  INSERT INTO public.content_audit_log (
    actor_user_id, action, entity_table, entity_id, before_data, after_data
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(row_data ->> 'id', 'unknown'),
    old_json,
    new_json
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

-- Recreate triggers idempotently.
DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'modules', 'lessons', 'lesson_steps', 'quiz_questions', 'scenarios',
    'interview_questions', 'glossary_terms', 'references'
  ] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS audit_content_change ON public.%I', table_name);
    EXECUTE format(
      'CREATE TRIGGER audit_content_change AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.audit_content_mutation()',
      table_name
    );
  END LOOP;
END $$;

-- No INSERT/UPDATE/DELETE policy is granted for user_roles or audit rows.
-- Assign administrator roles only through a trusted operator/service-role process.

COMMIT;
