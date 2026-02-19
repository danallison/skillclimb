# CYBERCLIMB

> **Note:** This document describes the Cybersecurity content pack for SkillClimb. The platform itself is now generic — see `CLAUDE.md` for the overall architecture.

**A Test-Driven Cybersecurity Learning Platform**

*Built on Desirable Difficulties, Spaced Repetition, and Adaptive Assessment*

---

**Implementation Plan — Version 1.0 — February 2026**

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Learning Science Foundations](#learning-science-foundations)
3. [Spaced Repetition System](#spaced-repetition-system)
4. [Skill Tree Architecture](#skill-tree-architecture)
5. [Question Engine](#question-engine)
6. [Instructional Content Delivery](#instructional-content-delivery)
7. [Progress Visualization and Analytics](#progress-visualization-and-analytics)
8. [Technical Architecture](#technical-architecture)
9. [AI Tutor Integration](#ai-tutor-integration)
10. [Gamification and Motivation Design](#gamification-and-motivation-design)
11. [Implementation Roadmap](#implementation-roadmap)
12. [Monetization Strategy](#monetization-strategy)
13. [Success Metrics](#success-metrics)
14. [Risks and Mitigations](#risks-and-mitigations)
15. [Conclusion](#conclusion)
16. [References](#references)

---

## Executive Summary

CyberClimb is a test-driven cybersecurity learning application that inverts the traditional tutorial-first model. Instead of presenting lessons followed by quizzes, CyberClimb leads with assessment: learners encounter challenging questions and practical challenges first, exposing knowledge gaps before any instruction occurs. Instruction is then delivered precisely where gaps are identified, making every minute of study maximally efficient.

The application is grounded in cognitive science research on durable learning, particularly the framework of desirable difficulties articulated by Robert Bjork and synthesized in the book *Make It Stick* by Peter Brown, Henry Roediger, and Mark McDaniel. A spaced repetition engine (based on a modified SM-2 algorithm) ensures that knowledge, once acquired, is retained over the long term through optimally timed review.

The platform covers the full cybersecurity skill tree, from networking fundamentals through AI security specializations, organized as an explorable, progressively unlockable map. Learners always know where they stand, what they don't know yet, and exactly what to do next.

---

## Learning Science Foundations

CyberClimb's pedagogy is not incidental—it is the product itself. Every design decision flows from evidence-based learning principles. This section outlines the research foundations and how each maps to application features.

### Desirable Difficulties

Robert Bjork's research demonstrates that learning conditions which make initial acquisition harder often produce stronger, more durable, and more transferable knowledge. CyberClimb deliberately engineers these productive struggles into every interaction.

> **Core Principle:** If learning feels easy, it's probably not sticking. CyberClimb is designed to feel challenging—and to make that challenge feel rewarding rather than punishing.

### Testing Effect (Retrieval Practice)

Retrieving information from memory strengthens that memory far more effectively than re-reading or re-watching material. Roediger and Karpicke's research shows that even failed retrieval attempts enhance subsequent learning. CyberClimb operationalizes this by leading with tests: learners attempt to answer questions before they've studied the material. Incorrect answers become powerful learning moments because the brain is primed to encode the correct answer after a failed retrieval attempt.

### Interleaving

Rather than blocking practice by topic (all network questions, then all crypto questions), CyberClimb interleaves questions across related domains within a session. Research by Kornell and Bjork demonstrates that interleaving forces learners to practice discriminating between problem types, which strengthens the ability to identify which knowledge to apply in novel situations—a critical skill in real-world cybersecurity incident response.

### Spacing Effect

Massed practice (cramming) produces rapid initial learning but poor long-term retention. Distributed practice across expanding intervals produces dramatically better retention over weeks and months. CyberClimb's spaced repetition engine automates optimal spacing for every piece of knowledge in the skill tree.

### Generation Effect

Generating an answer—even an incorrect one—before being shown the correct answer produces stronger encoding than passive study. CyberClimb uses open-ended question formats (explain this concept, write this command, identify this vulnerability) that require generation rather than recognition.

### Calibration and Metacognition

*Make It Stick* emphasizes that learners are poor judges of their own knowledge. Fluency illusions (the feeling of understanding that comes from re-reading familiar material) lead to overconfidence. CyberClimb's test-first approach provides constant, objective feedback on actual knowledge state, training learners to accurately calibrate their confidence. After each answer, learners rate their confidence, and the system tracks calibration accuracy over time.

### Elaborative Interrogation

Asking "why" and "how" questions forces deeper processing than simple factual recall. CyberClimb includes elaboration prompts that ask learners to explain the reasoning behind their answers, connect concepts to other domains, and generate analogies. These elaboration responses can optionally be evaluated by an AI tutor for feedback.

---

## Spaced Repetition System

### Algorithm Design

CyberClimb uses a modified SM-2 algorithm (originally developed by Piotr Wozniak for SuperMemo) adapted for the cybersecurity domain. The core modification is the integration of difficulty-weighted intervals that account for the inherent complexity differences between cybersecurity topics.

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

The `domain_weight` multiplier adjusts intervals based on topic complexity. Highly interconnected topics (like cryptography, which underpins many other domains) receive shorter intervals to ensure retention of foundational knowledge.

### Interleaving in Review Sessions

Review sessions draw from multiple domains simultaneously. The session builder uses a weighted random selection that balances three priorities: overdue nodes (highest priority), nodes from recently studied domains (to enable interleaving), and nodes from prerequisite domains of the learner's current focus area (to reinforce foundations). Each session contains 15–25 items, calibrated to a target duration of 15–20 minutes.

---

## Skill Tree Architecture

### Domain Structure

The skill tree is organized into tiers, domains, topics, and nodes. This four-level hierarchy maps cleanly to both the cybersecurity knowledge landscape and the spaced repetition system.

| Level | Example | Contains | Count (est.) |
|-------|---------|----------|-------------|
| Tier | T0: Foundations | 3–6 domains | 5 tiers |
| Domain | Cryptography | 4–10 topics | ~25 domains |
| Topic | Symmetric Encryption | 5–15 nodes | ~150 topics |
| Node | AES block modes | 1–4 question types | ~1,200 nodes |

### Prerequisite Graph

Domains are connected by prerequisite edges forming a directed acyclic graph (DAG). A domain unlocks for assessment when all prerequisites reach a minimum competency threshold (60% of nodes at "good" or above in the SRS). This prevents learners from attempting material they lack the foundations for, while allowing them to test into higher tiers if they already have the knowledge.

The prerequisite graph is designed to be a partial order, not a strict linear sequence. Learners can explore multiple domains in parallel as long as prerequisites are met. For example, after completing T0 foundations, a learner could pursue penetration testing and SOC operations simultaneously, since they share prerequisites but don't depend on each other.

### Placement Testing

New users begin with a diagnostic assessment that uses adaptive testing (item response theory) to rapidly estimate their competency across all tiers. The placement test begins with mid-difficulty items and adjusts up or down based on responses. In approximately 40–60 questions (15–20 minutes), the system can identify which domains the learner has already mastered, which they partially know, and which are entirely new. Mastered domains are marked as complete; partially known domains enter the SRS with adjusted intervals; unknown domains are queued for learning.

> **Test-First Philosophy:** No learner should ever be forced to sit through material they already know. The fastest path to expertise is to identify exactly what you don't know and focus exclusively on those gaps. CyberClimb's placement test and ongoing assessment ensure this is always the case.

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
| Practical | Interactive lab / CLI challenge | Highest — real-world context | Contextual interference |

### Adaptive Difficulty

The question engine uses a target difficulty zone calibrated to approximately 60–80% success rate—the empirical sweet spot where desirable difficulties maximize learning. If a learner is succeeding at 90%+ on recognition questions, the engine escalates to cued recall. If they're below 50% on free recall, it drops back to cued recall with scaffolding. This adaptive calibration ensures the learner is always operating in the zone of proximal development.

### Confidence Calibration

Before revealing the correct answer, the learner rates their confidence on a 1–5 scale. The system tracks four quadrants: high confidence + correct (calibrated knowledge), high confidence + incorrect (dangerous illusion of competence), low confidence + correct (undervalued knowledge), and low confidence + incorrect (known unknown). The most critical quadrant is high-confidence errors—these represent exactly the kind of fluency illusion that *Make It Stick* warns about. CyberClimb flags these items for immediate re-teaching with elaboration prompts and reduces their SRS easiness factor aggressively.

### Elaboration Prompts

After answering any question (correctly or not), the learner may be prompted to elaborate. Elaboration prompts include: explain why this answer is correct in your own words, identify how this concept connects to a different domain, describe a real-world scenario where this knowledge would be critical, and explain what would happen if the opposite were true. These prompts are evaluated by an LLM-based tutor that provides feedback on the quality and accuracy of the elaboration, closing the loop on deep understanding.

---

## Instructional Content Delivery

CyberClimb is test-first, but it is not test-only. When the assessment engine identifies a genuine gap—a node where the learner has failed retrieval multiple times—it delivers targeted instruction. The key difference from traditional platforms is that instruction is always preceded by a retrieval attempt, priming the learner's attention.

### Content Formats

- **Micro-lessons (2–5 minutes):** Concise explanations of a single concept, optimized for the specific gap identified by assessment. Written in clear, direct prose with concrete examples.
- **Worked examples:** Step-by-step walkthroughs of a problem or scenario, with annotations explaining the reasoning at each step. Research shows worked examples are highly effective for novices.
- **Interactive labs:** Browser-based terminal environments where learners practice commands, configure systems, and solve challenges in realistic contexts.
- **Concept maps:** Visual representations showing how the current concept connects to other nodes in the skill tree, reinforcing the network structure of cybersecurity knowledge.

### Correction and Feedback

When a learner answers incorrectly, the feedback follows a specific sequence designed to maximize learning from the error. First, the system reveals that the answer was incorrect without immediately showing the correct answer. The learner is given a second attempt with a hint, activating another retrieval attempt. If the second attempt fails, the correct answer is shown alongside an explanation of why the learner's answer was wrong and what misconception it likely reflects. Finally, the node is scheduled for review at a shortened interval.

---

## Progress Visualization and Analytics

### Skill Tree Map

The primary interface is an interactive skill tree map showing all domains, their prerequisite connections, and the learner's current state in each. Domains are color-coded by mastery level: unexplored (locked gray), assessed but not started (red), in progress (amber), and mastered (green). The visual representation reinforces the learner's mental model of how cybersecurity knowledge is structured and interconnected.

### Knowledge Decay Visualization

Mastered domains gradually fade from bright green toward amber as their nodes approach SRS due dates, providing a visual reminder that knowledge requires maintenance. This visual decay motivates regular review sessions and helps learners understand that expertise is not a one-time achievement but an ongoing practice.

### Calibration Dashboard

A dedicated analytics view shows the learner's confidence calibration over time, broken down by domain. The target is for the learner's confidence ratings to closely track their actual performance—a sign of accurate self-assessment. Improving calibration is itself a learning objective, as accurate metacognition is one of the strongest predictors of effective self-directed learning.

### Session Analytics

After each session, a summary shows: items reviewed, success rate, domains covered, time spent, and a comparison to the target difficulty zone. Over time, trend charts show the learner's expanding competency across the skill tree and their improving retention curves.

---

## Technical Architecture

### Stack Overview

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | React + TypeScript | Component model suits skill tree UI; strong ecosystem for data viz |
| State Mgmt | Zustand + React Query | Lightweight, suits offline-first SRS with server sync |
| Backend API | Ruby on Rails | Existing expertise; fast iteration on data models and business logic |
| Background Jobs | Sidekiq + Redis | SRS scheduling, analytics aggregation, notification dispatch |
| Database | PostgreSQL | JSONB for flexible question/answer schemas; strong query planner |
| AI Tutor | Claude API (Sonnet) | Elaboration evaluation, adaptive hint generation, explanation quality |
| Lab Environment | Docker containers | Isolated, disposable environments for practical challenges |
| Hosting | Fly.io or Railway | Container-native deployment, global edge, simple scaling |

### Data Model (Core Entities)

| Entity | Key Fields | Relationships |
|--------|-----------|---------------|
| User | id, email, settings, calibration_stats | has_many :learner_nodes, :sessions |
| Domain | id, tier, name, description, prerequisites[] | has_many :topics; belongs_to :tier |
| Topic | id, domain_id, name, complexity_weight | has_many :nodes; belongs_to :domain |
| Node | id, topic_id, concept, question_templates[] | has_many :learner_nodes |
| LearnerNode | user_id, node_id, easiness, interval, reps, due_date | SRS state per user per node |
| Review | learner_node_id, score, confidence, response, timestamp | Individual review event record |
| Session | user_id, started_at, items[], analytics | A single study session grouping reviews |

### Offline-First SRS

The SRS state is stored locally in the browser (IndexedDB via Dexie.js) and synced to the server when online. This ensures learners can complete review sessions without network connectivity—critical for learning consistency. Conflict resolution uses a last-write-wins strategy on the server with client-side timestamps, appropriate for the single-user-per-account access pattern.

---

## AI Tutor Integration

CyberClimb integrates an LLM-based tutor (via the Anthropic API) at several key points in the learning loop. The tutor is not a replacement for structured content—it is a supplement that provides personalized feedback where static content cannot.

### Tutor Touchpoints

- **Elaboration evaluation:** When a learner writes a free-form explanation, the tutor assesses whether the explanation demonstrates genuine understanding or surface-level repetition of memorized phrases. It provides targeted feedback on gaps in reasoning.
- **Socratic hints:** When a learner struggles with a question, rather than revealing the answer, the tutor asks a guiding question designed to help the learner reach the answer themselves. This preserves the generation effect.
- **Misconception detection:** The tutor analyzes patterns of wrong answers to identify systematic misconceptions (e.g., confusing authentication with authorization) and generates targeted correction content.
- **Adaptive scenario generation:** For application-level questions, the tutor generates novel scenarios based on the learner's current skill profile, ensuring that practice material stays fresh and contextually varied.

### Cost Management

AI tutor calls are reserved for high-value interactions: free recall evaluation, misconception analysis, and scenario generation. Recognition and cued recall questions use deterministic scoring. Estimated cost per active learner per month is $2–5 at current API pricing, based on approximately 40–60 AI-evaluated interactions per month.

---

## Gamification and Motivation Design

Gamification in CyberClimb is designed to reinforce effective learning behaviors, not to create addictive feedback loops. Every reward mechanism maps to a genuine learning outcome.

### Streak and Consistency

Daily review streaks are tracked and celebrated, because the single most important factor in SRS effectiveness is session consistency. The system sends reminders calibrated to the learner's preferred study time. Missing a day does not reset the streak counter entirely; instead, a "freeze" system allows one missed day per week without breaking the streak, reducing anxiety while maintaining habit formation.

### Mastery Badges

Completing all nodes in a domain at the "mastered" SRS level earns a domain badge. Badges decay if nodes fall below mastery threshold due to missed reviews, reinforcing that cybersecurity expertise requires ongoing maintenance. This mirrors real-world certification renewal requirements.

### Calibration Score

A visible calibration score (0–100) reflects how accurately the learner predicts their own performance. Improving this score is framed as a primary achievement because accurate self-assessment is itself a high-value professional skill.

### Challenge Mode

Periodic "red team challenges" present cross-domain scenarios that require synthesizing knowledge from multiple domains under time pressure. These are unlocked at tier transitions and serve as both assessments and motivation milestones. Top scores are displayed on an optional leaderboard.

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1–4)

Establish core data models, SRS engine, and basic question delivery.

1. Define and implement the PostgreSQL schema for domains, topics, nodes, learner state, and reviews.
2. Build the SM-2 algorithm module with domain_weight modifications and unit tests validating interval calculations.
3. Implement the session builder that selects review items based on due dates, interleaving priorities, and prerequisite reinforcement.
4. Create a minimal React frontend: single-question view with answer input, confidence rating, and feedback display.
5. Seed the database with two complete domains (Networking Fundamentals and Security Principles) covering approximately 80 nodes.

### Phase 2: Assessment and Placement (Weeks 5–8)

Build the adaptive testing engine and placement flow.

1. Implement the item response theory (IRT) module for adaptive question selection during placement tests.
2. Build the placement test flow: 40–60 adaptive questions that estimate competency across all tiers.
3. Create the skill tree map visualization with domain states, prerequisite edges, and mastery color-coding.
4. Implement the confidence calibration tracking system and the four-quadrant analysis.
5. Add five more domains (Cryptography, Threat Landscape, Identity & Access, Network Security, Operating Systems).

### Phase 3: AI Tutor and Content Depth (Weeks 9–14)

Integrate the LLM tutor and expand content across the full skill tree.

1. Integrate Anthropic API for elaboration evaluation, Socratic hints, and misconception detection.
2. Build the elaboration prompt system with free-form answer UI and AI feedback display.
3. Implement adaptive difficulty escalation across question types (recognition → cued recall → free recall → application).
4. Expand content to cover all T1 and T2 domains (~600 nodes total).
5. Build the second-attempt hint system for incorrect answers.

### Phase 4: Labs and Advanced Features (Weeks 15–20)

Add practical lab environments and advanced analytics.

1. Build Docker-based lab environments for practical challenges (CLI exercises, config tasks, vulnerability identification).
2. Implement the analytics dashboard: session summaries, retention curves, calibration trends, domain progress.
3. Add the T3 AI Security specialization content (~200 nodes covering adversarial ML, LLM security, AI for SOC, AI governance).
4. Build red team challenge mode with cross-domain scenario generation.
5. Implement offline-first SRS with IndexedDB and server sync.

### Phase 5: Polish and Launch (Weeks 21–24)

Refine the experience, add gamification, and prepare for launch.

1. Implement streak tracking, mastery badges, calibration score, and optional leaderboard.
2. Build notification system for review reminders with learner-preferred timing.
3. Performance optimization: lazy loading of skill tree, question prefetching, SRS calculation caching.
4. User testing with 10–20 beta users; iterate on question quality and difficulty calibration.
5. Launch publicly as a web application with a free tier (T0–T1) and a paid tier (full skill tree + AI tutor + labs).

---

## Monetization Strategy

| Tier | Includes | Price |
|------|----------|-------|
| Free | T0–T1 domains, SRS engine, placement test, basic analytics | $0/mo |
| Pro | Full skill tree, AI tutor, labs, advanced analytics, calibration dashboard | $29/mo or $249/yr |
| Team | Pro features + team analytics, custom content, manager dashboard | $49/seat/mo |

The free tier is designed to be genuinely useful—not a crippled trial. Learners can complete foundations and core security knowledge entirely for free, demonstrating the platform's value proposition before asking for payment. The Pro tier unlocks at the exact point where the learner has demonstrated commitment and where the content (specialized domains, AI tutor, labs) has meaningfully higher production cost.

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| 7-day retention | >60% of new users complete 7 sessions | Cohort analysis |
| 30-day retention | >35% still active after 30 days | DAU/MAU ratio |
| SRS adherence | >80% of due reviews completed on time | Overdue node ratio |
| Calibration improvement | Mean calibration score improves 20% in first month | Calibration trend analysis |
| Knowledge retention | >85% of mastered nodes recalled at 30-day review | Long-term SRS score tracking |
| Free-to-Pro conversion | >8% of free users convert within 60 days | Funnel analytics |
| Cert pass rate | Users who complete relevant domains pass certs at >90% | User-reported outcomes |

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Content creation bottleneck | Slow domain expansion; incomplete skill tree | Use AI-assisted question generation with expert review; prioritize high-demand domains |
| SRS parameter tuning | Intervals too short (burnout) or too long (forgetting) | A/B test parameters; track long-term retention rates; allow user overrides |
| AI tutor cost scaling | API costs exceed revenue per user | Batch API for non-real-time evaluation; cache common misconception responses; rate-limit AI interactions |
| Learner frustration with difficulty | Dropoff due to test-first approach feeling punishing | Careful onboarding explaining the science; celebrate growth from errors; normalize productive struggle |
| Cybersecurity content freshness | Rapidly evolving field makes content stale | Quarterly content reviews; community contribution pipeline; AI-assisted update detection |

---

## Conclusion

CyberClimb is designed around a conviction supported by decades of cognitive science research: the fastest path to expertise is not to study more, but to test more—and to test strategically. By combining desirable difficulties, spaced repetition, adaptive assessment, and AI-powered tutoring within the structure of a comprehensive cybersecurity skill tree, the platform offers a learning experience that is simultaneously more efficient, more engaging, and more durable than traditional approaches.

The 24-week implementation roadmap delivers a functional learning platform in phases, with each phase producing a usable product. Phase 1 alone yields a working SRS-powered quiz engine that a motivated learner could use immediately. Each subsequent phase adds depth, breadth, and sophistication.

The cybersecurity talent gap is real, growing, and particularly acute at the intersection of AI and security. CyberClimb is positioned to address that gap with an approach rooted in how humans actually learn—not how we wish they did.

---

## References

- Brown, P.C., Roediger, H.L., & McDaniel, M.A. (2014). *Make It Stick: The Science of Successful Learning.* Harvard University Press.
- Bjork, R.A. (1994). Memory and metamemory considerations in the training of human beings. In Metcalfe & Shimamura (Eds.), *Metacognition: Knowing About Knowing.* MIT Press.
- Roediger, H.L. & Karpicke, J.D. (2006). Test-enhanced learning: Taking memory tests improves long-term retention. *Psychological Science, 17*(3), 249–255.
- Kornell, N. & Bjork, R.A. (2008). Learning concepts and categories: Is spacing the enemy of induction? *Psychological Science, 19*(6), 585–592.
- Wozniak, P.A. & Gorzelanczyk, E.J. (1994). Optimization of repetition spacing in the practice of learning. *Acta Neurobiologiae Experimentalis, 54*, 59–68.
- Dunlosky, J. et al. (2013). Improving students' learning with effective learning techniques. *Psychological Science in the Public Interest, 14*(1), 4–58.
- MITRE ATLAS: Adversarial Threat Landscape for AI Systems. https://atlas.mitre.org
- OWASP Top 10 for LLM Applications. https://owasp.org/www-project-top-10-for-large-language-model-applications/
- NIST AI Risk Management Framework (AI 100-1). https://www.nist.gov/artificial-intelligence/ai-risk-management-framework
