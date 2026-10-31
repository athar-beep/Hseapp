import React, { useState } from 'react';
import { InterviewBankQuestion } from '../data/curriculumData';
import { InterviewEvaluationResult, evaluateInterviewAnswerRubric } from '../utils/hseLogic';
import {
  Mic,
  MicOff,
  Send,
  Sparkles,
  BookOpen,
  RotateCcw,
} from 'lucide-react';

interface InterviewSimulatorViewProps {
  questionBank: InterviewBankQuestion[];
  interviewHistory: {
    id: string;
    mode: string;
    question: string;
    score: number;
    source: 'ai_server' | 'rubric_fallback';
    date: string;
  }[];
  onRecordInterviewResult: (entry: {
    id: string;
    mode: string;
    question: string;
    score: number;
    source: 'ai_server' | 'rubric_fallback';
    date: string;
  }) => void;
  onNavigateToLesson: (lessonId: string) => void;
}

export const InterviewSimulatorView: React.FC<InterviewSimulatorViewProps> = ({
  questionBank,
  interviewHistory,
  onRecordInterviewResult,
  onNavigateToLesson,
}) => {
  const [selectedMode, setSelectedMode] = useState<
    'All / Random' | 'HR' | 'Technical HSE' | 'Beginner' | 'Situational'
  >('All / Random');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<InterviewEvaluationResult | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechNotice, setSpeechNotice] = useState<string | null>(null);

  const filteredQuestions =
    selectedMode === 'All / Random'
      ? questionBank
      : questionBank.filter((q) => q.mode === selectedMode);

  const activeQuestion =
    filteredQuestions[currentQuestionIdx % Math.max(1, filteredQuestions.length)] ||
    questionBank[0];

  const handleVoiceToggle = () => {
    const SpeechRecognitionAPI =
      (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setSpeechNotice(
        'Browser Speech-to-Text API is unavailable in this environment. Please use text input or paste your spoken transcript.'
      );
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recognition = new (SpeechRecognitionAPI as any)();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      setIsListening(true);
      setSpeechNotice('Listening... Speak your HSE interview answer clearly.');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript || '';
        setUserAnswer((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
        setSpeechNotice('Voice transcript captured.');
      };
      recognition.onerror = () => {
        setIsListening(false);
        setSpeechNotice('Microphone capture ended or permission blocked.');
      };
      recognition.onend = () => {
        setIsListening(false);
      };
      recognition.start();
    } catch {
      setIsListening(false);
      setSpeechNotice('Unable to initialize voice recognition.');
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;

    setIsEvaluating(true);
    try {
      const response = await fetch('/api/ai/interview-eval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: activeQuestion.question,
          userAnswer,
          expectedKeyPoints: activeQuestion.expectedKeyPoints,
          modelAnswer: activeQuestion.modelAnswer,
          mode: activeQuestion.mode,
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as InterviewEvaluationResult;
        setEvalResult(data);
        onRecordInterviewResult({
          id: `int-${Date.now()}`,
          mode: activeQuestion.mode,
          question: activeQuestion.question,
          score: data.overallScore,
          source: data.evaluationSource,
          date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      } else {
        const fallback = evaluateInterviewAnswerRubric(
          userAnswer,
          activeQuestion.expectedKeyPoints
        );
        setEvalResult(fallback);
        onRecordInterviewResult({
          id: `int-${Date.now()}`,
          mode: activeQuestion.mode,
          question: activeQuestion.question,
          score: fallback.overallScore,
          source: 'rubric_fallback',
          date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      }
    } catch {
      const fallback = evaluateInterviewAnswerRubric(
        userAnswer,
        activeQuestion.expectedKeyPoints
      );
      setEvalResult(fallback);
      onRecordInterviewResult({
        id: `int-${Date.now()}`,
        mode: activeQuestion.mode,
        question: activeQuestion.question,
        score: fallback.overallScore,
        source: 'rubric_fallback',
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIdx((prev) => prev + 1);
    setUserAnswer('');
    setEvalResult(null);
    setSpeechNotice(null);
  };

  const handleLoadSampleStrongAnswer = () => {
    setUserAnswer(
      'First, I will immediately exercise Stop Work Authority if there is imminent danger. Second, I will verify the Permit to Work, JSA, LOTO zero-energy isolation, and calibrated gas test readings (O2 19.5% to 23.5%, LEL 0%). Finally, I will apply the Hierarchy of Controls—prioritizing Engineering barriers like collective guardrails, shoring, and mechanical ventilation over PPE alone—and communicate clearly with the supervisor.'
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Mode Selector Header */}
      <div className="liquid-glass-elevated rounded-3xl p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Panel Interview Simulator · 6-Competency Rubric
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mt-0.5">
            AI &amp; Rubric Mock Interview Studio
          </h1>
        </div>

        <div className="flex items-center gap-1.5 p-1.5 rounded-full liquid-glass-recessed overflow-x-auto shrink-0">
          {(['All / Random', 'Beginner', 'Technical HSE', 'Situational', 'HR'] as const).map(
            (mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setSelectedMode(mode);
                  setCurrentQuestionIdx(0);
                  setEvalResult(null);
                }}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                  selectedMode === mode
                    ? 'glass-segment-active'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {mode}
              </button>
            )
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: Active Interviewer Prompt & Candidate Response Box */}
        <div className="lg:col-span-7 space-y-6">
          <div className="liquid-glass-elevated rounded-3xl p-6 space-y-5">
            <div className="flex items-center justify-between text-xs font-mono text-slate-300">
              <span>INTERVIEW MODE: {activeQuestion.mode}</span>
              <span>
                QUESTION {(currentQuestionIdx % filteredQuestions.length) + 1} OF{' '}
                {filteredQuestions.length}
              </span>
            </div>

            <div className="p-5 rounded-2xl liquid-glass-recessed space-y-2">
              <div className="text-xs font-mono text-slate-400">PANEL INTERVIEWER ASKS:</div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-white leading-snug">
                “{activeQuestion.question}”
              </h2>
            </div>

            <form onSubmit={handleSubmitAnswer} className="space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="interview-answer-box" className="text-xs font-medium text-slate-300">
                  Your Spoken / Written Response:
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleLoadSampleStrongAnswer}
                    className="text-xs text-slate-200 hover:text-white underline underline-offset-4"
                  >
                    Insert Structured Sample
                  </button>
                  <button
                    type="button"
                    onClick={handleVoiceToggle}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 ${
                      isListening
                        ? 'bg-rose-500/20 border border-rose-400/50 text-rose-200'
                        : 'glass-btn-secondary'
                    }`}
                  >
                    {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    <span>{isListening ? 'Stop Voice' : 'Voice Input'}</span>
                  </button>
                </div>
              </div>

              {speechNotice && (
                <p className="text-xs text-slate-300 font-mono">{speechNotice}</p>
              )}

              <textarea
                id="interview-answer-box"
                rows={5}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your response using professional HSE structure (Immediate Action → Technical Controls → Verification & Reporting)..."
                className="glass-input w-full p-4 rounded-2xl text-sm"
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="glass-btn-secondary px-4 py-2.5 rounded-xl text-xs font-medium flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Next Question</span>
                </button>

                <button
                  type="submit"
                  disabled={isEvaluating || !userAnswer.trim()}
                  className="glass-btn-primary px-6 py-3 rounded-xl disabled:opacity-50 font-bold text-xs sm:text-sm flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isEvaluating ? 'Evaluating Response...' : 'Evaluate My Answer'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Session History */}
          {interviewHistory.length > 0 && (
            <div className="liquid-glass rounded-3xl p-5 space-y-3">
              <div className="text-xs font-mono text-slate-300">
                RECENT MOCK INTERVIEW ATTEMPTS ({interviewHistory.length})
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {interviewHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl liquid-glass-recessed flex items-center justify-between gap-4 text-xs"
                  >
                    <div className="truncate">
                      <span className="text-white font-mono">[{item.mode}]</span>{' '}
                      <span className="text-slate-200">{item.question}</span>
                    </div>
                    <div className="font-mono font-bold text-emerald-300 shrink-0 tabular-nums">
                      {item.score}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right 5 Cols: 6-Competency Evaluation Report & Model Answer */}
        <div className="lg:col-span-5 liquid-glass rounded-3xl p-6 space-y-5">
          {evalResult ? (
            <>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <div className="text-xs font-mono text-slate-400">
                    EVALUATION SOURCE:{' '}
                    {evalResult.evaluationSource === 'ai_server'
                      ? 'SERVER-SIDE GEMINI AI PANEL'
                      : 'STRUCTURED RUBRIC FALLBACK ENGINE'}
                  </div>
                  <h3 className="font-display text-xl font-bold text-white mt-1">
                    Candidate Performance Report
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-display font-bold text-white tabular-nums">
                    {evalResult.overallScore}%
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">Overall Score</div>
                </div>
              </div>

              {/* 6 Competency Bars */}
              <div className="space-y-2.5">
                {[
                  { label: '1. Technical Accuracy', val: evalResult.competencies.technicalAccuracy },
                  { label: '2. Relevant Safety Knowledge', val: evalResult.competencies.relevantSafetyKnowledge },
                  { label: '3. Answer Completeness', val: evalResult.competencies.answerCompleteness },
                  { label: '4. Practical Decision-Making', val: evalResult.competencies.practicalDecisionMaking },
                  { label: '5. Communication Clarity', val: evalResult.competencies.communicationClarity },
                  { label: '6. Professional Structure', val: evalResult.competencies.professionalStructure },
                ].map((comp) => (
                  <div key={comp.label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">{comp.label}</span>
                      <span className="font-mono text-white tabular-nums">{comp.val}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full glass-progress-fill rounded-full"
                        style={{ width: `${comp.val}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Strengths & Missing Points */}
              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-xl liquid-glass-subtle border border-emerald-400/35 space-y-1">
                  <div className="text-xs font-mono text-emerald-300">STRENGTHS DEMONSTRATED</div>
                  <ul className="text-xs text-slate-200 space-y-1 list-disc pl-4">
                    {evalResult.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                {evalResult.missingPoints.length > 0 && (
                  <div className="p-3.5 rounded-xl liquid-glass-subtle border border-rose-400/35 space-y-1">
                    <div className="text-xs font-mono text-rose-300">MISSING TECHNICAL POINTS</div>
                    <ul className="text-xs text-slate-200 space-y-1 list-disc pl-4">
                      {evalResult.missingPoints.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="p-3.5 rounded-xl liquid-glass-recessed space-y-1.5">
                  <div className="text-xs font-mono text-slate-300">SUGGESTED PROFESSIONAL MODEL ANSWER</div>
                  <p className="text-xs text-slate-200 leading-relaxed">{activeQuestion.modelAnswer}</p>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigateToLesson(activeQuestion.relatedLessonId)}
                  className="glass-btn-secondary w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Revise Related Academy Lesson ({activeQuestion.relatedLessonId})</span>
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-4 py-6 text-center">
              <Sparkles className="w-8 h-8 text-slate-200 mx-auto" />
              <h3 className="font-display text-lg font-bold text-white">
                6-Point Panel Rubric Ready
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Submit your response on the left to receive a detailed evaluation across Technical Accuracy, Safety Knowledge, Answer Completeness, Practical Decision-Making, Communication Clarity, and Structure.
              </p>
              <div className="p-3.5 rounded-xl liquid-glass-recessed text-left text-xs text-slate-400 space-y-1">
                <div className="text-slate-200 font-semibold">Expected Criteria for Current Question:</div>
                {activeQuestion.expectedKeyPoints.map((pt, idx) => (
                  <div key={idx}>• {pt}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
