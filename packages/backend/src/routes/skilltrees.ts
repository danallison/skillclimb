import { Router } from "express";
import { Effect } from "effect";
import { eq, isNull } from "drizzle-orm";
import { skilltrees, domains, topics, nodes } from "../db/schema.js";
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

  router.get(
    "/:id/map",
    handle((req) =>
      Effect.gen(function* () {
        const skilltreeId = req.params.id as string;

        const allDomains = yield* query((db) =>
          db
            .select()
            .from(domains)
            .where(eq(domains.skilltreeId, skilltreeId))
            .orderBy(domains.displayOrder),
        );

        const allTopics = yield* query((db) =>
          db.select().from(topics).where(isNull(topics.retiredAt)).orderBy(topics.displayOrder),
        );
        const allNodes = yield* query((db) =>
          db.select().from(nodes).where(isNull(nodes.retiredAt)),
        );

        const treeMap = allDomains.map((domain) => ({
          id: domain.id,
          name: domain.name,
          tier: domain.tier,
          description: domain.description,
          prerequisites: domain.prerequisites,
          topics: allTopics
            .filter((t) => t.domainId === domain.id)
            .map((topic) => ({
              id: topic.id,
              name: topic.name,
              nodes: allNodes
                .filter((n) => n.topicId === topic.id)
                .map((node) => ({
                  id: node.id,
                  concept: node.concept,
                  difficulty: node.difficulty,
                })),
            })),
        }));

        return new HttpResponse(200, treeMap);
      }),
    ),
  );

  return router;
}
