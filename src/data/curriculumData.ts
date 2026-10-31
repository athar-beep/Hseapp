export interface VerifiedReference {
  id: string;
  sourceOrganization: 'ILO' | 'UK HSE' | 'OSHA' | 'NIOSH' | 'NFPA' | 'ISO';
  referenceTitle: string;
  officialUrl: string;
  publicationDate: string;
  lastReviewedDate: string;
  classification: 'General Safety Principle' | 'International Standard' | 'Regulatory Guidance' | 'Employer Procedure Template';
  jurisdictionNote: string;
}

export interface QuizQuestionItem {
  id: string;
  question: string;
  options: {
    text: string;
    isCorrect: boolean;
    whyIncorrect?: string;
  }[];
  explanation: string;
}

export interface LessonItem {
  id: string;
  moduleId: string;
  phaseNumber: 1 | 2 | 3 | 4 | 5;
  title: string;
  estimatedMinutes: number;
  prerequisiteLessonId?: string;
  isPublished: boolean;
  understand: {
    heading: string;
    englishExplanation: string[];
    romanUrduExplanation: string[];
    keyTerms: { term: string; meaning: string }[];
    practicalSiteExample: string;
    criticalSafetyNote: string;
  };
  visualDiagramType:
    | 'hierarchy_of_controls'
    | 'hazard_vs_risk_matrix'
    | 'ptw_loto_flow'
    | 'working_at_height_scaffold'
    | 'confined_space_entry'
    | 'incident_swiss_cheese'
    | 'interview_star_framework';
  visualCaption: string;
  quiz: QuizQuestionItem[];
  practicalChallenge: {
    scenarioTitle: string;
    siteSituation: string;
    promptQuestion: string;
    options: {
      id: string;
      actionText: string;
      isOptimal: boolean;
      feedback: string;
    }[];
  };
  interviewConnection: {
    questions: {
      question: string;
      modelAnswer: string;
      romanUrduTip: string;
    }[];
  };
  references: VerifiedReference[];
}

export interface ModuleItem {
  id: string;
  phaseNumber: 1 | 2 | 3 | 4 | 5;
  phaseTitle: string;
  title: string;
  summary: string;
  topicsCovered: string[];
  milestoneTitle: string;
  isPublished: boolean;
}

export interface HazardHotspot {
  id: string;
  xPercent: number;
  yPercent: number;
  label: string;
  hazardTitle: string;
  consequenceOptions: string[];
  correctConsequenceIndex: number;
  controlOptions: {
    text: string;
    hierarchyTier: 'Elimination' | 'Substitution' | 'Engineering' | 'Administrative' | 'PPE';
    isCorrect: boolean;
  }[];
  priorityLevel: 'Immediate Stop Work' | 'High Priority' | 'Routine Correction';
  explanation: string;
}

export interface HazardScenario {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  siteArea: string;
  briefing: string;
  sceneType: 'scaffold_height' | 'excavation_trench' | 'confined_hotwork' | 'lifting_electrical';
  hotspots: HazardHotspot[];
}

export interface DocumentTemplate {
  id: string;
  title: string;
  code: string;
  purpose: string;
  disclaimer: string;
  fields: {
    key: string;
    label: string;
    placeholder: string;
    defaultValue: string;
    multiline?: boolean;
  }[];
}

export interface GlossaryItem {
  id: string;
  term: string;
  category: 'Fundamentals' | 'Risk & Controls' | 'Permits & High-Risk' | 'Site Operations' | 'Emergency & Fire';
  simpleDefinition: string;
  romanUrduExplanation: string;
  industrialExample: string;
  relatedConcepts: string[];
}

export interface InterviewBankQuestion {
  id: string;
  mode: 'HR' | 'Technical HSE' | 'Beginner' | 'Situational';
  question: string;
  expectedKeyPoints: string[];
  modelAnswer: string;
  relatedLessonId: string;
}

export const LEARNING_PHASES = [
  {
    phaseNumber: 1 as const,
    title: 'PHASE 1 — FOUNDATION',
    subtitle: 'HSE Officer Role, Safety Culture, Hazard vs. Risk, Incident Types & Hierarchy of Controls',
    targetOutcome: 'Master foundational HSE terminology, legal vs. procedural distinctions, and risk control order.',
  },
  {
    phaseNumber: 2 as const,
    title: 'PHASE 2 — TECHNICAL KNOWLEDGE',
    subtitle: 'Risk Matrix, JSA/JHA, Permit to Work, Hot Work, Confined Space, WAH, Excavation, LOTO, Lifting, Electrical, PPE & Fire',
    targetOutcome: 'Apply high-risk operational controls, permit verification, and technical site standards.',
  },
  {
    phaseNumber: 3 as const,
    title: 'PHASE 3 — PRACTICAL SITE SKILLS',
    subtitle: 'Inspections, Toolbox Talks, Observations, Incident Investigation, CAPA, Daily Reporting & Contractor Management',
    targetOutcome: 'Execute daily field walkdowns, lead effective Toolbox Talks, and investigate root causes.',
  },
  {
    phaseNumber: 4 as const,
    title: 'PHASE 4 — INTERVIEW PREPARATION',
    subtitle: 'HR & Technical Interviews, Situational Judgment, Self-Introduction & Gulf/International Job Preparation',
    targetOutcome: 'Deliver structured, confident professional English answers under panel examination.',
  },
  {
    phaseNumber: 5 as const,
    title: 'PHASE 5 — FINAL ASSESSMENT',
    subtitle: 'Comprehensive Technical Exam, Hazard Lab Test, Documentation Exercise & Full Mock Interview',
    targetOutcome: 'Validate holistic HSE Officer readiness across all 6 core competency dimensions.',
  },
];

export const MODULES_DATA: ModuleItem[] = [
  {
    id: 'mod-p1-core',
    phaseNumber: 1,
    phaseTitle: 'PHASE 1 — FOUNDATION',
    title: 'HSE Fundamentals, Terminology & Hierarchy of Controls',
    summary: 'Introduction to Health, Safety & Environment, HSE Officer duties, Hazard vs. Risk, Near Miss vs. Incident, and the 5-tier Hierarchy of Controls.',
    topicsCovered: [
      'Introduction & Meaning of HSE',
      'Responsibilities of an HSE Officer & Safety Culture',
      'Hazard vs. Risk & Accident, Incident, Near Miss',
      'Hierarchy of Controls (Elimination to PPE)',
    ],
    milestoneTitle: 'Foundation Safety Principles Verified',
    isPublished: true,
  },
  {
    id: 'mod-p2-risk-ptw',
    phaseNumber: 2,
    phaseTitle: 'PHASE 2 — TECHNICAL KNOWLEDGE',
    title: 'Risk Assessment, 5x5 Matrix, JSA/JHA & Permit to Work (PTW)',
    summary: 'Systematic hazard identification, qualitative 5x5 risk scoring, Job Safety Analysis breakdown, and Permit to Work governance.',
    topicsCovered: [
      'Hazard Identification & 5-Step Risk Assessment',
      '5x5 Risk Matrix & ALARP Principle',
      'JSA / JHA Step-by-Step Formulation',
      'Permit to Work (PTW) System & LOTO Isolation',
    ],
    milestoneTitle: 'Risk & Permit Control Practitioner',
    isPublished: true,
  },
  {
    id: 'mod-p2-highrisk',
    phaseNumber: 2,
    phaseTitle: 'PHASE 2 — TECHNICAL KNOWLEDGE',
    title: 'Critical High-Risk Operations: WAH, Confined Space, Excavation, Lifting & Fire',
    summary: 'Technical safeguards for Working at Height, Confined Space Entry gas testing, Excavation shoring, Crane Lifting plans, Electrical safety, and Fire Safety.',
    topicsCovered: [
      'Working at Height (WAH) & Scaffolding Tag System',
      'Confined Space Entry, Atmospheric Testing & Standby Attendant',
      'Excavation Safety, Trench Shoring & Underground Utilities',
      'Lifting Operations, Hot Work, Electrical Safety, PPE & Fire',
    ],
    milestoneTitle: 'High-Risk Field Operations Specialist',
    isPublished: true,
  },
  {
    id: 'mod-p3-site-skills',
    phaseNumber: 3,
    phaseTitle: 'PHASE 3 — PRACTICAL SITE SKILLS',
    title: 'Field Inspections, Toolbox Talks, Incident Investigation & CAPA',
    summary: 'Daily site walkdowns, delivering engaging Toolbox Talks, reporting observations, root-cause investigation (5 Whys), and Corrective/Preventive Actions.',
    topicsCovered: [
      'Workplace Inspections, Safety Observations & Daily HSE Reporting',
      'Conducting Effective Toolbox Talks (TBT) & Worker Communication',
      'Incident Reporting, Investigation (Immediate vs. Root Cause) & CAPA',
      'Emergency Response & Contractor Safety Coordination',
    ],
    milestoneTitle: 'Practical Site Execution Ready',
    isPublished: true,
  },
  {
    id: 'mod-p4-interview',
    phaseNumber: 4,
    phaseTitle: 'PHASE 4 — INTERVIEW PREPARATION',
    title: 'HSE Interview Mastery: HR, Technical, Situational & Gulf Client Approvals',
    summary: 'Professional English self-introduction, STAR framework for scenario questions, handling supervisor pushback, and Gulf EPC contractor interview standards.',
    topicsCovered: [
      'Professional Self-Introduction & HR Interview Strategy',
      'Technical & Scenario-Based Situational Judgment',
      'Gulf Job Interview Preparation (Aramco/ADNOC/QatarEnergy Contractor Context)',
    ],
    milestoneTitle: 'Interview Communication Competent',
    isPublished: true,
  },
  {
    id: 'mod-p5-final',
    phaseNumber: 5,
    phaseTitle: 'PHASE 5 — FINAL ASSESSMENT',
    title: 'Comprehensive Site-Readiness Capstone & Final Evaluation',
    summary: 'Integrated multi-domain technical exam, complex field scenario resolution, and readiness report generation.',
    topicsCovered: [
      'Comprehensive Technical & Situational Assessment',
      'Integrated Site Emergency & Permit Conflict Decision Exercise',
    ],
    milestoneTitle: 'HSE FieldReady Capstone Completed',
    isPublished: true,
  },
];

