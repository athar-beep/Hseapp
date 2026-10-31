-- ============================================================================
-- HSE FIELDREADY — COMPLETE SUPABASE POSTGRESQL SCHEMA & RLS MIGRATION
-- Production-Ready Relational Architecture (21 Core Tables + Strict RLS)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('learner', 'instructor', 'admin')),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Helper function for server/RLS admin check
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_user_id AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- 2. profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  target_role TEXT NOT NULL DEFAULT 'HSE Officer',
  experience_level TEXT NOT NULL CHECK (experience_level IN ('Beginner', 'Some Experience', 'Experienced')),
  streak_days INTEGER NOT NULL DEFAULT 1,
  last_active_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. learning_preferences
CREATE TABLE IF NOT EXISTS public.learning_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  interview_goal TEXT NOT NULL DEFAULT 'Gulf & International Industrial Site Readiness',
  english_level TEXT NOT NULL CHECK (english_level IN ('Basic', 'Intermediate', 'Fluent')),
  preferred_language TEXT NOT NULL CHECK (preferred_language IN ('English', 'Roman Urdu')),
  daily_minutes_target INTEGER NOT NULL DEFAULT 30 CHECK (daily_minutes_target BETWEEN 10 AND 180),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. modules
CREATE TABLE IF NOT EXISTS public.modules (
  id TEXT PRIMARY KEY,
  phase_number INTEGER NOT NULL CHECK (phase_number BETWEEN 1 AND 5),
  phase_title TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. lessons
CREATE TABLE IF NOT EXISTS public.lessons (
  id TEXT PRIMARY KEY,
  module_id TEXT NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  phase_number INTEGER NOT NULL CHECK (phase_number BETWEEN 1 AND 5),
  title TEXT NOT NULL,
  estimated_minutes INTEGER NOT NULL DEFAULT 15,
  prerequisite_lesson_id TEXT REFERENCES public.lessons(id) ON DELETE SET NULL,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. lesson_steps
CREATE TABLE IF NOT EXISTS public.lesson_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id TEXT NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL CHECK (step_number BETWEEN 1 AND 5),
  step_type TEXT NOT NULL CHECK (step_type IN ('understand', 'visual', 'knowledge_check', 'practical_challenge', 'interview_connection')),
  content_english JSONB NOT NULL,
  content_roman_urdu JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(lesson_id, step_number)
);

-- 7. lesson_progress
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  current_step INTEGER NOT NULL DEFAULT 1 CHECK (current_step BETWEEN 1 AND 5),
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  practical_response TEXT,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- 8. quiz_questions
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id TEXT PRIMARY KEY,
  lesson_id TEXT NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  explanation TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. quiz_options
CREATE TABLE IF NOT EXISTS public.quiz_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id TEXT NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  option_index INTEGER NOT NULL,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  why_incorrect TEXT
);

-- 10. quiz_attempts
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  score_percent INTEGER NOT NULL CHECK (score_percent BETWEEN 0 AND 100),
  correct_count INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  answers_json JSONB NOT NULL,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. scenarios (Hazard Identification & Fire/Emergency Scenarios)
CREATE TABLE IF NOT EXISTS public.scenarios (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('hazard_lab', 'fire_emergency', 'final_assessment')),
  title TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  scene_data JSONB NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. scenario_attempts
CREATE TABLE IF NOT EXISTS public.scenario_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scenario_id TEXT NOT NULL REFERENCES public.scenarios(id) ON DELETE CASCADE,
  score_percent INTEGER NOT NULL CHECK (score_percent BETWEEN 0 AND 100),
  response_payload JSONB NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. interview_questions
