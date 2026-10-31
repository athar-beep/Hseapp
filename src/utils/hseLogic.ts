/**
 * HSE FieldReady shared domain logic.
 *
 * IMPORTANT: The default 5x5 bands below are illustrative training defaults.
 * They are not a substitute for an employer's approved risk matrix, permit
 * system, or local legal requirements.
 */

export type RiskLevelCategory = 'Low' | 'Medium' | 'High' | 'Critical';
export type ControlTier =
  | 'Elimination'
  | 'Substitution'
  | 'Engineering Controls'
  | 'Administrative Controls'
  | 'PPE';

export interface RiskMatrixConfig {
  mediumMin: number;
  highMin: number;
  criticalMin: number;
}

export const DEFAULT_TRAINING_RISK_MATRIX: Readonly<RiskMatrixConfig> = {
  mediumMin: 4,
  highMin: 8,
  criticalMin: 15,
};

export interface RiskEvaluation {
  score: number;
  level: RiskLevelCategory;
  actionRequired: string;
  /**
   * null means a numeric risk score cannot determine permit applicability.
   * Check task-specific triggers and the approved site permit-to-work matrix.
   */
  permitRequired: boolean | null;
  permitAssessment: string;
}

export interface ResidualRiskPolicy {
  /** Risk bands accepted by this illustrative training exercise. */
  acceptedResidualLevels?: RiskLevelCategory[];
  matrix?: RiskMatrixConfig;
}

export interface ResidualRiskValidation {
  isValid: boolean;
  initialScore: number;
  residualScore: number;
  reductionPercent: number;
  initialLevel: RiskLevelCategory;
  residualLevel: RiskLevelCategory;
  requiresSiteReview: boolean;
  feedback: string;
}