export const LESSONS_DATA: LessonItem[] = [
  {
    id: 'les-101',
    moduleId: 'mod-p1-core',
    phaseNumber: 1,
    title: '1.1 HSE Foundations, Hazard vs. Risk & Near Miss Reporting',
    estimatedMinutes: 18,
    isPublished: true,
    understand: {
      heading: 'Understanding Health, Safety, Environment & Core Risk Concepts',
      englishExplanation: [
        'HSE stands for Health, Safety, and Environment. Health protects workers from occupational illnesses (noise, dust, chemical exposure, heat stress); Safety prevents acute physical injuries (falls, struck-by, electrocution); Environment prevents pollution, spills, and ecological harm.',
        'An HSE Officer advises site management, monitors compliance with site procedures, conducts inspections, delivers Toolbox Talks, verifies Permits to Work, and exercises Stop Work Authority when imminent danger exists.',
        'A HAZARD is anything with the intrinsic potential to cause harm (e.g., an unguarded floor opening, pressurized gas cylinder, or exposed live cable). RISK is the combination of the likelihood that the hazard will cause harm and the severity of that consequence.',
        'An INCIDENT is any unplanned event that resulted in, or could have resulted in, injury, illness, or damage. An ACCIDENT is an incident that actually results in injury or loss. A NEAR MISS is an unplanned event that did NOT result in injury or damage, but had the potential to do so under slightly different timing or position.',
      ],
      romanUrduExplanation: [
        'HSE ka matlab Health (Sehat), Safety (Tahaffuz), aur Environment (Maholiyat) hai. Health ka maqsad workers ko occupational bimariyon (jaise shor, chemical fumes, ya heat stress) se bachana hai; Safety ka maqsad fori chot ya haadse (jaise height se girna ya current lagna) ko rokna hai.',
        'HAZARD har woh cheez ya halat hai jisme nuqsan pohanchane ki salahiyat mojood ho (maslan khula hua manhole ya nanga bijli ka taar). RISK is baat ka imkaan (Likelihood) aur nuqsan ki shiddat (Severity) hai ke woh hazard kitna khatarnaak sabit ho sakta hai.',
        'NEAR MISS aisi ghatna hai jahan haadsa hote-hote bach gaya ho — koi chot ya nuqsan nahi hua lekin agar waqt ya fasla thora mukhtalif hota to bara accident ho sakta tha. Near Miss ko report karna future ke bare accidents ko rokne ki sab se bari chabi hai.',
      ],
      keyTerms: [
        { term: 'Hazard', meaning: 'Any source, situation, or act with a potential to cause harm in terms of human injury or ill health.' },
        { term: 'Risk', meaning: 'Combination of the likelihood of an occurrence of a hazardous event and the severity of injury or ill health.' },
        { term: 'Near Miss', meaning: 'An unplanned event that did not result in injury, illness, or damage, but had the potential to do so.' },
        { term: 'Stop Work Authority (SWA)', meaning: 'Empowerment and duty of any worker or HSE Officer to halt a task immediately when an imminent hazard is observed.' },
      ],
      practicalSiteExample:
        'A 2kg steel spanner falls from a 12-meter scaffold platform and lands 1 meter away from a pipefitter walking below. Because nobody was struck, this is a High-Potential Near Miss. The hazard was unsecured tools at height (missing toe-board/tool lanyard); the risk was fatal head trauma.',
      criticalSafetyNote:
        'General safety definitions follow ISO 45001 and ILO-OSH 2001 principles. Specific incident reporting timelines (e.g., 24-hour regulator notification) depend on applicable national law and employer procedures.',
    },
    visualDiagramType: 'hazard_vs_risk_matrix',
    visualCaption: 'Interactive comparison: How an unmitigated Hazard translates into Risk (Likelihood × Severity), and how Near Miss reporting intercepts the Heinrich/Bird incident pyramid before a fatality occurs.',
    quiz: [
      {
        id: 'q-101-1',
        question: 'Which statement accurately distinguishes between a Hazard and a Risk?',
        options: [
          {
            text: 'A hazard is the probability of an accident, while risk is the physical object.',
            isCorrect: false,
            whyIncorrect: 'This reverses the definitions: the physical source of harm is the hazard, while probability × severity is risk.',
          },
          {
            text: 'A hazard is anything with the potential to cause harm; risk is the likelihood and severity of that harm occurring.',
            isCorrect: true,
          },
          {
            text: 'A hazard only exists after an accident occurs; risk exists before the job starts.',
            isCorrect: false,
            whyIncorrect: 'Hazards exist before, during, and after tasks regardless of whether an accident has occurred yet.',
          },
          {
            text: 'Hazard and risk mean the exact same thing in international standards.',
            isCorrect: false,
            whyIncorrect: 'ISO 45001 and UK HSE strictly separate hazard (intrinsic potential) from risk (likelihood × consequence).',
          },
        ],
        explanation: 'Per ISO 45001 and UK HSE guidance, a hazard has the potential to cause harm, whereas risk measures how likely and how severe that harm could be.',
      },
      {
        id: 'q-101-2',
        question: 'A crane load swings unexpectedly over an empty walkway and hits nothing. How should this event be classified?',
        options: [
          {
            text: 'No report needed because no person was injured and no property was damaged.',
            isCorrect: false,
            whyIncorrect: 'Ignoring near misses hides systemic control failures until a fatal accident happens.',
          },
          {
            text: 'Lost Time Injury (LTI).',
            isCorrect: false,
            whyIncorrect: 'An LTI requires a worker injury resulting in lost scheduled workdays.',
          },
          {
            text: 'Near Miss (High-Potential Unsafe Event) requiring immediate reporting and investigation.',
            isCorrect: true,
          },
          {
            text: 'Routine maintenance observation.',
            isCorrect: false,
            whyIncorrect: 'An uncontrolled suspended load swing is a critical lifting safety near miss, not routine maintenance.',
          },
        ],
        explanation: 'Unplanned events that could have caused severe injury under slightly different circumstances are Near Misses and must be investigated to fix failed controls.',
      },
      {
        id: 'q-101-3',
        question: 'What is the primary role of an HSE Officer on an industrial construction site?',
        options: [
          {
            text: 'To personally perform all high-risk welding and rigging tasks.',
            isCorrect: false,
            whyIncorrect: 'Craft tasks are performed by certified technicians; the HSE Officer verifies safety systems and advises.',
          },
          {
            text: 'To advise management, monitor field compliance, verify risk controls, and coach workers on safe execution.',
            isCorrect: true,
          },
          {
            text: 'To issue fines to workers silently without stopping unsafe work.',
            isCorrect: false,
            whyIncorrect: 'An HSE Officer must intervene immediately to stop unsafe work and coach safe behavior.',
          },
          {
            text: 'To approve structural engineering blueprints.',
            isCorrect: false,
            whyIncorrect: 'Structural calculations must be signed off by licensed civil/structural engineers.',
          },
        ],
        explanation: 'HSE Officers act as competent safety advisors and field monitors, coaching teams and ensuring safe systems of work are implemented.',
      },
      {
        id: 'q-101-4',
        question: 'Under the Health component of HSE, which of the following is an occupational health hazard rather than an acute mechanical safety hazard?',
        options: [
          {
            text: 'Prolonged exposure to 95 dB(A) compressor noise and crystalline silica dust.',
            isCorrect: true,
          },
          {
            text: 'An unshored 3-meter trench wall collapse.',
            isCorrect: false,
            whyIncorrect: 'Trench collapse is an acute physical safety hazard.',
          },
          {
            text: 'A broken ladder rung.',
            isCorrect: false,
            whyIncorrect: 'A defective ladder is an acute fall safety hazard.',
          },
          {
            text: 'An unbarricaded floor opening.',
            isCorrect: false,
            whyIncorrect: 'Floor openings represent an immediate fall safety hazard.',
          },
        ],
        explanation: 'Noise-induced hearing loss and silica inhalation are occupational health hazards that cause cumulative or chronic ill-health.',
      },
      {
        id: 'q-101-5',
        question: 'Why do proactive safety cultures focus heavily on investigating Near Misses?',
        options: [
          {
            text: 'Because near misses share the exact same root causes as serious and fatal accidents.',
            isCorrect: true,
          },
          {
            text: 'To increase paperwork volume for the client.',
            isCorrect: false,
            whyIncorrect: 'Near miss reporting is for preventive risk elimination, not bureaucratic volume.',
          },
          {
            text: 'To punish the worker who reported the near miss.',
            isCorrect: false,
            whyIncorrect: 'Punishing near miss reporters destroys safety culture and drives incidents underground.',
          },
          {
            text: 'Because legal regulators only audit near misses.',
            isCorrect: false,
            whyIncorrect: 'Regulators audit whole safety management systems, incidents, and physical controls.',
          },
        ],
        explanation: 'Fixing the root cause of a near miss removes the hazard before luck runs out and a worker is injured.',
      },
    ],
    practicalChallenge: {
      scenarioTitle: 'Unreported Grinder Disc Shatter',
      siteSituation:
        'During your morning site walkdown in the fabrication yard, a welder mentions that an angle grinder disc shattered 10 minutes ago. Nobody was cut because the guard deflected the fragments, and the welder is about to fit a new disc and resume work without telling the supervisor.',
      promptQuestion: 'As the Newcomer HSE Officer on site, what is your best immediate course of action?',
      options: [
        {
          id: 'opt-a',
          actionText: 'Pause the work, inspect the grinder RPM rating vs. the shattered disc RPM rating, quarantine the damaged batch, and log a Near Miss report with the supervisor.',
          isOptimal: true,
          feedback: 'Correct! A shattered abrasive wheel is a High-Potential Near Miss. Checking disc RPM compatibility and batch defects prevents a fatal facial or arterial injury.',
        },
        {
          id: 'opt-b',
          actionText: 'Since the guard worked and nobody was hurt, congratulate the welder and continue walking.',
          isOptimal: false,
          feedback: 'Unsafe. If the disc shattered due to overspeed (e.g., a 6,500 RPM disc mounted on an 11,000 RPM grinder) or damp storage, the next disc could kill the operator.',
        },
        {
          id: 'opt-c',
          actionText: 'Confiscate the welder’s ID badge and terminate him on the spot.',
          isOptimal: false,
          feedback: 'Counterproductive. Blaming workers before investigating equipment compatibility or store issuance destroys trust and stops future reporting.',
        },
      ],
    },
    interviewConnection: {
      questions: [
        {
          question: 'Can you explain the difference between a Hazard and a Risk with a practical construction site example?',
          modelAnswer:
            'Certainly. A hazard is anything with the intrinsic potential to cause harm, whereas risk is the combination of the likelihood of that hazard causing harm and the severity of the outcome. For example, an energized 400V distribution cable lying across a wet walkway is a hazard. The risk is the high probability of cable insulation damage leading to a fatal electrocution of workers walking through that area.',
          romanUrduTip:
            'Interview mein hamesha definition ke foran baad ek real site example dein (jaise wet walkway par live electric cable). Is se interviewer ko pata chalta hai ke aap ratta nahi balki practical samajh rakhte hain.',
        },
        {
          question: 'What is the difference between an Incident, an Accident, and a Near Miss?',
          modelAnswer:
            'An incident is the umbrella term for any unplanned workplace event that caused or could have caused harm. An accident is an incident that actually resulted in human injury, occupational illness, or asset damage. A near miss is an unplanned event where no injury or damage occurred, but had the potential to cause harm under slightly different circumstances—such as a dropped spanner landing beside a worker.',
          romanUrduTip:
            'Yaad rakhein: Har Accident aur Near Miss ek Incident hota hai, farq sirf outcome (nuqsan hua ya nahi) ka hai.',
        },
      ],
    },
    references: [
      {
        id: 'ref-101-1',
        sourceOrganization: 'ILO',
        referenceTitle: 'Guidelines on Occupational Safety and Health Management Systems (ILO-OSH 2001)',
        officialUrl: 'https://www.ilo.org/publications/guidelines-occupational-safety-and-health-management-systems-ilo-osh-2001',
        publicationDate: '2001 (2nd Edition 2009)',
        lastReviewedDate: '2026-10-01',
        classification: 'International Standard',
        jurisdictionNote: 'Foundational international framework; specific statutory incident reporting forms vary by national labor ministry.',
      },
      {
        id: 'ref-101-2',
        sourceOrganization: 'UK HSE',
        referenceTitle: 'Controlling the Risks in the Workplace — Hazard and Risk Definitions',
        officialUrl: 'https://www.hse.gov.uk/simple-health-safety/risk/index.htm',
        publicationDate: '2024 Revision',
        lastReviewedDate: '2026-10-01',
        classification: 'General Safety Principle',
        jurisdictionNote: 'UK statutory law applies in Great Britain; used internationally as best-practice risk management methodology.',
      },
    ],
  },
  {
    id: 'les-102',
    moduleId: 'mod-p1-core',
    phaseNumber: 1,
    title: '1.2 The Hierarchy of Controls: Engineering Out Hazards',
    estimatedMinutes: 20,
    prerequisiteLessonId: 'les-101',
    isPublished: true,
    understand: {
      heading: 'Why PPE is the Last Line of Defense — Mastering the 5 Control Tiers',
      englishExplanation: [
        'The Hierarchy of Controls (NIOSH / ISO 45001) ranks risk reduction measures from most effective to least effective: 1. Elimination, 2. Substitution, 3. Engineering Controls, 4. Administrative Controls, and 5. Personal Protective Equipment (PPE).',
        '1. ELIMINATION physically removes the hazard completely (e.g., assembling steel pipe spools on the ground instead of working at height). 2. SUBSTITUTION replaces a hazard with a safer alternative (e.g., replacing solvent-based toxic paint with water-based low-VOC paint, or using 110V step-down power tools instead of 230V).',
        '3. ENGINEERING CONTROLS isolate people from the hazard using physical barriers or mechanical systems (e.g., collective scaffold guardrails, machine interlock guards, local exhaust ventilation).',
        '4. ADMINISTRATIVE CONTROLS change the way people work through procedures, Permits to Work, job rotation, signage, and Toolbox Talks. 5. PPE protects the individual worker if all other controls fail, but relies on human compliance and does not remove the hazard.',
      ],
      romanUrduExplanation: [
        'Hierarchy of Controls humein batata hai ke kisi hazard ko control karne ka sab se mazboot tariqa kaunsa hai. Sab se upar ELIMINATION hai (khatre ko jar se khatam karna, jaise upar scaffold par kaam karne ke bajaye zameen par hi assembly kar lena).',
        'Dusre number par SUBSTITUTION hai (khatarnaak cheez ki jagah kam khatarnaak cheez use karna, jaise toxic chemical ki jagah water-based cleaner). Teesre number par ENGINEERING CONTROLS aate hain (physical barriers lagana jaise guardrails, machine covers, ya exhaust fans).',
        'Chauthe number par ADMINISTRATIVE CONTROLS hain (PTW, warning signs, training, shift rotation). Sab se aakhri darja PPE (helmet, harness, goggles) hai — yaad rakhein PPE hazard ko khatam nahi karta, sirf worker ke jism par aakhri dhaal banta hai.',
      ],
      keyTerms: [
        { term: 'Elimination', meaning: 'Physically removing the hazard from the workplace altogether (Most Effective).' },
        { term: 'Substitution', meaning: 'Replacing the hazardous material, process, or equipment with a less hazardous one.' },
        { term: 'Engineering Controls', meaning: 'Physical modifications or collective barriers that isolate workers from the hazard.' },
        { term: 'ALARP', meaning: 'As Low As Reasonably Practicable — reducing risk until the cost/effort of further reduction is grossly disproportionate to the benefit.' },
      ],
      practicalSiteExample:
        'When cutting concrete blocks generating silica dust: Elimination = ordering pre-sized blocks; Substitution = wet-cutting method; Engineering = on-tool vacuum dust extraction shroud; Administrative = restricting access zone & rotating operators; PPE = FFP3 / N95 respiratory protection.',
      criticalSafetyNote:
        'Never accept PPE alone as the primary control for a High or Critical risk activity when Engineering or Collective protection is reasonably practicable.',
    },
    visualDiagramType: 'hierarchy_of_controls',
    visualCaption: 'Inverted Pyramid of the 5-Tier Hierarchy of Controls (NIOSH / ISO 45001) comparing reliability of physical hazard removal vs. human-dependent administrative rules and PPE.',
    quiz: [
      {
        id: 'q-102-1',
        question: 'Which order correctly lists the Hierarchy of Controls from MOST effective to LEAST effective?',
        options: [
          {
            text: 'PPE → Administrative → Engineering → Substitution → Elimination',
            isCorrect: false,
            whyIncorrect: 'This is the exact reverse order (least effective to most effective).',
          },
          {
            text: 'Elimination → Substitution → Engineering Controls → Administrative Controls → PPE',
            isCorrect: true,
          },
          {
            text: 'Administrative → Permit to Work → PPE → Engineering → Elimination',
            isCorrect: false,
            whyIncorrect: 'Administrative controls and PPE are lower-tier controls that depend on human compliance.',
          },
          {
            text: 'Engineering Controls → Elimination → PPE → Substitution → Administrative',
            isCorrect: false,
            whyIncorrect: 'Elimination and Substitution always rank above Engineering Controls.',
          },
        ],
        explanation: 'Elimination and Substitution remove or reduce the hazard at source, followed by Engineering barriers, Administrative rules, and finally PPE.',
      },
      {
        id: 'q-102-2',
        question: 'Installing collective guardrails (top rail, mid-rail, and toe-board) around an elevated slab edge is an example of which control tier?',
        options: [
          {
            text: 'Personal Protective Equipment (PPE)',
            isCorrect: false,
            whyIncorrect: 'Guardrails are collective physical barriers, not personal equipment worn by a worker.',
          },
          {
            text: 'Administrative Control',
            isCorrect: false,
            whyIncorrect: 'Administrative controls are procedures or signs, not physical fall barriers.',
          },
          {
            text: 'Engineering Control (Collective Fall Prevention)',
            isCorrect: true,
          },
          {
            text: 'Substitution',
            isCorrect: false,
            whyIncorrect: 'The work at height still exists, but workers are physically isolated from the fall edge.',
          },
        ],
        explanation: 'Collective guardrails physically prevent a person from falling over the edge without requiring active worker intervention, making them an Engineering Control.',
      },
      {
        id: 'q-102-3',
        question: 'Replacing a 230V portable hand grinder on a construction site with a 110V center-tapped earth system (55V to earth) is an example of:',
        options: [
          {
            text: 'Substitution (replacing high voltage with reduced low voltage to lower shock severity)',
            isCorrect: true,
          },
          {
            text: 'Administrative Control',
            isCorrect: false,
            whyIncorrect: 'Changing the electrical energy source is a technical substitution, not a paper rule.',
          },
          {
            text: 'PPE',
            isCorrect: false,
            whyIncorrect: 'A step-down transformer is not worn on the body.',
          },
          {
            text: 'Elimination of electricity',
            isCorrect: false,
            whyIncorrect: 'Electricity is still used, but substituted with a much safer voltage level.',
          },
        ],
        explanation: 'Using reduced low voltage (110V CTE) substitutes a lethal 230V shock hazard with a significantly less hazardous voltage level.',
      },
      {
        id: 'q-102-4',
        question: 'Why is PPE ranked at the bottom of the Hierarchy of Controls?',
        options: [
          {
            text: 'Because PPE is too expensive for contractors to buy.',
            isCorrect: false,
            whyIncorrect: 'PPE is often cheaper upfront than engineering controls, which is why weak safety programs overuse it.',
          },
          {
            text: 'Because PPE does not remove the hazard; it only protects the single wearer and fails if improperly fitted, damaged, or not worn.',
            isCorrect: true,
          },
          {
            text: 'Because HSE Officers do not inspect PPE.',
            isCorrect: false,
            whyIncorrect: 'HSE Officers regularly inspect PPE compliance and condition.',
          },
          {
            text: 'Because international law bans PPE.',
            isCorrect: false,
            whyIncorrect: 'PPE is legally required as a supplementary control.',
          },
        ],
        explanation: 'PPE leaves the hazard fully present in the workplace and relies 100% on proper fit, maintenance, and human compliance.',
      },
      {
        id: 'q-102-5',
        question: 'Rotating workers every 30 minutes during peak summer heat and posting heat-stress warning signs is which type of control?',
        options: [
          {
            text: 'Administrative Control',
            isCorrect: true,
          },
          {
            text: 'Elimination',
            isCorrect: false,
            whyIncorrect: 'The ambient heat remains present.',
          },
          {
            text: 'Substitution',
            isCorrect: false,
            whyIncorrect: 'Work scheduling changes exposure duration, not the substance or process.',
          },
          {
            text: 'PPE',
            isCorrect: false,
            whyIncorrect: 'Work-rest schedules and signage are administrative organization measures.',
          },
        ],
        explanation: 'Work-rest schedules, job rotation, and safety signage manage exposure through organizational rules (Administrative Controls).',
      },
    ],
    practicalChallenge: {
      scenarioTitle: 'Noisy Diesel Generator Inside Enclosed Workshop',
      siteSituation:
        'A portable diesel generator has been placed inside a semi-enclosed mechanical workshop to power welding machines, creating 98 dB(A) noise and dangerous carbon monoxide exhaust fumes. The supervisor proposes handing out foam earplugs and dust masks to the 15 mechanics.',
      promptQuestion: 'Using the Hierarchy of Controls, what is your strongest technical recommendation?',
      options: [
        {
          id: 'opt-102-a',
          actionText: 'Relocate the diesel generator outside into an open, ventilated acoustic enclosure and run armored power cables inside (Engineering/Isolation), plus connect to main grid power if available (Substitution/Elimination).',
          isOptimal: true,
          feedback: 'Spot on! Moving the generator outside removes both carbon monoxide accumulation (which dust masks CANNOT filter) and extreme noise at the source.',
        },
        {
          id: 'opt-102-b',
          actionText: 'Approve the supervisor’s plan of foam earplugs and paper dust masks, and put up a "Wear Earplugs" sign.',
          isOptimal: false,
          feedback: 'Dangerous! Particulate dust masks offer ZERO protection against lethal Carbon Monoxide (CO) gas, and relying on PPE inside an exhaust-filled room can cause mass asphyxiation.',
        },
        {
          id: 'opt-102-c',
          actionText: 'Tell workers to hold their breath when walking near the generator.',
          isOptimal: false,
          feedback: 'Completely unacceptable and unsafe.',
        },
      ],
    },
    interviewConnection: {
      questions: [
        {
          question: 'Walk me through the Hierarchy of Controls and explain how you apply it on site.',
          modelAnswer:
            'The Hierarchy of Controls is a five-tier system used to control workplace hazards from most effective to least effective: Elimination, Substitution, Engineering Controls, Administrative Controls, and PPE. On site, I always look at the top tiers first. For example, if a crew needs to paint overhead pipework, I first ask if we can paint the pipe spools on the ground before erection (Elimination of work at height). If not, we use a mobile elevated work platform or full scaffold with guardrails (Engineering Control), backed by a Permit to Work and Toolbox Talk (Administrative), and a full-body harness with double lanyard anchored to a certified point (PPE).',
          romanUrduTip:
            'Jab bhi Hierarchy of Controls ka sawal aaye, 5 naam ganein aur ek hi kaam (maslan pipe painting at height) par paanchon tiers apply kar ke dikhayein.',
        },
      ],
    },
    references: [
      {
        id: 'ref-102-1',
        sourceOrganization: 'NIOSH',
        referenceTitle: 'NIOSH Hierarchy of Controls — Centers for Disease Control and Prevention',
        officialUrl: 'https://www.cdc.gov/niosh/hierarchy-of-controls/about/index.html',
        publicationDate: '2024 Update',
        lastReviewedDate: '2026-10-01',
        classification: 'General Safety Principle',
        jurisdictionNote: 'Globally recognized occupational hygiene and safety control framework.',
      },
    ],
  },
  {
    id: 'les-201',
    moduleId: 'mod-p2-risk-ptw',
    phaseNumber: 2,
    title: '2.1 Risk Assessment, 5x5 Matrix, JSA/JHA & Permit to Work (PTW)',
    estimatedMinutes: 25,
    prerequisiteLessonId: 'les-102',
    isPublished: true,
    understand: {
      heading: 'Operationalizing Risk Control: 5-Step Risk Assessment, JSA & PTW',
      englishExplanation: [
        'According to UK HSE guidance, a formal Risk Assessment follows 5 clear steps: Step 1: Identify the hazards; Step 2: Decide who might be harmed and how; Step 3: Evaluate the risks and decide on control measures (using a 5x5 Likelihood × Severity matrix); Step 4: Record your significant findings; Step 5: Review and update the assessment regularly.',
        'While a Risk Assessment evaluates an overall activity or area, a Job Safety Analysis (JSA) or Job Hazard Analysis (JHA) breaks a specific job down into sequential task steps, identifies the specific hazards of each step, and assigns exact control measures and responsible persons before the crew starts.',
        'A Permit to Work (PTW) is a formal, documented control system used for high-risk non-routine activities (Hot Work, Confined Space Entry, Working at Height, Excavation, Electrical/Mechanical Isolation - LOTO, Critical Lifting). A PTW verifies that hazards have been isolated, gas tests completed, and authorized signatures obtained BEFORE work begins.',
        'LOTO (Lockout / Tagout) ensures that hazardous energy sources (electrical, hydraulic, pneumatic, thermal, chemical, gravitational) are physically isolated, locked in the OFF/closed position with personal padlocks, tagged, and tested for ZERO energy ("Try Out") before maintenance.',
      ],
      romanUrduExplanation: [
        'Risk Assessment ke 5 steps har HSE interview mein pooche jaate hain: 1. Hazards pehchanna, 2. Kis ko aur kaise nuqsan ho sakta hai, 3. Risk evaluate karna (Likelihood × Severity) aur controls lagana, 4. Record karna, aur 5. Review karna.',
        'JSA (Job Safety Analysis) kisi ek job ko step-by-step hisson mein taqseem karta hai (maslan Step 1: Material shifting, Step 2: Welding, Step 3: Grinding, Step 4: Housekeeping) aur har step ke samne uska hazard aur control likha jata hai.',
        'PTW (Permit to Work) high-risk kaamon ke liye ek formal written authorization document hai. Bina valid PTW aur LOTO (Lockout/Tagout — energy isolation + Try-out verification) ke koi bhi high-risk maintenance ya confined space kaam shuru nahi ho sakta.',
      ],
      keyTerms: [
        { term: 'Initial Risk vs. Residual Risk', meaning: 'Initial risk is the risk level before additional controls; Residual risk is the remaining risk after controls are applied.' },
        { term: 'JSA / JHA', meaning: 'Job Safety Analysis / Job Hazard Analysis — step-by-step task hazard breakdown reviewed with the crew during the Toolbox Talk.' },
        { term: 'Permit to Work (PTW)', meaning: 'Formal written safety control system authorizing specific high-risk work at a defined location and time window.' },
        { term: 'LOTO (Lockout/Tagout)', meaning: 'Physical isolation of hazardous energy sources using locks and warning tags, verified by a zero-energy try-out test.' },
      ],
      practicalSiteExample:
        'Before repairing a chemical transfer pump: A Cold Work PTW and LOTO Certificate are issued. The electrician locks out the MCC breaker, the operator closes and locks suction/discharge valves, drains trapped line pressure, and the mechanic tries the local start button ("Try Out") to confirm zero energy.',
      criticalSafetyNote:
        'A Permit to Work is an educational concept here; on an actual industrial facility, permits may only be issued and received by personnel formally certified and authorized under that employer’s PTW procedure.',
    },
    visualDiagramType: 'ptw_loto_flow',
    visualCaption: 'Closed-Loop Permit to Work (PTW) & 6-Step LOTO Energy Isolation Lifecycle from Hazard Identification to Permit Closeout.',
    quiz: [
      {
        id: 'q-201-1',
        question: 'What are the 5 standard steps of Risk Assessment according to UK HSE guidance?',
        options: [
          {
            text: '1. Identify hazards, 2. Decide who might be harmed and how, 3. Evaluate risks & decide controls, 4. Record findings, 5. Review and update.',
            isCorrect: true,
          },
          {
            text: '1. Issue PPE, 2. Start work, 3. Write JSA after lunch, 4. Report accident, 5. Close permit.',
            isCorrect: false,
            whyIncorrect: 'Risk assessment must be completed and recorded BEFORE work starts.',
          },
          {
            text: '1. Blame worker, 2. Fine contractor, 3. Stop site, 4. Call police, 5. Rewrite policy.',
            isCorrect: false,
            whyIncorrect: 'This is not a risk assessment process.',
          },
          {
            text: '1. Calculate budget, 2. Order cranes, 3. Sign permit, 4. Paint equipment, 5. Audit.',
            isCorrect: false,
            whyIncorrect: 'These are project logistics, not the 5 steps of risk assessment.',
          },
        ],
        explanation: 'The classic 5-step UK HSE model is the global benchmark expected in technical HSE interviews.',
      },
      {
        id: 'q-201-2',
        question: 'In a 5x5 Risk Matrix, an activity has a Likelihood of 4 (Likely) and a Severity of 5 (Catastrophic/Fatal). What is the risk score and required action?',
        options: [
          {
            text: 'Score = 9 (Medium); proceed with caution.',
            isCorrect: false,
            whyIncorrect: 'Risk score is multiplied (4 × 5 = 20), not added.',
          },
          {
            text: 'Score = 20 (Critical/Intolerable); work MUST NOT start until engineering/isolation controls reduce residual risk to ALARP.',
            isCorrect: true,
          },
          {
            text: 'Score = 20 (Low); only hard hats are required.',
            isCorrect: false,
            whyIncorrect: 'A score of 20 out of 25 is Critical/Extreme risk.',
          },
          {
            text: 'Score = 15; supervisor verbal approval is sufficient.',
            isCorrect: false,
            whyIncorrect: '4 × 5 equals 20, and verbal approval is never acceptable for critical risk.',
          },
        ],
        explanation: 'Likelihood 4 × Severity 5 = 20 (Critical Risk). Work cannot proceed until high-tier controls bring the residual score down.',
      },
      {
        id: 'q-201-3',
        question: 'During a LOTO (Lockout/Tagout) procedure, what is the critical step after applying locks and tags to the isolation points, before workers enter the machine?',
        options: [
          {
            text: 'Give the padlock key to the control room operator for safekeeping.',
            isCorrect: false,
            whyIncorrect: 'Under LOTO, each worker keeps the sole key to their personal padlock ("One Person, One Lock, One Key").',
          },
          {
            text: 'Verify isolation by venting stored residual energy and performing a "Try Out" (attempting to start/test for zero energy).',
            isCorrect: true,
          },
          {
            text: 'Remove the tag so it does not get dirty.',
            isCorrect: false,
            whyIncorrect: 'Tags must remain attached with the lock throughout the isolation.',
          },
          {
            text: 'Wait 5 minutes and start disassembly without testing.',
            isCorrect: false,
            whyIncorrect: 'Never assume a breaker or valve worked without verifying zero energy and bleeding trapped pressure.',
          },
        ],
        explanation: 'Stored energy (capacitors, springs, trapped hydraulic/pipe pressure) and mislabeled switches kill workers unless a Zero-Energy Verification ("Try Out") is performed.',
      },
      {
        id: 'q-201-4',
        question: 'How does a JSA (Job Safety Analysis) differ from a general plant Risk Assessment?',
        options: [
          {
            text: 'A JSA breaks a specific job into sequential task steps, identifying hazards and controls for each individual step with the work crew.',
            isCorrect: true,
          },
          {
            text: 'A JSA is only written after an accident happens.',
            isCorrect: false,
            whyIncorrect: 'A JSA is a pre-job planning tool used before starting work.',
          },
          {
            text: 'A JSA replaces the need for a Permit to Work.',
            isCorrect: false,
            whyIncorrect: 'A JSA accompanies and supports a Permit to Work; it does not replace formal PTW authorization.',
          },
          {
            text: 'A JSA is kept confidential in the HR office.',
            isCorrect: false,
            whyIncorrect: 'The JSA must be communicated to every worker at the jobsite and kept at the work location.',
          },
        ],
        explanation: 'A JSA focuses on step-by-step task execution at the workface and is briefed to the crew during the pre-job Toolbox Talk.',
      },
      {
        id: 'q-201-5',
        question: 'When does a Permit to Work (PTW) immediately become invalid / suspended?',
        options: [
          {
            text: 'When the site emergency alarm sounds, when job scope/conditions change, or when the permit time window expires.',
            isCorrect: true,
          },
          {
            text: 'When the HSE Officer walks to another zone for 10 minutes.',
            isCorrect: false,
            whyIncorrect: 'The Permit Receiver/Supervisor remains at the jobsite; the HSE Officer conducts roving inspections.',
          },
          {
            text: 'Only at the end of the calendar month.',
            isCorrect: false,
            whyIncorrect: 'Permits are typically valid for a single shift (e.g., 8–12 hours) and suspend immediately upon alarm or scope change.',
          },
          {
            text: 'Never, once signed a permit is valid forever.',
            isCorrect: false,
            whyIncorrect: 'Permits are strictly time-bound and condition-bound.',
          },
        ],
        explanation: 'If an emergency alarm sounds or site conditions change (e.g., wind speed exceeds crane limits or gas leak occurs), all permits are suspended immediately.',
      },
    ],
    practicalChallenge: {
      scenarioTitle: 'Shared Padlock Request During Pump Overhaul',
      siteSituation:
        'Three mechanical technicians and one electrician are about to perform maintenance on an electrically driven slurry pump. The mechanical lead says: "Since the electrician already put his padlock on the breaker, us three mechanics don’t need to put our own locks on the group lockbox."',
      promptQuestion: 'How do you respond as the HSE Officer?',
      options: [
        {
          id: 'opt-201-a',
          actionText: 'Stop the job start and enforce "One Person, One Lock, One Key" via a multi-lock hasp or group lockbox so every technician working on the pump applies their own personal padlock before starting.',
          isOptimal: true,
          feedback: 'Correct! If the electrician finishes his test early and removes his single lock while mechanics still have their hands inside the pump housing, the pump could be energized.',
        },
        {
          id: 'opt-201-b',
          actionText: 'Agree with the mechanical lead to save time and padlocks.',
          isOptimal: false,
          feedback: 'Fatal error. Shared locks are one of the leading causes of LOTO fatalities when one trade removes the lock while another trade is still inside the equipment.',
        },
        {
          id: 'opt-201-c',
          actionText: 'Put a paper sticky note on the control switch instead of locks.',
          isOptimal: false,
          feedback: 'Paper notes are not physical energy isolation.',
        },
      ],
    },
    interviewConnection: {
      questions: [
        {
          question: 'What is Residual Risk, and how do you verify that a job is safe to start using a Risk Assessment?',
          modelAnswer:
            'Initial risk is the likelihood multiplied by severity before additional controls are applied. Residual risk is the remaining level of risk after we implement higher-tier controls from the Hierarchy of Controls. Before a job starts, I verify that the residual risk has been reduced to ALARP (As Low As Reasonably Practicable), and that every control measure listed on the paper Risk Assessment and JSA is physically present and functioning at the work location.',
          romanUrduTip:
            'Paper par residual risk kam dikhana kaafi nahi — interview mein bolein ke "I verify on site that the controls written in the JSA are physically in place before signing off."',
        },
      ],
    },
    references: [
      {
        id: 'ref-201-1',
        sourceOrganization: 'UK HSE',
        referenceTitle: 'Guidance on Permit-to-Work Systems (HSG250)',
        officialUrl: 'https://www.hse.gov.uk/pubns/books/hsg250.htm',
        publicationDate: '2005 (Current HSE Guidance)',
        lastReviewedDate: '2026-10-01',
        classification: 'Regulatory Guidance',
        jurisdictionNote: 'Authoritative guidance on PTW design, human factors, and isolation handover in high-hazard industries.',
      },
      {
        id: 'ref-201-2',
        sourceOrganization: 'OSHA',
        referenceTitle: 'Control of Hazardous Energy (Lockout/Tagout) — 29 CFR 1910.147',
        officialUrl: 'https://www.osha.gov/control-hazardous-energy',
        publicationDate: 'Current Standard',
        lastReviewedDate: '2026-10-01',
        classification: 'Regulatory Guidance',
        jurisdictionNote: 'US federal standard widely referenced in international industrial and oil & gas LOTO procedures.',
      },
    ],
  },
  {
    id: 'les-202',
    moduleId: 'mod-p2-highrisk',
    phaseNumber: 2,
    title: '2.2 High-Risk Operations: Working at Height, Confined Space & Excavation',
    estimatedMinutes: 28,
    prerequisiteLessonId: 'les-201',
    isPublished: true,
    understand: {
      heading: 'Critical Life-Saving Controls for WAH, Confined Spaces & Excavations',
      englishExplanation: [
        'WORKING AT HEIGHT (WAH): Commonly defined in international industrial standards as work at 1.8 meters (6 feet) or 2.0 meters where a person could fall and be injured. Controls require: 1. Safe working platforms (inspected scaffolds with Green Scafftag, top rail ~950mm–1100mm, mid-rail, and 150mm toe-board); 2. Full-body harness with shock-absorbing double lanyard (100% tie-off) anchored to a certified structure rated ≥ 22 kN (5,000 lbs); 3. Drop-zone barricading and tool lanyards.',
        'CONFINED SPACE ENTRY (CSE): Any space large enough to enter, with limited entry/exit, and not designed for continuous human occupancy (tanks, vessels, deep manholes, pits). Hazards include Oxygen deficiency (<19.5%) or enrichment (>23.5%), flammable gases (>10% LEL), and toxic gases (H2S, CO). Mandatory controls: CSE Permit, positive mechanical/blind isolation, calibrated multi-gas detector testing BEFORE and continuously during entry, forced ventilation, trained Standby Man (Hole Watcher) at the entrance with entry log, and a verified non-entry rescue plan.',
        'EXCAVATION SAFETY: Trenches ≥ 1.2 meters (4 feet) require safe access/egress ladders within 7.5 meters (25 feet) of lateral travel, atmospheric testing if ≥ 1.2m deep where hazardous atmosphere may exist, and cave-in protection at ≥ 1.5m (5 feet) via Sloping, Benching, or Trench Shoring/Shielding. Spoil piles must be kept at least 1.0 meter back from the trench edge, and underground utilities (electric, gas, water) must be scanned using CAT & Genny / cable locator before digging.',
      ],
      romanUrduExplanation: [
        'WORKING AT HEIGHT: Industrial sites par aam taur par 1.8 meter (6 feet) ya is se upar kaam ko Working at Height maana jata hai. Scaffold par Green Tag hona chahiye (inspected by competent scaffolding inspector), Top-rail, Mid-rail aur Toe-board mukammal hon, aur worker Full Body Harness + Double Lanyard (100% tie-off) ke sath strong anchor point par hook kare.',
        'CONFINED SPACE: Tanks, vessels, ya manholes jahan rasta tang ho aur oxygen ki kami (<19.5% O2) ya zehreele gases (H2S, CO, LEL) ka khatra ho. Andar jane se pehle Gas Testing (O2: 19.5%–23.5%), LOTO/Blinding, Ventilation, bahar trained Hole Watcher / Standby Man, aur Rescue Plan hona laazmi hai.',
        'EXCAVATION (Khudai): Khudai se pehle underground cables/pipes check karein (Scanning + Trial pit). Trench ki mitti (Spoil pile) kinare se kam از kam 1 meter door rakhein, aur cave-in (mitti girne) ko rokne ke liye Shoring, Sloping, ya Benching lagayein.',
      ],
      keyTerms: [
        { term: '100% Tie-Off', meaning: 'Using a double-legged lanyard so at least one hook remains anchored at all times while moving at height.' },
        { term: 'Safe Oxygen Range', meaning: '19.5% minimum to 23.5% maximum oxygen concentration by volume inside a confined space.' },
        { term: 'LEL (Lower Explosive Limit)', meaning: 'Minimum concentration of a flammable gas in air capable of igniting; entry typically prohibited if LEL ≥ 10% (0% for Hot Work).' },
        { term: 'Shoring / Sloping / Benching', meaning: 'Engineering protective systems used to prevent trench wall collapse (cave-in) during excavations.' },
      ],
      practicalSiteExample:
        'Before a crew enters a 4-meter deep storm drain chamber: The Authorized Gas Tester samples the atmosphere at top, middle, and bottom layers (because H2S is heavier than air and settles at the bottom, while methane rises). Readings show 20.9% O2, 0% LEL, 0 ppm H2S, 0 ppm CO. A tripod winch and full-body rescue harness are rigged before entry.',
      criticalSafetyNote:
        'Over 60% of confined space fatalities involve would-be rescuers who rush in without breathing apparatus (SCBA) or a rescue winch. Never enter a confined space to attempt an unplanned rescue without SCBA and backup.',
    },
    visualDiagramType: 'confined_space_entry',
    visualCaption: 'Stratified Multi-Gas Testing (Top: Methane/Lighter Gases, Middle: CO/Oxygen, Bottom: H2S/Heavier Gases) & Mandatory Confined Space Entry Setup.',
    quiz: [
      {
        id: 'q-202-1',
        question: 'What is the acceptable safe Oxygen (O2) concentration range for entry into a Confined Space without supplied breathing apparatus?',
        options: [
          {
            text: '16.0% to 25.0%',
            isCorrect: false,
            whyIncorrect: '16% O2 causes impaired judgment and hypoxia; 25% O2 creates an extreme fire/explosion hazard.',
          },
          {
            text: '19.5% to 23.5%',
            isCorrect: true,
          },
          {
            text: '10.0% to 19.5%',
            isCorrect: false,
            whyIncorrect: 'Below 19.5% is an oxygen-deficient atmosphere.',
          },
          {
            text: '23.5% to 30.0%',
            isCorrect: false,
            whyIncorrect: 'Above 23.5% is an oxygen-enriched atmosphere where clothing and oil ignite violently.',
          },
        ],
        explanation: 'International standards (OSHA 1910.146 / industrial PTW rules) define 19.5% to 23.5% as the safe oxygen range.',
      },
      {
        id: 'q-202-2',
        question: 'Why must an Authorized Gas Tester measure the atmosphere at the TOP, MIDDLE, and BOTTOM of a deep vessel or pit?',
        options: [
          {
            text: 'Because different gases stratify by vapour density: Methane is lighter than air (rises), CO is similar to air (middle), and H2S is heavier than air (settles at the bottom).',
            isCorrect: true,
          },
          {
            text: 'To drain the battery of the gas detector before charging.',
            isCorrect: false,
            whyIncorrect: 'Stratified testing is for worker survival against gas layering, not battery draining.',
          },
          {
            text: 'Because oxygen only exists at the very top of a tank.',
            isCorrect: false,
            whyIncorrect: 'Hazardous gases displace oxygen at different depths depending on their relative density.',
          },
          {
            text: 'It is not required; testing outside the manhole cover is enough.',
            isCorrect: false,
            whyIncorrect: 'Testing only at the opening misses lethal pockets of H2S or Argon pooled at the bottom.',
          },
        ],
        explanation: 'Gases do not mix uniformly in stagnant spaces. H2S (specific gravity ~1.19) sinks to the bottom, whereas Methane (0.55) rises to the top.',
      },
      {
        id: 'q-202-3',
        question: 'If a worker inside a confined space suddenly collapses, what must the Standby Attendant (Hole Watcher) do FIRST?',
        options: [
          {
            text: 'Immediately jump inside the confined space holding their breath to pull the worker out.',
            isCorrect: false,
            whyIncorrect: 'Entering an unverified toxic/oxygen-deficient space without SCBA kills the attendant too.',
          },
          {
            text: 'Remain outside at the entry point, raise the emergency alarm immediately, call the dedicated rescue team, and use the external tripod winch retrieval line if safe non-entry rescue is rigged.',
            isCorrect: true,
          },
          {
            text: 'Leave the area to go find the site manager’s office.',
            isCorrect: false,
            whyIncorrect: 'The attendant must never abandon the entry point and must summon help via radio/alarm.',
          },
          {
            text: 'Close the manhole cover.',
            isCorrect: false,
            whyIncorrect: 'Closing the cover traps the entrant and prevents ventilation/rescue.',
          },
        ],
        explanation: 'The Standby Man must NEVER enter the confined space. They trigger the alarm and execute non-entry retrieval via the lifeline/tripod while SCBA rescue responds.',
      },
      {
        id: 'q-202-4',
        question: 'During an excavation inspection, how far back from the edge of the trench should excavated soil (spoil pile) and heavy materials be kept as a minimum rule of thumb?',
        options: [
          {
            text: 'Right on the edge so backfilling is faster.',
            isCorrect: false,
            whyIncorrect: 'Surcharge load on the edge triggers trench wall collapse and rocks falling onto workers.',
          },
          {
            text: 'At least 1.0 meter (or ≥ 2 feet / depth-dependent engineering distance) back from the trench edge.',
            isCorrect: true,
          },
          {
            text: '10 centimeters from the edge.',
            isCorrect: false,
            whyIncorrect: '10 cm offers no protection against soil roll-back or surcharge collapse.',
          },
          {
            text: 'Inside the trench.',
            isCorrect: false,
            whyIncorrect: 'Spoil must be cleared from the excavation work zone.',
          },
        ],
        explanation: 'Keeping spoil piles at least 1 meter (and minimum 2 ft per OSHA) away prevents surcharge loading on the trench wall and stops rocks rolling onto workers below.',
      },
      {
        id: 'q-202-5',
        question: 'What does a RED Scafftag on a scaffold structure signify?',
        options: [
          {
            text: 'Scaffold is safe for all trades to use.',
            isCorrect: false,
            whyIncorrect: 'A GREEN tag indicates the scaffold is inspected and safe for use.',
          },
          {
            text: 'DO NOT USE — Scaffold is incomplete, under erection/dismantling, or failed inspection.',
            isCorrect: true,
          },
          {
            text: 'Scaffold is reserved for fire-fighting equipment only.',
            isCorrect: false,
            whyIncorrect: 'Red Scafftags strictly mean Do Not Use.',
          },
          {
            text: 'Scaffold is approved for heavy crane loads.',
            isCorrect: false,
            whyIncorrect: 'Red tag prohibits access by general personnel.',
          },
        ],
        explanation: 'A Red Scafftag means "Do Not Use" (only certified scaffolders erecting or dismantling it under full fall arrest may access). Green means inspected and safe.',
      },
    ],
    practicalChallenge: {
      scenarioTitle: 'Unshored 2.5m Deep Pipe Trench Near Roadway',
      siteSituation:
        'You arrive at an excavation where workers are laying pipe at the bottom of a vertical-walled 2.5-meter deep trench. There is no shoring or sloping, excavated soil is piled 20cm from the edge, and heavy dump trucks are driving past 2 meters away causing ground vibration.',
      promptQuestion: 'What is your immediate priority action?',
      options: [
        {
          id: 'opt-202-a',
          actionText: 'Exercise Stop Work Authority: instruct all workers to exit the trench immediately via ladder, barricade the zone, move the spoil pile back ≥ 1m, halt adjacent truck traffic, and require engineered trench shoring/sloping before re-entry.',
          isOptimal: true,
          feedback: 'Critical life-saving intervention! One cubic meter of soil weighs over 1.5 tonnes; vibration + surcharge load on a 2.5m vertical trench can cause an instant fatal cave-in.',
        },
        {
          id: 'opt-202-b',
          actionText: 'Tell the workers inside the trench to make sure their chin-straps are fastened on their hard hats.',
          isOptimal: false,
          feedback: 'A plastic hard hat cannot protect a worker buried under tonnes of collapsing earth.',
        },
        {
          id: 'opt-202-c',
          actionText: 'Take a photo for your weekly report and let them finish the last 2 hours of pipe laying.',
          isOptimal: false,
          feedback: 'Never walk past an imminent life-threatening cave-in hazard without getting workers out of the trench immediately.',
        },
      ],
    },
    interviewConnection: {
      questions: [
        {
          question: 'An interviewer asks: "What are the main hazards and precautions for Confined Space Entry?"',
          modelAnswer:
            'The primary hazards in a confined space are toxic atmospheres (such as H2S or CO), oxygen deficiency (<19.5%) or enrichment (>23.5%), flammable atmospheres (>10% LEL), engulfment, mechanical entanglement, and restricted rescue access. Precautions include obtaining a Confined Space Entry Permit, positive isolation (LOTO and line blinding), calibrated gas testing at top, middle, and bottom before entry and continuous monitoring, mechanical ventilation, posting a trained Standby Man at the entrance with an entry log, Intrinsically Safe (24V) lighting, and having a pre-rigged tripod/winch and emergency rescue plan.',
          romanUrduTip:
            'Is jawab mein numbers zaroor bolein: Oxygen 19.5% se 23.5%, LEL < 10% (0% for Hot Work), aur Low Voltage lighting 24V.',
        },
      ],
    },
    references: [
      {
        id: 'ref-202-1',
        sourceOrganization: 'OSHA',
        referenceTitle: 'Permit-Required Confined Spaces (29 CFR 1910.146) & Trenching and Excavation Safety (29 CFR 1926 Subpart P)',
        officialUrl: 'https://www.osha.gov/trenching-excavation',
        publicationDate: 'Current Standards',
        lastReviewedDate: '2026-10-01',
        classification: 'Regulatory Guidance',
        jurisdictionNote: 'Benchmark technical parameters for atmospheric limits and excavation protective systems.',
      },
      {
        id: 'ref-202-2',
        sourceOrganization: 'UK HSE',
        referenceTitle: 'Health and Safety in Roof Work & Working at Height (HSG33 / INDG401)',
        officialUrl: 'https://www.hse.gov.uk/work-at-height/index.htm',
        publicationDate: 'Current Guidance',
        lastReviewedDate: '2026-10-01',
        classification: 'Regulatory Guidance',
        jurisdictionNote: 'Hierarchy of work at height: Avoid → Prevent (Collective Guardrails) → Mitigate (Personal Fall Arrest).',
      },
    ],
  },
  {
    id: 'les-301',
    moduleId: 'mod-p3-site-skills',
    phaseNumber: 3,
    title: '3.1 Toolbox Talks, Workplace Inspections & Root-Cause Investigation (CAPA)',
    estimatedMinutes: 22,
    prerequisiteLessonId: 'les-202',
    isPublished: true,
    understand: {
      heading: 'Executing Daily Field Duties: TBT, Inspections, 5-Whys & CAPA',
      englishExplanation: [
        'TOOLBOX TALK (TBT): A short, focused 5–10 minute pre-shift safety briefing held right at the work area before tasks begin. A great TBT focuses on TODAY’S specific task hazards, reviews key JSA controls, checks worker fitness and PPE, and asks open questions so workers actively participate.',
        'INCIDENT INVESTIGATION: The goal of investigating an incident is ALWAYS to find the Root Cause and prevent recurrence—NEVER to assign blame. Investigations distinguish between Immediate Causes (Unsafe Acts like bypassing a guard, and Unsafe Conditions like an oil slick) and Root Causes (underlying management system failures, such as inadequate training, missing preventive maintenance, or unrealistic schedule pressure).',
        'CORRECTIVE vs. PREVENTIVE ACTION (CAPA): A Corrective Action fixes an existing non-conformity or cause of an incident that already happened so it does not recur. A Preventive Action eliminates the cause of a potential non-conformity before any incident occurs.',
      ],
      romanUrduExplanation: [
        'TOOLBOX TALK (TBT) har subah kaam shuru hone se pehle 5 se 10 minute ki mukhtasir safety meeting hoti hai. Is mein aaj ke kaam ke hazards, JSA points, emergency assembly point, aur PPE check kiya jata hai. Workers se sawal pooch kar unko shamil karein.',
        'INCIDENT INVESTIGATION ka maqsad kisi worker ko saza dena nahi balki Root Cause (asal bunyadi wajah) dhoondna hai taake dobara haadsa na ho. Immediate Cause mein Unsafe Act (ghalat amal) aur Unsafe Condition (khatarnaak halat) aate hain, jabke Root Cause mein system ki kami (training na hona, maintenance na hona) aati hai.',
        'CAPA (Corrective and Preventive Action) mein SMART actions likhe jaate hain: kis ne karna hai, kab tak karna hai, aur kaise verify hoga.',
      ],
      keyTerms: [
        { term: 'Unsafe Act vs. Unsafe Condition', meaning: 'Immediate triggers of an incident: human behavior (act) vs. physical environment/equipment state (condition).' },
        { term: 'Root Cause (5 Whys)', meaning: 'The fundamental systemic failure that allowed the unsafe condition or act to exist; uncovered by asking "Why?" 5 times.' },
        { term: 'CAPA', meaning: 'Corrective and Preventive Actions assigned with clear ownership and target completion dates.' },
        { term: 'Toolbox Talk (TBT)', meaning: 'Short, job-specific pre-start safety briefing conducted with the work crew at the jobsite.' },
      ],
      practicalSiteExample:
        'An electrician suffers a flash burn because he used an uninsulated screwdriver (Unsafe Act) on a live panel (Unsafe Condition). Asking "Why?" reveals the LOTO padlock station was empty and the supervisor pressured him to finish during lunch without isolating power (Root Causes).',
      criticalSafetyNote:
        'During an actual workplace emergency or injury, Step 1 is ALWAYS scene safety and medical rescue/first aid, followed by securing the scene and notifying supervision—paperwork comes after people are safe.',
    },
    visualDiagramType: 'incident_swiss_cheese',
    visualCaption: 'James Reason’s Swiss Cheese Barrier Model & 5-Whys Root Cause Progression from Latent System Failures to Immediate Triggers.',
    quiz: [
      {
        id: 'q-301-1',
        question: 'When an injury accident occurs on site, what is the HSE Officer’s FIRST priority?',
        options: [
          {
            text: 'Ensure the scene is safe to approach, summon First Aid / Emergency Medical Services, and care for the injured worker.',
            isCorrect: true,
          },
          {
            text: 'Interrogate witnesses and write a 10-page report before calling the medic.',
            isCorrect: false,
            whyIncorrect: 'Life preservation and medical response always come before investigation paperwork.',
          },
          {
            text: 'Clean up all evidence immediately so nobody sees the accident.',
            isCorrect: false,
            whyIncorrect: 'Cleaning up before securing the scene destroys vital investigation evidence.',
          },
          {
            text: 'Post photos of the injured worker on social media.',
            isCorrect: false,
            whyIncorrect: 'Strict breach of professional ethics, privacy, and company policy.',
          },
        ],
        explanation: 'Emergency response priority is always: 1. Scene safety & rescue/medical aid, 2. Secure & barricade the scene, 3. Notify management, 4. Preserve evidence & investigate.',
      },
      {
        id: 'q-301-2',
        question: 'Which of the following is an UNSAFE CONDITION rather than an Unsafe Act?',
        options: [
          {
            text: 'A worker removing their safety glasses while grinding.',
            isCorrect: false,
            whyIncorrect: 'Removing PPE during a task is an Unsafe Act (behavior).',
          },
          {
            text: 'A damaged electrical extension cable with exposed copper conductors lying in a puddle of water.',
            isCorrect: true,
          },
          {
            text: 'A forklift driver speeding at 35 km/h inside a warehouse.',
            isCorrect: false,
            whyIncorrect: 'Speeding is an Unsafe Act.',
          },
          {
            text: 'Bypassing a machine safety interlock switch.',
            isCorrect: false,
            whyIncorrect: 'Defeating a safety device is an Unsafe Act.',
          },
        ],
        explanation: 'A damaged cable in standing water is a physical environmental/equipment hazard state (Unsafe Condition).',
      },
      {
        id: 'q-301-3',
        question: 'What is the primary purpose of conducting an Incident Investigation?',
        options: [
          {
            text: 'To identify the immediate and root causes so effective corrective actions can prevent recurrence.',
            isCorrect: true,
          },
          {
            text: 'To find a worker to blame and deduct their salary.',
            isCorrect: false,
            whyIncorrect: 'Blame-focused investigations fail to fix systemic root causes.',
          },
          {
            text: 'To satisfy insurance lawyers only.',
            isCorrect: false,
            whyIncorrect: 'While records matter, the primary safety purpose is preventing repeat accidents.',
          },
          {
            text: 'To delay project construction.',
            isCorrect: false,
            whyIncorrect: 'Investigations make operations safer and more reliable.',
          },
        ],
        explanation: 'Root-cause investigation fixes the underlying management system gaps so the next worker is not hurt in the same way.',
      },
      {
        id: 'q-301-4',
        question: 'What makes a daily Toolbox Talk (TBT) truly effective on site?',
        options: [
          {
            text: 'Reading a 45-minute legal textbook in complex English that workers do not understand.',
            isCorrect: false,
            whyIncorrect: 'Long, monotone lectures lose worker attention and fail to communicate critical risks.',
          },
          {
            text: 'Keeping it focused (5–10 mins) on today’s exact job hazards, using simple language workers understand, and asking two-way questions.',
            isCorrect: true,
          },
          {
            text: 'Having workers sign the attendance sheet without holding any discussion.',
            isCorrect: false,
            whyIncorrect: '"Paper-only" pencil-whipped TBTs are a major compliance violation and leave crews uninformed.',
          },
          {
            text: 'Holding it at the end of the shift after work is finished.',
            isCorrect: false,
            whyIncorrect: 'A pre-start TBT must happen BEFORE workers face the day’s hazards.',
          },
        ],
        explanation: 'Short, interactive, task-specific briefings in a language the crew understands build real hazard awareness.',
      },
      {
        id: 'q-301-5',
        question: 'In the 5-Whys technique, if a worker slipped on oil, and the oil leaked from a broken gasket, and the gasket was not replaced because there is no Preventive Maintenance schedule, what is the Root Cause?',
        options: [
          {
            text: 'Lack of a Preventive Maintenance (PM) system for hydraulic seals.',
            isCorrect: true,
          },
          {
            text: 'Gravity pulling the worker down.',
            isCorrect: false,
            whyIncorrect: 'Gravity is a physical constant, not a management root cause.',
          },
          {
            text: 'The worker walking in the aisle.',
            isCorrect: false,
            whyIncorrect: 'Walking in a designated walkway is normal work; the systemic gap is the missing PM program.',
          },
          {
            text: 'The floor being made of concrete.',
            isCorrect: false,
            whyIncorrect: 'The systemic failure is the absence of scheduled maintenance.',
          },
        ],
        explanation: 'Root causes lie in management systems (e.g., missing preventive maintenance, procurement, or training programs) that allowed the physical defect to occur.',
      },
    ],
    practicalChallenge: {
      scenarioTitle: 'Supervisor Refuses to Stop Unsafe Lifting Operation',
      siteSituation:
        'A mobile crane is about to lift a 12-tonne steel module. You notice one outrigger pad is sinking into soft ground and the taglines are missing. The construction supervisor yells: "We are behind schedule! Don’t stop my crane or I will complain to the Project Manager!"',
      promptQuestion: 'How do you handle this situation professionally and safely?',
      options: [
        {
          id: 'opt-301-a',
          actionText: 'Remain calm and respectful, firmly exercise Stop Work Authority to hold the lift, explain the immediate crane overturning physics (sinking outrigger shifts center of gravity), call the Lifting Supervisor/Rigging Foreman to re-crib the outrigger on steel mats and attach taglines, and escalate through the HSE Manager if the supervisor refuses.',
          isOptimal: true,
          feedback: 'Exemplary professional conduct! You stood firm on life-critical safety, explained the technical "why" without arguing personally, and offered the solution to resume safely.',
        },
        {
          id: 'opt-301-b',
          actionText: 'Back down and let the crane lift with a sinking outrigger because the supervisor is angry.',
          isOptimal: false,
          feedback: 'Never compromise on a sinking crane outrigger—crane tip-overs cause catastrophic multi-fatality accidents.',
        },
        {
          id: 'opt-301-c',
          actionText: 'Shout insults back at the supervisor in front of the crew.',
          isOptimal: false,
          feedback: 'Losing your temper undermines your professional authority. Stay calm, factual, and resolute.',
        },
      ],
    },
    interviewConnection: {
      questions: [
        {
          question: 'What would you do if a site supervisor ignores your safety advice and continues an unsafe activity?',
          modelAnswer:
            'First, if there is imminent danger to life, I calmly and firmly exercise Stop Work Authority with the crew and supervisor. Second, I focus on the technical hazard rather than personal conflict—I explain the specific risk and show how we can fix the control quickly so the job can continue safely. Third, if the supervisor still refuses to comply on a high-risk issue, I keep the task paused, document the observation, and immediately escalate to the Senior Construction Manager and HSE Manager as per site escalation protocol.',
          romanUrduTip:
            'Yeh har HSE interview ka top favorite Situational question hai! Hamesha 3 steps bolein: 1. Calmly Stop Imminent Danger + Explain Solution, 2. Help fix the control, 3. Escalate to HSE Manager/Project Management if refusal continues.',
        },
      ],
    },
    references: [
      {
        id: 'ref-301-1',
        sourceOrganization: 'UK HSE',
        referenceTitle: 'Investigating Accidents and Incidents — A Workbook for Employers, Unions, Safety Representatives and Safety Professionals (HSG245)',
        officialUrl: 'https://www.hse.gov.uk/pubns/books/hsg245.htm',
        publicationDate: '2004 (Reissued)',
        lastReviewedDate: '2026-10-01',
        classification: 'Regulatory Guidance',
        jurisdictionNote: 'Standard methodology for immediate, underlying, and root cause investigation.',
      },
    ],
  },
  {
    id: 'les-401',
    moduleId: 'mod-p4-interview',
    phaseNumber: 4,
    title: '4.1 Mastering the HSE Interview: STAR Method, Self-Introduction & Gulf Standards',
    estimatedMinutes: 20,
    prerequisiteLessonId: 'les-301',
    isPublished: true,
    understand: {
      heading: 'How to Present Yourself Like a Site-Ready HSE Professional',
      englishExplanation: [
        'Interview panels for HSE Officer roles evaluate two things simultaneously: your TECHNICAL ACCURACY (do you know PTW, WAH, Confined Space, LOTO, Risk Matrix?) and your COMMUNICATION PRESENCE (can you speak clearly to engineers, supervisors, and workers under pressure?).',
        'A winning 60-second Professional Self-Introduction follows 4 parts: 1. Your qualification & core HSE training; 2. Your mastery of practical safety systems (Risk Assessment, JSA, PTW, Inspections, TBT); 3. Your field approach (collaborative, proactive, solutions-oriented); 4. Why you are excited to protect their specific project.',
        'For situational and scenario questions ("Tell me about a time..." or "What would you do if..."), use the STAR Framework: SITUATION (set the scene), TASK (what needed to be controlled), ACTION (the exact Hierarchy of Controls, PTW, and communication steps YOU took), and RESULT (safe completion, zero injury, positive lesson learned).',
      ],
      romanUrduExplanation: [
        'Interview panel aap mein do cheezein dekhta hai: 1. Technical Knowledge (PTW, Gas Testing, WAH, LOTO ke exact numbers aur steps) aur 2. Communication Confidence (kya aap site par supervisor aur workers ko samjha sakte hain?).',
        'Apna "Tell me about yourself" 60 seconds mein 4 parts mein rakhein: Qualification → Core HSE Skills (JSA, PTW, Risk Assessment, TBT) → Practical Approach → Target Role focus.',
        'Scenario sawalon ke liye STAR formula lagayein: Situation, Task, Action (sab se important: aap ne kaunse controls lagaye), aur Result.',
      ],
      keyTerms: [
        { term: 'STAR Method', meaning: 'Situation, Task, Action, Result — structured storytelling method for behavioral and situational interview answers.' },
        { term: 'Proactive vs. Reactive Indicators', meaning: 'Leading indicators (TBTs, inspections, near-miss closures) vs. Lagging indicators (LTIs, first-aid cases).' },
        { term: 'Client Approval Interview', meaning: 'Technical panel interview conducted by major project clients (e.g., EPC / Gulf energy operators) to approve contractor HSE Officers.' },
      ],
      practicalSiteExample:
        'When asked "Why should we hire you if you are a newcomer?", answer: "While I am early in my career, I have rigorously practiced writing JSAs, 5x5 Risk Assessments, PTW verifications, and hazard inspections. I am energetic, spend 90% of my shift on the site floor rather than in the office cabin, and strictly follow site procedures."',
      criticalSafetyNote:
        'Never invent fake work experience or fake certificates in an interview. Technical interviewers test claim authenticity within 30 seconds by asking detailed follow-up questions.',
    },
    visualDiagramType: 'interview_star_framework',
    visualCaption: 'The 4-Stage STAR Answer Architecture (Situation → Task → Technical Action → Measurable Safety Result) for High-Scoring Panel Responses.',
    quiz: [
      {
        id: 'q-401-1',
        question: 'What does the "A" in the STAR interview method stand for, and how much of your answer should it represent?',
        options: [
          {
            text: 'Accident — describing blood and injuries in detail.',
            isCorrect: false,
            whyIncorrect: 'Interviewers want to hear your risk control actions, not graphic accident descriptions.',
          },
          {
            text: 'Action — the specific technical controls, verification steps, and communication actions YOU took (should be ~50-60% of your answer).',
            isCorrect: true,
          },
          {
            text: 'Argument — how you argued with the project manager.',
            isCorrect: false,
            whyIncorrect: 'Professional collaboration, not confrontation, is expected.',
          },
          {
            text: 'Assumption — guessing what the rule might be.',
            isCorrect: false,
            whyIncorrect: 'Never guess safety rules.',
          },
        ],
        explanation: 'The Action segment demonstrates your operational competence as an HSE Officer.',
      },
      {
        id: 'q-401-2',
        question: 'Which of the following is a LEADING (Proactive) safety performance indicator rather than a Lagging indicator?',
        options: [
          {
            text: 'Number of Lost Time Injuries (LTIs) last year.',
            isCorrect: false,
            whyIncorrect: 'LTIs measure past failures after people have already been hurt (Lagging).',
          },
          {
            text: 'Percentage of scheduled weekly safety inspections completed and Corrective Actions closed on time.',
            isCorrect: true,
          },
          {
            text: 'Total Fatal Accident Rate (FAR).',
            isCorrect: false,
            whyIncorrect: 'Fatalities are a lagging outcome metric.',
          },
          {
            text: 'Medical Treatment Cases (MTC).',
            isCorrect: false,
            whyIncorrect: 'Medical cases are lagging injury metrics.',
          },
        ],
        explanation: 'Leading indicators measure preventive activities (inspections, audits, TBTs, near-miss reporting) that prevent future incidents.',
      },
      {
        id: 'q-401-3',
        question: 'How should a newcomer HSE Officer candidate answer if they do not know a specific local statutory regulation clause during an interview?',
        options: [
          {
            text: 'Make up a fake regulation number confidently.',
            isCorrect: false,
            whyIncorrect: 'Fabricating laws immediately disqualifies a candidate for lack of integrity.',
          },
          {
            text: 'State the internationally recognized safety principle (e.g., ILO / ISO 45001 / Hierarchy of Controls) and explain that they will verify the exact local statutory clause and employer HSE plan.',
            isCorrect: true,
          },
          {
            text: 'Stay completely silent for 2 minutes.',
            isCorrect: false,
            whyIncorrect: 'Always articulate the sound engineering/safety control principle and commitment to verify the specific statute.',
          },
          {
            text: 'Tell the interviewer that laws do not matter on construction sites.',
            isCorrect: false,
            whyIncorrect: 'Legal compliance is non-negotiable.',
          },
        ],
        explanation: 'Honesty paired with strong technical safety principles and verification discipline wins panel trust.',
      },
      {
        id: 'q-401-4',
        question: 'In a Gulf / international EPC contractor interview, when asked about Hot Work inside an operating hydrocarbon plant, what LEL reading is required before striking an arc?',
        options: [
          {
            text: '0% LEL (Zero flammable gas detected) verified by a calibrated gas detector.',
            isCorrect: true,
          },
          {
            text: '25% LEL is acceptable for welding.',
            isCorrect: false,
            whyIncorrect: 'Any detectable flammable gas (>0% LEL) during open-flame Hot Work risks catastrophic explosion.',
          },
          {
            text: '50% LEL.',
            isCorrect: false,
            whyIncorrect: 'Extremely explosive.',
          },
          {
            text: 'Gas testing is not needed if a fire extinguisher is nearby.',
            isCorrect: false,
            whyIncorrect: 'A fire extinguisher cannot stop a vapour cloud explosion.',
          },
        ],
        explanation: 'Hot work in hydrocarbon or potentially flammable zones requires 0% LEL, sealed drains/sewers within 15m, fire habitat/blankets, and a dedicated Fire Watcher.',
      },
      {
        id: 'q-401-5',
        question: 'How long must a dedicated Fire Watcher remain at the hot work location AFTER welding or cutting finishes?',
        options: [
          {
            text: 'They can leave 5 minutes before the welder finishes.',
            isCorrect: false,
            whyIncorrect: 'Smoldering slag frequently ignites fires after the welder packs up.',
          },
          {
            text: 'At least 30 to 60 minutes after hot work ceases (per NFPA 51B / site procedure) to monitor for smoldering sparks.',
            isCorrect: true,
          },
          {
            text: 'Zero minutes.',
            isCorrect: false,
            whyIncorrect: 'Post-work fire watch is mandatory.',
          },
          {
            text: 'Only if smoke is visible.',
            isCorrect: false,
            whyIncorrect: 'Hidden sparks inside insulation or crevices can smolder unseen for 30+ minutes.',
          },
        ],
        explanation: 'NFPA 51B and industrial hot work procedures require a continuous post-work fire watch of at least 30–60 minutes.',
      },
    ],
    practicalChallenge: {
      scenarioTitle: 'Live Panel Question: Simultaneous Operations (SIMOPS)',
      siteSituation:
        'During your mock interview, the panel asks: "On your site, a painting crew using flammable solvent thinners wants to work directly underneath a structural welding crew working at 8 meters height. Both supervisors have brought permits to you. What do you do?"',
      promptQuestion: 'Select the best technical response to give the interview panel:',
      options: [
        {
          id: 'opt-401-a',
          actionText: 'Identify this as a critical SIMOPS (Simultaneous Operations) conflict: welding sparks falling onto flammable solvent vapors will cause a fire/explosion and dropped objects hazard. Refuse concurrent execution—separate the tasks by time (schedule painting on night shift or after welding completes) or physical isolation.',
          isOptimal: true,
          feedback: 'Outstanding! Recognizing SIMOPS (Hot Work overhead + Flammable solvent work below) is a hallmark of a sharp, site-ready HSE Officer.',
        },
        {
          id: 'opt-401-b',
          actionText: 'Sign both permits at the same time and tell the painters to hold an umbrella over their paint buckets.',
          isOptimal: false,
          feedback: 'Never authorize conflicting Hot Work and flammable solvent work in the same vertical drop zone.',
        },
        {
          id: 'opt-401-c',
          actionText: 'Cancel both jobs permanently for the rest of the year.',
          isOptimal: false,
          feedback: 'Good HSE Officers enable safe construction by sequencing tasks safely rather than blocking progress indefinitely.',
        },
      ],
    },
    interviewConnection: {
      questions: [
        {
          question: 'Introduce yourself as an HSE Officer candidate.',
          modelAnswer:
            'Good morning. I am a dedicated HSE Officer candidate trained in international occupational safety principles including ISO 45001, Risk Assessment, Job Safety Analysis, and Permit to Work systems. I have hands-on practice in identifying workplace hazards across Working at Height, Confined Space Entry, Excavations, Lifting, and Hot Work, as well as conducting Toolbox Talks and root-cause incident investigations. My approach on site is proactive and field-focused—working closely with supervisors and crews to ensure practical engineering and administrative controls are in place so every worker returns home safely while keeping project operations running smoothly.',
          romanUrduTip:
            'Apni introduction calm aur clear voice mein dein — "proactive and field-focused" alfaaz zaroor shamil karein.',
        },
      ],
    },
    references: [
      {
        id: 'ref-401-1',
        sourceOrganization: 'NFPA',
        referenceTitle: 'NFPA 51B: Standard for Fire Prevention During Welding, Cutting, and Other Hot Work',
        officialUrl: 'https://www.nfpa.org/codes-and-standards/nfpa-51b-standard-development/51b',
        publicationDate: '2024 Edition',
        lastReviewedDate: '2026-10-01',
        classification: 'International Standard',
        jurisdictionNote: 'Defines the 11-meter (35-foot) Rule for clearing/covering combustibles and mandatory post-work fire watch.',
      },
    ],
  },
  {
    id: 'les-501',
    moduleId: 'mod-p5-final',
    phaseNumber: 5,
    title: '5.1 Final Capstone Assessment: Integrated Site Safety & Emergency Leadership',
    estimatedMinutes: 30,
    prerequisiteLessonId: 'les-401',
    isPublished: true,
    understand: {
      heading: 'Synthesizing Technical Knowledge, Documentation & Emergency Command',
      englishExplanation: [
        'As a site-ready HSE Officer, you must integrate all pillars simultaneously: verifying Permits to Work, auditing critical controls (LOTO, Gas Tests, Lifting Plans, Scafftags, Excavation Shoring), coaching workers respectfully, and maintaining calm command during emergencies.',
        'In a site emergency (fire, toxic gas release, structural failure, or medical trauma): 1. Raise the alarm immediately; 2. Suspend all Permits to Work and shut down plant/ignition sources; 3. Guide personnel cross-wind/up-wind (for gas release) to the designated Emergency Assembly Point; 4. Conduct roll-call headcount; 5. Never re-enter until the Incident Commander declares "All Clear".',
      ],
      romanUrduExplanation: [
        'Final Phase mein aap apni mukammal tayyari sabit karte hain: PTW verification, LOTO, Gas Testing, Crane Lift Plan check, aur Emergency Response.',
        'Agar site par H2S ya toxic gas leak alarm baje to hamesha Hawa ke Rukh ke Khilaf (Up-wind / Cross-wind) chalte hue Assembly Point par jayein, tamam Permits suspend ho jaate hain, aur jab tak "All Clear" announce na ho wapas site mein dakhil na hon.',
      ],
      keyTerms: [
        { term: 'SIMOPS', meaning: 'Simultaneous Operations — two or more adjacent activities whose hazards could interact dangerously (e.g., radiography + normal construction, or hot work + fuel transfer).' },
        { term: 'Up-Wind / Cross-Wind Evacuation', meaning: 'Moving perpendicular to or against the wind direction (checked via windsock) during a toxic gas or smoke release.' },
        { term: ' crane Lift Plan & Safe Working Load (SWL)', meaning: 'Verified calculation of crane radius, boom length, load weight, rigging gear SWL, and ground bearing capacity.' },
      ],
      practicalSiteExample:
        'During a 25-tonne heat exchanger lift, the anemometer on the crane boom reads wind speeds of 38 km/h (above the 32 km/h / ~20 mph site limit). The HSE Officer works with the Lifting Supervisor to hold the lift and ground the load safely until wind speeds subside.',
      criticalSafetyNote:
        'Completing this capstone demonstrates strong educational mastery in HSE FieldReady. Actual site authorization always requires employer induction, site-specific competency verification, and supervisory sign-off.',
    },
    visualDiagramType: 'working_at_height_scaffold',
    visualCaption: 'Comprehensive Site Inspection Audit Matrix: Scaffold Tagging, Crane Outrigger Matting, Wind Speed Limits & Emergency Windsock Orientation.',
    quiz: [
      {
        id: 'q-501-1',
        question: 'If an H2S toxic gas alarm activates on an oil & gas processing site, which direction should workers evacuate while looking at the windsock?',
        options: [
          {
            text: 'Down-wind (in the exact same direction the windsock is pointing).',
            isCorrect: false,
            whyIncorrect: 'Walking down-wind keeps you inside the moving toxic gas plume.',
          },
          {
            text: 'Up-wind or Cross-wind (against or perpendicular to the wind direction) toward the designated safe Assembly Point.',
            isCorrect: true,
          },
          {
            text: 'Into the nearest low-lying trench or basement pit.',
            isCorrect: false,
            whyIncorrect: 'H2S is heavier than air and collects in low-lying trenches and pits.',
          },
          {
            text: 'Stay inside the work area and finish welding.',
            isCorrect: false,
            whyIncorrect: 'All permits are immediately suspended and immediate evacuation is mandatory.',
          },
        ],
        explanation: 'Checking the windsock and moving up-wind/cross-wind to higher ground keeps personnel out of the heavier-than-air H2S plume.',
      },
      {
        id: 'q-501-2',
        question: 'Before a mobile crane lift begins, which of the following conditions requires you to STOP the lift immediately?',
        options: [
          {
            text: 'The crane has a valid third-party certificate and trained rigger.',
            isCorrect: false,
            whyIncorrect: 'These are safe, required conditions.',
          },
          {
            text: 'Workers are standing or walking directly underneath the suspended load, or outriggers are only halfway extended without spreader mats.',
            isCorrect: true,
          },
          {
            text: 'Two taglines are attached to control load swing.',
            isCorrect: false,
            whyIncorrect: 'Taglines are a mandatory safe control.',
          },
          {
            text: 'The lift area is barricaded with warning signage.',
            isCorrect: false,
            whyIncorrect: 'Barricading the lift radius is correct safe practice.',
          },
        ],
        explanation: 'Never allow anyone under a suspended load, and crane outriggers must be fully extended on proper load-spreader mats.',
      },
      {
        id: 'q-501-3',
        question: 'What is the NFPA 51B standard minimum radius ("35-Foot Rule") around Hot Work within which flammable/combustible materials must be removed or protected with fire-retardant blankets?',
        options: [
          {
            text: '1 meter (3 feet).',
            isCorrect: false,
            whyIncorrect: 'Welding sparks easily travel horizontally 10+ meters.',
          },
          {
            text: '11 meters (35 feet).',
            isCorrect: true,
          },
          {
            text: '0.5 meters.',
            isCorrect: false,
            whyIncorrect: 'Far too small for hot work spark projection.',
          },
          {
            text: '500 meters.',
            isCorrect: false,
            whyIncorrect: 'The standard NFPA 51B hot work clearance radius is 35 feet (11 meters).',
          },
        ],
        explanation: 'NFPA 51B establishes the 11-meter (35-foot) fire-safe clearance zone around welding, cutting, and grinding operations.',
      },
      {
        id: 'q-501-4',
        question: 'When inspecting portable electrical power tools on a construction site, which device protects the worker from fatal electric shock by tripping within milliseconds of earth leakage?',
        options: [
          {
            text: 'RCD / ELCB / GFCI (Residual Current Device / Ground Fault Circuit Interrupter, typically 30mA sensitivity).',
            isCorrect: true,
          },
          {
            text: 'Electrical insulation tape wrapped over a cut cable.',
            isCorrect: false,
            whyIncorrect: 'Taped damaged cables are prohibited on industrial sites; cables must use proper industrial couplers or be replaced.',
          },
          {
            text: 'A wooden handle.',
            isCorrect: false,
            whyIncorrect: 'Does not disconnect fault current.',
          },
          {
            text: 'A standard 100A main plant fuse.',
            isCorrect: false,
            whyIncorrect: 'High-amperage fuses protect equipment from overload fire, not humans from milliamp ventricular fibrillation.',
          },
        ],
        explanation: 'A 30mA RCD / ELCB / GFCI detects tiny current leakage to earth and disconnects power in ~30 milliseconds before cardiac arrest occurs.',
      },
      {
        id: 'q-501-5',
        question: 'Which fire extinguisher type is SAFE and effective for an energized electrical control panel fire?',
        options: [
          {
            text: 'Water (Red label) extinguisher.',
            isCorrect: false,
            whyIncorrect: 'Water conducts electricity and will electrocute the operator.',
          },
          {
            text: 'Carbon Dioxide (CO2 — Black label) or Dry Chemical Powder (ABC), after isolating power if safe.',
            isCorrect: true,
          },
          {
            text: 'Bucket of tap water.',
            isCorrect: false,
            whyIncorrect: 'Lethal electrocution risk.',
          },
          {
            text: 'Wet Chemical (Yellow label) designed only for cooking oil.',
            isCorrect: false,
            whyIncorrect: 'Conductive liquid spray is unsafe on live electrical switchgear.',
          },
        ],
        explanation: 'CO2 does not conduct electricity and leaves no corrosive residue on sensitive electrical panels.',
      },
    ],
    practicalChallenge: {
      scenarioTitle: 'Capstone Multi-Hazard Site Walkdown Decision',
      siteSituation:
        'During a single site walk, you observe: (1) A waste bin that is 80% full of paper; (2) A painter whose safety helmet sticker is crooked; and (3) An electrician working inside an open 415V MCC panel with no LOTO padlock applied while another worker stands near the main breaker.',
      promptQuestion: 'How do you prioritize your intervention?',
      options: [
        {
          id: 'opt-501-a',
          actionText: 'Prioritize by Risk Severity (IDLH / Fatal potential first): Immediately intervene at (3) the unlocked live 415V MCC panel to stop work and apply LOTO isolation; then address (2) and (1) during routine area follow-up.',
          isOptimal: true,
          feedback: 'Spot on! A competent HSE Officer always triages life-threatening hazards (unisolated 415V panel) first before administrative or minor housekeeping items.',
        },
        {
          id: 'opt-501-b',
          actionText: 'Spend 20 minutes fixing the paper bin and helmet sticker first while leaving the electrician inside the unisolated 415V panel.',
          isOptimal: false,
          feedback: 'Critical prioritization failure: the electrician could be electrocuted while you inspect a sticker.',
        },
        {
          id: 'opt-501-c',
          actionText: 'Ignore all three and return to the office.',
          isOptimal: false,
          feedback: 'Unacceptable dereliction of duty.',
        },
      ],
    },
    interviewConnection: {
      questions: [
        {
          question: 'How do you prioritize multiple hazards when you walk onto a busy construction zone?',
          modelAnswer:
            'I prioritize hazards based on potential severity and immediacy of harm—focusing first on IDLH (Immediately Dangerous to Life or Health) and Fatal Four hazards such as unguarded work at height, unisolated live electrical/mechanical energy, unshored excavations, suspended loads, or confined space entry violations. Once life-critical risks are stopped and controlled, I systematically address medium and lower-level housekeeping and administrative compliance items with the area supervisor.',
          romanUrduTip:
            'Is jawab se panel ko yaqeen ho jata hai ke aap "sticker police" nahi balki real life-saving HSE professional hain.',
        },
      ],
    },
    references: [
      {
        id: 'ref-501-1',
        sourceOrganization: 'ILO',
        referenceTitle: 'Code of Practice on Safety and Health in Construction (2022 Revised Edition)',
        officialUrl: 'https://www.ilo.org/publications/safety-and-health-construction-revised-edition',
        publicationDate: '2022',
        lastReviewedDate: '2026-10-01',
        classification: 'International Standard',
        jurisdictionNote: 'Comprehensive ILO construction safety code covering scaffolds, excavations, lifting appliances, electricity, and PPE.',
      },
    ],
  },
];

