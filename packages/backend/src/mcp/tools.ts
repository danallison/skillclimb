import { Effect } from "effect";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createSession, getSession } from "../services/session.service.js";
import { submitReview } from "../services/review.service.js";
import {
  startPlacement,
  submitPlacementAnswer,
  abandonPlacement,
} from "../services/placement.service.js";
import { AIService } from "../services/ai/AIService.js";
import { query } from "../services/Database.js";
import {
  skilltrees,
  domains,
  learnerNodes,
  nodes,
  topics,
} from "../db/schema.js";
import { eq } from "drizzle-orm";
import { dbRowToLearnerState } from "../db/mappers.js";
import {
  computeOverallProgress,
  computeTopicProgress,
  computeDomainFreshness,
  computeDomainBadge,
  computeDomainProgress,
} from "@skillclimb/core";
import type { LearnerNodeState } from "@skillclimb/core";
import type { RunEffect } from "./server.js";

export function registerTools(server: McpServer, runEffect: RunEffect) {
  // ─── Study Session Tools ───────────────────────────────────────────

  server.tool(
    "start_study_session",
    "Start a new study session for a user. Returns session items with question templates for review.",
    {
      userId: z.string().uuid().describe("The user's ID"),
      skilltreeId: z
        .string()
        .optional()
        .describe("Optional skill tree ID to scope the session"),
    },
    async ({ userId, skilltreeId }) => {
      const session = await runEffect(createSession(userId, skilltreeId));
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
      userId: z.string().uuid().describe("The user's ID"),
    },
    async ({ sessionId, userId }) => {
      const session = await runEffect(getSession(sessionId, userId));
      if (!session) {
        return {
          content: [
            { type: "text" as const, text: "Session not found" },
          ],
          isError: true,
        };
      }
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
    "submit_review",
    "Submit a review for a node. Updates SRS state and returns next review state, calibration, and milestones.",
    {
      userId: z.string().uuid().describe("The user's ID"),
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
    async ({ userId, nodeId, score, confidence, response, misconceptions }) => {
      const result = await runEffect(
        submitReview(userId, nodeId, score, confidence, response, misconceptions),
      );
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
    "Start an adaptive placement test for a user. Returns the first question and IRT state.",
    {
      userId: z.string().uuid().describe("The user's ID"),
      skilltreeId: z
        .string()
        .optional()
        .describe("Optional skill tree ID to scope the test"),
    },
    async ({ userId, skilltreeId }) => {
      const result = await runEffect(startPlacement(userId, skilltreeId));
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
      userId: z.string().uuid().describe("The user's ID"),
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
    async ({ placementId, userId, nodeId, selectedAnswer, confidence }) => {
      const result = await runEffect(
        submitPlacementAnswer(
          placementId,
          userId,
          nodeId,
          selectedAnswer,
          confidence,
        ),
      );
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
      userId: z.string().uuid().describe("The user's ID"),
    },
    async ({ placementId, userId }) => {
      await runEffect(abandonPlacement(placementId, userId));
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

  // ─── AI Tutor Tools (optional) ─────────────────────────────────────

  server.tool(
    "evaluate_free_recall",
    "Evaluate a free-recall response using the built-in AI provider. Returns score, feedback, key points, and misconceptions. Requires an AI provider to be configured.",
    {
      concept: z.string().describe("The concept being tested"),
      prompt: z.string().describe("The question prompt"),
      correctAnswer: z.string().describe("The correct/expected answer"),
      keyPoints: z
        .array(z.string())
        .optional()
        .default([])
        .describe("Key points that should be covered"),
      rubric: z.string().optional().default("").describe("Grading rubric"),
      learnerResponse: z
        .string()
        .describe("The learner's free-recall response"),
      previousMisconceptions: z
        .array(z.string())
        .optional()
        .describe("Previously identified misconceptions"),
    },
    async (input) => {
      const result = await runEffect(
        Effect.gen(function* () {
          const ai = yield* AIService;
          return yield* ai.evaluateFreeRecall(input);
        }),
      );
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
      concept: z.string().describe("The concept being tested"),
      prompt: z.string().describe("The question prompt"),
      correctAnswer: z.string().describe("The correct answer (not revealed to learner)"),
      learnerResponse: z
        .string()
        .optional()
        .default("")
        .describe("The learner's incorrect response"),
    },
    async (input) => {
      const hint = await runEffect(
        Effect.gen(function* () {
          const ai = yield* AIService;
          return yield* ai.generateHint(input);
        }),
      );
      return {
        content: [{ type: "text" as const, text: hint }],
      };
    },
  );

  server.tool(
    "generate_micro_lesson",
    "Generate a brief micro-lesson for a concept. Requires an AI provider to be configured.",
    {
      concept: z.string().describe("The concept to teach"),
      correctAnswer: z.string().describe("The correct answer"),
      explanation: z.string().describe("The explanation of the concept"),
      keyPoints: z
        .array(z.string())
        .optional()
        .default([])
        .describe("Key points to cover"),
      misconceptions: z
        .array(z.string())
        .optional()
        .default([])
        .describe("Known misconceptions to address"),
    },
    async (input) => {
      const lesson = await runEffect(
        Effect.gen(function* () {
          const ai = yield* AIService;
          return yield* ai.generateMicroLesson(input);
        }),
      );
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(lesson, null, 2),
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
      const rows = await runEffect(
        query((db) => db.select().from(skilltrees).orderBy(skilltrees.name)),
      );
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              rows.map((r) => ({ id: r.id, name: r.name })),
              null,
              2,
            ),
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
      const rows = await runEffect(
        query((db) => {
          const q = db.select().from(domains).orderBy(domains.displayOrder);
          return skilltreeId
            ? q.where(eq(domains.skilltreeId, skilltreeId))
            : q;
        }),
      );
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              rows.map((r) => ({
                id: r.id,
                name: r.name,
                tier: r.tier,
                description: r.description,
                prerequisites: r.prerequisites,
              })),
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  server.tool(
    "get_domain_progress",
    "Get a user's progress in a specific domain.",
    {
      userId: z.string().uuid().describe("The user's ID"),
      domainId: z.string().uuid().describe("The domain ID"),
    },
    async ({ userId, domainId }) => {
      const rows = await runEffect(
        query((db) =>
          db
            .select()
            .from(learnerNodes)
            .where(eq(learnerNodes.userId, userId)),
        ),
      );
      const states = rows.map(dbRowToLearnerState);
      const domainProgress = computeDomainProgress(states);
      const dp = domainProgress.find((d) => d.domainId === domainId);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                domainId,
                totalNodes: dp?.totalNodes ?? 0,
                mastered: dp?.mastered ?? 0,
                inProgress: dp?.inProgress ?? 0,
                notStarted: dp?.notStarted ?? 0,
                masteryPercentage: dp?.masteryPercentage ?? 0,
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  server.tool(
    "get_user_progress",
    "Get a user's overall progress including per-domain breakdown with badges, freshness, and topics.",
    {
      userId: z.string().uuid().describe("The user's ID"),
      skilltreeId: z
        .string()
        .optional()
        .describe("Optional skill tree ID to filter by"),
    },
    async ({ userId, skilltreeId }) => {
      const progress = await runEffect(
        Effect.gen(function* () {
          const rows = yield* query((db) =>
            db
              .select()
              .from(learnerNodes)
              .where(eq(learnerNodes.userId, userId)),
          );

          let allDomains = yield* query((db) =>
            db.select().from(domains).orderBy(domains.displayOrder),
          );
          if (skilltreeId) {
            allDomains = allDomains.filter((d) => d.skilltreeId === skilltreeId);
          }
          const stDomainIds = new Set(allDomains.map((d) => d.id));

          let filteredRows = rows;
          if (skilltreeId) {
            filteredRows = rows.filter((r) => stDomainIds.has(r.domainId));
          }

          const states = filteredRows.map(dbRowToLearnerState);
          const now = new Date();
          const overall = computeOverallProgress(states, now);

          let allNodes = yield* query((db) => db.select().from(nodes));
          if (skilltreeId) {
            allNodes = allNodes.filter((n) => stDomainIds.has(n.domainId));
          }
          const nodeTopicMap = new Map(
            allNodes.map((n) => [
              n.id,
              { topicId: n.topicId, domainId: n.domainId },
            ]),
          );
          const topicProg = computeTopicProgress(states, nodeTopicMap);

          const allTopics = yield* query((db) =>
            db.select().from(topics).orderBy(topics.displayOrder),
          );
          const topicMap = new Map(allTopics.map((t) => [t.id, t]));
          const progressByDomain = new Map(
            overall.domains.map((dp) => [dp.domainId, dp]),
          );

          const freshnessList = computeDomainFreshness(states, now);
          const freshnessMap = new Map(
            freshnessList.map((f) => [f.domainId, f.freshness]),
          );

          const statesByDomain = new Map<string, LearnerNodeState[]>();
          for (const s of states) {
            const list = statesByDomain.get(s.domainId) ?? [];
            list.push(s);
            statesByDomain.set(s.domainId, list);
          }

          const domainDetails = allDomains.map((domain) => {
            const dp = progressByDomain.get(domain.id);
            const domainTopics = topicProg
              .filter((tp) => tp.domainId === domain.id)
              .map((tp) => ({
                ...tp,
                name: topicMap.get(tp.topicId)?.name ?? "Unknown",
              }));

            const domainStates = statesByDomain.get(domain.id) ?? [];
            const freshness = freshnessMap.get(domain.id) ?? 1.0;
            const badge = computeDomainBadge(domainStates, freshness);

            return {
              domainId: domain.id,
              name: domain.name,
              tier: domain.tier,
              totalNodes: dp?.totalNodes ?? 0,
              mastered: dp?.mastered ?? 0,
              inProgress: dp?.inProgress ?? 0,
              notStarted: dp?.notStarted ?? 0,
              masteryPercentage: dp?.masteryPercentage ?? 0,
              freshness,
              badge,
              topics: domainTopics,
            };
          });

          return {
            totalNodes: overall.totalNodes,
            mastered: overall.mastered,
            inProgress: overall.inProgress,
            notStarted: overall.notStarted,
            masteryPercentage: overall.masteryPercentage,
            nextSession: overall.nextSession,
            domains: domainDetails,
          };
        }),
      );
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(progress, null, 2),
          },
        ],
      };
    },
  );
}
