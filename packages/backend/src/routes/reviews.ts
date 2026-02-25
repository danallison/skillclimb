import { Router } from "express";
import { Effect } from "effect";
import { and, eq } from "drizzle-orm";
import { submitReview } from "../services/review.service.js";
import { query } from "../services/Database.js";
import { nodes, learnerNodes } from "../db/schema.js";
import { resolveAIForUser } from "../services/AIService.js";
import { ValidationError, NotFoundError } from "../errors.js";
import { HttpResponse, type EffectHandler } from "../effectHandler.js";
import type { QuestionTemplate } from "@skillclimb/core";

export function reviewsRouter(handle: EffectHandler) {
  const router = Router();

  router.post(
    "/evaluate",
    handle((req) =>
      Effect.gen(function* () {
        const userId = req.userId!;
        const { nodeId, response } = req.body;

        if (typeof nodeId !== "string" || !nodeId) {
          return yield* Effect.fail(
            new ValidationError({ message: "nodeId must be a string" }),
          );
        }

        if (typeof response !== "string" || response.trim().length === 0) {
          return yield* Effect.fail(
            new ValidationError({ message: "response must be a non-empty string" }),
          );
        }

        const [node] = yield* query((db) =>
          db.select().from(nodes).where(eq(nodes.id, nodeId)),
        );
        if (!node) {
          return yield* Effect.fail(
            new NotFoundError({ entity: "Node", id: nodeId }),
          );
        }

        // Look up previous misconceptions
        let previousMisconceptions: string[] = [];
        const [learnerNode] = yield* query((db) =>
          db
            .select()
            .from(learnerNodes)
            .where(
              and(eq(learnerNodes.userId, userId), eq(learnerNodes.nodeId, nodeId)),
            ),
        );
        if (learnerNode) {
          previousMisconceptions = (learnerNode.misconceptions ?? []) as string[];
        }

        const templates = (node.questionTemplates ?? []) as QuestionTemplate[];
        const template =
          templates.find((t) => t.type === "free_recall") ?? templates[0];
        if (!template) {
          return new HttpResponse(200, null);
        }

        const ai = yield* resolveAIForUser(userId);
        const result = yield* ai
          .evaluateFreeRecall({
            concept: node.concept,
            prompt: template.prompt,
            correctAnswer: template.correctAnswer,
            keyPoints: template.keyPoints ?? [],
            rubric: template.rubric ?? "",
            learnerResponse: response,
            previousMisconceptions,
          })
          .pipe(Effect.catchTag("AIRequestError", () =>
            Effect.succeed({
              score: null as number | null,
              feedback: "AI evaluation is unavailable. Use selfRating with submit_answer instead.",
              keyPointsCovered: [] as string[],
              keyPointsMissed: template.keyPoints ?? [],
              misconceptions: [] as string[],
              source: "unavailable" as const,
            }),
          ));

        return new HttpResponse(200, result);
      }),
    ),
  );

  router.post(
    "/",
    handle((req) =>
      Effect.gen(function* () {
        const userId = req.userId!;
        const { nodeId, score, confidence, response, misconceptions } = req.body;

        if (typeof nodeId !== "string" || !nodeId) {
          return yield* Effect.fail(
            new ValidationError({ message: "nodeId must be a string" }),
          );
        }

        if (score == null || confidence == null) {
          return yield* Effect.fail(
            new ValidationError({
              message: "nodeId, score, and confidence are required",
            }),
          );
        }

        if (!Number.isInteger(score) || score < 0 || score > 5) {
          return yield* Effect.fail(
            new ValidationError({ message: "score must be an integer between 0 and 5" }),
          );
        }

        if (!Number.isInteger(confidence) || confidence < 1 || confidence > 5) {
          return yield* Effect.fail(
            new ValidationError({
              message: "confidence must be an integer between 1 and 5",
            }),
          );
        }

        if (misconceptions != null && !Array.isArray(misconceptions)) {
          return yield* Effect.fail(
            new ValidationError({ message: "misconceptions must be an array" }),
          );
        }

        const result = yield* submitReview(
          userId,
          nodeId,
          score,
          confidence,
          response ?? "",
          misconceptions,
        );
        return new HttpResponse(201, result);
      }),
    ),
  );

  return router;
}
