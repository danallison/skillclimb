import { Router } from "express";
import { Effect } from "effect";
import { submitAnswer, type SelfRating } from "../services/answer.service.js";
import { ValidationError } from "../errors.js";
import { HttpResponse, type EffectHandler } from "../effectHandler.js";

const VALID_QUESTION_TYPES = ["recognition", "cued_recall", "free_recall", "application", "practical"] as const;
const VALID_SELF_RATINGS = ["correct", "partially_correct", "incorrect"] as const;

export function answersRouter(handle: EffectHandler) {
  const router = Router();

  router.post(
    "/",
    handle((req) =>
      Effect.gen(function* () {
        const userId = req.userId!;
        const { nodeId, answer, confidence, questionType, attemptNumber, selfRating } = req.body;

        // Validate nodeId
        if (typeof nodeId !== "string" || !nodeId) {
          return yield* Effect.fail(
            new ValidationError({ message: "nodeId must be a non-empty string" }),
          );
        }

        // Validate confidence
        if (!Number.isInteger(confidence) || confidence < 1 || confidence > 5) {
          return yield* Effect.fail(
            new ValidationError({ message: "confidence must be an integer between 1 and 5" }),
          );
        }

        // Validate questionType
        if (!VALID_QUESTION_TYPES.includes(questionType)) {
          return yield* Effect.fail(
            new ValidationError({
              message: `questionType must be one of: ${VALID_QUESTION_TYPES.join(", ")}`,
            }),
          );
        }

        // Validate answer (null allowed for recognition "I don't know")
        if (answer !== null && answer !== undefined && typeof answer !== "string") {
          return yield* Effect.fail(
            new ValidationError({ message: "answer must be a string or null" }),
          );
        }

        // Validate attemptNumber
        if (attemptNumber != null && (!Number.isInteger(attemptNumber) || attemptNumber < 1)) {
          return yield* Effect.fail(
            new ValidationError({ message: "attemptNumber must be a positive integer" }),
          );
        }

        // Validate selfRating
        if (selfRating != null && !VALID_SELF_RATINGS.includes(selfRating)) {
          return yield* Effect.fail(
            new ValidationError({
              message: `selfRating must be one of: ${VALID_SELF_RATINGS.join(", ")}`,
            }),
          );
        }

        const result = yield* submitAnswer(userId, {
          nodeId,
          answer: answer ?? null,
          confidence,
          questionType,
          attemptNumber,
          selfRating: selfRating as SelfRating | undefined,
        });

        return new HttpResponse(200, result);
      }),
    ),
  );

  return router;
}
