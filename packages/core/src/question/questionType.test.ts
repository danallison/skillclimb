import { describe, it, expect } from "vitest";
import { selectQuestionType, getQuestionTypeDifficulty } from "./questionType.js";
import type { LearnerNodeState } from "../types.js";

function makeLearnerState(overrides: Partial<LearnerNodeState> = {}): LearnerNodeState {
  return {
    userId: "u1",
    nodeId: "n1",
    domainId: "d1",
    easiness: 2.5,
    interval: 0,
    repetitions: 0,
    dueDate: new Date(),
    confidenceHistory: [],
    domainWeight: 1.0,
    ...overrides,
  };
}

describe("getQuestionTypeDifficulty", () => {
  it("returns ordinal values 0–4", () => {
    expect(getQuestionTypeDifficulty("recognition")).toBe(0);
    expect(getQuestionTypeDifficulty("cued_recall")).toBe(1);
    expect(getQuestionTypeDifficulty("free_recall")).toBe(2);
    expect(getQuestionTypeDifficulty("application")).toBe(3);
    expect(getQuestionTypeDifficulty("practical")).toBe(4);
  });
});

describe("selectQuestionType", () => {
  const allTypes: Array<"recognition" | "cued_recall" | "free_recall"> = [
    "recognition",
    "cued_recall",
    "free_recall",
  ];

  it("selects recognition for new nodes (repetitions 0)", () => {
    const state = makeLearnerState({ repetitions: 0, easiness: 2.5 });
    expect(selectQuestionType(state, allTypes)).toBe("recognition");
  });

  it("selects recognition for struggling nodes (low easiness)", () => {
    const state = makeLearnerState({ repetitions: 4, easiness: 1.5 });
    expect(selectQuestionType(state, allTypes)).toBe("recognition");
  });

  it("selects recognition for low repetitions even with decent easiness", () => {
    const state = makeLearnerState({ repetitions: 2, easiness: 2.5 });
    expect(selectQuestionType(state, allTypes)).toBe("recognition");
  });

  it("selects cued_recall for intermediate nodes (repetitions 3–5, easiness ≥ 1.8)", () => {
    const state = makeLearnerState({ repetitions: 3, easiness: 1.8 });
    expect(selectQuestionType(state, allTypes)).toBe("cued_recall");
  });

  it("selects cued_recall at repetitions 5", () => {
    const state = makeLearnerState({ repetitions: 5, easiness: 2.0 });
    expect(selectQuestionType(state, allTypes)).toBe("cued_recall");
  });

  it("selects free_recall for strong nodes (repetitions 6+, easiness ≥ 2.2)", () => {
    const state = makeLearnerState({ repetitions: 6, easiness: 2.2 });
    expect(selectQuestionType(state, allTypes)).toBe("free_recall");
  });

  it("selects free_recall for very strong nodes", () => {
    const state = makeLearnerState({ repetitions: 10, easiness: 3.0 });
    expect(selectQuestionType(state, allTypes)).toBe("free_recall");
  });

  it("falls back to recognition when cued_recall not available for intermediate node", () => {
    const state = makeLearnerState({ repetitions: 4, easiness: 2.0 });
    expect(selectQuestionType(state, ["recognition"])).toBe("recognition");
  });

  it("falls back to cued_recall when free_recall not available for strong node", () => {
    const state = makeLearnerState({ repetitions: 8, easiness: 2.5 });
    expect(selectQuestionType(state, ["recognition", "cued_recall"])).toBe("cued_recall");
  });

  it("falls back to recognition when only recognition available for strong node", () => {
    const state = makeLearnerState({ repetitions: 8, easiness: 2.5 });
    expect(selectQuestionType(state, ["recognition"])).toBe("recognition");
  });

  it("picks the easiest available when all types are above target", () => {
    const state = makeLearnerState({ repetitions: 0, easiness: 2.5 });
    // Only free_recall available, target is recognition — pick the lowest available
    expect(selectQuestionType(state, ["free_recall"])).toBe("free_recall");
  });

  it("returns recognition as default for empty available types", () => {
    const state = makeLearnerState();
    expect(selectQuestionType(state, [])).toBe("recognition");
  });

  it("selects recognition when repetitions >= 3 but easiness < 1.8", () => {
    const state = makeLearnerState({ repetitions: 3, easiness: 1.7 });
    expect(selectQuestionType(state, allTypes)).toBe("recognition");
  });

  it("selects cued_recall when repetitions >= 6 but easiness < 2.2", () => {
    const state = makeLearnerState({ repetitions: 6, easiness: 2.0 });
    expect(selectQuestionType(state, allTypes)).toBe("cued_recall");
  });
});
