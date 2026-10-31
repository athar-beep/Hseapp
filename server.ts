import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import { evaluateInterviewAnswerRubric } from './src/utils/hseLogic.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '2mb' }));

// Helper to check if valid Gemini API Key is configured
function getGenAIClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === 'MY_GEMINI_API_KEY' || key.trim().length < 10) {
    return null;
  }
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Server-side in-memory store for Admin CMS modifications & reported content issues
const adminStore = {
  reportedIssues: [
    {
      id: 'iss-1',
      lessonId: 'les-202',
      reporter: 'Field Learner (Demo)',
      issueText: 'Requesting additional Gulf Aramco WAH anchor load conversion note (22 kN = 5,000 lbs).',
      status: 'Resolved — Verified in Lesson 2.2',
      createdAt: '2026-10-29',
    },
  ],
  customAnnouncements: [] as { id: string; title: string; createdAt: string }[],
};

// 1. Health & Backend Integration Status Endpoint
app.get('/api/status', (_req, res) => {
  const hasGemini = Boolean(getGenAIClient());
  const hasSupabase = Boolean(
    process.env.VITE_SUPABASE_URL &&
      process.env.VITE_SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
      process.env.VITE_SUPABASE_ANON_KEY
  );
  res.json({
    status: 'ok',
    aiMode: hasGemini ? 'gemini_server_live' : 'structured_rubric_fallback',
    dbMode: hasSupabase ? 'supabase_cloud_connected' : 'local_demo_persistence',
  });
});

// 2. Server-Side AI Mock Interview Evaluation Endpoint
app.post('/api/ai/interview-eval', async (req, res) => {
  try {
    const { question, userAnswer, expectedKeyPoints, modelAnswer, mode } = req.body as {
      question: string;
      userAnswer: string;
      expectedKeyPoints: string[];
      modelAnswer: string;
      mode: string;
    };

    if (!userAnswer || typeof userAnswer !== 'string') {
      res.status(400).json({ error: 'Answer text is required.' });
      return;
    }

    const ai = getGenAIClient();
    if (!ai) {
      // Honest, transparent structured rubric fallback when external AI key is unavailable
      const fallbackResult = evaluateInterviewAnswerRubric(userAnswer, expectedKeyPoints || []);
      res.json(fallbackResult);
      return;
    }

    try {
      const aiPromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Evaluate this HSE Officer candidate's interview answer.
Interview Mode: ${mode || 'Technical HSE'}
Question: ${question}
Expected Key Safety Points: ${(expectedKeyPoints || []).join('; ')}
Reference Model Answer: ${modelAnswer}
Candidate's Submitted Answer: ${userAnswer}`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          systemInstruction:
            'You are a Senior Industrial HSE Panel Interviewer evaluating a candidate for an HSE Officer role. Evaluate strictly on technical accuracy, relevant safety knowledge (ISO 45001, ILO, UK HSE, OSHA, Hierarchy of Controls, PTW, LOTO), completeness, practical field decision-making, communication clarity, and professional structure. Do not invent fake laws.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallScore: { type: Type.INTEGER, description: 'Overall score from 0 to 100' },
              competencies: {
                type: Type.OBJECT,
                properties: {
                  technicalAccuracy: { type: Type.INTEGER },
                  relevantSafetyKnowledge: { type: Type.INTEGER },
                  answerCompleteness: { type: Type.INTEGER },
                  practicalDecisionMaking: { type: Type.INTEGER },
                  communicationClarity: { type: Type.INTEGER },
                  professionalStructure: { type: Type.INTEGER },
                },
                required: [
                  'technicalAccuracy',
                  'relevantSafetyKnowledge',
                  'answerCompleteness',
                  'practicalDecisionMaking',
                  'communicationClarity',
                  'professionalStructure',
                ],
              },
              strengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              missingPoints: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              improvementAreas: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['overallScore', 'competencies', 'strengths', 'missingPoints', 'improvementAreas'],
          },
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI timeout')), 3000)
      );

      const response = await Promise.race([aiPromise, timeoutPromise]);
      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json({
        ...parsed,
        evaluationSource: 'ai_server',
      });
    } catch (_aiErr) {
      // If API call fails or times out, fall back cleanly to deterministic rubric and mark it honestly
      const fallbackResult = evaluateInterviewAnswerRubric(userAnswer, expectedKeyPoints || []);
      res.json(fallbackResult);
    }
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Evaluation failed' });
  }
});

