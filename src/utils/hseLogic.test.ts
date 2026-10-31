import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateRiskScore,
  validateResidualRiskReduction,
  computeReadinessBreakdown,
  evaluateInterviewAnswerRubric,
  generatePersonalizedPlan,
} from './hseLogic';

test('5x5 training matrix classifies low, medium, high and critical risks', () => {
  assert.equal(calculateRiskScore(1, 2).level, 'Low');
  assert.equal(calculateRiskScore(2, 3).level, 'Medium');
  assert.equal(calculateRiskScore(3, 4).level, 'High');
  assert.equal(calculateRiskScore(4, 5).level, 'Critical');
});

test('risk score never decides permit applicability by itself', () => {
  const result = calculateRiskScore(5, 5);
  assert.equal(result.permitRequired, null);
  assert.match(result.permitAssessment, /site Permit to Work procedure/i);
});

test('risk calculation rejects non-finite values and invalid matrix thresholds', () => {
  assert.throws(() => calculateRiskScore(Number.NaN, 4), RangeError);
  assert.throws(() => calculateRiskScore(4, 4, { mediumMin: 12, highMin: 8, criticalMin: 15 }), RangeError);
});

test('residual risk must reduce and land in an accepted training band', () => {
  const noReduction = validateResidualRiskReduction(3, 4, 3, 4, 'Engineering Controls');
  assert.equal(noReduction.isValid, false);

  const residualStillHigh = validateResidualRiskReduction(5, 5, 3, 4, 'Engineering Controls');
  assert.equal(residualStillHigh.isValid, false);
  assert.equal(residualStillHigh.requiresSiteReview, true);

  const accepted = validateResidualRiskReduction(4, 4, 1, 3, 'Engineering Controls');
  assert.equal(accepted.isValid, true);
  assert.equal(accepted.initialScore, 16);
  assert.equal(accepted.residualScore, 3);
});

test('PPE alone is not accepted for an initially high or critical risk', () => {
  const result = validateResidualRiskReduction(4, 4, 1, 3, 'PPE');
  assert.equal(result.isValid, false);
  assert.match(result.feedback, /PPE alone/i);
});

test('record counts alone do not manufacture risk or documentation competency', () => {
  const result = computeReadinessBreakdown({
    quizScores: [80, 90],
    riskAssessmentsCompleted: 10,
    hazardScenariosScores: [85],
    interviewScores: [80],
    documentsCompleted: 20,
    completedLessonsCount: 8,
    totalLessonsCount: 10,
  });
  assert.equal(result.technicalKnowledge, 85);
  assert.equal(result.riskAssessment, 0);
  assert.equal(result.documentation, 0);
  assert.equal(result.isAssessmentComplete, false);
  assert.ok(result.evidenceCoverage < 100);
  assert.notEqual(result.readinessBand, 'Site & Interview Ready');
});

test('full scored evidence is required for the top readiness band', () => {
  const result = computeReadinessBreakdown({
    quizScores: [90],
    riskAssessmentsCompleted: 2,
    riskAssessmentScores: [90, 85],
    hazardScenariosScores: [90],
    interviewScores: [85],
    documentsCompleted: 3,
    documentScores: [90, 85],
    completedLessonsCount: 10,
    totalLessonsCount: 10,
  });
  assert.equal(result.isAssessmentComplete, true);
  assert.equal(result.evidenceCoverage, 100);
  assert.equal(result.readinessBand, 'Site & Interview Ready');
  assert.match(result.readinessDisclaimer, /not a professional certification/i);
});

test('rubric fallback recognizes a well-structured answer but remains labelled fallback', () => {
  const keyPoints = [
    'Stop unsafe work immediately',
    'Verify Permit to Work and gas test',
    'Apply Hierarchy of Controls and LOTO isolation',
  ];
  const short = evaluateInterviewAnswerRubric('I will tell supervisor', keyPoints);
  assert.ok(short.overallScore < 30);

  const strong = evaluateInterviewAnswerRubric(
    'First, I will immediately stop the unsafe work using Stop Work Authority. Second, I will inspect the area, verify the Permit to Work and gas test readings, and ensure LOTO isolation and engineering controls are applied before reporting to supervision. Finally, I will confirm controls before work restarts.',
    keyPoints
  );
  assert.ok(strong.overallScore >= 70);
  assert.equal(strong.missingPoints.length, 0);
  assert.equal(strong.evaluationSource, 'rubric_fallback');
  assert.ok(strong.overallScore <= 85);
});

test('personalized plan supports Roman Urdu and bounded daily targets', () => {
  const plan = generatePersonalizedPlan({
    experienceLevel: 'Beginner',
    targetRole: 'HSE Officer',
    interviewGoal: 'Gulf industrial HSE interview',
    englishLevel: 'Basic',
    preferredLanguage: 'Roman Urdu',
    dailyMinutes: 30,
  });
  assert.equal(plan.recommendedStartingPhase, 1);
  assert.ok(plan.weeklyLessonsTarget >= 5);
  assert.match(plan.coachWelcomeNote, /Roman Urdu/i);
  assert.throws(() => generatePersonalizedPlan({
    experienceLevel: 'Beginner', targetRole: 'HSE Officer', interviewGoal: 'test',
    englishLevel: 'Basic', preferredLanguage: 'Roman Urdu', dailyMinutes: Number.NaN,
  }), RangeError);
});