CREATE TABLE IF NOT EXISTS public.interview_questions (
  id TEXT PRIMARY KEY,
  mode TEXT NOT NULL CHECK (mode IN ('HR', 'Technical HSE', 'Beginner', 'Situational')),
  question_text TEXT NOT NULL,
  expected_key_points JSONB NOT NULL,
  model_answer TEXT NOT NULL,
  related_lesson_id TEXT REFERENCES public.lessons(id) ON DELETE SET NULL,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. interview_sessions
CREATE TABLE IF NOT EXISTS public.interview_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mode TEXT NOT NULL,
  overall_score INTEGER NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
  evaluation_method TEXT NOT NULL CHECK (evaluation_method IN ('ai_server', 'rubric_fallback')),
  competency_scores JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. interview_answers
CREATE TABLE IF NOT EXISTS public.interview_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL REFERENCES public.interview_questions(id) ON DELETE CASCADE,
  user_answer TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  feedback_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. glossary_terms
CREATE TABLE IF NOT EXISTS public.glossary_terms (
  id TEXT PRIMARY KEY,
  term_english TEXT NOT NULL,
  simple_definition TEXT NOT NULL,
  roman_urdu_explanation TEXT NOT NULL,
  industrial_example TEXT NOT NULL,
  related_concepts TEXT[] NOT NULL DEFAULT '{}',
  category TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. saved_lessons (Bookmarks)
CREATE TABLE IF NOT EXISTS public.saved_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- 18. user_notes
CREATE TABLE IF NOT EXISTS public.user_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  synced BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- 19. achievements
CREATE TABLE IF NOT EXISTS public.achievements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  criteria_type TEXT NOT NULL,
  threshold_value INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 20. user_achievements
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- 21. references (Verified ILO, UK HSE, OSHA, NIOSH, NFPA Sources)
CREATE TABLE IF NOT EXISTS public.references (
  id TEXT PRIMARY KEY,
  lesson_id TEXT REFERENCES public.lessons(id) ON DELETE CASCADE,
  source_organization TEXT NOT NULL,
  reference_title TEXT NOT NULL,
  official_url TEXT NOT NULL,
  publication_date TEXT,
  last_reviewed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  classification_type TEXT NOT NULL CHECK (classification_type IN ('General Safety Principle', 'International Standard', 'Regulatory Guidance', 'Employer Procedure Template'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON public.lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_scenario_attempts_user ON public.scenario_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_user ON public.interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_glossary_search ON public.glossary_terms(term_english);

-- ============================================================================
-- STRICT ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenario_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glossary_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.references ENABLE ROW LEVEL SECURITY;

-- Private User Data Policies (Owner Only)
CREATE POLICY "Users manage own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users manage own preferences" ON public.learning_preferences
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own lesson progress" ON public.lesson_progress
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own quiz attempts" ON public.quiz_attempts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own scenario attempts" ON public.scenario_attempts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own interview sessions" ON public.interview_sessions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own interview answers" ON public.interview_answers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.interview_sessions s
      WHERE s.id = interview_answers.session_id AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users manage own saved lessons" ON public.saved_lessons
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own notes" ON public.user_notes
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read own achievements" ON public.user_achievements
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Published Content Policies (Readable by authenticated/authorized learners, writable only by verified Admins)
CREATE POLICY "Read published modules" ON public.modules
  FOR SELECT USING (is_published = TRUE OR public.is_admin(auth.uid()));
CREATE POLICY "Admin write modules" ON public.modules
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Read published lessons" ON public.lessons
  FOR SELECT USING (is_published = TRUE OR public.is_admin(auth.uid()));
CREATE POLICY "Admin write lessons" ON public.lessons
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Read lesson steps" ON public.lesson_steps
  FOR SELECT USING (TRUE);
CREATE POLICY "Admin write lesson steps" ON public.lesson_steps
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Read quiz questions" ON public.quiz_questions
  FOR SELECT USING (TRUE);
CREATE POLICY "Admin write quiz questions" ON public.quiz_questions
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Read quiz options" ON public.quiz_options
  FOR SELECT USING (TRUE);
CREATE POLICY "Admin write quiz options" ON public.quiz_options
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Read published scenarios" ON public.scenarios
  FOR SELECT USING (is_published = TRUE OR public.is_admin(auth.uid()));
CREATE POLICY "Admin write scenarios" ON public.scenarios
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Read published interview questions" ON public.interview_questions
  FOR SELECT USING (is_published = TRUE OR public.is_admin(auth.uid()));
CREATE POLICY "Admin write interview questions" ON public.interview_questions
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Read published glossary terms" ON public.glossary_terms
  FOR SELECT USING (is_published = TRUE OR public.is_admin(auth.uid()));
CREATE POLICY "Admin write glossary terms" ON public.glossary_terms
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Read references" ON public.references
  FOR SELECT USING (TRUE);
CREATE POLICY "Admin write references" ON public.references
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