// 3. Server-Side AI Learning Coach Endpoint
app.post('/api/ai/coach', async (req, res) => {
  try {
    const { message, preferredLanguage, weakAreas } = req.body as {
      message: string;
      preferredLanguage?: 'English' | 'Roman Urdu';
      weakAreas?: string[];
    };

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required.' });
      return;
    }

    const ai = getGenAIClient();
    if (!ai) {
      // Structured curriculum-grounded coaching response when AI credentials are not configured
      const lower = message.toLowerCase();
      let reply = '';
      if (lower.includes('hierarchy') || lower.includes('control')) {
        reply =
          preferredLanguage === 'Roman Urdu'
            ? 'Hierarchy of Controls ke 5 darje hain (Most to Least effective):\n1. Elimination (Hazard ko jar se khatam karna)\n2. Substitution (Kam khatarnaak cheez se badalna, jaise 230V ki jagah 110V)\n3. Engineering Controls (Guardrails, machine guards, ventilation)\n4. Administrative Controls (PTW, JSA, TBT, warning signs)\n5. PPE (Hard hat, full-body harness, goggles — aakhri dhaal).\n\nNote: Yeh general international principle (ISO 45001 / NIOSH) hai; site par hamesha employer procedure follow karein.'
            : 'The Hierarchy of Controls (NIOSH / ISO 45001) ranks controls from most to least effective:\n1. Elimination (physically remove the hazard)\n2. Substitution (replace with lower-risk alternative, e.g., 110V CTE power)\n3. Engineering Controls (collective guardrails, LOTO physical isolation, local exhaust ventilation)\n4. Administrative Controls (Permit to Work, JSA, Toolbox Talks, signage)\n5. PPE (last line of defense protecting the individual worker).\n\nAlways distinguish general safety principles from site-specific employer procedures.';
      } else if (lower.includes('confined') || lower.includes('gas') || lower.includes('o2') || lower.includes('h2s')) {
        reply =
          preferredLanguage === 'Roman Urdu'
            ? 'Confined Space Entry ke ahem technical points:\n• Safe Oxygen (O2) range: 19.5% se 23.5%\n• Flammable Gas (LEL): Hot Work ke liye 0% LEL (<10% Cold Work)\n• Stratified Gas Testing: Top (Methane), Middle (CO), aur Bottom (H2S — hawa se bhari hoti hai)\n• Mandatory Controls: CSE Permit, LOTO/Blinding, Forced Ventilation, 24V Lighting, Standby Man (Hole Watcher) aur Tripod Rescue Winch.'
            : 'Confined Space Entry Technical Checklist:\n• Safe Oxygen Range: 19.5% to 23.5% by volume\n• Flammable LEL: 0% for Hot Work (<10% for Cold Entry)\n• Stratified Testing: Test Top (lighter gases like Methane), Middle (CO), and Bottom (heavier gases like H2S)\n• Controls: Confined Space Permit, positive LOTO/blinding, forced ventilation, 24V lighting, trained Standby Man at entrance, and pre-rigged non-entry tripod rescue.';
      } else if (lower.includes('interview') || lower.includes('introduce') || lower.includes('supervisor')) {
        reply =
          preferredLanguage === 'Roman Urdu'
            ? 'HSE Interview ke liye STAR Method use karein:\n• Situation: Site ka manzar batayein\n• Task: Kaunsa high-risk kaam tha\n• Action: Aap ne Stop Work Authority, PTW check, aur Hierarchy of Controls kaise apply kiye\n• Result: Kaam bina accident ke safe mukammal hua.\nAgar supervisor baat na maane to calm reh kar technical wajah samjhayein aur zaroorat parne par HSE Manager ko escalate karein.'
            : 'For HSE Officer interviews, structure situational answers using the STAR method (Situation, Task, Action, Result):\n1. If imminent danger exists, state clearly that you exercise Stop Work Authority calmly.\n2. Emphasize verifying physical controls at the workface (not just signing paper permits).\n3. When handling supervisor pushback, stay collaborative and propose the safe engineering fix, escalating to the HSE Manager if refusal persists.';
      } else {
        reply =
          preferredLanguage === 'Roman Urdu'
            ? `HSE FieldReady Curriculum Coach (Structured Knowledge Mode):\nAap ne poocha: "${message}"\n\nKey Guidance:\n1. Har high-risk kaam se pehle 5-Step Risk Assessment aur step-by-step JSA तैयार karein.\n2. Controls select karte waqt hamesha Engineering barriers (guardrails, shoring, LOTO) ko PPE se upar rakhein.\n3. ${weakAreas && weakAreas.length > 0 ? `Aapka current revision focus: ${weakAreas.join(', ')}.` : 'Lesson 2.1 (PTW & LOTO) aur Lesson 2.2 (WAH & Confined Space) zaroor revise karein.'}\n(Note: General training guidance — always follow your employer’s approved site procedures and applicable national law.)`
            : `HSE FieldReady Curriculum Coach (Structured Knowledge Mode):\nRegarding "${message}":\n\n1. Always start with the 5-Step Risk Assessment (Identify hazards → Decide who may be harmed → Evaluate Likelihood × Severity & apply Hierarchy of Controls → Record findings → Review).\n2. Verify physical controls at the workface before signing any Permit to Work (LOTO zero-energy try-out, gas tests, guardrails, shoring).\n3. ${weakAreas && weakAreas.length > 0 ? `Recommended revision based on your activity: ${weakAreas.join(', ')}.` : 'Practice a full scenario in the Hazard Identification Lab or AI Mock Interview.'}\n(Note: Distinguish general training principles from statutory law and employer-specific site procedures.)`;
      }

      res.json({
        reply,
        source: 'curriculum_knowledge_engine',
      });
      return;
    }

    try {
      const coachPromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: message,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          systemInstruction: `You are the HSE FieldReady AI Learning Coach for beginner and intermediate HSE Officer candidates.
Preferred explanation language: ${preferredLanguage || 'English'} (if Roman Urdu is selected, provide clear English technical terms alongside Roman Urdu explanations).
Learner's current weak areas: ${(weakAreas || []).join(', ') || 'None recorded yet'}.
Rules:
1. Ground your answers in verified international HSE principles (ILO, UK HSE, OSHA, NIOSH, NFPA, ISO 45001).
2. Explicitly distinguish general training guidance from national legal requirements and employer/site-specific procedures.
3. Never invent fake regulation clauses, statistics, or certifications.
4. Keep answers practical, structured, and encouraging for site interviews.`,
        },
      });

      const coachTimeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Coach timeout')), 3000)
      );

      const response = await Promise.race([coachPromise, coachTimeout]);
      res.json({
        reply: response.text || 'Unable to generate response.',
        source: 'gemini_live_coach',
      });
    } catch (_err) {
      res.json({
        reply:
          'Remember to apply the Hierarchy of Controls (Elimination → Substitution → Engineering → Administrative → PPE) and verify all Permit to Work conditions physically on site. (Structured Curriculum Fallback)',
        source: 'curriculum_knowledge_engine',
      });
    }
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Coach request failed' });
  }
});

