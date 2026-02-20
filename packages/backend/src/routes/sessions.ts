import { Router } from "express";
import { Effect } from "effect";
import { createSession, getSession } from "../services/session.service.js";
import { ValidationError, NotFoundError } from "../errors.js";
import { HttpResponse, type EffectHandler } from "../effectHandler.js";

export function sessionsRouter(handle: EffectHandler) {
  const router = Router();

  router.post(
    "/",
    handle((req) =>
      Effect.gen(function* () {
        const { userId } = req.body;
        if (!userId) {
          return yield* Effect.fail(
            new ValidationError({ message: "userId is required" }),
          );
        }
        const session = yield* createSession(userId);
        return new HttpResponse(201, session);
      }),
    ),
  );

  router.get(
    "/:id",
    handle((req) =>
      Effect.gen(function* () {
        const id = req.params.id as string;
        const session = yield* getSession(id);
        if (!session) {
          return yield* Effect.fail(
            new NotFoundError({ entity: "Session", id }),
          );
        }
        return new HttpResponse(200, session);
      }),
    ),
  );

  return router;
}
