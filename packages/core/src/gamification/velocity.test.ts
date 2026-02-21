import { describe, it, expect } from "vitest";
import { computeVelocity } from "./velocity.js";
import type { MasteryEvent } from "./velocity.js";

const now = new Date("2025-03-15T12:00:00Z");
const MS_PER_DAY = 86_400_000;

function daysAgo(days: number): Date {
  return new Date(now.getTime() - days * MS_PER_DAY);
}

describe("computeVelocity", () => {
  it("returns zero for no events", () => {
    const result = computeVelocity([], now);
    expect(result.nodesPerWeek).toBe(0);
    expect(result.trend).toBe("stable");
    expect(result.weeklyBreakdown).toEqual([0, 0, 0, 0]);
  });

  it("computes average across 4 weeks", () => {
    const events: MasteryEvent[] = [
      { nodeId: "n1", masteredAt: daysAgo(1) },
      { nodeId: "n2", masteredAt: daysAgo(2) },
      { nodeId: "n3", masteredAt: daysAgo(8) },
      { nodeId: "n4", masteredAt: daysAgo(9) },
    ];
    const result = computeVelocity(events, now);
    expect(result.nodesPerWeek).toBe(1); // 4 events / 4 weeks
  });

  it("detects increasing trend", () => {
    // Recent weeks have more mastery events than older weeks
    const events: MasteryEvent[] = [
      { nodeId: "n1", masteredAt: daysAgo(1) },
      { nodeId: "n2", masteredAt: daysAgo(2) },
      { nodeId: "n3", masteredAt: daysAgo(3) },
      { nodeId: "n4", masteredAt: daysAgo(8) },
      { nodeId: "n5", masteredAt: daysAgo(9) },
      // Older weeks: fewer
      { nodeId: "n6", masteredAt: daysAgo(20) },
    ];
    const result = computeVelocity(events, now);
    expect(result.trend).toBe("increasing");
  });

  it("detects decreasing trend", () => {
    // Older weeks have more events
    const events: MasteryEvent[] = [
      { nodeId: "n1", masteredAt: daysAgo(20) },
      { nodeId: "n2", masteredAt: daysAgo(21) },
      { nodeId: "n3", masteredAt: daysAgo(22) },
      { nodeId: "n4", masteredAt: daysAgo(15) },
      { nodeId: "n5", masteredAt: daysAgo(16) },
      { nodeId: "n6", masteredAt: daysAgo(17) },
      // Recent: only 1
      { nodeId: "n7", masteredAt: daysAgo(1) },
    ];
    const result = computeVelocity(events, now);
    expect(result.trend).toBe("decreasing");
  });

  it("ignores events older than 4 weeks", () => {
    const events: MasteryEvent[] = [
      { nodeId: "n1", masteredAt: daysAgo(30) },
    ];
    const result = computeVelocity(events, now);
    expect(result.nodesPerWeek).toBe(0);
    expect(result.weeklyBreakdown).toEqual([0, 0, 0, 0]);
  });

  it("places events at exact week boundaries correctly", () => {
    const events: MasteryEvent[] = [
      { nodeId: "n1", masteredAt: daysAgo(7) },  // exactly 1 week ago → bucket 1
      { nodeId: "n2", masteredAt: daysAgo(14) }, // exactly 2 weeks ago → bucket 2
      { nodeId: "n3", masteredAt: daysAgo(21) }, // exactly 3 weeks ago → bucket 3
    ];
    const result = computeVelocity(events, now);
    // weeklyBreakdown is oldest-first: [bucket3, bucket2, bucket1, bucket0]
    expect(result.weeklyBreakdown[0]).toBe(1); // 21 days ago
    expect(result.weeklyBreakdown[1]).toBe(1); // 14 days ago
    expect(result.weeklyBreakdown[2]).toBe(1); // 7 days ago
    expect(result.weeklyBreakdown[3]).toBe(0); // this week
  });

  it("weekly breakdown is oldest-first", () => {
    const events: MasteryEvent[] = [
      { nodeId: "n1", masteredAt: daysAgo(1) },  // most recent week
      { nodeId: "n2", masteredAt: daysAgo(25) }, // oldest week (21-28 days ago)
    ];
    const result = computeVelocity(events, now);
    // breakdown[0] = oldest, breakdown[3] = most recent
    expect(result.weeklyBreakdown[3]).toBe(1);
    expect(result.weeklyBreakdown[0]).toBe(1);
  });
});
