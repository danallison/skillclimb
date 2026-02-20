import { Router } from "express";
import { Effect } from "effect";
import { and, eq } from "drizzle-orm";
import { submitReview } from "../services/review.service.js";
import { query } from "../services/Database.js";
import { nodes, learnerNodes } from "../db/schema.js";
import { AIService } from "../services/AIService.js";
import { ValidationError, NotFoundError } from "../errors.js";
import { HttpResponse, type EffectHandler } from "../effectHandler.js";
import type { QuestionTemplate } from "@skillclimb/core";

export function reviewsRouter(handle: EffectHandler) {
  const router = Router();

  router.post(
    "/evaluate",
    handle((req) =>
      Effect.gen(function* () {
        const { nodeId, response, userId } = req.body;

        if (!nodeId || !response) {
          return yield* Effect.fail(
            new ValidationError({
              message: "nodeId and response are required",
            }),
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

        // Look up previous misconceptions if userId provided
        let previousMisconceptions: string[] = [];
        if (userId) {
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
        }

        const templates = (node.questionTemplates ?? []) as QuestionTemplate[];
        const template =
          templates.find((t) => t.type === "free_recall") ?? templates[0];
        if (!template) {
          return new HttpResponse(200, null);
        }

        const ai = yield* AIService;
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
          .pipe(Effect.catchTag("AIRequestError", () => Effect.succeed(null)));

        return new HttpResponse(200, result);
      }),
    ),
  );

  router.post(
    "/",
    handle((req) =>
      Effect.gen(function* () {
        const { userId, nodeId, score, confidence, response, misconceptions } = req.body;

        if (!userId || !nodeId || score == null || confidence == null) {
          return yield* Effect.fail(
            new ValidationError({
              message: "userId, nodeId, score, and confidence are required",
            }),
          );
        }

        if (score < 0 || score > 5) {
          return yield* Effect.fail(
            new ValidationError({ message: "score must be between 0 and 5" }),
          );
        }

        if (confidence < 1 || confidence > 5) {
          return yield* Effect.fail(
            new ValidationError({
              message: "confidence must be between 1 and 5",
            }),
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
