import { describe, it, expect } from "vitest";
import {
  isMastered,
  isStarted,
  computeNextSession,
  computeDomainProgress,
  computeOverallProgress,
  computeSessionSummary,
  computeTierProgress,
} from "./progress.js";
import type { LearnerNodeState } from "../types.js";

function makeState(
  nodeId: string,
  domainId: string,
  overrides?: Partial<LearnerNodeState>,
): LearnerNodeState {
  return {
    userId: "user-1",
    nodeId,
    domainId,
    easiness: 2.5,
    interval: 0,
    repetitions: 0,
    dueDate: new Date("2025-01-01"),
    confidenceHistory: [],
    domainWeight: 1.0,
    ...overrides,
  };
}

const now = new Date("2025-01-15T12:00:00Z");

describe("isMastered", () => {
  it("returns true for 3+ reps and easiness >= 2.0", () => {
    expect(isMastered(makeState("n1", "d1", { repetitions: 3, easiness: 2.0 }))).toBe(true);
    expect(isMastered(makeState("n1", "d1", { repetitions: 5, easiness: 2.5 }))).toBe(true);
  });

  it("returns false for low reps", () => {
    expect(isMastered(makeState("n1", "d1", { repetitions: 2, easiness: 2.5 }))).toBe(false);
  });

  it("returns false for low easiness even with high reps", () => {
    expect(isMastered(makeState("n1", "d1", { repetitions: 5, easiness: 1.5 }))).toBe(false);
  });
});

describe("isStarted", () => {
  it("returns false for fresh node", () => {
    expect(isStarted(makeState("n1", "d1"))).toBe(false);
  });

  it("returns true if has repetitions", () => {
    expect(isStarted(makeState("n1", "d1", { repetitions: 1 }))).toBe(true);
  });

  it("returns true if has interval (even after reset)", () => {
    expect(isStarted(makeState("n1", "d1", { interval: 1 }))).toBe(true);
  });
});

describe("computeNextSession", () => {
  it("counts items due now", () => {
    const states = [
      makeState("n1", "d1", { dueDate: new Date("2025-01-10") }),
      makeState("n2", "d1", { dueDate: new Date("2025-01-20") }),
      makeState("n3", "d1", { dueDate: now }),
    ];
    const result = computeNextSession(states, now);
    expect(result.dueNow).toBe(2); // n1 (past) and n3 (equal to now)
  });

  it("finds next due date for future items", () => {
    const states = [
      makeState("n1", "d1", { dueDate: new Date("2025-01-10") }),
      makeState("n2", "d1", { dueDate: new Date("2025-01-20") }),
      makeState("n3", "d1", { dueDate: new Date("2025-01-18") }),
    ];
    const result = computeNextSession(states, now);
    expect(result.nextDueDate).toEqual(new Date("2025-01-18"));
  });

  it("returns null nextDueDate when all items are due now", () => {
    const states = [
      makeState("n1", "d1", { dueDate: new Date("2025-01-10") }),
      makeState("n2", "d1", { dueDate: new Date("2025-01-01") }),
    ];
    const result = computeNextSession(states, now);
    expect(result.nextDueDate).toBeNull();
  });

  it("counts items due within the week", () => {
    const states = [
      makeState("n1", "d1", { dueDate: new Date("2025-01-16") }), // tomorrow
      makeState("n2", "d1", { dueDate: new Date("2025-01-20") }), // 5 days
      makeState("n3", "d1", { dueDate: new Date("2025-02-01") }), // >1 week
    ];
    const result = computeNextSession(states, now);
    expect(result.dueWithinWeek).toBe(2);
  });
});

