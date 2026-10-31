/**
 * Pure decoupled business logic for HSE FieldReady:
 * - 5x5 Risk Assessment Matrix calculations & Hierarchy of Controls validation
 * - Multi-dimensional HSE Readiness Score computation
 * - Deterministic Rubric-based Interview Answer Evaluator (used as transparent fallback & baseline)
 * - Personalized Learning Plan generation from user onboarding preferences
 */

export type RiskLevelCategory = 'Low' | 'Medium' | 'High' | 'Critical';

export interface RiskEvaluation {
  score: number;
  level: RiskLevelCategory;
  actionRequired: string;
  permitRequired: boolean;
}

export interface ReadinessInput {
  quizScores: number[]; // Array of 0-100 scores
  riskAssessmentsCompleted: number;
  hazardScenariosScores: number[]; // Array of 0-100 scores
  interviewScores: number[]; // Array of 0-100 scores
  documentsCompleted: number;
  completedLessonsCount: number;
  totalLessonsCount: number;
}

export interface ReadinessBreakdown {
  technicalKnowledge: number;
  riskAssessment: number;
  practicalSkills: number;
  interviewCommunication: number;
  documentation: number;
  overallCompletion: number;
  overallReadinessScore: number;
  readinessBand: 'Foundation Stage' | 'Developing Officer' | 'Field Competent' | 'Site & Interview Ready';
  weakAreas: string[];
}

export interface InterviewCompetencyScores {
  technicalAccuracy: number;
  relevantSafetyKnowledge: number;
  answerCompleteness: number;
  practicalDecisionMaking: number;
  communicationClarity: number;
  professionalStructure: number;
}

export interface InterviewEvaluationResult {
  overallScore: number;
  competencies: InterviewCompetencyScores;
  strengths: string[];
  missingPoints: string[];
  improvementAreas: string[];
  evaluationSource: 'ai_server' | 'rubric_fallback';
}

export interface OnboardingPreferences {
  experienceLevel: 'Beginner' | 'Some Experience' | 'Experienced';
  targetRole: 'HSE Officer';
  interviewGoal: string;
  englishLevel: 'Basic' | 'Intermediate' | 'Fluent';
  preferredLanguage: 'English' | 'Roman Urdu';
  dailyMinutes: number;
}

/**
 * 1. 5x5 Risk Matrix Calculation (Likelihood 1-5 x Severity 1-5)
 */
export function calculateRiskScore(likelihood: number, severity: number): RiskEvaluation {
  const clampedL = Math.max(1, Math.min(5, Math.round(likelihood)));
  const clampedS = Math.max(1, Math.min(5, Math.round(severity)));
  const score = clampedL * clampedS;

  if (score >= 15) {
    return {
      score,
      level: 'Critical',
      actionRequired: 'STOP WORK IMMEDIATELY. Task cannot proceed until risk is eliminated or engineered down to ALARP.',
      permitRequired: true,
    };
  }
  if (score >= 8) {
    return {
      score,
      level: 'High',
      actionRequired: 'Mandatory Permit to Work (PTW), formal JSA, engineering controls, and supervisor sign-off required before work.',
      permitRequired: true,
    };
  }
  if (score >= 4) {
    return {
      score,
      level: 'Medium',
      actionRequired: 'Apply specific administrative controls, Toolbox Talk, and verify PPE compliance; monitor work closely.',
      permitRequired: false,
    };
  }
  return {
    score,
    level: 'Low',
    actionRequired: 'Acceptable with standard site rules, routine supervision, and basic mandatory PPE.',
    permitRequired: false,
  };
}

/**
 * Validates that residual risk is lower than initial risk and checks Hierarchy of Controls effectiveness.
 */
export function validateResidualRiskReduction(
  initialLikelihood: number,
  initialSeverity: number,
  residualLikelihood: number,
  residualSeverity: number,
  selectedControlTier: 'Elimination' | 'Substitution' | 'Engineering Controls' | 'Administrative Controls' | 'PPE'
): {
  isValid: boolean;
  initialScore: number;
  residualScore: number;
  reductionPercent: number;
  feedback: string;
} {
  const initial = calculateRiskScore(initialLikelihood, initialSeverity);
  const residual = calculateRiskScore(residualLikelihood, residualSeverity);

  if (residual.score >= initial.score) {
    return {
      isValid: false,
      initialScore: initial.score,
      residualScore: residual.score,
      reductionPercent: 0,
      feedback: 'Residual risk score must be strictly lower than initial risk score after applying additional controls.',
    };
  }

  const reductionPercent = Math.round(((initial.score - residual.score) / initial.score) * 100);

  let tierComment = '';
  if (selectedControlTier === 'PPE' && initial.score >= 12) {
    tierComment = 'Warning: Relying solely on PPE for High/Critical risk violates the Hierarchy of Controls. Combine with Engineering or Administrative barriers.';
  } else if (selectedControlTier === 'Elimination' || selectedControlTier === 'Engineering Controls') {
    tierComment = 'Strong control selection: Higher-tier physical/engineering barriers provide reliable risk reduction.';
  } else {
    tierComment = 'Acceptable control progression; ensure site supervision verifies compliance.';
  }

  return {
    isValid: true,
    initialScore: initial.score,
    residualScore: residual.score,
    reductionPercent,
    feedback: `Risk reduced by ${reductionPercent}% (${initial.level} ${initial.score} → ${residual.level} ${residual.score}). ${tierComment}`,
  };
}

