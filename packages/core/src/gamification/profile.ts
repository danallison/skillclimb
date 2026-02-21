/**
 * Knowledge profile composition — pure functions.
 *
 * Composes all gamification metrics into a single profile view.
 */

import type { StreakInfo, HeatMapEntry } from "./streaks.js";
import type { DomainBadge } from "./badges.js";
import type { VelocityInfo } from "./velocity.js";

export interface KnowledgeProfile {
  // Knowledge summary
  totalMastered: number;
  totalNodes: number;
  tierCompletion: TierCompletion[];
  badges: DomainBadgeSummary;

  // Consistency
  streak: StreakInfo;
  heatMap: HeatMapEntry[];

  // Velocity
  velocity: VelocityInfo;

  // Retention
  retentionStrength: number; // 0–100%, average freshness across mastered domains

  // Calibration
  calibrationScore: number; // 0–100
}

export interface TierCompletion {
  tier: number;
  mastered: number;
  total: number;
  percentage: number;
}

export interface DomainBadgeSummary {
  fresh: number;
  fading: number;
  total: number; // total domains with content
}

/**
 * Summarize domain badges into fresh/fading counts.
 */
export function summarizeBadges(badges: DomainBadge[]): DomainBadgeSummary {
  let fresh = 0;
  let fading = 0;
  for (const b of badges) {
    if (b.badge === "fresh") fresh++;
    else if (b.badge === "fading") fading++;
  }
  return { fresh, fading, total: badges.length };
}

/**
 * Compute average retention strength from domain freshness values.
 * Only considers domains with at least one mastered node.
 * Returns 0–100 as a percentage.
 */
export function computeRetentionStrength(
  domainFreshnesses: Array<{ domainId: string; freshness: number }>,
  masteredCountByDomain: Map<string, number>,
): number {
  const relevant = domainFreshnesses.filter(
    (f) => (masteredCountByDomain.get(f.domainId) ?? 0) > 0,
  );
  if (relevant.length === 0) return 0;
  const avg = relevant.reduce((sum, f) => sum + f.freshness, 0) / relevant.length;
  return Math.round(avg * 100);
}

/**
 * Compose a full knowledge profile from pre-computed components.
 */
export function composeKnowledgeProfile(params: {
  totalMastered: number;
  totalNodes: number;
  tierCompletion: TierCompletion[];
  badges: DomainBadge[];
  streak: StreakInfo;
  heatMap: HeatMapEntry[];
  velocity: VelocityInfo;
  domainFreshnesses: Array<{ domainId: string; freshness: number }>;
  masteredCountByDomain: Map<string, number>;
  calibrationScore: number;
}): KnowledgeProfile {
  return {
    totalMastered: params.totalMastered,
    totalNodes: params.totalNodes,
    tierCompletion: params.tierCompletion,
    badges: summarizeBadges(params.badges),
    streak: params.streak,
    heatMap: params.heatMap,
    velocity: params.velocity,
    retentionStrength: computeRetentionStrength(
      params.domainFreshnesses,
      params.masteredCountByDomain,
    ),
    calibrationScore: params.calibrationScore,
  };
}
