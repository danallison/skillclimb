import { Router } from "express";
import { Effect } from "effect";
import { eq } from "drizzle-orm";
import {
  learnerNodes,
  nodes,
  domains,
  topics,
  reviews,
  studyDays,
} from "../db/schema.js";
import { query } from "../services/Database.js";
import { dbRowToLearnerState } from "../db/mappers.js";
import { HttpResponse, type EffectHandler } from "../effectHandler.js";
import {
  computeOverallProgress,
  computeTopicProgress,
  computeDomainFreshness,
  computeCalibrationAnalysis,
  computeCalibrationScore,
  computeDomainBadge,
  computeStreakInfo,
  computeHeatMap,
  computeVelocity,
  computeRetentionStrength,
  summarizeBadges,
  computeAllBadges,
  computeTierProgress,
  isMastered,
  CORRECT_SCORE_THRESHOLD,
} from "@skillclimb/core";
import type { CalibrationEntry, LearnerNodeState } from "@skillclimb/core";

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

        // Group states by domain for badge computation
        const statesByDomain = new Map<string, LearnerNodeState[]>();
        for (const s of states) {
          const list = statesByDomain.get(s.domainId) ?? [];
          list.push(s);
          statesByDomain.set(s.domainId, list);
        }

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

          const domainStates = statesByDomain.get(domain.id) ?? [];
          const freshness = freshnessMap.get(domain.id) ?? 1.0;
          const badge = computeDomainBadge(domainStates, freshness);

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
            freshness,
            badge,
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

  router.get(
    "/me/streaks",
    handle((req) =>
      Effect.gen(function* () {
        const userId = req.userId!;

        const days = yield* query((db) =>
          db
            .select()
            .from(studyDays)
            .where(eq(studyDays.userId, userId)),
        );

        const studyDaysList = days.map((d) => ({
          date: d.date,
          reviewCount: d.reviewCount,
        }));

        const today = new Date().toISOString().slice(0, 10);
        const streakInfo = computeStreakInfo(studyDaysList, today);
        const heatMap = computeHeatMap(studyDaysList, today, 90);

        return new HttpResponse(200, { ...streakInfo, heatMap });
      }),
    ),
  );

  router.get(
    "/me/profile",
    handle((req) =>
      Effect.gen(function* () {
        const userId = req.userId!;
        const skilltreeId = req.query.skilltreeId as string | undefined;

        // Learner node states
        const rows = yield* query((db) =>
          db.select().from(learnerNodes).where(eq(learnerNodes.userId, userId)),
        );

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

        // Domain freshness + badges
        const now = new Date();
        const freshnessList = computeDomainFreshness(states, now);
        const freshnessMap = new Map(freshnessList.map((f) => [f.domainId, f.freshness]));

        const statesByDomain = new Map<string, LearnerNodeState[]>();
        for (const s of states) {
          const list = statesByDomain.get(s.domainId) ?? [];
          list.push(s);
          statesByDomain.set(s.domainId, list);
        }

        const badges = computeAllBadges(statesByDomain, freshnessMap);

        // Tier completion
        const overall = computeOverallProgress(states, now);
        const tierCompletion = computeTierProgress(
          allDomains
            .filter((d) => statesByDomain.has(d.id) || stDomainIds.has(d.id))
            .map((d) => {
              const dp = overall.domains.find((dp) => dp.domainId === d.id);
              return {
                tier: d.tier,
                totalNodes: dp?.totalNodes ?? 0,
                mastered: dp?.mastered ?? 0,
                inProgress: dp?.inProgress ?? 0,
                notStarted: dp?.notStarted ?? 0,
              };
            }),
        ).map((tp) => ({
          tier: tp.tier,
          mastered: tp.mastered,
          total: tp.totalNodes,
          percentage: tp.masteryPercentage,
        }));

        // Streaks
        const days = yield* query((db) =>
          db.select().from(studyDays).where(eq(studyDays.userId, userId)),
        );
        const studyDaysList = days.map((d) => ({
          date: d.date,
          reviewCount: d.reviewCount,
        }));
        const today = now.toISOString().slice(0, 10);
        const streakInfo = computeStreakInfo(studyDaysList, today);
        const heatMap = computeHeatMap(studyDaysList, today, 90);

        // Velocity — mastery events from review timestamps
        // Approximate: find nodes that are currently mastered, use their
        // most recent review timestamp as "mastered at"
        const masteredCountByDomain = new Map<string, number>();
        const masteryEvents: Array<{ nodeId: string; masteredAt: string }> = [];

        for (const s of states) {
          if (isMastered(s)) {
            masteredCountByDomain.set(s.domainId, (masteredCountByDomain.get(s.domainId) ?? 0) + 1);
          }
        }

        // Get recent reviews for mastered nodes to estimate mastery time
        const userReviews = yield* query((db) =>
          db.select().from(reviews).where(eq(reviews.userId, userId)),
        );
        const masteredNodeIds = new Set(states.filter(isMastered).map((s) => s.nodeId));
        // Group reviews by node, find latest review for each mastered node
        const latestReviewByNode = new Map<string, Date>();
        for (const r of userReviews) {
          if (masteredNodeIds.has(r.nodeId)) {
            const existing = latestReviewByNode.get(r.nodeId);
            if (!existing || r.createdAt > existing) {
              latestReviewByNode.set(r.nodeId, r.createdAt);
            }
          }
        }
        const velocityEvents = Array.from(latestReviewByNode.entries()).map(([nodeId, date]) => ({
          nodeId,
          masteredAt: date,
        }));
        const velocity = computeVelocity(velocityEvents, now);

        // Retention strength
        const retentionStrength = computeRetentionStrength(freshnessList, masteredCountByDomain);

        // Calibration score — filter to skill tree if specified
        const nodeDomainMap = new Map(rows.map((r) => [r.nodeId, r.domainId]));
        const calReviews = skilltreeId
          ? userReviews.filter((r) => {
              const domainId = nodeDomainMap.get(r.nodeId);
              return domainId && stDomainIds.has(domainId);
            })
          : userReviews;
        const calEntries: CalibrationEntry[] = calReviews.map((r) => ({
          confidence: r.confidence,
          wasCorrect: r.score >= CORRECT_SCORE_THRESHOLD,
          timestamp: r.createdAt,
        }));
        const calibrationScore = computeCalibrationScore(calEntries);

        return new HttpResponse(200, {
          totalMastered: overall.mastered,
          totalNodes: overall.totalNodes,
          tierCompletion,
          badges: summarizeBadges(badges),
          streak: streakInfo,
          heatMap,
          velocity,
          retentionStrength,
          calibrationScore,
        });
      }),
    ),
  );

  return router;
}
