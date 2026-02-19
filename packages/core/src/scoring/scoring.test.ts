import { describe, it, expect } from "vitest";
import {
  evaluateRecognition,
  evaluateCuedRecall,
  normalizeAnswer,
  scoreFromSelfRating,
  getCalibrationQuadrant,
  updateCalibration,
  getCalibrationStats,
} from "./scoring.js";
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
