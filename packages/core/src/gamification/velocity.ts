/**
 * Learning velocity computation — pure functions.
 *
 * Computes nodes mastered per week (rolling 4-week average) and trend direction.
 */

export interface MasteryEvent {
  nodeId: string;
  masteredAt: Date;
}

export type VelocityTrend = "increasing" | "stable" | "decreasing";

export interface VelocityInfo {
  nodesPerWeek: number; // rolling 4-week average
  trend: VelocityTrend;
  weeklyBreakdown: number[]; // last 4 weeks, oldest first
}

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

/**
 * Compute learning velocity from mastery events.
 *
 * Looks at the last 4 calendar weeks and counts how many nodes
 * reached mastery in each week. Trend is determined by comparing
 * the most recent 2 weeks to the prior 2 weeks.
 */
export function computeVelocity(
  masteryEvents: MasteryEvent[],
  now: Date,
): VelocityInfo {
  // Define 4 week boundaries (most recent week first, then reverse)
  const weekBoundaries: Date[] = [];
  for (let i = 0; i <= 4; i++) {
    const d = new Date(now.getTime() - i * MS_PER_WEEK);
    weekBoundaries.push(d);
  }

  // Buckets: week[0] = most recent, week[3] = oldest
  const weekCounts = [0, 0, 0, 0];

  for (const event of masteryEvents) {
    const t = event.masteredAt.getTime();
    for (let i = 0; i < 4; i++) {
      const weekEnd = weekBoundaries[i].getTime();
      const weekStart = weekBoundaries[i + 1].getTime();
      if (t > weekStart && t <= weekEnd) {
        weekCounts[i]++;
        break;
      }
    }
  }

  // Reverse so oldest is first for output
  const weeklyBreakdown = [...weekCounts].reverse();
  const total = weeklyBreakdown.reduce((a, b) => a + b, 0);
  const nodesPerWeek = Math.round((total / 4) * 10) / 10; // 1 decimal place

  // Trend: compare sum of recent 2 weeks vs prior 2 weeks
  const recentSum = weeklyBreakdown[2] + weeklyBreakdown[3];
  const priorSum = weeklyBreakdown[0] + weeklyBreakdown[1];

  let trend: VelocityTrend;
  if (recentSum > priorSum + 1) {
    trend = "increasing";
  } else if (recentSum < priorSum - 1) {
    trend = "decreasing";
  } else {
    trend = "stable";
  }

  return { nodesPerWeek, trend, weeklyBreakdown };
}
