import type { CalibrationQuadrant, LearnerNodeState } from "./types.js";

/**
 * Group items by a key derived from each item.
 */
export function groupBy<T>(items: T[], keyFn: (item: T) => string): Map<string, T[]> {
  const result = new Map<string, T[]>();
  for (const item of items) {
    const key = keyFn(item);
    const list = result.get(key) ?? [];
    list.push(item);
    result.set(key, list);
  }
  return result;
}

/**
 * Create a zeroed quadrant counts record.
 */
export function createQuadrantCounts(): Record<CalibrationQuadrant, number> {
  return {
    calibrated: 0,
    illusion: 0,
    undervalued: 0,
    known_unknown: 0,
  };
}

/**
 * Count mastered/inProgress/notStarted from learner node states.
 */
export function countProgress(
  states: LearnerNodeState[],
  isMastered: (s: LearnerNodeState) => boolean,
  isStarted: (s: LearnerNodeState) => boolean,
): { mastered: number; inProgress: number; notStarted: number } {
  let mastered = 0;
  let inProgress = 0;
  let notStarted = 0;

  for (const s of states) {
    if (isMastered(s)) mastered++;
    else if (isStarted(s)) inProgress++;
    else notStarted++;
  }

  return { mastered, inProgress, notStarted };
}
