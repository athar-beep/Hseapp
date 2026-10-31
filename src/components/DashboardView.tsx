import React from 'react';
import {
  Play,
  Flame,
  CheckCircle2,
  Award,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import {
  ReadinessBreakdown,
  OnboardingPreferences,
  generatePersonalizedPlan,
} from '../utils/hseLogic';
import { LessonItem, LEARNING_PHASES } from '../data/curriculumData';

interface DashboardViewProps {
  userName: string;
  prefs: OnboardingPreferences;
  streakDays: number;
  readiness: ReadinessBreakdown;
  lessons: LessonItem[];
  completedLessonIds: string[];
  quizScoresByLesson: Record<string, number>;
  onStartLesson: (lessonId: string) => void;
  onNavigateTab: (tab: 'academy' | 'practice' | 'interview' | 'tools' | 'profile') => void;
  onOpenOnboarding: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userName,
  prefs,
  streakDays,
  readiness,
  lessons,
  completedLessonIds,
  quizScoresByLesson,
  onStartLesson,
  onNavigateTab,
  onOpenOnboarding,
}) => {
  const plan = generatePersonalizedPlan(prefs);
  const publishedLessons = lessons.filter((l) => l.isPublished);

  const nextLesson =
    publishedLessons.find(
      (l) => l.phaseNumber >= plan.recommendedStartingPhase && !completedLessonIds.includes(l.id)
    ) ||
    publishedLessons.find((l) => !completedLessonIds.includes(l.id)) ||
    publishedLessons[0];

  const earnedBadges = [
    { id: 'badge-foundation', title: 'Foundation Verified', unlocked: completedLessonIds.includes('les-101') },
    { id: 'badge-hierarchy', title: 'Hierarchy Specialist', unlocked: completedLessonIds.includes('les-102') },
    { id: 'badge-ptw', title: 'PTW & Risk Ready', unlocked: readiness.riskAssessment >= 70 },
    { id: 'badge-interview', title: 'Panel Confident', unlocked: readiness.interviewCommunication >= 75 },
  ];

  // Readiness ring geometry
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference -
    (Math.min(100, Math.max(0, readiness.overallReadinessScore)) / 100) * circumference;

  const miniStats = [
    { label: 'Technical', value: readiness.technicalKnowledge, target: 'academy' as const },
    { label: 'Risk', value: readiness.riskAssessment, target: 'practice' as const },
    { label: 'Interview', value: readiness.interviewCommunication, target: 'interview' as const },
    { label: 'Documents', value: readiness.documentation, target: 'practice' as const },
  ];

  return (
    <div className="space-y-4">
      {/* Greeting — one line */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <p className="text-sm text-slate-300">
          Welcome back, <span className="text-white font-semibold">{userName}</span>
        </p>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full liquid-glass-recessed text-[11px] font-mono text-slate-300">
          <Flame className="w-3.5 h-3.5" />
          {streakDays}d streak · {prefs.dailyMinutes}m/day
        </span>
      </div>

      <h1 className="font-display text-2xl font-bold text-white px-1">Master Field Safety.</h1>

      {/* Readiness — one compact card */}
      <section className="liquid-glass rounded-3xl p-5">
        <div className="flex items-center gap-5">
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth="9" fill="none" />
              <circle
                cx="60"
                cy="60"
                r={radius}
                stroke="url(#silverGaugeGrad)"
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                fill="none"
              />
              <defs>
                <linearGradient id="silverGaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#94a3b8" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-xl font-bold text-white tabular-nums">
                {readiness.overallReadinessScore}%
              </span>
              <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400">Ready</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Your standing</div>
            <div className="font-display text-lg font-bold text-white truncate">{readiness.readinessBand}</div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {miniStats.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => onNavigateTab(s.target)}
                  className="px-3 py-2 rounded-2xl liquid-glass-recessed text-left"
                >
                  <div className="text-[10px] font-mono text-slate-400">{s.label}</div>
                  <div className="font-mono text-sm font-bold text-white tabular-nums">{s.value}%</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Continue — one job: start the next lesson */}
      {nextLesson && (
        <section className="liquid-glass rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>
              CONTINUE · PHASE {nextLesson.phaseNumber} · {nextLesson.estimatedMinutes} MIN
            </span>
            <span className="text-slate-300">
              {completedLessonIds.length}/{publishedLessons.length} done
            </span>
          </div>
          <h2 className="font-display text-base sm:text-lg font-bold text-white line-clamp-2">
            {nextLesson.title}
          </h2>
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full glass-progress-fill"
              style={{ width: `${Math.max(4, readiness.overallCompletion)}%` }}
            />
          </div>
          <button
            type="button"
            onClick={() => onStartLesson(nextLesson.id)}
            className="glass-btn-primary w-full py-3.5 rounded-full font-semibold text-sm flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-current shrink-0" />
            <span>Start Lesson</span>
          </button>
        </section>
      )}

      {/* Quick actions — 3 short pills */}
      <div className="grid grid-cols-3 gap-2.5">
        <button
          type="button"
          onClick={() => onNavigateTab('practice')}
          className="glass-btn-secondary py-3 px-2 rounded-full text-xs font-medium text-center"
        >
          Hazard Labs
        </button>
        <button
          type="button"
          onClick={() => onNavigateTab('interview')}
          className="glass-btn-secondary py-3 px-2 rounded-full text-xs font-medium text-center"
        >
          Interview
        </button>
        <button
          type="button"
          onClick={onOpenOnboarding}
          className="glass-btn-secondary py-3 px-2 rounded-full text-xs font-medium text-center"
        >
          Study Plan
        </button>
      </div>

      {/* Phases — compact rows */}
      <section className="liquid-glass rounded-3xl p-5 space-y-2">
        <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 pb-1">
          Your phases
        </div>
        {LEARNING_PHASES.map((phase) => {
          const phaseLessons = publishedLessons.filter((l) => l.phaseNumber === phase.phaseNumber);
          const doneCount = phaseLessons.filter((l) => completedLessonIds.includes(l.id)).length;
          const pct = phaseLessons.length > 0 ? Math.round((doneCount / phaseLessons.length) * 100) : 0;
          return (
            <button
              key={phase.phaseNumber}
              type="button"
              onClick={() => onNavigateTab('academy')}
              className="w-full flex items-center gap-3 p-3 rounded-2xl liquid-glass-subtle text-left"
            >
              <span className="text-[10px] font-mono text-slate-400 shrink-0">P{phase.phaseNumber}</span>
              <span className="flex-1 min-w-0">
                <span className="block text-xs font-semibold text-white truncate">
                  {phase.title.replace(/^Phase \d+ — /, '')}
                </span>
                <span className="block h-1.5 mt-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <span
                    className="block h-full rounded-full glass-progress-fill"
                    style={{ width: `${Math.max(4, pct)}%` }}
                  />
                </span>
              </span>
              <span className="text-[11px] font-mono text-slate-300 shrink-0">
                {doneCount}/{phaseLessons.length}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
            </button>
          );
        })}
      </section>

      {/* Focus areas — max 2, only when they exist */}
      {readiness.weakAreas.length > 0 && (
        <section className="liquid-glass rounded-3xl p-5 space-y-2">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 pb-1">
            Focus now
          </div>
          {readiness.weakAreas.slice(0, 2).map((area, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl liquid-glass-subtle flex items-center justify-between gap-3"
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />
                <span className="text-xs text-slate-200 truncate">{area}</span>
              </span>
              <button
                type="button"
                onClick={() => onNavigateTab('practice')}
                className="glass-btn-secondary px-3.5 py-1 rounded-full text-[11px] font-medium shrink-0"
              >
                Practice
              </button>
            </div>
          ))}
        </section>
      )}

      {/* Badges — one quiet row */}
      <div className="flex flex-wrap items-center gap-2 px-1">
        <span className="text-[11px] font-mono text-slate-500">
          Badges {earnedBadges.filter((b) => b.unlocked).length}/{earnedBadges.length}
        </span>
        {earnedBadges.map((b) => (
          <span
            key={b.id}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border ${
              b.unlocked
                ? 'liquid-glass-subtle border-white/25 text-white font-medium'
                : 'border-white/10 text-slate-500 opacity-60'
            }`}
          >
            {b.unlocked ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <Award className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            )}
            <span>{b.title}</span>
          </span>
        ))}
      </div>

      {/* Quiz count — quiet footnote, keeps the data visible without a section */}
      {Object.keys(quizScoresByLesson).length > 0 && (
        <p className="text-[11px] font-mono text-slate-500 px-1">
          {Object.keys(quizScoresByLesson).length} quizzes logged
        </p>
      )}
    </div>
  );
};
