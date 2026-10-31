# MASTER BUILD PROMPT — HSE FIELDREADY
## Production-Ready HSE Learning & Interview Preparation Platform

You are the lead product architect, senior React Native engineer, UI/UX designer, backend engineer, database architect, QA engineer, and HSE educational content specialist.

Your task is to design, develop, test, and deliver a complete, professional application named **HSE FieldReady**.

This is NOT a generic quiz application, basic LMS, static website, or simple interview question collection.

Build a complete HSE career preparation and professional learning platform designed primarily for beginners who want to become competent, knowledgeable, and interview-ready HSE Officers.

The product should feel like a premium professional industrial safety academy.

IMPORTANT: Do not stop after creating a visual prototype. Implement real navigation, functional screens, learning logic, database integration, user progress tracking, and working interactions.

---

# 1. PRODUCT VISION

App name: HSE FieldReady

Tagline: Learn. Practice. Perform. Become Site-Ready.

Primary audience:
- New HSE Officer candidates.
- Beginners entering occupational health and safety.
- Candidates preparing for international HSE jobs.
- People who need technical knowledge and interview confidence.

Primary launch focus: HSE Officer Newcomer Edition.

Future career tracks may include:
- Safety Assistant.
- PTW Receiver.
- Fire Watcher.

Do not present incomplete future tracks as functioning features.

The application must guide a complete beginner through a structured learning journey, from HSE fundamentals to practical industrial scenarios and final interview preparation.

# 2. NON-NEGOTIABLE VISUAL IDENTITY

Use a premium, crystal-clear LIQUID GLASS / GLASSMORPHISM design language.

The visual direction is fixed.

The design must have:

- Crystal-clear transparent glass surfaces.
- Clearly visible backgrounds through translucent components.
- Beautiful subtle edge reflections.
- Fine specular highlights around glass edges.
- Realistic transparency and layered depth.
- Smooth transitions and fluid animations.
- Premium floating navigation and glass controls.
- Dark navy, deep petrol, and graphite environmental backgrounds.
- Restrained safety-orange accents.
- Carefully balanced contrast and readable typography.

ABSOLUTELY AVOID:

- Milky-white glass.
- Whitish transparent overlays.
- Heavy frosted-glass effects.
- Generic white cards.
- Flat generic SaaS dashboard design.
- Excessive gradients.
- Cartoonish educational illustrations.
- Overly bright neon colors.
- Repetitive layouts on every screen.

The design should evoke the crystal-clear Liquid Glass aesthetic while maintaining its own original product identity.

Glass must remain visually consistent throughout the application, but layouts should be designed specifically for each feature.

Use subtle blur only where appropriate. Prioritize actual transparency, visible backgrounds, reflections, and depth.

Implement graceful visual fallbacks for Android devices where advanced blur is unavailable.

The application is primarily mobile-first, with excellent Android compatibility, responsive layouts, and iOS compatibility.

# 3. TECHNOLOGY STACK

Use a maintainable, modern architecture.

Recommended stack:

Frontend:
- React Native.
- Expo.
- Expo Router.
- TypeScript.
- React Native Reanimated.
- Expo Linear Gradient.
- Expo Blur View.
- React Native SVG where appropriate.
- A lightweight state management solution where needed.

Backend:
- Supabase Authentication.
- Supabase PostgreSQL.
- Supabase Storage.
- Supabase Edge Functions.

Data:
- Proper relational database structure.
- Secure Row Level Security policies.
- Persistent user progress.
- Real user authentication.

Do not blindly install incompatible latest packages. Check the installed Expo SDK and select compatible dependencies.

Keep all credentials in environment variables. Never expose Supabase service-role keys, AI API keys, or privileged secrets in the mobile application.

Create an .env.example with documented required variables.

# 4. USER ONBOARDING

Build a polished onboarding experience.

Collect:

