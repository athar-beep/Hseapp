import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateRiskScore,
  validateResidualRiskReduction,
  computeReadinessBreakdown,
  evaluateInterviewAnswerRubric,
  generatePersonalizedPlan,
} from './hseLogic';

test('5x5 Risk Matrix accurately classifies Low, Medium, High, and Critical scores', () => {
  const low = calculateRiskScore(1, 2);
  assert.equal(low.score, 2);
  assert.equal(low.level, 'Low');
  assert.equal(low.permitRequired, false);

  const medium = calculateRiskScore(2, 3);
  assert.equal(medium.score, 6);
  assert.equal(medium.level, 'Medium');

  const high = calculateRiskScore(3, 4);
  assert.equal(high.score, 12);
  assert.equal(high.level, 'High');
  assert.equal(high.permitRequired, true);

  const critical = calculateRiskScore(4, 5);
  assert.equal(critical.score, 20);
  assert.equal(critical.level, 'Critical');
  assert.equal(critical.permitRequired, true);
});

test('validateResidualRiskReduction enforces residual < initial and flags PPE-only on high risk', () => {
  const invalid = validateResidualRiskReduction(3, 4, 3, 4, 'Engineering Controls');
  assert.equal(invalid.isValid, false);

  const valid = validateResidualRiskReduction(4, 4, 1, 3, 'Engineering Controls');
  assert.equal(valid.isValid, true);
  assert.equal(valid.initialScore, 16);
  assert.equal(valid.residualScore, 3);
  assert.ok(valid.reductionPercent > 75);
});

test('computeReadinessBreakdown weights actual performance metrics accurately', () => {
  const breakdown = computeReadinessBreakdown({
    quizScores: [80, 90],
    riskAssessmentsCompleted: 3,
    hazardScenariosScores: [85],
    interviewScores: [80],
    documentsCompleted: 4,
    completedLessonsCount: 8,
    totalLessonsCount: 10,
  });

  assert.equal(breakdown.technicalKnowledge, 85);
  assert.equal(breakdown.riskAssessment, 100);
  assert.equal(breakdown.practicalSkills, 85);
  assert.equal(breakdown.overallReadinessScore >= 80, true);
  assert.equal(breakdown.readinessBand, 'Site & Interview Ready');
  assert.equal(breakdown.weakAreas.length, 0);
});

test('evaluateInterviewAnswerRubric scores comprehensive technical answers higher than brief stubs', () => {
  const keyPoints = [
    'Stop unsafe work immediately',
    'Verify Permit to Work and gas test',
    'Apply Hierarchy of Controls and LOTO isolation',
  ];

  const shortRes = evaluateInterviewAnswerRubric('I will tell supervisor', keyPoints);
  assert.equal(shortRes.overallScore < 30, true);

  const strongRes = evaluateInterviewAnswerRubric(
    'First, I will immediately stop the unsafe work using Stop Work Authority. Second, I will inspect the area, verify the Permit to Work and gas test readings, and ensure LOTO isolation and engineering controls are applied before reporting to supervision.',
    keyPoints
  );
  assert.equal(strongRes.overallScore >= 75, true);
  assert.equal(strongRes.missingPoints.length, 0);
});

test('generatePersonalizedPlan adapts starting phase and bilingual note', () => {
  const plan = generatePersonalizedPlan({
    experienceLevel: 'Beginner',
    targetRole: 'HSE Officer',
    interviewGoal: 'Gulf Oil & Gas Construction',
    englishLevel: 'Basic',
    preferredLanguage: 'Roman Urdu',
    dailyMinutes: 30,
  });

  assert.equal(plan.recommendedStartingPhase, 1);
  assert.ok(plan.weeklyLessonsTarget >= 5);
  assert.ok(plan.coachWelcomeNote.includes('Roman Urdu'));
});
