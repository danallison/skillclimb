import type { CalibrationHistory, CalibrationQuadrant, CalibrationEntry } from "../types.js";
import { createQuadrantCounts } from "../utils.js";

/**
 * Evaluate a recognition (multiple choice) answer.
 * Returns a score on the 0–5 scale.
 * Pass null for selected when the learner chose "I don't know" — returns 1
 * (honest admission of gap, slightly less punishing than a wrong guess).
 */
export function evaluateRecognition(selected: string | null, correct: string): number {
  if (selected === null) {
    return 1; // "I don't know" — honest gap acknowledgment
  }
  if (selected === correct) {
    return 5; // Perfect for recognition
  }
  return 0; // Wrong for recognition
}

/**
 * Determine which calibration quadrant this review falls into.
 * Confidence 1–2 = low, 3–5 = high.
 */
export function getCalibrationQuadrant(
  confidence: number,
  wasCorrect: boolean,
): CalibrationQuadrant {
  const highConfidence = confidence >= 3;

  if (highConfidence && wasCorrect) return "calibrated";
  if (highConfidence && !wasCorrect) return "illusion";
  if (!highConfidence && wasCorrect) return "undervalued";
  return "known_unknown";
}

/**
 * Append a new calibration entry to the history.
 * Pure function — returns a new history object.
 */
export function updateCalibration(
  confidence: number,
  wasCorrect: boolean,
  history: CalibrationHistory,
  now: Date,
): CalibrationHistory {
  const entry: CalibrationEntry = {
    confidence,
    wasCorrect,
    timestamp: now,
  };

  return {
    entries: [...history.entries, entry],
  };
}

/**
 * Calculate calibration stats from history.
 * Returns the fraction of each quadrant in the history.
 */
export function getCalibrationStats(history: CalibrationHistory): Record<CalibrationQuadrant, number> {
  const counts = createQuadrantCounts();

  for (const entry of history.entries) {
    const quadrant = getCalibrationQuadrant(entry.confidence, entry.wasCorrect);
    counts[quadrant]++;
  }

  const total = history.entries.length || 1;
  return {
    calibrated: counts.calibrated / total,
    illusion: counts.illusion / total,
    undervalued: counts.undervalued / total,
    known_unknown: counts.known_unknown / total,
  };
}
