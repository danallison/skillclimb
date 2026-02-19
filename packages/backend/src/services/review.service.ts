import { eq, and } from "drizzle-orm";
import { db } from "../db/connection.js";
import { learnerNodes, reviews } from "../db/schema.js";
import { dbRowToLearnerState } from "../db/mappers.js";
import { calculateNextState, evaluateRecognition, getCalibrationQuadrant, updateCalibration } from "@cyberclimb/core";
import type { CalibrationHistory, ReviewResult, CalibrationEntry } from "@cyberclimb/core";

export async function submitReview(
  userId: string,
  nodeId: string,
  score: number,
  confidence: number,
  response: string,
): Promise<ReviewResult> {
  // 1. READ learner node state from DB
  const [row] = await db
    .select()
    .from(learnerNodes)
    .where(and(eq(learnerNodes.userId, userId), eq(learnerNodes.nodeId, nodeId)));

  if (!row) {
    throw new Error(`No learner node found for user=${userId}, node=${nodeId}`);
  }

  const currentState = dbRowToLearnerState(row);
  const now = new Date();
  const wasCorrect = score >= 3;

  // 2. Calculate next SRS state (pure)
  const nextState = calculateNextState(currentState, score, now);

  // 3. Calculate calibration (pure)
  const calibrationHistory: CalibrationHistory = {
    entries: currentState.confidenceHistory,
  };
  const updatedCalibration = updateCalibration(confidence, wasCorrect, calibrationHistory, now);
  const quadrant = getCalibrationQuadrant(confidence, wasCorrect);

  // 4. WRITE updated learner node to DB
  const serializedHistory = updatedCalibration.entries.map((e: CalibrationEntry) => ({
    confidence: e.confidence,
    wasCorrect: e.wasCorrect,
    timestamp: e.timestamp.toISOString(),
  }));

  await db
    .update(learnerNodes)
    .set({
      easiness: nextState.easiness,
      interval: nextState.interval,
      repetitions: nextState.repetitions,
      dueDate: nextState.dueDate,
      confidenceHistory: serializedHistory,
    })
    .where(and(eq(learnerNodes.userId, userId), eq(learnerNodes.nodeId, nodeId)));

  // 5. WRITE review record
  await db.insert(reviews).values({
    userId,
    nodeId,
    score,
    confidence,
    response,
  });

  return {
    previousState: currentState,
    nextState: {
      ...nextState,
      confidenceHistory: updatedCalibration.entries,
    },
    wasCorrect,
    calibrationQuadrant: quadrant,
  };
}
