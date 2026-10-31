import React, { useState } from 'react';
import { GlossaryItem, FIRST_30_DAYS_ROADMAP } from '../data/curriculumData';
import {
  Search,
  Bookmark,
  Bot,
  Calendar,
  CheckSquare,
  Square,
  Send,
  BookMarked,
} from 'lucide-react';

interface ToolsAndCoachViewProps {
  initialSubTab?: 'glossary' | 'coach' | 'roadmap30';
  glossaryTerms: GlossaryItem[];
  bookmarkedTermIds: string[];
  completedDay30Ids: string[];
  preferredLanguage: 'English' | 'Roman Urdu';
  weakAreas: string[];
  onToggleGlossaryBookmark: (termId: string) => void;
  onToggleDay30Task: (taskId: string) => void;
}

export const ToolsAndCoachView: React.FC<ToolsAndCoachViewProps> = ({
  initialSubTab = 'glossary',
  glossaryTerms,
  bookmarkedTermIds,
  completedDay30Ids,
  preferredLanguage,
  weakAreas,
  onToggleGlossaryBookmark,
  onToggleDay30Task,
}) => {
  const [subTab, setSubTab] = useState<'glossary' | 'coach' | 'roadmap30'>(initialSubTab);

  // Glossary filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [onlySavedTerms, setOnlySavedTerms] = useState(false);

  // AI Learning Coach chat state
  const [chatMessages, setChatMessages] = useState<
    { role: 'coach' | 'user'; text: string; source?: string }[]
  >([
    {
      role: 'coach',
      text:
        preferredLanguage === 'Roman Urdu'
          ? 'Assalam-o-Alaikum! Main aapka HSE FieldReady Learning Coach hoon. Aap mujh se Hierarchy of Controls, Confined Space Gas Limits, LOTO, PTW, ya Interview answers ke baare mein English ya Roman Urdu mein pooch sakte hain.'
          : 'Welcome to the HSE FieldReady Learning Coach. Ask me to explain any HSE concept, review incorrect quiz questions, practice terminology, or refine your interview answers. All guidance distinguishes general safety principles from statutory law and employer site rules.',
      source: 'curriculum_knowledge_engine',
    },
  ]);
  const [coachInput, setCoachInput] = useState('');
  const [isCoachLoading, setIsCoachLoading] = useState(false);

  const filteredTerms = glossaryTerms.filter((item) => {
    const matchesSearch =
      item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.simpleDefinition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.romanUrduExplanation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesSaved = !onlySavedTerms || bookmarkedTermIds.includes(item.id);
    return matchesSearch && matchesCat && matchesSaved;
  });

  const handleSendCoachPrompt = async (promptText: string) => {
    const clean = promptText.trim();
    if (!clean) return;
    setChatMessages((prev) => [...prev, { role: 'user', text: clean }]);
    setCoachInput('');
    setIsCoachLoading(true);

    try {
      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: clean,
          preferredLanguage,
          weakAreas,
        }),
      });
      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'coach',
          text: data.reply || 'Reviewed curriculum concept.',
          source: data.source,
        },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'coach',
          text: 'Offline Curriculum Coach: Always apply the 5-tier Hierarchy of Controls (Elimination → Substitution → Engineering → Administrative → PPE) and verify physical LOTO and gas test parameters at the workface.',
          source: 'offline_curriculum_fallback',
        },
      ]);
    } finally {
      setIsCoachLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Sub-navigation */}
      <div className="liquid-glass-elevated rounded-3xl p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">
            Field Reference · Bilingual Glossary · AI Coach
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5">
            HSE Officer Toolkit &amp; AI Coach
          </h1>
        </div>

        <div className="flex items-center gap-1.5 p-1.5 rounded-full liquid-glass-recessed overflow-x-auto shrink-0">
          {[
            { id: 'glossary' as const, label: 'Bilingual Glossary', icon: BookMarked },
            { id: 'coach' as const, label: 'AI Learning Coach', icon: Bot },
            { id: 'roadmap30' as const, label: 'First 30 Days', icon: Calendar },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSubTab(t.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
                  subTab === t.id
                    ? 'glass-segment-active'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===================================================================
          SUB-TAB 1: BILINGUAL HSE GLOSSARY
         =================================================================== */}
      {subTab === 'glossary' && (
        <div className="space-y-5">
          <div className="liquid-glass rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search HSE Glossary Terms"
                placeholder="Search English term, Roman Urdu explanation, or example (e.g., ALARP, LOTO, H2S, LEL)..."
                className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Filter glossary category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="glass-input px-3 py-2.5 rounded-xl text-xs"
              >
                <option value="All" className="bg-neutral-900">All Categories</option>
                <option value="Risk & Controls" className="bg-neutral-900">Risk &amp; Controls</option>
                <option value="Permits & High-Risk" className="bg-neutral-900">Permits &amp; High-Risk</option>
                <option value="Site Operations" className="bg-neutral-900">Site Operations</option>
                <option value="Emergency & Fire" className="bg-neutral-900">Emergency &amp; Fire</option>
              </select>

              <button
                type="button"
                onClick={() => setOnlySavedTerms(!onlySavedTerms)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-medium flex items-center gap-1.5 whitespace-nowrap ${
                  onlySavedTerms
                    ? 'glass-segment-active'
                    : 'glass-btn-secondary'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Saved Only ({bookmarkedTermIds.length})</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTerms.map((item) => {
              const isSaved = bookmarkedTermIds.includes(item.id);
              return (
                <div key={item.id} className="liquid-glass rounded-3xl p-5 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-mono text-slate-500">{item.category}</span>
                        <h3 className="font-display text-lg font-bold text-slate-900 mt-0.5">
                          {item.term}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => onToggleGlossaryBookmark(item.id)}
                        aria-label={`Bookmark ${item.term}`}
                        className={`p-2 rounded-xl ${
                          isSaved
                            ? 'glass-segment-active'
                            : 'glass-btn-secondary text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      <strong className="text-slate-900">Definition:</strong> {item.simpleDefinition}
                    </p>

                    <div className="p-3 rounded-xl liquid-glass-recessed text-xs text-slate-700 leading-relaxed">
                      <strong className="text-slate-900">Roman Urdu:</strong> {item.romanUrduExplanation}
                    </div>

                    <p className="text-xs text-slate-600">
                      <strong className="text-emerald-600">Industrial Site Example:</strong>{' '}
                      {item.industrialExample}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-900/10 text-xs text-slate-500">
                    Related: {item.relatedConcepts.join(' · ')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================
          SUB-TAB 2: AI LEARNING COACH
         =================================================================== */}
      {subTab === 'coach' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 liquid-glass rounded-3xl p-6 space-y-4">
            <div className="border-b border-slate-900/10 pb-3 flex items-center justify-between">
              <div>
                <div className="text-xs font-mono text-slate-500">CURRICULUM-GROUNDED HSE ASSISTANT</div>
                <h2 className="font-display text-xl font-bold text-slate-900">
                  Interactive HSE Learning Coach
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                Mode: {preferredLanguage}
              </span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl text-xs sm:text-sm whitespace-pre-line leading-relaxed ${
                    msg.role === 'user'
                      ? 'liquid-glass-elevated text-slate-900 ml-8'
                      : 'liquid-glass-recessed text-slate-800 mr-8'
                  }`}
                >
                  <div className="text-[11px] font-mono text-slate-500 mb-1">
                    {msg.role === 'user' ? 'YOU' : `HSE COACH (${msg.source || 'verified'})`}
                  </div>
                  {msg.text}
                </div>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendCoachPrompt(coachInput);
              }}
              className="flex gap-2 pt-2"
            >
              <input
                type="text"
                value={coachInput}
                onChange={(e) => setCoachInput(e.target.value)}
                placeholder="Ask about Hierarchy of Controls, Confined Space gas limits, LOTO, or interview answers..."
                className="glass-input flex-1 px-4 py-3 rounded-xl text-xs sm:text-sm"
              />
              <button
                type="submit"
                disabled={isCoachLoading}
                className="glass-btn-primary px-5 py-3 rounded-xl font-bold text-xs flex items-center gap-1.5 whitespace-nowrap"
              >
                <Send className="w-4 h-4" />
                <span>{isCoachLoading ? 'Thinking...' : 'Ask Coach'}</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-4 liquid-glass rounded-3xl p-5 space-y-4">
            <div className="text-xs font-mono text-slate-500">QUICK REVISION PROMPTS</div>
            <div className="space-y-2">
              {[
                'Explain the 5 tiers of Hierarchy of Controls with a site example.',
                'What are the Confined Space gas test limits for O2, LEL, and H2S?',
                'How do I answer when a supervisor refuses to stop unsafe work?',
              ].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleSendCoachPrompt(q)}
                  className="w-full text-left p-3 rounded-xl liquid-glass-subtle hover:border-slate-900/25 text-xs text-slate-700"
                >
                  “{q}”
                </button>
              ))}
            </div>
            <div className="p-3.5 rounded-xl liquid-glass-recessed text-xs text-slate-500 leading-relaxed">
              <strong className="text-slate-700">Governance Boundary:</strong> The AI Coach provides general educational safety guidance based on ILO/HSE/OSHA principles and never fabricates national statutes or site permits.
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          SUB-TAB 3: FIRST 30 DAYS AS AN HSE OFFICER
         =================================================================== */}
      {subTab === 'roadmap30' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl liquid-glass-subtle text-xs sm:text-sm text-slate-700">
            <strong className="text-slate-900">Workplace Supervision Notice:</strong> This 30-day newcomer roadmap guides your structured site orientation. All actual workplace tasks must follow your employer’s approved HSE procedures, site induction, and line supervision.
          </div>

          <div className="space-y-5">
            {FIRST_30_DAYS_ROADMAP.map((weekBlock) => (
              <div key={weekBlock.week} className="liquid-glass rounded-3xl p-6 space-y-4">
                <div>
                  <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900">
                    {weekBlock.week}
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">{weekBlock.focus}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {weekBlock.tasks.map((task) => {
                    const isChecked = completedDay30Ids.includes(task.id);
                    return (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => onToggleDay30Task(task.id)}
                        className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 ${
                          isChecked
                            ? 'liquid-glass-elevated border-emerald-400/45 text-slate-900'
                            : 'liquid-glass-subtle text-slate-700 hover:border-slate-900/25'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-mono text-slate-600">
                            <span>{task.dayRange}</span>
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-500" />
                            )}
                          </div>
                          <div className="font-display font-semibold text-sm text-slate-900">
                            {task.title}
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">{task.detail}</p>
                        </div>
                        <div className="text-[11px] font-mono text-emerald-600">
                          {isChecked ? '✓ Milestone Practiced' : 'Click to Mark Reviewed'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
