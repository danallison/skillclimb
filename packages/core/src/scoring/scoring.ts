import type { CalibrationHistory, CalibrationQuadrant, CalibrationEntry, QuestionTemplate } from "../types.js";
import { createQuadrantCounts } from "../utils.js";
import { CORRECT_SCORE_THRESHOLD } from "../types.js";

export type SelfRating = "correct" | "partially_correct" | "incorrect";

/** Maximum score for a hint-assisted second attempt.
 * Must be >= CORRECT_SCORE_THRESHOLD so correct answers are still classified as correct. */
export const HINTED_ATTEMPT_SCORE_CAP = 3;

export function scoreFromSelfRating(rating: SelfRating): number {
  switch (rating) {
    case "correct": return 5;
    case "partially_correct": return 3;
    case "incorrect": return 0;
  }
}

/**
 * Cap a score for hint-assisted second attempts.
 * Needing a hint means partial credit at best — keeps SRS intervals short.
 */
export function capScoreForHintedAttempt(rawScore: number, attemptNumber: number): number {
  if (attemptNumber >= 2) return Math.min(rawScore, HINTED_ATTEMPT_SCORE_CAP);
  return rawScore;
}

/**
 * Classify a numeric score into a SelfRating.
 * Uses the correct score threshold (3) as the boundary.
 */
export function classifyScore(score: number): SelfRating {
  if (score >= CORRECT_SCORE_THRESHOLD) return "correct";
  if (score >= HINTED_ATTEMPT_SCORE_CAP) return "partially_correct";
  return "incorrect";
}

/**
 * Whether a question type is auto-scored (vs requiring self-rating or AI evaluation).
 */
export function isAutoScoredType(type: QuestionTemplate["type"]): boolean {
  return type === "recognition" || type === "cued_recall";
}

/**
 * Whether a question type requires self-rating (or AI evaluation) for scoring.
 */
export function requiresSelfRating(type: QuestionTemplate["type"]): boolean {
  return !isAutoScoredType(type);
}

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
 * Normalize an answer string for comparison: lowercase, trim, collapse whitespace.
 */
export function normalizeAnswer(answer: string): string {
  return answer.toLowerCase().trim().replace(/\s+/g, " ");
}

/**
 * Evaluate a cued recall answer against the correct answer and optional alternatives.
 * Returns a score on the 0–5 scale.
 * - Exact match (normalized) → 5
 * - Match an acceptable answer → 4
 * - No match → 0
 */
export function evaluateCuedRecall(
  response: string,
  correctAnswer: string,
  acceptableAnswers?: string[],
): number {
  const normalized = normalizeAnswer(response);

  if (normalized === normalizeAnswer(correctAnswer)) {
    return 5;
  }

  if (acceptableAnswers) {
    for (const acceptable of acceptableAnswers) {
      if (normalized === normalizeAnswer(acceptable)) {
        return 4;
      }
    }
  }

  return 0;
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