1. Experience level: Beginner / Some Experience / Experienced.
2. Target role: HSE Officer.
3. Interview preparation goal.
4. English communication level.
5. Preferred explanation language: English / Roman Urdu.
6. Daily learning availability.

Use the answers to create a personalized HSE learning plan.

Do not overwhelm users with a complicated onboarding questionnaire.

Allow users to edit their preferences later.

Include:
- Sign up.
- Login.
- Password reset.
- User profile.
- Secure logout.

Provide a clearly labeled local demo mode when backend credentials are unavailable. Never represent local demo information as real cloud-synced user data.

# 5. MAIN DASHBOARD

Create an exceptional Liquid Glass dashboard.

It must show:

- Personal greeting.
- Current training program.
- Overall preparation progress.
- Current learning phase.
- Week and day information.
- Today's learning mission.
- Continue Learning action.
- Daily learning target.
- Recent quiz performance.
- Weak learning areas.
- Interview readiness score.
- Recommended next lesson.
- Learning streak.
- Achievement milestones.

The dashboard must be dynamic.

All progress values must come from actual user activity and saved records, not hardcoded decorative numbers.

# 6. COMPLETE LEARNING JOURNEY

This is the heart of HSE FieldReady.

Create a structured, progressive learning experience.

The learning roadmap should contain five major phases:

PHASE 1 — FOUNDATION

- Introduction to HSE.
- Meaning of HSE.
- Responsibilities of an HSE Officer.
- Safety culture.
- Workplace safety terminology.
- Hazard versus risk.
- Accident, incident, and near miss.
- Hierarchy of Controls.

PHASE 2 — TECHNICAL KNOWLEDGE

- Hazard Identification.
- Risk Assessment.
- Risk Matrix.
- JSA and JHA.
- Permit to Work.
- Hot Work.
- Confined Space.
- Working at Height.
- Excavation Safety.
- LOTO.
- Lifting Operations.
- Electrical Safety.
- PPE.
- Fire Safety.

PHASE 3 — PRACTICAL SITE SKILLS

- Workplace inspections.
- Toolbox Talks.
- Safety observations.
- Incident reporting.
- Incident investigation.
- Emergency response.
- Corrective and preventive actions.
- Daily HSE reporting.
- Contractor safety.
- Communication with workers and supervisors.

PHASE 4 — INTERVIEW PREPARATION

- HR interview.
- Basic HSE interview.
- Technical interview.
- Scenario-based questions.
- Situational judgment.
- English communication.
- Professional self-introduction.
- Gulf job interview preparation.

PHASE 5 — FINAL ASSESSMENT

- Comprehensive technical assessment.
- Practical scenarios.
- Hazard identification test.
- Documentation exercise.
- Full mock interview.
- Personalized performance report.

Every learning phase should have modules, lessons, milestones, completion criteria, and progress indicators.

Implement prerequisites and controlled progression without unnecessarily blocking users from reviewing completed lessons.

# 7. LESSON EXPERIENCE

Never present lessons as boring walls of text.

Every lesson should follow a consistent learning structure:

STEP 1 — UNDERSTAND

Explain the topic in simple beginner-friendly language.

Use:
- Clear headings.
- Technical English terminology.
- Roman Urdu explanations where selected.
- Practical examples.
- Important safety notes.

STEP 2 — VISUAL LEARNING

Include relevant:
- Industrial photographs.
- Diagrams.
- Visual examples.
- Process illustrations.
- Short educational media where available.

Do not use irrelevant stock imagery as decoration.

STEP 3 — KNOWLEDGE CHECK

Provide approximately 5–10 relevant questions per lesson.

Show:
- Correct answer.
- Explanation.
- Why other answers are incorrect where helpful.
- Saved quiz result.

STEP 4 — PRACTICAL CHALLENGE

Give the learner an industrial situation and ask what action they would take.

STEP 5 — INTERVIEW CONNECTION

