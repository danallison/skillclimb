import { describe, it, expect } from "vitest";
import { detectMilestones } from "./milestones.js";
import type { LearnerNodeState } from "../types.js";

function makeState(
  overrides?: Partial<LearnerNodeState>,
): LearnerNodeState {
  return {
    userId: "user-1",
    nodeId: "n1",
    domainId: "d1",
    easiness: 2.5,
    interval: 1,
    repetitions: 0,
    dueDate: new Date("2025-03-10"),
    confidenceHistory: [],
    domainWeight: 1.0,
    ...overrides,
  };
}

const now = new Date("2025-03-15T12:00:00Z");

describe("detectMilestones", () => {
  it("detects node mastery transition", () => {
    const prev = makeState({ repetitions: 2, easiness: 2.5 });
    const next = makeState({ repetitions: 3, easiness: 2.5 });
    const domainStates = [next]; // only one node in domain

    const milestones = detectMilestones(prev, next, domainStates, "Networking", "TCP/IP Basics", true, now);

    const mastered = milestones.find((m) => m.type === "node_mastered");
    expect(mastered).toBeDefined();
    expect(mastered!.message).toContain("TCP/IP Basics");
  });

  it("does not detect mastery when already mastered", () => {
    const prev = makeState({ repetitions: 3, easiness: 2.5 });
    const next = makeState({ repetitions: 4, easiness: 2.5 });

    const milestones = detectMilestones(prev, next, [next], "Networking", "TCP/IP", true, now);
    expect(milestones.find((m) => m.type === "node_mastered")).toBeUndefined();
  });

  it("detects domain milestone crossing 50%", () => {
    // 2 of 4 nodes mastered after this review (was 1 of 4 before)
    const prev = makeState({ nodeId: "n1", repetitions: 2, easiness: 2.5 });
    const next = makeState({ nodeId: "n1", repetitions: 3, easiness: 2.5 });
    const domainStates = [
      next, // just mastered
      makeState({ nodeId: "n2", repetitions: 3, easiness: 2.5 }), // already mastered
      makeState({ nodeId: "n3", repetitions: 1, easiness: 2.5 }),
      makeState({ nodeId: "n4", repetitions: 0, easiness: 2.5 }),
    ];

    const milestones = detectMilestones(prev, next, domainStates, "Networking", "TCP/IP", true, now);
    const dm = milestones.find((m) => m.type === "domain_milestone");
    expect(dm).toBeDefined();
    expect(dm!.message).toContain("50%");
  });

  it("detects overdue recovery", () => {
    // Due date was 10 days ago
    const prev = makeState({ dueDate: new Date("2025-03-05") });
    const next = makeState({ repetitions: 1, easiness: 2.5 });

    const milestones = detectMilestones(prev, next, [next], "Networking", "TCP/IP", true, now);
    const overdue = milestones.find((m) => m.type === "overdue_recovery");
    expect(overdue).toBeDefined();
    expect(overdue!.message).toMatch(/after \d+ days/);
  });

  it("does not detect overdue recovery for recent items", () => {
    const prev = makeState({ dueDate: new Date("2025-03-14") }); // 1 day overdue
    const next = makeState({ repetitions: 1 });

    const milestones = detectMilestones(prev, next, [next], "Networking", "TCP/IP", true, now);
    expect(milestones.find((m) => m.type === "overdue_recovery")).toBeUndefined();
  });

  it("does not detect overdue recovery on incorrect answer", () => {
    const prev = makeState({ dueDate: new Date("2025-03-01") });
    const next = makeState({ repetitions: 0 });

    const milestones = detectMilestones(prev, next, [next], "Networking", "TCP/IP", false, now);
    expect(milestones.find((m) => m.type === "overdue_recovery")).toBeUndefined();
  });

  it("can return multiple milestones at once", () => {
    // Node becomes mastered + domain hits 100% + overdue recovery
    const prev = makeState({ repetitions: 2, easiness: 2.5, dueDate: new Date("2025-03-01") });
    const next = makeState({ repetitions: 3, easiness: 2.5 });
    const domainStates = [next]; // only node in domain

    const milestones = detectMilestones(prev, next, domainStates, "Networking", "TCP/IP", true, now);
    expect(milestones.length).toBeGreaterThanOrEqual(2);
    expect(milestones.some((m) => m.type === "node_mastered")).toBe(true);
    expect(milestones.some((m) => m.type === "domain_milestone")).toBe(true);
    expect(milestones.some((m) => m.type === "overdue_recovery")).toBe(true);
  });

  it("reports highest crossed threshold when jumping multiple", () => {
    // Domain jumps from 20% to 80% in one review (e.g., 4 of 5 nodes mastered after this)
    const prev = makeState({ nodeId: "n1", repetitions: 2, easiness: 2.5 });
    const next = makeState({ nodeId: "n1", repetitions: 3, easiness: 2.5 });
    const domainStates = [
      next, // just mastered
      makeState({ nodeId: "n2", repetitions: 3, easiness: 2.5 }), // already mastered
      makeState({ nodeId: "n3", repetitions: 3, easiness: 2.5 }), // already mastered
      makeState({ nodeId: "n4", repetitions: 3, easiness: 2.5 }), // already mastered
      makeState({ nodeId: "n5", repetitions: 0, easiness: 2.5 }), // not mastered
    ];
    // Before: 3/5 = 60%, After: 4/5 = 80% → crosses 75% (not 25% or 50%)
    const milestones = detectMilestones(prev, next, domainStates, "Networking", "TCP/IP", true, now);
    const dm = milestones.find((m) => m.type === "domain_milestone");
    expect(dm).toBeDefined();
    expect(dm!.message).toContain("75%");
  });

  it("returns empty array when nothing special happened", () => {
    const prev = makeState({ repetitions: 1, dueDate: new Date("2025-03-15") });
    const next = makeState({ repetitions: 2 });
    const domainStates = [
      next,
      makeState({ nodeId: "n2", repetitions: 0 }),
      makeState({ nodeId: "n3", repetitions: 0 }),
      makeState({ nodeId: "n4", repetitions: 0 }),
    ];

    const milestones = detectMilestones(prev, next, domainStates, "Networking", "TCP/IP", true, now);
    expect(milestones).toHaveLength(0);
  });
});
