import { Router } from "express";
import { Effect } from "effect";
import { eq } from "drizzle-orm";
import {
  learnerNodes,
  nodes,
  domains,
  topics,
  reviews,
} from "../db/schema.js";
import { query } from "../services/Database.js";
import { dbRowToLearnerState } from "../db/mappers.js";
import { HttpResponse, type EffectHandler } from "../effectHandler.js";
import {
  computeOverallProgress,
  computeTopicProgress,
  computeDomainFreshness,
  computeCalibrationAnalysis,
  CORRECT_SCORE_THRESHOLD,
} from "@skillclimb/core";
import type { CalibrationEntry } from "@skillclimb/core";

export function usersRouter(handle: EffectHandler) {
  const router = Router();

  router.get(
    "/me/progress",
    handle((req) =>
      Effect.gen(function* () {
        const userId = req.userId!;
        const skilltreeId = req.query.skilltreeId as string | undefined;

        const rows = yield* query((db) =>
          db
            .select()
            .from(learnerNodes)
            .where(eq(learnerNodes.userId, userId)),
        );

        // If skilltreeId provided, filter to only domains in that skill tree
        let allDomains = yield* query((db) =>
          db.select().from(domains).orderBy(domains.displayOrder),
        );
        if (skilltreeId) {
          allDomains = allDomains.filter((d) => d.skilltreeId === skilltreeId);
        }
        const stDomainIds = new Set(allDomains.map((d) => d.id));

        let filteredRows = rows;
        if (skilltreeId) {
          filteredRows = rows.filter((r) => stDomainIds.has(r.domainId));
        }

        const states = filteredRows.map(dbRowToLearnerState);
        const now = new Date();
        const overall = computeOverallProgress(states, now);

        let allNodes = yield* query((db) => db.select().from(nodes));
        if (skilltreeId) {
          allNodes = allNodes.filter((n) => stDomainIds.has(n.domainId));
        }
        const nodeTopicMap = new Map(
          allNodes.map((n) => [
            n.id,
            { topicId: n.topicId, domainId: n.domainId },
          ]),
        );
        const topicProgress = computeTopicProgress(states, nodeTopicMap);

        const allTopics = yield* query((db) =>
          db.select().from(topics).orderBy(topics.displayOrder),
        );

        const topicMap = new Map(allTopics.map((t) => [t.id, t]));
        const progressByDomain = new Map(
          overall.domains.map((dp) => [dp.domainId, dp]),
        );

        const freshnessList = computeDomainFreshness(states, now);
        const freshnessMap = new Map(
          freshnessList.map((f) => [f.domainId, f.freshness]),
        );

        const domainDetails = allDomains.map((domain) => {
          const dp = progressByDomain.get(domain.id);
          const domainTopics = topicProgress
            .filter((tp) => tp.domainId === domain.id)
            .map((tp) => {
              const topic = topicMap.get(tp.topicId);
              return {
                ...tp,
                name: topic?.name ?? "Unknown",
              };
            });

          return {
            domainId: domain.id,
            name: domain.name,
            description: domain.description,
            tier: domain.tier,
            prerequisites: domain.prerequisites as string[],
            totalNodes: dp?.totalNodes ?? 0,
            mastered: dp?.mastered ?? 0,
            inProgress: dp?.inProgress ?? 0,
            notStarted: dp?.notStarted ?? 0,
            masteryPercentage: dp?.masteryPercentage ?? 0,
            hasContent: (dp?.totalNodes ?? 0) > 0,
            freshness: freshnessMap.get(domain.id) ?? 1.0,
            topics: domainTopics,
          };
        });

        return new HttpResponse(200, {
          totalNodes: overall.totalNodes,
          mastered: overall.mastered,
          inProgress: overall.inProgress,
          notStarted: overall.notStarted,
          masteryPercentage: overall.masteryPercentage,
          nextSession: overall.nextSession,
          domains: domainDetails,
        });
      }),
    ),
  );

  router.get(
    "/me/calibration",
    handle((req) =>
      Effect.gen(function* () {
        const userId = req.userId!;
        const skilltreeId = req.query.skilltreeId as string | undefined;

        const userReviews = yield* query((db) =>
          db.select().from(reviews).where(eq(reviews.userId, userId)),
        );

        // Build node→domain lookup and optionally filter by skill tree
        const allNodes = yield* query((db) => db.select().from(nodes));
        const nodeDomainMap = new Map(
          allNodes.map((n) => [n.id, n.domainId]),
        );

        let stDomainIds: Set<string> | null = null;
        if (skilltreeId) {
          const stDomains = yield* query((db) =>
            db.select().from(domains).where(eq(domains.skilltreeId, skilltreeId)),
          );
          stDomainIds = new Set(stDomains.map((d) => d.id));
        }

        let filteredReviews = userReviews;
        if (stDomainIds) {
          filteredReviews = userReviews.filter((r) => {
            const domainId = nodeDomainMap.get(r.nodeId);
            return domainId && stDomainIds!.has(domainId);
          });
        }

        if (filteredReviews.length === 0) {
          return new HttpResponse(200, {
            overallScore: 0,
            quadrantCounts: {
              calibrated: 0,
              illusion: 0,
              undervalued: 0,
              known_unknown: 0,
            },
            quadrantPercentages: {
              calibrated: 0,
              illusion: 0,
              undervalued: 0,
              known_unknown: 0,
            },
            domainBreakdown: [],
            trend: [],
            insights: [],
            totalEntries: 0,
          });
        }

        const entries: CalibrationEntry[] = filteredReviews.map((r) => ({
          confidence: r.confidence,
          wasCorrect: r.score >= CORRECT_SCORE_THRESHOLD,
          timestamp: r.createdAt,
        }));

        const entryDomainIds = filteredReviews.map(
          (r) => nodeDomainMap.get(r.nodeId) ?? "",
        );

        const analysis = computeCalibrationAnalysis(entries, entryDomainIds);

        const allDomains = yield* query((db) => db.select().from(domains));
        const domainNames = new Map(allDomains.map((d) => [d.id, d.name]));

        const enrichedBreakdown = analysis.domainBreakdown.map((d) => ({
          ...d,
          domainName: domainNames.get(d.domainId) ?? "Unknown",
        }));

        return new HttpResponse(200, {
          ...analysis,
          domainBreakdown: enrichedBreakdown,
        });
      }),
    ),
  );

  return router;
}
