import { describe, it, expect } from "vitest";
import {
  irtProbability,
  fisherInformation,
  estimateTheta,
  selectNextItem,
  shouldTerminate,
  processResponse,
  computeDomainThetas,
  classifyNodes,
  createInitialIRTState,
  buildPlacementResult,
} from "./irt.js";
import type { IRTItem, IRTResponse, IRTState, PlacementConfig } from "../types.js";
import { DEFAULT_PLACEMENT_CONFIG } from "../types.js";

describe("irtProbability", () => {
  it("returns 0.5 when theta equals difficulty", () => {
    expect(irtProbability(0, 0)).toBeCloseTo(0.5);
    expect(irtProbability(1, 1)).toBeCloseTo(0.5);
    expect(irtProbability(-2, -2)).toBeCloseTo(0.5);
  });

  it("returns > 0.5 when theta > difficulty", () => {
    expect(irtProbability(2, 0)).toBeGreaterThan(0.5);
    expect(irtProbability(1, -1)).toBeGreaterThan(0.5);
  });

  it("returns < 0.5 when theta < difficulty", () => {
    expect(irtProbability(0, 2)).toBeLessThan(0.5);
    expect(irtProbability(-1, 1)).toBeLessThan(0.5);
  });

  it("approaches 1 for very high ability relative to difficulty", () => {
    expect(irtProbability(4, -2)).toBeGreaterThan(0.99);
  });

  it("approaches 0 for very low ability relative to difficulty", () => {
    expect(irtProbability(-4, 2)).toBeLessThan(0.01);
  });
});

describe("fisherInformation", () => {
  it("is maximized when theta equals difficulty", () => {
    const atMatch = fisherInformation(0, 0);
    const away = fisherInformation(2, 0);
    expect(atMatch).toBeCloseTo(0.25);
    expect(atMatch).toBeGreaterThan(away);
  });

  it("decreases as theta moves away from difficulty", () => {
    const close = fisherInformation(0.5, 0);
    const far = fisherInformation(3, 0);
    expect(close).toBeGreaterThan(far);
  });
});

describe("estimateTheta", () => {
  it("returns theta=0, se=4 for empty responses", () => {
    const result = estimateTheta([]);
    expect(result.theta).toBe(0);
    expect(result.se).toBe(4.0);
  });

  it("uses EAP for < 3 responses", () => {
    const responses: IRTResponse[] = [
      { nodeId: "a", domainId: "d1", difficulty: 0, correct: true },
    ];
    const result = estimateTheta(responses);
    expect(result.theta).toBeGreaterThan(0); // Got it right, ability should be positive
    expect(result.se).toBeGreaterThan(0);
  });

  it("converges with MLE for mixed responses", () => {
    // Simulated learner with ability ~1.0
    const responses: IRTResponse[] = [
      { nodeId: "1", domainId: "d1", difficulty: -1, correct: true },
      { nodeId: "2", domainId: "d1", difficulty: 0, correct: true },
      { nodeId: "3", domainId: "d1", difficulty: 1, correct: true },
      { nodeId: "4", domainId: "d1", difficulty: 2, correct: false },
      { nodeId: "5", domainId: "d1", difficulty: 1.5, correct: false },
    ];
    const result = estimateTheta(responses);
    // Theta should be somewhere near the ability level
    expect(result.theta).toBeGreaterThan(-1);
    expect(result.theta).toBeLessThan(3);
    expect(result.se).toBeGreaterThan(0);
    expect(result.se).toBeLessThan(4);
  });

  it("SE decreases with more responses", () => {
    const responses: IRTResponse[] = [];
    let prevSE = Infinity;

    for (let i = 0; i < 20; i++) {
      const difficulty = (i % 5) - 2; // -2, -1, 0, 1, 2 cycling
      responses.push({
        nodeId: `node${i}`,
        domainId: "d1",
        difficulty,
        correct: difficulty < 1, // Correct for easy items, wrong for hard
      });

      if (responses.length >= 3) {
        const { se } = estimateTheta(responses);
        // SE should generally decrease (not strictly monotone due to response patterns)
        if (responses.length > 5) {
          expect(se).toBeLessThan(prevSE + 0.5); // Allow some tolerance
        }
        prevSE = se;
      }
    }

    // After 20 responses, SE should be substantially reduced
    const { se } = estimateTheta(responses);
    expect(se).toBeLessThan(1.0);
  });

  it("handles all correct responses", () => {
    const responses: IRTResponse[] = Array.from({ length: 5 }, (_, i) => ({
      nodeId: `n${i}`,
      domainId: "d1",
      difficulty: i - 2,
      correct: true,
    }));
    const result = estimateTheta(responses);
    expect(result.theta).toBeGreaterThan(1); // High ability
    expect(isFinite(result.se)).toBe(true);
  });

  it("handles all incorrect responses", () => {
    const responses: IRTResponse[] = Array.from({ length: 5 }, (_, i) => ({
      nodeId: `n${i}`,
      domainId: "d1",
      difficulty: i - 2,
      correct: false,
    }));
    const result = estimateTheta(responses);
    expect(result.theta).toBeLessThan(-1); // Low ability
    expect(isFinite(result.se)).toBe(true);
  });
});

