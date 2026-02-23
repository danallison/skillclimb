import { describe, it, expect } from "vitest";
import {
  evaluateRecognition,
  evaluateCuedRecall,
  normalizeAnswer,
  scoreFromSelfRating,
  capScoreForHintedAttempt,
  classifyScore,
  getCalibrationQuadrant,
  updateCalibration,
  getCalibrationStats,
  HINTED_ATTEMPT_SCORE_CAP,
} from "./scoring.js";
import { CORRECT_SCORE_THRESHOLD } from "../types.js";
import type { CalibrationHistory } from "../types.js";

describe("evaluateRecognition", () => {
  it("returns 5 for correct answer", () => {
    expect(evaluateRecognition("AES", "AES")).toBe(5);
  });

  it("returns 0 for incorrect answer", () => {
    expect(evaluateRecognition("DES", "AES")).toBe(0);
  });

  it("returns 1 for 'I don't know' (null selection)", () => {
    expect(evaluateRecognition(null, "AES")).toBe(1);
  });
});

describe("normalizeAnswer", () => {
  it("lowercases and trims", () => {
    expect(normalizeAnswer("  AES  ")).toBe("aes");
  });

  it("collapses whitespace", () => {
    expect(normalizeAnswer("transport  layer   security")).toBe("transport layer security");
  });
});

describe("evaluateCuedRecall", () => {
  it("returns 5 for exact match (normalized)", () => {
    expect(evaluateCuedRecall("AES", "aes")).toBe(5);
  });

  it("returns 5 for match with extra whitespace", () => {
    expect(evaluateCuedRecall("  Transport Layer Security  ", "transport layer security")).toBe(5);
  });

  it("returns 4 for an acceptable answer", () => {
    expect(evaluateCuedRecall("TLS", "Transport Layer Security", ["TLS", "SSL/TLS"])).toBe(4);
  });

  it("returns 0 for no match", () => {
    expect(evaluateCuedRecall("DES", "AES")).toBe(0);
  });

  it("returns 0 for no match even with acceptable answers", () => {
    expect(evaluateCuedRecall("DES", "AES", ["Rijndael"])).toBe(0);
  });

  it("returns 5 for exact match even when acceptable answers exist", () => {
    expect(evaluateCuedRecall("AES", "AES", ["Rijndael"])).toBe(5);
  });
});

describe("scoreFromSelfRating", () => {
  it("returns 5 for correct", () => {
    expect(scoreFromSelfRating("correct")).toBe(5);
  });

  it("returns 3 for partially_correct", () => {
    expect(scoreFromSelfRating("partially_correct")).toBe(3);
  });

  it("returns 0 for incorrect", () => {
    expect(scoreFromSelfRating("incorrect")).toBe(0);
  });
});

describe("capScoreForHintedAttempt", () => {
  it("does not cap first attempts", () => {
    expect(capScoreForHintedAttempt(5, 1)).toBe(5);
  });

  it("caps second attempts to HINTED_ATTEMPT_SCORE_CAP", () => {
    expect(capScoreForHintedAttempt(5, 2)).toBe(HINTED_ATTEMPT_SCORE_CAP);
  });

  it("does not increase score below the cap", () => {
    expect(capScoreForHintedAttempt(0, 2)).toBe(0);
    expect(capScoreForHintedAttempt(1, 2)).toBe(1);
  });
});

