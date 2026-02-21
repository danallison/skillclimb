import { describe, it, expect } from "vitest";
import { computeDomainBadge, computeAllBadges } from "./badges.js";
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
    interval: 6,
    repetitions: 3,
    dueDate: new Date("2025-04-01"),
    confidenceHistory: [],
    domainWeight: 1.0,
    ...overrides,
  };
}

describe("computeDomainBadge", () => {
  it('returns "none" for empty domain', () => {
    expect(computeDomainBadge([], 1.0)).toBe("none");
  });

  it('returns "fresh" when all mastered and freshness > 0.7', () => {
    const states = [
      makeState("n1", "d1", { repetitions: 5, easiness: 2.5 }),
      makeState("n2", "d1", { repetitions: 3, easiness: 2.0 }),
    ];
    expect(computeDomainBadge(states, 0.9)).toBe("fresh");
  });

  it('returns "fading" when all mastered and freshness 0.3–0.7', () => {
    const states = [
      makeState("n1", "d1", { repetitions: 3, easiness: 2.5 }),
    ];
    expect(computeDomainBadge(states, 0.5)).toBe("fading");
    expect(computeDomainBadge(states, 0.3)).toBe("fading");
    expect(computeDomainBadge(states, 0.7)).toBe("fading");
  });

  it('returns "none" when all mastered but freshness < 0.3', () => {
    const states = [
      makeState("n1", "d1", { repetitions: 3, easiness: 2.5 }),
    ];
    expect(computeDomainBadge(states, 0.1)).toBe("none");
  });

  it('returns "none" when not all nodes are mastered', () => {
    const states = [
      makeState("n1", "d1", { repetitions: 3, easiness: 2.5 }),
      makeState("n2", "d1", { repetitions: 1, easiness: 2.5 }),
    ];
    expect(computeDomainBadge(states, 0.9)).toBe("none");
  });

  it('returns "none" when easiness too low for mastery', () => {
    const states = [
      makeState("n1", "d1", { repetitions: 5, easiness: 1.5 }),
    ];
    expect(computeDomainBadge(states, 0.9)).toBe("none");
  });
});

describe("computeAllBadges", () => {
  it("computes badges for multiple domains", () => {
    const statesByDomain = new Map([
      ["d1", [
        makeState("n1", "d1", { repetitions: 3, easiness: 2.5 }),
        makeState("n2", "d1", { repetitions: 3, easiness: 2.0 }),
      ]],
      ["d2", [
        makeState("n3", "d2", { repetitions: 1, easiness: 2.5 }),
      ]],
    ]);
    const freshnessByDomain = new Map([["d1", 0.8], ["d2", 0.9]]);

    const badges = computeAllBadges(statesByDomain, freshnessByDomain);
    expect(badges).toHaveLength(2);

    const d1Badge = badges.find((b) => b.domainId === "d1")!;
    expect(d1Badge.badge).toBe("fresh");
    expect(d1Badge.masteredCount).toBe(2);
    expect(d1Badge.totalCount).toBe(2);

    const d2Badge = badges.find((b) => b.domainId === "d2")!;
    expect(d2Badge.badge).toBe("none");
    expect(d2Badge.masteredCount).toBe(0);
  });

  it("defaults freshness to 1.0 for unmapped domains", () => {
    const statesByDomain = new Map([
      ["d1", [makeState("n1", "d1", { repetitions: 3, easiness: 2.5 })]],
    ]);
    const freshnessByDomain = new Map<string, number>(); // no d1

    const badges = computeAllBadges(statesByDomain, freshnessByDomain);
    expect(badges[0].badge).toBe("fresh");
  });
});
