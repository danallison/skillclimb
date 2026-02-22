import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { SkillClimbClient } from "./client.js";

export function registerTools(server: McpServer, client: SkillClimbClient) {
  // ─── Study Session Tools ───────────────────────────────────────────

  server.tool(
    "start_study_session",
    "Start a new study session. Returns session items with question templates for review.",
    {
      skilltreeId: z
        .string()
        .optional()
        .describe("Optional skill tree ID to scope the session"),
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
    "Get details of an existing study session, including its items and learner states.",
    {
      sessionId: z.string().uuid().describe("The session ID"),
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

  server.tool(
    "submit_review",
    "Submit a review for a node. Updates SRS state and returns next review state, calibration, and milestones.",
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

  // ─── Placement Test Tools ──────────────────────────────────────────

  server.tool(
    "start_placement",
    "Start an adaptive placement test. Returns the first question and IRT state.",
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
    "Submit an answer to a placement test question. Returns whether correct, next question (if not done), and final results (if done).",
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
    "Abandon an in-progress placement test.",
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
    "Evaluate a free-recall response using the built-in AI provider. Returns score, feedback, key points, and misconceptions. Requires an AI provider to be configured.",
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
    "Generate a Socratic hint for a question. Requires an AI provider to be configured.",
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
    "Generate a brief micro-lesson for a concept. Requires an AI provider to be configured.",
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
    "List all available skill trees.",
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
    "List all domains, optionally filtered by skill tree.",
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
    "Get your progress in a specific domain.",
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
    "Get your overall progress including per-domain breakdown with badges, freshness, and topics.",
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
