/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import {
  MODULES_DATA,
  LESSONS_DATA,
  INTERVIEW_QUESTIONS_BANK,
  GLOSSARY_DATA,
  ModuleItem,
  LessonItem,
  GlossaryItem,
} from './data/curriculumData';
import {
  OnboardingPreferences,
  computeReadinessBreakdown,
} from './utils/hseLogic';
import { DashboardView } from './components/DashboardView';
import { AcademyView } from './components/AcademyView';
import {
  PracticeLabsView,
  SavedRiskAssessmentRecord,
  SavedDocumentRecord,
} from './components/PracticeLabsView';
import { InterviewSimulatorView } from './components/InterviewSimulatorView';
import { ToolsAndCoachView } from './components/ToolsAndCoachView';
import { ProfileAdminView } from './components/ProfileAdminView';
import { OnboardingAuthModal } from './components/OnboardingAuthModal';
import {
  Home,
  BookOpen,
  FlaskConical,
  Wrench,
  User,
} from 'lucide-react';

type ActiveTab = 'home' | 'academy' | 'practice' | 'interview' | 'tools' | 'profile';

const STORAGE_KEY = 'hse_fieldready_state_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [targetLessonId, setTargetLessonId] = useState<string | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [backendStatus, setBackendStatus] = useState<{
    aiMode: string;
    dbMode: string;
  }>({
    aiMode: 'structured_rubric_fallback',
    dbMode: 'local_demo_persistence',
  });

  // User & Onboarding Preferences State
  const [user, setUser] = useState<{
    name: string;
    email: string;
    authMode: 'local_demo' | 'authenticated';
  }>({
    name: 'Guest HSE Candidate',
    email: 'demo@hsefieldready.local',
    authMode: 'local_demo',
  });

  const [prefs, setPrefs] = useState<OnboardingPreferences>({
    experienceLevel: 'Beginner',
    targetRole: 'HSE Officer',
    interviewGoal: 'Gulf & International EPC Industrial HSE Officer Approval',
    englishLevel: 'Intermediate',
    preferredLanguage: 'Roman Urdu',
    dailyMinutes: 30,
  });

  const [streakDays] = useState<number>(0);

  // Content State (Editable by Admin CMS)
  const [modules, setModules] = useState<ModuleItem[]>(MODULES_DATA);
  const [lessons, setLessons] = useState<LessonItem[]>(LESSONS_DATA);
  const [glossaryTerms, setGlossaryTerms] = useState<GlossaryItem[]>(GLOSSARY_DATA);

  // Real User Activity & Progress State
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [bookmarkedLessonIds, setBookmarkedLessonIds] = useState<string[]>([]);
  const [lessonNotes, setLessonNotes] = useState<Record<string, string>>({});
  const [quizScoresByLesson, setQuizScoresByLesson] = useState<Record<string, number>>({});
  const [hazardScoresByScenario, setHazardScoresByScenario] = useState<Record<string, number>>({});
  const [savedRiskAssessments, setSavedRiskAssessments] = useState<SavedRiskAssessmentRecord[]>([]);
  const [savedDocuments, setSavedDocuments] = useState<SavedDocumentRecord[]>([]);
  const [interviewHistory, setInterviewHistory] = useState<
    {
      id: string;
      mode: string;
      question: string;
      score: number;
      source: 'ai_server' | 'rubric_fallback';
      date: string;
    }[]
  >([]);
  const [bookmarkedTermIds, setBookmarkedTermIds] = useState<string[]>([]);
  const [completedDay30Ids, setCompletedDay30Ids] = useState<string[]>([]);

  // Load persisted state from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.user) setUser(parsed.user);
        if (parsed.prefs) setPrefs(parsed.prefs);
        if (parsed.completedLessonIds) setCompletedLessonIds(parsed.completedLessonIds);
        if (parsed.bookmarkedLessonIds) setBookmarkedLessonIds(parsed.bookmarkedLessonIds);
        if (parsed.lessonNotes) setLessonNotes(parsed.lessonNotes);
        if (parsed.quizScoresByLesson) setQuizScoresByLesson(parsed.quizScoresByLesson);
        if (parsed.hazardScoresByScenario) setHazardScoresByScenario(parsed.hazardScoresByScenario);
        if (parsed.savedRiskAssessments) setSavedRiskAssessments(parsed.savedRiskAssessments);
        if (parsed.savedDocuments) setSavedDocuments(parsed.savedDocuments);
        if (parsed.interviewHistory) setInterviewHistory(parsed.interviewHistory);
        if (parsed.bookmarkedTermIds) setBookmarkedTermIds(parsed.bookmarkedTermIds);
        if (parsed.completedDay30Ids) setCompletedDay30Ids(parsed.completedDay30Ids);
      }
    } catch {
      // Ignore corrupt localStorage
    }
  }, []);

  // Save state to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          user,
          prefs,
          completedLessonIds,
          bookmarkedLessonIds,
          lessonNotes,
          quizScoresByLesson,
          hazardScoresByScenario,
          savedRiskAssessments,
          savedDocuments,
          interviewHistory,
          bookmarkedTermIds,
          completedDay30Ids,
        })
      );
    } catch {
      // Ignore quota errors
    }
  }, [
    user,
    prefs,
    completedLessonIds,
    bookmarkedLessonIds,
    lessonNotes,
    quizScoresByLesson,
    hazardScoresByScenario,
    savedRiskAssessments,
    savedDocuments,
    interviewHistory,
    bookmarkedTermIds,
    completedDay30Ids,
  ]);

  // Restore the real Supabase session. Local demo state is never treated as a cloud login.
  useEffect(() => {
    if (!supabase) {
      setUser((current) => ({ ...current, authMode: 'local_demo' }));
      return;
    }

    let mounted = true;
    const applyUser = (authUser: { email?: string; user_metadata?: Record<string, unknown> } | null) => {
      if (!mounted) return;
      if (!authUser) {
        setUser((current) => ({ ...current, authMode: 'local_demo' }));
        return;
      }
      const displayName = authUser.user_metadata?.full_name;
      setUser({
        name: typeof displayName === 'string' && displayName.trim()
          ? displayName
          : authUser.email?.split('@')[0] || 'HSE Candidate',
        email: authUser.email || '',
        authMode: 'authenticated',
      });
    };

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        applyUser(null);
        return;
      }
      applyUser(data.session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
        setIsOnboardingOpen(true);
      }
      applyUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Monitor Online/Offline and check backend status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    fetch('/api/status')
      .then((r) => r.json())
      .then((d) => {
        if (d && d.status === 'ok') {
          setBackendStatus({ aiMode: d.aiMode, dbMode: d.dbMode });
        }
      })
      .catch(() => {
        // Offline or local fallback
      });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Compute Dynamic Readiness Score from actual user records
  const publishedLessonsCount = lessons.filter((l) => l.isPublished).length;
  const readiness = computeReadinessBreakdown({
    quizScores: Object.values(quizScoresByLesson),
    riskAssessmentsCompleted: savedRiskAssessments.length,
    hazardScenariosScores: Object.values(hazardScoresByScenario),
    interviewScores: interviewHistory.map((i) => i.score),
    documentsCompleted: savedDocuments.length,
    completedLessonsCount: completedLessonIds.length,
    totalLessonsCount: publishedLessonsCount,
  });

  const handleOpenLessonFromAnywhere = (lessonId: string) => {
    setTargetLessonId(lessonId);
    setActiveTab('academy');
  };

  return (
    <div className="relative min-h-screen industrial-environment-bg text-slate-100 flex flex-col pb-24 md:pb-12">
      {/* ARCHITECTURAL LIGHT & GEOMETRY REFRACTION BACKDROP (Visible through crystal-clear Liquid Glass) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
      >
        <svg
          className="w-full h-full opacity-55"
          viewBox="0 0 1440 900"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <radialGradient id="refractOrb1" cx="22%" cy="18%" r="42%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
              <stop offset="50%" stopColor="rgba(148,163,184,0.04)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
            <radialGradient id="refractOrb2" cx="82%" cy="28%" r="38%">
              <stop offset="0%" stopColor="rgba(226,232,240,0.1)" />
              <stop offset="55%" stopColor="rgba(100,116,139,0.03)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
            <linearGradient id="beamLine" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.14)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
          </defs>
          <rect width="1440" height="900" fill="url(#refractOrb1)" />
          <rect width="1440" height="900" fill="url(#refractOrb2)" />
          {/* Architectural Perspective Rings & Structural Lines */}
          <circle cx="1120" cy="240" r="220" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <circle cx="1120" cy="240" r="340" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="6 8" />
          <circle cx="1120" cy="240" r="460" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <circle cx="280" cy="680" r="280" stroke="rgba(255,255,255,0.045)" strokeWidth="1" />
          <circle cx="280" cy="680" r="420" stroke="rgba(255,255,255,0.025)" strokeWidth="1" strokeDasharray="4 8" />
          <line x1="-100" y1="120" x2="1540" y2="640" stroke="url(#beamLine)" strokeWidth="1" />
          <line x1="180" y1="-50" x2="1280" y2="950" stroke="url(#beamLine)" strokeWidth="0.75" />
          <line x1="980" y1="-50" x2="420" y2="950" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        </svg>
      </div>

      {/* TOP BAR CONTRACT: Strictly 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-30 liquid-glass border-b border-white/15 px-4 sm:px-8 py-3 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('home');
          }}
          className="font-display text-lg sm:text-xl font-bold tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2.5"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)]" />
          <span>HSE FieldReady</span>
        </a>

        {/* Zone 2: 5 concise single-line pill navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-1.5 p-1 rounded-full liquid-glass-recessed text-xs font-medium text-slate-300"
        >
          {[
            { id: 'home' as const, label: 'Home' },
            { id: 'academy' as const, label: 'Academy' },
            { id: 'practice' as const, label: 'Practice' },
            { id: 'interview' as const, label: 'Interview' },
            { id: 'tools' as const, label: 'Tools' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              data-testid={`nav-${item.id}`}
              onClick={() => {
                if (item.id !== 'academy') setTargetLessonId(null);
                setActiveTab(item.id);
              }}
              className={`px-4 py-1.5 rounded-full transition-all whitespace-nowrap shrink-0 ${
                activeTab === item.id
                  ? 'glass-segment-active font-semibold text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Primary Pill Action & Compact Language Pill */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsOnboardingOpen(true)}
            className="glass-btn-secondary hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-full whitespace-nowrap"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span>{prefs.preferredLanguage}</span>
          </button>
          <button
            type="button"
            data-testid="nav-profile"
            onClick={() => setActiveTab('profile')}
            className="glass-btn-primary px-4 py-2 text-xs font-semibold rounded-full whitespace-nowrap shrink-0"
          >
            Profile &amp; Admin
          </button>
        </div>
      </header>

      {/* MAIN VIEWPORT CONTAINER */}
      <main className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 flex-1">
        {activeTab === 'home' && (
          <DashboardView
            userName={user.name}
            prefs={prefs}
            streakDays={streakDays}
            readiness={readiness}
            lessons={lessons}
            completedLessonIds={completedLessonIds}
            quizScoresByLesson={quizScoresByLesson}
            onStartLesson={handleOpenLessonFromAnywhere}
            onNavigateTab={(t) => setActiveTab(t)}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
          />
        )}

        {activeTab === 'academy' && (
          <AcademyView
            modules={modules}
            lessons={lessons}
            completedLessonIds={completedLessonIds}
            bookmarkedLessonIds={bookmarkedLessonIds}
            lessonNotes={lessonNotes}
            quizScoresByLesson={quizScoresByLesson}
            preferredLanguage={prefs.preferredLanguage}
            initialLessonId={targetLessonId}
            onToggleLanguage={(lang) => setPrefs((p) => ({ ...p, preferredLanguage: lang }))}
            onCompleteLesson={(lid) => {
              setCompletedLessonIds((prev) => Array.from(new Set([...prev, lid])));
            }}
            onSaveQuizScore={(lid, score) => {
              setQuizScoresByLesson((prev) => ({
                ...prev,
                [lid]: Math.max(prev[lid] || 0, score),
              }));
            }}
            onToggleBookmark={(lid) => {
              setBookmarkedLessonIds((prev) =>
                prev.includes(lid) ? prev.filter((x) => x !== lid) : [...prev, lid]
              );
            }}
            onSaveNote={(lid, text) => {
              setLessonNotes((prev) => ({ ...prev, [lid]: text }));
            }}
          />
        )}

        {activeTab === 'practice' && (
          <PracticeLabsView
            savedRiskAssessments={savedRiskAssessments}
            savedDocuments={savedDocuments}
            onRecordHazardScore={(scenId, pct) => {
              setHazardScoresByScenario((prev) => ({
                ...prev,
                [scenId]: Math.max(prev[scenId] || 0, pct),
              }));
            }}
            onSaveRiskAssessment={(rec) => {
              setSavedRiskAssessments((prev) => [rec, ...prev]);
            }}
            onSaveDocument={(doc) => {
              setSavedDocuments((prev) => {
                const filtered = prev.filter((d) => d.templateId !== doc.templateId);
                return [doc, ...filtered];
              });
            }}
          />
        )}

        {activeTab === 'interview' && (
          <InterviewSimulatorView
            questionBank={INTERVIEW_QUESTIONS_BANK}
            interviewHistory={interviewHistory}
            onRecordInterviewResult={(entry) => {
              setInterviewHistory((prev) => [entry, ...prev]);
            }}
            onNavigateToLesson={handleOpenLessonFromAnywhere}
          />
        )}

        {activeTab === 'tools' && (
          <ToolsAndCoachView
            glossaryTerms={glossaryTerms}
            bookmarkedTermIds={bookmarkedTermIds}
            completedDay30Ids={completedDay30Ids}
            preferredLanguage={prefs.preferredLanguage}
            weakAreas={readiness.weakAreas}
            onToggleGlossaryBookmark={(tid) => {
              setBookmarkedTermIds((prev) =>
                prev.includes(tid) ? prev.filter((x) => x !== tid) : [...prev, tid]
              );
            }}
            onToggleDay30Task={(taskId) => {
              setCompletedDay30Ids((prev) =>
                prev.includes(taskId)
                  ? prev.filter((x) => x !== taskId)
                  : [...prev, taskId]
              );
            }}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileAdminView
            user={user}
            prefs={prefs}
            readiness={readiness}
            modules={modules}
            lessons={lessons}
            glossaryTerms={glossaryTerms}
            bookmarkedLessonIds={bookmarkedLessonIds}
            lessonNotes={lessonNotes}
            onOpenPreferencesModal={() => setIsOnboardingOpen(true)}
            onLogoutToDemo={() => {
              void supabase?.auth.signOut();
              setIsPasswordRecovery(false);
              setUser({
                name: 'Guest HSE Candidate',
                email: 'demo@hsefieldready.local',
                authMode: 'local_demo',
              });
              setIsOnboardingOpen(true);
            }}
            onTogglePublishModule={(mid) => {
              setModules((prev) =>
                prev.map((m) => (m.id === mid ? { ...m, isPublished: !m.isPublished } : m))
              );
            }}
            onTogglePublishLesson={(lid) => {
              setLessons((prev) =>
                prev.map((l) => (l.id === lid ? { ...l, isPublished: !l.isPublished } : l))
              );
            }}
            onAddGlossaryTerm={(newTerm) => {
              setGlossaryTerms((prev) => [newTerm, ...prev]);
            }}
            onNavigateToLesson={handleOpenLessonFromAnywhere}
          />
        )}
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR (5 Recommended Destinations: Home, Academy, Practice, Tools, Profile) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 liquid-glass-elevated border-t border-white/15 grid grid-cols-5 items-center h-16 px-1"
      >
        {[
          { id: 'home' as const, label: 'Home', icon: Home },
          { id: 'academy' as const, label: 'Academy', icon: BookOpen },
          { id: 'practice' as const, label: 'Practice', icon: FlaskConical },
          { id: 'tools' as const, label: 'Tools', icon: Wrench },
          { id: 'profile' as const, label: 'Profile', icon: User },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                if (tab.id !== 'academy') setTargetLessonId(null);
                setActiveTab(tab.id);
              }}
              className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center rounded-xl transition-colors ${
                isActive ? 'text-white font-semibold bg-white/10' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ONBOARDING & AUTHENTICATION MODAL */}
      <OnboardingAuthModal
        isOpen={isOnboardingOpen}
        initialPrefs={prefs}
        currentUser={user}
        passwordRecoveryMode={isPasswordRecovery}
        onSaveComplete={(updatedPrefs, updatedUser) => {
          setPrefs(updatedPrefs);
          setUser(updatedUser);
          setIsPasswordRecovery(false);
          setIsOnboardingOpen(false);
        }}
        onClose={() => setIsOnboardingOpen(false)}
      />
    </div>
  );
}
