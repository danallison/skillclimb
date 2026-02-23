import { describe, it, expect } from "vitest";
import { initializeLearnerNodes } from "../auth.js";

/**
 * Regression test: initializeLearnerNodes must skip retired nodes.
 *
 * We pass a mock DB client that returns a mix of active and retired nodes
 * from the select query, then verify only active nodes are inserted.
 */
describe("initializeLearnerNodes", () => {
  it("does not create learnerNodes for retired nodes", async () => {
    const activeNode = {
      id: "node-active",
      domainId: "domain-1",
      topicId: "topic-1",
      concept: "Active Concept",
      difficulty: 0,
      questionTemplates: [],
      retiredAt: null,
    };
    const retiredNode = {
      id: "node-retired",
      domainId: "domain-1",
      topicId: "topic-1",
      concept: "Retired Concept",
      difficulty: 0,
      questionTemplates: [],
      retiredAt: new Date("2026-01-01"),
    };

    // Track what gets inserted
    const insertedBatches: any[][] = [];

    const mockClient: any = {
      select: () => ({
        from: () => ({
          where: () => {
            // Simulate isNull(retiredAt) — only return active nodes
            return Promise.resolve([activeNode]);
          },
        }),
      }),
      insert: () => ({
        values: (batch: any[]) => {
          insertedBatches.push(batch);
          return { onConflictDoNothing: () => Promise.resolve() };
        },
      }),
    };

    await initializeLearnerNodes("user-1", mockClient);

    // Should have inserted exactly one batch with only the active node
    expect(insertedBatches).toHaveLength(1);
    expect(insertedBatches[0]).toHaveLength(1);
    expect(insertedBatches[0][0].nodeId).toBe("node-active");
  });

  it("inserts nothing when all nodes are retired", async () => {
    const insertedBatches: any[][] = [];

    const mockClient: any = {
      select: () => ({
        from: () => ({
          where: () => Promise.resolve([]),  // isNull filter returns nothing
        }),
      }),
      insert: () => ({
        values: (batch: any[]) => {
          insertedBatches.push(batch);
          return { onConflictDoNothing: () => Promise.resolve() };
        },
      }),
    };

    await initializeLearnerNodes("user-1", mockClient);

    // Should not insert anything
    expect(insertedBatches).toHaveLength(0);
  });
});
