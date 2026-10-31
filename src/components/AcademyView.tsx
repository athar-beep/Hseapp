import React, { useState } from 'react';
import {
  LEARNING_PHASES,
  ModuleItem,
  LessonItem,
} from '../data/curriculumData';
import { LessonVisualDiagram } from './VisualDiagrams';
import { supabase } from '../lib/supabase';
import {
  CheckCircle2,
  Bookmark,
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  Globe,
  Flag,
} from 'lucide-react';

interface AcademyViewProps {
  modules: ModuleItem[];
  lessons: LessonItem[];
  completedLessonIds: string[];
  bookmarkedLessonIds: string[];
  lessonNotes: Record<string, string>;
  quizScoresByLesson: Record<string, number>;
  preferredLanguage: 'English' | 'Roman Urdu';
  initialLessonId?: string | null;
  onToggleLanguage: (lang: 'English' | 'Roman Urdu') => void;
  onCompleteLesson: (lessonId: string) => void;
  onSaveQuizScore: (lessonId: string, scorePercent: number) => void;
  onToggleBookmark: (lessonId: string) => void;
  onSaveNote: (lessonId: string, noteText: string) => void;
}

export const AcademyView: React.FC<AcademyViewProps> = ({
  modules,
  lessons,
  completedLessonIds,
  bookmarkedLessonIds,
  lessonNotes,
  quizScoresByLesson,
  preferredLanguage,
  initialLessonId,
  onToggleLanguage,
  onCompleteLesson,
  onSaveQuizScore,
  onToggleBookmark,
  onSaveNote,
}) => {
  const [selectedPhase, setSelectedPhase] = useState<number | 'all'>('all');
  const [activeLessonId, setActiveLessonId] = useState<string | null>(initialLessonId || null);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Quiz state for current lesson
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Practical challenge state
  const [selectedChallengeOption, setSelectedChallengeOption] = useState<string | null>(null);

  // Note draft state
  const [noteDraft, setNoteDraft] = useState('');
  const [noteSavedFeedback, setNoteSavedFeedback] = useState(false);

  // Issue reporting state
  const [issueText, setIssueText] = useState('');
  const [issueStatus, setIssueStatus] = useState<string | null>(null);

  const activeLesson = lessons.find((l) => l.id === activeLessonId) || null;

  const openLesson = (lesson: LessonItem) => {
    setActiveLessonId(lesson.id);
    setActiveStep(1);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setSelectedChallengeOption(null);
    setNoteDraft(lessonNotes[lesson.id] || '');
    setNoteSavedFeedback(false);
    setIssueStatus(null);
  };

  if (activeLesson) {
    const isCompleted = completedLessonIds.includes(activeLesson.id);
    const isBookmarked = bookmarkedLessonIds.includes(activeLesson.id);
    const savedScore = quizScoresByLesson[activeLesson.id];

    const handleQuizSubmit = () => {
      let correct = 0;
      activeLesson.quiz.forEach((q) => {
        const chosenIdx = selectedAnswers[q.id];
        if (chosenIdx !== undefined && q.options[chosenIdx]?.isCorrect) {
          correct += 1;
        }
      });
      const pct = Math.round((correct / activeLesson.quiz.length) * 100);
      setQuizSubmitted(true);
      onSaveQuizScore(activeLesson.id, pct);
    };

    const handleReportIssue = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!issueText.trim()) return;
      const payload = {
        lesson_id: activeLesson.id,
        issue_text: issueText.trim(),
        reporter: 'Authenticated Learner',
      };
      try {
        if (!supabase) throw new Error('Supabase is not configured.');
        const { error } = await supabase.from('content_issue_reports').insert(payload);
        if (error) throw error;
        setIssueStatus('Content review notice submitted to HSE Curriculum Admin.');
        setIssueText('');
      } catch {
        try {
          const key = 'fieldready_pending_issue_reports';
          const pending = JSON.parse(localStorage.getItem(key) || '[]') as unknown[];
          pending.push({ ...payload, savedAt: new Date().toISOString() });
          localStorage.setItem(key, JSON.stringify(pending));
        } catch {
          // Local storage unavailable; nothing more can be done offline.
        }
        setIssueStatus('Saved locally for next admin sync.');
      }
    };

    return (
      <div className="space-y-6">
        {/* Top Lesson Bar */}
        <div className="liquid-glass rounded-3xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveLessonId(null)}
              className="glass-btn-secondary px-4 py-2 rounded-full text-xs font-medium flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Roadmap</span>
            </button>
            <div>
              <div className="text-xs font-mono text-slate-400">
                Phase {activeLesson.phaseNumber} · {activeLesson.estimatedMinutes}m
                {savedScore !== undefined ? ` · Quiz ${savedScore}%` : ''}
              </div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-white">{activeLesson.title}</h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Bilingual Language Toggle */}
            <button
              type="button"
              onClick={() =>
                onToggleLanguage(preferredLanguage === 'English' ? 'Roman Urdu' : 'English')
              }
              className="glass-btn-secondary px-3.5 py-2 rounded-full text-xs font-medium flex items-center gap-1.5 whitespace-nowrap"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{preferredLanguage === 'Roman Urdu' ? 'EN + Roman Urdu' : 'English Only'}</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleBookmark(activeLesson.id)}
              aria-label={isBookmarked ? 'Remove Bookmark' : 'Bookmark Lesson'}
              className={`px-3.5 py-2 rounded-full text-xs font-medium flex items-center gap-1.5 whitespace-nowrap ${
                isBookmarked ? 'glass-segment-active' : 'glass-btn-secondary'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{isBookmarked ? 'Saved' : 'Bookmark'}</span>
            </button>

            <button
              type="button"
              onClick={() => onCompleteLesson(activeLesson.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap ${
                isCompleted
                  ? 'liquid-glass-subtle border border-emerald-400/40 text-emerald-300'
                  : 'glass-btn-primary'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isCompleted ? 'Completed' : 'Complete Lesson'}</span>
            </button>
          </div>
        </div>

        {/* 5-Step Interactive Lesson Stepper (Pill Track) */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-full liquid-glass-recessed overflow-x-auto">
          {[
            { step: 1 as const, id: 'understand', label: '1. Understand' },
            { step: 2 as const, id: 'diagram', label: '2. Visual Schematic' },
            { step: 3 as const, id: 'quiz', label: '3. Knowledge Check' },
            { step: 4 as const, id: 'challenge', label: '4. Site Challenge' },
            { step: 5 as const, id: 'interview', label: '5. Interview & Notes' },
          ].map((item) => (
            <button
              key={item.step}
              type="button"
              data-testid={`lesson-step-${item.id}`}
              onClick={() => setActiveStep(item.step)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                activeStep === item.step
                  ? 'glass-segment-active'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* STEP 1: UNDERSTAND */}
        {activeStep === 1 && (
          <div className="liquid-glass rounded-3xl p-6 md:p-8 space-y-6">
            <div>
              <p className="text-xs font-mono text-slate-400">STEP 1 OF 5 · CONCEPTUAL &amp; TECHNICAL MASTERY</p>
              <h3 className="font-display text-2xl font-bold text-white mt-1">
                {activeLesson.understand.heading}
              </h3>
            </div>

            <div className="space-y-4">
              {activeLesson.understand.englishExplanation.map((para, idx) => (
                <p key={idx} className="text-sm sm:text-base text-slate-200 leading-relaxed">
                  {para}
                </p>
              ))}
            </div>

            {preferredLanguage === 'Roman Urdu' && (
              <div className="liquid-glass-elevated rounded-2xl p-5 space-y-3">
                <div className="text-xs font-mono text-slate-300">
                  ROMAN URDU EXPLANATION (BILINGUAL CLARITY FOR BEGINNERS)
                </div>
                {activeLesson.understand.romanUrduExplanation.map((ruPara, idx) => (
                  <p key={idx} className="text-sm text-slate-100 leading-relaxed">
                    {ruPara}
                  </p>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeLesson.understand.keyTerms.map((kt) => (
                <div key={kt.term} className="liquid-glass-subtle p-4 rounded-2xl space-y-1">
                  <div className="font-display font-semibold text-sm text-white">{kt.term}</div>
                  <p className="text-xs text-slate-300 leading-relaxed">{kt.meaning}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
              <div className="p-5 rounded-2xl liquid-glass-subtle space-y-2">
                <div className="text-xs font-mono text-slate-300">PRACTICAL INDUSTRIAL SITE EXAMPLE</div>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {activeLesson.understand.practicalSiteExample}
                </p>
              </div>
              <div className="p-5 rounded-2xl liquid-glass-elevated space-y-2">
                <div className="text-xs font-mono text-slate-300">JURISDICTION &amp; SAFETY GOVERNANCE NOTE</div>
                <p className="text-sm text-slate-100 leading-relaxed">
                  {activeLesson.understand.criticalSafetyNote}
                </p>
              </div>
            </div>

            {/* Verified References Block */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <div className="text-xs font-mono text-slate-400">
                VERIFIED INTERNATIONAL REGULATORY &amp; TECHNICAL REFERENCES
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeLesson.references.map((ref) => (
                  <div key={ref.id} className="p-3.5 rounded-xl liquid-glass-recessed space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-300 font-mono">
                      <span>{ref.sourceOrganization} · {ref.classification}</span>
                      <span>Reviewed: {ref.lastReviewedDate}</span>
                    </div>
                    <div className="text-sm font-semibold text-white">{ref.referenceTitle}</div>
                    <p className="text-xs text-slate-400">{ref.jurisdictionNote}</p>
                    <a
                      href={ref.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-slate-200 hover:text-white underline underline-offset-4 pt-1"
                    >
                      <span>Official Source ({ref.publicationDate})</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="glass-btn-primary px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2"
              >
                <span>Continue to Step 2: Visual Learning</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: VISUAL LEARNING */}
        {activeStep === 2 && (
          <div className="liquid-glass rounded-3xl p-6 md:p-8 space-y-6">
            <div>
              <p className="text-xs font-mono text-slate-400">STEP 2 OF 5 · INTERACTIVE VISUAL SCHEMATIC</p>
              <h3 className="font-display text-xl font-bold text-white mt-1">
                Technical Field Architecture &amp; Control Diagram
              </h3>
              <p className="text-sm text-slate-300 mt-1">{activeLesson.visualCaption}</p>
            </div>

            <LessonVisualDiagram type={activeLesson.visualDiagramType} />

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="glass-btn-secondary px-4 py-2 rounded-xl text-xs"
              >
                ← Previous Step
              </button>
              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className="glass-btn-primary px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2"
              >
                <span>Proceed to Step 3: Knowledge Check Quiz</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: KNOWLEDGE CHECK QUIZ */}
        {activeStep === 3 && (
          <div className="liquid-glass rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-mono text-slate-400">
                  STEP 3 OF 5 · KNOWLEDGE CHECK ({activeLesson.quiz.length} QUESTIONS)
                </p>
                <h3 className="font-display text-xl font-bold text-white mt-1">
                  Verify Your Technical Understanding
                </h3>
              </div>
              {quizSubmitted && savedScore !== undefined && (
                <div className="px-4 py-2 rounded-xl liquid-glass-elevated font-mono text-sm font-bold text-emerald-300">
                  Saved Quiz Score: {savedScore}%
                </div>
              )}
            </div>

            <div className="space-y-6">
              {activeLesson.quiz.map((q, qIdx) => {
                const chosenIdx = selectedAnswers[q.id];
                return (
                  <div key={q.id} className="liquid-glass-subtle rounded-2xl p-5 space-y-3">
                    <div className="font-display font-semibold text-sm sm:text-base text-white">
                      {qIdx + 1}. {q.question}
                    </div>
                    <div className="space-y-2">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = chosenIdx === oIdx;
                        let optionStyle = 'liquid-glass-recessed text-slate-200 hover:border-white/25';
                        if (quizSubmitted) {
                          if (opt.isCorrect) {
                            optionStyle = 'bg-emerald-500/15 border-emerald-400/50 text-emerald-100';
                          } else if (isSelected && !opt.isCorrect) {
                            optionStyle = 'bg-rose-500/15 border-rose-400/50 text-rose-100';
                          }
                        } else if (isSelected) {
                          optionStyle = 'glass-segment-active text-white';
                        }

                        return (
                          <div key={oIdx} className="space-y-1">
                            <button
                              type="button"
                              onClick={() => {
                                if (!quizSubmitted) {
                                  setSelectedAnswers((prev) => ({ ...prev, [q.id]: oIdx }));
                                }
                              }}
                              className={`w-full text-left px-4 py-3 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between gap-3 ${optionStyle}`}
                            >
                              <span>{opt.text}</span>
                              {quizSubmitted && opt.isCorrect && (
                                <span className="text-xs font-mono text-emerald-300 shrink-0">✓ Correct</span>
                              )}
                              {quizSubmitted && isSelected && !opt.isCorrect && (
                                <span className="text-xs font-mono text-rose-300 shrink-0">✗ Incorrect</span>
                              )}
                            </button>
                            {quizSubmitted && isSelected && !opt.isCorrect && opt.whyIncorrect && (
                              <p className="text-xs text-rose-300 pl-3">
                                Why incorrect: {opt.whyIncorrect}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {quizSubmitted && (
                      <div className="p-3 rounded-xl liquid-glass-recessed border border-white/15 text-xs text-slate-200">
                        <strong className="text-white">Technical Explanation:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              {!quizSubmitted ? (
                <button
                  type="button"
                  onClick={handleQuizSubmit}
                  className="glass-btn-primary px-6 py-3 rounded-xl font-semibold text-xs sm:text-sm"
                >
                  Submit Answers &amp; Save Quiz Score
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setQuizSubmitted(false);
                    setSelectedAnswers({});
                  }}
                  className="glass-btn-secondary px-4 py-2.5 rounded-xl text-xs"
                >
                  Retake Quiz
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveStep(4)}
                className="glass-btn-primary px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2"
              >
                <span>Continue to Step 4: Practical Challenge</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: PRACTICAL SITE CHALLENGE */}
        {activeStep === 4 && (
          <div className="liquid-glass rounded-3xl p-6 md:p-8 space-y-6">
            <div>
              <p className="text-xs font-mono text-slate-400">STEP 4 OF 5 · PRACTICAL INDUSTRIAL CHALLENGE</p>
              <h3 className="font-display text-xl font-bold text-white mt-1">
                {activeLesson.practicalChallenge.scenarioTitle}
              </h3>
            </div>

            <div className="p-5 rounded-2xl liquid-glass-elevated space-y-2">
              <div className="text-xs font-mono text-slate-300">FIELD SITUATION BRIEFING</div>
              <p className="text-sm sm:text-base text-slate-100 leading-relaxed">
                {activeLesson.practicalChallenge.siteSituation}
              </p>
              <p className="text-sm font-semibold text-white pt-2">
                {activeLesson.practicalChallenge.promptQuestion}
              </p>
            </div>

            <div className="space-y-3">
              {activeLesson.practicalChallenge.options.map((opt) => {
                const isSelected = selectedChallengeOption === opt.id;
                return (
                  <div key={opt.id} className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setSelectedChallengeOption(opt.id)}
                      className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm transition-all ${
                        isSelected
                          ? opt.isOptimal
                            ? 'bg-emerald-500/15 border-emerald-400/50 text-white'
                            : 'bg-rose-500/15 border-rose-400/50 text-white'
                          : 'liquid-glass-subtle hover:border-white/25 text-slate-200'
                      }`}
                    >
                      {opt.actionText}
                    </button>
                    {isSelected && (
                      <div
                        className={`p-3.5 rounded-xl text-xs ${
                          opt.isOptimal
                            ? 'liquid-glass-subtle border border-emerald-400/40 text-emerald-200'
                            : 'liquid-glass-subtle border border-rose-400/40 text-rose-200'
                        }`}
                      >
                        {opt.feedback}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className="glass-btn-secondary px-4 py-2 rounded-xl text-xs"
              >
                ← Back to Quiz
              </button>
              <button
                type="button"
                onClick={() => setActiveStep(5)}
                className="glass-btn-primary px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2"
              >
                <span>Step 5: Interview Connection &amp; Notes</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: INTERVIEW CONNECTION, NOTES & COMPLETION */}
        {activeStep === 5 && (
          <div className="liquid-glass rounded-3xl p-6 md:p-8 space-y-6">
            <div>
              <p className="text-xs font-mono text-slate-400">STEP 5 OF 5 · INTERVIEW CONNECTION &amp; FIELD NOTES</p>
              <h3 className="font-display text-xl font-bold text-white mt-1">
                How Interview Panels Test This Topic
              </h3>
            </div>

            <div className="space-y-4">
              {activeLesson.interviewConnection.questions.map((iq, idx) => (
                <div key={idx} className="liquid-glass-elevated rounded-2xl p-5 space-y-3">
                  <div className="text-xs font-mono text-slate-400">PANEL INTERVIEW QUESTION #{idx + 1}</div>
                  <h4 className="font-display text-base font-bold text-white">“{iq.question}”</h4>
                  <div className="p-4 rounded-xl liquid-glass-recessed border border-white/15 space-y-1">
                    <div className="text-xs font-mono text-emerald-300">MODEL PROFESSIONAL ENGLISH ANSWER</div>
                    <p className="text-sm text-slate-200 leading-relaxed">{iq.modelAnswer}</p>
                  </div>
                  <div className="text-xs text-slate-300">
                    <strong className="text-white">Bilingual Coaching Tip (Roman Urdu):</strong> {iq.romanUrduTip}
                  </div>
                </div>
              ))}
            </div>

            {/* Personal Lesson Notes Persistence */}
            <div className="liquid-glass-subtle rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="lesson-note-input" className="text-xs font-mono text-slate-300">
                  YOUR PERSONAL REVISION NOTES (SAVED FOR OFFLINE &amp; CLOUD SYNC)
                </label>
                {noteSavedFeedback && (
                  <span className="text-xs text-emerald-300 font-mono">✓ Note Saved</span>
                )}
              </div>
              <textarea
                id="lesson-note-input"
                rows={3}
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder="Write key numbers, gas limits, or interview phrases you want to remember from this lesson..."
                className="glass-input w-full p-3.5 rounded-xl text-sm"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    onSaveNote(activeLesson.id, noteDraft);
                    setNoteSavedFeedback(true);
                  }}
                  className="glass-btn-primary px-4 py-2 rounded-xl font-semibold text-xs"
                >
                  Save Lesson Note
                </button>
              </div>
            </div>

            {/* Content Issue Report Form */}
            <form onSubmit={handleReportIssue} className="p-4 rounded-2xl liquid-glass-recessed space-y-2">
              <div className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5 text-slate-300" />
                <span>Spot a regulatory update or want to flag a content question for Admin Review?</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={issueText}
                  onChange={(e) => setIssueText(e.target.value)}
                  placeholder="Describe content suggestion or jurisdiction update..."
                  aria-label="Report lesson content issue"
                  className="glass-input flex-1 px-3 py-2 rounded-xl text-xs"
                />
                <button
                  type="submit"
                  className="glass-btn-secondary px-4 py-2 rounded-xl text-xs whitespace-nowrap"
                >
                  Submit for Review
                </button>
              </div>
              {issueStatus && <p className="text-xs text-emerald-300">{issueStatus}</p>}
            </form>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={() => setActiveStep(4)}
                className="glass-btn-secondary px-4 py-2 rounded-xl text-xs"
              >
                ← Previous Step
              </button>
              <button
                type="button"
                onClick={() => {
                  onCompleteLesson(activeLesson.id);
                  setActiveLessonId(null);
                }}
                className="glass-btn-primary px-6 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Lesson &amp; Return to Academy</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Roadmap View (5 Phases + Modules + Lessons — Decluttered & Crystal-Clear)
  const visiblePhases =
    selectedPhase === 'all'
      ? LEARNING_PHASES
      : LEARNING_PHASES.filter((p) => p.phaseNumber === selectedPhase);

  return (
    <div className="space-y-6">
      <div className="liquid-glass-elevated rounded-3xl p-6 md:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">
            5-Phase Structured Curriculum · ILO / OSHA / ISO 45001
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
            HSE Officer Learning Journey
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            5-step interactive modules with visual schematics, bilingual Roman Urdu support, and verified regulatory citations.
          </p>
        </div>

        {/* Pill Phase Filter Bar */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-full liquid-glass-recessed overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setSelectedPhase('all')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
              selectedPhase === 'all' ? 'glass-segment-active' : 'text-slate-300 hover:text-white'
            }`}
          >
            All Phases
          </button>
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setSelectedPhase(num)}
              className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                selectedPhase === num ? 'glass-segment-active' : 'text-slate-300 hover:text-white'
              }`}
            >
              Phase {num}
            </button>
          ))}
        </div>
      </div>

      {/* Phases & Modules List (Clean, Scannable Visual Hierarchy) */}
      <div className="space-y-6">
        {visiblePhases.map((phase) => {
          const phaseModules = modules.filter((m) => m.phaseNumber === phase.phaseNumber && m.isPublished);
          const phaseLessons = lessons.filter((l) => l.phaseNumber === phase.phaseNumber && l.isPublished);
          const completedInPhase = phaseLessons.filter((l) => completedLessonIds.includes(l.id)).length;
          const phasePct =
            phaseLessons.length > 0 ? Math.round((completedInPhase / phaseLessons.length) * 100) : 0;

          return (
            <section key={phase.phaseNumber} className="liquid-glass rounded-3xl p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <h2 className="font-display text-lg sm:text-xl font-bold text-white">{phase.title}</h2>
                  <p className="text-xs text-slate-300 mt-0.5">{phase.subtitle}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-slate-300">
                    {completedInPhase}/{phaseLessons.length} Completed
                  </span>
                  <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full glass-progress-fill"
                      style={{ width: `${Math.max(8, phasePct)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {phaseModules.map((mod) => {
                  const modLessons = phaseLessons.filter((l) => l.moduleId === mod.id);
                  return (
                    <div key={mod.id} className="liquid-glass-subtle rounded-2xl p-5 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-display text-base font-semibold text-white">{mod.title}</h3>
                        <span className="px-3 py-1 rounded-full liquid-glass-recessed text-[11px] text-slate-300 font-mono">
                          {mod.milestoneTitle}
                        </span>
                      </div>

                      {/* Compact Topic Pills */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {mod.topicsCovered.map((t) => (
                          <span
                            key={t}
                            className="px-2.5 py-0.5 rounded-full bg-white/[0.03] border border-white/10 text-[11px] text-slate-300"
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      {/* Lessons inside module */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        {modLessons.map((les) => {
                          const done = completedLessonIds.includes(les.id);
                          const qScore = quizScoresByLesson[les.id];
                          return (
                            <div
                              key={les.id}
                              data-testid={`lesson-card-${les.id}`}
                              onClick={() => openLesson(les)}
                              className="cursor-pointer p-4 rounded-2xl liquid-glass-recessed hover:border-white/25 transition-all flex flex-col justify-between gap-3"
                            >
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                                  <span>{les.estimatedMinutes}m · 5 Steps</span>
                                  <span
                                    className={`px-2 py-0.5 rounded-full ${
                                      done
                                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/25'
                                        : 'bg-white/5 text-slate-300 border border-white/10'
                                    }`}
                                  >
                                    {done ? '✓ Completed' : 'Ready'}
                                    {qScore !== undefined ? ` · ${qScore}%` : ''}
                                  </span>
                                </div>
                                <h4 className="font-display font-semibold text-sm text-white">{les.title}</h4>
                              </div>
                              <div className="flex items-center justify-between pt-1">
                                <span className="text-[11px] font-mono text-slate-400">
                                  {les.references.length} Verified Ref{les.references.length > 1 ? 's' : ''}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openLesson(les);
                                  }}
                                  className="glass-btn-primary px-4 py-1.5 rounded-full font-semibold text-xs flex items-center gap-1 whitespace-nowrap"
                                >
                                  <span>{done ? 'Review' : 'Start Lesson'}</span>
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