export interface ReadinessInput {
  quizScores: number[];
  riskAssessmentsCompleted: number;
  /** Evaluated risk assessment quality scores (0–100), not just record counts. */
  riskAssessmentScores?: number[];
  hazardScenariosScores: number[];
  interviewScores: number[];
  documentsCompleted: number;
  /** Evaluated documentation quality scores (0–100), not just record counts. */
  documentScores?: number[];
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
  readinessBand:
    | 'Foundation Stage'
    | 'Developing Officer'
    | 'Field Competent'
    | 'Site & Interview Ready';
  weakAreas: string[];
  evidenceCoverage: number;
  isAssessmentComplete: boolean;
  readinessDisclaimer: string;
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

function clampInteger(value: number, min: number, max: number, label: string): number {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${label} must be a finite number.`);
  }
  return Math.max(min, Math.min(max, Math.round(value)));
}

function validateMatrix(matrix: RiskMatrixConfig): void {
  const values = [matrix.mediumMin, matrix.highMin, matrix.criticalMin];
  if (
    values.some((value) => !Number.isInteger(value) || value < 2 || value > 25) ||
    !(matrix.mediumMin < matrix.highMin && matrix.highMin < matrix.criticalMin)
  ) {
    throw new RangeError(
      'Risk matrix thresholds must be integer values from 2 to 25 in ascending order.'
    );
  }
}

function classifyRisk(score: number, matrix: RiskMatrixConfig): RiskLevelCategory {
  if (score >= matrix.criticalMin) return 'Critical';
  if (score >= matrix.highMin) return 'High';
  if (score >= matrix.mediumMin) return 'Medium';
  return 'Low';
}

/**
 * Calculates an illustrative 5x5 score. It deliberately does NOT decide
 * whether a permit is required; permit triggers are task/site specific.
 */
export function calculateRiskScore(
  likelihood: number,
  severity: number,
  matrix: RiskMatrixConfig = DEFAULT_TRAINING_RISK_MATRIX
): RiskEvaluation {
  validateMatrix(matrix);
  const safeLikelihood = clampInteger(likelihood, 1, 5, 'Likelihood');
  const safeSeverity = clampInteger(severity, 1, 5, 'Severity');
  const score = safeLikelihood * safeSeverity;
  const level = classifyRisk(score, matrix);

  const actionRequired: Record<RiskLevelCategory, string> = {
    Low: 'Maintain existing controls, follow site rules, and review if conditions change.',
    Medium:
      'Add or strengthen controls, brief affected workers, and have the responsible supervisor verify the controls before and during the task.',
    High:
      'Do not start or continue until a competent person reviews the assessment, strengthens controls, and confirms the site-defined authorization requirements.',
    Critical:
      'Stop or do not start the activity, move people away from immediate danger, and escalate for competent review before work is reconsidered.',
  };

  return {
    score,
    level,
    actionRequired: actionRequired[level],
    permitRequired: null,
    permitAssessment:
      'Not determined by the numeric score. Check task-specific permit triggers and the approved employer/site Permit to Work procedure.',
  };
}

/**
 * Validates numerical reduction AND an illustrative residual-risk acceptance
 * rule. `isValid` means valid for this training exercise only, not real-work
 * authorization. Site procedures and competent approval always take priority.
 */
export function validateResidualRiskReduction(
  initialLikelihood: number,
  initialSeverity: number,
  residualLikelihood: number,
  residualSeverity: number,
  selectedControlTier: ControlTier,
  policy: ResidualRiskPolicy = {}
): ResidualRiskValidation {
  const matrix = policy.matrix ?? DEFAULT_TRAINING_RISK_MATRIX;
  const accepted = policy.acceptedResidualLevels ?? ['Low', 'Medium'];
  if (!accepted.length) {
    throw new RangeError('At least one accepted residual risk level must be configured.');
  }

  const initial = calculateRiskScore(initialLikelihood, initialSeverity, matrix);
  const residual = calculateRiskScore(residualLikelihood, residualSeverity, matrix);
  const reduced = residual.score < initial.score;
  const residualAccepted = accepted.includes(residual.level);
  const ppeOnlyForHighRisk =
    selectedControlTier === 'PPE' && (initial.level === 'High' || initial.level === 'Critical');
  const requiresSiteReview =
    !residualAccepted || residual.level === 'High' || residual.level === 'Critical' || ppeOnlyForHighRisk;
  const isValid = reduced && residualAccepted && !ppeOnlyForHighRisk;
  const reductionPercent = reduced
    ? Math.round(((initial.score - residual.score) / initial.score) * 100)
    : 0;

  let feedback: string;
  if (!reduced) {
    feedback = 'Not accepted: residual risk must be numerically lower than the initial risk.';
  } else if (ppeOnlyForHighRisk) {
    feedback =
      'Not accepted for this exercise: PPE alone is not an adequate primary response to an initially High/Critical risk. Select higher-level controls and reassess.';
  } else if (!residualAccepted) {
    feedback = `Not accepted for this exercise: residual risk remains ${residual.level}. Further controls and competent site review are required.`;
  } else {
    feedback = `Training check passed: risk score reduced by ${reductionPercent}% (${initial.level} ${initial.score} → ${residual.level} ${residual.score}). This is not workplace authorization; follow the approved site acceptance criteria.`;
  }

  return {
    isValid,
    initialScore: initial.score,
    residualScore: residual.score,
    reductionPercent,
    initialLevel: initial.level,
    residualLevel: residual.level,
    requiresSiteReview,
    feedback,
  };
}

function validScores(scores: number[]): number[] {
  return scores.filter((score) => Number.isFinite(score) && score >= 0 && score <= 100);
}

function averageScore(scores: number[]): number {
  const safe = validScores(scores);
  if (!safe.length) return 0;
  return Math.round(safe.reduce((total, score) => total + score, 0) / safe.length);
}

/**
 * A conservative learning indicator. Record counts alone never earn assessment
 * points. Risk and documentation scores are counted only when their quality
 * has actually been evaluated and supplied in the corresponding score arrays.
 */
export function computeReadinessBreakdown(input: ReadinessInput): ReadinessBreakdown {
  const quiz = averageScore(input.quizScores ?? []);
  const risk = averageScore(input.riskAssessmentScores ?? []);
  const practical = averageScore(input.hazardScenariosScores ?? []);
  const interview = averageScore(input.interviewScores ?? []);
  const documentation = averageScore(input.documentScores ?? []);

  const completed = clampInteger(input.completedLessonsCount, 0, Number.MAX_SAFE_INTEGER, 'Completed lessons');
  const total = clampInteger(input.totalLessonsCount, 0, Number.MAX_SAFE_INTEGER, 'Total lessons');
  const completion = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;

  const evidenceDomains = [
    validScores(input.quizScores ?? []).length > 0,
    validScores(input.riskAssessmentScores ?? []).length > 0,
    validScores(input.hazardScenariosScores ?? []).length > 0,
    validScores(input.interviewScores ?? []).length > 0,
    validScores(input.documentScores ?? []).length > 0,
  ];
  const evidenceCount = evidenceDomains.filter(Boolean).length;
  const evidenceCoverage = Math.round((evidenceCount / evidenceDomains.length) * 100);
  const isAssessmentComplete = evidenceCount === evidenceDomains.length;

  const overallReadinessScore = Math.round(
    quiz * 0.2 + risk * 0.2 + practical * 0.2 + interview * 0.15 + documentation * 0.15 + completion * 0.1
  );

  let readinessBand: ReadinessBreakdown['readinessBand'] = 'Foundation Stage';
  if (overallReadinessScore >= 80 && isAssessmentComplete) {
    readinessBand = 'Site & Interview Ready';
  } else if (overallReadinessScore >= 60 && isAssessmentComplete) {
    readinessBand = 'Field Competent';
  } else if (overallReadinessScore >= 35 || evidenceCount >= 2) {
    readinessBand = 'Developing Officer';
  }

  const weakAreas: string[] = [];
  if (!evidenceDomains[0] || quiz < 70) weakAreas.push('Technical HSE Knowledge Quizzes');
  if (!evidenceDomains[1] || risk < 70) weakAreas.push('Evaluated Risk Assessment Quality & ALARP Practice');
  if (!evidenceDomains[2] || practical < 70) weakAreas.push('Field Hazard Identification & Hierarchy of Controls');
  if (!evidenceDomains[3] || interview < 70) weakAreas.push('Structured HSE Interview Communication');
  if (!evidenceDomains[4] || documentation < 70) weakAreas.push('Evaluated Safety Documentation Quality (PTW/JSA/TBT)');

  return {
    technicalKnowledge: quiz,
    riskAssessment: risk,
    practicalSkills: practical,
    interviewCommunication: interview,
    documentation,
    overallCompletion: completion,
    overallReadinessScore,
    readinessBand,
    weakAreas,
    evidenceCoverage,
    isAssessmentComplete,
    readinessDisclaimer:
      'Educational progress indicator only. It is not a professional certification, statutory license, proof of field competence, or guarantee of employment.',
  };
}

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'before', 'by', 'for', 'from', 'in', 'into',
  'is', 'it', 'of', 'on', 'or', 'the', 'their', 'this', 'to', 'with', 'your', 'you',
]);

function tokens(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

function criterionCovered(answerTokens: Set<string>, criterion: string): boolean {
  const criterionTokens = [...new Set(tokens(criterion))];
  if (!criterionTokens.length) return false;
  const matches = criterionTokens.filter((word) => answerTokens.has(word)).length;
  const required = Math.max(1, Math.ceil(criterionTokens.length * 0.6));
  return matches >= required;
}

/**
 * Transparent, deterministic fallback. It is a practice aid, not semantic AI
 * and not proof that an answer is safe, lawful, or contextually correct.
 */
export function evaluateInterviewAnswerRubric(
  userAnswer: string,
  expectedKeyPoints: string[]
): InterviewEvaluationResult {
  const clean = typeof userAnswer === 'string' ? userAnswer.trim() : '';
  const answerTokens = new Set(tokens(clean));
  const wordCount = clean ? clean.split(/\s+/).filter(Boolean).length : 0;
  const criteria = (expectedKeyPoints ?? []).filter((point) => typeof point === 'string' && point.trim());
  const matchedPoints = criteria.filter((point) => criterionCovered(answerTokens, point));
  const missingPoints = criteria.filter((point) => !criterionCovered(answerTokens, point));
  const coverage = criteria.length ? matchedPoints.length / criteria.length : 0;

  if (wordCount < 5) {
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
      strengths: ['You attempted the response.'],
      missingPoints: criteria,
      improvementAreas: [
        'Give a complete answer: immediate action, technical controls, verification, and reporting.',
        'Use accurate HSE terminology and explain how it applies to the described situation.',
        'This rule-based score is an approximate practice aid, not a semantic safety assessment.',
      ],
      evaluationSource: 'rubric_fallback',
    };
  }

  const actionWords = [
    'stop', 'inspect', 'isolate', 'verify', 'report', 'barricade', 'control', 'assess',
    'communicate', 'evacuate', 'secure', 'notify', 'review', 'monitor', 'prevent',
  ];
  const structureWords = ['first', 'second', 'finally', 'because', 'therefore', 'example', 'ensure', 'immediately'];
  const actionHits = actionWords.filter((word) => answerTokens.has(word)).length;
  const structureHits = structureWords.filter((word) => answerTokens.has(word)).length;
  const technicalAccuracy = Math.min(90, Math.round(35 + coverage * 55));
  const relevantSafetyKnowledge = Math.min(90, Math.round(30 + coverage * 50 + Math.min(10, actionHits * 2)));
  const answerCompleteness = Math.min(90, Math.round(25 + coverage * 45 + Math.min(20, wordCount * 0.35)));
  const practicalDecisionMaking = Math.min(90, Math.round(30 + coverage * 35 + Math.min(25, actionHits * 5)));
  const communicationClarity = Math.min(90, Math.round(40 + Math.min(30, wordCount * 0.5) + Math.min(15, structureHits * 3)));
  const professionalStructure = Math.min(90, Math.round(30 + Math.min(45, structureHits * 9) + (wordCount >= 30 ? 10 : 0)));
  const rawAverage = Math.round(
    (technicalAccuracy + relevantSafetyKnowledge + answerCompleteness + practicalDecisionMaking + communicationClarity + professionalStructure) / 6
  );
  const overallScore = Math.min(85, rawAverage);

  const strengths: string[] = [];
  if (matchedPoints.length) strengths.push(`Addressed ${matchedPoints.length} of ${criteria.length} listed technical criteria by keyword coverage.`);
  if (actionHits >= 3) strengths.push('Included several practical action terms.');
  if (structureHits >= 2) strengths.push('Used some sequence or explanation markers.');
  if (!strengths.length) strengths.push('Submitted a response for review.');

  const improvementAreas: string[] = [];
  if (missingPoints.length) improvementAreas.push(`Review these criteria: ${missingPoints.slice(0, 3).join('; ')}.`);
  if (actionHits < 2) improvementAreas.push('Explain specific safe actions, control verification, and escalation steps.');
  if (structureHits < 2) improvementAreas.push('Structure the answer as Situation → Immediate Action → Controls → Verification/Reporting.');
  improvementAreas.push('Rule-based fallback is approximate and cannot verify context, law, or real-world competency.');

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

export function generatePersonalizedPlan(prefs: OnboardingPreferences): {
  recommendedStartingPhase: number;
  weeklyLessonsTarget: number;
  focusTracks: string[];
  coachWelcomeNote: string;
} {
  const recommendedStartingPhase = prefs.experienceLevel === 'Experienced' ? 2 : 1;
  const safeDailyMinutes = clampInteger(prefs.dailyMinutes, 15, 180, 'Daily minutes');
  const weeklyLessonsTarget = Math.max(3, Math.round((safeDailyMinutes * 7) / 20));
  const focusTracks = [
    'Phase 1–2: HSE foundations, risk assessment, and high-risk work controls (PTW, WAH, confined space, LOTO).',
    'Phase 3: Site inspections, toolbox talks, incident reporting, and practical communication.',
  ];

  if (prefs.englishLevel === 'Basic' || prefs.preferredLanguage === 'Roman Urdu') {
    focusTracks.push('Bilingual English + Roman Urdu concept mastery and spoken interview practice.');
  } else {
    focusTracks.push('Technical English, situational judgement, and structured interview practice.');
  }

  return {
    recommendedStartingPhase,
    weeklyLessonsTarget,
    focusTracks,
    coachWelcomeNote:
      prefs.preferredLanguage === 'Roman Urdu'
        ? `Aapka ${safeDailyMinutes}-minute daily learning plan tayyar hai. English technical terms ke sath Roman Urdu explanations aur practical examples use karein.`
        : `Your ${safeDailyMinutes}-minute daily HSE learning plan is ready. Focus on practical controls, evidence-based learning, and clear interview communication.`,
  };
}
