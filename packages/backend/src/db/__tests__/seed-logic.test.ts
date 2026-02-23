import { describe, it, expect, vi } from "vitest";
import { mergeTemplates, seedDomain, seedSkillTree, updateTemplatesForSkillTree } from "../seed-logic.js";
import type { SeedData, DbClient } from "../seed-logic.js";
import type { SkillTreeDef } from "../../seed/types.js";

// ---------------------------------------------------------------------------
// mergeTemplates (pure function)
// ---------------------------------------------------------------------------

describe("mergeTemplates", () => {
  it("appends new template types to existing", () => {
    const existing = [
      { type: "recognition" as const, prompt: "old", correctAnswer: "a", explanation: "e" },
    ];
    const seed = [
      { type: "recognition" as const, prompt: "new-recog", correctAnswer: "a", explanation: "e" },
      { type: "cued_recall" as const, prompt: "new-cued", correctAnswer: "b", explanation: "e" },
    ];

    const result = mergeTemplates(existing, seed);

    expect(result).toHaveLength(2);
    // Existing recognition template preserved (not replaced)
    expect(result[0].prompt).toBe("old");
    // New cued_recall template appended
    expect(result[1].type).toBe("cued_recall");
    expect(result[1].prompt).toBe("new-cued");
  });

  it("returns existing unchanged when seed has no new types", () => {
    const existing = [
      { type: "recognition" as const, prompt: "a", correctAnswer: "a", explanation: "e" },
      { type: "free_recall" as const, prompt: "b", correctAnswer: "b", explanation: "e" },
    ];
    const seed = [
      { type: "recognition" as const, prompt: "x", correctAnswer: "x", explanation: "e" },
    ];

    const result = mergeTemplates(existing, seed);

    expect(result).toHaveLength(2);
    expect(result).toEqual(existing);
  });

  it("returns seed templates when existing is empty", () => {
    const seed = [
      { type: "application" as const, prompt: "p", correctAnswer: "a", explanation: "e" },
    ];

    const result = mergeTemplates([], seed);

    expect(result).toEqual(seed);
  });

  it("returns empty when both are empty", () => {
    expect(mergeTemplates([], [])).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Stateful mock DB for seed-logic tests
// ---------------------------------------------------------------------------

interface MockRow {
  [key: string]: any;
}

/**
 * Creates a stateful in-memory mock that simulates Drizzle's query chain.
 * Tracks inserted/updated/retired rows so seed logic works end-to-end.
 */
function createSeedMockDb(initialData: Record<string, MockRow[]> = {}) {
  const tables: Record<string, MockRow[]> = {};
  for (const [name, rows] of Object.entries(initialData)) {
    tables[name] = rows.map((r) => ({ ...r }));
  }

  let idCounter = 1000;
  function nextId() {
    return `mock-${++idCounter}`;
  }

  // Track operations for assertions
  const operations: Array<{ op: string; table: string; data?: any; count?: number }> = [];

  function getTableName(table: any): string {
    const sym = Object.getOwnPropertySymbols(table).find(
      (s) => s.toString() === "Symbol(drizzle:Name)",
    );
    if (sym) return table[sym];
    if (table._ && table._.name) return table._.name;
    return "unknown";
  }

  function getRows(name: string): MockRow[] {
    if (!tables[name]) tables[name] = [];
    return tables[name];
  }

  /**
   * Convert snake_case column name to camelCase fixture key.
   */
  function toCamelCase(s: string): string {
    return s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
  }

  function getStringChunkValue(chunk: any): string {
    if (typeof chunk === "string") return chunk;
    if (chunk?.value && Array.isArray(chunk.value)) return chunk.value.join("");
    return "";
  }

  /**
   * Evaluate a Drizzle SQL expression against a row.
   * Supports: eq, and, isNull, inArray.
   *
   * Drizzle expression structures:
   *   eq(col, val):       SQL(5): [SC(""), Column, SC(" = "), Param, SC("")]
   *   isNull(col):        SQL(3): [SC(""), Column, SC(" is null")]
   *   inArray(col, vals): SQL(5): [SC(""), Column, SC(" in "), Array<Param>, SC("")]
   *   and(a, b, ...):     SQL(3): [SC("("), SQL(join: [a, SC(" and "), b, ...]), SC(")")]
   */
  function matchesExpr(row: MockRow, expr: any): boolean {
    if (!expr || !expr.queryChunks) return true;

    const chunks = expr.queryChunks;

    // --- and(...): SQL(3) = [SC("("), SQL(join), SC(")")] ---
    if (chunks.length === 3
      && getStringChunkValue(chunks[0]) === "("
      && getStringChunkValue(chunks[2]) === ")"
      && chunks[1]?.queryChunks) {
      // Inner join SQL has: [SubExpr, SC(" and "), SubExpr, SC(" and "), ...]
      const innerChunks = chunks[1].queryChunks;
      const subExprs = innerChunks.filter((c: any) => c?.queryChunks);
      return subExprs.every((sub: any) => matchesExpr(row, sub));
    }

    // --- isNull(col): SQL(3) = [SC(""), Column, SC(" is null")] ---
    if (chunks.length === 3
      && chunks[1]?.name && chunks[1]?.table
      && getStringChunkValue(chunks[2]).includes("is null")) {
      const colName = toCamelCase(chunks[1].name);
      return row[colName] === null || row[colName] === undefined;
    }

    // --- eq(col, val): SQL(5) = [SC(""), Column, SC(" = "), Param, SC("")] ---
    if (chunks.length === 5
      && chunks[1]?.name && chunks[1]?.table
      && getStringChunkValue(chunks[2]).includes(" = ")
      && chunks[3]?.encoder) {
      const colName = toCamelCase(chunks[1].name);
      return row[colName] === chunks[3].value;
    }

    // --- inArray(col, vals): SQL(5) = [SC(""), Column, SC(" in "), Array<Param>, SC("")] ---
    if (chunks.length === 5
      && chunks[1]?.name && chunks[1]?.table
      && getStringChunkValue(chunks[2]).includes(" in ")
      && Array.isArray(chunks[3])) {
      const colName = toCamelCase(chunks[1].name);
      const values = chunks[3].map((p: any) => p.value);
      return values.includes(row[colName]);
    }

    return true;
  }

  function filterRows(rows: MockRow[], expr: any): MockRow[] {
    if (!expr) return rows;
    return rows.filter((row) => matchesExpr(row, expr));
  }

  const mockDb: any = {
    select: () => ({
      from: (table: any) => {
        const name = getTableName(table);
        const rows = getRows(name);
        const result = Promise.resolve([...rows]);
        (result as any).where = (expr: any) => {
          const filtered = Promise.resolve(filterRows(rows, expr));
          (filtered as any).orderBy = () => filtered;
          return filtered;
        };
        (result as any).orderBy = () => {
          const ordered = Promise.resolve([...rows]);
          (ordered as any).where = (expr: any) =>
            Promise.resolve(filterRows(rows, expr));
          return ordered;
        };
        return result;
      },
    }),
    insert: (table: any) => {
      const name = getTableName(table);
      return {
        values: (data: any) => {
          const insertedRows = Array.isArray(data) ? data : [data];
          const rowsWithIds = insertedRows.map((r: any) => ({
            id: r.id ?? nextId(),
            ...r,
          }));

          /**
           * Resolve conflict target columns from opts.
           * If target is given (column or array of columns), use those.
           * Otherwise, match on all non-id scalar fields from insert data.
           */
          function getConflictCols(opts: any, insertData: any): string[] | null {
            if (opts?.target) {
              const targets = Array.isArray(opts.target) ? opts.target : [opts.target];
              return targets.map((t: any) => toCamelCase(t.name ?? t));
            }
            return null; // use all-fields match
          }

          function hasConflict(existing: MockRow, insertData: any, conflictCols: string[] | null): boolean {
            if (conflictCols) {
              return conflictCols.every((col) => existing[col] === insertData[col]);
            }
            // No explicit target — match on all fields from insert data, excluding auto-generated id
            for (const [key, val] of Object.entries(insertData)) {
              if (key === "id" && String(val).startsWith("mock-")) continue;
              if (existing[key] === undefined) continue;
              if (typeof val === "object" && val !== null) {
                if (JSON.stringify(existing[key]) !== JSON.stringify(val)) return false;
              } else {
                if (existing[key] !== val) return false;
              }
            }
            return true;
          }

          const doInsert = () => {
            const rows = getRows(name);
            for (const r of rowsWithIds) {
              rows.push(r);
            }
            operations.push({ op: "insert", table: name, data: rowsWithIds });
          };

          const result: any = {
            returning: () => {
              doInsert();
              return Promise.resolve(rowsWithIds);
            },
            onConflictDoNothing: (opts?: any) => {
              const conflictCols = getConflictCols(opts, null);
              const wrapper: any = {
                returning: () => {
                  const rows = getRows(name);
                  const inserted: MockRow[] = [];
                  for (const r of rowsWithIds) {
                    const exists = rows.some((e) => hasConflict(e, r, conflictCols));
                    if (!exists) {
                      rows.push(r);
                      inserted.push(r);
                    }
                  }
                  operations.push({ op: "insert-no-conflict", table: name, data: inserted });
                  return Promise.resolve(inserted);
                },
              };
              wrapper.then = (resolve: any, reject: any) => {
                const rows = getRows(name);
                for (const r of rowsWithIds) {
                  const exists = rows.some((e) => hasConflict(e, r, conflictCols));
                  if (!exists) rows.push(r);
                }
                operations.push({ op: "insert-no-conflict", table: name, data: rowsWithIds });
                return Promise.resolve(undefined).then(resolve, reject);
              };
              return wrapper;
            },
            onConflictDoUpdate: (opts: any) => ({
              returning: () => {
                const rows = getRows(name);
                const conflictCols = getConflictCols(opts, null);
                const results: MockRow[] = [];
                for (const r of rowsWithIds) {
                  const existingIdx = rows.findIndex((e) => hasConflict(e, r, conflictCols));
                  if (existingIdx >= 0) {
                    // On conflict: apply opts.set to existing row (preserve existing id)
                    const updated = { ...rows[existingIdx], ...opts.set };
                    rows[existingIdx] = updated;
                    results.push(updated);
                    operations.push({ op: "upsert-update", table: name, data: updated });
                  } else {
                    rows.push(r);
                    results.push(r);
                    operations.push({ op: "upsert-insert", table: name, data: r });
                  }
                }
                return Promise.resolve(results);
              },
            }),
          };

          result.then = (resolve: any, reject: any) => {
            doInsert();
            return Promise.resolve(undefined).then(resolve, reject);
          };

          return result;
        },
      };
    },
    update: (table: any) => {
      const name = getTableName(table);
      return {
        set: (data: any) => ({
          where: (expr: any) => {
            const rows = getRows(name);
            const matching = filterRows(rows, expr);
            for (const match of matching) {
              const idx = rows.indexOf(match);
              if (idx >= 0) {
                rows[idx] = { ...match, ...data };
              }
            }
            operations.push({ op: "update", table: name, data, count: matching.length });
            return Promise.resolve(undefined);
          },
        }),
      };
    },
    delete: (table: any) => ({
      where: () => Promise.resolve(undefined),
    }),
  };

  return { db: mockDb as DbClient, tables, operations };
}

// ---------------------------------------------------------------------------
// seedDomain
// ---------------------------------------------------------------------------

describe("seedDomain", () => {
  const tierBases: Record<number, number> = { 1: 0.3 };

  function makeSeedData(overrides: Partial<SeedData> = {}): SeedData {
    return {
      domain: {
        name: "Test Domain",
        tier: 1,
        description: "Test description",
        prerequisites: [],
        displayOrder: 1,
      },
      topics: [
        { name: "Topic A", complexityWeight: 1.0, displayOrder: 1 },
      ],
      nodes: [
        {
          topicName: "Topic A",
          concept: "Concept 1",
          questionTemplates: [
            { type: "recognition", prompt: "What?", correctAnswer: "A", explanation: "Because" },
          ],
        },
      ],
      ...overrides,
    };
  }

  it("creates new topics and nodes on first seed", async () => {
    const { db, tables } = createSeedMockDb({
      domains: [],
      topics: [],
      nodes: [],
    });
    const topicMap = new Map();

    const result = await seedDomain(db, "test-tree", "test", makeSeedData(), tierBases, topicMap);

    expect(result.created).toBe(1);
    expect(result.updated).toBe(0);
    expect(result.retired).toBe(0);
    expect(result.domainRow).toBeDefined();
    expect(result.domainRow.name).toBe("Test Domain");
    // Topic was registered in the map
    expect(topicMap.has("test:Topic A")).toBe(true);
  });

  it("updates existing nodes on re-seed (incremental)", async () => {
    const existingDomain = {
      id: "domain-1",
      skilltreeId: "test-tree",
      name: "Test Domain",
      tier: 1,
      description: "Test description",
      prerequisites: [],
      displayOrder: 1,
    };
    const existingTopic = {
      id: "topic-1",
      domainId: "domain-1",
      name: "Topic A",
      complexityWeight: 1.0,
      displayOrder: 1,
      retiredAt: null,
    };
    const existingNode = {
      id: "node-1",
      domainId: "domain-1",
      topicId: "topic-1",
      concept: "Concept 1",
      difficulty: 0.3,
      questionTemplates: [
        { type: "recognition", prompt: "Old prompt", correctAnswer: "A", explanation: "E" },
      ],
      retiredAt: null,
    };

    const { db, tables } = createSeedMockDb({
      domains: [existingDomain],
      topics: [existingTopic],
      nodes: [existingNode],
    });
    const topicMap = new Map();

    const seedData = makeSeedData({
      nodes: [{
        topicName: "Topic A",
        concept: "Concept 1",
        questionTemplates: [
          { type: "recognition", prompt: "New prompt", correctAnswer: "A", explanation: "E" },
          { type: "cued_recall", prompt: "Recall?", correctAnswer: "B", explanation: "E" },
        ],
      }],
    });

    const result = await seedDomain(db, "test-tree", "test", seedData, tierBases, topicMap);

    expect(result.created).toBe(0);
    expect(result.updated).toBe(1);
    // Verify template merging: old recognition preserved, new cued_recall appended
    const updatedNode = tables.nodes.find((n: any) => n.id === "node-1")!;
    expect(updatedNode.questionTemplates).toHaveLength(2);
    expect(updatedNode.questionTemplates[0].prompt).toBe("Old prompt"); // preserved
    expect(updatedNode.questionTemplates[1].type).toBe("cued_recall"); // appended
  });

  it("retires nodes removed from YAML", async () => {
    const existingDomain = {
      id: "domain-1",
      skilltreeId: "test-tree",
      name: "Test Domain",
      tier: 1,
      description: "Test description",
      prerequisites: [],
      displayOrder: 1,
    };
    const existingTopic = {
      id: "topic-1",
      domainId: "domain-1",
      name: "Topic A",
      complexityWeight: 1.0,
      displayOrder: 1,
      retiredAt: null,
    };
    const keepNode = {
      id: "node-keep",
      domainId: "domain-1",
      topicId: "topic-1",
      concept: "Concept 1",
      difficulty: 0.3,
      questionTemplates: [],
      retiredAt: null,
    };
    const removeNode = {
      id: "node-remove",
      domainId: "domain-1",
      topicId: "topic-1",
      concept: "Old Concept",
      difficulty: 0.3,
      questionTemplates: [],
      retiredAt: null,
    };

    const { db, tables } = createSeedMockDb({
      domains: [existingDomain],
      topics: [existingTopic],
      nodes: [keepNode, removeNode],
    });
    const topicMap = new Map();

    // Seed with only "Concept 1" — "Old Concept" should be retired
    const result = await seedDomain(db, "test-tree", "test", makeSeedData(), tierBases, topicMap);

    expect(result.retired).toBeGreaterThan(0);
    const retiredNode = tables.nodes.find((n: any) => n.id === "node-remove")!;
    expect(retiredNode.retiredAt).not.toBeNull();
    // Kept node should still be active
    const keptNode = tables.nodes.find((n: any) => n.id === "node-keep")!;
    expect(keptNode.retiredAt).toBeNull();
  });

  it("retires topics removed from YAML (and their nodes)", async () => {
    const existingDomain = {
      id: "domain-1",
      skilltreeId: "test-tree",
      name: "Test Domain",
      tier: 1,
      description: "Test description",
      prerequisites: [],
      displayOrder: 1,
    };
    const keepTopic = {
      id: "topic-keep",
      domainId: "domain-1",
      name: "Topic A",
      complexityWeight: 1.0,
      displayOrder: 1,
      retiredAt: null,
    };
    const removeTopic = {
      id: "topic-remove",
      domainId: "domain-1",
      name: "Old Topic",
      complexityWeight: 1.0,
      displayOrder: 2,
      retiredAt: null,
    };
    const nodeUnderRemovedTopic = {
      id: "node-cascade",
      domainId: "domain-1",
      topicId: "topic-remove",
      concept: "Orphan Concept",
      difficulty: 0.3,
      questionTemplates: [],
      retiredAt: null,
    };

    const { db, tables } = createSeedMockDb({
      domains: [existingDomain],
      topics: [keepTopic, removeTopic],
      nodes: [nodeUnderRemovedTopic],
    });
    const topicMap = new Map();

    // Seed with only "Topic A" — "Old Topic" should be retired
    const result = await seedDomain(db, "test-tree", "test", makeSeedData(), tierBases, topicMap);

    expect(result.retired).toBeGreaterThan(0);
    const retiredTopic = tables.topics.find((t: any) => t.id === "topic-remove")!;
    expect(retiredTopic.retiredAt).not.toBeNull();
    // Node under retired topic should also be retired
    const cascadeNode = tables.nodes.find((n: any) => n.id === "node-cascade")!;
    expect(cascadeNode.retiredAt).not.toBeNull();
  });

  it("does not re-retire already-retired content", async () => {
    const existingDomain = {
      id: "domain-1",
      skilltreeId: "test-tree",
      name: "Test Domain",
      tier: 1,
      description: "Test description",
      prerequisites: [],
      displayOrder: 1,
    };
    const activeTopic = {
      id: "topic-1",
      domainId: "domain-1",
      name: "Topic A",
      complexityWeight: 1.0,
      displayOrder: 1,
      retiredAt: null,
    };
    const alreadyRetiredTopic = {
      id: "topic-old",
      domainId: "domain-1",
      name: "Ancient Topic",
      complexityWeight: 1.0,
      displayOrder: 2,
      retiredAt: new Date("2025-01-01"), // already retired
    };

    const { db, tables } = createSeedMockDb({
      domains: [existingDomain],
      topics: [activeTopic, alreadyRetiredTopic],
      nodes: [],
    });
    const topicMap = new Map();

    const result = await seedDomain(db, "test-tree", "test", makeSeedData(), tierBases, topicMap);

    // retired count should be 0 — "Ancient Topic" was already retired
    expect(result.retired).toBe(0);
    // The already-retired topic retiredAt should be unchanged
    const oldTopic = tables.topics.find((t: any) => t.id === "topic-old")!;
    expect(oldTopic.retiredAt).toEqual(new Date("2025-01-01"));
  });

  it("warns and skips nodes with missing topics", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { db, tables } = createSeedMockDb({
      domains: [],
      topics: [],
      nodes: [],
    });
    const topicMap = new Map();

    const seedData = makeSeedData({
      topics: [{ name: "Topic A", complexityWeight: 1.0, displayOrder: 1 }],
      nodes: [
        {
          topicName: "Topic A",
          concept: "Valid Concept",
          questionTemplates: [{ type: "recognition", prompt: "Q", correctAnswer: "A", explanation: "E" }],
        },
        {
          topicName: "Nonexistent Topic",
          concept: "Orphan Concept",
          questionTemplates: [{ type: "recognition", prompt: "Q", correctAnswer: "A", explanation: "E" }],
        },
      ],
    });

    const result = await seedDomain(db, "test-tree", "test", seedData, tierBases, topicMap);

    expect(result.created).toBe(1); // only the valid node
    expect(warnSpy).toHaveBeenCalledWith("Topic not found: test:Nonexistent Topic");
    warnSpy.mockRestore();
  });

  it("adds new nodes alongside existing ones on re-seed", async () => {
    const existingDomain = {
      id: "domain-1",
      skilltreeId: "test-tree",
      name: "Test Domain",
      tier: 1,
      description: "Test description",
      prerequisites: [],
      displayOrder: 1,
    };
    const existingTopic = {
      id: "topic-1",
      domainId: "domain-1",
      name: "Topic A",
      complexityWeight: 1.0,
      displayOrder: 1,
      retiredAt: null,
    };
    const existingNode = {
      id: "node-1",
      domainId: "domain-1",
      topicId: "topic-1",
      concept: "Concept 1",
      difficulty: 0.3,
      questionTemplates: [
        { type: "recognition", prompt: "Old", correctAnswer: "A", explanation: "E" },
      ],
      retiredAt: null,
    };

    const { db, tables } = createSeedMockDb({
      domains: [existingDomain],
      topics: [existingTopic],
      nodes: [existingNode],
    });
    const topicMap = new Map();

    const seedData = makeSeedData({
      nodes: [
        {
          topicName: "Topic A",
          concept: "Concept 1",
          questionTemplates: [
            { type: "recognition", prompt: "Old", correctAnswer: "A", explanation: "E" },
          ],
        },
        {
          topicName: "Topic A",
          concept: "Brand New Concept",
          questionTemplates: [
            { type: "recognition", prompt: "New Q", correctAnswer: "B", explanation: "E" },
          ],
        },
      ],
    });

    const result = await seedDomain(db, "test-tree", "test", seedData, tierBases, topicMap);

    expect(result.created).toBe(1); // "Brand New Concept" created
    expect(result.updated).toBe(1); // "Concept 1" updated
    expect(tables.nodes.some((n: any) => n.concept === "Brand New Concept")).toBe(true);
  });

  it("updates topic complexityWeight and displayOrder on re-seed", async () => {
    const existingDomain = {
      id: "domain-1",
      skilltreeId: "test-tree",
      name: "Test Domain",
      tier: 1,
      description: "Test description",
      prerequisites: [],
      displayOrder: 1,
    };
    const existingTopic = {
      id: "topic-1",
      domainId: "domain-1",
      name: "Topic A",
      complexityWeight: 1.0,
      displayOrder: 1,
      retiredAt: null,
    };

    const { db, tables } = createSeedMockDb({
      domains: [existingDomain],
      topics: [existingTopic],
      nodes: [],
    });
    const topicMap = new Map();

    const seedData = makeSeedData({
      topics: [{ name: "Topic A", complexityWeight: 2.5, displayOrder: 3 }],
      nodes: [],
    });

    await seedDomain(db, "test-tree", "test", seedData, tierBases, topicMap);

    const topic = tables.topics.find((t: any) => t.id === "topic-1")!;
    expect(topic.complexityWeight).toBe(2.5);
    expect(topic.displayOrder).toBe(3);
  });

  it("recalculates node difficulty on re-seed based on tier and weight", async () => {
    const existingDomain = {
      id: "domain-1",
      skilltreeId: "test-tree",
      name: "Test Domain",
      tier: 1,
      description: "Test description",
      prerequisites: [],
      displayOrder: 1,
    };
    const existingTopic = {
      id: "topic-1",
      domainId: "domain-1",
      name: "Topic A",
      complexityWeight: 1.0,
      displayOrder: 1,
      retiredAt: null,
    };
    const existingNode = {
      id: "node-1",
      domainId: "domain-1",
      topicId: "topic-1",
      concept: "Concept 1",
      difficulty: 0.3, // old difficulty with weight 1.0
      questionTemplates: [],
      retiredAt: null,
    };

    const { db, tables } = createSeedMockDb({
      domains: [existingDomain],
      topics: [existingTopic],
      nodes: [existingNode],
    });
    const topicMap = new Map();

    // Change complexity weight to 2.0 → difficulty = 0.3 + (2.0 - 1.0) * 2 = 2.3
    const seedData = makeSeedData({
      topics: [{ name: "Topic A", complexityWeight: 2.0, displayOrder: 1 }],
      nodes: [{
        topicName: "Topic A",
        concept: "Concept 1",
        questionTemplates: [],
      }],
    });

    await seedDomain(db, "test-tree", "test", seedData, tierBases, topicMap);

    const node = tables.nodes.find((n: any) => n.id === "node-1")!;
    expect(node.difficulty).toBeCloseTo(2.3);
  });

  it("reactivates previously retired content if it reappears in YAML", async () => {
    const existingDomain = {
      id: "domain-1",
      skilltreeId: "test-tree",
      name: "Test Domain",
      tier: 1,
      description: "Test description",
      prerequisites: [],
      displayOrder: 1,
    };
    // Topic that was retired but is back in YAML
    const retiredTopic = {
      id: "topic-1",
      domainId: "domain-1",
      name: "Topic A",
      complexityWeight: 1.0,
      displayOrder: 1,
      retiredAt: new Date("2025-06-01"),
    };
    // Node that was retired but is back in YAML
    const retiredNode = {
      id: "node-1",
      domainId: "domain-1",
      topicId: "topic-1",
      concept: "Concept 1",
      difficulty: 0.3,
      questionTemplates: [],
      retiredAt: new Date("2025-06-01"),
    };

    const { db, tables } = createSeedMockDb({
      domains: [existingDomain],
      topics: [retiredTopic],
      nodes: [retiredNode],
    });
    const topicMap = new Map();

    await seedDomain(db, "test-tree", "test", makeSeedData(), tierBases, topicMap);

    // Topic should be reactivated (retiredAt cleared by upsert)
    const topic = tables.topics.find((t: any) => t.id === "topic-1")!;
    expect(topic.retiredAt).toBeNull();
    // Node should be reactivated (retiredAt cleared by update)
    const node = tables.nodes.find((n: any) => n.id === "node-1")!;
    expect(node.retiredAt).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// updateTemplatesForSkillTree
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// seedSkillTree
// ---------------------------------------------------------------------------

describe("seedSkillTree", () => {
  function makeSkillTreeDef(overrides: Partial<SkillTreeDef> = {}): SkillTreeDef {
    return {
      id: "test-tree",
      name: "Test Tree",
      tierBases: { 1: 0.3, 2: 1.0 },
      domains: [
        {
          prefix: "dom-a",
          domain: { name: "Domain A", tier: 1, description: "Desc A", prerequisites: [], displayOrder: 1 },
          topics: [{ name: "Topic A1", complexityWeight: 1.0, displayOrder: 1 }],
          nodes: [{
            topicName: "Topic A1",
            concept: "Concept A1",
            questionTemplates: [{ type: "recognition", prompt: "Q", correctAnswer: "A", explanation: "E" }],
          }],
        },
      ],
      prerequisites: {},
      placeholderDomains: [],
      ...overrides,
    };
  }

  it("upserts the skilltree record", async () => {
    const { db, tables } = createSeedMockDb({
      skilltrees: [],
      domains: [],
      topics: [],
      nodes: [],
    });

    await seedSkillTree(db, makeSkillTreeDef());

    expect(tables.skilltrees).toHaveLength(1);
    expect(tables.skilltrees[0].id).toBe("test-tree");
    expect(tables.skilltrees[0].name).toBe("Test Tree");
  });

  it("is idempotent — re-running does not duplicate the skilltree record", async () => {
    const { db, tables } = createSeedMockDb({
      skilltrees: [],
      domains: [],
      topics: [],
      nodes: [],
    });

    const def = makeSkillTreeDef();
    await seedSkillTree(db, def);
    await seedSkillTree(db, def);

    expect(tables.skilltrees).toHaveLength(1);
  });

  it("processes multiple domains", async () => {
    const { db, tables } = createSeedMockDb({
      skilltrees: [],
      domains: [],
      topics: [],
      nodes: [],
    });

    const def = makeSkillTreeDef({
      domains: [
        {
          prefix: "dom-a",
          domain: { name: "Domain A", tier: 1, description: "Desc A", prerequisites: [], displayOrder: 1 },
          topics: [{ name: "Topic A1", complexityWeight: 1.0, displayOrder: 1 }],
          nodes: [{
            topicName: "Topic A1",
            concept: "Concept A1",
            questionTemplates: [{ type: "recognition", prompt: "Q", correctAnswer: "A", explanation: "E" }],
          }],
        },
        {
          prefix: "dom-b",
          domain: { name: "Domain B", tier: 2, description: "Desc B", prerequisites: [], displayOrder: 2 },
          topics: [{ name: "Topic B1", complexityWeight: 1.5, displayOrder: 1 }],
          nodes: [{
            topicName: "Topic B1",
            concept: "Concept B1",
            questionTemplates: [{ type: "cued_recall", prompt: "Q2", correctAnswer: "B", explanation: "E" }],
          }],
        },
      ],
    });

    await seedSkillTree(db, def);

    expect(tables.domains).toHaveLength(2);
    expect(tables.domains.map((d: any) => d.name).sort()).toEqual(["Domain A", "Domain B"]);
    expect(tables.topics).toHaveLength(2);
    expect(tables.nodes).toHaveLength(2);
  });

  it("sets prerequisites by domain name", async () => {
    const { db, tables } = createSeedMockDb({
      skilltrees: [],
      domains: [],
      topics: [],
      nodes: [],
    });

    const def = makeSkillTreeDef({
      domains: [
        {
          prefix: "dom-a",
          domain: { name: "Domain A", tier: 1, description: "A", prerequisites: [], displayOrder: 1 },
          topics: [{ name: "TA", complexityWeight: 1.0, displayOrder: 1 }],
          nodes: [{ topicName: "TA", concept: "CA", questionTemplates: [] }],
        },
        {
          prefix: "dom-b",
          domain: { name: "Domain B", tier: 2, description: "B", prerequisites: [], displayOrder: 2 },
          topics: [{ name: "TB", complexityWeight: 1.0, displayOrder: 1 }],
          nodes: [{ topicName: "TB", concept: "CB", questionTemplates: [] }],
        },
      ],
      prerequisites: {
        "Domain B": ["Domain A"],
      },
    });

    await seedSkillTree(db, def);

    const domainB = tables.domains.find((d: any) => d.name === "Domain B")!;
    expect(domainB.prerequisites).toEqual(["Domain A"]);
  });

  it("skips prerequisite entries for unknown domain names", async () => {
    const { db, tables } = createSeedMockDb({
      skilltrees: [],
      domains: [],
      topics: [],
      nodes: [],
    });

    const def = makeSkillTreeDef({
      prerequisites: {
        "Nonexistent Domain": ["Domain A"],
      },
    });

    // Should not throw
    await seedSkillTree(db, def);

    // Domain A should have no prerequisites set by this code path
    const domainA = tables.domains.find((d: any) => d.name === "Domain A")!;
    expect(domainA.prerequisites).toEqual([]);
  });

  it("seeds placeholder domains", async () => {
    const { db, tables } = createSeedMockDb({
      skilltrees: [],
      domains: [],
      topics: [],
      nodes: [],
    });

    const def = makeSkillTreeDef({
      placeholderDomains: [
        { name: "Coming Soon", tier: 3, description: "Placeholder", displayOrder: 10 },
        { name: "Future Domain", tier: 4, description: "Also placeholder", displayOrder: 11 },
      ],
    });

    await seedSkillTree(db, def);

    const placeholders = tables.domains.filter((d: any) =>
      ["Coming Soon", "Future Domain"].includes(d.name),
    );
    expect(placeholders).toHaveLength(2);
  });

  it("does not duplicate placeholder domains on re-run", async () => {
    const { db, tables } = createSeedMockDb({
      skilltrees: [],
      domains: [],
      topics: [],
      nodes: [],
    });

    const def = makeSkillTreeDef({
      placeholderDomains: [
        { name: "Coming Soon", tier: 3, description: "Placeholder", displayOrder: 10 },
      ],
    });

    await seedSkillTree(db, def);
    await seedSkillTree(db, def);

    const placeholders = tables.domains.filter((d: any) => d.name === "Coming Soon");
    expect(placeholders).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// updateTemplatesForSkillTree
// ---------------------------------------------------------------------------

describe("updateTemplatesForSkillTree", () => {
  it("scopes domain lookup by skilltreeId (regression)", async () => {
    // Two domains with the same name but different skill trees
    const domainA = {
      id: "domain-a",
      skilltreeId: "tree-a",
      name: "Security",
      tier: 1,
      description: "A",
      prerequisites: [],
      displayOrder: 1,
    };
    const domainB = {
      id: "domain-b",
      skilltreeId: "tree-b",
      name: "Security",
      tier: 1,
      description: "B",
      prerequisites: [],
      displayOrder: 1,
    };
    const nodeA = {
      id: "node-a",
      domainId: "domain-a",
      topicId: "topic-1",
      concept: "CIA Triad",
      difficulty: 0.3,
      questionTemplates: [
        { type: "recognition", prompt: "Old A", correctAnswer: "a", explanation: "e" },
      ],
      retiredAt: null,
    };
    const nodeB = {
      id: "node-b",
      domainId: "domain-b",
      topicId: "topic-2",
      concept: "CIA Triad",
      difficulty: 0.3,
      questionTemplates: [
        { type: "recognition", prompt: "Old B", correctAnswer: "b", explanation: "e" },
      ],
      retiredAt: null,
    };

    const { db, tables } = createSeedMockDb({
      domains: [domainA, domainB],
      nodes: [nodeA, nodeB],
    });

    const skilltree: SkillTreeDef = {
      id: "tree-a",
      name: "Tree A",
      tierBases: { 1: 0.3 },
      domains: [{
        prefix: "sec",
        domain: { name: "Security", tier: 1, description: "A", prerequisites: [], displayOrder: 1 },
        topics: [],
        nodes: [{
          topicName: "Topic",
          concept: "CIA Triad",
          questionTemplates: [
            { type: "cued_recall", prompt: "New cued", correctAnswer: "c", explanation: "e" },
          ],
        }],
      }],
      prerequisites: {},
      placeholderDomains: [],
    };

    await updateTemplatesForSkillTree(db, skilltree);

    // Node A (tree-a) should get the new template
    const updatedNodeA = tables.nodes.find((n: any) => n.id === "node-a")!;
    expect(updatedNodeA.questionTemplates).toHaveLength(2);
    expect(updatedNodeA.questionTemplates[1].type).toBe("cued_recall");

    // Node B (tree-b) should be untouched
    const unchangedNodeB = tables.nodes.find((n: any) => n.id === "node-b")!;
    expect(unchangedNodeB.questionTemplates).toHaveLength(1);
    expect(unchangedNodeB.questionTemplates[0].type).toBe("recognition");
  });

  it("skips domains not found in the database", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const { db } = createSeedMockDb({
      domains: [], // no domains at all
      nodes: [],
    });

    const skilltree: SkillTreeDef = {
      id: "tree-x",
      name: "Tree X",
      tierBases: { 1: 0.3 },
      domains: [{
        prefix: "sec",
        domain: { name: "Missing Domain", tier: 1, description: "D", prerequisites: [], displayOrder: 1 },
        topics: [],
        nodes: [{
          topicName: "T",
          concept: "C",
          questionTemplates: [{ type: "recognition", prompt: "P", correctAnswer: "A", explanation: "E" }],
        }],
      }],
      prerequisites: {},
      placeholderDomains: [],
    };

    await updateTemplatesForSkillTree(db, skilltree);

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Missing Domain"));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("not found"));
    logSpy.mockRestore();
  });

  it("skips seed nodes whose concept is not in the database", async () => {
    const domain = {
      id: "domain-1",
      skilltreeId: "tree-a",
      name: "Security",
      tier: 1,
      description: "D",
      prerequisites: [],
      displayOrder: 1,
    };
    // No nodes in DB at all
    const { db, tables } = createSeedMockDb({
      domains: [domain],
      nodes: [],
    });

    const skilltree: SkillTreeDef = {
      id: "tree-a",
      name: "Tree A",
      tierBases: { 1: 0.3 },
      domains: [{
        prefix: "sec",
        domain: { name: "Security", tier: 1, description: "D", prerequisites: [], displayOrder: 1 },
        topics: [],
        nodes: [{
          topicName: "T",
          concept: "Unknown Concept",
          questionTemplates: [{ type: "cued_recall", prompt: "Q", correctAnswer: "A", explanation: "E" }],
        }],
      }],
      prerequisites: {},
      placeholderDomains: [],
    };

    await updateTemplatesForSkillTree(db, skilltree);

    // No nodes should have been updated (still empty)
    expect(tables.nodes).toHaveLength(0);
  });

  it("skips nodes when all seed template types already exist", async () => {
    const domain = {
      id: "domain-1",
      skilltreeId: "tree-a",
      name: "Security",
      tier: 1,
      description: "D",
      prerequisites: [],
      displayOrder: 1,
    };
    const node = {
      id: "node-1",
      domainId: "domain-1",
      topicId: "topic-1",
      concept: "CIA Triad",
      difficulty: 0.3,
      questionTemplates: [
        { type: "recognition", prompt: "Existing", correctAnswer: "A", explanation: "E" },
        { type: "cued_recall", prompt: "Also existing", correctAnswer: "B", explanation: "E" },
      ],
      retiredAt: null,
    };

    const { db, tables } = createSeedMockDb({
      domains: [domain],
      nodes: [node],
    });

    const skilltree: SkillTreeDef = {
      id: "tree-a",
      name: "Tree A",
      tierBases: { 1: 0.3 },
      domains: [{
        prefix: "sec",
        domain: { name: "Security", tier: 1, description: "D", prerequisites: [], displayOrder: 1 },
        topics: [],
        nodes: [{
          topicName: "T",
          concept: "CIA Triad",
          questionTemplates: [
            { type: "recognition", prompt: "Different prompt", correctAnswer: "A", explanation: "E" },
            { type: "cued_recall", prompt: "Different prompt 2", correctAnswer: "B", explanation: "E" },
          ],
        }],
      }],
      prerequisites: {},
      placeholderDomains: [],
    };

    await updateTemplatesForSkillTree(db, skilltree);

    // Templates should be unchanged — both types already existed
    const updatedNode = tables.nodes.find((n: any) => n.id === "node-1")!;
    expect(updatedNode.questionTemplates).toHaveLength(2);
    expect(updatedNode.questionTemplates[0].prompt).toBe("Existing"); // not replaced
    expect(updatedNode.questionTemplates[1].prompt).toBe("Also existing"); // not replaced
  });
});
