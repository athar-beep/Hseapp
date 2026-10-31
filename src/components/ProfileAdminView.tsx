import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  OnboardingPreferences,
  ReadinessBreakdown,
} from '../utils/hseLogic';
import {
  ModuleItem,
  LessonItem,
  GlossaryItem,
} from '../data/curriculumData';
import {
  User,
  Shield,
  Lock,
  FileText,
  PlusCircle,
  Eye,
  EyeOff,
  LogOut,
  Sliders,
} from 'lucide-react';

interface ProfileAdminViewProps {
  user: {
    name: string;
    email: string;
    authMode: 'local_demo' | 'authenticated';
  };
  prefs: OnboardingPreferences;
  readiness: ReadinessBreakdown;
  modules: ModuleItem[];
  lessons: LessonItem[];
  glossaryTerms: GlossaryItem[];
  bookmarkedLessonIds: string[];
  lessonNotes: Record<string, string>;
  onOpenPreferencesModal: () => void;
  onLogoutToDemo: () => void;
  onTogglePublishModule: (moduleId: string) => void;
  onTogglePublishLesson: (lessonId: string) => void;
  onAddGlossaryTerm: (newTerm: GlossaryItem) => void;
  onNavigateToLesson: (lessonId: string) => void;
}

export const ProfileAdminView: React.FC<ProfileAdminViewProps> = ({
  user,
  prefs,
  readiness,
  modules,
  lessons,
  glossaryTerms,
  bookmarkedLessonIds,
  lessonNotes,
  onOpenPreferencesModal,
  onLogoutToDemo,
  onTogglePublishLesson,
  onAddGlossaryTerm,
  onNavigateToLesson,
}) => {
  const [sectionTab, setSectionTab] = useState<'profile' | 'report' | 'admin'>('profile');

  // Server-side Admin verification state
  const [isAdminVerified, setIsAdminVerified] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [reportedIssues, setReportedIssues] = useState<
    { id: string; lessonId: string; reporter: string; issueText: string; status: string; createdAt: string }[]
  >([]);

  // Admin add glossary term state
  const [newTermTitle, setNewTermTitle] = useState('');
  const [newTermDef, setNewTermDef] = useState('');
  const [newTermRu, setNewTermRu] = useState('');
  const [newTermEx, setNewTermEx] = useState('');
  const [adminMsg, setAdminMsg] = useState<string | null>(null);

  const handleVerifyAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    setIsAdminVerified(false);
    if (!supabase) {
      setAdminError('Supabase is not configured. Admin verification is unavailable in local demo mode.');
      return;
    }
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        setAdminError('Sign in with your registered account before requesting admin access.');
        return;
      }
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id);
      if (rolesError) {
        setAdminError('Unable to verify administrator access.');
        return;
      }
      const authorized = (roles || []).some((r) => r.role === 'admin');
      if (!authorized) {
        setAdminError('Your account is not authorized as an administrator.');
        return;
      }
      setIsAdminVerified(true);
      const { data: issues } = await supabase
        .from('content_issue_reports')
        .select('id, lesson_id, reporter, issue_text, status, created_at')
        .order('created_at', { ascending: false });
      setReportedIssues(
        (issues || []).map((row) => ({
          id: row.id,
          lessonId: row.lesson_id || 'General',
          reporter: row.reporter || 'Authenticated Learner',
          issueText: row.issue_text,
          status: row.status,
          createdAt: (row.created_at || '').split('T')[0],
        }))
      );
    } catch (error) {
      setAdminError(error instanceof Error ? error.message : 'Unable to verify administrator access.');
    }
  };

  const handleCreateGlossary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTermTitle.trim() || !newTermDef.trim()) return;
    const item: GlossaryItem = {
      id: `gl-custom-${Date.now()}`,
      term: newTermTitle.trim(),
      category: 'Site Operations',
      simpleDefinition: newTermDef.trim(),
      romanUrduExplanation: newTermRu.trim() || 'Admin added technical term.',
      industrialExample: newTermEx.trim() || 'Verified during site inspection.',
      relatedConcepts: ['HSE Governance', 'Site Compliance'],
    };
    onAddGlossaryTerm(item);
    setNewTermTitle('');
    setNewTermDef('');
    setNewTermRu('');
    setNewTermEx('');
    setAdminMsg(`Published glossary entry "${item.term}".`);
  };

  return (
    <div className="space-y-6">
      {/* Header & Section Tabs */}
      <div className="liquid-glass-elevated rounded-3xl p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">
            Learner Dossier · Readiness Report · Admin CMS
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5">
            {user.name} — HSE Career Dossier
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            {user.email} · {user.authMode === 'authenticated' ? 'Authenticated Session' : 'Local Persistence Mode'}
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1.5 rounded-full liquid-glass-recessed overflow-x-auto shrink-0">
          {[
            { id: 'profile' as const, label: 'Profile & Notes', icon: User },
            { id: 'report' as const, label: 'Readiness Report', icon: FileText },
            { id: 'admin' as const, label: 'Admin CMS', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSectionTab(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
                  sectionTab === tab.id
                    ? 'glass-segment-active'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===================================================================
          TAB 1: USER PROFILE, PREFERENCES & SAVED NOTES
         =================================================================== */}
      {sectionTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 liquid-glass rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900/10 pb-3">
              <h2 className="font-display text-lg font-bold text-slate-900">
                Personalized Learning Settings
              </h2>
              <button
                type="button"
                onClick={onOpenPreferencesModal}
                className="glass-btn-primary px-3 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-1.5"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Edit Plan</span>
              </button>
            </div>

            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between py-2 border-b border-slate-900/5">
                <span className="text-slate-500">Target Role:</span>
                <span className="text-slate-900 font-medium">{prefs.targetRole}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-900/5">
                <span className="text-slate-500">Experience Level:</span>
                <span className="text-slate-900 font-medium">{prefs.experienceLevel}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-900/5">
                <span className="text-slate-500">Preferred Language:</span>
                <span className="text-slate-900 font-medium">{prefs.preferredLanguage}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-900/5">
                <span className="text-slate-500">English Communication:</span>
                <span className="text-slate-900 font-medium">{prefs.englishLevel}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-900/5">
                <span className="text-slate-500">Daily Learning Target:</span>
                <span className="text-slate-900 font-mono">{prefs.dailyMinutes} mins/day</span>
              </div>
              <div className="py-2">
                <span className="text-slate-500 block mb-1">Interview Goal:</span>
                <span className="text-slate-900">{prefs.interviewGoal}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                type="button"
                onClick={onLogoutToDemo}
                className="glass-btn-secondary px-4 py-2 rounded-xl text-xs flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Switch Account / Reset Session</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="liquid-glass rounded-3xl p-6 space-y-4">
              <h2 className="font-display text-lg font-bold text-slate-900">
                Bookmarked Lessons ({bookmarkedLessonIds.length})
              </h2>
              {bookmarkedLessonIds.length === 0 ? (
                <p className="text-xs text-slate-500">
                  No lessons bookmarked yet. Click “Bookmark” inside any Academy lesson to save it here for quick pre-interview revision.
                </p>
              ) : (
                <div className="space-y-2">
                  {bookmarkedLessonIds.map((lid) => {
                    const les = lessons.find((l) => l.id === lid);
                    if (!les) return null;
                    return (
                      <div
                        key={lid}
                        className="p-3.5 rounded-2xl liquid-glass-recessed flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="text-xs font-mono text-slate-500">Phase {les.phaseNumber}</div>
                          <div className="text-sm font-semibold text-slate-900">{les.title}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onNavigateToLesson(les.id)}
                          className="glass-btn-primary px-3 py-1.5 rounded-xl font-semibold text-xs"
                        >
                          Open Lesson
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="liquid-glass rounded-3xl p-6 space-y-4">
              <h2 className="font-display text-lg font-bold text-slate-900">
                Saved Personal Lesson Notes ({Object.keys(lessonNotes).length})
              </h2>
              {Object.keys(lessonNotes).length === 0 ? (
                <p className="text-xs text-slate-500">
                  Your saved study notes from Step 5 of each lesson will appear here and remain available offline.
                </p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(lessonNotes).map(([lid, text]) => {
                    const les = lessons.find((l) => l.id === lid);
                    return (
                      <div key={lid} className="p-4 rounded-2xl liquid-glass-recessed space-y-1">
                        <div className="text-xs font-mono text-slate-600">
                          {les ? les.title : lid}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700">{text}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          TAB 2: FINAL ASSESSMENT & READINESS PERFORMANCE REPORT
         =================================================================== */}
      {sectionTab === 'report' && (
        <div className="liquid-glass rounded-3xl p-6 md:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-900/10 pb-4">
            <div>
              <div className="text-xs font-mono text-slate-500">
                EDUCATIONAL READINESS INDICATOR · NOT A STATUTORY LICENSE
              </div>
              <h2 className="font-display text-2xl font-bold text-slate-900 mt-1">
                Comprehensive HSE Officer Readiness Report
              </h2>
            </div>
            <div className="text-right">
              <div className="text-3xl font-display font-bold text-slate-900 tabular-nums">
                {readiness.overallReadinessScore}%
              </div>
              <div className="text-xs font-mono text-emerald-600">{readiness.readinessBand}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Technical Knowledge (Quizzes)', score: readiness.technicalKnowledge },
              { title: '5x5 Risk Assessment Mastery', score: readiness.riskAssessment },
              { title: 'Practical Hazard ID Skills', score: readiness.practicalSkills },
              { title: 'Interview Communication', score: readiness.interviewCommunication },
              { title: 'Safety Documentation (PTW/JSA)', score: readiness.documentation },
              { title: 'Curriculum Completion', score: readiness.overallCompletion },
            ].map((dim) => (
              <div key={dim.title} className="p-4 rounded-2xl liquid-glass-subtle space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">{dim.title}</span>
                  <span className="font-mono font-bold text-slate-900 tabular-nums">{dim.score}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900/10 overflow-hidden">
                  <div
                    className="h-full glass-progress-fill rounded-full"
                    style={{ width: `${dim.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-5 rounded-2xl liquid-glass-recessed space-y-2">
            <div className="text-xs font-mono text-slate-600">PRIORITY AREAS FOR REVISION</div>
            {readiness.weakAreas.length === 0 ? (
              <p className="text-sm text-emerald-600">
                All 6 competency indicators meet target thresholds. You are well-prepared for technical and situational HSE Officer interviews!
              </p>
            ) : (
              <ul className="text-xs sm:text-sm text-slate-700 list-disc pl-5 space-y-1">
                {readiness.weakAreas.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================
          TAB 3: SERVER-VERIFIED ADMIN CMS DASHBOARD
         =================================================================== */}
      {sectionTab === 'admin' && (
        <div className="liquid-glass rounded-3xl p-6 md:p-8 space-y-6">
          {!isAdminVerified ? (
            <form onSubmit={handleVerifyAdmin} className="max-w-md mx-auto space-y-4 py-6">
              <div className="flex items-center gap-2 text-slate-600 font-mono text-xs">
                <Lock className="w-4 h-4" />
                <span>SERVER-SIDE AUTHORIZATION REQUIRED</span>
              </div>
              <h2 className="font-display text-xl font-bold text-slate-900">
                HSE FieldReady Curriculum Admin Gate
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sign in using your Supabase account. The server checks the account's administrator role in the protected user_roles table. There is no shared demo passcode or client-side bypass.
              </p>
              {adminError && <p className="text-xs text-rose-600">{adminError}</p>}
              <button
                type="submit"
                className="glass-btn-primary w-full py-2.5 rounded-xl font-bold text-xs"
              >
                Verify My Signed-In Account
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-900/10 pb-4">
                <div>
                  <span className="text-xs font-mono text-emerald-600">
                    ✓ SERVER-VERIFIED ADMIN SESSION ACTIVE
                  </span>
                  <h2 className="font-display text-xl font-bold text-slate-900 mt-0.5">
                    Curriculum Governance, Content Publishing &amp; Issue Review
                  </h2>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono text-slate-600">
                  <span>Modules: {modules.length}</span>
                  <span>Lessons: {lessons.length}</span>
                  <span>Glossary: {glossaryTerms.length}</span>
                </div>
              </div>

              {adminMsg && (
                <div className="p-3 rounded-xl liquid-glass-subtle border border-emerald-400/40 text-xs text-emerald-800">
                  {adminMsg}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Publish / Unpublish Modules & Lessons */}
                <div className="p-5 rounded-2xl liquid-glass-recessed space-y-3">
                  <div className="text-xs font-mono text-slate-600">
                    MANAGE MODULES &amp; LESSONS (PUBLISH / UNPUBLISH)
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {lessons.map((les) => (
                      <div
                        key={les.id}
                        className="p-3 rounded-xl liquid-glass-subtle flex items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <div className="font-semibold text-slate-900">{les.title}</div>
                          <div className="text-slate-500 font-mono">
                            Phase {les.phaseNumber} · {les.isPublished ? 'Published' : 'Draft / Hidden'}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onTogglePublishLesson(les.id)}
                          className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 ${
                            les.isPublished
                              ? 'liquid-glass-subtle text-emerald-600 border border-emerald-400/35'
                              : 'liquid-glass-recessed text-slate-500'
                          }`}
                        >
                          {les.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          <span>{les.isPublished ? 'Published' : 'Unpublished'}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add New Glossary Entry */}
                <form
                  onSubmit={handleCreateGlossary}
                  className="p-5 rounded-2xl liquid-glass-recessed space-y-3"
                >
                  <div className="text-xs font-mono text-slate-600">
                    ADD BILINGUAL GLOSSARY ENTRY
                  </div>
                  <input
                    type="text"
                    value={newTermTitle}
                    onChange={(e) => setNewTermTitle(e.target.value)}
                    placeholder="English Term (e.g., Confined Space Attendant)"
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                  />
                  <input
                    type="text"
                    value={newTermDef}
                    onChange={(e) => setNewTermDef(e.target.value)}
                    placeholder="Simple English Definition..."
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                  />
                  <input
                    type="text"
                    value={newTermRu}
                    onChange={(e) => setNewTermRu(e.target.value)}
                    placeholder="Roman Urdu Explanation..."
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                  />
                  <button
                    type="submit"
                    className="glass-btn-primary w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Publish Glossary Term</span>
                  </button>
                </form>
              </div>

              {/* Reported Content Issues */}
              <div className="p-5 rounded-2xl liquid-glass-recessed space-y-3">
                <div className="text-xs font-mono text-slate-600">
                  REPORTED CURRICULUM &amp; JURISDICTION REVIEW QUEUE ({reportedIssues.length})
                </div>
                {reportedIssues.map((iss) => (
                  <div
                    key={iss.id}
                    className="p-3 rounded-xl liquid-glass-subtle flex flex-wrap items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <span className="text-slate-900 font-mono">[{iss.lessonId}]</span>{' '}
                      <span className="text-slate-700">{iss.issueText}</span>
                    </div>
                    <span className="text-emerald-600 font-mono">{iss.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
