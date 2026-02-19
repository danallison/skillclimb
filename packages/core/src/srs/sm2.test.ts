import { describe, it, expect } from "vitest";
import { calculateNextState, calculateEasiness, calculateInterval, isDue, daysOverdue } from "./sm2.js";
import type { LearnerNodeState } from "../types.js";

function makeFreshState(overrides?: Partial<LearnerNodeState>): LearnerNodeState {
  return {
    userId: "user-1",
    nodeId: "node-1",
    domainId: "domain-1",
    easiness: 2.5,
    interval: 0,
    repetitions: 0,
    dueDate: new Date("2025-01-01"),
    confidenceHistory: [],
    domainWeight: 1.0,
    ...overrides,
  };
}

const now = new Date("2025-01-15");

describe("calculateEasiness", () => {
  it("decreases easiness on score 0–2", () => {
    expect(calculateEasiness(2.5, 0)).toBe(2.3);
    expect(calculateEasiness(2.5, 1)).toBe(2.3);
    expect(calculateEasiness(2.5, 2)).toBe(2.3);
  });

  it("slightly decreases easiness on score 3", () => {
    expect(calculateEasiness(2.5, 3)).toBeCloseTo(2.36);
  });

  it("does not change easiness on score 4", () => {
    expect(calculateEasiness(2.5, 4)).toBe(2.5);
  });

  it("slightly increases easiness on score 5", () => {
    expect(calculateEasiness(2.5, 5)).toBeCloseTo(2.6);
  });

  it("never drops below 1.3", () => {
    expect(calculateEasiness(1.3, 0)).toBe(1.3);
    expect(calculateEasiness(1.35, 0)).toBe(1.3);
    expect(calculateEasiness(1.3, 3)).toBe(1.3);
  });

  it("never exceeds 5.0", () => {
    expect(calculateEasiness(5.0, 5)).toBe(5.0);
  });
});

describe("calculateInterval", () => {
  it("returns 1 for first review (repetitions=0)", () => {
    expect(calculateInterval(0, 0, 2.5, 1.0)).toBe(1);
  });

  it("returns 6 for second review (repetitions=1)", () => {
    expect(calculateInterval(1, 1, 2.5, 1.0)).toBe(6);
  });

  it("multiplies by easiness after that", () => {
    // repetitions=2, previous interval=6, easiness=2.5 → 6*2.5=15
    expect(calculateInterval(2, 6, 2.5, 1.0)).toBe(15);
  });

  it("applies domain weight", () => {
    // 6*2.5=15, then * 0.5 = 7.5 → rounded to 8
    expect(calculateInterval(2, 6, 2.5, 0.5)).toBe(8);
    // 6*2.5=15, then * 1.5 = 22.5 → rounded to 23
    expect(calculateInterval(2, 6, 2.5, 1.5)).toBe(23);
  });

  it("never returns less than 1", () => {
    expect(calculateInterval(2, 1, 1.3, 0.5)).toBeGreaterThanOrEqual(1);
  });
});

describe("calculateNextState", () => {
  it("gives interval 1 after first correct answer on a fresh node", () => {
    const state = makeFreshState();
    const next = calculateNextState(state, 4, now);
    expect(next.interval).toBe(1);
    expect(next.repetitions).toBe(1);
  });

  it("gives interval 6 after second consecutive correct answer", () => {
    const state = makeFreshState({ repetitions: 1, interval: 1 });
    const next = calculateNextState(state, 4, now);
    expect(next.interval).toBe(6);
    expect(next.repetitions).toBe(2);
  });

  it("grows intervals with consecutive successes", () => {
    let state = makeFreshState();
    const intervals: number[] = [];

    for (let i = 0; i < 6; i++) {
      state = calculateNextState(state, 4, now);
      intervals.push(state.interval);
    }

    // Each interval should be >= the previous (monotonically growing)
    for (let i = 1; i < intervals.length; i++) {
      expect(intervals[i]).toBeGreaterThanOrEqual(intervals[i - 1]);
    }
  });

  it("resets to interval 1 and reps 0 on failed review (score 0–2)", () => {
    const state = makeFreshState({ repetitions: 5, interval: 30, easiness: 2.8 });

    for (const score of [0, 1, 2]) {
      const next = calculateNextState(state, score, now);
      expect(next.interval).toBe(1);
      expect(next.repetitions).toBe(0);
    }
  });

  it("decreases easiness on failure but never below 1.3", () => {
    let state = makeFreshState({ easiness: 1.4 });
    state = calculateNextState(state, 0, now);
    expect(state.easiness).toBe(1.3);

    state = calculateNextState(state, 0, now);
    expect(state.easiness).toBe(1.3);
  });

  it("score 5 increases easiness", () => {
    const state = makeFreshState({ easiness: 2.5 });
    const next = calculateNextState(state, 5, now);
    expect(next.easiness).toBeGreaterThan(2.5);
  });

  it("score 3 decreases easiness", () => {
    const state = makeFreshState({ easiness: 2.5 });
    const next = calculateNextState(state, 3, now);
    expect(next.easiness).toBeLessThan(2.5);
  });

  it("score 4 leaves easiness unchanged", () => {
    const state = makeFreshState({ easiness: 2.5 });
    const next = calculateNextState(state, 4, now);
    expect(next.easiness).toBe(2.5);
  });

  it("sets dueDate correctly", () => {
    const state = makeFreshState();
    const next = calculateNextState(state, 4, now);
    const expected = new Date(now);
    expected.setDate(expected.getDate() + next.interval);
    expect(next.dueDate.toISOString()).toBe(expected.toISOString());
  });

  it("domain weight adjusts intervals", () => {
    // Low domain weight = shorter intervals (more review for foundational topics)
    const stateShort = makeFreshState({ repetitions: 3, interval: 15, domainWeight: 0.5 });
    const nextShort = calculateNextState(stateShort, 4, now);

    const stateLong = makeFreshState({ repetitions: 3, interval: 15, domainWeight: 1.5 });
    const nextLong = calculateNextState(stateLong, 4, now);

    expect(nextShort.interval).toBeLessThan(nextLong.interval);
  });

  it("score 3 produces conservative interval growth", () => {
    const state = makeFreshState({ repetitions: 3, interval: 15, easiness: 2.5 });
    const next3 = calculateNextState(state, 3, now);
    const next4 = calculateNextState(state, 4, now);

    expect(next3.interval).toBeLessThan(next4.interval);
  });
});

describe("isDue", () => {
  it("returns true when dueDate is in the past", () => {
    const state = makeFreshState({ dueDate: new Date("2025-01-10") });
    expect(isDue(state, now)).toBe(true);
  });

  it("returns true when dueDate equals now", () => {
    const state = makeFreshState({ dueDate: now });
    expect(isDue(state, now)).toBe(true);
  });

  it("returns false when dueDate is in the future", () => {
    const state = makeFreshState({ dueDate: new Date("2025-01-20") });
    expect(isDue(state, now)).toBe(false);
  });
});

describe("daysOverdue", () => {
  it("returns 0 when not overdue", () => {
    const state = makeFreshState({ dueDate: new Date("2025-01-20") });
    expect(daysOverdue(state, now)).toBe(0);
  });

  it("returns correct days when overdue", () => {
    const state = makeFreshState({ dueDate: new Date("2025-01-10") });
    expect(daysOverdue(state, now)).toBe(5);
  });

  it("returns 0 when due today", () => {
    const state = makeFreshState({ dueDate: now });
    expect(daysOverdue(state, now)).toBe(0);
  });
});