export const HAZARD_SCENARIOS_DATA: HazardScenario[] = [
  {
    id: 'scen-1',
    title: 'Scenario 1: Elevated Pipe Rack Scaffolding & Hot Work Zone',
    difficulty: 'Beginner',
    siteArea: 'Process Unit Bay 4 — 8m Elevation',
    briefing:
      'Inspect this active pipe-rack construction bay. Click on the 3 interactive hazard hotspots in the industrial scene, identify the consequence, select the proper Hierarchy of Controls measure, and assign priority.',
    sceneType: 'scaffold_height',
    hotspots: [
      {
        id: 'hs-1-1',
        xPercent: 28,
        yPercent: 32,
        label: 'Unsecured Scaffold Edge (Missing Mid-Rail & Toe-Board)',
        hazardTitle: 'Missing Collective Guardrail Mid-Rail & 150mm Toe-Board at 8m Platform',
        consequenceOptions: [
          'Fatal fall of person or dropped steel tools striking workers below',
          'Minor paperwork delay at the gate',
          'Increased paint drying time',
        ],
        correctConsequenceIndex: 0,
        controlOptions: [
          {
            text: 'Stop platform work, apply Red Scafftag, and have certified scaffolders install top-rail, mid-rail, and 150mm toe-board (Engineering Control)',
            hierarchyTier: 'Engineering',
            isCorrect: true,
          },
          {
            text: 'Tell workers to step carefully near the open edge (Administrative)',
            hierarchyTier: 'Administrative',
            isCorrect: false,
          },
          {
            text: 'Issue dust masks to the workers below (PPE)',
            hierarchyTier: 'PPE',
            isCorrect: false,
          },
        ],
        priorityLevel: 'Immediate Stop Work',
        explanation: 'An incomplete scaffold platform at 8 meters presents an immediate fatal fall and dropped-object risk. Collective edge protection (Engineering) is mandatory.',
      },
      {
        id: 'hs-1-2',
        xPercent: 64,
        yPercent: 45,
        label: 'Welding Sparks Showering onto Open Solvent Drum Below',
        hazardTitle: 'Uncontained Overhead Hot Work Sparks Above Unsealed Flammable Drum',
        consequenceOptions: [
          'Vapour ignition, flash fire, and drum explosion',
          'Slightly noisy work environment',
          'Rust on the scaffold poles',
        ],
        correctConsequenceIndex: 0,
        controlOptions: [
          {
            text: 'Halt welding, remove flammable drums outside 11m (35ft) radius (Elimination of fuel source) and install certified fire-retardant welding habitat/blankets (Engineering)',
            hierarchyTier: 'Engineering',
            isCorrect: true,
          },
          {
            text: 'Ask the welder to weld faster before the drum heats up',
            hierarchyTier: 'Administrative',
            isCorrect: false,
          },
          {
            text: 'Give the welder leather gloves only',
            hierarchyTier: 'PPE',
            isCorrect: false,
          },
        ],
        priorityLevel: 'Immediate Stop Work',
        explanation: 'Per NFPA 51B, combustibles/flammables within 11m (35ft) must be removed and sparks contained with fire-rated blankets alongside a dedicated Fire Watcher.',
      },
      {
        id: 'hs-1-3',
        xPercent: 48,
        yPercent: 78,
        label: '230V Damaged Extension Cable in Walkway Puddle',
        hazardTitle: 'Spliced/Damaged 230V Power Cable Submerged in Standing Water Across Access Route',
        consequenceOptions: [
          'Lethal electrocution and trip hazard for passing personnel',
          'Higher electricity bill',
          'Slow internet connection',
        ],
        correctConsequenceIndex: 0,
        controlOptions: [
          {
            text: 'Isolate power, remove damaged cable from service, substitute with 110V CTE + 30mA RCD, and elevate undamaged cables on overhead S-hooks (Substitution + Engineering)',
            hierarchyTier: 'Substitution',
            isCorrect: true,
          },
          {
            text: 'Wrap additional plastic grocery bag around the splice',
            hierarchyTier: 'Administrative',
            isCorrect: false,
          },
          {
            text: 'Ask workers to jump over the puddle',
            hierarchyTier: 'Administrative',
            isCorrect: false,
          },
        ],
        priorityLevel: 'Immediate Stop Work',
        explanation: 'Damaged cables in wet areas cause fatal electrocution. Remove defective cords, use 110V step-down + 30mA RCD, and route cables overhead.',
      },
    ],
  },
  {
    id: 'scen-2',
    title: 'Scenario 2: Deep Utility Excavation & Mobile Crane Lifting Zone',
    difficulty: 'Intermediate',
    siteArea: 'Underground Cooling Water Header Trench — Sector B',
    briefing:
      'A 3-meter deep trench is being excavated while a mobile crane lowers concrete chambers nearby. Inspect all 3 critical hazards in the scene.',
    sceneType: 'excavation_trench',
    hotspots: [
      {
        id: 'hs-2-1',
        xPercent: 30,
        yPercent: 62,
        label: 'Vertical 3m Trench Wall With Zero Shoring & Spoil on Edge',
        hazardTitle: 'Unshored 3.0m Vertical Trench Wall with Excavated Soil Piled at Edge (0.2m)',
        consequenceOptions: [
          'Catastrophic trench wall collapse (cave-in) burying workers alive',
          'Dust on worker boots',
          'Delayed concrete curing',
        ],
        correctConsequenceIndex: 0,
        controlOptions: [
          {
            text: 'Evacuate trench immediately, move spoil pile ≥ 1.0m back from edge, and install hydraulic trench box / shoring or engineered benching (Engineering Control)',
            hierarchyTier: 'Engineering',
            isCorrect: true,
          },
          {
            text: 'Post a sign saying "Watch Out for Falling Soil"',
            hierarchyTier: 'Administrative',
            isCorrect: false,
          },
          {
            text: 'Require workers in trench to wear high-visibility vests',
            hierarchyTier: 'PPE',
            isCorrect: false,
          },
        ],
        priorityLevel: 'Immediate Stop Work',
        explanation: 'Any excavation ≥ 1.5m (and sooner in unstable soil) requires engineered cave-in protection (shoring, shielding, or sloping) and spoil kept ≥ 1m back.',
      },
      {
        id: 'hs-2-2',
        xPercent: 72,
        yPercent: 38,
        label: 'Workers Standing Under Suspended 8-Tonne Concrete Load (No Taglines)',
        hazardTitle: 'Personnel Positioned in Line-of-Fire Under Suspended Crane Load Without Taglines',
        consequenceOptions: [
          'Fatal crushing injury from rigging failure or uncontrolled load swing',
          'Sunburn from standing in the shade of the load',
          'Minor noise exposure',
        ],
        correctConsequenceIndex: 0,
        controlOptions: [
          {
            text: 'Halt lift, clear all workers from drop radius, barricade swing zone, and attach minimum 2 non-conductive taglines to control load from a safe distance',
            hierarchyTier: 'Engineering',
            isCorrect: true,
          },
          {
            text: 'Tell workers to hold the concrete block with their bare hands while standing under it',
            hierarchyTier: 'Administrative',
            isCorrect: false,
          },
          {
            text: 'Wear steel-toe boots while standing under the 8-tonne block',
            hierarchyTier: 'PPE',
            isCorrect: false,
          },
        ],
        priorityLevel: 'Immediate Stop Work',
        explanation: 'Never walk or stand under a suspended load. Barricade the lifting radius and use taglines so hands stay out of the pinch/crush zone.',
      },
      {
        id: 'hs-2-3',
        xPercent: 18,
        yPercent: 76,
        label: 'No Access Ladder Within 7.5m (Workers Climbing Trench Wall)',
        hazardTitle: 'Missing Secured Access/Egress Ladder in 3m Deep Excavation',
        consequenceOptions: [
          'Fall injury and inability to evacuate rapidly during an emergency or gas leak',
          'Extra leg exercise for workers',
          'Faster trench backfilling',
        ],
        correctConsequenceIndex: 0,
        controlOptions: [
          {
            text: 'Install secured industrial ladders extending ≥ 1.0m (3 rungs) above the trench lip within 7.5m (25ft) of every worker (Engineering/Access Control)',
            hierarchyTier: 'Engineering',
            isCorrect: true,
          },
          {
            text: 'Throw a knotted rope into the mud',
            hierarchyTier: 'Administrative',
            isCorrect: false,
          },
          {
            text: 'Issue knee pads for climbing dirt walls',
            hierarchyTier: 'PPE',
            isCorrect: false,
          },
        ],
        priorityLevel: 'High Priority',
        explanation: 'Excavations ≥ 1.2m deep must have safe, secured ladders within 7.5m lateral travel extending 1m above the landing edge.',
      },
    ],
  },
];

