import { Effect } from "effect";
import { eq, and } from "drizzle-orm";
import { learnerNodes, reviews } from "../db/schema.js";
import { dbRowToLearnerState } from "../db/mappers.js";
import { query, Database } from "./Database.js";
import { NotFoundError, DatabaseError } from "../errors.js";
import {
  calculateNextState,
  getCalibrationQuadrant,
  updateCalibration,
  CORRECT_SCORE_THRESHOLD,
} from "@skillclimb/core";
import type {
  CalibrationHistory,
  ReviewResult,
  CalibrationEntry,
} from "@skillclimb/core";

export const submitReview = (
  userId: string,
  nodeId: string,
  score: number,
  confidence: number,
  response: string,
  misconceptions?: string[],
): Effect.Effect<ReviewResult, NotFoundError | DatabaseError, Database> =>
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

    return {
      previousState: currentState,
      nextState: {
        ...nextState,
        confidenceHistory: updatedCalibration.entries,
      },
      wasCorrect,
      calibrationQuadrant: quadrant,
    };
  });