describe("selectNextItem", () => {
  const items: IRTItem[] = [
    { nodeId: "easy", domainId: "d1", difficulty: -2 },
    { nodeId: "medium", domainId: "d1", difficulty: 0 },
    { nodeId: "hard", domainId: "d2", difficulty: 2 },
    { nodeId: "very-hard", domainId: "d2", difficulty: 3 },
  ];

  it("returns null for empty available items", () => {
    const state = createInitialIRTState();
    expect(selectNextItem(state, [], DEFAULT_PLACEMENT_CONFIG)).toBeNull();
  });

  it("selects an item from available items", () => {
    const state = createInitialIRTState();
    const item = selectNextItem(state, items, DEFAULT_PLACEMENT_CONFIG);
    expect(item).not.toBeNull();
    expect(items).toContainEqual(item);
  });

  it("prefers items with difficulty close to theta", () => {
    // With theta=0, medium difficulty (0) should have highest info
    const state: IRTState = {
      theta: 0,
      standardError: 2.0,
      responses: [],
      domainThetas: new Map(),
    };

    // Run multiple times to check tendency (since there's randomization)
    const counts = new Map<string, number>();
    for (let i = 0; i < 100; i++) {
      const item = selectNextItem(state, items, DEFAULT_PLACEMENT_CONFIG);
      if (item) {
        counts.set(item.nodeId, (counts.get(item.nodeId) ?? 0) + 1);
      }
    }

    // "medium" (difficulty=0) should be selected most often when theta=0
    const mediumCount = counts.get("medium") ?? 0;
    expect(mediumCount).toBeGreaterThan(20); // Should be picked frequently
  });
});

describe("shouldTerminate", () => {
  it("terminates at maxItems", () => {
    const state: IRTState = {
      theta: 0,
      standardError: 2.0,
      responses: Array(60).fill({} as IRTResponse),
      domainThetas: new Map(),
    };
    expect(shouldTerminate(state, DEFAULT_PLACEMENT_CONFIG)).toBe(true);
  });

  it("does not terminate before minItems", () => {
    const state: IRTState = {
      theta: 0,
      standardError: 0.1, // Very precise, but not enough items
      responses: Array(10).fill({} as IRTResponse),
      domainThetas: new Map(),
    };
    expect(shouldTerminate(state, DEFAULT_PLACEMENT_CONFIG)).toBe(false);
  });

  it("terminates when SE < precision target after minItems", () => {
    const state: IRTState = {
      theta: 0,
      standardError: 0.2,
      responses: Array(25).fill({} as IRTResponse),
      domainThetas: new Map(),
    };
    expect(shouldTerminate(state, DEFAULT_PLACEMENT_CONFIG)).toBe(true);
  });

  it("terminates with relaxed SE after relaxedMinItems", () => {
    const state: IRTState = {
      theta: 0,
      standardError: 0.45,
      responses: Array(42).fill({} as IRTResponse),
      domainThetas: new Map(),
    };
    expect(shouldTerminate(state, DEFAULT_PLACEMENT_CONFIG)).toBe(true);
  });

  it("does not terminate with high SE before relaxedMinItems", () => {
    const state: IRTState = {
      theta: 0,
      standardError: 0.45,
      responses: Array(25).fill({} as IRTResponse),
      domainThetas: new Map(),
    };
    expect(shouldTerminate(state, DEFAULT_PLACEMENT_CONFIG)).toBe(false);
  });
});

describe("processResponse", () => {
  it("updates state with new response", () => {
    const state = createInitialIRTState();
    const item: IRTItem = { nodeId: "n1", domainId: "d1", difficulty: 0 };

    const newState = processResponse(state, item, true);

    expect(newState.responses).toHaveLength(1);
    expect(newState.responses[0].correct).toBe(true);
    expect(newState.theta).not.toBe(0); // Should have updated
  });

  it("theta increases for correct answers", () => {
    let state = createInitialIRTState();
    const item: IRTItem = { nodeId: "n1", domainId: "d1", difficulty: 0 };

    state = processResponse(state, item, true);
    expect(state.theta).toBeGreaterThan(0);
  });

  it("theta decreases for incorrect answers", () => {
    let state = createInitialIRTState();
    const item: IRTItem = { nodeId: "n1", domainId: "d1", difficulty: 0 };

    state = processResponse(state, item, false);
    expect(state.theta).toBeLessThan(0);
  });
});

describe("computeDomainThetas", () => {
  it("returns empty map for no responses", () => {
    const result = computeDomainThetas([]);
    expect(result.size).toBe(0);
  });

  it("returns per-domain theta estimates", () => {
    const responses: IRTResponse[] = [
      { nodeId: "1", domainId: "d1", difficulty: 0, correct: true },
      { nodeId: "2", domainId: "d1", difficulty: 1, correct: true },
      { nodeId: "3", domainId: "d2", difficulty: 0, correct: false },
      { nodeId: "4", domainId: "d2", difficulty: -1, correct: false },
    ];

    const thetas = computeDomainThetas(responses);
    expect(thetas.has("d1")).toBe(true);
    expect(thetas.has("d2")).toBe(true);
    expect(thetas.get("d1")!).toBeGreaterThan(thetas.get("d2")!);
  });
});

