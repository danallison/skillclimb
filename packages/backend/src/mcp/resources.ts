import { Effect } from "effect";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { eq } from "drizzle-orm";
import { query } from "../services/Database.js";
import {
  learnerNodes,
  nodes,
  domains,
  topics,
  sessions,
  reviews,
  studyDays,
} from "../db/schema.js";
import { dbRowToLearnerState } from "../db/mappers.js";
import {
  computeOverallProgress,
  computeTopicProgress,
  computeDomainFreshness,
  computeDomainBadge,
  computeStreakInfo,
  computeHeatMap,
  computeVelocity,
  computeRetentionStrength,
  computeCalibrationScore,
  summarizeBadges,
  computeAllBadges,
  computeTierProgress,
  isMastered,
  CORRECT_SCORE_THRESHOLD,
} from "@skillclimb/core";
import type { LearnerNodeState, CalibrationEntry } from "@skillclimb/core";
import type { RunEffect } from "./server.js";

export function registerResources(server: McpServer, runEffect: RunEffect) {
  // ─── Learner Profile ──────────────────────────────────────────────

  server.resource(
    "learner-profile",
    new ResourceTemplate("skillclimb://users/{id}/profile", { list: undefined }),
    {
      description:
        "Comprehensive learner profile: mastery stats, tier completion, badges, streak, velocity, retention, calibration",
    },
    async (uri, variables) => {
      const userId = variables.id as string;
      const profile = await runEffect(
        Effect.gen(function* () {
          const rows = yield* query((db) =>
            db
              .select()
              .from(learnerNodes)
              .where(eq(learnerNodes.userId, userId)),
          );

          const allDomains = yield* query((db) =>
            db.select().from(domains).orderBy(domains.displayOrder),
          );
          const stDomainIds = new Set(allDomains.map((d) => d.id));

          const states = rows.map(dbRowToLearnerState);
          const now = new Date();

          const freshnessList = computeDomainFreshness(states, now);
          const freshnessMap = new Map(
            freshnessList.map((f) => [f.domainId, f.freshness]),
          );

          const statesByDomain = new Map<string, LearnerNodeState[]>();
          for (const s of states) {
            const list = statesByDomain.get(s.domainId) ?? [];
            list.push(s);
            statesByDomain.set(s.domainId, list);
          }

          const badges = computeAllBadges(statesByDomain, freshnessMap);
          const overall = computeOverallProgress(states, now);

          const tierCompletion = computeTierProgress(
            allDomains
              .filter(
                (d) => statesByDomain.has(d.id) || stDomainIds.has(d.id),
              )
              .map((d) => {
                const dp = overall.domains.find(
                  (dp) => dp.domainId === d.id,
                );
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
            db
              .select()
              .from(studyDays)
              .where(eq(studyDays.userId, userId)),
          );
          const studyDaysList = days.map((d) => ({
            date: d.date,
            reviewCount: d.reviewCount,
          }));
          const today = now.toISOString().slice(0, 10);
          const streakInfo = computeStreakInfo(studyDaysList, today);
          const heatMap = computeHeatMap(studyDaysList, today, 90);

          // Velocity
          const masteredCountByDomain = new Map<string, number>();
          for (const s of states) {
            if (isMastered(s)) {
              masteredCountByDomain.set(
                s.domainId,
                (masteredCountByDomain.get(s.domainId) ?? 0) + 1,
              );
            }
          }

          const userReviews = yield* query((db) =>
            db.select().from(reviews).where(eq(reviews.userId, userId)),
          );
          const masteredNodeIds = new Set(
            states.filter(isMastered).map((s) => s.nodeId),
          );
          const latestReviewByNode = new Map<string, Date>();
          for (const r of userReviews) {
            if (masteredNodeIds.has(r.nodeId)) {
              const existing = latestReviewByNode.get(r.nodeId);
              if (!existing || r.createdAt > existing) {
                latestReviewByNode.set(r.nodeId, r.createdAt);
              }
            }
          }
          const velocityEvents = Array.from(
            latestReviewByNode.entries(),
          ).map(([nodeId, date]) => ({
            nodeId,
            masteredAt: date,
          }));
          const velocity = computeVelocity(velocityEvents, now);

          // Retention
          const retentionStrength = computeRetentionStrength(
            freshnessList,
            masteredCountByDomain,
          );

          // Calibration
          const calEntries: CalibrationEntry[] = userReviews.map((r) => ({
            confidence: r.confidence,
            wasCorrect: r.score >= CORRECT_SCORE_THRESHOLD,
            timestamp: r.createdAt,
          }));
          const calibrationScore = computeCalibrationScore(calEntries);

          return {
            totalMastered: overall.mastered,
            totalNodes: overall.totalNodes,
            tierCompletion,
            badges: summarizeBadges(badges),
            streak: streakInfo,
            heatMap,
            velocity,
            retentionStrength,
            calibrationScore,
          };
        }),
      );

      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(profile, null, 2),
          },
        ],
      };
    },
  );

  // ─── Due Items ────────────────────────────────────────────────────

  server.resource(
    "due-items",
    new ResourceTemplate("skillclimb://users/{id}/due", { list: undefined }),
    {
      description:
        "Nodes due for review with concept, domain, and SRS state",
    },
    async (uri, variables) => {
      const userId = variables.id as string;
      const dueItems = await runEffect(
        Effect.gen(function* () {
          const now = new Date();
          const rows = yield* query((db) =>
            db
              .select()
              .from(learnerNodes)
              .where(eq(learnerNodes.userId, userId)),
          );
          const dueRows = rows.filter((r) => r.dueDate <= now);

          if (dueRows.length === 0) return [];

          const allNodes = yield* query((db) => db.select().from(nodes));
          const nodeMap = new Map(allNodes.map((n) => [n.id, n]));

          const allDomains = yield* query((db) =>
            db.select().from(domains),
          );
          const domainMap = new Map(allDomains.map((d) => [d.id, d]));

          return dueRows.map((r) => {
            const node = nodeMap.get(r.nodeId);
            const domain = domainMap.get(r.domainId);
            return {
              nodeId: r.nodeId,
              concept: node?.concept ?? "Unknown",
              domainId: r.domainId,
              domainName: domain?.name ?? "Unknown",
              dueDate: r.dueDate.toISOString(),
              easiness: r.easiness,
              interval: r.interval,
              repetitions: r.repetitions,
            };
          });
        }),
      );

      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(dueItems, null, 2),
          },
        ],
      };
    },
  );

  // ─── Domain Progress ──────────────────────────────────────────────

  server.resource(
    "domain-progress",
    new ResourceTemplate("skillclimb://users/{id}/domains", { list: undefined }),
    {
      description:
        "Per-domain mastery, freshness, badge state, and topic breakdown",
    },
    async (uri, variables) => {
      const userId = variables.id as string;
      const domainProgress = await runEffect(
        Effect.gen(function* () {
          const rows = yield* query((db) =>
            db
              .select()
              .from(learnerNodes)
              .where(eq(learnerNodes.userId, userId)),
          );
          const states = rows.map(dbRowToLearnerState);
          const now = new Date();
          const overall = computeOverallProgress(states, now);

          const allDomains = yield* query((db) =>
            db.select().from(domains).orderBy(domains.displayOrder),
          );
          const allNodes = yield* query((db) => db.select().from(nodes));
          const nodeTopicMap = new Map(
            allNodes.map((n) => [
              n.id,
              { topicId: n.topicId, domainId: n.domainId },
            ]),
          );
          const topicProg = computeTopicProgress(states, nodeTopicMap);
          const allTopics = yield* query((db) =>
            db.select().from(topics).orderBy(topics.displayOrder),
          );
          const topicMap = new Map(allTopics.map((t) => [t.id, t]));

          const freshnessList = computeDomainFreshness(states, now);
          const freshnessMap = new Map(
            freshnessList.map((f) => [f.domainId, f.freshness]),
          );

          const progressByDomain = new Map(
            overall.domains.map((dp) => [dp.domainId, dp]),
          );

          const statesByDomain = new Map<string, LearnerNodeState[]>();
          for (const s of states) {
            const list = statesByDomain.get(s.domainId) ?? [];
            list.push(s);
            statesByDomain.set(s.domainId, list);
          }

          return allDomains.map((domain) => {
            const dp = progressByDomain.get(domain.id);
            const domainTopics = topicProg
              .filter((tp) => tp.domainId === domain.id)
              .map((tp) => ({
                ...tp,
                name: topicMap.get(tp.topicId)?.name ?? "Unknown",
              }));

            const domainStates = statesByDomain.get(domain.id) ?? [];
            const freshness = freshnessMap.get(domain.id) ?? 1.0;
            const badge = computeDomainBadge(domainStates, freshness);

            return {
              domainId: domain.id,
              name: domain.name,
              tier: domain.tier,
              totalNodes: dp?.totalNodes ?? 0,
              mastered: dp?.mastered ?? 0,
              inProgress: dp?.inProgress ?? 0,
              masteryPercentage: dp?.masteryPercentage ?? 0,
              freshness,
              badge,
              topics: domainTopics,
            };
          });
        }),
      );

      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(domainProgress, null, 2),
          },
        ],
      };
    },
  );

  // ─── Skill Tree Map ───────────────────────────────────────────────

  server.resource(
    "skill-tree-map",
    new ResourceTemplate("skillclimb://skilltrees/{id}/map", { list: undefined }),
    {
      description:
        "Full skill tree hierarchy with domains, topics, nodes, and prerequisite graph",
    },
    async (uri, variables) => {
      const skilltreeId = variables.id as string;
      const treeMap = await runEffect(
        Effect.gen(function* () {
          const allDomains = yield* query((db) =>
            db
              .select()
              .from(domains)
              .where(eq(domains.skilltreeId, skilltreeId))
              .orderBy(domains.displayOrder),
          );

          const allTopics = yield* query((db) =>
            db.select().from(topics).orderBy(topics.displayOrder),
          );
          const allNodes = yield* query((db) => db.select().from(nodes));

          return allDomains.map((domain) => ({
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
        }),
      );

      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(treeMap, null, 2),
          },
        ],
      };
    },
  );

  // ─── Session History ──────────────────────────────────────────────

  server.resource(
    "session-history",
    new ResourceTemplate("skillclimb://users/{id}/sessions", { list: undefined }),
    {
      description: "Recent session results and analytics",
    },
    async (uri, variables) => {
      const userId = variables.id as string;
      const history = await runEffect(
        query((db) =>
          db.select().from(sessions).where(eq(sessions.userId, userId)),
        ),
      );

      // Sort by most recent first, limit to 20
      const sorted = history
        .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
        .slice(0, 20)
        .map((s) => ({
          id: s.id,
          startedAt: s.startedAt.toISOString(),
          completedAt: s.completedAt?.toISOString() ?? null,
          itemCount: s.itemCount,
          analytics: s.analytics,
        }));

      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(sorted, null, 2),
          },
        ],
      };
    },
  );
}
