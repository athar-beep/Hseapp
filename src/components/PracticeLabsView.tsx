import React, { useState } from 'react';
import {
  HAZARD_SCENARIOS_DATA,
  FIRE_CLASSES_DATA,
  DOCUMENT_TEMPLATES_DATA,
  HazardHotspot,
} from '../data/curriculumData';
import {
  calculateRiskScore,
  validateResidualRiskReduction,
} from '../utils/hseLogic';
import { InteractiveHazardScene } from './VisualDiagrams';
import {
  AlertTriangle,
  Grid,
  FileSpreadsheet,
  Flame,
  CheckCircle2,
  Download,
  Save,
} from 'lucide-react';

export interface SavedRiskAssessmentRecord {
  id: string;
  activity: string;
  hazard: string;
  personsAtRisk: string;
  consequences: string;
  existingControls: string;
  initialLikelihood: number;
  initialSeverity: number;
  initialScore: number;
  controlTier: 'Elimination' | 'Substitution' | 'Engineering Controls' | 'Administrative Controls' | 'PPE';
  additionalControls: string;
  residualLikelihood: number;
  residualSeverity: number;
  residualScore: number;
  createdAt: string;
}

export interface SavedDocumentRecord {
  id: string;
  templateId: string;
  title: string;
  values: Record<string, string>;
  updatedAt: string;
}

interface PracticeLabsViewProps {
  initialTab?: 'hazard' | 'risk' | 'docs' | 'fire';
  savedRiskAssessments: SavedRiskAssessmentRecord[];
  savedDocuments: SavedDocumentRecord[];
  onRecordHazardScore: (scenarioId: string, scorePercent: number) => void;
  onSaveRiskAssessment: (record: SavedRiskAssessmentRecord) => void;
  onSaveDocument: (doc: SavedDocumentRecord) => void;
}