describe("computeDomainProgress", () => {
  it("groups by domain and categorizes nodes", () => {
    const states = [
      makeState("n1", "d1", { repetitions: 5, easiness: 2.5 }), // mastered
      makeState("n2", "d1", { repetitions: 1, easiness: 2.5 }), // in progress
      makeState("n3", "d1"), // not started
      makeState("n4", "d2", { repetitions: 4, easiness: 2.2 }), // mastered
      makeState("n5", "d2"), // not started
    ];

    const result = computeDomainProgress(states);
    expect(result).toHaveLength(2);

    const d1 = result.find((d) => d.domainId === "d1")!;
    expect(d1.totalNodes).toBe(3);
    expect(d1.mastered).toBe(1);
    expect(d1.inProgress).toBe(1);
    expect(d1.notStarted).toBe(1);
    expect(d1.masteryPercentage).toBe(33);

    const d2 = result.find((d) => d.domainId === "d2")!;
    expect(d2.mastered).toBe(1);
    expect(d2.notStarted).toBe(1);
  });
});

describe("computeOverallProgress", () => {
  it("computes aggregate stats", () => {
    const states = [
      makeState("n1", "d1", { repetitions: 5, easiness: 2.5 }),
      makeState("n2", "d1", { repetitions: 1, easiness: 2.5 }),
      makeState("n3", "d2"),
      makeState("n4", "d2"),
    ];

    const result = computeOverallProgress(states, now);
    expect(result.totalNodes).toBe(4);
    expect(result.mastered).toBe(1);
    expect(result.inProgress).toBe(1);
    expect(result.notStarted).toBe(2);
    expect(result.masteryPercentage).toBe(25);
    expect(result.domains).toHaveLength(2);
    expect(result.nextSession).toBeDefined();
  });
});

describe("computeSessionSummary", () => {
  it("computes accuracy and calibration counts", () => {

    const reviews = [
      { wasCorrect: true, confidence: 4 },   // calibrated
      { wasCorrect: true, confidence: 2 },   // undervalued
      { wasCorrect: false, confidence: 5 },  // illusion
      { wasCorrect: false, confidence: 1 },  // known_unknown
      { wasCorrect: true, confidence: 3 },   // calibrated
    ];
    const summary = computeSessionSummary(reviews);
    expect(summary.totalReviews).toBe(5);
    expect(summary.correctCount).toBe(3);
    expect(summary.accuracyPercentage).toBe(60);
    expect(summary.calibrationCounts.calibrated).toBe(2);
    expect(summary.calibrationCounts.illusion).toBe(1);
    expect(summary.calibrationCounts.undervalued).toBe(1);
    expect(summary.calibrationCounts.known_unknown).toBe(1);
  });

  it("handles empty reviews", () => {

    const summary = computeSessionSummary([]);
    expect(summary.totalReviews).toBe(0);
    expect(summary.accuracyPercentage).toBe(0);
  });
});

describe("computeTierProgress", () => {
  it("aggregates domains by tier", () => {

    const domains = [
      { tier: 0, totalNodes: 10, mastered: 5, inProgress: 3, notStarted: 2 },
      { tier: 0, totalNodes: 8, mastered: 2, inProgress: 1, notStarted: 5 },
      { tier: 1, totalNodes: 6, mastered: 0, inProgress: 0, notStarted: 6 },
    ];
    const result = computeTierProgress(domains);
    expect(result).toHaveLength(2);
    expect(result[0].tier).toBe(0);
    expect(result[0].totalNodes).toBe(18);
    expect(result[0].mastered).toBe(7);
    expect(result[0].masteryPercentage).toBe(39);
    expect(result[1].tier).toBe(1);
    expect(result[1].totalNodes).toBe(6);
    expect(result[1].masteryPercentage).toBe(0);
  });

  it("returns sorted by tier", () => {

    const domains = [
      { tier: 2, totalNodes: 5, mastered: 0, inProgress: 0, notStarted: 5 },
      { tier: 0, totalNodes: 5, mastered: 5, inProgress: 0, notStarted: 0 },
    ];
    const result = computeTierProgress(domains);
    expect(result[0].tier).toBe(0);
    expect(result[1].tier).toBe(2);
  });
});
