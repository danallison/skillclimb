import { Effect } from "effect";
import { eq, and, sql } from "drizzle-orm";
import { learnerNodes, reviews, studyDays, domains, nodes } from "../db/schema.js";
import { dbRowToLearnerState } from "../db/mappers.js";
import { query, Database } from "./Database.js";
import { NotFoundError, DatabaseError } from "../errors.js";
import {
  calculateNextState,
  getCalibrationQuadrant,
  updateCalibration,
  CORRECT_SCORE_THRESHOLD,
  detectMilestones,
} from "@skillclimb/core";
import type {
  CalibrationHistory,
  ReviewResult,
  CalibrationEntry,
  Milestone,
} from "@skillclimb/core";

export interface ReviewResultWithMilestones extends ReviewResult {
  milestones: Milestone[];
}

export const submitReview = (
  userId: string,
  nodeId: string,
  score: number,
  confidence: number,
  response: string,
  misconceptions?: string[],
): Effect.Effect<ReviewResultWithMilestones, NotFoundError | DatabaseError, Database> =>
  Effect.gen(function* () {
    // 1. READ learner node state from DB
    const [row] = yield* query((db) =>
      db
        .select()
        .from(learnerNodes)
        .where(
          and(eq(learnerNodes.userId, userId), eq(learnerNodes.nodeId, nodeId)),
        ),
    );

    if (!row) {
      return yield* Effect.fail(
        new NotFoundError({
          entity: "LearnerNode",
          id: `user=${userId}, node=${nodeId}`,
        }),
      );
    }

    const currentState = dbRowToLearnerState(row);
    const now = new Date();
    const wasCorrect = score >= CORRECT_SCORE_THRESHOLD;

    // 2. Calculate next SRS state (pure)
    const nextState = calculateNextState(currentState, score, now);

    // 3. Calculate calibration (pure)
    const calibrationHistory: CalibrationHistory = {
      entries: currentState.confidenceHistory,
    };
    const updatedCalibration = updateCalibration(
      confidence,
      wasCorrect,
      calibrationHistory,
      now,
    );
    const quadrant = getCalibrationQuadrant(confidence, wasCorrect);

    // 4. WRITE updated learner node to DB
    const serializedHistory = updatedCalibration.entries.map(
      (e: CalibrationEntry) => ({
        confidence: e.confidence,
        wasCorrect: e.wasCorrect,
        timestamp: e.timestamp.toISOString(),
      }),
    );

    // Merge new misconceptions (deduplicated) with existing ones
    const existingMisconceptions = (currentState.misconceptions ?? []) as string[];
    const mergedMisconceptions = misconceptions && misconceptions.length > 0
      ? [...new Set([...existingMisconceptions, ...misconceptions])]
      : existingMisconceptions;

    yield* query((db) =>
      db
        .update(learnerNodes)
        .set({
          easiness: nextState.easiness,
          interval: nextState.interval,
          repetitions: nextState.repetitions,
          dueDate: nextState.dueDate,
          confidenceHistory: serializedHistory,
          misconceptions: mergedMisconceptions,
        })
        .where(
          and(eq(learnerNodes.userId, userId), eq(learnerNodes.nodeId, nodeId)),
        ),
    );

    // 5. WRITE review record
    yield* query((db) =>
      db.insert(reviews).values({
        userId,
        nodeId,
        score,
        confidence,
        response,
      }),
    );

    // 6. Upsert study_days — track daily activity (UTC date, consistent with streak computation)
    const todayStr = now.toISOString().slice(0, 10);
    yield* query((db) =>
      db
        .insert(studyDays)
        .values({ userId, date: todayStr, reviewCount: 1 })
        .onConflictDoUpdate({
          target: [studyDays.userId, studyDays.date],
          set: { reviewCount: sql`${studyDays.reviewCount} + 1` },
        }),
    );

    // 7. Detect milestones (pure)
    const fullNextState = {
      ...nextState,
      confidenceHistory: updatedCalibration.entries,
    };

    // Fetch domain-level states for milestone detection + domain name
    const domainId = currentState.domainId;
    const domainRows = yield* query((db) =>
      db
        .select()
        .from(learnerNodes)
        .where(
          and(eq(learnerNodes.userId, userId), eq(learnerNodes.domainId, domainId)),
        ),
    );
    // Map domain states, substituting the just-updated node with nextState
    const domainStates = domainRows.map((r) =>
      r.nodeId === nodeId ? fullNextState : dbRowToLearnerState(r),
    );

    const [domainRow] = yield* query((db) =>
      db.select().from(domains).where(eq(domains.id, domainId)),
    );
    const domainName = domainRow?.name ?? "Unknown";

    // Get concept name from the node
    const [nodeRow] = yield* query((db) =>
      db.select().from(nodes).where(eq(nodes.id, nodeId)),
    );
    const conceptName = nodeRow?.concept ?? "this concept";

    const milestones = detectMilestones(
      currentState,
      fullNextState,
      domainStates,
      domainName,
      conceptName,
      wasCorrect,
      now,
    );

    return {
      previousState: currentState,
      nextState: fullNextState,
      wasCorrect,
      calibrationQuadrant: quadrant,
      milestones,
    };
  });