/**
 * 2. Meaningful HSE Readiness Score Calculation
 * Weighted across actual assessment performance, not just lesson completion.
 */
export function computeReadinessBreakdown(input: ReadinessInput): ReadinessBreakdown {
  const avgQuiz =
    input.quizScores.length > 0
      ? Math.round(input.quizScores.reduce((a, b) => a + b, 0) / input.quizScores.length)
      : 0;

  const riskScore = Math.min(100, input.riskAssessmentsCompleted * 35);

  const avgHazard =
    input.hazardScenariosScores.length > 0
      ? Math.round(input.hazardScenariosScores.reduce((a, b) => a + b, 0) / input.hazardScenariosScores.length)
      : 0;

  const avgInterview =
    input.interviewScores.length > 0
      ? Math.round(input.interviewScores.reduce((a, b) => a + b, 0) / input.interviewScores.length)
      : 0;

  const docScore = Math.min(100, Math.round((input.documentsCompleted / 4) * 100));

  const completionScore =
    input.totalLessonsCount > 0
      ? Math.min(100, Math.round((input.completedLessonsCount / input.totalLessonsCount) * 100))
      : 0;

  // Weighted composite readiness score
  const overallReadinessScore = Math.round(
    avgQuiz * 0.25 +
      riskScore * 0.15 +
      avgHazard * 0.20 +
      avgInterview * 0.20 +
      docScore * 0.10 +
      completionScore * 0.10
  );

  let readinessBand: ReadinessBreakdown['readinessBand'] = 'Foundation Stage';
  if (overallReadinessScore >= 80) readinessBand = 'Site & Interview Ready';
  else if (overallReadinessScore >= 60) readinessBand = 'Field Competent';
  else if (overallReadinessScore >= 35) readinessBand = 'Developing Officer';

  const weakAreas: string[] = [];
  if (avgQuiz < 70) weakAreas.push('Technical HSE Knowledge Quizzes');
  if (riskScore < 60) weakAreas.push('5x5 Risk Assessment & ALARP Practice');
  if (avgHazard < 70) weakAreas.push('Field Hazard Identification & Hierarchy of Controls');
  if (avgInterview < 70) weakAreas.push('Structured English Interview Communication');
  if (docScore < 50) weakAreas.push('Site Safety Documentation (PTW, JSA, TBT)');

  return {
    technicalKnowledge: avgQuiz,
    riskAssessment: riskScore,
    practicalSkills: avgHazard,
    interviewCommunication: avgInterview,
    documentation: docScore,
    overallCompletion: completionScore,
    overallReadinessScore,
    readinessBand,
    weakAreas,
  };
}

/**
 * 3. Deterministic Structured Rubric Evaluator for Mock Interview Answers
 */