describe("hinted correct answer — regression", () => {
  /**
   * Regression: correct answer after hint must be classified as "correct".
   * Previously, HINTED_ATTEMPT_SCORE_CAP (2) was below CORRECT_SCORE_THRESHOLD (3),
   * so correct hinted answers were classified as "partially_correct" / wasCorrect=false.
   * Fix: cap is now >= threshold so correctness is preserved.
   */
  it("classifies a correct recognition answer after hint as correct", () => {
    // User selects the right answer on attempt 2 (after hint)
    const rawScore = evaluateRecognition("AES", "AES");
    expect(rawScore).toBe(5); // raw evaluation says correct

    const cappedScore = capScoreForHintedAttempt(rawScore, 2);
    // The cap reduces the score for SRS purposes — that's fine
    expect(cappedScore).toBe(HINTED_ATTEMPT_SCORE_CAP);

    const classification = classifyScore(cappedScore);
    expect(classification).toBe("correct");

    // Backend also uses score >= CORRECT_SCORE_THRESHOLD for wasCorrect
    const wasCorrect = cappedScore >= CORRECT_SCORE_THRESHOLD;
    expect(wasCorrect).toBe(true);
  });

  it("classifies a correct cued recall answer after hint as correct", () => {
    const rawScore = evaluateCuedRecall("AES", "AES");
    expect(rawScore).toBe(5);

    const cappedScore = capScoreForHintedAttempt(rawScore, 2);
    const classification = classifyScore(cappedScore);
    expect(classification).toBe("correct");
  });

  it("still classifies a wrong answer after hint as incorrect", () => {
    const rawScore = evaluateRecognition("DES", "AES");
    expect(rawScore).toBe(0);

    const cappedScore = capScoreForHintedAttempt(rawScore, 2);
    expect(cappedScore).toBe(0);

    const classification = classifyScore(cappedScore);
    expect(classification).toBe("incorrect");
  });
});

describe("getCalibrationQuadrant", () => {
  it("returns calibrated for high confidence + correct", () => {
    expect(getCalibrationQuadrant(4, true)).toBe("calibrated");
    expect(getCalibrationQuadrant(5, true)).toBe("calibrated");
    expect(getCalibrationQuadrant(3, true)).toBe("calibrated");
  });

  it("returns illusion for high confidence + incorrect", () => {
    expect(getCalibrationQuadrant(4, false)).toBe("illusion");
    expect(getCalibrationQuadrant(5, false)).toBe("illusion");
  });

  it("returns undervalued for low confidence + correct", () => {
    expect(getCalibrationQuadrant(1, true)).toBe("undervalued");
    expect(getCalibrationQuadrant(2, true)).toBe("undervalued");
  });

  it("returns known_unknown for low confidence + incorrect", () => {
    expect(getCalibrationQuadrant(1, false)).toBe("known_unknown");
    expect(getCalibrationQuadrant(2, false)).toBe("known_unknown");
  });
});

describe("updateCalibration", () => {
  it("appends entry to empty history", () => {
    const history: CalibrationHistory = { entries: [] };
    const now = new Date("2025-01-15");
    const updated = updateCalibration(4, true, history, now);

    expect(updated.entries).toHaveLength(1);
    expect(updated.entries[0].confidence).toBe(4);
    expect(updated.entries[0].wasCorrect).toBe(true);
  });

  it("appends entry to existing history without mutating original", () => {
    const history: CalibrationHistory = {
      entries: [{ confidence: 3, wasCorrect: false, timestamp: new Date("2025-01-10") }],
    };
    const updated = updateCalibration(5, true, history, new Date("2025-01-11"));

    expect(updated.entries).toHaveLength(2);
    expect(history.entries).toHaveLength(1); // original not mutated
  });
});

describe("getCalibrationStats", () => {
  it("returns all zeros for empty history", () => {
    const stats = getCalibrationStats({ entries: [] });
    expect(stats.calibrated).toBe(0);
    expect(stats.illusion).toBe(0);
    expect(stats.undervalued).toBe(0);
    expect(stats.known_unknown).toBe(0);
  });

  it("calculates correct fractions", () => {
    const history: CalibrationHistory = {
      entries: [
        { confidence: 4, wasCorrect: true, timestamp: new Date() }, // calibrated
        { confidence: 4, wasCorrect: false, timestamp: new Date() }, // illusion
        { confidence: 1, wasCorrect: true, timestamp: new Date() }, // undervalued
        { confidence: 1, wasCorrect: false, timestamp: new Date() }, // known_unknown
      ],
    };

    const stats = getCalibrationStats(history);
    expect(stats.calibrated).toBe(0.25);
    expect(stats.illusion).toBe(0.25);
    expect(stats.undervalued).toBe(0.25);
    expect(stats.known_unknown).toBe(0.25);
  });
});
