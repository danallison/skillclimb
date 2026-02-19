import { describe, it, expect } from "vitest";
import { buildSession, calculatePriority, interleave } from "./builder.js";
import type { LearnerNodeState, Node, SessionConfig, SessionItem, QuestionTemplate } from "../types.js";

const baseTemplate: QuestionTemplate = {
  type: "recognition",
  prompt: "What is X?",
  choices: ["A", "B", "C", "D"],
  correctAnswer: "A",
  explanation: "Because A.",
};

function makeNode(id: string, domainId: string): Node {
  return {
    id,
    topicId: "topic-1",
    domainId,
    concept: `Concept ${id}`,
    questionTemplates: [baseTemplate],
  };
}

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
    dueDate: new Date("2025-01-01"), // in the past
    confidenceHistory: [],
    domainWeight: 1.0,
    ...overrides,
  };
}

const now = new Date("2025-01-15");

const config: SessionConfig = {
  minItems: 3,
  maxItems: 10,
  targetItems: 5,
};

describe("calculatePriority", () => {
  it("gives high priority to overdue items", () => {
    const node = makeNode("n1", "d1");
    const overdue = makeState("n1", "d1", { dueDate: new Date("2025-01-10"), interval: 1, repetitions: 1 });
    const due = makeState("n1", "d1", { dueDate: now, interval: 1, repetitions: 1 });

    expect(calculatePriority(overdue, node, now)).toBeGreaterThan(calculatePriority(due, node, now));
  });

  it("gives moderate priority to new items", () => {
    const node = makeNode("n1", "d1");
    const newItem = makeState("n1", "d1", { dueDate: new Date("2025-01-01"), repetitions: 0, interval: 0 });
    const priority = calculatePriority(newItem, node, now);
    expect(priority).toBeGreaterThan(0);
  });

  it("returns 0 for items not yet due", () => {
    const node = makeNode("n1", "d1");
    const notDue = makeState("n1", "d1", {
      dueDate: new Date("2025-01-20"),
      interval: 10,
      repetitions: 3,
    });
    expect(calculatePriority(notDue, node, now)).toBe(0);
  });

  it("boosts items with low easiness", () => {
    const node = makeNode("n1", "d1");
    const struggling = makeState("n1", "d1", { easiness: 1.5, dueDate: now, interval: 1, repetitions: 1 });
    const normal = makeState("n1", "d1", { easiness: 2.5, dueDate: now, interval: 1, repetitions: 1 });

    expect(calculatePriority(struggling, node, now)).toBeGreaterThan(calculatePriority(normal, node, now));
  });
});

describe("interleave", () => {
  it("avoids consecutive same-domain items", () => {
    const items: SessionItem[] = [
      { node: makeNode("n1", "d1"), learnerState: makeState("n1", "d1"), questionTemplate: baseTemplate, priority: 100 },
      { node: makeNode("n2", "d1"), learnerState: makeState("n2", "d1"), questionTemplate: baseTemplate, priority: 90 },
      { node: makeNode("n3", "d2"), learnerState: makeState("n3", "d2"), questionTemplate: baseTemplate, priority: 80 },
      { node: makeNode("n4", "d2"), learnerState: makeState("n4", "d2"), questionTemplate: baseTemplate, priority: 70 },
    ];

    const result = interleave(items);

    for (let i = 1; i < result.length; i++) {
      if (result.length > 2) {
        // With enough items from different domains, consecutive same-domain should be avoided
        // (unless all remaining are same domain)
      }
    }

    // Check that d1 and d2 are interleaved
    expect(result[0].node.domainId).toBe("d1");
    expect(result[1].node.domainId).toBe("d2");
    expect(result[2].node.domainId).toBe("d1");
    expect(result[3].node.domainId).toBe("d2");
  });

  it("handles single domain gracefully", () => {
    const items: SessionItem[] = [
      { node: makeNode("n1", "d1"), learnerState: makeState("n1", "d1"), questionTemplate: baseTemplate, priority: 100 },
      { node: makeNode("n2", "d1"), learnerState: makeState("n2", "d1"), questionTemplate: baseTemplate, priority: 90 },
    ];

    const result = interleave(items);
    expect(result).toHaveLength(2);
  });

  it("returns empty array for empty input", () => {
    expect(interleave([])).toEqual([]);
  });
});