export function evaluateInterviewAnswerRubric(
  userAnswer: string,
  expectedKeyPoints: string[]
): InterviewEvaluationResult {
  const clean = userAnswer.trim();
  const words = clean.split(/\s+/).filter(Boolean);
  const lower = clean.toLowerCase();

  if (words.length < 5) {
    return {
      overallScore: 18,
      competencies: {
        technicalAccuracy: 15,
        relevantSafetyKnowledge: 15,
        answerCompleteness: 10,
        practicalDecisionMaking: 20,
        communicationClarity: 25,
        professionalStructure: 20,
      },
      strengths: ['Attempted response submission'],
      missingPoints: expectedKeyPoints,
      improvementAreas: [
        'Provide a complete 3-part professional answer (Immediate Action, Technical Control, Reporting/Verification).',
        'Use accurate HSE terminology such as Hazard, Risk, Hierarchy of Controls, PTW, and Stop Work Authority.',
      ],
      evaluationSource: 'rubric_fallback',
    };
  }

  // Check how many expected key points or keywords appear
  const matchedPoints: string[] = [];
  const missingPoints: string[] = [];

  for (const point of expectedKeyPoints) {
    const keywords = point
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 3);
    const hit = keywords.some((kw) => lower.includes(kw));
    if (hit) {
      matchedPoints.push(point);
    } else {
      missingPoints.push(point);
    }
  }

  const coverageRatio = expectedKeyPoints.length > 0 ? matchedPoints.length / expectedKeyPoints.length : 0.5;

  // Check practical decision-making indicators
  const actionVerbs = ['stop', 'inspect', 'isolate', 'verify', 'report', 'barricade', 'permit', 'control', 'assess', 'communicate', 'rescue', 'evacuate'];
  const actionHits = actionVerbs.filter((v) => lower.includes(v)).length;

  // Check structure indicators
  const structureMarkers = ['first', 'second', 'finally', 'because', 'therefore', 'example', 'ensure', 'immediately'];
  const structureHits = structureMarkers.filter((m) => lower.includes(m)).length;

  const technicalAccuracy = Math.min(98, Math.round(45 + coverageRatio * 50));
  const relevantSafetyKnowledge = Math.min(98, Math.round(40 + coverageRatio * 45 + Math.min(13, actionHits * 4)));
  const answerCompleteness = Math.min(98, Math.round(30 + Math.min(40, words.length * 0.9) + coverageRatio * 28));
  const practicalDecisionMaking = Math.min(98, Math.round(40 + Math.min(45, actionHits * 11) + coverageRatio * 13));
  const communicationClarity = Math.min(96, Math.round(50 + Math.min(30, words.length * 0.6) + Math.min(16, structureHits * 5)));
  const professionalStructure = Math.min(96, Math.round(45 + Math.min(35, structureHits * 9) + (words.length >= 25 ? 16 : 5)));

  const overallScore = Math.round(
    (technicalAccuracy +
      relevantSafetyKnowledge +
      answerCompleteness +
      practicalDecisionMaking +
      communicationClarity +
      professionalStructure) /
      6
  );

  const strengths: string[] = [];
  if (matchedPoints.length > 0) {
    strengths.push(`Addressed ${matchedPoints.length} of ${expectedKeyPoints.length} core technical safety criteria.`);
  }
  if (actionHits >= 2) {
    strengths.push('Demonstrated decisive field action orientation (e.g., inspecting, isolating, verifying controls).');
  }
  if (words.length >= 30) {
    strengths.push('Provided substantive detail suitable for an international panel interview.');
  }
  if (strengths.length === 0) {
    strengths.push('Clear intent to address workplace safety responsibility.');
  }

  const improvementAreas: string[] = [];
  if (missingPoints.length > 0) {
    improvementAreas.push(`Incorporate missing technical elements: ${missingPoints.slice(0, 2).join('; ')}.`);
  }
  if (structureHits < 2) {
    improvementAreas.push('Structure your answer using Situation → Immediate Control → Long-Term Prevention.');
  }
  if (words.length < 30) {
    improvementAreas.push('Expand your explanation with a concrete industrial site example.');
  }

  return {
    overallScore,
    competencies: {
      technicalAccuracy,
      relevantSafetyKnowledge,
      answerCompleteness,
      practicalDecisionMaking,
      communicationClarity,
      professionalStructure,
    },
    strengths,
    missingPoints,
    improvementAreas,
    evaluationSource: 'rubric_fallback',
  };
}

/**
 * 4. Generates a Personalized Learning Plan from Onboarding Answers
 */
export function generatePersonalizedPlan(prefs: OnboardingPreferences): {
  recommendedStartingPhase: number;
  weeklyLessonsTarget: number;
  focusTracks: string[];
  coachWelcomeNote: string;
} {
  const recommendedStartingPhase = prefs.experienceLevel === 'Experienced' ? 2 : 1;
  const weeklyLessonsTarget = Math.max(3, Math.round((prefs.dailyMinutes * 7) / 20));

  const focusTracks: string[] = [
    'Phase 1–2: Core HSE Foundations & High-Risk Permits (PTW, WAH, Confined Space, LOTO)',
    'Phase 3: Practical Site Inspections, Toolbox Talks & Incident Investigation',
  ];

  if (prefs.englishLevel === 'Basic' || prefs.preferredLanguage === 'Roman Urdu') {
    focusTracks.push('Bilingual English + Roman Urdu Concept Mastery & Spoken English Interview Drills');
  } else {
    focusTracks.push('Gulf & Multinational Contractor Situational Panel Interview Mastery');
  }

  return {
    recommendedStartingPhase,
    weeklyLessonsTarget,
    focusTracks,
    coachWelcomeNote:
      prefs.preferredLanguage === 'Roman Urdu'
        ? `Welcome! Aapka ${prefs.dailyMinutes}-minute daily plan tayyar hai. Hum English technical terms ke sath Roman Urdu explanation use karenge taake aap interview mein full confidence se jawab dein.`
        : `Your ${prefs.dailyMinutes}-minute daily site-readiness schedule is active. Focus on mastering the Hierarchy of Controls and practical scenario articulation.`,
  };
}
