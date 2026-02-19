import type { LearnerNodeState, CalibrationQuadrant } from "../types.js";
import { isDue } from "../srs/sm2.js";
import { getCalibrationQuadrant } from "../scoring/scoring.js";

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
  const byDomain = new Map<string, LearnerNodeState[]>();

  for (const state of states) {
    const existing = byDomain.get(state.domainId) ?? [];
    existing.push(state);
    byDomain.set(state.domainId, existing);
  }

  const results: DomainProgress[] = [];
  for (const [domainId, domainStates] of byDomain) {
    let mastered = 0;
    let inProgress = 0;
    let notStarted = 0;

    for (const s of domainStates) {
      if (isMastered(s)) mastered++;
      else if (isStarted(s)) inProgress++;
      else notStarted++;
    }

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
    let mastered = 0;
    let inProgress = 0;
    let notStarted = 0;

    for (const s of topicStates) {
      if (isMastered(s)) mastered++;
      else if (isStarted(s)) inProgress++;
      else notStarted++;
    }

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

  const calibrationCounts: Record<CalibrationQuadrant, number> = {
    calibrated: 0,
    illusion: 0,
    undervalued: 0,
    known_unknown: 0,
  };

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

  let mastered = 0;
  let inProgress = 0;
  let notStarted = 0;

  for (const s of states) {
    if (isMastered(s)) mastered++;
    else if (isStarted(s)) inProgress++;
    else notStarted++;
  }

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
