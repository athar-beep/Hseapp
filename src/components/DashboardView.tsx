import React from 'react';
import {
  Play,
  ShieldCheck,
  Award,
  Flame,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Layers,
  Compass,
  Activity,
  FileCheck2,
  Mic,
  BookOpen,
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

  const nextRecommendedLesson =
    publishedLessons.find(
      (l) => l.phaseNumber >= plan.recommendedStartingPhase && !completedLessonIds.includes(l.id)
    ) ||
    publishedLessons.find((l) => !completedLessonIds.includes(l.id)) ||
    publishedLessons[0];

  const currentPhaseObj =
    LEARNING_PHASES.find((p) => p.phaseNumber === nextRecommendedLesson?.phaseNumber) ||
    LEARNING_PHASES[0];

  const earnedBadges = [
    {
      id: 'badge-foundation',
      title: 'Foundation Verified',
      unlocked: completedLessonIds.includes('les-101'),
    },
    {
      id: 'badge-hierarchy',
      title: 'Hierarchy Specialist',
      unlocked: completedLessonIds.includes('les-102'),
    },
    {
      id: 'badge-ptw',
      title: 'PTW & Risk Ready',
      unlocked: readiness.riskAssessment >= 70,
    },
    {
      id: 'badge-interview',
      title: 'Panel Confident',
      unlocked: readiness.interviewCommunication >= 75,
    },
  ];

  // SVG Gauge Geometry
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference -
    (Math.min(100, Math.max(0, readiness.overallReadinessScore)) / 100) * circumference;

  const competencyPillars = [
    {
      label: 'Technical HSE',
      value: readiness.technicalKnowledge,
      icon: ShieldCheck,
      target: 'academy' as const,
    },
    {
      label: 'Risk Matrix',
      value: readiness.riskAssessment,
      icon: AlertTriangle,
      target: 'practice' as const,
    },
    {
      label: 'Field Skills',
      value: readiness.practicalSkills,
      icon: Compass,
      target: 'practice' as const,
    },
    {
      label: 'Panel Interview',
      value: readiness.interviewCommunication,
      icon: Mic,
      target: 'interview' as const,
    },
    {
      label: 'Documentation',
      value: readiness.documentation,
      icon: FileCheck2,
      target: 'practice' as const,
    },
    {
      label: 'Curriculum',
      value: readiness.overallCompletion,
      icon: BookOpen,
      target: 'academy' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* =====================================================================
          PROPER VISUAL HERO COMMAND DECK (Crystal-Clear Liquid Glass)
          Left: High-impact typography, compact mission capsule, pill CTAs
          Right: Optical SVG Readiness Ring + Interactive Isometric Site Schematic
          ===================================================================== */}
      <section className="relative overflow-hidden liquid-glass-elevated rounded-3xl p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Subtle internal architectural vector refraction inside hero */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 w-full h-full opacity-40"
          viewBox="0 0 1200 500"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          <circle cx="980" cy="250" r="240" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <circle
            cx="980"
            cy="250"
            r="175"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
            strokeDasharray="4 6"
          />
          <path
            d="M0 420 L480 420 L620 280 L1200 280"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
          <path
            d="M680 0 L680 500"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="1"
            strokeDasharray="3 6"
          />
        </svg>

        {/* Left 7 Cols: Executive Command Header & Pill CTAs */}
        <div className="relative z-10 lg:col-span-7 min-w-0 flex flex-col justify-between space-y-6">
          {/* Status Capsule Row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full liquid-glass-subtle text-[11px] font-mono uppercase tracking-wider text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
              {prefs.targetRole} Track
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full liquid-glass-recessed text-[11px] font-mono text-slate-300">
              <Flame className="w-3.5 h-3.5 text-slate-200" />
              {streakDays}d Streak
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full liquid-glass-recessed text-[11px] font-mono text-slate-300">
              {prefs.dailyMinutes}m / day · {prefs.preferredLanguage}
            </span>
          </div>

          {/* Main Hero Headline */}
          <div className="space-y-2.5">
            <p className="text-xs sm:text-sm font-medium text-slate-300 tracking-wide">
              Welcome back, <span className="text-white font-semibold">{userName}</span>
            </p>
            <h1 className="font-display text-3xl sm:text-5xl font-bold text-white tracking-tight leading-[1.1]">
              Master Field Safety.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
                Command the Panel.
              </span>
            </h1>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              Interactive permit-to-work simulations, 5×5 risk matrix verification, and structured Gulf &amp; EPC HSE Officer interview readiness.
            </p>
          </div>

          {/* Compact Active Mission Capsule (No bulky text blocks) */}
          <div className="p-4 rounded-2xl liquid-glass-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                <Layers className="w-3.5 h-3.5 text-slate-200 shrink-0" />
                <span>Active Mission · {currentPhaseObj.title}</span>
              </div>
              <div className="font-display font-semibold text-sm sm:text-base text-white truncate">
                {nextRecommendedLesson.title}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <div className="text-xs font-mono font-bold text-white">
                  {completedLessonIds.length}/{publishedLessons.length} Lessons
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  {readiness.overallCompletion}% Complete
                </div>
              </div>
              <div className="w-16 h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full glass-progress-fill"
                  style={{ width: `${Math.max(8, readiness.overallCompletion)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Pill-Shaped CTA Button Bar */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => onStartLesson(nextRecommendedLesson.id)}
              className="glass-btn-primary w-full sm:w-auto px-6 py-3.5 rounded-full font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 text-center whitespace-nowrap"
            >
              <Play className="w-4 h-4 fill-current shrink-0" />
              <span>Continue: {nextRecommendedLesson.title.split(':')[0]}</span>
            </button>

            <div className="grid grid-cols-3 sm:flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => onNavigateTab('practice')}
                className="glass-btn-secondary px-3.5 sm:px-5 py-3 rounded-full text-xs font-medium text-center whitespace-nowrap"
              >
                Hazard Labs
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('interview')}
                className="glass-btn-secondary px-3.5 sm:px-5 py-3 rounded-full text-xs font-medium text-center whitespace-nowrap"
              >
                Interview
              </button>

              <button
                type="button"
                onClick={onOpenOnboarding}
                className="glass-btn-secondary px-3.5 sm:px-5 py-3 rounded-full text-xs font-medium text-center whitespace-nowrap"
              >
                Study Plan
              </button>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Visual Telemetry Showcase (Optical SVG Gauge + Interactive Site Blueprint) */}
        <div className="relative z-10 lg:col-span-5 flex flex-col gap-4">
          {/* Card 1: Circular Optical Readiness Gauge & Key Metrics */}
          <div className="p-5 rounded-3xl liquid-glass flex items-center justify-between gap-5">
            {/* Circular SVG Gauge */}
            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="8"
                  fill="rgba(255,255,255,0.01)"
                />
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  stroke="url(#silverGaugeGrad)"
                  strokeWidth="8"
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
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-mono text-2xl font-bold text-white tabular-nums">
                  {readiness.overallReadinessScore}%
                </span>
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400">
                  Readiness
                </span>
              </div>
            </div>

            {/* Right Telemetry Breakdown */}
            <div className="flex-1 min-w-0 space-y-3">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Officer Standing
                </div>
                <div className="font-display text-lg font-bold text-white truncate">
                  {readiness.readinessBand}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="px-3 py-2 rounded-2xl liquid-glass-recessed">
                  <div className="text-[10px] font-mono text-slate-400">Interview</div>
                  <div className="font-mono text-sm font-bold text-white tabular-nums">
                    {readiness.interviewCommunication}%
                  </div>
                </div>
                <div className="px-3 py-2 rounded-2xl liquid-glass-recessed">
                  <div className="text-[10px] font-mono text-slate-400">Tech HSE</div>
                  <div className="font-mono text-sm font-bold text-white tabular-nums">
                    {readiness.technicalKnowledge}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Interactive Industrial Field Twin Schematic */}
          <div className="p-4 rounded-3xl liquid-glass space-y-3">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
              <span className="flex items-center gap-1.5 font-semibold text-white">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                LIVE FIELD SIMULATION DECK
              </span>
              <span className="text-slate-400">ISO 45001 · OSHA</span>
            </div>

            {/* Interactive SVG Industrial Site Twin */}
            <div className="relative rounded-2xl liquid-glass-recessed p-3 overflow-hidden">
              <svg viewBox="0 0 420 125" className="w-full h-auto">
                {/* Isometric Grid Lines */}
                <line x1="0" y1="105" x2="420" y2="105" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
                <line x1="40" y1="20" x2="40" y2="105" stroke="rgba(255,255,255,0.18)" strokeWidth="2" />
                <line x1="150" y1="20" x2="150" y2="105" stroke="rgba(255,255,255,0.18)" strokeWidth="2" />
                <line x1="35" y1="42" x2="155" y2="42" stroke="rgba(255,255,255,0.28)" strokeWidth="2.5" />
                <line
                  x1="40"
                  y1="34"
                  x2="150"
                  y2="34"
                  stroke="rgba(251,191,36,0.75)"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />

                {/* Zone B: Confined Space Vessel */}
                <rect
                  x="195"
                  y="32"
                  width="70"
                  height="73"
                  rx="12"
                  fill="rgba(255,255,255,0.03)"
                  stroke="rgba(255,255,255,0.24)"
                  strokeWidth="1.5"
                />
                <text x="230" y="65" textAnchor="middle" fill="#e2e8f0" fontSize="8" fontFamily="monospace">
                  VESSEL V-102
                </text>
                <text x="230" y="78" textAnchor="middle" fill="#6ee7b7" fontSize="8" fontFamily="monospace">
                  O₂ 20.9% LEL 0%
                </text>

                {/* Zone C: 5x5 Risk Matrix Mini Grid */}
                <g transform="translate(305, 28)">
                  <rect
                    width="85"
                    height="68"
                    rx="8"
                    fill="rgba(255,255,255,0.03)"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="1"
                  />
                  <circle cx="24" cy="24" r="4" fill="#34d399" />
                  <circle cx="44" cy="34" r="4" fill="#fbbf24" />
                  <circle cx="64" cy="46" r="5" fill="#fb7185" />
                  <text x="42" y="16" textAnchor="middle" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                    5×5 RISK LAB
                  </text>
                </g>

                {/* Status Callout Pills inside SVG */}
                <circle cx="95" cy="42" r="5" fill="#fbbf24" />
                <text x="95" y="24" textAnchor="middle" fill="#fde68a" fontSize="8" fontFamily="monospace">
                  8m WORK AT HEIGHT
                </text>
              </svg>

              {/* Quick Launch Pill Chips */}
              <div className="mt-2 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => onNavigateTab('practice')}
                  className="glass-btn-secondary py-1.5 px-2.5 rounded-full text-[10px] font-mono text-center whitespace-nowrap"
                >
                  Pipe Rack Lab
                </button>
                <button
                  type="button"
                  onClick={() => onStartLesson('les-202')}
                  className="glass-btn-secondary py-1.5 px-2.5 rounded-full text-[10px] font-mono text-center whitespace-nowrap"
                >
                  Confined Space
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateTab('practice')}
                  className="glass-btn-secondary py-1.5 px-2.5 rounded-full text-[10px] font-mono text-center whitespace-nowrap"
                >
                  5×5 Risk Matrix
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          6-PILLAR COMPETENCY TELEMETRY (Clean, Scannable Visual Grid)
          ===================================================================== */}
      <section className="liquid-glass rounded-3xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              6-Pillar Telemetry
            </span>
            <span className="text-slate-600">·</span>
            <h2 className="font-display text-base sm:text-lg font-bold text-white">
              Competency Breakdown
            </h2>
          </div>
          <span className="px-3 py-1 rounded-full liquid-glass-recessed text-[11px] font-mono text-slate-300">
            Target: {prefs.interviewGoal}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {competencyPillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <button
                key={pillar.label}
                type="button"
                onClick={() => onNavigateTab(pillar.target)}
                className="text-left p-4 rounded-2xl liquid-glass-subtle hover:border-white/30 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className="w-4 h-4 text-slate-300 group-hover:text-white transition-colors" />
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      pillar.value >= 70
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/25'
                        : 'bg-white/5 text-slate-400 border border-white/10'
                    }`}
                  >
                    {pillar.value >= 70 ? 'Ready' : 'Focus'}
                  </span>
                </div>
                <div className="text-xs text-slate-300 font-medium truncate">{pillar.label}</div>
                <div className="font-mono text-xl font-bold text-white tabular-nums mt-0.5">
                  {pillar.value}%
                </div>
                <div className="mt-2.5 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full glass-progress-fill"
                    style={{ width: `${Math.max(6, pillar.value)}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* =====================================================================
          2-COLUMN COMPACT ROADMAP & PRIORITY FOCUS
          ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Up Next Module + 5-Phase Progress Track */}
        <section className="lg:col-span-7 liquid-glass rounded-3xl p-6 flex flex-col justify-between space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full liquid-glass-recessed text-[10px] font-mono uppercase tracking-wider text-slate-300">
                  Up Next · Phase {nextRecommendedLesson.phaseNumber}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {nextRecommendedLesson.estimatedMinutes} mins · 5 Steps
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-white truncate">
                {nextRecommendedLesson.title}
              </h3>
            </div>

            <button
              type="button"
              onClick={() => onStartLesson(nextRecommendedLesson.id)}
              className="glass-btn-primary px-5 py-2.5 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0"
            >
              <span>Launch Lesson</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Compact 5-Phase Journey Bars */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>5-PHASE CURRICULUM PROGRESS</span>
              <button
                type="button"
                onClick={() => onNavigateTab('academy')}
                className="text-white hover:underline"
              >
                Open Full Academy →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
              {LEARNING_PHASES.map((phase) => {
                const phaseLessons = publishedLessons.filter(
                  (l) => l.phaseNumber === phase.phaseNumber
                );
                const doneCount = phaseLessons.filter((l) =>
                  completedLessonIds.includes(l.id)
                ).length;
                const pct =
                  phaseLessons.length > 0
                    ? Math.round((doneCount / phaseLessons.length) * 100)
                    : 0;

                return (
                  <button
                    key={phase.phaseNumber}
                    type="button"
                    onClick={() => onNavigateTab('academy')}
                    className="p-3 rounded-2xl liquid-glass-subtle hover:border-white/30 transition-all text-left space-y-2"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>PHASE {phase.phaseNumber}</span>
                      <span className="text-white font-semibold">
                        {doneCount}/{phaseLessons.length}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-white truncate">
                      {phase.title.replace(/^Phase \d+ — /, '')}
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full glass-progress-fill"
                        style={{ width: `${Math.max(6, pct)}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Right 5 Cols: Priority Action Items & Earned Credentials */}
        <section className="lg:col-span-5 liquid-glass rounded-3xl p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Actionable Focus Areas ({ Object.keys(quizScoresByLesson).length } Quizzes Logged)
              </span>
              <Sparkles className="w-4 h-4 text-slate-300" />
            </div>

            <div className="space-y-2">
              {readiness.weakAreas.slice(0, 2).map((area, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl liquid-glass-subtle flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />
                    <span className="text-xs text-slate-200 truncate">{area}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('practice')}
                    className="glass-btn-secondary px-3.5 py-1 rounded-full text-[11px] font-medium shrink-0"
                  >
                    Practice
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Compact Earned Credentials & Recent Score Pills */}
          <div className="pt-4 border-t border-white/10 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>VERIFIED MILESTONE BADGES</span>
              <span className="text-white">
                {earnedBadges.filter((b) => b.unlocked).length}/{earnedBadges.length}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
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
          </div>
        </section>
      </div>
    </div>
  );
};