Provide related interview questions and professional English model answers.

Allow:
- Bookmark lesson.
- Save notes.
- Resume from last position.
- Mark lesson complete.
- Revisit completed lessons.

Build real lesson content, not empty placeholders.

# 8. AI MOCK INTERVIEW

Develop a professional mock interview experience.

Include:

- HR interview mode.
- Technical HSE mode.
- Beginner interview mode.
- Situational interview mode.
- Random interview mode.

The AI interviewer should ask questions one at a time.

Users should be able to submit answers through text and, where the required speech-to-text integration is configured and verified, voice input.

Evaluate answers using:

1. Technical accuracy.
2. Relevant safety knowledge.
3. Answer completeness.
4. Practical decision-making.
5. Communication clarity.
6. Professional answer structure.

After the interview show:

- Overall score.
- Individual competency scores.
- Strengths.
- Missing points.
- Areas for improvement.
- Suggested professional model answer.
- Recommended lessons for revision.

Never pretend an AI evaluation occurred if the AI service is unavailable.

Implement AI processing through secure server-side functions. Keep text-based practice working even when external AI credentials are missing, using a clearly labeled structured rubric-based fallback.

# 9. HAZARD IDENTIFICATION LAB

Build a visually engaging practical training environment.

Show realistic industrial scenes.

Provide interactive hazards for users to identify.

Example scenarios:

- Unsafe working at height.
- Missing edge protection.
- Poor housekeeping.
- Electrical hazards.
- Unsafe lifting operations.
- Missing PPE.
- Fire hazards.
- Unsafe excavation.
- Confined-space entry hazards.
- Vehicle and pedestrian interaction.

Users should:
- Identify the hazard.
- Explain the possible consequence.
- Select appropriate controls.
- Prioritize their response.

Give feedback explaining the reasoning.

Include multiple scenarios with increasing difficulty.

# 10. RISK ASSESSMENT LAB

Create an interactive risk assessment practice module.

Let users work with:

- Activity.
- Hazard.
- Persons at risk.
- Potential consequences.
- Existing controls.
- Likelihood.
- Severity.
- Initial risk score.
- Additional control measures.
- Residual risk score.

Include a configurable example 5x5 matrix for training.

Explain how the Hierarchy of Controls informs the choice of controls.

Allow users to save and review their completed practice assessments.

Clearly distinguish illustrative training assessments from approved workplace risk assessments.

# 11. DOCUMENTATION PRACTICE LAB

Create functional educational document templates.

Include:

- Risk Assessment template.
- JSA/JHA template.
- Toolbox Talk template.
- Permit to Work learning template.
- Incident Report template.
- Workplace Inspection Checklist.
- Safety Observation Report.

Users should be able to fill in, edit, save, and review their practice documents.

Provide an export option where technically appropriate.

These are educational templates, not authorization to issue real permits or approve workplace activities.

# 12. FIRE AND EMERGENCY LEARNING

Build a dedicated practical learning module.

Include:

- Fire classes.
- Fire prevention.
- Extinguisher fundamentals.
- Emergency evacuation.
- Alarm response.
- Emergency communication.
- Fire safety scenarios.
- Incident response fundamentals.

Use educational scenarios and professional references.

Never encourage untrained users to perform dangerous firefighting or rescue operations.

# 13. HSE GLOSSARY

Create an easily searchable HSE technical glossary.

Each entry should include:

- English terminology.
- Simple definition.
- Roman Urdu explanation.
- Industrial example.
- Related concepts.

Add bookmarks and search functionality.

# 14. AI LEARNING COACH

Add an AI learning assistant.

It should help users:

- Understand difficult concepts.
- Explain incorrect quiz answers.
- Revise weak subjects.
- Suggest the next lesson.
- Practice HSE terminology.
- Improve interview answers.

Ground responses in the platform's reviewed learning content.

The assistant must distinguish general training guidance from applicable law and employer/site procedures.