// 4. Server-Side Verified Admin Authorization & Content Management Endpoints
app.post('/api/admin/verify', async (req, res) => {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const match = req.header('authorization')?.match(/^Bearer\s+(.+)$/i);
  const accessToken = match?.[1]?.trim();

  if (!supabaseUrl || !anonKey) {
    res.status(503).json({ authorized: false, error: 'Supabase server verification is not configured.' });
    return;
  }
  if (!accessToken) {
    res.status(401).json({ authorized: false, error: 'A valid signed-in session is required.' });
    return;
  }

  try {
    const authResponse = await fetch(`${supabaseUrl.replace(/\/$/, '')}/auth/v1/user`, {
      headers: { apikey: anonKey, Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(5000),
    });
    if (!authResponse.ok) {
      res.status(401).json({ authorized: false, error: 'Supabase session is invalid or expired.' });
      return;
    }
    const authUser = await authResponse.json() as { id?: string };
    if (!authUser.id) {
      res.status(401).json({ authorized: false, error: 'Supabase did not return a valid user.' });
      return;
    }

    const rolesUrl = new URL(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/user_roles`);
    rolesUrl.searchParams.set('user_id', `eq.${authUser.id}`);
    rolesUrl.searchParams.set('role', 'eq.admin');
    rolesUrl.searchParams.set('select', 'role');
    const roleResponse = await fetch(rolesUrl, {
      headers: { apikey: anonKey, Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(5000),
    });
    if (!roleResponse.ok) {
      res.status(503).json({ authorized: false, error: 'Unable to verify the account role. Check the user_roles RLS policy.' });
      return;
    }
    const roles = await roleResponse.json() as Array<{ role: string }>;
    if (!Array.isArray(roles) || !roles.some((entry) => entry.role === 'admin')) {
      res.status(403).json({ authorized: false, error: 'This account has not been assigned the administrator role.' });
      return;
    }

    res.json({ authorized: true, role: 'admin', reportedIssues: adminStore.reportedIssues });
  } catch (error) {
    res.status(503).json({
      authorized: false,
      error: error instanceof Error ? error.message : 'Administrator verification failed.',
    });
  }
});

app.post('/api/admin/report-issue', (req, res) => {
  const { lessonId, issueText, reporter } = req.body as {
    lessonId: string;
    issueText: string;
    reporter?: string;
  };
  if (!issueText || !issueText.trim()) {
    res.status(400).json({ error: 'Issue description is required.' });
    return;
  }
  const newIssue = {
    id: `iss-${Date.now()}`,
    lessonId: lessonId || 'General',
    reporter: reporter || 'Authenticated Learner',
    issueText: issueText.trim(),
    status: 'Open — Pending Admin Review',
    createdAt: new Date().toISOString().split('T')[0],
  };
  adminStore.reportedIssues.unshift(newIssue);
  res.json({ success: true, issue: newIssue, allIssues: adminStore.reportedIssues });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HSE FieldReady full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