export const PracticeLabsView: React.FC<PracticeLabsViewProps> = ({
  initialTab = 'hazard',
  savedRiskAssessments,
  savedDocuments,
  onRecordHazardScore,
  onSaveRiskAssessment,
  onSaveDocument,
}) => {
  const [activeLabTab, setActiveLabTab] = useState<'hazard' | 'risk' | 'docs' | 'fire'>(initialTab);

  // --- LAB 1: HAZARD IDENTIFICATION LAB STATE ---
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const currentScenario = HAZARD_SCENARIOS_DATA[scenarioIdx];
  const [activeHotspot, setActiveHotspot] = useState<HazardHotspot | null>(
    currentScenario.hotspots[0]
  );
  const [selectedConsequenceIdx, setSelectedConsequenceIdx] = useState<number>(0);
  const [selectedControlIdx, setSelectedControlIdx] = useState<number>(0);
  const [resolvedHotspotIds, setResolvedHotspotIds] = useState<string[]>([]);
  const [hotspotFeedback, setHotspotFeedback] = useState<string | null>(null);

  // --- LAB 2: 5x5 RISK ASSESSMENT LAB STATE ---
  const [raActivity, setRaActivity] = useState('Welding Overhead Pipe Spool at 8m Elevation');
  const [raHazard, setRaHazard] = useState('Uncontained welding sparks & working near unguarded scaffold opening');
  const [raPersons, setRaPersons] = useState('Welders, Pipefitters, and Ground Crew passing below');
  const [raConsequence, setRaConsequence] = useState('Fatal fall from height, severe burns, or solvent fire below');
  const [raExisting] = useState('Basic PPE (Hard hat, safety boots, gloves)');
  const [initL, setInitL] = useState(4);
  const [initS, setInitS] = useState(5);
  const [controlTier, setControlTier] = useState<
    'Elimination' | 'Substitution' | 'Engineering Controls' | 'Administrative Controls' | 'PPE'
  >('Engineering Controls');
  const [raAdditional, setRaAdditional] = useState(
    'Install complete scaffold guardrails + 150mm toe-board (Green Tag), fire-retardant welding habitat blanket, remove flammables >11m, Hot Work Permit + Fire Watcher, and 100% tie-off double lanyard.'
  );
  const [resL, setResL] = useState(1);
  const [resS, setResS] = useState(4);
  const [raValidationMsg, setRaValidationMsg] = useState<string | null>(null);

  // --- LAB 3: DOCUMENTATION LAB STATE ---
  const [selectedTemplateId, setSelectedTemplateId] = useState(DOCUMENT_TEMPLATES_DATA[0].id);
  const activeTemplate =
    DOCUMENT_TEMPLATES_DATA.find((t) => t.id === selectedTemplateId) || DOCUMENT_TEMPLATES_DATA[0];
  const [docFormValues, setDocFormValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    DOCUMENT_TEMPLATES_DATA[0].fields.forEach((f) => {
      initial[f.key] = f.defaultValue;
    });
    return initial;
  });
  const [docSaveMsg, setDocSaveMsg] = useState<string | null>(null);

  // --- LAB 4: FIRE & EMERGENCY DRILL STATE ---
  const [passStepOrder, setPassStepOrder] = useState<string[]>([]);
  const [fireScenarioChoice, setFireScenarioChoice] = useState<string | null>(null);

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const tmpl = DOCUMENT_TEMPLATES_DATA.find((t) => t.id === templateId);
    if (tmpl) {
      const existingSaved = savedDocuments.find((d) => d.templateId === templateId);
      if (existingSaved) {
        setDocFormValues(existingSaved.values);
      } else {
        const defaults: Record<string, string> = {};
        tmpl.fields.forEach((f) => {
          defaults[f.key] = f.defaultValue;
        });
        setDocFormValues(defaults);
      }
      setDocSaveMsg(null);
    }
  };

  const handleVerifyHotspot = () => {
    if (!activeHotspot) return;
    const isConseqRight = selectedConsequenceIdx === activeHotspot.correctConsequenceIndex;
    const isCtrlRight = activeHotspot.controlOptions[selectedControlIdx]?.isCorrect;

    if (isConseqRight && isCtrlRight) {
      const updated = Array.from(new Set([...resolvedHotspotIds, activeHotspot.id]));
      setResolvedHotspotIds(updated);
      setHotspotFeedback(`✓ Verified (${activeHotspot.priorityLevel}): ${activeHotspot.explanation}`);
      const pct = Math.round((updated.length / currentScenario.hotspots.length) * 100);
      onRecordHazardScore(currentScenario.id, pct);
    } else {
      setHotspotFeedback(
        '✗ Review your selection: Choose the most realistic severe consequence and the highest-tier Engineering/Substitution control.'
      );
    }
  };

  const handleSaveRa = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateResidualRiskReduction(initL, initS, resL, resS, controlTier);
    setRaValidationMsg(validation.feedback);
    if (!validation.isValid) return;

    const record: SavedRiskAssessmentRecord = {
      id: `ra-${Date.now()}`,
      activity: raActivity,
      hazard: raHazard,
      personsAtRisk: raPersons,
      consequences: raConsequence,
      existingControls: raExisting,
      initialLikelihood: initL,
      initialSeverity: initS,
      initialScore: validation.initialScore,
      controlTier,
      additionalControls: raAdditional,
      residualLikelihood: resL,
      residualSeverity: resS,
      residualScore: validation.residualScore,
      createdAt: new Date().toISOString().split('T')[0],
    };
    onSaveRiskAssessment(record);
  };

  const handleSaveDoc = (e: React.FormEvent) => {
    e.preventDefault();
    const record: SavedDocumentRecord = {
      id: `doc-${activeTemplate.id}`,
      templateId: activeTemplate.id,
      title: activeTemplate.title,
      values: docFormValues,
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    onSaveDocument(record);
    setDocSaveMsg(`Saved "${activeTemplate.title}" to your Practice Portfolio.`);
  };

  const handleExportDocJson = () => {
    const payload = {
      documentType: activeTemplate.title,
      code: activeTemplate.code,
      disclaimer: activeTemplate.disclaimer,
      exportedAt: new Date().toISOString(),
      entries: docFormValues,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTemplate.code.toLowerCase()}-practice.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const initEval = calculateRiskScore(initL, initS);
  const resEval = calculateRiskScore(resL, resS);

  return (
    <div className="space-y-6">
      {/* Lab Navigation Header */}
      <div className="liquid-glass-elevated rounded-3xl p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">
            Interactive Field Simulations
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5">
            Practical Site &amp; Documentation Labs
          </h1>
        </div>

        <div className="flex items-center gap-1.5 p-1.5 rounded-full liquid-glass-recessed overflow-x-auto shrink-0">
          {[
            { id: 'hazard' as const, testId: 'practice-tab-hazard', label: 'Hazard ID Lab', icon: AlertTriangle },
            { id: 'risk' as const, testId: 'practice-tab-risk-matrix', label: '5×5 Risk Matrix', icon: Grid },
            { id: 'docs' as const, testId: 'practice-tab-docs', label: 'Documentation (7)', icon: FileSpreadsheet },
            { id: 'fire' as const, testId: 'practice-tab-fire', label: 'Fire & Emergency', icon: Flame },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                data-testid={tab.testId}
                onClick={() => setActiveLabTab(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
                  activeLabTab === tab.id
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
          TAB 1: HAZARD IDENTIFICATION LAB
         =================================================================== */}
      {activeLabTab === 'hazard' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {HAZARD_SCENARIOS_DATA.map((scen, idx) => (
                <button
                  key={scen.id}
                  type="button"
                  onClick={() => {
                    setScenarioIdx(idx);
                    setActiveHotspot(HAZARD_SCENARIOS_DATA[idx].hotspots[0]);
                    setHotspotFeedback(null);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    scenarioIdx === idx
                      ? 'glass-segment-active'
                      : 'glass-btn-secondary text-slate-600'
                  }`}
                >
                  {scen.title} ({scen.difficulty})
                </button>
              ))}
            </div>
            <div className="text-xs font-mono text-emerald-600">
              Resolved in Scene:{' '}
              {
                currentScenario.hotspots.filter((h) => resolvedHotspotIds.includes(h.id))
                  .length
              }{' '}
              / {currentScenario.hotspots.length}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 7 cols: Interactive Industrial Scene */}
            <div className="lg:col-span-7 space-y-3">
              <InteractiveHazardScene
                scenario={currentScenario}
                activeHotspotId={activeHotspot?.id || null}
                resolvedHotspotIds={resolvedHotspotIds}
                onSelectHotspot={(hs) => {
                  setActiveHotspot(hs);
                  setSelectedConsequenceIdx(0);
                  setSelectedControlIdx(0);
                  setHotspotFeedback(null);
                }}
              />
              <p className="text-xs text-slate-600 px-1">{currentScenario.briefing}</p>
            </div>

            {/* Right 5 cols: Hazard Control Deck */}
            <div className="lg:col-span-5 liquid-glass rounded-3xl p-6 space-y-4">
              {activeHotspot ? (
                <>
                  <div className="text-xs font-mono text-slate-500">
                    SELECTED HOTSPOT · {activeHotspot.priorityLevel}
                  </div>
                  <h3 className="font-display text-lg font-bold text-slate-900">
                    {activeHotspot.hazardTitle}
                  </h3>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      1. Identify Primary Consequence if Uncontrolled:
                    </label>
                    <div className="space-y-1.5">
                      {activeHotspot.consequenceOptions.map((cOpt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedConsequenceIdx(idx)}
                          className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition-colors ${
                            selectedConsequenceIdx === idx
                              ? 'glass-segment-active'
                              : 'liquid-glass-subtle text-slate-600 hover:border-slate-900/25'
                          }`}
                        >
                          {cOpt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      2. Select Appropriate Hierarchy of Controls Action:
                    </label>
                    <div className="space-y-1.5">
                      {activeHotspot.controlOptions.map((ctrl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedControlIdx(idx)}
                          className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition-colors ${
                            selectedControlIdx === idx
                              ? 'glass-segment-active'
                              : 'liquid-glass-subtle text-slate-600 hover:border-slate-900/25'
                          }`}
                        >
                          <span className="font-mono text-slate-900 font-semibold">[{ctrl.hierarchyTier}]</span>{' '}
                          {ctrl.text}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleVerifyHotspot}
                    className="glass-btn-primary w-full py-3 rounded-xl font-bold text-xs"
                  >
                    Apply Control &amp; Verify Response
                  </button>

                  {hotspotFeedback && (
                    <div className="p-3.5 rounded-xl liquid-glass-recessed border border-slate-900/15 text-xs text-slate-700 leading-relaxed">
                      {hotspotFeedback}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-slate-600">
                  Click any hazard pin on the industrial scene to inspect and control it.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          TAB 2: 5x5 RISK ASSESSMENT LAB
         =================================================================== */}
      {activeLabTab === 'risk' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 7 cols: Interactive Risk Assessment Form */}
          <form onSubmit={handleSaveRa} className="lg:col-span-7 liquid-glass rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900/10 pb-3">
              <div>
                <p className="text-xs font-mono text-slate-500">TRAINING SIMULATION · NOT AN APPROVED SITE PERMIT</p>
                <h2 className="font-display text-xl font-bold text-slate-900">
                  Interactive 5x5 Risk Assessment Builder
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-600">
                Saved Assessments: {savedRiskAssessments.length}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ra-act" className="block text-xs text-slate-600 mb-1">
                  Activity / Task
                </label>
                <input
                  id="ra-act"
                  type="text"
                  value={raActivity}
                  onChange={(e) => setRaActivity(e.target.value)}
                  className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                />
              </div>
              <div>
                <label htmlFor="ra-pers" className="block text-xs text-slate-600 mb-1">
                  Persons at Risk
                </label>
                <input
                  id="ra-pers"
                  type="text"
                  value={raPersons}
                  onChange={(e) => setRaPersons(e.target.value)}
                  className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ra-haz" className="block text-xs text-slate-600 mb-1">
                  Specific Hazard
                </label>
                <input
                  id="ra-haz"
                  type="text"
                  value={raHazard}
                  onChange={(e) => setRaHazard(e.target.value)}
                  className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                />
              </div>
              <div>
                <label htmlFor="ra-cons" className="block text-xs text-slate-600 mb-1">
                  Potential Consequence
                </label>
                <input
                  id="ra-cons"
                  type="text"
                  value={raConsequence}
                  onChange={(e) => setRaConsequence(e.target.value)}
                  className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Initial Risk Sliders */}
            <div className="p-4 rounded-2xl liquid-glass-recessed space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-600">
                  INITIAL RISK (BEFORE ADDITIONAL ENGINEERING CONTROLS)
                </span>
                <span className="text-xs font-mono font-bold text-rose-600 tabular-nums">
                  L{initL} × S{initS} = {initEval.score} ({initEval.level})
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="init-l" className="block text-xs text-slate-600">
                    Initial Likelihood (1 Rare → 5 Almost Certain): <strong className="tabular-nums text-slate-900">{initL}</strong>
                  </label>
                  <input
                    id="init-l"
                    type="range"
                    min={1}
                    max={5}
                    value={initL}
                    onChange={(e) => setInitL(Number(e.target.value))}
                    className="w-full accent-white mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="init-s" className="block text-xs text-slate-600">
                    Initial Severity (1 First Aid → 5 Fatal): <strong className="tabular-nums text-slate-900">{initS}</strong>
                  </label>
                  <input
                    id="init-s"
                    type="range"
                    min={1}
                    max={5}
                    value={initS}
                    onChange={(e) => setInitS(Number(e.target.value))}
                    className="w-full accent-white mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Hierarchy of Controls & Additional Measures */}
            <div className="space-y-3">
              <div>
                <label htmlFor="ra-tier" className="block text-xs text-slate-600 mb-1">
                  Primary Hierarchy of Controls Tier Applied
                </label>
                <select
                  id="ra-tier"
                  value={controlTier}
                  onChange={(e) =>
                    setControlTier(
                      e.target.value as
                        | 'Elimination'
                        | 'Substitution'
                        | 'Engineering Controls'
                        | 'Administrative Controls'
                        | 'PPE'
                    )
                  }
                  className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                >
                  <option value="Elimination" className="bg-neutral-900">1. Elimination (Physically Remove Hazard)</option>
                  <option value="Substitution" className="bg-neutral-900">2. Substitution (Safer Energy / Material)</option>
                  <option value="Engineering Controls" className="bg-neutral-900">3. Engineering Controls (Guardrails, LOTO, Shoring, Habitat)</option>
                  <option value="Administrative Controls" className="bg-neutral-900">4. Administrative Controls (PTW, JSA, TBT, Signage)</option>
                  <option value="PPE" className="bg-neutral-900">5. PPE Only (Warning: Insufficient alone for High Risk)</option>
                </select>
              </div>

              <div>
                <label htmlFor="ra-add" className="block text-xs text-slate-600 mb-1">
                  Specific Additional Control Measures (Engineering + Admin + PPE)
                </label>
                <textarea
                  id="ra-add"
                  rows={2}
                  value={raAdditional}
                  onChange={(e) => setRaAdditional(e.target.value)}
                  className="glass-input w-full p-3 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Residual Risk Sliders */}
            <div className="p-4 rounded-2xl liquid-glass-recessed space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-600">
                  RESIDUAL RISK (AFTER CONTROLS APPLIED — TARGET ALARP)
                </span>
                <span className="text-xs font-mono font-bold text-emerald-600 tabular-nums">
                  L{resL} × S{resS} = {resEval.score} ({resEval.level})
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="res-l" className="block text-xs text-slate-600">
                    Residual Likelihood (1–5): <strong className="tabular-nums text-slate-900">{resL}</strong>
                  </label>
                  <input
                    id="res-l"
                    type="range"
                    min={1}
                    max={5}
                    value={resL}
                    onChange={(e) => setResL(Number(e.target.value))}
                    className="w-full accent-white mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="res-s" className="block text-xs text-slate-600">
                    Residual Severity (1–5): <strong className="tabular-nums text-slate-900">{resS}</strong>
                  </label>
                  <input
                    id="res-s"
                    type="range"
                    min={1}
                    max={5}
                    value={resS}
                    onChange={(e) => setResS(Number(e.target.value))}
                    className="w-full accent-white mt-1"
                  />
                </div>
              </div>
            </div>

            {raValidationMsg && (
              <div className="p-3.5 rounded-xl liquid-glass-subtle text-xs text-slate-700">
                {raValidationMsg}
              </div>
            )}

            <button
              type="submit"
              className="glass-btn-primary w-full py-3 rounded-xl font-bold text-xs sm:text-sm"
            >
              Validate &amp; Save Practice Risk Assessment
            </button>
          </form>

          {/* Right 5 cols: Interactive 5x5 Matrix & Saved Records */}
          <div className="lg:col-span-5 space-y-6">
            <div className="liquid-glass rounded-3xl p-6 space-y-4">
              <div className="text-xs font-mono text-slate-500">5×5 TRAINING RISK MATRIX (L × S)</div>
              <div className="grid grid-cols-6 gap-1.5 text-center font-mono text-xs">
                <div className="p-2 text-slate-500">L \ S</div>
                {[1, 2, 3, 4, 5].map((s) => (
                  <div key={s} className="p-2 text-slate-600 font-bold">
                    S{s}
                  </div>
                ))}
                {[5, 4, 3, 2, 1].map((l) => (
                  <React.Fragment key={l}>
                    <div className="p-2 text-slate-600 font-bold flex items-center justify-center">
                      L{l}
                    </div>
                    {[1, 2, 3, 4, 5].map((s) => {
                      const val = l * s;
                      const isInit = initL === l && initS === s;
                      const isRes = resL === l && resS === s;
                      let cellBg = 'bg-emerald-500/12 text-emerald-800 border-emerald-400/25';
                      if (val >= 15) cellBg = 'bg-rose-500/18 text-rose-800 border-rose-400/35';
                      else if (val >= 8) cellBg = 'bg-amber-500/16 text-amber-200 border-amber-400/30';
                      else if (val >= 4) cellBg = 'bg-white/8 text-slate-700 border-slate-900/15';

                      return (
                        <div
                          key={`${l}-${s}`}
                          className={`p-2 rounded-lg border tabular-nums flex flex-col items-center justify-center ${cellBg} ${
                            isInit || isRes ? 'ring-2 ring-white font-bold scale-105' : ''
                          }`}
                        >
                          <span>{val}</span>
                          {isInit && <span className="text-[9px] text-slate-900">INIT</span>}
                          {isRes && <span className="text-[9px] text-emerald-600">RES</span>}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
              <div className="text-xs text-slate-600 space-y-1 pt-2">
                <div>• 1–3 Low: Acceptable with standard site PPE &amp; supervision</div>
                <div>• 4–6 Medium: Specific administrative &amp; JSA controls required</div>
                <div>• 8–12 High: Mandatory Permit to Work (PTW) &amp; Engineering barriers</div>
                <div>• 15–25 Critical: STOP WORK — Reduce risk before starting</div>
              </div>
            </div>

            {savedRiskAssessments.length > 0 && (
              <div className="liquid-glass-subtle rounded-2xl p-5 space-y-3">
                <div className="text-xs font-mono text-slate-600">
                  YOUR SAVED RISK ASSESSMENTS ({savedRiskAssessments.length})
                </div>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {savedRiskAssessments.map((item) => (
                    <div key={item.id} className="p-3 rounded-xl liquid-glass-recessed text-xs space-y-1">
                      <div className="font-semibold text-slate-900">{item.activity}</div>
                      <div className="text-slate-600">
                        Initial: {item.initialScore} → Residual: {item.residualScore} ({item.controlTier})
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================
          TAB 3: DOCUMENTATION PRACTICE LAB (7 TEMPLATES)
         =================================================================== */}
      {activeLabTab === 'docs' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 4 cols: Template Selector */}
          <div className="lg:col-span-4 liquid-glass rounded-3xl p-5 space-y-3">
            <div className="text-xs font-mono text-slate-500">7 SITE DOCUMENT TEMPLATES</div>
            <div className="space-y-2">
              {DOCUMENT_TEMPLATES_DATA.map((tmpl) => {
                const isSaved = savedDocuments.some((d) => d.templateId === tmpl.id);
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tmpl.id)}
                    className={`w-full text-left p-3.5 rounded-2xl transition-all flex items-center justify-between gap-2 ${
                      selectedTemplateId === tmpl.id
                        ? 'glass-segment-active font-semibold'
                        : 'liquid-glass-subtle text-slate-700 hover:border-slate-900/25'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-mono opacity-75">{tmpl.code}</div>
                      <div className="text-xs sm:text-sm">{tmpl.title}</div>
                    </div>
                    {isSaved && (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right 8 cols: Active Document Editor */}
          <form onSubmit={handleSaveDoc} className="lg:col-span-8 liquid-glass rounded-3xl p-6 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-900/10 pb-4">
              <div>
                <div className="text-xs font-mono text-slate-500">{activeTemplate.code} · {activeTemplate.disclaimer}</div>
                <h2 className="font-display text-xl font-bold text-slate-900 mt-1">{activeTemplate.title}</h2>
                <p className="text-xs text-slate-600 mt-1">{activeTemplate.purpose}</p>
              </div>
              <button
                type="button"
                onClick={handleExportDocJson}
                className="glass-btn-secondary px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
            </div>

            <div className="space-y-4">
              {activeTemplate.fields.map((field) => (
                <div key={field.key}>
                  <label htmlFor={`doc-${field.key}`} className="block text-xs font-medium text-slate-700 mb-1.5">
                    {field.label}
                  </label>
                  <textarea
                    id={`doc-${field.key}`}
                    rows={2}
                    value={docFormValues[field.key] || ''}
                    onChange={(e) =>
                      setDocFormValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                    placeholder={field.placeholder}
                    className="glass-input w-full p-3 rounded-xl text-xs sm:text-sm"
                  />
                </div>
              ))}
            </div>

            {docSaveMsg && (
              <div className="p-3 rounded-xl liquid-glass-subtle border border-emerald-400/40 text-xs text-emerald-800">
                {docSaveMsg}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                className="glass-btn-primary px-6 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Practice Document</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ===================================================================
          TAB 4: FIRE & EMERGENCY LEARNING LAB
         =================================================================== */}
      {activeLabTab === 'fire' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl liquid-glass-elevated text-xs sm:text-sm text-slate-700">
            <strong className="text-slate-900">CRITICAL LIFE-SAFETY DISCLAIMER:</strong> Educational training module only. Portable fire extinguishers are strictly for incipient-stage small fires where a clear escape route is behind you. Never encourage or attempt untrained firefighting or entry into smoke-filled structures.
          </div>

          <div className="liquid-glass rounded-3xl p-6 space-y-4">
            <h2 className="font-display text-xl font-bold text-slate-900">
              Fire Classes, Extinguishing Agents &amp; Lethal Incompatible Combinations
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-900/15 text-slate-600 font-mono text-xs">
                    <th className="py-3 px-3">Fire Class</th>
                    <th className="py-3 px-3">Fuel / Material</th>
                    <th className="py-3 px-3">Correct Extinguisher</th>
                    <th className="py-3 px-3">Lethal Prohibition (NEVER USE)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {FIRE_CLASSES_DATA.map((fc) => (
                    <tr key={fc.fireClass} className="hover:bg-slate-900/5">
                      <td className="py-3 px-3 font-display font-bold text-slate-900 whitespace-nowrap">
                        {fc.fireClass}
                      </td>
                      <td className="py-3 px-3 text-slate-700">{fc.materials}</td>
                      <td className="py-3 px-3 text-emerald-600">{fc.bestExtinguisher}</td>
                      <td className="py-3 px-3 text-rose-600">{fc.neverUse}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive PASS Sequence & Emergency Response Drill */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="liquid-glass rounded-3xl p-6 space-y-4">
              <div className="text-xs font-mono text-slate-500">INTERACTIVE EXTINGUISHER DRILL</div>
              <h3 className="font-display text-lg font-bold text-slate-900">
                Click the 4 PASS Steps in Correct Operating Order
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { code: 'P', text: 'Pull the safety pin (breaks tamper seal)' },
                  { code: 'A', text: 'Aim nozzle at the BASE of the fire (fuel source)' },
                  { code: 'S1', text: 'Squeeze the operating lever slowly' },
                  { code: 'S2', text: 'Sweep side-to-side across the base' },
                ].map((step) => {
                  const idx = passStepOrder.indexOf(step.code);
                  return (
                    <button
                      key={step.code}
                      type="button"
                      onClick={() => {
                        if (!passStepOrder.includes(step.code)) {
                          setPassStepOrder([...passStepOrder, step.code]);
                        }
                      }}
                      className={`p-3.5 rounded-2xl text-left text-xs transition-all ${
                        idx !== -1
                          ? 'glass-segment-active'
                          : 'liquid-glass-subtle text-slate-700 hover:border-slate-900/25'
                      }`}
                    >
                      <div className="font-mono font-bold text-slate-900">
                        {idx !== -1 ? `Step #${idx + 1}` : 'Select Step'}
                      </div>
                      <div className="mt-1">{step.text}</div>
                    </button>
                  );
                })}
              </div>
              {passStepOrder.length > 0 && (
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-mono text-slate-700">
                    Current Sequence: {passStepOrder.join(' → ')}
                    {passStepOrder.join(',') === 'P,A,S1,S2' ? ' (✓ Perfect PASS Order!)' : ''}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPassStepOrder([])}
                    className="text-xs text-slate-600 underline"
                  >
                    Reset Sequence
                  </button>
                </div>
              )}
            </div>

            <div className="liquid-glass rounded-3xl p-6 space-y-4">
              <div className="text-xs font-mono text-slate-500">EMERGENCY ALARM &amp; EVACUATION SCENARIO</div>
              <h3 className="font-display text-lg font-bold text-slate-900">
                Live Substation Switchgear Smoke Detection
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Thick black smoke is pouring from a 11kV High-Voltage Substation room while you are conducting an external inspection. What is your protocol?
              </p>
              <div className="space-y-2">
                {[
                  {
                    id: 'f-1',
                    text: 'Trigger the nearest Break-Glass Fire Alarm call point, notify Emergency Control via radio (State Name, Location, Nature of Emergency), keep all personnel out of the 11kV room, suspend area permits, and guide crews to the Assembly Point.',
                    correct: true,
                  },
                  {
                    id: 'f-2',
                    text: 'Break open the 11kV substation door alone and spray a red Water extinguisher onto the 11,000-volt busbar.',
                    correct: false,
                  },
                ].map((choice) => (
                  <button
                    key={choice.id}
                    type="button"
                    onClick={() => setFireScenarioChoice(choice.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border text-xs transition-all ${
                      fireScenarioChoice === choice.id
                        ? choice.correct
                          ? 'bg-emerald-500/15 border-emerald-400/50 text-slate-900'
                          : 'bg-rose-500/15 border-rose-400/50 text-slate-900'
                        : 'liquid-glass-subtle text-slate-700 hover:border-slate-900/25'
                    }`}
                  >
                    {choice.text}
                  </button>
                ))}
              </div>
              {fireScenarioChoice && (
                <div className="p-3 rounded-xl liquid-glass-recessed text-xs text-slate-700">
                  {fireScenarioChoice === 'f-1'
                    ? '✓ Correct! Never enter a smoke-filled HV room or use water on electrical switchgear. Raise the alarm, report clearly, and evacuate to Assembly Point.'
                    : '✗ Lethal mistake! Entering an arc-flash smoke-filled 11kV room with water causes instant fatal electrocution.'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