It must not invent regulations, certifications, legal requirements, or safety procedures.

# 15. PERSONALIZED LEARNING AND READINESS SYSTEM

Track real learning activity.

Create separate performance indicators for:

- Technical Knowledge.
- Risk Assessment.
- Practical Skills.
- Interview Communication.
- Documentation.
- Overall Learning Completion.

Build a meaningful HSE Readiness Score based on actual assessment results, not simply the number of lessons completed.

Display the score as a learning indicator, not a professional certification or guarantee of job readiness.

Add:

- Weakness analysis.
- Recommended revision.
- Personalized daily learning missions.
- Quiz history.
- Learning streaks.
- Achievements.
- Final assessment report.

# 16. FIRST 30 DAYS AS AN HSE OFFICER

Create a practical newcomer roadmap.

Show a structured 30-day learning plan covering:

- Site induction concepts.
- HSE responsibilities.
- Workplace observation.
- Hazard recognition.
- Safety inspections.
- Toolbox Talks.
- Reporting.
- Documentation.
- Communication.
- Professional conduct.

Clearly state that actual workplace tasks must follow employer procedures, supervision, and competency requirements.

# 17. CONTENT QUALITY AND REFERENCES

HSE educational accuracy is extremely important.

Use credible resources such as:

- International Labour Organization (ILO).
- UK Health and Safety Executive (HSE).
- OSHA.
- NIOSH.
- NFPA, where relevant.
- Applicable official national regulatory sources.

Research and verify references when creating the learning curriculum.

For each substantive technical lesson, provide:
- Source organization.
- Reference title.
- Official source URL.
- Publication or revision date where available.
- Date last reviewed.

Clearly distinguish:
- General safety principles.
- Legal requirements.
- International standards.
- Employer-specific procedures.

Do not fabricate laws, clauses, statistics, standards, certifications, or reference URLs.

Do not assume UK or US requirements automatically apply in Pakistan, Saudi Arabia, Qatar, UAE, or any other country.

Treat country-specific legal information as a separately verified content layer.

Where verification is unavailable, clearly label content as requiring expert review instead of presenting it as established law.

Use original educational explanations, not copied copyrighted course material.

# 18. ADMIN DASHBOARD

Create a secure admin area.

Admin capabilities:

- Dashboard analytics.
- Manage users.
- Create and edit learning modules.
- Manage lessons.
- Manage quizzes.
- Manage interview questions.
- Manage hazard scenarios.
- Manage glossary entries.
- Manage references.
- Publish/unpublish content.
- Review reported content issues.

Protect admin functionality through verified server-side authorization and database policies.

Do not trust client-side role checks alone.

# 19. DATABASE AND SECURITY

Implement a properly structured Supabase database.

Create migrations and appropriate relationships for:

- profiles.
- learning_preferences.
- modules.
- lessons.
- lesson_steps.
- lesson_progress.
- quiz_questions.
- quiz_options.
- quiz_attempts.
- scenarios.
- scenario_attempts.
- interview_questions.
- interview_sessions.
- interview_answers.
- glossary_terms.
- saved_lessons.
- user_notes.
- achievements.
- user_achievements.
- references.
- user_roles.

Add timestamps, ownership fields, validation, and appropriate indexes.

Implement strict Row Level Security.

A user must only access their own private progress, notes, attempts, and personal records.

Published learning content can be read by authorized users.

Only verified administrators can manage published content.

Do not store passwords manually.

Do not expose secret keys.

# 20. NAVIGATION AND SCREEN ARCHITECTURE

Create a clear mobile navigation structure.

Recommended bottom navigation:

1. Home.
2. Academy.
3. Practice.
4. Tools.
5. Profile.

Create dedicated screens for:

