# SKILLCLIMB

**An Open-Source, Self-Hosted Learning Engine**

*Built on Desirable Difficulties, Spaced Repetition, and Adaptive Assessment*

---

**Platform Specification — Version 2.0 — February 2026**

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
10. [Skill Tree System](#skill-tree-system)
11. [Technical Architecture](#technical-architecture)
12. [Implementation Roadmap](#implementation-roadmap)
13. [Success Metrics](#success-metrics)
14. [Risks and Mitigations](#risks-and-mitigations)
15. [Conclusion](#conclusion)
16. [References](#references)

---

## Executive Summary

SkillClimb is an open-source, self-hosted learning engine that inverts the traditional tutorial-first model. Instead of presenting lessons followed by quizzes, SkillClimb leads with assessment: learners encounter challenging questions and practical challenges first, exposing knowledge gaps before any instruction occurs. Instruction is then delivered precisely where gaps are identified, making every minute of study maximally efficient. Run it on your own infrastructure with a single `docker compose up`.

The platform is grounded in cognitive science research on durable learning, particularly the framework of desirable difficulties articulated by Robert Bjork and synthesized in the book *Make It Stick* by Peter Brown, Henry Roediger, and Mark McDaniel. A spaced repetition engine (based on a modified SM-2 algorithm) ensures that knowledge, once acquired, is retained over the long term through optimally timed review.

SkillClimb works with arbitrary skill trees via a **skill tree system**. Each skill tree defines a domain of knowledge — its structure, questions, prerequisites, and progression — and can be distributed as a git repository. The platform handles all the learning science, adaptive assessment, and spaced repetition; skill trees supply the subject matter. AI tutoring is powered by **pluggable providers** (Anthropic, OpenAI, or local models via Ollama), and the entire learning engine is accessible to external AI agents through an **MCP (Model Context Protocol) interface**. The first and primary skill tree covers cybersecurity (see `CYBERCLIMB.md`).

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

All skill trees use a four-level hierarchy that maps cleanly to both the knowledge landscape and the spaced repetition system.

| Level | Description | Contains | Count (est. per skill tree) |
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
- **Interactive labs:** Browser-based environments where learners practice skills and solve challenges in realistic contexts. Lab formats vary by skill tree.
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

SkillClimb uses a **pluggable AI provider architecture** — the platform defines what AI capabilities it needs, and operators choose which provider supplies them. The default is Anthropic's Claude API, but any OpenAI-compatible API or local model (via Ollama) works out of the box. For AI agents and external tools, SkillClimb exposes its full learning engine through an **MCP (Model Context Protocol) server**, enabling any MCP-capable AI to act as a tutor, study coach, or content author.

### AI Provider Contract

The platform defines three AI capabilities. Each maps to a method on the `AIServiceShape` interface (see `ai.types.ts`):

| Method | Input | Output | Used For |
|--------|-------|--------|----------|
| `evaluateFreeRecall` | learner response, correct answer, concept context | score (0–5), feedback text, misconception flags | Scoring open-ended explanations |
| `generateHint` | question, learner's wrong answer, attempt number | Socratic hint text | Guiding learners without revealing answers |
| `generateMicroLesson` | concept, learner history, knowledge gaps | lesson markdown | Targeted instruction after repeated failures |

Providers implement this contract. The platform doesn't know or care which LLM is behind it.

### Built-in Providers

| Provider | Model | Config | Notes |
|----------|-------|--------|-------|
| **Anthropic** (default) | Claude | `AI_PROVIDER=anthropic` + `ANTHROPIC_API_KEY` | Best quality; recommended for production |
| **OpenAI** | GPT-4o / GPT-4o-mini | `AI_PROVIDER=openai` + `OPENAI_API_KEY` | Drop-in alternative |
| **Ollama** | Any local model | `AI_PROVIDER=ollama` + `OLLAMA_BASE_URL` | Free, private, offline-capable; quality varies by model |

Set `AI_PROVIDER` in your `.env` file. The platform validates the provider at startup and falls back to deterministic scoring if no provider is configured.

### MCP Interface

SkillClimb runs an MCP server that exposes the learning engine to any MCP-capable AI agent. This enables external AI systems to drive study sessions, coach learners proactively, and author content — without being hard-coded into the platform.

**MCP Tools** (actions an AI agent can take):

| Tool | Description |
|------|-------------|
| `evaluate_free_recall` | Score a learner's free-recall response |
| `generate_hint` | Generate a Socratic hint for a struggling learner |
| `generate_micro_lesson` | Create a targeted micro-lesson for a specific concept |
| `start_study_session` | Begin a new study session for a learner |
| `submit_review` | Submit a review result (score, confidence, response) |
| `get_next_question` | Get the next question in an active session |

**MCP Resources** (learning state an AI agent can read):

| Resource | URI Pattern | Description |
|----------|-------------|-------------|
| Learner Profile | `skillclimb://users/{id}/profile` | Overall stats, calibration, streaks |
| Due Items | `skillclimb://users/{id}/due` | Nodes due for review with SRS state |
| Domain Progress | `skillclimb://users/{id}/domains` | Per-domain mastery, freshness, badge state |
| Skill Tree Map | `skillclimb://skilltrees/{id}/map` | Full hierarchy with prerequisite graph |
| Session History | `skillclimb://users/{id}/sessions` | Recent session results and analytics |

With tools and resources together, an external AI agent can proactively coach a learner: read their due items and domain progress, start a session, ask questions, evaluate responses, generate hints when they struggle, and summarize their progress afterward — all through the MCP protocol.

### Tutor Touchpoints

The AI tutor (whether built-in or driving via MCP) engages at four key points in the learning loop:

- **Elaboration evaluation:** When a learner writes a free-form explanation, the tutor assesses whether the explanation demonstrates genuine understanding or surface-level repetition of memorized phrases. It provides targeted feedback on gaps in reasoning.
- **Socratic hints:** When a learner struggles with a question, rather than revealing the answer, the tutor asks a guiding question designed to help the learner reach the answer themselves. This preserves the generation effect.
- **Misconception detection:** The tutor analyzes patterns of wrong answers to identify systematic misconceptions and generates targeted correction content.
- **Adaptive scenario generation:** For application-level questions, the tutor generates novel scenarios based on the learner's current skill profile, ensuring that practice material stays fresh and contextually varied.

### Cost Management

Cost profiles vary significantly by provider:

- **Cloud APIs (Anthropic, OpenAI):** AI calls are reserved for high-value interactions: free recall evaluation, misconception analysis, and scenario generation. Recognition and cued recall questions use deterministic scoring. Estimated cost per active learner per month is $2–5 at current API pricing, based on approximately 40–60 AI-evaluated interactions per month.
- **Local models (Ollama):** Zero marginal cost per interaction. Quality depends on the model — larger models (70B+) approach cloud API quality; smaller models (7B–13B) work well for hint generation but may struggle with nuanced misconception detection.
- **No provider configured:** The platform operates without AI features. Free recall questions fall back to self-assessment scoring. Hints and micro-lessons are not available. All SRS, session building, and progress tracking continue to work.

---

## Gamification and Motivation Design

### Design Philosophy

Every metric visible to the learner must correspond to a real learning outcome. The gamification layer is a **mirror** — it helps learners see their own learning state more clearly. It is not a slot machine.

No arbitrary points. No XP. No artificial scarcity. No leaderboards as primary motivation. If a number is shown, it answers a question a self-directed learner should be asking: *How much do I know? How consistently am I studying? How fast am I progressing? How well am I maintaining what I've learned? How accurate is my self-assessment?*

### Learning Theory Foundations

Each gamification feature is grounded in specific, well-established learning science:

**Self-Determination Theory** (Deci & Ryan, 1985) — Sustained intrinsic motivation requires three psychological needs: autonomy, competence, and relatedness. SkillClimb's gamification focuses on competence feedback — showing learners objective evidence of their growing capability. Extrinsic rewards (points, badges-as-trophies) can undermine intrinsic motivation through the overjustification effect; SkillClimb avoids this by ensuring every visible metric reflects genuine learning state.

**Habit Formation** (Fogg Behavior Model; Clear, 2018) — SRS effectiveness is directly proportional to session consistency. The most important behavioral variable is not intensity but regularity. Visual consistency tracking supports habit formation through measurement, not punishment. The system makes the pattern visible so learners can self-correct.

**Goal-Setting Theory** (Locke & Latham, 1990) — Specific, challenging-but-attainable goals with clear feedback improve performance. Domain mastery is a natural goal unit — large enough to be meaningful, small enough to be achievable. Milestones at 25/50/75/100% provide intermediate feedback on progress toward these goals.

**Metacognition** (Flavell, 1979; Dunlosky et al., 2013) — Awareness of one's own learning state improves learning. Every dashboard element externalizes an internal learning state. The knowledge profile makes metacognition visible — learners can see what they know, what they're forgetting, and how fast they're progressing without relying on subjective self-assessment alone.

**Flow** (Csikszentmihalyi, 1990) — Optimal engagement requires clear goals, immediate feedback, and challenge matched to skill. The target accuracy zone (60–80%) is where learning is most efficient — not 100%. The momentum indicator provides immediate within-session feedback on challenge-skill balance.

**Desirable Difficulties** (Bjork, 1994) — Struggle is productive. Conditions that make learning harder in the short term (spacing, interleaving, retrieval practice) improve long-term retention. The system normalizes difficulty and reframes struggle as a sign of effective learning, not failure.

**Loss Aversion** (Kahneman & Tversky, 1979) — People work harder to maintain what they have than to acquire something new. Badge decay aligns this cognitive bias with a real phenomenon — knowledge genuinely erodes without review. Maintaining a mastery badge requires exactly the reviews that maintain actual knowledge.

### Anti-Patterns We Explicitly Avoid

**No arbitrary points or XP.** Extrinsic reward systems can crowd out intrinsic motivation (the overjustification effect). When learners study to earn points rather than to learn, removing the points removes the motivation. Every number in SkillClimb measures a real learning outcome.

**No streak-breaking punishment.** Binary streak systems trigger the "what-the-hell effect" — a single lapse leads to total abandonment ("I already lost my streak, why bother?"). SkillClimb's freeze system (one missed day per calendar week) prevents this while still tracking consistency honestly. The system never says "you lost your streak"; it says "you've studied 14 of the last 21 days."

**No leaderboards as primary motivation.** Social comparison can undermine autonomy and shift learners from mastery goals to performance goals. When the goal becomes "beat others" rather than "learn the material," learners avoid challenge and optimize for appearance. Leaderboards may be offered as opt-in for relatedness needs but are never the primary feedback mechanism.

**No artificial urgency.** Countdown timers, limited-time rewards, and expiring bonuses create anxiety, not learning. SRS already has natural urgency — items are due when they're due. Adding artificial deadlines on top of evidence-based scheduling contradicts the system's own logic.

**No rewarding 100% accuracy.** This would incentivize avoiding challenge — the opposite of desirable difficulties. The most productive sessions are NOT the ones where the learner gets everything right. Getting 100% means questions are too easy, which means less learning. The target zone is 60–80% accuracy.

### Feature Specifications

#### Consistency Tracking (Streaks + Heat Map)

Track daily study activity. Display a current-streak counter, longest-streak counter, and a 90-day heat map calendar (like GitHub's contribution graph). One missed day per calendar week doesn't break the streak (freeze system).

The streak visualizes a real phenomenon — SRS effectiveness is directly proportional to session consistency. The heat map shows density of effort over time, not a binary counter.

*Theory: Habit formation, Self-Determination Theory (self-efficacy through visible consistency), loss aversion (aligned with real learning outcomes).*

#### Mastery Badges with Decay

When all nodes in a domain reach mastered status (`repetitions >= 3 AND easiness >= 2.0`), the domain earns a mastery badge. The badge has three visual states based on freshness:
- **Fresh** (freshness > 0.7) — knowledge is current
- **Fading** (freshness 0.3–0.7) — reviews are approaching due
- **Lost** (any node drops below mastery) — knowledge has degraded

A badge means "you have demonstrated durable recall of every concept in this domain." Badge decay represents a real phenomenon — without review, mastery erodes.

*Theory: Metacognition (high-level summary), goal-setting (domain mastery as specific attainable goal), loss aversion (maintaining the badge requires the reviews that actually maintain knowledge).*

#### Session Momentum Indicator

During a study session, show a small indicator tracking rolling accuracy over the last 5 items:
- **Building** (3+ correct of last 5) — subtle positive indicator
- **Steady** (2 correct of last 5) — neutral
- **Struggling** (0–1 correct of last 5) — "Hard questions build stronger memory"

At session end, show whether the session was in the target difficulty zone (60–80% accuracy). The most productive sessions are the ones where the learner is challenged, not the ones where they get everything right.

*Theory: Flow (immediate feedback on challenge-skill balance), desirable difficulties (normalizing struggle), zone of proximal development.*

#### Milestones (Informative Micro-Feedback)

Brief, factual acknowledgments when real learning events occur during a session:
- **Node mastered** — "Mastered: [concept]. This is now in your long-term memory." (when repetitions reaches 3 with easiness >= 2.0)
- **Domain milestone** — "[Domain]: 50% mastered." (when a review pushes a domain past 25/50/75/100%)
- **Overdue recovery** — "You remembered [concept] after [N] days." (when a significantly overdue item is answered correctly)

No confetti, no fanfare — just clear acknowledgment of real SRS state transitions.

*Theory: Flow (immediate relevant feedback), Self-Determination Theory (acknowledging genuine competence growth).*

#### Knowledge Profile Dashboard

A unified view bringing together all metrics:
- **Knowledge summary** — Total mastered, tier completion %, domain badges earned/fading
- **Consistency** — Current/longest streak + heat map calendar
- **Learning velocity** — Nodes mastered per week (rolling 4-week average), trend direction
- **Retention strength** — Average freshness across all mastered domains (0–100%)
- **Calibration score** — How accurately the learner predicts their own performance (0–100)

Every number answers a question a self-directed learner should be asking.

*Theory: Metacognition (metacognition made visible), Self-Determination Theory (objective evidence of growth satisfies competence need), goal-setting (velocity provides feedback on rate).*

#### Calibration Score

A visible calibration score (0–100) reflects how accurately the learner predicts their own performance. Improving this score is framed as a primary achievement because accurate self-assessment is itself a high-value professional skill. The calibration dashboard provides detailed breakdowns by domain and over time, with actionable insights.

*Theory: Metacognition (learning to assess one's own knowledge is a meta-skill that transfers across all domains).*

---

## Skill Tree System

SkillClimb is a generic platform — all subject-matter content is delivered through **skill trees**. Each skill tree defines a complete hierarchy (tiers, domains, topics, nodes, questions, prerequisites) for a specific domain of knowledge.

### Directory Structure

Skill trees live in `packages/backend/src/content/<skilltree-id>/`. Each skill tree contains:

```
packages/backend/src/content/<skilltree-id>/
├── skilltree.yaml    # Skill tree manifest
└── domains/          # Individual domain seed files
    ├── domain-a.yaml
    ├── domain-b.yaml
    └── ...
```

### SkillTreeDef Interface

Each skill tree's `skilltree.yaml` defines a `SkillTreeDef` with:

- **name / id** — Display name and unique identifier for the skill tree.
- **tierBases** — Maps tier numbers to base difficulty values used by the IRT placement algorithm.
- **domains** — Array of domain definitions, each containing a domain descriptor, its topics, and its nodes (with question templates).
- **prerequisites** — Maps domain names to arrays of prerequisite domain names, defining the DAG.
- **placeholderDomains** — Domains that are planned but not yet seeded with content. Displayed in the skill tree as locked/coming-soon.

### Seeding

The seed script (`npm run seed`) auto-discovers all skill trees and loads them into the database. Seeding is idempotent — it uses `onConflictDoNothing` so it can be re-run safely without destroying existing data. To seed a specific skill tree: `npm run seed -- --skilltree <skilltree-id>`.

### Creating a New Skill Tree

1. Create a directory under `packages/backend/src/content/` with your skill tree ID.
2. Define your tier structure, domains, topics, and nodes in `skilltree.yaml` and `domains/*.yaml`. See `SKILL_TREES.md` for the full authoring guide.
3. Run `npm run seed -- --skilltree <your-skilltree-id>` to load the content.

The platform handles all SRS scheduling, session building, placement testing, progress tracking, and analytics. Skill trees only need to supply the knowledge structure and questions.

### Content Distribution

Skill trees are designed to be distributable as git repositories. A skill tree repo contains the `skilltree.yaml` manifest and `domains/` directory — everything needed to seed a complete curriculum. To install a community-authored skill tree, clone it into the content directory and run the seed command. Future plans include a community registry where authors can publish skill trees and learners can browse and install them.

### AI-Assisted Authoring

Creating a full skill tree by hand is labor-intensive. SkillClimb's MCP server exposes authoring tools that enable AI agents to assist with content creation:

| MCP Tool | Description |
|----------|-------------|
| `generate_skill_tree_outline` | Given a subject description, generates a tier/domain/topic structure |
| `generate_domain_content` | Given a domain definition, generates topics, nodes, and question templates |
| `validate_skill_tree` | Checks structural integrity: DAG validity, question template completeness, tier consistency |

The intended workflow is human-in-the-loop: an AI generates a draft skill tree, a subject-matter expert reviews and edits the YAML, and the validated result is seeded into the platform. This dramatically reduces the time to create a new skill tree while maintaining content quality through human review.

---

## Technical Architecture

### Stack Overview

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Web Frontend | React + TypeScript | Component model suits skill tree UI; strong ecosystem for data viz |
| State Mgmt | Zustand + React Query | Lightweight; server sync via React Query |
| Backend API | Express + TypeScript | Fast iteration; tsx for development |
| Database | PostgreSQL (Drizzle ORM) | JSONB for flexible question/answer schemas; strong query planner |
| AI Providers | Anthropic / OpenAI / Ollama | Pluggable via `AIServiceShape` contract; configured by `AI_PROVIDER` env var |
| MCP Server | Model Context Protocol | Exposes learning engine to external AI agents for tutoring and authoring |
| Lab Environment | Docker containers | Isolated, disposable environments for practical challenges |
| Deployment | Docker Compose | Self-hosted; single `docker compose up` for full stack |
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

All I/O, database access, API calls, and state mutations are pushed to the outer shell: backend services (`@skillclimb/backend`) and web frontend components (`@skillclimb/frontend`).

### Self-Hosted Deployment

SkillClimb is designed to run on your own infrastructure via Docker Compose. A single `docker compose up` starts the full stack:

- **postgres** — PostgreSQL database with persistent volume
- **backend** — Express API server + MCP server
- **frontend** — React web app (served via nginx or dev server)

All configuration is via environment variables in a `.env` file (see `.env.example`): database credentials, AI provider selection and API keys, JWT secrets, and optional feature flags. No external services are required beyond an AI provider API key (and even that is optional if running Ollama locally).

### Pluggable AI Architecture

AI capabilities are abstracted behind the `AIServiceShape` interface (defined in `ai.types.ts`). The architecture has four layers:

1. **Contract** — `AIServiceShape` defines three methods (`evaluateFreeRecall`, `generateHint`, `generateMicroLesson`) with typed inputs and outputs.
2. **Providers** — Each provider (Anthropic, OpenAI, Ollama) implements the contract, translating between SkillClimb's types and the provider's API.
3. **Configuration** — The `AI_PROVIDER` environment variable selects the active provider at startup. The backend validates the provider and required credentials on boot.
4. **MCP layer** — The MCP server exposes the AI contract (plus session management and learning state) to external agents, enabling any MCP-capable AI to drive the platform.

Adding a new provider means implementing three methods. No changes to the platform, MCP server, or frontend are needed.

### Content Distribution Architecture

Skill trees are self-contained directories that can be distributed as git repositories. To install a community skill tree:

1. Clone the repo into `packages/backend/src/content/`
2. Run `npm run seed -- --skilltree <skilltree-id>`

The seed script auto-discovers all directories in the content folder and loads any valid skill tree. Future versions will include a `skillclimb install <repo-url>` CLI command and a community registry for discovering skill trees.

---

## Implementation Roadmap

The roadmap is organized as two parallel tracks: **Platform** (engineering features and capabilities) and **Content** (domain seeding, question authoring, instructional material). Both tracks can progress independently — platform features can be built without waiting for content, and content can be authored on top of existing platform capabilities.

### Platform Track

#### P1: Foundation ✅

Establish core data models, SRS engine, and basic question delivery.

1. Define and implement the PostgreSQL schema for tiers, domains, topics, nodes, learner state, and reviews.
2. Build the SM-2 algorithm module with domain_weight modifications and unit tests validating interval calculations.
3. Implement the session builder that selects review items based on due dates, interleaving priorities, and prerequisite reinforcement.
4. Create a minimal React frontend: single-question view with answer input, confidence rating, and feedback display.

#### P2: Assessment and Placement ✅

Build the adaptive testing engine and placement flow.

1. Implement the item response theory (IRT) module for adaptive question selection during placement tests.
2. Build the placement test flow: 40–60 adaptive questions that estimate competency across all tiers.
3. Create the skill tree map visualization with domain states, prerequisite edges, and mastery color-coding.
4. Implement the confidence calibration tracking system and the four-quadrant analysis.

#### P3: Adaptive Learning and AI Tutor ✅

Integrate the LLM tutor, instructional content delivery, and progressive question types.

1. Integrate Anthropic API for elaboration evaluation, Socratic hints, and second-attempt hints. ✅
2. Build the elaboration prompt system with free-form answer UI and AI feedback display. ✅
3. Build the second-attempt hint system for incorrect answers. ✅
4. Implement adaptive difficulty escalation across question types (recognition → cued recall → free recall → application). ✅
5. Build the instructional content delivery system: when a learner fails a node repeatedly, deliver micro-lessons, worked examples, or concept maps before the next review. Use hand-authored content where available, with AI-generated lessons as a fallback. ✅
6. Implement misconception detection: the AI analyzes patterns of wrong answers across reviews to identify systematic misconceptions and generates targeted correction content. ✅
7. Add knowledge decay visualization: mastered domains gradually fade from green toward amber as SRS due dates approach. ✅

#### P4: Authentication ✅

Replace placeholder auth with real authentication.

1. Implement OAuth authentication (Google/GitHub) to replace email-only login. ✅
2. Set up JWT access/refresh token infrastructure with httpOnly cookies. ✅
3. Add protected routes and middleware for authenticated API endpoints. ✅

#### P5: Gamification ✅

Add learning-science-grounded motivation mechanics across all layers.

1. Implement streak tracking with weekly freeze system and heat map calendar. ✅
2. Build mastery badges with freshness-based decay (fresh/fading/lost). ✅
3. Add calibration score (0–100) as a visible achievement metric. ✅
4. Build session momentum indicator (rolling 5-item accuracy window with target difficulty zone). ✅
5. Implement milestone detection (node mastery, domain thresholds, overdue recovery). ✅
6. Build learning velocity tracking (4-week rolling average with trend). ✅
7. Build knowledge profile dashboard unifying all metrics (streaks, badges, velocity, retention, calibration). ✅

#### P6: Pluggable AI and MCP

Refactor the AI integration into a pluggable provider architecture and expose the learning engine via MCP.

1. Define `AIServiceShape` interface with typed methods: `evaluateFreeRecall`, `generateHint`, `generateMicroLesson`.
2. Refactor existing Anthropic integration into an Anthropic provider adapter implementing `AIServiceShape`.
3. Build OpenAI provider adapter.
4. Build Ollama provider adapter for local model support.
5. Add `AI_PROVIDER` environment variable with startup validation and graceful fallback when no provider is configured.
6. Build MCP server exposing tutor tools (`evaluate_free_recall`, `generate_hint`, `generate_micro_lesson`), session management tools (`start_study_session`, `submit_review`, `get_next_question`), and learning state resources (`learner_profile`, `due_items`, `domain_progress`, `skill_tree_map`, `session_history`).
7. Integration tests for each provider adapter and MCP tool/resource.
8. Document provider configuration and MCP interface.

#### P7: Self-Hosted Deployment

Package the platform for one-command self-hosted deployment.

1. Create Dockerfile for backend (Express + MCP server).
2. Extend `docker-compose.yml` with postgres, backend, and frontend services with persistent volumes.
3. Create `.env.example` with all configuration variables documented.
4. Build data export/import utilities for backup and migration.
5. Write setup documentation: prerequisites, quickstart, configuration reference, upgrading.

#### P8: AI-Assisted Content Authoring

Enable AI agents to help author new skill trees via MCP.

1. Build MCP authoring tools: `generate_skill_tree_outline` (tier/domain/topic structure from a subject description), `generate_domain_content` (topics, nodes, and question templates for a domain), `validate_skill_tree` (check structural integrity, prerequisite DAG validity, question template completeness).
2. Write authoring workflow guide: how to use an MCP-capable AI to scaffold a skill tree, review and edit the output, then seed it.
3. End-to-end test: use authoring tools to generate a sample non-cybersecurity curriculum and seed it successfully.

#### P9: Labs and Advanced Features

Add practical lab environments, advanced analytics, and cross-domain challenges.

1. Build Docker-based lab environments for practical challenges (hands-on exercises defined by skill trees).
2. Implement the analytics dashboard: session summaries, retention curves, calibration trends, domain progress over time.
3. Build cross-domain challenge mode with scenario generation.
4. Implement adaptive scenario generation: the AI generates novel application-level scenarios based on the learner's current skill profile, ensuring practice material stays fresh and contextually varied.

#### P10: Community Launch

Open-source publication and community ecosystem.

1. Build notification system for review reminders with learner-preferred timing.
2. Performance optimization: lazy loading of skill tree, question prefetching, SRS calculation caching.
3. Optional leaderboard for cross-domain challenge scores.
4. Publish to GitHub as an open-source project with LICENSE, CONTRIBUTING guide, and setup documentation.
5. Launch skill tree registry for community-contributed skill trees.
6. Write launch blog post explaining the platform's learning science foundations and self-hosted architecture.
7. User testing with beta users; iterate on question quality and difficulty calibration.

### Content Track

Content creation proceeds independently from platform engineering. Each content phase can begin as soon as the necessary platform features exist.

#### C1: Foundation Domains ✅

Seed initial domains with question templates.

- 7 cybersecurity domains seeded: Networking Fundamentals, Operating Systems, Security Principles, Cryptography, Threat Landscape, Identity & Access Management, Network Defense.
- Each domain has topics, nodes, and recognition/cued recall/free recall question templates.

#### C2: Question Depth

Add question type variety and improve quality across existing domains. AI-assisted authoring (P8) can accelerate template generation for question types that follow predictable patterns.

- Add application-level question templates to all seeded domains.
- Ensure every node has at least recognition and cued recall templates.
- Review and improve explanation quality across all question templates.

#### C3: Domain Expansion

Seed remaining domains across all tiers. AI-assisted authoring (P8) can accelerate initial domain seeding — generate a draft, then review and refine manually.

- Seed remaining T1 domain: Web Application Security.
- Seed T2 domains: Penetration Testing, SOC Operations, Digital Forensics, Cloud Security, System Administration, Malware Analysis.
- Seed T0 domain: Programming Fundamentals.
- Seed T3 domains: Exploit Development, Threat Intelligence, Incident Response, Security Architecture.
- Target: ~600 nodes total across T0–T3.

#### C4: Instructional Content (requires P3; accelerated by P8)

Author micro-lessons and worked examples for nodes where learners commonly struggle.

- Write micro-lessons (2–5 minutes each) for high-failure-rate nodes across seeded domains.
- Create worked examples with step-by-step reasoning for complex topics.
- Build concept maps showing connections between related nodes across domains.
- AI-generated lessons serve as fallback for nodes without hand-authored content.

#### C5: Advanced and Specialized Content (requires P9 for labs)

Build content for advanced tiers, labs, and cross-domain challenges.

- Seed T4 AI Security domains: Adversarial ML, LLM Security, AI for SOC, AI Governance.
- Author red team challenge scenarios for tier transitions (T1→T2, T2→T3, T3→T4).
- Create lab exercise definitions for Docker-based practical challenges.
- Target: ~1,200 nodes total across all tiers.

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
| Content creation bottleneck | Slow domain expansion; incomplete skill trees | AI-assisted authoring via MCP tools (P8); community-contributed skill trees; prioritize high-demand skill trees |
| SRS parameter tuning | Intervals too short (burnout) or too long (forgetting) | A/B test parameters; track long-term retention rates; allow user overrides |
| AI tutor cost scaling | API costs grow with user base | Pluggable providers: use Ollama for free local inference; reserve cloud APIs for high-value interactions; deterministic fallback when no provider configured |
| Learner frustration with difficulty | Dropoff due to test-first approach feeling punishing | Careful onboarding explaining the science; celebrate growth from errors; normalize productive struggle |
| Content freshness | Rapidly evolving fields make content stale | Quarterly content reviews; community contribution pipeline; AI-assisted update detection |
| Self-hosted setup complexity | Users fail to deploy or configure correctly | One-command Docker Compose setup; comprehensive `.env.example`; setup documentation with troubleshooting guide |
| AI quality variance across providers | Inconsistent tutoring quality with different AI providers | Provider-specific prompt tuning; integration tests per provider; documentation of quality/cost trade-offs; recommended models per provider |
| AI-generated content quality | AI-authored skill trees may contain errors or shallow content | Human-in-the-loop workflow: AI generates drafts, experts review; `validate_skill_tree` MCP tool checks structural integrity; community review for published skill trees |

---

## Conclusion

SkillClimb is designed around a conviction supported by decades of cognitive science research: the fastest path to expertise is not to study more, but to test more—and to test strategically. By combining desirable difficulties, spaced repetition, adaptive assessment, and pluggable AI tutoring within the structure of a skill tree system, the platform offers a learning experience that is simultaneously more efficient, more engaging, and more durable than traditional approaches.

The implementation roadmap delivers a functional learning platform in phases, with each phase producing a usable product. Phase 1 alone yields a working SRS-powered quiz engine that a motivated learner could use immediately. Each subsequent phase adds depth, breadth, and sophistication — from pluggable AI providers and MCP integration, to self-hosted deployment, to AI-assisted content authoring.

The skill tree architecture and MCP interface mean SkillClimb can grow into any domain where structured, hierarchical knowledge and spaced repetition are valuable — from cybersecurity to programming, from medicine to law, from language learning to mathematics. Community-distributed skill trees and AI-assisted authoring lower the barrier to creating new curricula, while the self-hosted model ensures learners and organizations retain full control of their data and infrastructure.

---

## References

- Brown, P.C., Roediger, H.L., & McDaniel, M.A. (2014). *Make It Stick: The Science of Successful Learning.* Harvard University Press.
- Bjork, R.A. (1994). Memory and metamemory considerations in the training of human beings. In Metcalfe & Shimamura (Eds.), *Metacognition: Knowing About Knowing.* MIT Press.
- Roediger, H.L. & Karpicke, J.D. (2006). Test-enhanced learning: Taking memory tests improves long-term retention. *Psychological Science, 17*(3), 249–255.
- Kornell, N. & Bjork, R.A. (2008). Learning concepts and categories: Is spacing the enemy of induction? *Psychological Science, 19*(6), 585–592.
- Wozniak, P.A. & Gorzelanczyk, E.J. (1994). Optimization of repetition spacing in the practice of learning. *Acta Neurobiologiae Experimentalis, 54*, 59–68.
- Dunlosky, J. et al. (2013). Improving students' learning with effective learning techniques. *Psychological Science in the Public Interest, 14*(1), 4–58.
- Deci, E.L. & Ryan, R.M. (1985). *Intrinsic Motivation and Self-Determination in Human Behavior.* Plenum Press.
- Clear, J. (2018). *Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones.* Avery.
- Locke, E.A. & Latham, G.P. (1990). *A Theory of Goal Setting and Task Performance.* Prentice-Hall.
- Flavell, J.H. (1979). Metacognition and cognitive monitoring: A new area of cognitive–developmental inquiry. *American Psychologist, 34*(10), 906–911.
- Csikszentmihalyi, M. (1990). *Flow: The Psychology of Optimal Experience.* Harper & Row.
- Kahneman, D. & Tversky, A. (1979). Prospect theory: An analysis of decision under risk. *Econometrica, 47*(2), 263–291.
