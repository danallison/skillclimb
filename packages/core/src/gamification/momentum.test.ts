import { describe, it, expect } from "vitest";
import { computeMomentum, computeSessionMomentum } from "./momentum.js";

describe("computeMomentum", () => {
  it("returns steady for empty results", () => {
    const result = computeMomentum([]);
    expect(result.state).toBe("steady");
    expect(result.recentCorrect).toBe(0);
  });

  it("returns building when 3+ correct in window", () => {
    const result = computeMomentum([true, true, true, false, true]);
    expect(result.state).toBe("building");
    expect(result.recentCorrect).toBe(4);
  });

  it("returns steady when 2 correct in window", () => {
    const result = computeMomentum([true, false, true, false, false]);
    expect(result.state).toBe("steady");
    expect(result.recentCorrect).toBe(2);
  });

  it("returns struggling when 0–1 correct in window", () => {
    const result = computeMomentum([false, false, true, false, false]);
    expect(result.state).toBe("struggling");
    expect(result.recentCorrect).toBe(1);
    expect(result.message).toBe("Hard questions build stronger memory");
  });

  it("only considers last 5 items", () => {
    // First 3 correct, then 5 failures — only last 5 matter
    const result = computeMomentum([true, true, true, false, false, false, false, false]);
    expect(result.state).toBe("struggling");
    expect(result.recentTotal).toBe(5);
  });

  it("works with fewer than 5 results", () => {
    const result = computeMomentum([true, true]);
    expect(result.state).toBe("steady"); // 2 correct = steady (need 3+ for building)
    expect(result.recentTotal).toBe(2);

    const result2 = computeMomentum([true, true, true]);
    expect(result2.state).toBe("building");
  });
});

describe("computeSessionMomentum", () => {
  it("returns no reviews message for empty", () => {
    const result = computeSessionMomentum([]);
    expect(result.overallAccuracy).toBe(0);
    expect(result.inTargetZone).toBe(false);
  });

  it("detects target zone (60–80%)", () => {
    // 7 of 10 = 70%
    const results = [true, true, true, true, true, true, true, false, false, false];
    const summary = computeSessionMomentum(results);
    expect(summary.overallAccuracy).toBe(70);
    expect(summary.inTargetZone).toBe(true);
    expect(summary.message).toContain("Target zone");
  });

  it("flags high accuracy", () => {
    // 9 of 10 = 90%
    const results = Array(9).fill(true).concat([false]);
    const summary = computeSessionMomentum(results);
    expect(summary.overallAccuracy).toBe(90);
    expect(summary.inTargetZone).toBe(false);
    expect(summary.message).toContain("harder material");
  });

  it("flags challenging session", () => {
    // 3 of 10 = 30%
    const results = [true, true, true, false, false, false, false, false, false, false];
    const summary = computeSessionMomentum(results);
    expect(summary.overallAccuracy).toBe(30);
    expect(summary.inTargetZone).toBe(false);
    expect(summary.message).toContain("struggle strengthens");
  });

  it("boundary: 60% is in target zone", () => {
    const results = [true, true, true, false, false];
    expect(computeSessionMomentum(results).inTargetZone).toBe(true);
  });

  it("boundary: 81% is above target zone", () => {
    // 81% → just above the 80% threshold
    // Approximate: 13 of 16 = 81.25%
    const results = Array(13).fill(true).concat(Array(3).fill(false));
    const summary = computeSessionMomentum(results);
    expect(summary.overallAccuracy).toBe(81);
    expect(summary.inTargetZone).toBe(false);
    expect(summary.message).toContain("harder material");
  });

  it("boundary: 80% is in target zone", () => {
    const results = [true, true, true, true, false];
    expect(computeSessionMomentum(results).inTargetZone).toBe(true);
  });
});