- Splash screen.
- Onboarding.
- Authentication.
- Dashboard.
- Learning journey.
- Module details.
- Lesson player.
- Quiz.
- Quiz results.
- Hazard identification lab.
- Risk assessment lab.
- Documentation lab.
- Interview simulator.
- Interview results.
- Glossary.
- AI learning coach.
- First 30 days roadmap.
- User profile.
- Settings.
- Admin screens.

Every visible button must perform its actual advertised action.

Do not create dead buttons or decorative interactions.

# 21. OFFLINE AND PERFORMANCE

Implement sensible offline support.

Where practical:
- Cache published lesson content.
- Save learning notes locally until synchronization.
- Maintain clear online/offline indicators.
- Synchronize user progress safely when connectivity returns.

Handle:
- Loading states.
- Empty states.
- Errors.
- Network failures.
- Authentication expiry.

Optimize for real Android phones, not just desktop previews.

Keep animations smooth and avoid unnecessary rendering or expensive blur effects on every component.

# 22. DEVELOPMENT WORKFLOW

Work autonomously within the current project workspace.

Before making changes:

1. Inspect the current directory.
2. Understand the available environment.
3. Detect whether a project already exists.
4. Avoid overwriting unrelated files or projects.
5. Create a new `hse-fieldready` project folder if needed and safe.

Never reuse old project directories, codebases, or assets without explicit authorization.

Do not delete user data.

Do not run destructive commands.

Do not require unnecessary user intervention.

Implement the application in logical phases:

PHASE A — Project architecture and setup.

PHASE B — Design system and Liquid Glass components.

PHASE C — Authentication and onboarding.

PHASE D — Main dashboard and learning journey.

PHASE E — Complete lesson engine and quiz system.

PHASE F — Practical learning labs.

PHASE G — Interview preparation and AI integration.

PHASE H — Admin panel and database integration.

PHASE I — Testing, bug fixing, and optimization.

Do not stop after writing a development plan. Continue implementing the application.

# 23. QUALITY ASSURANCE

Before declaring completion:

- Run TypeScript checks.
- Run linting where configured.
- Run available automated tests.
- Verify navigation.
- Verify database queries.
- Verify authentication flows where credentials are available.
- Verify lesson progress persistence.
- Verify quiz scoring.
- Verify saved notes.
- Verify permissions and RLS policies.
- Check all visible buttons and forms.
- Review layouts on small Android screens.
- Check offline and error states.
- Run Expo diagnostics where applicable.

Fix the errors you discover.

Do not claim a feature works unless you have actually tested it.

If an external service or missing credential prevents complete integration, implement the safe working fallback and document the exact remaining configuration requirement.

# 24. FINAL DELIVERABLES

Deliver:

1. Complete working application source code.
2. Organized project architecture.
3. Supabase database migrations.
4. Seeded educational learning content.
5. Working Liquid Glass design system.
6. User authentication and personalized learning.
7. Functional quiz and progress system.
8. Practical learning labs.
9. Interview preparation system.
10. Secure admin functionality.
11. Environment configuration example.
12. Setup and run instructions.
13. Testing report.
14. List of features actually completed.
15. List of integrations still requiring credentials, if any.

Provide the exact commands to run the project on Android.

Include the exact command to start Expo and instructions for opening the application on a physical Android device.

# FINAL PRODUCT STANDARD

Think like a professional product team, not a code generator.

Do not sacrifice functionality for appearance.

Do not sacrifice design quality for functionality.

The application must combine:

PREMIUM LIQUID GLASS DESIGN
+
STRUCTURED HSE EDUCATION
+
PERSONALIZED LEARNING
+
PRACTICAL INDUSTRIAL TRAINING
+
INTERVIEW PREPARATION
+
REAL PROGRESS TRACKING

The final experience should make a complete beginner feel that they are enrolled in a premium professional HSE academy.

Build HSE FieldReady as a serious, maintainable product that can evolve into a full HSE career development platform.

Start by inspecting the workspace, then implement the application. Do not stop at planning or a static prototype.
