/**
 * Session momentum indicator — pure functions.
 *
 * Tracks rolling accuracy within a session to provide
 * immediate feedback on challenge-skill balance.
 */

export type MomentumState = "building" | "steady" | "struggling";

export interface MomentumInfo {
  state: MomentumState;
  recentCorrect: number;
  recentTotal: number;
  message: string;
}

export interface SessionMomentumSummary {
  overallAccuracy: number;
  inTargetZone: boolean; // 60–80% accuracy
  message: string;
}

const WINDOW_SIZE = 5;

/**
 * Compute current momentum from recent review results.
 * Uses a rolling window of the last 5 items.
 */
export function computeMomentum(recentResults: boolean[]): MomentumInfo {
  const window = recentResults.slice(-WINDOW_SIZE);
  const total = window.length;

  if (total === 0) {
    return { state: "steady", recentCorrect: 0, recentTotal: 0, message: "" };
  }

  const correct = window.filter(Boolean).length;

  let state: MomentumState;
  let message: string;

  if (correct >= 3) {
    state = "building";
    message = "Strong recall";
  } else if (correct >= 2) {
    state = "steady";
    message = "Good challenge level";
  } else {
    state = "struggling";
    message = "Hard questions build stronger memory";
  }

  return { state, recentCorrect: correct, recentTotal: total, message };
}

/**
 * Compute session-level momentum summary.
 * The target accuracy zone is 60–80% — the empirical sweet spot
 * for learning (desirable difficulties).
 */
export function computeSessionMomentum(allResults: boolean[]): SessionMomentumSummary {
  const total = allResults.length;
  if (total === 0) {
    return {
      overallAccuracy: 0,
      inTargetZone: false,
      message: "No reviews completed",
    };
  }

  const correct = allResults.filter(Boolean).length;
  const accuracy = Math.round((correct / total) * 100);
  const inTargetZone = accuracy >= 60 && accuracy <= 80;

  let message: string;
  if (accuracy > 80) {
    message = "High accuracy — you may benefit from harder material";
  } else if (inTargetZone) {
    message = "Target zone — this difficulty level maximizes learning";
  } else {
    message = "Challenging session — struggle strengthens long-term retention";
  }

  return { overallAccuracy: accuracy, inTargetZone, message };
}
