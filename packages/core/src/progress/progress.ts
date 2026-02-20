import type { LearnerNodeState, CalibrationQuadrant } from "../types.js";
import { isDue } from "../srs/sm2.js";
import { getCalibrationQuadrant } from "../scoring/scoring.js";
import { groupBy, createQuadrantCounts, countProgress } from "../utils.js";

const MS_PER_DAY = 86_400_000;

export interface DomainProgress {
  domainId: string;
  totalNodes: number;
  mastered: number;
  inProgress: number;
  notStarted: number;
  masteryPercentage: number;
}

export interface TopicProgress {
  topicId: string;
  domainId: string;
  totalNodes: number;
  mastered: number;
  inProgress: number;
  notStarted: number;
}

export interface NextSessionInfo {
  dueNow: number;
  nextDueDate: Date | null; // earliest future due date, null if everything is due now or no items
  dueTodayRemaining: number; // due later today but not yet
  dueWithinWeek: number;
}

export interface OverallProgress {
  totalNodes: number;
  mastered: number;
  inProgress: number;
  notStarted: number;
  masteryPercentage: number;
  domains: DomainProgress[];
  nextSession: NextSessionInfo;
}

/**
 * Determine if a learner node is "mastered":
 * 3+ consecutive successes and easiness still healthy (>= 2.0).
 */
export function isMastered(state: LearnerNodeState): boolean {
  return state.repetitions >= 3 && state.easiness >= 2.0;
}

/**
 * Determine if a learner node has been started (at least one review).
 */
export function isStarted(state: LearnerNodeState): boolean {
  return state.repetitions > 0 || state.interval > 0;
}

/**
 * Compute next session timing from learner node states.
 */
export function computeNextSession(
  states: LearnerNodeState[],
  now: Date,
): NextSessionInfo {
  let dueNow = 0;
  let dueTodayRemaining = 0;
  let dueWithinWeek = 0;
  let nextDueDate: Date | null = null;

  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  const endOfWeek = new Date(now);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  for (const state of states) {
    if (isDue(state, now)) {
      dueNow++;
    } else {
      // Future due date
      if (state.dueDate <= endOfToday) {
        dueTodayRemaining++;
      }
      if (state.dueDate <= endOfWeek) {
        dueWithinWeek++;
      }
      if (nextDueDate === null || state.dueDate < nextDueDate) {
        nextDueDate = state.dueDate;
      }
    }
  }

  return { dueNow, nextDueDate, dueTodayRemaining, dueWithinWeek };
}

/**
 * Compute per-domain progress from learner node states.
 */
export function computeDomainProgress(states: LearnerNodeState[]): DomainProgress[] {
  const byDomain = groupBy(states, (s) => s.domainId);

  const results: DomainProgress[] = [];
  for (const [domainId, domainStates] of byDomain) {
    const { mastered, inProgress, notStarted } = countProgress(domainStates, isMastered, isStarted);
    const total = domainStates.length;
    results.push({
      domainId,
      totalNodes: total,
      mastered,
      inProgress,
      notStarted,
      masteryPercentage: total > 0 ? Math.round((mastered / total) * 100) : 0,
    });
  }

  return results;
}

/**
 * Compute per-topic progress. Requires a nodeId→topicId mapping.
 */
export function computeTopicProgress(
  states: LearnerNodeState[],
  nodeTopicMap: Map<string, { topicId: string; domainId: string }>,
): TopicProgress[] {
  const byTopic = new Map<string, { domainId: string; states: LearnerNodeState[] }>();

  for (const state of states) {
    const mapping = nodeTopicMap.get(state.nodeId);
    if (!mapping) continue;
    const existing = byTopic.get(mapping.topicId) ?? { domainId: mapping.domainId, states: [] };
    existing.states.push(state);
    byTopic.set(mapping.topicId, existing);
  }

  const results: TopicProgress[] = [];
  for (const [topicId, { domainId, states: topicStates }] of byTopic) {
    const { mastered, inProgress, notStarted } = countProgress(topicStates, isMastered, isStarted);

    results.push({
      topicId,
      domainId,
      totalNodes: topicStates.length,
      mastered,
      inProgress,
      notStarted,
    });
  }

  return results;
}

// === Session summary ===

export interface ReviewRecord {
  wasCorrect: boolean;
  confidence: number;
}

export interface SessionSummary {
  totalReviews: number;
  correctCount: number;
  accuracyPercentage: number;
  calibrationCounts: Record<CalibrationQuadrant, number>;
}

/**
 * Compute session summary statistics from review records.
 */
export function computeSessionSummary(reviews: ReviewRecord[]): SessionSummary {
  const total = reviews.length;
  const correct = reviews.filter((r) => r.wasCorrect).length;

  const calibrationCounts = createQuadrantCounts();

  for (const r of reviews) {
    const quadrant = getCalibrationQuadrant(r.confidence, r.wasCorrect);
    calibrationCounts[quadrant]++;
  }

  return {
    totalReviews: total,
    correctCount: correct,
    accuracyPercentage: total > 0 ? Math.round((correct / total) * 100) : 0,
    calibrationCounts,
  };
}