export const FIRE_CLASSES_DATA = [
  {
    fireClass: 'Class A',
    materials: 'Ordinary Solid Combustibles (Wood, Paper, Cloth, Cardboard, Plastics)',
    bestExtinguisher: 'Water (Red Label), Foam (Cream), or ABC Dry Powder (Blue)',
    neverUse: 'CO2 is poor on deep-seated Class A embers (re-ignites)',
    coolingPrinciple: 'Cools burning material below ignition temperature (removes Heat from Fire Triangle).',
  },
  {
    fireClass: 'Class B',
    materials: 'Flammable Liquids (Petrol, Diesel, Oils, Paints, Solvents, Thinners)',
    bestExtinguisher: 'Foam (AFFF — Cream Label), CO2 (Black), or ABC Dry Powder',
    neverUse: 'NEVER USE WATER — water sinks under burning oil and flashes to steam, exploding a fireball!',
    coolingPrinciple: 'Smothers liquid surface to cut off Oxygen supply.',
  },
  {
    fireClass: 'Class C',
    materials: 'Flammable Gases (Propane, Butane, LPG, Acetylene, Natural Gas, Hydrogen)',
    bestExtinguisher: 'FIRST isolate/shut off gas supply valve; use Dry Powder (Blue Label) if necessary',
    neverUse: 'Extinguishing a gas flame without shutting off the gas valve creates an unburned explosive gas cloud!',
    coolingPrinciple: 'Starvation (shutting supply valve) + chemical chain inhibition.',
  },
  {
    fireClass: 'Class D',
    materials: 'Combustible Metals (Magnesium, Titanium, Sodium, Potassium, Aluminum Swarf)',
    bestExtinguisher: 'Specialist Class D Dry Powder (M28 / L2 Graphite or Sodium Chloride applicator)',
    neverUse: 'NEVER use Water, Foam, CO2, or standard ABC powder — reacts violently with burning metal!',
    coolingPrinciple: 'Forms an oxygen-excluding crust and absorbs heat.',
  },
  {
    fireClass: 'Electrical (Energized)',
    materials: 'Live Electrical Equipment (Switchgear, MCC Panels, Transformers, Computers, Motors)',
    bestExtinguisher: 'CO2 (Black Label) or Dry Powder (after isolating power source if safe)',
    neverUse: 'NEVER use Water or standard Foam on live electrical equipment (fatal electrocution)!',
    coolingPrinciple: 'Non-conductive gas displaces oxygen without damaging electronics.',
  },
  {
    fireClass: 'Class F / Class K',
    materials: 'Cooking Oils and Deep-Fat Fryers (Camp Kitchens / Canteens)',
    bestExtinguisher: 'Wet Chemical (Yellow Label) or Fire Blanket',
    neverUse: 'NEVER use Water or high-pressure CO2 jet (splashes burning 350°C oil).',
    coolingPrinciple: 'Saponification — reacts with hot oil to form a soapy, cooling, non-flammable foam blanket.',
  },
];

