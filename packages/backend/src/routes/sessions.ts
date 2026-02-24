import { Router } from "express";
import { Effect } from "effect";
import { createSession, getSession, completeSession } from "../services/session.service.js";
import { NotFoundError, ValidationError } from "../errors.js";
import { HttpResponse, type EffectHandler } from "../effectHandler.js";

export function sessionsRouter(handle: EffectHandler) {
  const router = Router();

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

        const session = yield* createSession(userId, skilltreeId);
        return new HttpResponse(201, session);
      }),
    ),
  );

  router.get(
    "/:id",
    handle((req) =>
      Effect.gen(function* () {
        const id = req.params.id as string;
        const session = yield* getSession(id, req.userId!);
        if (!session) {
          return yield* Effect.fail(
            new NotFoundError({ entity: "Session", id }),
          );
        }
        return new HttpResponse(200, session);
      }),
    ),
  );

  router.post(
    "/:id/complete",
    handle((req) =>
      Effect.gen(function* () {
        const id = req.params.id as string;
        const result = yield* completeSession(id, req.userId!);
        return new HttpResponse(200, result);
      }),
    ),
  );

  return router;
}
