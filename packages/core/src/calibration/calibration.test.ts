import { describe, it, expect } from "vitest";
import {
  computeCalibrationScore,
  computeCalibrationTrend,
  computeCalibrationAnalysis,
  generateCalibrationInsights,
} from "./calibration.js";
import type { CalibrationEntry, CalibrationAnalysis } from "../types.js";

function makeEntry(
  confidence: number,
  wasCorrect: boolean,
  daysAgo: number = 0,
): CalibrationEntry {
  const timestamp = new Date("2025-01-15T00:00:00Z");
  timestamp.setDate(timestamp.getDate() - daysAgo);
  return { confidence, wasCorrect, timestamp };
}

describe("computeCalibrationScore", () => {
  it("returns 0 for empty entries", () => {
    expect(computeCalibrationScore([])).toBe(0);
  });

  it("returns 100 for perfectly calibrated entries", () => {
    const entries = [
      makeEntry(4, true),  // calibrated
      makeEntry(5, true),  // calibrated
      makeEntry(1, false), // known_unknown
      makeEntry(2, false), // known_unknown
    ];
    expect(computeCalibrationScore(entries)).toBe(100);
  });

  it("returns 0 for completely miscalibrated entries", () => {
    const entries = [
      makeEntry(4, false), // illusion
      makeEntry(5, false), // illusion
      makeEntry(1, true),  // undervalued
      makeEntry(2, true),  // undervalued
    ];
    expect(computeCalibrationScore(entries)).toBe(0);
  });

  it("returns 50 for mixed calibration", () => {
    const entries = [
      makeEntry(4, true),  // calibrated
      makeEntry(4, false), // illusion
      makeEntry(1, true),  // undervalued
      makeEntry(1, false), // known_unknown
    ];
    expect(computeCalibrationScore(entries)).toBe(50);
  });
});

describe("computeCalibrationTrend", () => {
  it("returns empty for no entries", () => {
    expect(computeCalibrationTrend([])).toEqual([]);
  });

  it("groups entries into weekly periods", () => {
    const entries = [
      makeEntry(4, true, 14),  // 2 weeks ago
      makeEntry(4, true, 13),
      makeEntry(4, false, 7),  // 1 week ago
      makeEntry(4, false, 6),
      makeEntry(4, true, 1),   // this week
      makeEntry(1, false, 0),
    ];

    const trend = computeCalibrationTrend(entries, 7);
    expect(trend.length).toBeGreaterThanOrEqual(2);
    // First period should be well calibrated (all correct with high confidence)
    expect(trend[0].score).toBe(100);
  });
});

describe("computeCalibrationAnalysis", () => {
  it("computes full analysis", () => {
    const entries = [
      makeEntry(4, true, 0),
      makeEntry(5, false, 0),
      makeEntry(1, true, 0),
      makeEntry(2, false, 0),
    ];

    const domainMap = new Map([
      ["0", "d1"],
      ["1", "d1"],
      ["2", "d2"],
      ["3", "d2"],
    ]);

    const analysis = computeCalibrationAnalysis(entries, domainMap);

    expect(analysis.overallScore).toBe(50);
    expect(analysis.quadrantCounts.calibrated).toBe(1);
    expect(analysis.quadrantCounts.illusion).toBe(1);
    expect(analysis.quadrantCounts.undervalued).toBe(1);
    expect(analysis.quadrantCounts.known_unknown).toBe(1);
    expect(analysis.totalEntries).toBe(4);
    expect(analysis.domainBreakdown).toHaveLength(2);
  });

  it("sorts domain breakdown by worst first", () => {
    const entries = [
      makeEntry(4, true, 0),   // d1 calibrated
      makeEntry(4, true, 0),   // d1 calibrated
      makeEntry(4, false, 0),  // d2 illusion
      makeEntry(4, false, 0),  // d2 illusion
    ];

    const domainMap = new Map([
      ["0", "d1"],
      ["1", "d1"],
      ["2", "d2"],
      ["3", "d2"],
    ]);

    const analysis = computeCalibrationAnalysis(entries, domainMap);
    expect(analysis.domainBreakdown[0].domainId).toBe("d2"); // worst first
    expect(analysis.domainBreakdown[0].score).toBe(0);
    expect(analysis.domainBreakdown[1].domainId).toBe("d1");
    expect(analysis.domainBreakdown[1].score).toBe(100);
  });
});

describe("generateCalibrationInsights", () => {
  it("returns info message for too few entries", () => {
    const analysis: CalibrationAnalysis = {
      overallScore: 50,
      quadrantCounts: { calibrated: 1, illusion: 1, undervalued: 0, known_unknown: 0 },
      quadrantPercentages: { calibrated: 50, illusion: 50, undervalued: 0, known_unknown: 0 },
      domainBreakdown: [],
      trend: [],
      insights: [],
      totalEntries: 3,
    };

    const insights = generateCalibrationInsights(analysis);
    expect(insights).toHaveLength(1);
    expect(insights[0].severity).toBe("info");
  });

  it("generates success insight for high score", () => {
    const analysis: CalibrationAnalysis = {
      overallScore: 80,
      quadrantCounts: { calibrated: 6, illusion: 1, undervalued: 1, known_unknown: 2 },
      quadrantPercentages: { calibrated: 60, illusion: 10, undervalued: 10, known_unknown: 20 },
      domainBreakdown: [],
      trend: [],
      insights: [],
      totalEntries: 10,
    };

    const insights = generateCalibrationInsights(analysis);
    const successInsight = insights.find((i) => i.type === "well_calibrated");
    expect(successInsight).toBeDefined();
    expect(successInsight!.severity).toBe("success");
  });

  it("generates overconfidence warning for high illusion rate", () => {
    const analysis: CalibrationAnalysis = {
      overallScore: 30,
      quadrantCounts: { calibrated: 2, illusion: 5, undervalued: 1, known_unknown: 2 },
      quadrantPercentages: { calibrated: 20, illusion: 50, undervalued: 10, known_unknown: 20 },
      domainBreakdown: [],
      trend: [],
      insights: [],
      totalEntries: 10,
    };

    const insights = generateCalibrationInsights(analysis);
    const overconfident = insights.find((i) => i.type === "overconfident");
    expect(overconfident).toBeDefined();
    expect(overconfident!.severity).toBe("warning");
  });
});