export const DOCUMENT_TEMPLATES_DATA: DocumentTemplate[] = [
  {
    id: 'doc-ptw',
    title: 'Permit to Work (PTW) — Training Template',
    code: 'HSE-DOC-01',
    purpose: 'Practice verifying high-risk isolation, gas testing, and hazard controls before work authorization.',
    disclaimer: 'EDUCATIONAL TRAINING TEMPLATE ONLY. Does not authorize actual workplace operations.',
    fields: [
      { key: 'workDescription', label: 'Exact Work Scope & Equipment Tag', placeholder: 'e.g., Internal inspection & weld repair inside Surge Vessel V-204', defaultValue: 'Internal baffle weld repair inside Vessel V-204 (Unit 2)' },
      { key: 'permitType', label: 'Permit Category & Linked Certificates', placeholder: 'e.g., Hot Work + Confined Space Entry + LOTO Certificate #44', defaultValue: 'Hot Work Permit + Confined Space Entry Certificate + LOTO #108' },
      { key: 'energyIsolation', label: 'LOTO & Positive Isolation Points Verified', placeholder: 'List blinds, locked valves, MCC breaker padlock numbers...', defaultValue: 'Inlet/Outlet 6" flanges blinded (Spade #S-12); Agitator MCC Breaker 4B locked out + Zero Energy Try-Out passed.' },
      { key: 'gasTestResults', label: 'Atmospheric Gas Test Results (O2 / LEL / H2S / CO)', placeholder: 'Record exact percentages and ppm values...', defaultValue: 'O2: 20.9% | LEL: 0.0% | H2S: 0 ppm | CO: 0 ppm (Tested Top/Middle/Bottom at 07:45 by AGT)' },
      { key: 'mandatoryControls', label: 'Mandatory Site Controls & Emergency Standby', placeholder: 'Ventilation, Fire Watcher, Standby Man, SCBA, Tripod...', defaultValue: 'Air mover blower active; Fire Watcher + Standby Man posted with log; 2x CO2/Dry Powder extinguishers; Tripod winch rigged.' },
    ],
  },
  {
    id: 'doc-jsa',
    title: 'Job Safety Analysis (JSA / JHA) Worksheet',
    code: 'HSE-DOC-02',
    purpose: 'Break a job into sequential task steps, identify step-specific hazards, and assign controls.',
    disclaimer: 'EDUCATIONAL TRAINING TEMPLATE ONLY.',
    fields: [
      { key: 'jobTitle', label: 'Task Title & Location', placeholder: 'e.g., Mobile Crane Lifting of 10T Heat Exchanger', defaultValue: 'Mobile Crane Lifting of 10-Tonne Fin-Fan Cooler onto 6m Steel Structure' },
      { key: 'step1Breakdown', label: 'Step 1: Crane Positioning & Outrigger Setup (Hazards & Controls)', placeholder: 'Hazard: Ground collapse -> Control: Full outrigger extension on steel mats...', defaultValue: 'Hazard: Soft soil collapse / underground utilities. Control: Verify ground compaction, 100% outrigger extension on 2m steel spreader mats.' },
      { key: 'step2Breakdown', label: 'Step 2: Rigging & Lifting Load (Hazards & Controls)', placeholder: 'Hazard: Load swing / dropped object -> Control: Certified web slings, 2 taglines...', defaultValue: 'Hazard: Suspended load failure / crush zone. Control: Third-party certified shackles & slings, barricaded drop zone, 2 taglines, wind < 32 km/h.' },
      { key: 'step3Breakdown', label: 'Step 3: Landing, Bolting at 6m & Demobilization', placeholder: 'Hazard: Fall from height / pinch points -> Control: 100% tie-off harness...', defaultValue: 'Hazard: Fall from height & hand pinch points. Control: Riggers anchored 100% tie-off to life-line; release slings only after 4 structural bolts torqued.' },
    ],
  },
  {
    id: 'doc-tbt',
    title: 'Daily Pre-Start Toolbox Talk (TBT) Record',
    code: 'HSE-DOC-03',
    purpose: 'Structure a clear, interactive 10-minute morning safety briefing for field crews.',
    disclaimer: 'EDUCATIONAL TRAINING TEMPLATE ONLY.',
    fields: [
      { key: 'tbtTopic', label: 'Today’s Toolbox Talk Topic & Crew Trade', placeholder: 'e.g., Safe Working at Height & Dropped Object Prevention', defaultValue: 'Preventing Dropped Objects & 100% Harness Tie-Off on Pipe Rack Bay 4' },
      { key: 'keyMessages', label: '3 Core Safety Points Explained (English / Roman Urdu)', placeholder: 'List 3 practical rules for the crew today...', defaultValue: '1. Inspect harness webbing & shock absorber before shift. 2. Anchor above shoulder level (never to handrail tube without rating). 3. Secure all spanners with tool lanyards & check 150mm toe-boards.' },
      { key: 'workerQuestions', label: 'Two-Way Crew Questions & Feedback Logged', placeholder: 'What questions did workers ask or answer?', defaultValue: 'Pipefitter asked about replacing a frayed lanyard — damaged lanyard quarantined immediately and new certified double lanyard issued.' },
    ],
  },
  {
    id: 'doc-incident',
    title: 'Incident & Near Miss Investigation Report (5-Whys & CAPA)',
    code: 'HSE-DOC-04',
    purpose: 'Document immediate causes, 5-Whys root cause analysis, and SMART Corrective Actions.',
    disclaimer: 'EDUCATIONAL TRAINING TEMPLATE ONLY.',
    fields: [
      { key: 'eventSummary', label: 'Classification & Event Description', placeholder: 'Near Miss / First Aid / Property Damage details...', defaultValue: 'High-Potential Near Miss: 4-inch pipe clamp fell 6m from scaffold during dismantling, landing inside barricaded zone.' },
      { key: 'immediateCauses', label: 'Immediate Causes (Unsafe Act & Unsafe Condition)', placeholder: 'Identify the immediate trigger...', defaultValue: 'Unsafe Act: Scaffolder placed loose clamp on ledger tube instead of canvas bolt bag. Unsafe Condition: Toe-board was removed first before clearing loose fittings.' },
      { key: 'rootCause5Whys', label: 'Root Cause (5-Whys Systemic Analysis)', placeholder: 'Why did the system allow this?', defaultValue: 'Root Cause: Canvas bolt bags were out of stock in site stores for 2 weeks, and dismantling sequence wasn’t briefed in morning TBT.' },
      { key: 'capaActions', label: 'Corrective & Preventive Actions (CAPA + Target Date)', placeholder: 'Action, Owner, Due Date...', defaultValue: '1. Issue canvas bolt bags to all scaffolders before shift (Storekeeper — Immediate). 2. Update Scaffold Dismantling JSA to keep toe-boards until all loose couplers are bagged (Scaffolding Supt — 48h).' },
    ],
  },
  {
    id: 'doc-inspection',
    title: 'Daily Workplace Safety Inspection Checklist',
    code: 'HSE-DOC-05',
    purpose: 'Conduct systematic zone audits covering Housekeeping, WAH, Electrical, Fire, and Excavations.',
    disclaimer: 'EDUCATIONAL TRAINING TEMPLATE ONLY.',
    fields: [
      { key: 'zoneInspected', label: 'Site Zone & Contractor Audited', placeholder: 'e.g., Fabrication Yard & Substation Area', defaultValue: 'Mechanical Fabrication Shop & Main Pipe Trench Zone C' },
      { key: 'positiveFindings', label: 'Positive Safety Observations (Good Practices)', placeholder: 'Acknowledge compliant crews...', defaultValue: 'Welding booths properly screened with fire blankets; calibrated 30mA RCDs verified on all distribution boards.' },
      { key: 'nonConformities', label: 'Deficiencies Found & Risk Rating', placeholder: 'List hazards found and High/Medium/Low priority...', defaultValue: '1. Fire extinguisher #FE-19 blocked by pipe pallets (Medium). 2. Oxygen/Acetylene cylinders stored together without flashback arrestor on torch (High — Stopped).' },
      { key: 'closeoutAction', label: 'On-the-Spot Corrections & Closeout Owner', placeholder: 'Who fixed it and when?', defaultValue: 'Cylinders separated 6m apart, flashback arrestors fitted at gauge & torch, and extinguisher access cleared within 30 mins by Fab Supervisor.' },
    ],
  },
  {
    id: 'doc-observation',
    title: 'Safety Observation Card (STOP / BBS Observation)',
    code: 'HSE-DOC-06',
    purpose: 'Record behavioral safety conversations, reinforce safe habits, and correct at-risk acts constructively.',
    disclaimer: 'EDUCATIONAL TRAINING TEMPLATE ONLY.',
    fields: [
      { key: 'observedActivity', label: 'Observed Task & Location', placeholder: 'What work was happening?', defaultValue: 'Manual handling and grinding of steel support brackets in Workshop Bay 2' },
      { key: 'safeBehavior', label: 'Safe Behavior Reinforced', placeholder: 'What was the worker doing right?', defaultValue: 'Operator wore both safety spectacles AND full face shield (double eye protection) plus hearing protection.' },
      { key: 'atRiskCoaching', label: 'At-Risk Behavior Coached & Agreed Solution', placeholder: 'Constructive conversation held...', defaultValue: 'Worker was bending at the waist to lift a 35kg steel plate alone. Coached ergonomic team-lift technique and brought a hydraulic trolley.' },
    ],
  },
  {
    id: 'doc-ra',
    title: 'Formal 5-Step Risk Assessment Register Entry',
    code: 'HSE-DOC-07',
    purpose: 'Document Activity, Hazards, Persons at Risk, Initial Risk, Hierarchy Controls, and Residual Risk.',
    disclaimer: 'EDUCATIONAL TRAINING TEMPLATE ONLY.',
    fields: [
      { key: 'activityName', label: 'Activity & Persons at Risk', placeholder: 'e.g., Hydrostatic Pressure Testing of Pipeline (Testers & Adjacent Trades)', defaultValue: 'Pneumatic & Hydrostatic Pressure Testing of 12" Carbon Steel Spool (Testing Crew & Nearby Personnel)' },
      { key: 'hazardAndInitial', label: 'Primary Hazard, Consequence & Initial Risk Score', placeholder: 'e.g., High-pressure hose whip / rupture — Initial L4 x S5 = 20 (Critical)', defaultValue: 'Sudden joint rupture / high-pressure hose whip causing fatal impact or injection injury — Initial: L4 × S5 = 20 (Critical)' },
      { key: 'controlsAndResidual', label: 'Hierarchy Controls Applied & Residual Risk Score', placeholder: 'List Engineering, Admin, PPE & new score...', defaultValue: 'Substitute pneumatic with hydro-test; whip-checks on all hoses; calibrated dual pressure gauges & relief valve; hard barricaded exclusion zone (15m); PTW. Residual: L1 × S4 = 4 (Low).' },
    ],
  },
];

