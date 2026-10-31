import React, { useState } from 'react';
import { HazardScenario, HazardHotspot } from '../data/curriculumData';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface LessonDiagramProps {
  type:
    | 'hierarchy_of_controls'
    | 'hazard_vs_risk_matrix'
    | 'ptw_loto_flow'
    | 'working_at_height_scaffold'
    | 'confined_space_entry'
    | 'incident_swiss_cheese'
    | 'interview_star_framework';
}

export const LessonVisualDiagram: React.FC<LessonDiagramProps> = ({ type }) => {
  const [selectedTier, setSelectedTier] = useState<number>(0);

  if (type === 'hierarchy_of_controls') {
    const tiers = [
      {
        name: '1. ELIMINATION (Most Effective)',
        desc: 'Physically remove the hazard completely from the work process (e.g., pre-assemble pipe spools on ground level instead of working at 10m height).',
        reliability: '100% Physical Removal — Does not rely on human behavior',
      },
      {
        name: '2. SUBSTITUTION',
        desc: 'Replace the hazardous material or energy with a safer alternative (e.g., use 110V CTE step-down tools instead of 230V; use water-based coating instead of solvent).',
        reliability: 'High — Reduces intrinsic severity at source',
      },
      {
        name: '3. ENGINEERING CONTROLS',
        desc: 'Isolate people from the hazard via physical collective barriers (e.g., scaffold top-rail/mid-rail/toe-board, LOTO physical locks, machine guards, local exhaust ventilation).',
        reliability: 'High — Collective physical barrier protecting all workers',
      },
      {
        name: '4. ADMINISTRATIVE CONTROLS',
        desc: 'Change the way people work via procedures, Permits to Work (PTW), JSA briefings, Toolbox Talks, heat-stress shift rotation, and warning signs.',
        reliability: 'Moderate — Requires continuous supervision & worker compliance',
      },
      {
        name: '5. PERSONAL PROTECTIVE EQUIPMENT (PPE — Last Resort)',
        desc: 'Protect the single wearer if all higher controls fail (Full-body harness, hard hat, FFP3 respirator, safety goggles, impact gloves).',
        reliability: 'Lowest — Hazard remains active; fails if damaged or unfastened',
      },
    ];

    return (
      <div className="space-y-4">
        <div className="text-xs text-slate-600">
          Click any tier of the inverted Hierarchy Pyramid below to inspect its field reliability and industrial application:
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 flex flex-col items-center space-y-2">
            {tiers.map((t, idx) => {
              const widths = ['w-full', 'w-11/12', 'w-10/12', 'w-9/12', 'w-8/12'];
              const isSelected = selectedTier === idx;
              return (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => setSelectedTier(idx)}
                  className={`${widths[idx]} py-3 px-4 rounded-xl text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'glass-segment-active scale-[1.01]'
                      : 'liquid-glass-subtle hover:border-slate-900/25 text-slate-600'
                  }`}
                >
                  <span className="font-display font-semibold text-sm text-slate-900">{t.name}</span>
                  <span className="text-xs font-mono text-slate-600">Inspect →</span>
                </button>
              );
            })}
          </div>
          <div className="lg:col-span-5 liquid-glass-elevated p-5 rounded-2xl space-y-3">
            <div className="text-xs font-mono text-slate-500">SELECTED CONTROL TIER</div>
            <h4 className="font-display text-lg font-semibold text-slate-900">{tiers[selectedTier].name}</h4>
            <p className="text-sm text-slate-700 leading-relaxed">{tiers[selectedTier].desc}</p>
            <div className="pt-2 border-t border-slate-900/10 text-xs text-slate-600 font-mono">
              Reliability: {tiers[selectedTier].reliability}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'confined_space_entry') {
    return (
      <div className="space-y-4">
        <svg viewBox="0 0 760 320" className="w-full h-auto rounded-xl liquid-glass-recessed p-2">
          {/* Ground level */}
          <line x1="20" y1="70" x2="740" y2="70" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="6 4" />
          <text x="30" y="55" fill="#cbd5e1" fontSize="12" fontFamily="monospace">
            OUTSIDE ACCESS ZONE (Standby Man + Entry Log + Calibrated Multi-Gas Monitor)
          </text>

          {/* Tripod & Winch */}
          <polygon points="290,70 330,15 370,70" fill="none" stroke="#e2e8f0" strokeWidth="2.5" />
          <line x1="330" y1="15" x2="330" y2="240" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 2" />
          <text x="380" y="38" fill="#f8fafc" fontSize="12" fontWeight="bold">
            Rescue Tripod &amp; Lifeline Winch
          </text>

          {/* Vessel Body */}
          <rect x="180" y="70" width="300" height="230" rx="18" fill="rgba(15, 17, 23, 0.85)" stroke="#64748b" strokeWidth="2" />

          {/* Stratified Gas Layers */}
          <rect x="190" y="80" width="280" height="65" fill="rgba(255, 255, 255, 0.05)" />
          <text x="205" y="108" fill="#f8fafc" fontSize="13" fontWeight="bold">
            TOP LAYER: Methane (CH4) — Lighter than air
          </text>
          <text x="205" y="128" fill="#cbd5e1" fontSize="11" fontFamily="monospace">
            Target: O2 19.5%–23.5% | LEL: 0% (Hot Work)
          </text>

          <rect x="190" y="150" width="280" height="65" fill="rgba(255, 255, 255, 0.08)" />
          <text x="205" y="178" fill="#f8fafc" fontSize="13" fontWeight="bold">
            MIDDLE LAYER: Carbon Monoxide (CO) — Neutral density
          </text>
          <text x="205" y="198" fill="#cbd5e1" fontSize="11" fontFamily="monospace">
            Target: CO = 0 ppm (PEL &lt; 25 ppm) | Forced Air Blower
          </text>

          <rect x="190" y="220" width="280" height="70" fill="rgba(244, 63, 94, 0.14)" />
          <text x="205" y="248" fill="#fecdd3" fontSize="13" fontWeight="bold">
            BOTTOM LAYER: Hydrogen Sulfide (H2S) — Heavier than air
          </text>
          <text x="205" y="268" fill="#cbd5e1" fontSize="11" fontFamily="monospace">
            Target: H2S = 0 ppm (Sinks to low pockets/sumps!)
          </text>

          {/* Isolation Blinds */}
          <rect x="500" y="130" width="230" height="145" rx="12" fill="rgba(255, 255, 255, 0.04)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
          <text x="515" y="156" fill="#ffffff" fontSize="13" fontWeight="bold">
            6 Mandatory Entry Checks:
          </text>
          <text x="515" y="178" fill="#cbd5e1" fontSize="11">1. Valid CSE Permit &amp; JSA</text>
          <text x="515" y="196" fill="#cbd5e1" fontSize="11">2. LOTO + Mechanical Blinding</text>
          <text x="515" y="214" fill="#cbd5e1" fontSize="11">3. Top/Mid/Bottom Gas Test</text>
          <text x="515" y="232" fill="#cbd5e1" fontSize="11">4. Forced Ventilation &amp; 24V Light</text>
          <text x="515" y="250" fill="#cbd5e1" fontSize="11">5. Trained Standby Attendant</text>
          <text x="515" y="268" fill="#cbd5e1" fontSize="11">6. Non-Entry Tripod Rescue Plan</text>
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <svg viewBox="0 0 760 260" className="w-full h-auto rounded-xl liquid-glass-recessed p-3">
        <defs>
          <linearGradient id="glassGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.03" />
          </linearGradient>
        </defs>
        <rect x="20" y="25" width="210" height="210" rx="16" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />
        <text x="40" y="60" fill="#cbd5e1" fontSize="12" fontFamily="monospace" fontWeight="bold">
          STAGE 01 · IDENTIFY &amp; ISOLATE
        </text>
        <text x="40" y="92" fill="#f8fafc" fontSize="14" fontWeight="bold">
          Hazard &amp; Energy Source
        </text>
        <text x="40" y="120" fill="#cbd5e1" fontSize="12">• Spot intrinsic harm source</text>
        <text x="40" y="142" fill="#cbd5e1" fontSize="12">• LOTO padlock + tag</text>
        <text x="40" y="164" fill="#cbd5e1" fontSize="12">• Zero-energy "Try-Out"</text>
        <text x="40" y="186" fill="#cbd5e1" fontSize="12">• Calibrated gas verification</text>

        <line x1="235" y1="130" x2="270" y2="130" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />

        <rect x="275" y="25" width="210" height="210" rx="16" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />
        <text x="295" y="60" fill="#cbd5e1" fontSize="12" fontFamily="monospace" fontWeight="bold">
          STAGE 02 · BARRIER VERIFICATION
        </text>
        <text x="295" y="92" fill="#f8fafc" fontSize="14" fontWeight="bold">
          Engineering &amp; PTW Controls
        </text>
        <text x="295" y="120" fill="#cbd5e1" fontSize="12">• Guardrails &amp; 150mm toe-board</text>
        <text x="295" y="142" fill="#cbd5e1" fontSize="12">• Green Scafftag / Trench shoring</text>
        <text x="295" y="164" fill="#cbd5e1" fontSize="12">• Fire blanket + 30mA RCD</text>
        <text x="295" y="186" fill="#cbd5e1" fontSize="12">• Pre-job Toolbox Talk (TBT)</text>

        <line x1="490" y1="130" x2="525" y2="130" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />

        <rect x="530" y="25" width="210" height="210" rx="16" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />
        <text x="550" y="60" fill="#cbd5e1" fontSize="12" fontFamily="monospace" fontWeight="bold">
          STAGE 03 · SAFE EXECUTION
        </text>
        <text x="550" y="92" fill="#f8fafc" fontSize="14" fontWeight="bold">
          ALARP &amp; Closeout
        </text>
        <text x="550" y="120" fill="#cbd5e1" fontSize="12">• Continuous site monitoring</text>
        <text x="550" y="142" fill="#cbd5e1" fontSize="12">• Stop Work if scope changes</text>
        <text x="550" y="164" fill="#cbd5e1" fontSize="12">• Housekeeping &amp; de-isolation</text>
        <text x="550" y="186" fill="#cbd5e1" fontSize="12">• Formal Permit handback</text>
      </svg>
    </div>
  );
};

interface InteractiveHazardSceneProps {
  scenario: HazardScenario;
  activeHotspotId: string | null;
  resolvedHotspotIds: string[];
  onSelectHotspot: (hotspot: HazardHotspot) => void;
}

export const InteractiveHazardScene: React.FC<InteractiveHazardSceneProps> = ({
  scenario,
  activeHotspotId,
  resolvedHotspotIds,
  onSelectHotspot,
}) => {
  return (
    <div
      data-testid="hazard-scene-canvas"
      className="relative w-full rounded-2xl overflow-hidden liquid-glass-recessed select-none"
    >
      {/* Industrial Vector Scene Background */}
      {scenario.sceneType === 'scaffold_height' ? (
        <svg viewBox="0 0 800 420" className="w-full h-auto block">
          <defs>
            <linearGradient id="skyPipe" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#090b0f" />
              <stop offset="65%" stopColor="#12151c" />
              <stop offset="100%" stopColor="#171b24" />
            </linearGradient>
          </defs>
          <rect width="800" height="420" fill="url(#skyPipe)" />
          {/* Ground slab */}
          <rect x="0" y="310" width="800" height="110" fill="#0d0f14" stroke="#334155" strokeWidth="1.5" />
          {/* Standing water puddle on walkway */}
          <ellipse cx="385" cy="340" rx="115" ry="26" fill="rgba(148, 163, 184, 0.16)" stroke="#94a3b8" strokeDasharray="4 2" />
          {/* Damaged 230V cable running through puddle */}
          <path d="M 120 350 Q 260 330 385 340 T 680 355" fill="none" stroke="#f43f5e" strokeWidth="3.5" />
          <circle cx="385" cy="340" r="8" fill="#fbbf24" />

          {/* Steel Pipe Rack & Scaffold Structure */}
          <rect x="130" y="70" width="12" height="240" fill="#475569" />
          <rect x="330" y="70" width="12" height="240" fill="#475569" />
          <rect x="580" y="70" width="12" height="240" fill="#475569" />
          {/* Elevated Platform at 8m */}
          <rect x="125" y="135" width="470" height="10" fill="#94a3b8" />
          {/* Missing guardrail section on left (Hazard 1) */}
          <line x1="130" y1="100" x2="325" y2="100" stroke="#f43f5e" strokeWidth="2" strokeDasharray="5 5" />
          <text x="155" y="92" fill="#fda4af" fontSize="11" fontFamily="monospace">
            MISSING MID-RAIL &amp; TOE-BOARD (8m ELEVATION)
          </text>

          {/* Intact guardrail on right */}
          <line x1="335" y1="95" x2="585" y2="95" stroke="#cbd5e1" strokeWidth="2.5" />
          <line x1="335" y1="115" x2="585" y2="115" stroke="#94a3b8" strokeWidth="2" />
          <rect x="335" y="128" width="250" height="7" fill="#64748b" />

          {/* Hot work welding sparks showering onto open drum below (Hazard 2) */}
          <circle cx="510" cy="122" r="9" fill="#fbbf24" />
          <line x1="510" y1="130" x2="490" y2="255" stroke="#fcd34d" strokeWidth="2" strokeDasharray="3 3" />
          <line x1="510" y1="130" x2="525" y2="255" stroke="#fde68a" strokeWidth="2" strokeDasharray="4 3" />
          {/* Open Flammable Solvent Drum below */}
          <rect x="488" y="255" width="44" height="58" rx="4" fill="#881337" stroke="#fda4af" strokeWidth="1.5" />
          <text x="494" y="288" fill="#ffffff" fontSize="10" fontWeight="bold">
            SOLVENT
          </text>

          <text x="24" y="34" fill="#94a3b8" fontSize="13" fontFamily="monospace">
            INDUSTRIAL SCENE · PIPE RACK BAY 4 (CLICK TARGETS TO INSPECT HAZARDS)
          </text>
        </svg>
      ) : (
        <svg viewBox="0 0 800 420" className="w-full h-auto block">
          <rect width="800" height="420" fill="#090b0f" />
          {/* Ground & Deep 3m Excavation Cut */}
          <polygon points="0,180 140,180 140,360 390,360 390,180 800,180 800,420 0,420" fill="#161922" stroke="#475569" strokeWidth="2" />
          {/* Excavated Trench Void */}
          <rect x="140" y="180" width="250" height="180" fill="#07080c" stroke="#f43f5e" strokeWidth="2" strokeDasharray="6 4" />
          {/* Spoil Pile right on trench lip */}
          <path d="M 390 180 Q 435 115 485 180 Z" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
          <text x="395" y="140" fill="#e2e8f0" fontSize="11" fontFamily="monospace">
            SPOIL PILE ON EDGE (0.2m)
          </text>
          <text x="165" y="275" fill="#fda4af" fontSize="12" fontFamily="monospace">
            UNSHORED 3.0m VERTICAL TRENCH WALL
          </text>

          {/* Mobile Crane Boom & Suspended 8T Concrete Load */}
          <line x1="740" y1="300" x2="565" y2="55" stroke="#94a3b8" strokeWidth="10" />
          <line x1="565" y1="55" x2="565" y2="145" stroke="#cbd5e1" strokeWidth="2" />
          <rect x="520" y="145" width="90" height="45" fill="#334155" stroke="#e2e8f0" strokeWidth="2" />
          <text x="530" y="172" fill="#ffffff" fontSize="11" fontWeight="bold">
            8T CHAMBER
          </text>
          <text x="500" y="220" fill="#fda4af" fontSize="11" fontFamily="monospace">
            WORKER UNDER SUSPENDED LOAD (NO TAGLINE)
          </text>

          <text x="24" y="34" fill="#94a3b8" fontSize="13" fontFamily="monospace">
            INDUSTRIAL SCENE · SECTOR B TRENCH &amp; CRANE LIFT ZONE (CLICK TARGETS)
          </text>
        </svg>
      )}

      {/* Interactive Hotspot Pins */}
      {scenario.hotspots.map((hs, index) => {
        const isResolved = resolvedHotspotIds.includes(hs.id);
        const isActive = activeHotspotId === hs.id;

        return (
          <button
            key={hs.id}
            type="button"
            onClick={() => onSelectHotspot(hs)}
            aria-label={`Inspect Hazard ${index + 1}: ${hs.label}`}
            style={{ left: `${hs.xPercent}%`, top: `${hs.yPercent}%` }}
            className={`-translate-x-1/2 -translate-y-1/2 absolute z-10 min-w-[44px] min-h-[44px] px-3 py-1.5 rounded-xl font-mono text-xs font-semibold flex items-center gap-1.5 transition-transform ${
              isResolved
                ? 'liquid-glass border border-emerald-400/50 text-emerald-800 shadow-lg'
                : isActive
                ? 'glass-btn-primary scale-110 shadow-xl ring-2 ring-white/70'
                : 'liquid-glass-elevated text-slate-800 hover:scale-105 shadow-lg'
            }`}
          >
            {isResolved ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <span className="whitespace-nowrap">
              {isResolved ? `Controlled #${index + 1}` : `Hazard #${index + 1}`}
            </span>
          </button>
        );
      })}
    </div>
  );
};
