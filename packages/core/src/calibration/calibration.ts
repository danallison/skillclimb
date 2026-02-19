import type {
  CalibrationEntry,
  CalibrationQuadrant,
  CalibrationAnalysis,
  CalibrationTrend,
  CalibrationInsight,
} from "../types.js";
import { getCalibrationQuadrant } from "../scoring/scoring.js";

/**
 * Compute a calibration score from entries.
 * Score = ((calibrated + known_unknown) / total) * 100
 * Rewards accurate self-assessment in both directions.
 */
export function computeCalibrationScore(entries: CalibrationEntry[]): number {
  if (entries.length === 0) return 0;

  let goodCalibration = 0;
  for (const entry of entries) {
    const quadrant = getCalibrationQuadrant(entry.confidence, entry.wasCorrect);
    if (quadrant === "calibrated" || quadrant === "known_unknown") {
      goodCalibration++;
    }
  }

  return Math.round((goodCalibration / entries.length) * 100);
}

/**
 * Compute calibration trend over time periods.
 * Groups entries by time windows of periodDays length.
 */
export function computeCalibrationTrend(
  entries: CalibrationEntry[],
  periodDays: number = 7,
): CalibrationTrend[] {
  if (entries.length === 0) return [];

  // Sort by timestamp
  const sorted = [...entries].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
  );

  const periodMs = periodDays * 24 * 60 * 60 * 1000;
  const firstTimestamp = sorted[0].timestamp.getTime();
  const lastTimestamp = sorted[sorted.length - 1].timestamp.getTime();

  const trends: CalibrationTrend[] = [];
  let periodStart = firstTimestamp;

  while (periodStart <= lastTimestamp) {
    const periodEnd = periodStart + periodMs;
    const periodEntries = sorted.filter(
      (e) => e.timestamp.getTime() >= periodStart && e.timestamp.getTime() < periodEnd,
    );

    if (periodEntries.length > 0) {
      trends.push({
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        score: computeCalibrationScore(periodEntries),
        entryCount: periodEntries.length,
      });
    }

    periodStart = periodEnd;
  }

  return trends;
}

function computeQuadrantCounts(entries: CalibrationEntry[]): Record<CalibrationQuadrant, number> {
  const counts: Record<CalibrationQuadrant, number> = {
    calibrated: 0,
    illusion: 0,
    undervalued: 0,
    known_unknown: 0,
  };
  for (const entry of entries) {
    const quadrant = getCalibrationQuadrant(entry.confidence, entry.wasCorrect);
    counts[quadrant]++;
  }
  return counts;
}

/**
 * Compute full calibration analysis including overall score, per-domain breakdown,
 * trend, and insights.
 */
export function computeCalibrationAnalysis(
  entries: CalibrationEntry[],
  domainMap: Map<string, string>, // nodeId → domainId (or entry key → domainId)
): CalibrationAnalysis {
  const overallScore = computeCalibrationScore(entries);
  const quadrantCounts = computeQuadrantCounts(entries);
  const total = entries.length || 1;

  const quadrantPercentages: Record<CalibrationQuadrant, number> = {
    calibrated: Math.round((quadrantCounts.calibrated / total) * 100),
    illusion: Math.round((quadrantCounts.illusion / total) * 100),
    undervalued: Math.round((quadrantCounts.undervalued / total) * 100),
    known_unknown: Math.round((quadrantCounts.known_unknown / total) * 100),
  };

  // Per-domain breakdown
  // domainMap maps an index/key to domainId — entries must be paired with domain info
  const byDomain = new Map<string, CalibrationEntry[]>();
  // We receive domainMap as a generic mapping. For the backend, each entry at index i
  // maps to domainId via a parallel array. We'll accept domainMap keyed by string index.
  for (let i = 0; i < entries.length; i++) {
    const domainId = domainMap.get(String(i));
    if (!domainId) continue;
    const list = byDomain.get(domainId) ?? [];
    list.push(entries[i]);
    byDomain.set(domainId, list);
  }

  const domainBreakdown = Array.from(byDomain.entries()).map(([domainId, domainEntries]) => ({
    domainId,
    score: computeCalibrationScore(domainEntries),
    quadrantCounts: computeQuadrantCounts(domainEntries),
    entryCount: domainEntries.length,
  }));

  // Sort by worst calibration first
  domainBreakdown.sort((a, b) => a.score - b.score);

  const trend = computeCalibrationTrend(entries);
  const insights = generateCalibrationInsights({
    overallScore,
    quadrantCounts,
    quadrantPercentages,
    domainBreakdown,
    trend,
    insights: [],
    totalEntries: entries.length,
  });

  return {
    overallScore,
    quadrantCounts,
    quadrantPercentages,
    domainBreakdown,
    trend,
    insights,
    totalEntries: entries.length,
  };
}

/**
 * Generate text insights about calibration patterns.
 */
export function generateCalibrationInsights(
  analysis: CalibrationAnalysis,
): CalibrationInsight[] {
  const insights: CalibrationInsight[] = [];

  if (analysis.totalEntries < 5) {
    insights.push({
      type: "well_calibrated",
      message: "Complete more reviews to get calibration insights.",
      severity: "info",
    });
    return insights;
  }

  // Overall calibration quality
  if (analysis.overallScore >= 75) {
    insights.push({
      type: "well_calibrated",
      message: "Your confidence generally matches your performance. Keep it up!",
      severity: "success",
    });
  } else if (analysis.overallScore < 50) {
    const illusionPct = analysis.quadrantPercentages.illusion;
    const undervaluedPct = analysis.quadrantPercentages.undervalued;

    if (illusionPct > undervaluedPct) {
      insights.push({
        type: "overconfident",
        message: `You tend to be overconfident \u2014 ${illusionPct}% of your reviews were confident but incorrect.`,
        severity: "warning",
      });
    } else {
      insights.push({
        type: "underconfident",
        message: `You tend to underestimate yourself \u2014 ${undervaluedPct}% of your reviews were correct despite low confidence.`,
        severity: "info",
      });
    }
  }

  // Domain-specific insights (worst domains)
  for (const domain of analysis.domainBreakdown) {
    if (domain.entryCount >= 5 && domain.score < 40) {
      const illusionRate = domain.quadrantCounts.illusion / domain.entryCount;
      if (illusionRate > 0.3) {
        insights.push({
          type: "domain_specific",
          message: `High overconfidence in domain ${domain.domainId} \u2014 consider reviewing fundamentals.`,
          severity: "warning",
        });
      }
    }
  }

  // Trend insights
  if (analysis.trend.length >= 3) {
    const recent = analysis.trend.slice(-3);
    const isImproving = recent[2].score > recent[0].score + 5;
    const isDeclining = recent[2].score < recent[0].score - 5;

    if (isImproving) {
      insights.push({
        type: "improving",
        message: "Your calibration is improving over time!",
        severity: "success",
      });
    } else if (isDeclining) {
      insights.push({
        type: "declining",
        message: "Your calibration has been declining recently. Slow down and think carefully about your confidence ratings.",
        severity: "warning",
      });
    }
  }

  return insights;
}
