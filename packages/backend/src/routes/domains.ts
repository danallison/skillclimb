import { Router } from "express";
import { Effect } from "effect";
import { eq } from "drizzle-orm";
import { domains, learnerNodes } from "../db/schema.js";
import { query } from "../services/Database.js";
import { dbRowToLearnerState } from "../db/mappers.js";
import { ValidationError } from "../errors.js";
import { HttpResponse, type EffectHandler } from "../effectHandler.js";
import { computeDomainProgress } from "@skillclimb/core";

export function domainsRouter(handle: EffectHandler) {
  const router = Router();

  router.get(
    "/",
    handle((req) =>
      Effect.gen(function* () {
        const skilltreeId = req.query.skilltreeId as string | undefined;
        let allDomains = yield* query((db) =>
          db.select().from(domains).orderBy(domains.displayOrder),
        );
        if (skilltreeId) {
          allDomains = allDomains.filter((d) => d.skilltreeId === skilltreeId);
        }
        return new HttpResponse(200, allDomains);
      }),
    ),
  );

  router.get(
    "/:id/progress",
    handle((req) =>
      Effect.gen(function* () {
        const { userId } = req.query;
        if (!userId || typeof userId !== "string") {
          return yield* Effect.fail(
            new ValidationError({
              message: "userId query parameter is required",
            }),
          );
        }

        const domainId = req.params.id as string;

        const rows = yield* query((db) =>
          db
            .select()
            .from(learnerNodes)
            .where(eq(learnerNodes.userId, userId)),
        );

        const states = rows.map(dbRowToLearnerState);
        const domainProgress = computeDomainProgress(states);
        const dp = domainProgress.find((d) => d.domainId === domainId);

        return new HttpResponse(200, {
          domainId,
          totalNodes: dp?.totalNodes ?? 0,
          mastered: dp?.mastered ?? 0,
          inProgress: dp?.inProgress ?? 0,
          notStarted: dp?.notStarted ?? 0,
          masteryPercentage: dp?.masteryPercentage ?? 0,
        });
      }),
    ),
  );

  return router;
}
