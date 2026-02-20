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
        const { userId, skilltreeId } = req.body;
        if (!userId) {
          return yield* Effect.fail(
            new ValidationError({ message: "userId is required" }),
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

        if (!nodeId) {
          return yield* Effect.fail(
            new ValidationError({ message: "nodeId is required" }),
          );
        }

        const result = yield* submitPlacementAnswer(
          placementId,
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
        const placement = yield* getPlacement(id);
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
        yield* abandonPlacement(req.params.id as string);
        return new HttpResponse(200, { status: "abandoned" });
      }),
    ),
  );

  return router;
}
