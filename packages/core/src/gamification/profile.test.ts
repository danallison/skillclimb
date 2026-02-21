import { describe, it, expect } from "vitest";
import { summarizeBadges, computeRetentionStrength, composeKnowledgeProfile } from "./profile.js";
import type { DomainBadge } from "./badges.js";

describe("summarizeBadges", () => {
  it("counts fresh and fading badges", () => {
    const badges: DomainBadge[] = [
      { domainId: "d1", badge: "fresh", freshness: 0.9, masteredCount: 5, totalCount: 5 },
      { domainId: "d2", badge: "fading", freshness: 0.5, masteredCount: 3, totalCount: 3 },
      { domainId: "d3", badge: "none", freshness: 0.1, masteredCount: 1, totalCount: 5 },
    ];
    const summary = summarizeBadges(badges);
    expect(summary.fresh).toBe(1);
    expect(summary.fading).toBe(1);
    expect(summary.total).toBe(3);
  });
});

describe("computeRetentionStrength", () => {
  it("returns 0 for no mastered domains", () => {
    const result = computeRetentionStrength(
      [{ domainId: "d1", freshness: 0.5 }],
      new Map(),
    );
    expect(result).toBe(0);
  });

  it("averages freshness of mastered domains", () => {
    const result = computeRetentionStrength(
      [
        { domainId: "d1", freshness: 0.8 },
        { domainId: "d2", freshness: 0.6 },
      ],
      new Map([["d1", 3], ["d2", 5]]),
    );
    expect(result).toBe(70); // (0.8 + 0.6) / 2 = 0.7 → 70%
  });

  it("returns 0 for empty domainFreshnesses array", () => {
    const result = computeRetentionStrength([], new Map());
    expect(result).toBe(0);
  });

  it("excludes domains with no mastered nodes", () => {
    const result = computeRetentionStrength(
      [
        { domainId: "d1", freshness: 0.9 },
        { domainId: "d2", freshness: 0.1 }, // no mastered nodes
      ],
      new Map([["d1", 3]]),
    );
    expect(result).toBe(90);
  });
});

describe("composeKnowledgeProfile", () => {
  it("composes all metrics into a profile", () => {
    const profile = composeKnowledgeProfile({
      totalMastered: 10,
      totalNodes: 100,
      tierCompletion: [{ tier: 0, mastered: 10, total: 20, percentage: 50 }],
      badges: [
        { domainId: "d1", badge: "fresh", freshness: 0.9, masteredCount: 5, totalCount: 5 },
      ],
      streak: { currentStreak: 5, longestStreak: 10, totalStudyDays: 20, recentSummary: "14 of the last 21 days" },
      heatMap: [],
      velocity: { nodesPerWeek: 2.5, trend: "increasing", weeklyBreakdown: [1, 2, 3, 4] },
      domainFreshnesses: [{ domainId: "d1", freshness: 0.9 }],
      masteredCountByDomain: new Map([["d1", 5]]),
      calibrationScore: 75,
    });

    expect(profile.totalMastered).toBe(10);
    expect(profile.badges.fresh).toBe(1);
    expect(profile.streak.currentStreak).toBe(5);
    expect(profile.velocity.nodesPerWeek).toBe(2.5);
    expect(profile.retentionStrength).toBe(90);
    expect(profile.calibrationScore).toBe(75);
  });
});