describe("buildSession", () => {
  it("selects due items and orders them", () => {
    const nodes = [makeNode("n1", "d1"), makeNode("n2", "d2"), makeNode("n3", "d1")];
    const states = [
      makeState("n1", "d1", { dueDate: new Date("2025-01-10") }),
      makeState("n2", "d2", { dueDate: new Date("2025-01-05") }),
      makeState("n3", "d1", { dueDate: new Date("2025-01-12") }),
    ];

    const result = buildSession(config, states, nodes, now);

    expect(result.totalItems).toBe(3);
    expect(result.items).toHaveLength(3);
  });

  it("excludes items that are not due", () => {
    const nodes = [makeNode("n1", "d1"), makeNode("n2", "d2")];
    const states = [
      makeState("n1", "d1", { dueDate: new Date("2025-01-10"), interval: 1, repetitions: 1 }),
      makeState("n2", "d2", { dueDate: new Date("2025-02-01"), interval: 10, repetitions: 3 }),
    ];

    const result = buildSession(config, states, nodes, now);
    expect(result.totalItems).toBe(1);
    expect(result.items[0].node.id).toBe("n1");
  });

  it("limits to maxItems", () => {
    const nodes: Node[] = [];
    const states: LearnerNodeState[] = [];

    for (let i = 0; i < 20; i++) {
      const domain = i % 2 === 0 ? "d1" : "d2";
      nodes.push(makeNode(`n${i}`, domain));
      states.push(makeState(`n${i}`, domain, { dueDate: new Date("2025-01-01") }));
    }

    const smallConfig: SessionConfig = { minItems: 3, maxItems: 5, targetItems: 4 };
    const result = buildSession(smallConfig, states, nodes, now);

    expect(result.totalItems).toBeLessThanOrEqual(5);
  });

  it("interleaves items from different domains", () => {
    const nodes = [
      makeNode("n1", "d1"),
      makeNode("n2", "d1"),
      makeNode("n3", "d2"),
      makeNode("n4", "d2"),
    ];
    const states = [
      makeState("n1", "d1"),
      makeState("n2", "d1"),
      makeState("n3", "d2"),
      makeState("n4", "d2"),
    ];

    const result = buildSession(config, states, nodes, now);

    // With interleaving, we shouldn't get more than 2 consecutive same-domain items
    let maxConsecutive = 1;
    let currentRun = 1;
    for (let i = 1; i < result.items.length; i++) {
      if (result.items[i].node.domainId === result.items[i - 1].node.domainId) {
        currentRun++;
        maxConsecutive = Math.max(maxConsecutive, currentRun);
      } else {
        currentRun = 1;
      }
    }
    expect(maxConsecutive).toBeLessThanOrEqual(2);
  });

  it("handles nodes with no question templates", () => {
    const nodeNoTemplates: Node = { ...makeNode("n1", "d1"), questionTemplates: [] };
    const nodes = [nodeNoTemplates, makeNode("n2", "d2")];
    const states = [makeState("n1", "d1"), makeState("n2", "d2")];

    const result = buildSession(config, states, nodes, now);
    expect(result.totalItems).toBe(1);
    expect(result.items[0].node.id).toBe("n2");
  });

  it("returns empty session when no items are due", () => {
    const nodes = [makeNode("n1", "d1")];
    const states = [
      makeState("n1", "d1", { dueDate: new Date("2025-02-01"), interval: 10, repetitions: 3 }),
    ];

    const result = buildSession(config, states, nodes, now);
    expect(result.totalItems).toBe(0);
  });
});
