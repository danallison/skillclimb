import { Router } from "express";
import { Effect } from "effect";
import {
  startPlacement,
  submitPlacementAnswer,
  getPlacement,
  abandonPlacement,
} from "../services/placement.service.js";
import { ValidationError, NotFoundError } from "../errors.js";
import { HttpResponse, type EffectHandler } from "../effectHandler.js";

export function placementRouter(handle: EffectHandler) {
  const router = Router();

  // POST /api/placement — Start a new placement test
  router.post(
    "/",
    handle((req) =>
      Effect.gen(function* () {
        const userId = req.userId!;
        const { skilltreeId } = req.body;

        if (skilltreeId != null && typeof skilltreeId !== "string") {
          return yield* Effect.fail(
            new ValidationError({ message: "skilltreeId must be a string" }),
          );
        }

        const result = yield* startPlacement(userId, skilltreeId);
        return new HttpResponse(201, result);
      }),
    ),
  );

  // POST /api/placement/:id/answer — Submit an answer
  router.post(
    "/:id/answer",
    handle((req) =>
      Effect.gen(function* () {
        const placementId = req.params.id as string;
        const { nodeId, selectedAnswer, confidence } = req.body;

        if (typeof nodeId !== "string" || !nodeId) {
          return yield* Effect.fail(
            new ValidationError({ message: "nodeId must be a string" }),
          );
        }

        if (confidence != null && (!Number.isInteger(confidence) || confidence < 1 || confidence > 5)) {
          return yield* Effect.fail(
            new ValidationError({ message: "confidence must be an integer between 1 and 5" }),
          );
        }

        const result = yield* submitPlacementAnswer(
          placementId,
          req.userId!,
          nodeId,
          selectedAnswer ?? null,
          confidence ?? 3,
        );
        return new HttpResponse(200, result);
      }),
    ),
  );

  // GET /api/placement/:id — Get current placement state
  router.get(
    "/:id",
    handle((req) =>
      Effect.gen(function* () {
        const id = req.params.id as string;
        const placement = yield* getPlacement(id, req.userId!);
        if (!placement) {
          return yield* Effect.fail(
            new NotFoundError({
              entity: "Placement test",
              id,
            }),
          );
        }
        return new HttpResponse(200, placement);
      }),
    ),
  );

  // POST /api/placement/:id/abandon — Abandon the test
  router.post(
    "/:id/abandon",
    handle((req) =>
      Effect.gen(function* () {
        yield* abandonPlacement(req.params.id as string, req.userId!);
        return new HttpResponse(200, { status: "abandoned" });
      }),
    ),
  );

  return router;
}
