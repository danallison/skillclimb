import type { LearnerNodeState } from "../types.js";

/**
 * Calculate the new easiness factor after a review.
 * Easiness never drops below 1.3.
 */
export function calculateEasiness(current: number, score: number): number {
  if (score <= 2) {
    // Fail: decrease easiness
    return Math.max(1.3, current - 0.2);
  }
  if (score === 3) {
    // Hard pass: slight decrease
    return Math.max(1.3, current - 0.14);
  }
  if (score === 5) {
    // Perfect: slight increase
    return Math.min(5.0, current + 0.1);
  }
  // Score 4 (good): no change
  return current;
}

/**
 * Calculate the next interval in days.
 * For the first two successful reviews, uses fixed intervals (1 and 6 days).
 * After that, multiplies previous interval by easiness and applies domain weight.
 */
export function calculateInterval(
  repetitions: number,
  previousInterval: number,
  easiness: number,
  domainWeight: number,
): number {
  if (repetitions === 0) {
    return 1;
  }
  if (repetitions === 1) {
    return 6;
  }
  const raw = Math.round(previousInterval * easiness);
  // Domain weight < 1 means shorter intervals (more frequent review for foundational topics)
  // Domain weight > 1 means longer intervals
  return Math.max(1, Math.round(raw * domainWeight));
}

/**
 * Given the current learner state and a review score (0–5),
 * return the next learner state. Pure function — no side effects.
 */
export function calculateNextState(
  current: LearnerNodeState,
  score: number,
  now: Date,
): LearnerNodeState {
  const newEasiness = calculateEasiness(current.easiness, score);

  if (score <= 2) {
    // Fail: reset repetitions and interval
    const newInterval = 1;
    return {
      ...current,
      easiness: newEasiness,
      interval: newInterval,
      repetitions: 0,
      dueDate: addDays(now, newInterval),
    };
  }

  // Score 3–5: success
  const newRepetitions = current.repetitions + 1;

  let newInterval: number;
  if (score === 3) {
    // Hard pass: conservative interval growth
    if (newRepetitions <= 1) {
      newInterval = 1;
    } else if (newRepetitions === 2) {
      newInterval = 4; // conservative compared to normal 6
    } else {
      newInterval = Math.max(1, Math.round(current.interval * newEasiness * 0.8 * current.domainWeight));
    }
  } else {
    // Score 4–5: standard SM-2 interval
    newInterval = calculateInterval(
      newRepetitions - 1, // 0-indexed repetitions for interval calc
      current.interval,
      newEasiness,
      current.domainWeight,
    );
  }

  return {
    ...current,
    easiness: newEasiness,
    interval: newInterval,
    repetitions: newRepetitions,
    dueDate: addDays(now, newInterval),
  };
}

/**
 * Returns true if the node is due for review (due date <= now).
 */
export function isDue(state: LearnerNodeState, now: Date): boolean {
  return state.dueDate <= now;
}

/**
 * Returns the number of days overdue (0 if not overdue).
 */
export function daysOverdue(state: LearnerNodeState, now: Date): number {
  const diff = now.getTime() - state.dueDate.getTime();
  if (diff <= 0) return 0;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