export const INTERVIEW_QUESTIONS_BANK: InterviewBankQuestion[] = [
  {
    id: 'iq-1',
    mode: 'Beginner',
    question: 'What is the difference between a Hazard and a Risk, and how do you apply the Hierarchy of Controls to manage them?',
    expectedKeyPoints: [
      'Hazard has potential to cause harm',
      'Risk combines likelihood and severity',
      'Elimination, Substitution, Engineering, Administrative, PPE',
      'Give a practical site example',
    ],
    modelAnswer:
      'A hazard is any source or situation with the intrinsic potential to cause harm, while risk is the combination of the likelihood of that harm occurring and its severity. To manage risk to ALARP, I apply the five-tier Hierarchy of Controls from top to bottom: First Elimination, then Substitution, Engineering Controls (such as collective guardrails or machine guards), Administrative Controls (such as Permits to Work, JSAs, and Toolbox Talks), and finally PPE as the last line of defense.',
    relatedLessonId: 'les-102',
  },
  {
    id: 'iq-2',
    mode: 'Technical HSE',
    question: 'Walk me through the mandatory safety requirements before authorizing a Confined Space Entry on site.',
    expectedKeyPoints: [
      'Confined Space Entry Permit and JSA',
      'Positive energy isolation LOTO and blinding',
      'Calibrated gas test O2 19.5% to 23.5% and LEL < 10%',
      'Mechanical ventilation and 24V lighting',
      'Trained Standby Man at entrance and emergency rescue tripod',
    ],
    modelAnswer:
      'Before authorizing Confined Space Entry, I verify six critical requirements: First, a valid Confined Space Entry Permit and crew-briefed JSA. Second, positive isolation of all incoming pipes and electrical drives via LOTO and mechanical blinding. Third, stratified atmospheric gas testing at top, middle, and bottom by an Authorized Gas Tester confirming Oxygen between 19.5% and 23.5%, LEL at 0% for hot work (<10% cold), and zero H2S/CO. Fourth, forced mechanical ventilation and 24V intrinsically safe lighting. Fifth, a trained Standby Man stationed outside with an entry/exit log. Sixth, a pre-rigged rescue tripod winch and verified emergency rescue plan.',
    relatedLessonId: 'les-202',
  },
  {
    id: 'iq-3',
    mode: 'Situational',
    question: 'During a critical concrete pour, you see a worker at 6 meters height working outside the scaffold handrail without a safety harness. The construction foreman tells you not to delay the pour. What action do you take?',
    expectedKeyPoints: [
      'Stop the unsafe act immediately using Stop Work Authority',
      'Bring the worker inside the protected platform safely',
      'Check anchor point and 100% tie-off harness',
      'Explain technical solution calmly to foreman and escalate if refused',
    ],
    modelAnswer:
      'Because working unanchored outside a handrail at 6 meters is an imminent fatal fall hazard, I immediately exercise Stop Work Authority for that worker and instruct him to step back inside the guarded scaffold platform. I remain calm and respectful with the foreman: I explain that we do not need to cancel the concrete pour—we simply need 3 minutes to fit the worker with a full-body harness anchored to a certified 22 kN structural point or modify the scaffold platform edge protection so the pour can proceed without a fatal accident. If the foreman still attempts to force unguarded work, I hold the activity and escalate immediately to the Construction Manager and HSE Manager.',
    relatedLessonId: 'les-301',
  },
  {
    id: 'iq-4',
    mode: 'HR',
    question: 'Why should we hire you as an HSE Officer when other candidates may have more years of site experience?',
    expectedKeyPoints: [
      'Strong technical foundation in PTW, JSA, Risk Assessment, and site inspections',
      'Proactive field presence and clear English/crew communication',
      'High integrity, willingness to learn employer procedures, and zero bad habits',
    ],
    modelAnswer:
      'While some candidates may have longer tenure, I bring up-to-date technical mastery of international safety systems—including 5x5 Risk Assessments, JSAs, PTW verification, LOTO, Gas Testing parameters, and root-cause investigation—combined with zero complacency. I am a field-first officer who spends my shift coaching crews at the workface rather than sitting in an office cabin. I communicate clearly in both technical English for client reporting and simple language for workers during Toolbox Talks, and I strictly follow your company’s specific HSE procedures.',
    relatedLessonId: 'les-401',
  },
  {
    id: 'iq-5',
    mode: 'Technical HSE',
    question: 'What are the key precautions you verify before a Mobile Crane Critical Lift on site?',
    expectedKeyPoints: [
      'Approved Lift Plan and Permit to Work',
      'Third-party crane and rigging gear certificates plus competent operator/rigger',
      'Ground stability and 100% outrigger extension on spreader mats',
      'Wind speed below limit (typically 32 km/h / 20 mph)',
      'Barricaded swing/drop zone and two taglines attached',
    ],
    modelAnswer:
      'Before a mobile crane lift, I verify: 1. An approved Lift Plan, JSA, and Lifting Permit; 2. Valid third-party inspection certificates for the crane, hooks, shackles, and slings, plus certified Operator and Rigger credentials; 3. Firm ground conditions with all four outriggers 100% extended on load-spreader mats; 4. Functional anti-two-block device and Load Moment Indicator (LMI); 5. Wind speed verified below the site limit (typically 32 km/h); and 6. A fully barricaded drop and counterweight swing radius with at least two taglines attached so no worker ever stands under the suspended load.',
    relatedLessonId: 'les-501',
  },
];

