/**
 * Milestone detection — pure functions.
 *
 * Detects real learning events by comparing previous/next SRS state:
 * - Node mastered (first time reaching mastery threshold)
 * - Domain milestone (domain crosses 25/50/75/100%)
 * - Overdue recovery (correct answer on significantly overdue item)
 */

import type { LearnerNodeState } from "../types.js";
import { isMastered } from "../progress/progress.js";

export type MilestoneType = "node_mastered" | "domain_milestone" | "overdue_recovery";

export interface Milestone {
  type: MilestoneType;
  message: string;
  /** Additional context (e.g., domain percentage, days overdue) */
  detail?: string;
}

const MS_PER_DAY = 86_400_000;
const DOMAIN_MILESTONE_THRESHOLDS = [25, 50, 75, 100];
const OVERDUE_THRESHOLD_DAYS = 3; // Minimum days overdue to count as "overdue recovery"

/**
 * Detect milestones from a single review's state transition.
 *
 * @param previousState - learner node state before the review
 * @param nextState - learner node state after the review
 * @param domainStates - all learner node states for the same domain (AFTER this review)
 * @param domainName - human-readable domain name
 * @param conceptName - human-readable concept name
 * @param wasCorrect - whether the review answer was correct
 * @param now - current timestamp
 */
export function detectMilestones(
  previousState: LearnerNodeState,
  nextState: LearnerNodeState,
  domainStates: LearnerNodeState[],
  domainName: string,
  conceptName: string,
  wasCorrect: boolean,
  now: Date,
): Milestone[] {
  const milestones: Milestone[] = [];

  // 1. Node mastered — transition from not-mastered to mastered
  if (!isMastered(previousState) && isMastered(nextState)) {
    milestones.push({
      type: "node_mastered",
      message: `Mastered: ${conceptName}`,
      detail: "This is now in your long-term memory.",
    });
  }

  // 2. Domain milestone — domain crosses a threshold
  if (domainStates.length > 0) {
    const masteredCount = domainStates.filter(isMastered).length;
    const totalCount = domainStates.length;
    const currentPct = Math.round((masteredCount / totalCount) * 100);

    // Check previous percentage (before this node's update)
    const wasMasteredBefore = isMastered(previousState);
    const isMasteredNow = isMastered(nextState);
    const masteredBefore = masteredCount - (isMasteredNow ? 1 : 0) + (wasMasteredBefore ? 1 : 0);
    const previousPct = Math.round((masteredBefore / totalCount) * 100);

    for (let i = DOMAIN_MILESTONE_THRESHOLDS.length - 1; i >= 0; i--) {
      const threshold = DOMAIN_MILESTONE_THRESHOLDS[i];
      if (previousPct < threshold && currentPct >= threshold) {
        milestones.push({
          type: "domain_milestone",
          message: `${domainName}: ${threshold}% mastered`,
          detail: `${masteredCount} of ${totalCount} concepts`,
        });
        break; // Only report the highest crossed threshold
      }
    }
  }

  // 3. Overdue recovery — correct answer on significantly overdue item (only if previously reviewed)
  if (wasCorrect && previousState.repetitions > 0) {
    const daysOverdue = (now.getTime() - previousState.dueDate.getTime()) / MS_PER_DAY;
    if (daysOverdue >= OVERDUE_THRESHOLD_DAYS) {
      milestones.push({
        type: "overdue_recovery",
        message: `You remembered ${conceptName} after ${Math.round(daysOverdue)} days`,
        detail: "Strong long-term retention.",
      });
    }
  }

  return milestones;
}
