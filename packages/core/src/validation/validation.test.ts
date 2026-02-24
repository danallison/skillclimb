import { describe, it, expect } from "vitest";
import {
  assertScore,
  assertConfidence,
  assertEasiness,
  assertInterval,
  assertRepetitions,
  assertDomainWeight,
  assertNonEmptyString,
  assertQuestionType,
  isValidScore,
  isValidConfidence,
  isValidQuestionType,
  VALID_QUESTION_TYPES,
} from "./validation.js";

describe("assertScore", () => {
  it("passes for valid scores 0–5", () => {
    for (let i = 0; i <= 5; i++) {
      expect(() => assertScore(i)).not.toThrow();
    }
  });

  it("throws for score < 0", () => {
    expect(() => assertScore(-1)).toThrow(RangeError);
  });

  it("throws for score > 5", () => {
    expect(() => assertScore(6)).toThrow(RangeError);
  });

  it("throws for non-integer", () => {
    expect(() => assertScore(4.5)).toThrow(RangeError);
  });

  it("throws for NaN", () => {
    expect(() => assertScore(NaN)).toThrow(RangeError);
  });

  it("throws for Infinity", () => {
    expect(() => assertScore(Infinity)).toThrow(RangeError);
  });
});

describe("assertConfidence", () => {
  it("passes for valid confidence 1–5", () => {
    for (let i = 1; i <= 5; i++) {
      expect(() => assertConfidence(i)).not.toThrow();
    }
  });

  it("throws for confidence < 1", () => {
    expect(() => assertConfidence(0)).toThrow(RangeError);
  });

  it("throws for confidence > 5", () => {
    expect(() => assertConfidence(6)).toThrow(RangeError);
  });

  it("throws for non-integer", () => {
    expect(() => assertConfidence(2.5)).toThrow(RangeError);
  });

  it("throws for NaN", () => {
    expect(() => assertConfidence(NaN)).toThrow(RangeError);
  });
});

describe("assertEasiness", () => {
  it("passes for valid easiness values", () => {
    expect(() => assertEasiness(1.3)).not.toThrow();
    expect(() => assertEasiness(2.5)).not.toThrow();
    expect(() => assertEasiness(5.0)).not.toThrow();
  });

  it("throws for easiness < 1.3", () => {
    expect(() => assertEasiness(1.2)).toThrow(RangeError);
  });

  it("throws for easiness > 5.0", () => {
    expect(() => assertEasiness(5.1)).toThrow(RangeError);
  });

  it("throws for NaN", () => {
    expect(() => assertEasiness(NaN)).toThrow(RangeError);
  });
});

describe("assertInterval", () => {
  it("passes for valid intervals", () => {
    expect(() => assertInterval(0)).not.toThrow();
    expect(() => assertInterval(100)).not.toThrow();
  });

  it("throws for interval < 0", () => {
    expect(() => assertInterval(-1)).toThrow(RangeError);
  });

  it("throws for NaN", () => {
    expect(() => assertInterval(NaN)).toThrow(RangeError);
  });
});

describe("assertRepetitions", () => {
  it("passes for valid repetitions", () => {
    expect(() => assertRepetitions(0)).not.toThrow();
    expect(() => assertRepetitions(10)).not.toThrow();
  });

  it("throws for repetitions < 0", () => {
    expect(() => assertRepetitions(-1)).toThrow(RangeError);
  });

  it("throws for non-integer", () => {
    expect(() => assertRepetitions(1.5)).toThrow(RangeError);
  });
});

describe("assertDomainWeight", () => {
  it("passes for valid domain weights", () => {
    expect(() => assertDomainWeight(0.5)).not.toThrow();
    expect(() => assertDomainWeight(2.0)).not.toThrow();
  });

  it("throws for domainWeight <= 0", () => {
    expect(() => assertDomainWeight(0)).toThrow(RangeError);
    expect(() => assertDomainWeight(-1)).toThrow(RangeError);
  });

  it("throws for NaN", () => {
    expect(() => assertDomainWeight(NaN)).toThrow(RangeError);
  });
});

describe("assertNonEmptyString", () => {
  it("passes for non-empty strings", () => {
    expect(() => assertNonEmptyString("hello")).not.toThrow();
  });

  it("throws for empty string", () => {
    expect(() => assertNonEmptyString("")).toThrow(RangeError);
  });

  it("throws for whitespace-only string", () => {
    expect(() => assertNonEmptyString("   ")).toThrow(RangeError);
  });
});

describe("assertQuestionType", () => {
  it("passes for all valid question types", () => {
    for (const type of VALID_QUESTION_TYPES) {
      expect(() => assertQuestionType(type)).not.toThrow();
    }
  });

  it("throws for invalid type", () => {
    expect(() => assertQuestionType("garbage")).toThrow(RangeError);
  });

  it("throws for empty string", () => {
    expect(() => assertQuestionType("")).toThrow(RangeError);
  });
});

describe("isValidScore", () => {
  it("returns true for valid scores", () => {
    expect(isValidScore(0)).toBe(true);
    expect(isValidScore(5)).toBe(true);
  });

  it("returns false for invalid scores", () => {
    expect(isValidScore(-1)).toBe(false);
    expect(isValidScore(6)).toBe(false);
    expect(isValidScore(4.5)).toBe(false);
    expect(isValidScore(NaN)).toBe(false);
  });
});

describe("isValidConfidence", () => {
  it("returns true for valid confidence", () => {
    expect(isValidConfidence(1)).toBe(true);
    expect(isValidConfidence(5)).toBe(true);
  });

  it("returns false for invalid confidence", () => {
    expect(isValidConfidence(0)).toBe(false);
    expect(isValidConfidence(6)).toBe(false);
    expect(isValidConfidence(2.5)).toBe(false);
  });
});

describe("isValidQuestionType", () => {
  it("returns true for valid types", () => {
    expect(isValidQuestionType("recognition")).toBe(true);
    expect(isValidQuestionType("free_recall")).toBe(true);
  });

  it("returns false for invalid types", () => {
    expect(isValidQuestionType("garbage")).toBe(false);
    expect(isValidQuestionType("")).toBe(false);
  });
});
