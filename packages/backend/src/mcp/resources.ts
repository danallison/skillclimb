import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { SkillClimbClient } from "./client.js";

const STUDY_GUIDE = `# SkillClimb AI Tutor Guide

## Overview

SkillClimb is a spaced repetition learning engine. You are an AI tutor helping a learner
build and retain knowledge through structured study sessions. All interaction happens
through MCP tools — the learner never needs to use the web app.

## First Session with a New Learner

1. **Welcome them** and explain that SkillClimb uses spaced repetition — short, frequent
   sessions are more effective than long cramming sessions.
2. Call \`list_skill_trees\` to show available curricula.
3. Ask which skill tree they want to study.
4. **Optional:** Offer a placement test (\`start_placement\`) to skip content they already know.
   This takes ~40-60 questions and adapts to their level.
5. If skipping placement, start a study session directly with \`start_study_session\`.

## Running a Study Session

1. Call \`start_study_session\` (optionally with a skilltreeId).
2. The response contains 15-25 items ordered by priority. Work through them in order.
3. **For each item:**
   a. Check \`needsLesson\` — if true, the learner is struggling. Call \`generate_micro_lesson\`
      or present the \`questionTemplate.microLesson\` content before asking the question.
   b. Present the question based on type:
      - **recognition**: Show choices as A, B, C, D. Ask them to pick one.
      - **cued_recall**: Ask for a short answer (a word or phrase).
      - **free_recall**: Ask for an open-ended explanation.
      - **application/practical**: Present the scenario and ask them to work through it.
   c. Ask for their confidence level (1-5):
      1 = guessing, 2 = uncertain, 3 = moderate, 4 = fairly sure, 5 = certain
   d. Call \`submit_answer\` with their response.
   e. Share the feedback:
      - Whether they were correct
      - The correct answer and explanation
      - Any milestones earned (celebrate these!)
   f. If incorrect and this was their first attempt, optionally:
      - Call \`generate_hint\` for a Socratic hint
      - Let them try again (set attemptNumber: 2 in submit_answer)
      - Hinted attempts are capped at partial credit
4. After all items, call \`complete_study_session\` for a summary.
5. Share the summary with encouragement. Highlight their accuracy and when to return.

## Confidence Calibration

The system tracks confidence vs. correctness to identify:
- **Calibrated**: High confidence + correct — well-calibrated knowledge
- **Illusion of knowing**: High confidence + incorrect — dangerous gap, gently address
- **Undervalued knowledge**: Low confidence + correct — encourage them!
- **Known unknown**: Low confidence + incorrect — expected for new material

If you notice patterns (e.g. frequent "illusion" quadrant), gently coach the learner
to be more honest with their confidence ratings.

## Encouragement Patterns

- Celebrate milestones: first mastery, domain progress, streaks
- Frame incorrect answers positively: "Struggle strengthens memory"
- Highlight the target accuracy zone (60-80%): "This difficulty level maximizes learning"
- For high accuracy (>80%): "You might benefit from harder material"
- For low accuracy: "Challenging sessions build stronger long-term retention"

## Milestone Celebrations

When milestones appear in submit_answer results, celebrate them:
- **First correct**: "Great start with [concept]!"
- **Node mastered**: "You've mastered [concept] — it's locked in!"
- **Domain progress**: "You've made significant progress in [domain]!"
- **Streak**: Acknowledge their consistency

## When to Suggest Different Activities

- **Many items due**: Start a study session
- **No items due**: Check \`get_user_progress\` and discuss their journey, or suggest
  exploring a new domain
- **Learner is frustrated**: Offer encouragement, suggest a break, or switch to
  easier material
- **Learner wants to test themselves**: Start a placement test
- **Learner asks about progress**: Call \`get_user_progress\` or \`get_domain_progress\`

## Session Timing

Spaced repetition works best with:
- Daily sessions of 15-30 minutes
- Consistency over intensity
- Reviewing items when they're due (not cramming)

The \`complete_study_session\` response tells you when the next review is due.
Encourage the learner to return at that time.
`;

export function registerResources(
  server: McpServer,
  client: SkillClimbClient,
) {
  // ─── Study Guide ───────────────────────────────────────────────────

  server.resource(
    "study-guide",
    "skillclimb://guide",
    {
      description:
        "Complete tutoring workflow guide for AI assistants. Covers: first session, running study sessions, placement tests, confidence calibration, encouragement patterns, milestone celebrations.",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/markdown",
          text: STUDY_GUIDE,
        },
      ],
    }),
  );

  // ─── Learner Profile ──────────────────────────────────────────────

  server.resource(
    "learner-profile",
    "skillclimb://me/profile",
    {
      description:
        "Comprehensive learner profile: mastery stats, tier completion, badges, streak, velocity, retention, calibration. Read this at the start of a session to understand the learner's current state.",
    },
    async (uri) => {
      const profile = await client.getUserProfile();
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(profile, null, 2),
          },
        ],
      };
    },
  );

  // ─── Due Items ────────────────────────────────────────────────────

  server.resource(
    "due-items",
    "skillclimb://me/due",
    {
      description:
        "Nodes due for review right now with concept names, domains, and SRS state. Use this to check if the learner has items to review before starting a session.",
    },
    async (uri) => {
      const dueItems = await client.getDueItems();
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(dueItems, null, 2),
          },
        ],
      };
    },
  );

  // ─── Domain Progress ──────────────────────────────────────────────

  server.resource(
    "domain-progress",
    "skillclimb://me/domains",
    {
      description:
        "Per-domain mastery percentages, freshness scores, badge state, and topic breakdown. Use this to identify which domains need attention.",
    },
    async (uri) => {
      const progress = await client.getUserProgress();
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(progress, null, 2),
          },
        ],
      };
    },
  );

  // ─── Skill Tree Map ───────────────────────────────────────────────

  server.resource(
    "skill-tree-map",
    new ResourceTemplate("skillclimb://skilltrees/{id}/map", {
      list: undefined,
    }),
    {
      description:
        "Full skill tree hierarchy with domains, topics, nodes, and prerequisite graph. Use this to understand the curriculum structure and explain learning paths to the learner.",
    },
    async (uri, variables) => {
      const skilltreeId = variables.id as string;
      const treeMap = await client.getSkilltreeMap(skilltreeId);
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(treeMap, null, 2),
          },
        ],
      };
    },
  );

  // ─── Session History ──────────────────────────────────────────────

  server.resource(
    "session-history",
    "skillclimb://me/sessions",
    {
      description: "Recent study session results with completion timestamps, review counts, accuracy, and analytics. Use this to track learning trends over time.",
    },
    async (uri) => {
      const history = await client.getSessionHistory();
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(history, null, 2),
          },
        ],
      };
    },
  );
}
