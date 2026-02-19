# SKILLCLIMB

**A Generic Test-Driven Learning Platform**

*Built on Desirable Difficulties, Spaced Repetition, and Adaptive Assessment*

---

**Platform Specification — Version 1.0 — February 2026**

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Learning Science Foundations](#learning-science-foundations)
3. [Spaced Repetition System](#spaced-repetition-system)
4. [Knowledge Hierarchy](#knowledge-hierarchy)
5. [Question Engine](#question-engine)
6. [Instructional Content Delivery](#instructional-content-delivery)
7. [Progress Visualization and Analytics](#progress-visualization-and-analytics)
8. [AI Tutor Integration](#ai-tutor-integration)
9. [Gamification and Motivation Design](#gamification-and-motivation-design)
10. [Content Pack System](#content-pack-system)
11. [Technical Architecture](#technical-architecture)
12. [Implementation Roadmap](#implementation-roadmap)
13. [Success Metrics](#success-metrics)
14. [Risks and Mitigations](#risks-and-mitigations)
15. [Conclusion](#conclusion)
16. [References](#references)

---

## Executive Summary

SkillClimb is a test-driven learning platform that inverts the traditional tutorial-first model. Instead of presenting lessons followed by quizzes, SkillClimb leads with assessment: learners encounter challenging questions and practical challenges first, exposing knowledge gaps before any instruction occurs. Instruction is then delivered precisely where gaps are identified, making every minute of study maximally efficient.

The platform is grounded in cognitive science research on durable learning, particularly the framework of desirable difficulties articulated by Robert Bjork and synthesized in the book *Make It Stick* by Peter Brown, Henry Roediger, and Mark McDaniel. A spaced repetition engine (based on a modified SM-2 algorithm) ensures that knowledge, once acquired, is retained over the long term through optimally timed review.

SkillClimb works with arbitrary skill trees via a **content pack system**. Each content pack defines a domain of knowledge — its structure, questions, prerequisites, and progression. The platform handles all the learning science, adaptive assessment, and spaced repetition; content packs supply the subject matter. The first and primary content pack covers cybersecurity (see `CYBERCLIMB.md`).

Learners always know where they stand, what they don't know yet, and exactly what to do next.

---

## Learning Science Foundations

SkillClimb's pedagogy is not incidental—it is the product itself. Every design decision flows from evidence-based learning principles. This section outlines the research foundations and how each maps to application features.

### Desirable Difficulties

Robert Bjork's research demonstrates that learning conditions which make initial acquisition harder often produce stronger, more durable, and more transferable knowledge. SkillClimb deliberately engineers these productive struggles into every interaction.

> **Core Principle:** If learning feels easy, it's probably not sticking. SkillClimb is designed to feel challenging—and to make that challenge feel rewarding rather than punishing.

### Testing Effect (Retrieval Practice)

Retrieving information from memory strengthens that memory far more effectively than re-reading or re-watching material. Roediger and Karpicke's research shows that even failed retrieval attempts enhance subsequent learning. SkillClimb operationalizes this by leading with tests: learners attempt to answer questions before they've studied the material. Incorrect answers become powerful learning moments because the brain is primed to encode the correct answer after a failed retrieval attempt.

### Interleaving

Rather than blocking practice by topic (all questions from one domain, then another), SkillClimb interleaves questions across related domains within a session. Research by Kornell and Bjork demonstrates that interleaving forces learners to practice discriminating between problem types, which strengthens the ability to identify which knowledge to apply in novel situations—a critical skill in any complex domain.

### Spacing Effect

Massed practice (cramming) produces rapid initial learning but poor long-term retention. Distributed practice across expanding intervals produces dramatically better retention over weeks and months. SkillClimb's spaced repetition engine automates optimal spacing for every piece of knowledge in the skill tree.

### Generation Effect

Generating an answer—even an incorrect one—before being shown the correct answer produces stronger encoding than passive study. SkillClimb uses open-ended question formats (explain this concept, demonstrate this skill, identify this pattern) that require generation rather than recognition.

### Calibration and Metacognition

*Make It Stick* emphasizes that learners are poor judges of their own knowledge. Fluency illusions (the feeling of understanding that comes from re-reading familiar material) lead to overconfidence. SkillClimb's test-first approach provides constant, objective feedback on actual knowledge state, training learners to accurately calibrate their confidence. After each answer, learners rate their confidence, and the system tracks calibration accuracy over time.

### Elaborative Interrogation

Asking "why" and "how" questions forces deeper processing than simple factual recall. SkillClimb includes elaboration prompts that ask learners to explain the reasoning behind their answers, connect concepts to other domains, and generate analogies. These elaboration responses can optionally be evaluated by an AI tutor for feedback.

---

## Spaced Repetition System

### Algorithm Design

SkillClimb uses a modified SM-2 algorithm (originally developed by Piotr Wozniak for SuperMemo) adapted for hierarchical, interconnected skill trees. The core modification is the integration of difficulty-weighted intervals that account for the inherent complexity differences between topics and the structural importance of foundational knowledge.

Each knowledge item (called a **node**) in the system carries the following state:

| Parameter | Type | Description |
|-----------|------|-------------|
| `easiness` | Float (1.3–5.0) | How easily this node is recalled; starts at 2.5 |
| `interval` | Integer (days) | Current gap between reviews |
| `repetitions` | Integer | Consecutive successful recalls |
| `due_date` | Date | Next scheduled review |
| `confidence_history` | Array | Learner's self-rated confidence vs. actual performance |
| `domain_weight` | Float (0.5–2.0) | Multiplier based on topic complexity and dependency depth |

### Scoring and Interval Calculation

After each review, the learner's response quality is scored on a 0–5 scale. Scores of 3 and above are considered successful recalls; below 3 triggers a reset to short intervals. The interval calculation follows this logic:

- **Score 0–2 (fail):** Reset repetitions to 0. Interval resets to 1 day. Easiness factor decreases (minimum 1.3). Node is flagged for re-instruction.
- **Score 3 (hard pass):** Increment repetitions. Interval grows conservatively. Easiness factor decreases slightly.
- **Score 4 (good):** Increment repetitions. Interval = previous interval × easiness factor. No change to easiness.
- **Score 5 (perfect):** Increment repetitions. Interval = previous interval × easiness factor. Easiness increases slightly.

The `domain_weight` multiplier adjusts intervals based on topic complexity. Highly interconnected topics (those that serve as prerequisites for many other domains) receive shorter intervals to ensure retention of foundational knowledge.

### Interleaving in Review Sessions

Review sessions draw from multiple domains simultaneously. The session builder uses a weighted random selection that balances three priorities: overdue nodes (highest priority), nodes from recently studied domains (to enable interleaving), and nodes from prerequisite domains of the learner's current focus area (to reinforce foundations). Each session contains 15–25 items, calibrated to a target duration of 15–20 minutes.

---

## Knowledge Hierarchy

### Four-Level Structure

All content packs use a four-level hierarchy that maps cleanly to both the knowledge landscape and the spaced repetition system.

| Level | Description | Contains | Count (est. per pack) |
|-------|-------------|----------|----------------------|
| Tier | Broadest grouping (e.g., Foundations, Intermediate, Advanced) | 3–6 domains | 3–5 tiers |
| Domain | A coherent area of knowledge | 4–10 topics | ~25 domains |
| Topic | A focused subtopic within a domain | 5–15 nodes | ~150 topics |
| Node | An atomic knowledge unit with question templates | 1–4 question types | ~1,200 nodes |

### Prerequisite Graph

Domains are connected by prerequisite edges forming a directed acyclic graph (DAG). A domain unlocks for assessment when all prerequisites reach a minimum competency threshold (60% of nodes at "good" or above in the SRS). This prevents learners from attempting material they lack the foundations for, while allowing them to test into higher tiers if they already have the knowledge.

The prerequisite graph is designed to be a partial order, not a strict linear sequence. Learners can explore multiple domains in parallel as long as prerequisites are met.

### Placement Testing

New users begin with a diagnostic assessment that uses adaptive testing (item response theory) to rapidly estimate their competency across all tiers. The placement test begins with mid-difficulty items and adjusts up or down based on responses. In approximately 40–60 questions (15–20 minutes), the system can identify which domains the learner has already mastered, which they partially know, and which are entirely new. Mastered domains are marked as complete; partially known domains enter the SRS with adjusted intervals; unknown domains are queued for learning.

> **Test-First Philosophy:** No learner should ever be forced to sit through material they already know. The fastest path to expertise is to identify exactly what you don't know and focus exclusively on those gaps. SkillClimb's placement test and ongoing assessment ensure this is always the case.

---

## Question Engine

### Question Types

Each node supports multiple question types, ordered by increasing desirable difficulty. The system progressively introduces harder question types as the learner demonstrates competency with easier ones.

| Type | Format | Difficulty | Learning Principle |
|------|--------|------------|-------------------|
| Recognition | Multiple choice (4 options) | Low — recognition memory | Baseline assessment |
| Cued Recall | Fill-in-the-blank, short answer | Medium — retrieval with cues | Retrieval practice |
| Free Recall | Open-ended explanation | High — uncued generation | Generation effect |
| Application | Scenario-based problem | High — transfer | Interleaving, transfer |
| Practical | Interactive lab / hands-on challenge | Highest — real-world context | Contextual interference |

> **Current Implementation:** Study sessions use recall-based self-assessment (learners rate their own recall quality). Placement tests use machine-scored multiple choice. The full progressive question type system is planned for future phases.

### Adaptive Difficulty

The question engine uses a target difficulty zone calibrated to approximately 60–80% success rate—the empirical sweet spot where desirable difficulties maximize learning. If a learner is succeeding at 90%+ on recognition questions, the engine escalates to cued recall. If they're below 50% on free recall, it drops back to cued recall with scaffolding. This adaptive calibration ensures the learner is always operating in the zone of proximal development.

### Confidence Calibration

Before revealing the correct answer, the learner rates their confidence on a 1–5 scale. The system tracks four quadrants: high confidence + correct (calibrated knowledge), high confidence + incorrect (dangerous illusion of competence), low confidence + correct (undervalued knowledge), and low confidence + incorrect (known unknown). The most critical quadrant is high-confidence errors—these represent exactly the kind of fluency illusion that *Make It Stick* warns about. SkillClimb flags these items for immediate re-teaching with elaboration prompts and reduces their SRS easiness factor aggressively.

### Elaboration Prompts

After answering any question (correctly or not), the learner may be prompted to elaborate. Elaboration prompts include: explain why this answer is correct in your own words, identify how this concept connects to a different domain, describe a real-world scenario where this knowledge would be critical, and explain what would happen if the opposite were true. These prompts are evaluated by an LLM-based tutor that provides feedback on the quality and accuracy of the elaboration, closing the loop on deep understanding.

---

## Instructional Content Delivery

SkillClimb is test-first, but it is not test-only. When the assessment engine identifies a genuine gap—a node where the learner has failed retrieval multiple times—it delivers targeted instruction. The key difference from traditional platforms is that instruction is always preceded by a retrieval attempt, priming the learner's attention.

### Content Formats

- **Micro-lessons (2–5 minutes):** Concise explanations of a single concept, optimized for the specific gap identified by assessment. Written in clear, direct prose with concrete examples.
- **Worked examples:** Step-by-step walkthroughs of a problem or scenario, with annotations explaining the reasoning at each step. Research shows worked examples are highly effective for novices.
- **Interactive labs:** Browser-based environments where learners practice skills and solve challenges in realistic contexts. Lab formats vary by content pack.
- **Concept maps:** Visual representations showing how the current concept connects to other nodes in the skill tree, reinforcing the network structure of knowledge.

### Correction and Feedback

When a learner answers incorrectly, the feedback follows a specific sequence designed to maximize learning from the error. First, the system reveals that the answer was incorrect without immediately showing the correct answer. The learner is given a second attempt with a hint, activating another retrieval attempt. If the second attempt fails, the correct answer is shown alongside an explanation of why the learner's answer was wrong and what misconception it likely reflects. Finally, the node is scheduled for review at a shortened interval.

---

## Progress Visualization and Analytics

### Skill Tree Map

The primary interface is an interactive skill tree map showing all domains, their prerequisite connections, and the learner's current state in each. Domains are color-coded by mastery level: unexplored (locked gray), assessed but not started (red), in progress (amber), and mastered (green). The visual representation reinforces the learner's mental model of how knowledge is structured and interconnected.

### Knowledge Decay Visualization

Mastered domains gradually fade from bright green toward amber as their nodes approach SRS due dates, providing a visual reminder that knowledge requires maintenance. This visual decay motivates regular review sessions and helps learners understand that expertise is not a one-time achievement but an ongoing practice.

### Calibration Dashboard

A dedicated analytics view shows the learner's confidence calibration over time, broken down by domain. The target is for the learner's confidence ratings to closely track their actual performance—a sign of accurate self-assessment. Improving calibration is itself a learning objective, as accurate metacognition is one of the strongest predictors of effective self-directed learning.

### Session Analytics

After each session, a summary shows: items reviewed, success rate, domains covered, time spent, and a comparison to the target difficulty zone. Over time, trend charts show the learner's expanding competency across the skill tree and their improving retention curves.

---

## AI Tutor Integration

SkillClimb integrates an LLM-based tutor (via the Anthropic API) at several key points in the learning loop. The tutor is not a replacement for structured content—it is a supplement that provides personalized feedback where static content cannot.

### Tutor Touchpoints

- **Elaboration evaluation:** When a learner writes a free-form explanation, the tutor assesses whether the explanation demonstrates genuine understanding or surface-level repetition of memorized phrases. It provides targeted feedback on gaps in reasoning.
- **Socratic hints:** When a learner struggles with a question, rather than revealing the answer, the tutor asks a guiding question designed to help the learner reach the answer themselves. This preserves the generation effect.
- **Misconception detection:** The tutor analyzes patterns of wrong answers to identify systematic misconceptions and generates targeted correction content.
- **Adaptive scenario generation:** For application-level questions, the tutor generates novel scenarios based on the learner's current skill profile, ensuring that practice material stays fresh and contextually varied.

### Cost Management

AI tutor calls are reserved for high-value interactions: free recall evaluation, misconception analysis, and scenario generation. Recognition and cued recall questions use deterministic scoring. Estimated cost per active learner per month is $2–5 at current API pricing, based on approximately 40–60 AI-evaluated interactions per month.

---

## Gamification and Motivation Design

Gamification in SkillClimb is designed to reinforce effective learning behaviors, not to create addictive feedback loops. Every reward mechanism maps to a genuine learning outcome.

### Streak and Consistency

Daily review streaks are tracked and celebrated, because the single most important factor in SRS effectiveness is session consistency. The system sends reminders calibrated to the learner's preferred study time. Missing a day does not reset the streak counter entirely; instead, a "freeze" system allows one missed day per week without breaking the streak, reducing anxiety while maintaining habit formation.

### Mastery Badges

Completing all nodes in a domain at the "mastered" SRS level earns a domain badge. Badges decay if nodes fall below mastery threshold due to missed reviews, reinforcing that expertise requires ongoing maintenance.

### Calibration Score

A visible calibration score (0–100) reflects how accurately the learner predicts their own performance. Improving this score is framed as a primary achievement because accurate self-assessment is itself a high-value professional skill.

### Challenge Mode

Periodic cross-domain synthesis challenges present scenarios that require combining knowledge from multiple domains under time pressure. These are unlocked at tier transitions and serve as both assessments and motivation milestones. Top scores are displayed on an optional leaderboard. Content packs define the specific challenge scenarios relevant to their domain.

---

## Content Pack System

SkillClimb is a generic platform — all subject-matter content is delivered through **content packs**. Each pack defines a complete skill tree (tiers, domains, topics, nodes, questions, prerequisites) for a specific domain of knowledge.

### Directory Structure

Content packs live in `packages/backend/src/content/<pack-id>/`. Each pack contains:

```
packages/backend/src/content/<pack-id>/
├── index.ts          # Exports a ContentPack object
└── domains/          # Individual domain seed files
    ├── domain-a.ts
    ├── domain-b.ts
    └── ...
```

### ContentPack Interface

Each pack's `index.ts` exports a `ContentPack` object with:

- **name / id** — Display name and unique identifier for the pack.
- **tierBases** — Maps tier numbers to base difficulty values used by the IRT placement algorithm.
- **domains** — Array of domain definitions, each containing a domain descriptor, its topics, and its nodes (with question templates).
- **prerequisites** — Maps domain names to arrays of prerequisite domain names, defining the DAG.
- **placeholderDomains** — Domains that are planned but not yet seeded with content. Displayed in the skill tree as locked/coming-soon.

### Seeding

The seed script (`npm run seed`) auto-discovers all content packs and loads them into the database. Seeding is idempotent — it uses `onConflictDoNothing` so it can be re-run safely without destroying existing data. To seed a specific pack: `npm run seed -- --pack <pack-id>`.

### Creating a New Content Pack

1. Create a directory under `packages/backend/src/content/` with your pack ID.
2. Define your tier structure, domains, topics, and nodes following the `ContentPack` interface.
3. Export the pack from `index.ts`.
4. Run `npm run seed -- --pack <your-pack-id>` to load the content.

The platform handles all SRS scheduling, session building, placement testing, progress tracking, and analytics. Content packs only need to supply the knowledge structure and questions.

---

## Technical Architecture

### Stack Overview

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | React + TypeScript | Component model suits skill tree UI; strong ecosystem for data viz |
| State Mgmt | Zustand + React Query | Lightweight, suits offline-first SRS with server sync |
| Backend API | Express + TypeScript | Fast iteration; tsx for development |
| Database | PostgreSQL (Drizzle ORM) | JSONB for flexible question/answer schemas; strong query planner |
| AI Tutor | Claude API | Elaboration evaluation, adaptive hint generation, explanation quality |
| Lab Environment | Docker containers | Isolated, disposable environments for practical challenges |
| Monorepo | npm workspaces | Three packages: `@skillclimb/core`, `@skillclimb/backend`, `@skillclimb/frontend` |

### Data Model (Core Entities)

| Entity | Key Fields | Relationships |
|--------|-----------|---------------|
| User | id, email, settings, calibration_stats | has_many: learner_nodes, sessions |
| Tier | id, name, tier_number, base_difficulty | has_many: domains |
| Domain | id, tier_id, name, description, display_order | has_many: topics; belongs_to: tier |
| Topic | id, domain_id, name, complexity_weight | has_many: nodes; belongs_to: domain |
| Node | id, topic_id, concept, question_templates[] | has_many: learner_nodes |
| LearnerNode | user_id, node_id, easiness, interval, reps, due_date | SRS state per user per node |
| Review | learner_node_id, score, confidence, response, timestamp | Individual review event record |
| Session | user_id, started_at, items[], analytics | A single study session grouping reviews |

### Functional Core / Imperative Shell

Domain logic lives in `@skillclimb/core` as pure functions with no side effects:
- **SRS engine** (`srs/sm2.ts`) — `calculateEasiness`, `calculateInterval`, `calculateNextState`, `isDue`, `daysOverdue`
- **IRT module** (`irt/irt.ts`) — `computeDifficulty`, `irtProbability`, `fisherInformation`, `estimateTheta`
- **Scoring** (`scoring/scoring.ts`) — `evaluateRecognition`, `getCalibrationQuadrant`, `updateCalibration`
- **Session builder** (`session/builder.ts`) — study session generation
- **Progress** (`progress/progress.ts`) — mastery tracking and progress calculation
- **Calibration** (`calibration/calibration.ts`) — confidence calibration analytics

All I/O, database access, API calls, and state mutations are pushed to the outer shell: backend services (`@skillclimb/backend`) and frontend components (`@skillclimb/frontend`).

### Offline-First SRS

The SRS state is stored locally in the browser (IndexedDB via Dexie.js) and synced to the server when online. This ensures learners can complete review sessions without network connectivity—critical for learning consistency. Conflict resolution uses a last-write-wins strategy on the server with client-side timestamps, appropriate for the single-user-per-account access pattern.

---

## Implementation Roadmap

The roadmap is organized as ordered phases. Each phase produces a usable product; subsequent phases add depth and sophistication.

### Phase 1: Foundation ✅

Establish core data models, SRS engine, and basic question delivery.

1. Define and implement the PostgreSQL schema for tiers, domains, topics, nodes, learner state, and reviews.
2. Build the SM-2 algorithm module with domain_weight modifications and unit tests validating interval calculations.
3. Implement the session builder that selects review items based on due dates, interleaving priorities, and prerequisite reinforcement.
4. Create a minimal React frontend: single-question view with answer input, confidence rating, and feedback display.
5. Seed the database with initial content pack domains.

### Phase 2: Assessment and Placement ✅

Build the adaptive testing engine and placement flow.

1. Implement the item response theory (IRT) module for adaptive question selection during placement tests.
2. Build the placement test flow: 40–60 adaptive questions that estimate competency across all tiers.
3. Create the skill tree map visualization with domain states, prerequisite edges, and mastery color-coding.
4. Implement the confidence calibration tracking system and the four-quadrant analysis.
5. Expand content pack coverage.

### Phase 3: AI Tutor and Content Depth

Integrate the LLM tutor and expand content across the full skill tree.

1. Integrate Anthropic API for elaboration evaluation, Socratic hints, and misconception detection.
2. Build the elaboration prompt system with free-form answer UI and AI feedback display.
3. Implement adaptive difficulty escalation across question types (recognition → cued recall → free recall → application).
4. Expand content packs to cover intermediate and advanced domains.
5. Build the second-attempt hint system for incorrect answers.

### Phase 4: Labs and Advanced Features

Add practical lab environments and advanced analytics.

1. Build Docker-based lab environments for practical challenges (hands-on exercises defined by content packs).
2. Implement the analytics dashboard: session summaries, retention curves, calibration trends, domain progress.
3. Build cross-domain challenge mode with scenario generation.
4. Implement offline-first SRS with IndexedDB and server sync.

### Phase 5: Polish and Launch

Refine the experience, add gamification, and prepare for launch.

1. Implement streak tracking, mastery badges, calibration score, and optional leaderboard.
2. Build notification system for review reminders with learner-preferred timing.
3. Performance optimization: lazy loading of skill tree, question prefetching, SRS calculation caching.
4. User testing with beta users; iterate on question quality and difficulty calibration.
5. Launch publicly as a web application.

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| 7-day retention | >60% of new users complete 7 sessions | Cohort analysis |
| 30-day retention | >35% still active after 30 days | DAU/MAU ratio |
| SRS adherence | >80% of due reviews completed on time | Overdue node ratio |
| Calibration improvement | Mean calibration score improves 20% in first month | Calibration trend analysis |
| Knowledge retention | >85% of mastered nodes recalled at 30-day review | Long-term SRS score tracking |

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Content creation bottleneck | Slow domain expansion; incomplete skill trees | Use AI-assisted question generation with expert review; prioritize high-demand packs |
| SRS parameter tuning | Intervals too short (burnout) or too long (forgetting) | A/B test parameters; track long-term retention rates; allow user overrides |
| AI tutor cost scaling | API costs exceed revenue per user | Batch API for non-real-time evaluation; cache common misconception responses; rate-limit AI interactions |
| Learner frustration with difficulty | Dropoff due to test-first approach feeling punishing | Careful onboarding explaining the science; celebrate growth from errors; normalize productive struggle |
| Content freshness | Rapidly evolving fields make content stale | Quarterly content reviews; community contribution pipeline; AI-assisted update detection |

---

## Conclusion

SkillClimb is designed around a conviction supported by decades of cognitive science research: the fastest path to expertise is not to study more, but to test more—and to test strategically. By combining desirable difficulties, spaced repetition, adaptive assessment, and AI-powered tutoring within the structure of a content pack system, the platform offers a learning experience that is simultaneously more efficient, more engaging, and more durable than traditional approaches.

The implementation roadmap delivers a functional learning platform in phases, with each phase producing a usable product. Phase 1 alone yields a working SRS-powered quiz engine that a motivated learner could use immediately. Each subsequent phase adds depth, breadth, and sophistication.

The content pack architecture means SkillClimb can grow into any domain where structured, hierarchical knowledge and spaced repetition are valuable — from cybersecurity to programming, from medicine to law, from language learning to mathematics.

---

## References

- Brown, P.C., Roediger, H.L., & McDaniel, M.A. (2014). *Make It Stick: The Science of Successful Learning.* Harvard University Press.
- Bjork, R.A. (1994). Memory and metamemory considerations in the training of human beings. In Metcalfe & Shimamura (Eds.), *Metacognition: Knowing About Knowing.* MIT Press.
- Roediger, H.L. & Karpicke, J.D. (2006). Test-enhanced learning: Taking memory tests improves long-term retention. *Psychological Science, 17*(3), 249–255.
- Kornell, N. & Bjork, R.A. (2008). Learning concepts and categories: Is spacing the enemy of induction? *Psychological Science, 19*(6), 585–592.
- Wozniak, P.A. & Gorzelanczyk, E.J. (1994). Optimization of repetition spacing in the practice of learning. *Acta Neurobiologiae Experimentalis, 54*, 59–68.
- Dunlosky, J. et al. (2013). Improving students' learning with effective learning techniques. *Psychological Science in the Public Interest, 14*(1), 4–58.
