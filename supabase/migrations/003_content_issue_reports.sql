-- 003_content_issue_reports.sql
-- HSE FieldReady Phase 2 (app build): replaces the Express server's in-memory
-- /api/admin/report-issue store so the mobile app (no local server) can submit
-- content issue reports straight to Supabase, and admins can read the queue.
-- Idempotent: safe to run more than once.

create table if not exists public.content_issue_reports (
  id uuid primary key default gen_random_uuid(),
  lesson_id text,
  issue_text text not null,
  reporter text,
  status text not null default 'Open — Pending Admin Review',
  created_at timestamptz not null default now()
);

alter table public.content_issue_reports enable row level security;

-- Anyone (guest or signed-in learner) may submit a report — same openness as
-- the old server endpoint. Nobody can read reports back except admins.
drop policy if exists "Anyone can submit issue reports" on public.content_issue_reports;
create policy "Anyone can submit issue reports"
  on public.content_issue_reports
  for insert to anon, authenticated
  with check (true);

drop policy if exists "Admins read issue reports" on public.content_issue_reports;
create policy "Admins read issue reports"
  on public.content_issue_reports
  for select to authenticated
  using (public.is_admin(auth.uid()));

grant insert on public.content_issue_reports to anon, authenticated;
grant select on public.content_issue_reports to authenticated;

-- The admin-read policy above evaluates is_admin() for signed-in users too;
-- migration 002 granted EXECUTE to anon only. Cover authenticated as well.
grant execute on function public.is_admin(uuid) to authenticated;
