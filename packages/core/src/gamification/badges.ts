/**
 * Mastery badge computation — pure functions.
 *
 * Badge status is derived from existing learner node state + domain freshness.
 * No badge table — badges are computed, not stored.
 */

import type { LearnerNodeState } from "../types.js";
import { isMastered } from "../progress/progress.js";

export type BadgeState = "fresh" | "fading" | "none";

export interface DomainBadge {
  domainId: string;
  badge: BadgeState;
  freshness: number; // 0.0–1.0 (only meaningful when badge !== "none")
  masteredCount: number;
  totalCount: number;
}

/**
 * Compute badge status for a single domain.
 *
 * - "fresh": all nodes mastered AND freshness > 0.7
 * - "fading": all nodes mastered AND freshness 0.3–0.7
 * - "none": not all nodes mastered OR freshness < 0.3
 */
export function computeDomainBadge(
  domainStates: LearnerNodeState[],
  freshness: number,
): BadgeState {
  if (domainStates.length === 0) return "none";

  const allMastered = domainStates.every(isMastered);
  if (!allMastered) return "none";

  if (freshness > 0.7) return "fresh";
  if (freshness >= 0.3) return "fading";
  return "none";
}

/**
 * Compute badge status for all domains.
 */
export function computeAllBadges(
  statesByDomain: Map<string, LearnerNodeState[]>,
  freshnessByDomain: Map<string, number>,
): DomainBadge[] {
  const badges: DomainBadge[] = [];

  for (const [domainId, states] of statesByDomain) {
    const freshness = freshnessByDomain.get(domainId) ?? 1.0;
    const masteredCount = states.filter(isMastered).length;
    badges.push({
      domainId,
      badge: computeDomainBadge(states, freshness),
      freshness,
      masteredCount,
      totalCount: states.length,
    });
  }

  return badges;
}