export const GLOSSARY_DATA: GlossaryItem[] = [
  {
    id: 'gl-1',
    term: 'ALARP (As Low As Reasonably Practicable)',
    category: 'Risk & Controls',
    simpleDefinition: 'Reducing workplace risk to the lowest level where the time, trouble, and cost of further reduction would be grossly disproportionate to the added safety benefit.',
    romanUrduExplanation: 'Risk ko itna kam kar dena jahan tak amli taur par mumkin ho — yani tamam zaroori Engineering aur Administrative controls laga kar risk ko qabil-e-qabool had tak neeche lana.',
    industrialExample: 'Installing collective guardrails AND using a 100% tie-off harness on a pipe rack reduces fall risk to ALARP.',
    relatedConcepts: ['Risk Matrix', 'Residual Risk', 'Hierarchy of Controls'],
  },
  {
    id: 'gl-2',
    term: 'LOTO (Lockout / Tagout)',
    category: 'Permits & High-Risk',
    simpleDefinition: 'Physical isolation of hazardous energy sources (electrical, mechanical, hydraulic, pneumatic, chemical) using personal padlocks and warning tags, followed by a zero-energy "Try-Out" test.',
    romanUrduExplanation: 'Maintenance se pehle machine ki bijli, pressure, ya chemical line ko band kar ke apna personal tala (Padlock) aur Tag lagana, aur start button daba kar ("Try Out") tasdeeq karna ke andar koi current ya pressure baqi nahi.',
    industrialExample: 'Locking out a 415V crusher motor breaker in the MCC room with a multi-lock hasp before mechanics enter the crusher chamber.',
    relatedConcepts: ['Zero Energy Verification', 'Permit to Work', 'One Person One Lock'],
  },
  {
    id: 'gl-3',
    term: 'LEL & UEL (Lower / Upper Explosive Limit)',
    category: 'Emergency & Fire',
    simpleDefinition: 'LEL is the minimum concentration of a flammable gas or vapour in air below which propagation of a flame does not occur on contact with an ignition source.',
    romanUrduExplanation: 'Hawa mein qabil-e-aatish gas ki woh kam se kam miqdaar (percentage) jis par chingari milte hi aag ya dhamaka ho sakta hai. Hot Work ke liye LEL 0% hona laazmi hai.',
    industrialExample: 'Methane has an LEL of 5% by volume in air; gas detectors measure from 0% to 100% of that LEL threshold.',
    relatedConcepts: ['Confined Space Entry', 'Hot Work Permit', 'Authorized Gas Tester'],
  },
  {
    id: 'gl-4',
    term: 'H2S (Hydrogen Sulfide)',
    category: 'Permits & High-Risk',
    simpleDefinition: 'An extremely toxic, colorless, flammable gas with a rotten-egg odor at very low concentrations that rapidly paralyzes the sense of smell and causes instant unconsciousness at high ppm.',
    romanUrduExplanation: 'Zameen, sewage, aur oil & gas wells mein payi jane wali be-had zehreeli gas. Yeh hawa se bhari hoti hai (trench aur tank ke neeche jama hoti hai) aur soonghne ki his ko khatam kar deti hai.',
    industrialExample: 'Wearing a personal H2S clip monitor set to low-alarm at 10 ppm and high-alarm at 15 ppm in sour gas facilities.',
    relatedConcepts: ['SCBA', 'Up-Wind Evacuation', 'Stratified Gas Testing'],
  },
  {
    id: 'gl-5',
    term: 'SIMOPS (Simultaneous Operations)',
    category: 'Site Operations',
    simpleDefinition: 'Two or more independent work activities occurring at the same time and proximity whose hazards may interact to create compounding risks.',
    romanUrduExplanation: 'Ek hi jagah aur ek hi waqt mein do mukhtalif kaamon ka hona jin ke khatraat aapas mein takra kar bara haadsa kar sakte hon (maslan upar welding aur neeche painting).',
    industrialExample: 'Prohibiting crane lifting operations directly over an active hydro-testing pressurized pipeline zone.',
    relatedConcepts: ['Permit to Work', 'Area Authority', 'Job Safety Analysis'],
  },
  {
    id: 'gl-6',
    term: 'SWL / WLL (Safe Working Load / Working Load Limit)',
    category: 'Permits & High-Risk',
    simpleDefinition: 'The maximum mass or force that a piece of lifting equipment, crane, shackle, or sling is certified to support safely during normal service.',
    romanUrduExplanation: 'Kisi crane, belt (sling), ya shackle ki woh zyada se zyada wazan uthane ki certified had jis se upar wazan uthana mana hai.',
    industrialExample: 'Checking that a 4-legged wire rope bridle sling has a certified SWL tag of 15 tonnes before lifting a 10-tonne heat exchanger.',
    relatedConcepts: ['Lifting Plan', 'Color Coding', 'Anti-Two-Block'],
  },
  {
    id: 'gl-7',
    term: 'Scafftag System (Green / Yellow / Red)',
    category: 'Site Operations',
    simpleDefinition: 'Visual status tagging system fixed at scaffold access points indicating whether a scaffold has been inspected by a competent inspector within the last 7 days.',
    romanUrduExplanation: 'Scaffold ki seerhi ke paas laga hua card: GREEN Tag = Safe for use (har 7 din baad re-inspect); RED Tag = Do Not Use (unsafe ya incomplete).',
    industrialExample: 'Verifying the Green Scafftag signature and date before allowing pipefitters onto a 12-meter tower scaffold.',
    relatedConcepts: ['Working at Height', 'Toe-Board', 'Guardrail'],
  },
  {
    id: 'gl-8',
    term: 'PASS Method (Fire Extinguisher Operation)',
    category: 'Emergency & Fire',
    simpleDefinition: 'Standard 4-step operating sequence for portable fire extinguishers: Pull the pin, Aim at the base of the fire, Squeeze the lever, Sweep side to side.',
    romanUrduExplanation: 'Fire extinguisher chalane ke 4 steps: P = Pull the pin (pin kheenchein), A = Aim at the base of fire (aag ki jar par nishana lagayein), S = Squeeze the lever (handle dabayein), S = Sweep side to side (dayein-bayein pherein).',
    industrialExample: 'Demonstrating the PASS technique with a CO2 extinguisher during a monthly site fire drill.',
    relatedConcepts: ['Fire Triangle', 'Fire Watcher', 'Emergency Assembly Point'],
  },
];

