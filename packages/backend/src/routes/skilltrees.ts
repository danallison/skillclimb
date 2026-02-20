import { Router } from "express";
import { Effect } from "effect";
import { skilltrees } from "../db/schema.js";
import { query } from "../services/Database.js";
import { HttpResponse, type EffectHandler } from "../effectHandler.js";

export function skilltreesRouter(handle: EffectHandler) {
  const router = Router();

  router.get(
    "/",
    handle((_req) =>
      Effect.gen(function* () {
        const allSkillTrees = yield* query((db) =>
          db.select().from(skilltrees).orderBy(skilltrees.name),
        );
        return new HttpResponse(200, allSkillTrees);
      }),
    ),
  );

  return router;
}
