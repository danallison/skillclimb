import { describe, it, expect } from "vitest";
import { computeStreakInfo, computeHeatMap } from "./streaks.js";
import type { StudyDay } from "./streaks.js";

function day(date: string, reviewCount = 10): StudyDay {
  return { date, reviewCount };
}

describe("computeStreakInfo", () => {
  it("returns zeros for empty input", () => {
    const result = computeStreakInfo([], "2025-03-15");
    expect(result.currentStreak).toBe(0);
    expect(result.longestStreak).toBe(0);
    expect(result.totalStudyDays).toBe(0);
    expect(result.recentSummary).toBe("0 of the last 21 days");
  });

  it("counts a simple consecutive streak", () => {
    const days = [
      day("2025-03-13"),
      day("2025-03-14"),
      day("2025-03-15"),
    ];
    const result = computeStreakInfo(days, "2025-03-15");
    expect(result.currentStreak).toBe(3);
    expect(result.longestStreak).toBe(3);
    expect(result.totalStudyDays).toBe(3);
  });

  it("freeze: one missed day per week does not break streak", () => {
    // Mon Mar 10 through Fri Mar 14, skip Thu Mar 13 (same week)
    const days = [
      day("2025-03-10"), // Mon
      day("2025-03-11"), // Tue
      day("2025-03-12"), // Wed
      // Thu Mar 13 missed — freeze
      day("2025-03-14"), // Fri
    ];
    const result = computeStreakInfo(days, "2025-03-14");
    expect(result.currentStreak).toBe(4);
  });

  it("two missed days in same week breaks streak", () => {
    // Mon Mar 10, skip Tue+Wed, then Thu Mar 13
    const days = [
      day("2025-03-10"), // Mon
      // Tue Mar 11 missed — freeze
      // Wed Mar 12 missed — no freeze left, streak breaks
      day("2025-03-13"), // Thu
      day("2025-03-14"), // Fri
    ];
    const result = computeStreakInfo(days, "2025-03-14");
    expect(result.currentStreak).toBe(2);
    expect(result.longestStreak).toBe(2);
  });

  it("longest streak survives when current is shorter", () => {
    const days = [
      day("2025-03-01"),
      day("2025-03-02"),
      day("2025-03-03"),
      day("2025-03-04"),
      day("2025-03-05"),
      // gap (breaks streak)
      // Mar 6 is Thu, Mar 7 is Fri — same week as Mar 3–5 (Mon=Mar 3)
      // Actually Mar 3 is Mon, Mar 6-7 two missed days in that week => breaks
      day("2025-03-10"),
      day("2025-03-11"),
    ];
    const result = computeStreakInfo(days, "2025-03-11");
    expect(result.currentStreak).toBe(2);
    expect(result.longestStreak).toBe(5);
  });

  it("recent summary counts last 21 days", () => {
    const days = [
      day("2025-03-01"),
      day("2025-03-05"),
      day("2025-03-10"),
      day("2025-03-15"),
    ];
    const result = computeStreakInfo(days, "2025-03-15");
    expect(result.recentSummary).toBe("4 of the last 21 days");
  });

  it("single day streak", () => {
    const result = computeStreakInfo([day("2025-03-15")], "2025-03-15");
    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(1);
  });

  it("freeze works across week boundaries", () => {
    // Week 1 (Mon Mar 3 - Sun Mar 9): study Mon-Fri, skip Sat (freeze), skip Sun
    // Week 2 (Mon Mar 10 - Sun Mar 16): study Mon-Wed
    // The streak should span both weeks
    const days = [
      day("2025-03-03"), // Mon W1
      day("2025-03-04"), // Tue W1
      day("2025-03-05"), // Wed W1
      day("2025-03-06"), // Thu W1
      day("2025-03-07"), // Fri W1
      // Sat Mar 8 missed — freeze in W1
      // Sun Mar 9 missed — second miss in W1, streak breaks
      day("2025-03-10"), // Mon W2
      day("2025-03-11"), // Tue W2
      day("2025-03-12"), // Wed W2
    ];
    const result = computeStreakInfo(days, "2025-03-12");
    // Streak breaks on Sun Mar 9 (second miss in W1), so current = Mon-Wed W2 = 3
    expect(result.currentStreak).toBe(3);
    expect(result.longestStreak).toBe(5);
  });

  it("uses unique date count for totalStudyDays", () => {
    // Duplicate entries for same date
    const days = [
      day("2025-03-14"),
      day("2025-03-14"), // duplicate
      day("2025-03-15"),
    ];
    const result = computeStreakInfo(days, "2025-03-15");
    expect(result.totalStudyDays).toBe(2); // 2 unique dates, not 3
  });

  it("no current streak if today was not studied and no freeze available", () => {
    // Study only on Mar 10 (Mon), today is Mar 15 (Sat) — 4 days missed
    const days = [day("2025-03-10")];
    const result = computeStreakInfo(days, "2025-03-15");
    expect(result.currentStreak).toBe(0);
  });
});

describe("computeHeatMap", () => {
  it("returns entries for the full window", () => {
    const entries = computeHeatMap([], "2025-03-15", 7);
    expect(entries).toHaveLength(7);
    expect(entries[0].date).toBe("2025-03-09");
    expect(entries[6].date).toBe("2025-03-15");
    expect(entries[0].intensity).toBe(0);
  });

  it("scales intensity relative to max", () => {
    const days = [
      day("2025-03-14", 10),
      day("2025-03-15", 20),
    ];
    const entries = computeHeatMap(days, "2025-03-15", 3);
    expect(entries[2].intensity).toBe(1); // max
    expect(entries[1].intensity).toBe(0.5); // half
    expect(entries[0].intensity).toBe(0); // no activity
  });

  it("scales intensity relative to windowed max, not global", () => {
    // Old outlier day outside the window should not affect intensity
    const days = [
      day("2025-01-01", 200), // way outside 7-day window
      day("2025-03-14", 10),
      day("2025-03-15", 20),
    ];
    const entries = computeHeatMap(days, "2025-03-15", 7);
    // Windowed max should be 20 (not 200), so 20/20 = 1.0 and 10/20 = 0.5
    expect(entries[6].intensity).toBe(1);
    expect(entries[5].intensity).toBe(0.5);
  });

  it("defaults to 90 days", () => {
    const entries = computeHeatMap([], "2025-03-15");
    expect(entries).toHaveLength(90);
  });
});
