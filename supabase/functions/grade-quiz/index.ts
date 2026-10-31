import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type SubmittedAnswer = { questionId: string; optionId: string };

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) return json({ error: 'Authentication required.' }, 401);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return json({ error: 'Quiz grading is not configured on the server.' }, 503);
  }

  let body: { lessonId?: unknown; answers?: unknown };
  try {
    const raw = await request.text();
    if (raw.length > 32_000) return json({ error: 'Request is too large.' }, 413);
    body = JSON.parse(raw);
  } catch {
    return json({ error: 'Invalid JSON request.' }, 400);
  }

  const lessonId = typeof body.lessonId === 'string' ? body.lessonId.trim() : '';
  const answers = Array.isArray(body.answers) ? (body.answers as SubmittedAnswer[]) : [];
  if (!lessonId || answers.length < 1 || answers.length > 20) {
    return json({ error: 'Provide a lesson ID and between 1 and 20 answers.' }, 400);
  }
  if (answers.some((answer) =>
    !answer || typeof answer.questionId !== 'string' || typeof answer.optionId !== 'string'
  )) {
    return json({ error: 'Each answer must contain questionId and optionId.' }, 400);
  }

  const uniqueQuestionIds = [...new Set(answers.map((answer) => answer.questionId))];
  if (uniqueQuestionIds.length !== answers.length) {
    return json({ error: 'Duplicate question answers are not allowed.' }, 400);
  }

  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const token = authorization.slice('Bearer '.length).trim();
  const { data: authData, error: authError } = await authClient.auth.getUser(token);
  if (authError || !authData.user) return json({ error: 'Invalid or expired session.' }, 401);

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: lesson, error: lessonError } = await adminClient
    .from('lessons')
    .select('id, is_published')
    .eq('id', lessonId)
    .maybeSingle();
  if (lessonError) return json({ error: 'Unable to verify the lesson.' }, 500);
  if (!lesson || lesson.is_published !== true) {
    return json({ error: 'This lesson is unavailable for quiz submission.' }, 404);
  }

  const { data: questions, error: questionError } = await adminClient
    .from('quiz_questions')
    .select('id, lesson_id')
    .in('id', uniqueQuestionIds);
  if (questionError) return json({ error: 'Unable to load quiz questions.' }, 500);
  if (!questions || questions.length !== uniqueQuestionIds.length || questions.some((q) => q.lesson_id !== lessonId)) {
    return json({ error: 'One or more questions do not belong to this lesson.' }, 400);
  }

  const optionIds = answers.map((answer) => answer.optionId);
  if (new Set(optionIds).size !== optionIds.length) {
    return json({ error: 'An answer option cannot be reused for multiple questions.' }, 400);
  }

  const { data: chosenOptions, error: optionError } = await adminClient
    .from('quiz_options')
    .select('id, question_id, is_correct')
    .in('id', optionIds);
  if (optionError) return json({ error: 'Unable to validate submitted options.' }, 500);
  if (!chosenOptions || chosenOptions.length !== answers.length) {
    return json({ error: 'One or more selected options are invalid.' }, 400);
  }

  const optionById = new Map(chosenOptions.map((option) => [option.id, option]));
  const results = answers.map((answer) => {
    const option = optionById.get(answer.optionId);
    if (!option || option.question_id !== answer.questionId) return null;
    return { questionId: answer.questionId, selectedOptionId: answer.optionId, isCorrect: option.is_correct === true };
  });
  if (results.some((result) => result === null)) {
    return json({ error: 'Selected options do not match their questions.' }, 400);
  }

  const safeResults = results.filter((result): result is NonNullable<typeof result> => result !== null);
  const correctCount = safeResults.filter((result) => result.isCorrect).length;
  const totalQuestions = safeResults.length;
  const scorePercent = Math.round((correctCount / totalQuestions) * 100);
  const { data: attempt, error: insertError } = await adminClient
    .from('quiz_attempts')
    .insert({
      user_id: authData.user.id,
      lesson_id: lessonId,
      score_percent: scorePercent,
      correct_count: correctCount,
      total_questions: totalQuestions,
      answers_json: safeResults,
    })
    .select('id, score_percent, correct_count, total_questions, attempted_at')
    .single();

  if (insertError) return json({ error: 'Unable to save quiz attempt.' }, 500);

  return json({
    attempt,
    scorePercent,
    correctCount,
    totalQuestions,
    results: safeResults,
    gradingSource: 'server',
  });
});