// === Tier aggregation ===

export interface TierProgress {
  tier: number;
  totalNodes: number;
  mastered: number;
  inProgress: number;
  notStarted: number;
  masteryPercentage: number;
}

/**
 * Aggregate domain progress into tier-level summaries.
 */
export function computeTierProgress(
  domains: Array<{ tier: number; totalNodes: number; mastered: number; inProgress: number; notStarted: number }>,
): TierProgress[] {
  const byTier = new Map<number, TierProgress>();

  for (const d of domains) {
    const existing = byTier.get(d.tier) ?? {
      tier: d.tier,
      totalNodes: 0,
      mastered: 0,
      inProgress: 0,
      notStarted: 0,
      masteryPercentage: 0,
    };
    existing.totalNodes += d.totalNodes;
    existing.mastered += d.mastered;
    existing.inProgress += d.inProgress;
    existing.notStarted += d.notStarted;
    byTier.set(d.tier, existing);
  }

  const results: TierProgress[] = [];
  for (const tp of byTier.values()) {
    tp.masteryPercentage = tp.totalNodes > 0 ? Math.round((tp.mastered / tp.totalNodes) * 100) : 0;
    results.push(tp);
  }

  return results.sort((a, b) => a.tier - b.tier);
}

/**
 * Compute overall progress summary.
 */
export function computeOverallProgress(
  states: LearnerNodeState[],
  now: Date,
): OverallProgress {
  const domains = computeDomainProgress(states);
  const nextSession = computeNextSession(states, now);

  const { mastered, inProgress, notStarted } = countProgress(states, isMastered, isStarted);
  const total = states.length;

  return {
    totalNodes: total,
    mastered,
    inProgress,
    notStarted,
    masteryPercentage: total > 0 ? Math.round((mastered / total) * 100) : 0,
    domains,
    nextSession,
  };
}

// === Struggling detection (instructional content delivery) ===

/**
 * Determine if a learner is struggling with a node.
 * Triggers when easiness is very low or when repetitions were reset to 0
 * after a failure (interval > 0 but repetitions reset).
 */
export function isStruggling(state: LearnerNodeState): boolean {
  return state.easiness < 1.8 || (state.repetitions === 0 && state.interval > 0);
}

// === Domain freshness (knowledge decay visualization) ===

export interface DomainFreshness {
  domainId: string;
  freshness: number; // 0.0 (fully decayed) to 1.0 (fully fresh)
}

/**
 * Compute per-domain freshness from mastered learner node states.
 * Freshness represents how "fresh" mastered knowledge is — 1.0 means all
 * mastered nodes are well within their review interval, 0.0 means they're
 * all heavily overdue.
 *
 * Non-mastered nodes are excluded. Domains with no mastered nodes get 1.0.
 */
export function computeDomainFreshness(
  states: LearnerNodeState[],
  now: Date,
): DomainFreshness[] {
  const byDomain = groupBy(states, (s) => s.domainId);
  const results: DomainFreshness[] = [];

  for (const [domainId, domainStates] of byDomain) {
    const masteredStates = domainStates.filter(
      (s) => isMastered(s) && s.interval > 0,
    );

    if (masteredStates.length === 0) {
      results.push({ domainId, freshness: 1.0 });
      continue;
    }

    let totalFreshness = 0;
    for (const s of masteredStates) {
      const intervalMs = s.interval * MS_PER_DAY;
      const dueTime = s.dueDate.getTime();
      const nowTime = now.getTime();

      if (dueTime > nowTime) {
        // Not yet due — freshness based on remaining time relative to interval
        totalFreshness += Math.min(1, (dueTime - nowTime) / intervalMs);
      } else {
        // Overdue — freshness decays based on how overdue relative to interval
        const overdueDays = (nowTime - dueTime) / MS_PER_DAY;
        totalFreshness += Math.max(0, 1 - overdueDays / s.interval);
      }
    }

    results.push({
      domainId,
      freshness: totalFreshness / masteredStates.length,
    });
  }

  return results;
}

/**
 * Format next session timing info into a human-readable string.
 * Pure date math — no rendering.
 */
export function formatNextSession(nextSession: {
  dueNow: number;
  nextDueDate: Date | string | null;
  dueTodayRemaining: number;
  dueWithinWeek: number;
}, now: Date): string {
  if (nextSession.dueNow > 0) {
    return `${nextSession.dueNow} items ready for review`;
  }
  if (!nextSession.nextDueDate) {
    return "No items scheduled";
  }
  const next = nextSession.nextDueDate instanceof Date
    ? nextSession.nextDueDate
    : new Date(nextSession.nextDueDate);
  const diffMs = next.getTime() - now.getTime();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return "Next review in less than an hour";
  if (diffHours < 24) return `Next review in ${diffHours} hour${diffHours === 1 ? "" : "s"}`;
  return `Next review in ${diffDays} day${diffDays === 1 ? "" : "s"}`;
}
