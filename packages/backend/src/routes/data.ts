import { Router } from "express";
import { Effect } from "effect";
import { eq } from "drizzle-orm";
import {
  learnerNodes,
  nodes,
  domains,
  reviews,
  studyDays,
} from "../db/schema.js";
import { query } from "../services/Database.js";
import { HttpResponse, type EffectHandler } from "../effectHandler.js";

function isValidScore(v: unknown): v is number {
  return typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= 5;
}

function isValidConfidence(v: unknown): v is number {
  return typeof v === "number" && Number.isInteger(v) && v >= 1 && v <= 5;
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

export function dataRouter(handle: EffectHandler) {
  const router = Router();

  // GET /api/users/me/data — export all user progress
  router.get(
    "/",
    handle((req) =>
      Effect.gen(function* () {
        const userId = req.userId!;

        // Fetch all user data
        const userLearnerNodes = yield* query((db) =>
          db.select().from(learnerNodes).where(eq(learnerNodes.userId, userId)),
        );
        const userReviews = yield* query((db) =>
          db.select().from(reviews).where(eq(reviews.userId, userId)),
        );
        const userStudyDays = yield* query((db) =>
          db.select().from(studyDays).where(eq(studyDays.userId, userId)),
        );

        // Build lookup maps for portable identifiers
        const allNodes = yield* query((db) => db.select().from(nodes));
        const nodeMap = new Map(allNodes.map((n) => [n.id, n]));

        const allDomains = yield* query((db) => db.select().from(domains));
        const domainMap = new Map(allDomains.map((d) => [d.id, d]));

        // Export learnerNodes with portable identifiers
        const exportedLearnerNodes = userLearnerNodes
          .map((ln) => {
            const node = nodeMap.get(ln.nodeId);
            const domain = domainMap.get(ln.domainId);
            if (!node || !domain) return null;
            return {
              skilltreeId: domain.skilltreeId,
              domainName: domain.name,
              concept: node.concept,
              easiness: ln.easiness,
              interval: ln.interval,
              repetitions: ln.repetitions,
              dueDate: ln.dueDate.toISOString(),
              domainWeight: ln.domainWeight,
              confidenceHistory: ln.confidenceHistory,
              misconceptions: ln.misconceptions,
            };
          })
          .filter(Boolean);

        // Export reviews with portable identifiers
        const exportedReviews = userReviews
          .map((r) => {
            const node = nodeMap.get(r.nodeId);
            const domain = node ? domainMap.get(node.domainId) : undefined;
            if (!node || !domain) return null;
            return {
              skilltreeId: domain.skilltreeId,
              domainName: domain.name,
              concept: node.concept,
              score: r.score,
              confidence: r.confidence,
              response: r.response,
              createdAt: r.createdAt.toISOString(),
            };
          })
          .filter(Boolean);

        // Export study days
        const exportedStudyDays = userStudyDays.map((d) => ({
          date: d.date,
          reviewCount: d.reviewCount,
        }));

        return new HttpResponse(200, {
          version: 1,
          exportedAt: new Date().toISOString(),
          learnerNodes: exportedLearnerNodes,
          reviews: exportedReviews,
          studyDays: exportedStudyDays,
        });
      }),
    ),
  );

  // POST /api/users/me/data — import user progress
  router.post(
    "/",
    handle((req) =>
      Effect.gen(function* () {
        const userId = req.userId!;
        const body = req.body;

        if (!body || body.version !== 1) {
          return new HttpResponse(400, { error: "Invalid export format: expected version 1" }) as HttpResponse<any>;
        }

        // Build lookup: (skilltreeId, domainName, concept) → nodeId, domainId
        const allDomains = yield* query((db) => db.select().from(domains));
        const allNodes = yield* query((db) => db.select().from(nodes));

        const domainLookup = new Map<string, string>(); // "skilltreeId:domainName" → domainId
        for (const d of allDomains) {
          domainLookup.set(`${d.skilltreeId}:${d.name}`, d.id);
        }

        const nodeLookup = new Map<string, { nodeId: string; domainId: string }>(); // "domainId:concept" → {nodeId, domainId}
        for (const n of allNodes) {
          nodeLookup.set(`${n.domainId}:${n.concept}`, { nodeId: n.id, domainId: n.domainId });
        }

        function resolveNode(skilltreeId: string, domainName: string, concept: string) {
          const domainId = domainLookup.get(`${skilltreeId}:${domainName}`);
          if (!domainId) return null;
          return nodeLookup.get(`${domainId}:${concept}`) ?? null;
        }

        const imported = { learnerNodes: 0, reviews: 0, studyDays: 0 };
        const skipped = { learnerNodes: 0, reviews: 0 };

        // Import learnerNodes
        const importLearnerNodes = Array.isArray(body.learnerNodes) ? body.learnerNodes : [];
        for (const ln of importLearnerNodes) {
          const resolved = resolveNode(ln.skilltreeId, ln.domainName, ln.concept);
          if (!resolved) {
            skipped.learnerNodes++;
            continue;
          }
          // Validate numeric fields
          if (!isFiniteNumber(ln.easiness) || !isFiniteNumber(ln.interval)
            || !isFiniteNumber(ln.repetitions) || !isFiniteNumber(ln.domainWeight)) {
            skipped.learnerNodes++;
            continue;
          }
          const dueDate = new Date(ln.dueDate);
          if (isNaN(dueDate.getTime())) {
            skipped.learnerNodes++;
            continue;
          }
          yield* query((db) =>
            db
              .insert(learnerNodes)
              .values({
                userId,
                nodeId: resolved.nodeId,
                domainId: resolved.domainId,
                easiness: ln.easiness,
                interval: ln.interval,
                repetitions: ln.repetitions,
                dueDate,
                domainWeight: ln.domainWeight,
                confidenceHistory: Array.isArray(ln.confidenceHistory) ? ln.confidenceHistory : [],
                misconceptions: Array.isArray(ln.misconceptions) ? ln.misconceptions : [],
              })
              .onConflictDoUpdate({
                target: [learnerNodes.userId, learnerNodes.nodeId],
                set: {
                  easiness: ln.easiness,
                  interval: ln.interval,
                  repetitions: ln.repetitions,
                  dueDate,
                  domainWeight: ln.domainWeight,
                  confidenceHistory: Array.isArray(ln.confidenceHistory) ? ln.confidenceHistory : [],
                  misconceptions: Array.isArray(ln.misconceptions) ? ln.misconceptions : [],
                },
              }),
          );
          imported.learnerNodes++;
        }

        // Import reviews (append-only)
        const importReviews = Array.isArray(body.reviews) ? body.reviews : [];
        for (const r of importReviews) {
          const resolved = resolveNode(r.skilltreeId, r.domainName, r.concept);
          if (!resolved) {
            skipped.reviews++;
            continue;
          }
          // Validate score/confidence ranges (match review route validation)
          if (!isValidScore(r.score) || !isValidConfidence(r.confidence)) {
            skipped.reviews++;
            continue;
          }
          const createdAt = new Date(r.createdAt);
          if (isNaN(createdAt.getTime())) {
            skipped.reviews++;
            continue;
          }
          yield* query((db) =>
            db.insert(reviews).values({
              userId,
              nodeId: resolved.nodeId,
              score: r.score,
              confidence: r.confidence,
              response: String(r.response ?? ""),
              createdAt,
            }),
          );
          imported.reviews++;
        }

        // Import studyDays (upsert)
        const importStudyDays = Array.isArray(body.studyDays) ? body.studyDays : [];
        for (const d of importStudyDays) {
          if (typeof d.date !== "string" || !d.date.match(/^\d{4}-\d{2}-\d{2}$/)
            || typeof d.reviewCount !== "number") {
            continue;
          }
          yield* query((db) =>
            db
              .insert(studyDays)
              .values({
                userId,
                date: d.date,
                reviewCount: d.reviewCount,
              })
              .onConflictDoUpdate({
                target: [studyDays.userId, studyDays.date],
                set: {
                  reviewCount: d.reviewCount,
                },
              }),
          );
          imported.studyDays++;
        }

        return new HttpResponse(200, { imported, skipped });
      }),
    ),
  );

  return router;
}
