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
  Play,
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

    const stepBtn = (step: 1 | 2 | 3 | 4 | 5, id: string, label: string) => (
      <button
        key={step}
        type="button"
        data-testid={`lesson-step-${id}`}
        onClick={() => setActiveStep(step)}
        className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
          activeStep === step ? 'glass-segment-active' : 'text-slate-300 hover:text-white'
        }`}
      >
        {label}
      </button>
    );

    return (
      <div className="space-y-4">
        {/* Top bar — back, title, done */}
        <div className="liquid-glass rounded-3xl p-4 space-y-3">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => setActiveLessonId(null)}
              className="glass-btn-secondary px-3.5 py-2 rounded-full text-xs font-medium flex items-center gap-1.5 shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className="min-w-0">
              <div className="text-[11px] font-mono text-slate-400">
                Phase {activeLesson.phaseNumber} · {activeLesson.estimatedMinutes} min
                {savedScore !== undefined ? ` · Quiz ${savedScore}%` : ''}
                {isCompleted ? ' · Done' : ''}
              </div>
              <h2 className="font-display text-base sm:text-lg font-bold text-white line-clamp-2">
                {activeLesson.title}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() =>
                onToggleLanguage(preferredLanguage === 'English' ? 'Roman Urdu' : 'English')
              }
              className="glass-btn-secondary px-3.5 py-2 rounded-full text-xs font-medium flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{preferredLanguage === 'Roman Urdu' ? 'EN + Roman Urdu' : 'English Only'}</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleBookmark(activeLesson.id)}
              aria-label={isBookmarked ? 'Remove Bookmark' : 'Bookmark Lesson'}
              className={`px-3.5 py-2 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                isBookmarked ? 'glass-segment-active' : 'glass-btn-secondary'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{isBookmarked ? 'Saved' : 'Bookmark'}</span>
            </button>

            <button
              type="button"
              onClick={() => onCompleteLesson(activeLesson.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                isCompleted
                  ? 'liquid-glass-subtle border border-emerald-400/40 text-emerald-300'
                  : 'glass-btn-primary'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isCompleted ? 'Completed' : 'Complete'}</span>
            </button>
          </div>
        </div>

        {/* Step pills — short labels */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-full liquid-glass-recessed overflow-x-auto">
          {stepBtn(1, 'understand', '1 · Learn')}
          {stepBtn(2, 'diagram', '2 · Visual')}
          {stepBtn(3, 'quiz', '3 · Quiz')}
          {stepBtn(4, 'challenge', '4 · Challenge')}
          {stepBtn(5, 'interview', '5 · Interview')}
        </div>

        {/* STEP 1: LEARN */}
        {activeStep === 1 && (
          <div className="liquid-glass rounded-3xl p-5 sm:p-6 space-y-5">
            <h3 className="font-display text-xl font-bold text-white">
              {activeLesson.understand.heading}
            </h3>

            <div className="space-y-4">
              {activeLesson.understand.englishExplanation.map((para, idx) => (
                <p key={idx} className="text-sm sm:text-base text-slate-200 leading-relaxed">
                  {para}
                </p>
              ))}
            </div>

            {preferredLanguage === 'Roman Urdu' && (
              <div className="liquid-glass-elevated rounded-2xl p-4 space-y-3">
                <div className="text-[11px] font-mono text-slate-300">ROMAN URDU</div>
                {activeLesson.understand.romanUrduExplanation.map((ruPara, idx) => (
                  <p key={idx} className="text-sm text-slate-100 leading-relaxed">
                    {ruPara}
                  </p>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeLesson.understand.keyTerms.map((kt) => (
                <div key={kt.term} className="liquid-glass-subtle p-4 rounded-2xl space-y-1">
                  <div className="font-display font-semibold text-sm text-white">{kt.term}</div>
                  <p className="text-xs text-slate-300 leading-relaxed">{kt.meaning}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl liquid-glass-subtle space-y-2">
                <div className="text-[11px] font-mono text-slate-300">SITE EXAMPLE</div>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {activeLesson.understand.practicalSiteExample}
                </p>
              </div>
              <div className="p-4 rounded-2xl liquid-glass-elevated space-y-2">
                <div className="text-[11px] font-mono text-slate-300">SAFETY NOTE</div>
                <p className="text-sm text-slate-100 leading-relaxed">
                  {activeLesson.understand.criticalSafetyNote}
                </p>
              </div>
            </div>

            {/* References — compact one-line rows */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <div className="text-[11px] font-mono text-slate-400">REFERENCES</div>
              {activeLesson.references.map((ref) => (
                <a
                  key={ref.id}
                  href={ref.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 p-3 rounded-xl liquid-glass-recessed text-xs"
                >
                  <span className="min-w-0">
                    <span className="block font-semibold text-white truncate">{ref.referenceTitle}</span>
                    <span className="block text-slate-400 truncate">{ref.sourceOrganization}</span>
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                </a>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="glass-btn-primary px-5 py-2.5 rounded-full font-semibold text-xs flex items-center gap-2"
              >
                <span>Next: Visual</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: VISUAL */}
        {activeStep === 2 && (
          <div className="liquid-glass rounded-3xl p-5 sm:p-6 space-y-5">
            <p className="text-sm text-slate-300">{activeLesson.visualCaption}</p>

            <LessonVisualDiagram type={activeLesson.visualDiagramType} />

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="glass-btn-secondary px-4 py-2 rounded-full text-xs"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className="glass-btn-primary px-5 py-2.5 rounded-full font-semibold text-xs flex items-center gap-2"
              >
                <span>Next: Quiz</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: QUIZ */}
        {activeStep === 3 && (
          <div className="liquid-glass rounded-3xl p-5 sm:p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-display text-lg font-bold text-white">
                Quiz · {activeLesson.quiz.length} questions
              </h3>
              {quizSubmitted && savedScore !== undefined && (
                <div className="px-4 py-2 rounded-full liquid-glass-elevated font-mono text-sm font-bold text-emerald-300">
                  Score: {savedScore}%
                </div>
              )}
            </div>

            <div className="space-y-4">
              {activeLesson.quiz.map((q, qIdx) => {
                const chosenIdx = selectedAnswers[q.id];
                return (
                  <div key={q.id} className="liquid-glass-subtle rounded-2xl p-4 space-y-3">
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
                                <span className="text-xs font-mono text-rose-300 shrink-0">✗ Wrong</span>
                              )}
                            </button>
                            {quizSubmitted && isSelected && !opt.isCorrect && opt.whyIncorrect && (
                              <p className="text-xs text-rose-300 pl-3">Why: {opt.whyIncorrect}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {quizSubmitted && (
                      <div className="p-3 rounded-xl liquid-glass-recessed border border-white/15 text-xs text-slate-200">
                        <strong className="text-white">Why:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              {!quizSubmitted ? (
                <button
                  type="button"
                  onClick={handleQuizSubmit}
                  className="glass-btn-primary px-6 py-3 rounded-full font-semibold text-xs sm:text-sm"
                >
                  Submit Quiz
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setQuizSubmitted(false);
                    setSelectedAnswers({});
                  }}
                  className="glass-btn-secondary px-4 py-2.5 rounded-full text-xs"
                >
                  Retake
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveStep(4)}
                className="glass-btn-primary px-5 py-2.5 rounded-full font-semibold text-xs flex items-center gap-2"
              >
                <span>Next: Challenge</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: CHALLENGE */}
        {activeStep === 4 && (
          <div className="liquid-glass rounded-3xl p-5 sm:p-6 space-y-5">
            <h3 className="font-display text-lg font-bold text-white">
              {activeLesson.practicalChallenge.scenarioTitle}
            </h3>

            <div className="p-4 rounded-2xl liquid-glass-elevated space-y-2">
              <p className="text-sm sm:text-base text-slate-100 leading-relaxed">
                {activeLesson.practicalChallenge.siteSituation}
              </p>
              <p className="text-sm font-semibold text-white pt-1">
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

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className="glass-btn-secondary px-4 py-2 rounded-full text-xs"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setActiveStep(5)}
                className="glass-btn-primary px-5 py-2.5 rounded-full font-semibold text-xs flex items-center gap-2"
              >
                <span>Next: Interview</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: INTERVIEW + NOTES */}
        {activeStep === 5 && (
          <div className="liquid-glass rounded-3xl p-5 sm:p-6 space-y-5">
            <h3 className="font-display text-lg font-bold text-white">Interview questions</h3>

            <div className="space-y-4">
              {activeLesson.interviewConnection.questions.map((iq, idx) => (
                <div key={idx} className="liquid-glass-elevated rounded-2xl p-4 space-y-3">
                  <h4 className="font-display text-base font-bold text-white">“{iq.question}”</h4>
                  <div className="p-4 rounded-xl liquid-glass-recessed border border-white/15 space-y-1">
                    <div className="text-[11px] font-mono text-emerald-300">MODEL ANSWER</div>
                    <p className="text-sm text-slate-200 leading-relaxed">{iq.modelAnswer}</p>
                  </div>
                  <div className="text-xs text-slate-300">
                    <strong className="text-white">Tip:</strong> {iq.romanUrduTip}
                  </div>
                </div>
              ))}
            </div>

            {/* Notes */}
            <div className="liquid-glass-subtle rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="lesson-note-input" className="text-[11px] font-mono text-slate-300">
                  YOUR NOTES
                </label>
                {noteSavedFeedback && (
                  <span className="text-xs text-emerald-300 font-mono">✓ Saved</span>
                )}
              </div>
              <textarea
                id="lesson-note-input"
                rows={3}
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder="Key numbers, limits, phrases to remember..."
                className="glass-input w-full p-3.5 rounded-xl text-sm"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    onSaveNote(activeLesson.id, noteDraft);
                    setNoteSavedFeedback(true);
                  }}
                  className="glass-btn-primary px-4 py-2 rounded-full font-semibold text-xs"
                >
                  Save Note
                </button>
              </div>
            </div>

            {/* Report an issue */}
            <form onSubmit={handleReportIssue} className="p-4 rounded-2xl liquid-glass-recessed space-y-2">
              <div className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5 text-slate-300" />
                <span>Report an issue in this lesson</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={issueText}
                  onChange={(e) => setIssueText(e.target.value)}
                  placeholder="Describe the issue..."
                  aria-label="Report lesson content issue"
                  className="glass-input flex-1 px-3 py-2 rounded-xl text-xs"
                />
                <button
                  type="submit"
                  className="glass-btn-secondary px-4 py-2 rounded-full text-xs whitespace-nowrap"
                >
                  Send
                </button>
              </div>
              {issueStatus && <p className="text-xs text-emerald-300">{issueStatus}</p>}
            </form>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setActiveStep(4)}
                className="glass-btn-secondary px-4 py-2 rounded-full text-xs"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => {
                  onCompleteLesson(activeLesson.id);
                  setActiveLessonId(null);
                }}
                className="glass-btn-primary px-6 py-3 rounded-full font-bold text-xs sm:text-sm flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Lesson</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ---------- Roadmap / lesson list ----------
  const visiblePhases =
    selectedPhase === 'all'
      ? LEARNING_PHASES
      : LEARNING_PHASES.filter((p) => p.phaseNumber === selectedPhase);

  const totalPublished = lessons.filter((l) => l.isPublished).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3 px-1">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Academy</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {completedLessonIds.length}/{totalPublished} lessons done
          </p>
        </div>

        {/* Phase filter pills */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-full liquid-glass-recessed overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setSelectedPhase('all')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
              selectedPhase === 'all' ? 'glass-segment-active' : 'text-slate-300 hover:text-white'
            }`}
          >
            All
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
              P{num}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {visiblePhases.map((phase) => {
          const phaseModules = modules.filter((m) => m.phaseNumber === phase.phaseNumber && m.isPublished);
          const phaseLessons = lessons.filter((l) => l.phaseNumber === phase.phaseNumber && l.isPublished);
          const completedInPhase = phaseLessons.filter((l) => completedLessonIds.includes(l.id)).length;
          const phasePct =
            phaseLessons.length > 0 ? Math.round((completedInPhase / phaseLessons.length) * 100) : 0;

          return (
            <section key={phase.phaseNumber} className="liquid-glass rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-display text-base sm:text-lg font-bold text-white truncate">
                    {phase.title}
                  </h2>
                  <p className="text-xs text-slate-400 truncate">{phase.subtitle}</p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="font-mono text-xs text-slate-300">
                    {completedInPhase}/{phaseLessons.length}
                  </span>
                  <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full glass-progress-fill"
                      style={{ width: `${Math.max(4, phasePct)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {phaseModules.map((mod) => {
                  const modLessons = phaseLessons.filter((l) => l.moduleId === mod.id);
                  const modDone = modLessons.filter((l) => completedLessonIds.includes(l.id)).length;
                  return (
                    <div key={mod.id} className="space-y-2">
                      <div className="flex items-center justify-between gap-2 px-1">
                        <h3 className="font-display text-sm font-semibold text-white truncate">
                          {mod.title}
                        </h3>
                        <span className="text-[11px] font-mono text-slate-400 shrink-0">
                          {modDone}/{modLessons.length}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {modLessons.map((les) => {
                          const done = completedLessonIds.includes(les.id);
                          const qScore = quizScoresByLesson[les.id];
                          return (
                            <button
                              key={les.id}
                              type="button"
                              data-testid={`lesson-card-${les.id}`}
                              onClick={() => openLesson(les)}
                              className="w-full flex items-center gap-3 p-3.5 rounded-2xl liquid-glass-subtle hover:border-white/25 transition-all text-left"
                            >
                              {done ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                              ) : (
                                <Play className="w-5 h-5 text-slate-400 shrink-0" />
                              )}
                              <span className="flex-1 min-w-0">
                                <span className="block font-display font-semibold text-sm text-white line-clamp-2">
                                  {les.title}
                                </span>
                                <span className="block text-[11px] font-mono text-slate-400 mt-0.5">
                                  {les.estimatedMinutes} min
                                  {qScore !== undefined ? ` · Quiz ${qScore}%` : ''}
                                  {done ? ' · Done' : ''}
                                </span>
                              </span>
                              <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                            </button>
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
