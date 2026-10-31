import React, { useState } from 'react';
import { OnboardingPreferences } from '../utils/hseLogic';
import { Sparkles } from 'lucide-react';

interface OnboardingAuthModalProps {
  isOpen: boolean;
  initialPrefs: OnboardingPreferences;
  currentUser: {
    name: string;
    email: string;
    authMode: 'local_demo' | 'authenticated';
  };
  onSaveComplete: (
    prefs: OnboardingPreferences,
    user: { name: string; email: string; authMode: 'local_demo' | 'authenticated' }
  ) => void;
  onClose?: () => void;
}

export const OnboardingAuthModal: React.FC<OnboardingAuthModalProps> = ({
  isOpen,
  initialPrefs,
  currentUser,
  onSaveComplete,
  onClose,
}) => {
  const [authTab, setAuthTab] = useState<'onboarding' | 'login' | 'signup' | 'reset'>('onboarding');
  const [name, setName] = useState(currentUser.name || 'Muhammad Athar');
  const [email, setEmail] = useState(currentUser.email || 'candidate@hsefieldready.org');
  const [password, setPassword] = useState('');
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  const [prefs, setPrefs] = useState<OnboardingPreferences>(initialPrefs);

  if (!isOpen) return null;

  const handleAuthAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setAuthNotice('Please enter a valid professional email address.');
      return;
    }
    if (authTab === 'reset') {
      setAuthNotice(`Password recovery instructions generated for ${email.trim()}. You can now continue to your learning profile.`);
      return;
    }
    if (!password || password.length < 4) {
      setAuthNotice('Please enter a password (minimum 4 characters) to sign in or register.');
      return;
    }
    onSaveComplete(prefs, {
      name: name.trim() || 'HSE Candidate',
      email: email.trim(),
      authMode: 'authenticated',
    });
  };

  const handleDemoComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setAuthNotice('Please enter your name so we can personalize your HSE academy dashboard.');
      return;
    }
    onSaveComplete(prefs, {
      name: name.trim(),
      email: email.trim() || 'demo@hsefieldready.local',
      authMode: currentUser.authMode,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto"
    >
      <div className="liquid-glass-elevated w-full max-w-2xl rounded-3xl p-6 md:p-8 space-y-6 my-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <p className="text-xs font-mono text-slate-400">HSE FIELDREADY · PERSONALIZED ACADEMY SETUP</p>
            <h2 id="onboarding-modal-title" className="font-display text-2xl font-bold text-white mt-1">
              Configure Your HSE Officer Career Track
            </h2>
          </div>
          <div className="flex items-center gap-1 p-1 rounded-xl liquid-glass-recessed">
            <button
              type="button"
              onClick={() => {
                setAuthTab('onboarding');
                setAuthNotice(null);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                authTab === 'onboarding' ? 'glass-segment-active font-semibold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Learning Plan
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthTab('login');
                setAuthNotice(null);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                authTab === 'login' || authTab === 'signup' || authTab === 'reset'
                  ? 'glass-segment-active font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Account / Sign In
            </button>
          </div>
        </div>

        {authNotice && (
          <div className="p-3 rounded-xl liquid-glass-subtle border border-white/20 text-xs text-slate-200">
            {authNotice}
          </div>
        )}

        {authTab === 'onboarding' ? (
          <form onSubmit={handleDemoComplete} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="onb-name" className="block text-xs font-medium text-slate-300 mb-1.5">
                  Candidate Full Name
                </label>
                <input
                  id="onb-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                  placeholder="Your Name"
                />
              </div>

              <div>
                <label htmlFor="onb-role" className="block text-xs font-medium text-slate-300 mb-1.5">
                  Target Career Track (Primary Focus)
                </label>
                <input
                  id="onb-role"
                  type="text"
                  disabled
                  value="HSE Officer (Newcomer Edition)"
                  className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm text-slate-300 opacity-75 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="onb-exp" className="block text-xs font-medium text-slate-300 mb-1.5">
                  1. Current HSE Experience Level
                </label>
                <select
                  id="onb-exp"
                  value={prefs.experienceLevel}
                  onChange={(e) =>
                    setPrefs({
                      ...prefs,
                      experienceLevel: e.target.value as OnboardingPreferences['experienceLevel'],
                    })
                  }
                  className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                >
                  <option value="Beginner" className="bg-neutral-900">Beginner (Entering HSE / Fresh Graduate)</option>
                  <option value="Some Experience" className="bg-neutral-900">Some Experience (1–2 Years Site Exposure)</option>
                  <option value="Experienced" className="bg-neutral-900">Experienced (Refining Technical &amp; Gulf Interview Skills)</option>
                </select>
              </div>

              <div>
                <label htmlFor="onb-lang" className="block text-xs font-medium text-slate-300 mb-1.5">
                  2. Preferred Explanation Language
                </label>
                <select
                  id="onb-lang"
                  value={prefs.preferredLanguage}
                  onChange={(e) =>
                    setPrefs({
                      ...prefs,
                      preferredLanguage: e.target.value as OnboardingPreferences['preferredLanguage'],
                    })
                  }
                  className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                >
                  <option value="English" className="bg-neutral-900">English (Technical International Standard)</option>
                  <option value="Roman Urdu" className="bg-neutral-900">English + Roman Urdu (Bilingual Concept Clarity)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="onb-eng" className="block text-xs font-medium text-slate-300 mb-1.5">
                  3. Spoken English Communication Level
                </label>
                <select
                  id="onb-eng"
                  value={prefs.englishLevel}
                  onChange={(e) =>
                    setPrefs({
                      ...prefs,
                      englishLevel: e.target.value as OnboardingPreferences['englishLevel'],
                    })
                  }
                  className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                >
                  <option value="Basic" className="bg-neutral-900">Basic (Needs Interview Sentence Framing)</option>
                  <option value="Intermediate" className="bg-neutral-900">Intermediate (Clear Technical Expression)</option>
                  <option value="Fluent" className="bg-neutral-900">Fluent (Ready for Client Approval Panels)</option>
                </select>
              </div>

              <div>
                <label htmlFor="onb-mins" className="block text-xs font-medium text-slate-300 mb-1.5">
                  4. Daily Study Availability: <span className="font-mono text-white">{prefs.dailyMinutes} mins/day</span>
                </label>
                <input
                  id="onb-mins"
                  type="range"
                  min={15}
                  max={90}
                  step={15}
                  value={prefs.dailyMinutes}
                  onChange={(e) => setPrefs({ ...prefs, dailyMinutes: Number(e.target.value) })}
                  className="w-full accent-white mt-2"
                />
              </div>
            </div>

            <div>
              <label htmlFor="onb-goal" className="block text-xs font-medium text-slate-300 mb-1.5">
                5. Primary Interview Preparation Goal
              </label>
              <input
                id="onb-goal"
                type="text"
                value={prefs.interviewGoal}
                onChange={(e) => setPrefs({ ...prefs, interviewGoal: e.target.value })}
                className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                placeholder="e.g., Gulf Oil & Gas / Industrial Construction HSE Officer Interview"
              />
            </div>

            <div className="p-3.5 rounded-xl liquid-glass-subtle text-xs text-slate-300 flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-slate-200 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Transparent Storage Notice:</strong> When Supabase cloud credentials are not configured in environment variables, your learning progress, notes, risk assessments, and quiz records are persisted in <span className="text-white underline">Local Demo Mode</span> on this device.
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="glass-btn-secondary px-4 py-2.5 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="glass-btn-primary px-5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap"
              >
                Save Plan &amp; Enter Academy
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleAuthAction} className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <button
                type="button"
                onClick={() => setAuthTab('login')}
                className={`underline ${authTab === 'login' ? 'text-white font-semibold' : ''}`}
              >
                Sign In
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => setAuthTab('signup')}
                className={`underline ${authTab === 'signup' ? 'text-white font-semibold' : ''}`}
              >
                Create Account
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => setAuthTab('reset')}
                className={`underline ${authTab === 'reset' ? 'text-white font-semibold' : ''}`}
              >
                Reset Password
              </button>
            </div>

            {authTab === 'signup' && (
              <div>
                <label htmlFor="auth-name" className="block text-xs font-medium text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  id="auth-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                />
              </div>
            )}

            <div>
              <label htmlFor="auth-email" className="block text-xs font-medium text-slate-300 mb-1">
                Email Address
              </label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm"
              />
            </div>

            {authTab !== 'reset' && (
              <div>
                <label htmlFor="auth-pass" className="block text-xs font-medium text-slate-300 mb-1">
                  Password
                </label>
                <input
                  id="auth-pass"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setAuthTab('onboarding')}
                className="glass-btn-secondary px-4 py-2.5 rounded-xl text-xs font-medium"
              >
                Back to Preferences
              </button>
              <button
                type="submit"
                className="glass-btn-primary px-5 py-2.5 rounded-xl text-xs font-semibold"
              >
                {authTab === 'login' ? 'Sign In' : authTab === 'signup' ? 'Create Account' : 'Send Password Reset'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
