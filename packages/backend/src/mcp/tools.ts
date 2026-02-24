import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { SkillClimbClient } from "./client.js";

export function registerTools(server: McpServer, client: SkillClimbClient) {
  // ─── Study Session Tools ───────────────────────────────────────────

  server.tool(
    "start_study_session",
    `Start a new spaced repetition study session. Returns 15-25 items ordered by priority.

Each item includes:
- node.concept: the knowledge unit name
- questionTemplate: { type, prompt, choices?, correctAnswer, explanation }
- needsLesson: true if the learner is struggling — deliver the microLesson first

Tutoring flow per item:
1. If needsLesson is true, present the microLesson content or call generate_micro_lesson
2. Present questionTemplate.prompt to the learner
   - recognition: show choices as lettered options (A, B, C, D)
   - cued_recall: ask for a short answer
   - free_recall/application/practical: ask for an open-ended response
3. Collect their answer and confidence (1-5), then call submit_answer
4. Share the feedback (correct/incorrect, explanation, milestones)
5. If wrong on first try, optionally call generate_hint and let them retry (attemptNumber: 2)
6. After all items, call complete_study_session for a summary`,
    {
      skilltreeId: z
        .string()
        .optional()
        .describe("Optional skill tree ID to scope the session (e.g. 'cybersecurity')"),
    },
    async ({ skilltreeId }) => {
      const session = await client.createSession(skilltreeId);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(session, null, 2),
          },
        ],
      };
    },
  );

  server.tool(
    "get_session",
    `Get details of an existing study session, including its items and learner states.

Use this to resume a session that was started earlier. Returns the same structure as start_study_session.`,
    {
      sessionId: z.string().uuid().describe("The session ID returned by start_study_session"),
    },
    async ({ sessionId }) => {
      try {
        const session = await client.getSession(sessionId);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(session, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: error instanceof Error ? error.message : "Session not found",
            },
          ],
          isError: true,
        };
      }
    },
  );

  // ─── Answer Submission ──────────────────────────────────────────────

  server.tool(
    "submit_answer",
    `Submit a learner's answer to a question and get it scored automatically. This is the primary tool for recording learning progress.

The server scores the answer based on question type:
- recognition: compares selected choice to correct answer (score 5=correct, 0=wrong, 1="I don't know")
- cued_recall: exact/acceptable answer matching (5=exact, 4=acceptable, 0=no match)
- free_recall: uses AI evaluation if available; falls back to selfRating if no AI
- application/practical: requires selfRating (learner self-assesses)

Returns score, correctness, detailed feedback (correct answer, explanation), SRS state update, calibration quadrant, and any milestones earned.

After receiving the result:
- Tell the learner if they were correct or not
- Share the explanation
- Celebrate any milestones (e.g. "First Mastery!", "Domain Progress")
- If wrong, consider offering a hint via generate_hint and letting them retry with attemptNumber: 2`,
    {
      nodeId: z.string().uuid().describe("The node ID being answered (from session item)"),
      answer: z
        .string()
        .nullable()
        .describe("The learner's answer text. null = 'I don't know' (recognition only)"),
      confidence: z
        .number()
        .int()
        .min(1)
        .max(5)
        .describe("Learner's self-rated confidence: 1=guessing, 2=uncertain, 3=moderate, 4=fairly sure, 5=certain"),
      questionType: z
        .enum(["recognition", "cued_recall", "free_recall", "application", "practical"])
        .describe("The question type from questionTemplate.type"),
      attemptNumber: z
        .number()
        .int()
        .min(1)
        .optional()
        .default(1)
        .describe("Attempt number. Default 1. Use 2+ for retries after hints (caps score at 3)"),
      selfRating: z
        .enum(["correct", "partially_correct", "incorrect"])
        .optional()
        .describe("Required for application/practical. Fallback for free_recall when AI unavailable"),
    },
    async ({ nodeId, answer, confidence, questionType, attemptNumber, selfRating }) => {
      const result = await client.submitAnswer({
        nodeId,
        answer,
        confidence,
        questionType,
        attemptNumber,
        selfRating,
      });
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  );

  server.tool(
    "submit_review",
    `Submit a pre-scored review for a node. Lower-level alternative to submit_answer — use submit_answer instead unless you need manual score control.

Updates SRS state and returns next review state, calibration quadrant, and milestones.`,
    {
      nodeId: z.string().uuid().describe("The node ID being reviewed"),
      score: z
        .number()
        .int()
        .min(0)
        .max(5)
        .describe("Score from 0 (wrong) to 5 (perfect)"),
      confidence: z
        .number()
        .int()
        .min(1)
        .max(5)
        .describe("Self-rated confidence from 1 (guessing) to 5 (certain)"),
      response: z
        .string()
        .optional()
        .default("")
        .describe("The learner's response text"),
      misconceptions: z
        .array(z.string())
        .optional()
        .describe("Misconceptions identified in the response"),
    },
    async ({ nodeId, score, confidence, response, misconceptions }) => {
      const result = await client.submitReview({
        nodeId,
        score,
        confidence,
        response,
        misconceptions,
      });
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  );

  // ─── Session Completion ─────────────────────────────────────────────

  server.tool(
    "complete_study_session",
    `Mark a study session as complete and get a summary.

Call this after working through all items in a session. Returns:
- summary: total reviews, correct count, accuracy percentage, calibration breakdown
- momentum: overall accuracy, whether in the target learning zone (60-80%), encouragement message
- nextSession: how many items are due now, when the next review is, items due this week

Present the summary to the learner with encouragement. Highlight:
- Their accuracy percentage
- Whether they're in the target difficulty zone
- When to come back for the next session`,
    {
      sessionId: z.string().uuid().describe("The session ID to complete"),
    },
    async ({ sessionId }) => {
      const result = await client.completeSession(sessionId);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  );

  // ─── Placement Test Tools ──────────────────────────────────────────

  server.tool(
    "start_placement",
    `Start an adaptive placement test to assess existing knowledge. Uses Item Response Theory (IRT) for efficient assessment in ~40-60 questions.

Returns the first question with:
- node: the concept being tested
- questionTemplate: recognition-style question with choices
- irtState: current ability estimate and standard error

Present each question as multiple choice. After the learner answers, call submit_placement_answer.
The test adapts difficulty based on responses — harder questions after correct answers, easier after incorrect.
When the test completes, learner states are automatically updated to reflect their demonstrated knowledge.`,
    {
      skilltreeId: z
        .string()
        .optional()
        .describe("Optional skill tree ID to scope the test"),
    },
    async ({ skilltreeId }) => {
      const result = await client.startPlacement(skilltreeId);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  );

  server.tool(
    "submit_placement_answer",
    `Submit an answer to a placement test question. Returns whether correct, the next question (if not done), and final results when complete.

The test automatically terminates when enough precision is reached or the maximum question count is hit.
When status is "completed", the result includes per-domain ability estimates and node classifications.`,
    {
      placementId: z.string().uuid().describe("The placement test ID"),
      nodeId: z.string().uuid().describe("The node ID being answered"),
      selectedAnswer: z
        .string()
        .nullable()
        .describe("The selected answer text, or null if skipped"),
      confidence: z
        .number()
        .int()
        .min(1)
        .max(5)
        .optional()
        .default(3)
        .describe("Self-rated confidence (1-5)"),
    },
    async ({ placementId, nodeId, selectedAnswer, confidence }) => {
      const result = await client.submitPlacementAnswer(placementId, {
        nodeId,
        selectedAnswer,
        confidence,
      });
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  );

  server.tool(
    "abandon_placement",
    "Abandon an in-progress placement test. Use this if the learner wants to stop early without results being applied.",
    {
      placementId: z.string().uuid().describe("The placement test ID"),
    },
    async ({ placementId }) => {
      await client.abandonPlacement(placementId);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ status: "abandoned" }),
          },
        ],
      };
    },
  );

  // ─── AI Tutor Tools ─────────────────────────────────────────────

  server.tool(
    "evaluate_free_recall",
    `Evaluate a free-recall response using the built-in AI provider. Returns a detailed score with feedback, key points covered/missed, and misconceptions.

Note: submit_answer already calls this internally for free_recall questions. Use this tool directly only if you want AI feedback without recording a review (e.g. for practice or discussion).

Requires an AI provider to be configured on the server.`,
    {
      nodeId: z.string().uuid().describe("The node ID being tested"),
      response: z.string().describe("The learner's free-recall response"),
    },
    async ({ nodeId, response }) => {
      const result = await client.evaluateFreeRecall({ nodeId, response });
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  );

  server.tool(
    "generate_hint",
    `Generate a Socratic hint for a question the learner is struggling with. The hint guides without giving away the answer.

Use this when:
- The learner answered incorrectly on their first attempt
- The learner asks for help
- needsLesson was true for the item

After providing the hint, let the learner try again with submit_answer (attemptNumber: 2). Hinted attempts cap at score 3 (partial credit).

Requires an AI provider to be configured on the server.`,
    {
      nodeId: z.string().uuid().describe("The node ID"),
      questionType: z
        .string()
        .optional()
        .describe("Optional question type to get a hint for"),
    },
    async ({ nodeId, questionType }) => {
      const result = await client.generateHint({ nodeId, questionType });
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  );

  server.tool(
    "generate_micro_lesson",
    `Generate a brief micro-lesson for a concept the learner is struggling with. Returns a title, explanatory content, and key takeaways.

Use this when:
- needsLesson is true for a session item (learner's easiness is low or they've failed recently)
- The learner explicitly asks to learn about a concept before being quizzed
- After multiple incorrect attempts on the same concept

Present the lesson content to the learner before asking the question.

Requires an AI provider to be configured on the server.`,
    {
      nodeId: z.string().uuid().describe("The node ID"),
    },
    async ({ nodeId }) => {
      const result = await client.generateLesson({ nodeId });
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  );

  // ─── Content Discovery Tools ───────────────────────────────────────

  server.tool(
    "list_skill_trees",
    `List all available skill trees. Each skill tree is a complete learning curriculum (e.g. "cybersecurity").

Use this at the start of a tutoring session to show the learner what's available, or to find the skilltreeId for scoping sessions and placement tests.`,
    {},
    async () => {
      const result = await client.listSkilltrees();
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  );

  server.tool(
    "list_domains",
    `List all knowledge domains, optionally filtered by skill tree. Domains are the major subject areas within a skill tree (e.g. "Network Security", "Cryptography").

Each domain shows its tier (difficulty level 1-5) and display order. Use this to help the learner understand the curriculum structure.`,
    {
      skilltreeId: z
        .string()
        .optional()
        .describe("Optional skill tree ID to filter by"),
    },
    async ({ skilltreeId }) => {
      const result = await client.listDomains(skilltreeId);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  );

  server.tool(
    "get_domain_progress",
    `Get detailed progress for a specific domain. Shows mastery percentage, node counts (mastered/in-progress/not-started), topic breakdown, and freshness score.

Use this when a learner asks about their progress in a specific area, or to decide whether to focus review on a particular domain.`,
    {
      domainId: z.string().uuid().describe("The domain ID"),
    },
    async ({ domainId }) => {
      const result = await client.getDomainProgress(domainId);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  );

  server.tool(
    "get_user_progress",
    `Get overall learner progress including per-domain breakdown with mastery percentages, badges, freshness, and topic details.

Use this to give the learner a high-level view of their learning journey. Highlight domains with high mastery, domains that need attention (low freshness), and earned badges.`,
    {
      skilltreeId: z
        .string()
        .optional()
        .describe("Optional skill tree ID to filter by"),
    },
    async ({ skilltreeId }) => {
      const result = await client.getUserProgress(skilltreeId);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  );
}