export const FIRST_30_DAYS_ROADMAP = [
  {
    week: 'Week 1 (Days 1–7): Site Induction, Geography & HSE Management System',
    focus: 'Understand project layout, emergency protocols, and your employer’s specific HSE Plan.',
    tasks: [
      { id: 'd30-1', dayRange: 'Days 1–2', title: 'Complete Site HSE Induction & Emergency Orientation', detail: 'Learn alarm tones, Emergency Assembly Points, clinic location, windsock positions, and emergency radio channels.' },
      { id: 'd30-2', dayRange: 'Days 3–4', title: 'Study the Employer Project HSE Plan & PTW Procedure', detail: 'Read the project-specific Permit to Work matrix, color-coding calendar, and reporting chain of command.' },
      { id: 'd30-3', dayRange: 'Days 5–7', title: 'Shadow Senior HSE Officer on Morning Walkdowns', detail: 'Introduce yourself respectfully to area supervisors, foremen, and storekeepers; map high-risk zones.' },
    ],
  },
  {
    week: 'Week 2 (Days 8–14): Field Presence, Toolbox Talks & PTW Verification',
    focus: 'Build visible field credibility through practical verification rather than office paperwork.',
    tasks: [
      { id: 'd30-4', dayRange: 'Days 8–10', title: 'Co-Deliver Daily Pre-Start Toolbox Talks (TBT)', detail: 'Keep briefings 5–10 minutes, task-specific, and interactive; check worker PPE and fatigue.' },
      { id: 'd30-5', dayRange: 'Days 11–12', title: 'Verify Active Permits to Work at the Workface', detail: 'Match paper PTW & JSA controls against physical field reality (LOTO locks, gas test time, fire blankets, standby man).' },
      { id: 'd30-6', dayRange: 'Days 13–14', title: 'Inspect Portable Tools, Color Coding & Distribution Boards', detail: 'Verify 30mA RCD functionality, valid quarterly inspection color tags, and intact grinder guards.' },
    ],
  },
  {
    week: 'Week 3 (Days 15–21): High-Risk Audits, Observations & Constructive Coaching',
    focus: 'Audit scaffolding, excavations, lifting, and coach at-risk behaviors with technical clarity.',
    tasks: [
      { id: 'd30-7', dayRange: 'Days 15–17', title: 'Audit Scaffolding, Working at Height & Excavations', detail: 'Check Scafftag dates, top/mid-rails, 150mm toe-boards, 100% harness tie-off, trench shoring, and ladder access.' },
      { id: 'd30-8', dayRange: 'Days 18–19', title: 'Monitor Crane Lifting & Rigging Operations', detail: 'Verify Lift Plans, outrigger spreader mats, sling SWL tags, barricaded swing zones, and tagline usage.' },
      { id: 'd30-9', dayRange: 'Days 20–21', title: 'Log Proactive Near Misses & Positive Safety Observations', detail: 'Praise compliant crews publicly to build trust; close out unsafe conditions with supervisors on the spot.' },
    ],
  },
  {
    week: 'Week 4 (Days 22–30): Reporting, CAPA Follow-Up & Emergency Drill Participation',
    focus: 'Demonstrate end-to-end ownership of daily HSE reporting, CAPA tracking, and emergency readiness.',
    tasks: [
      { id: 'd30-10', dayRange: 'Days 22–25', title: 'Compile Accurate Daily & Weekly HSE Reports', detail: 'Track leading indicators (man-hours, TBTs, inspections, open vs. closed observations) and verify CAPA closeout evidence.' },
      { id: 'd30-11', dayRange: 'Days 26–28', title: 'Participate in Site Emergency Evacuation / Fire Drill', detail: 'Observe response time, roll-call accuracy at Assembly Points, and permit suspension compliance.' },
      { id: 'd30-12', dayRange: 'Days 29–30', title: '30-Day Review with HSE Manager & Continuous Improvement', detail: 'Review recurring hazard trends in your assigned zone and propose one practical engineering improvement.' },
    ],
  },
];