describe("classifyNodes", () => {
  const now = new Date("2025-01-15T00:00:00Z");

  it("classifies nodes based on probability thresholds", () => {
    const items: IRTItem[] = [
      { nodeId: "easy", domainId: "d1", difficulty: -3 },    // High probability with theta=1
      { nodeId: "medium", domainId: "d1", difficulty: 0.5 }, // Medium probability
      { nodeId: "hard", domainId: "d1", difficulty: 1.5 },   // Low-medium probability (~0.38)
      { nodeId: "extreme", domainId: "d1", difficulty: 4 },  // Very low probability
    ];

    const results = classifyNodes(1.0, new Map(), items, now);

    expect(results).toHaveLength(4);

    const easy = results.find((r) => r.nodeId === "easy")!;
    expect(easy.classification).toBe("mastered");
    expect(easy.initialState.repetitions).toBe(3);
    expect(easy.initialState.interval).toBe(30);

    const hard = results.find((r) => r.nodeId === "hard")!;
    expect(hard.classification).toBe("weak");
    expect(hard.initialState.repetitions).toBe(0);
    expect(hard.initialState.interval).toBe(1);

    const extreme = results.find((r) => r.nodeId === "extreme")!;
    expect(extreme.classification).toBe("unknown");
    expect(extreme.initialState.interval).toBe(0);
  });

  it("uses domain theta when available", () => {
    const items: IRTItem[] = [
      { nodeId: "n1", domainId: "d1", difficulty: 0 },
      { nodeId: "n2", domainId: "d2", difficulty: 0 },
    ];

    const domainThetas = new Map([
      ["d1", 2.0],   // High ability in d1
      ["d2", -2.0],  // Low ability in d2
    ]);

    const results = classifyNodes(0, domainThetas, items, now);

    const d1Node = results.find((r) => r.nodeId === "n1")!;
    const d2Node = results.find((r) => r.nodeId === "n2")!;

    expect(d1Node.probability).toBeGreaterThan(d2Node.probability);
  });
});

describe("buildPlacementResult", () => {
  it("builds a complete result from IRT state", () => {
    const now = new Date("2025-01-15T00:00:00Z");
    const state: IRTState = {
      theta: 1.0,
      standardError: 0.3,
      responses: [
        { nodeId: "n1", domainId: "d1", difficulty: 0, correct: true },
        { nodeId: "n2", domainId: "d2", difficulty: 1, correct: false },
      ],
      domainThetas: new Map([["d1", 1.5], ["d2", -0.5]]),
    };

    const items: IRTItem[] = [
      { nodeId: "n1", domainId: "d1", difficulty: 0 },
      { nodeId: "n2", domainId: "d2", difficulty: 1 },
      { nodeId: "n3", domainId: "d1", difficulty: -1 },
    ];

    const result = buildPlacementResult(state, items, now);

    expect(result.globalTheta).toBe(1.0);
    expect(result.domainThetas["d1"]).toBe(1.5);
    expect(result.domainThetas["d2"]).toBe(-0.5);
    expect(result.nodeClassifications).toHaveLength(3);
  });
});

describe("full simulated placement test", () => {
  it("converges to correct ability level", () => {
    // Simulated learner with true ability ~1.0
    const trueTheta = 1.0;

    // Generate a pool of items across 3 domains
    const items: IRTItem[] = [];
    const domains = ["d1", "d2", "d3"];
    for (let d = 0; d < domains.length; d++) {
      for (let i = 0; i < 20; i++) {
        items.push({
          nodeId: `${domains[d]}-n${i}`,
          domainId: domains[d],
          difficulty: (i - 10) * 0.4, // -4 to 3.6
        });
      }
    }

    let state = createInitialIRTState();
    const answeredNodeIds = new Set<string>();
    let iterations = 0;

    while (!shouldTerminate(state, DEFAULT_PLACEMENT_CONFIG) && iterations < 60) {
      const available = items.filter((i) => !answeredNodeIds.has(i.nodeId));
      const item = selectNextItem(state, available, DEFAULT_PLACEMENT_CONFIG);
      if (!item) break;

      // Simulate response based on true ability
      const p = irtProbability(trueTheta, item.difficulty);
      const correct = Math.random() < p;

      state = processResponse(state, item, correct);
      answeredNodeIds.add(item.nodeId);
      iterations++;
    }

    // Theta should be roughly near trueTheta
    expect(state.theta).toBeGreaterThan(trueTheta - 1.5);
    expect(state.theta).toBeLessThan(trueTheta + 1.5);

    // SE should have decreased
    expect(state.standardError).toBeLessThan(2.0);

    // Should have terminated before max items
    expect(state.responses.length).toBeLessThanOrEqual(60);
    expect(state.responses.length).toBeGreaterThanOrEqual(20);
  });
});
