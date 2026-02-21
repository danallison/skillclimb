import express from "express";
import cookieParser from "cookie-parser";
import { Layer, Effect, Context } from "effect";
import { Database } from "../../services/Database.js";
import { AIService, type AIServiceShape } from "../../services/AIService.js";
import { AIRequestError } from "../../errors.js";
import { createEffectHandler } from "../../effectHandler.js";
import { requireAuth } from "../../middleware/auth.js";
import { createAccessToken } from "../../services/auth.service.js";
import { skilltreesRouter } from "../skilltrees.js";
import { domainsRouter } from "../domains.js";
import { reviewsRouter } from "../reviews.js";
import { sessionsRouter } from "../sessions.js";
import { hintsRouter } from "../hints.js";
import { lessonsRouter } from "../lessons.js";
import * as schema from "../../db/schema.js";

// ---------------------------------------------------------------------------
// Fixture factories
// ---------------------------------------------------------------------------

let counter = 0;
function nextId() {
  counter++;
  return `00000000-0000-0000-0000-${String(counter).padStart(12, "0")}`;
}

export function resetIdCounter() {
  counter = 0;
}

export function makeUser(overrides: Partial<typeof schema.users.$inferSelect> = {}) {
  return {
    id: nextId(),
    email: `user${counter}@test.com`,
    name: `Test User ${counter}`,
    createdAt: new Date(),
    ...overrides,
  };
}

export function makeSkilltree(overrides: Partial<typeof schema.skilltrees.$inferSelect> = {}) {
  return {
    id: `skilltree-${counter + 1}`,
    name: `Skill Tree ${counter + 1}`,
    createdAt: new Date(),
    ...nextId() && {},  // increment counter
    ...overrides,
  };
}

export function makeDomain(overrides: Partial<typeof schema.domains.$inferSelect> = {}) {
  return {
    id: nextId(),
    skilltreeId: "cybersecurity",
    tier: 1,
    name: `Domain ${counter}`,
    description: `Description for domain ${counter}`,
    prerequisites: [] as string[],
    displayOrder: counter,
    ...overrides,
  };
}

export function makeTopic(overrides: Partial<typeof schema.topics.$inferSelect> = {}) {
  const domainId = overrides.domainId ?? nextId();
  return {
    id: nextId(),
    domainId,
    name: `Topic ${counter}`,
    complexityWeight: 1.0,
    displayOrder: counter,
    ...overrides,
  };
}

export function makeNode(
  overrides: Partial<typeof schema.nodes.$inferSelect> = {},
) {
  const domainId = overrides.domainId ?? "domain-1";
  const topicId = overrides.topicId ?? "topic-1";
  return {
    id: nextId(),
    topicId,
    domainId,
    concept: `Concept ${counter}`,
    difficulty: 0,
    questionTemplates: [] as any[],
    ...overrides,
  };
}

export function makeLearnerNode(
  overrides: Partial<typeof schema.learnerNodes.$inferSelect> = {},
) {
  return {
    userId: "user-1",
    nodeId: nextId(),
    domainId: "domain-1",
    easiness: 2.5,
    interval: 0,
    repetitions: 0,
    dueDate: new Date(),
    confidenceHistory: [] as any[],
    domainWeight: 1.0,
    misconceptions: [] as string[],
    ...overrides,
  };
}

export function makeSession(
  overrides: Partial<typeof schema.sessions.$inferSelect> = {},
) {
  return {
    id: nextId(),
    userId: "user-1",
    startedAt: new Date(),
    completedAt: null,
    itemCount: 0,
    nodeIds: [] as string[],
    analytics: {},
    ...overrides,
  };
}

export function makeReview(
  overrides: Partial<typeof schema.reviews.$inferSelect> = {},
) {
  return {
    id: nextId(),
    userId: "user-1",
    nodeId: "node-1",
    score: 4,
    confidence: 3,
    response: "test response",
    createdAt: new Date(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Mock database
// ---------------------------------------------------------------------------

function getTableName(table: any): string {
  // Drizzle tables have a Symbol or underscore-based name
  const sym = Object.getOwnPropertySymbols(table).find(
    (s) => s.toString() === "Symbol(drizzle:Name)",
  );
  if (sym) return table[sym];
  if (table._ && table._.name) return table._.name;
  return "unknown";
}

export interface MockFixtures {
  [tableName: string]: any[];
}

/**
 * Creates a mock DbClient that handles the Drizzle chain patterns used in routes.
 *
 * Supported patterns:
 *   db.select().from(TABLE)                    → fixtures[table]
 *   db.select().from(TABLE).where(...)         → fixtures[table]
 *   db.select().from(TABLE).orderBy(...)       → fixtures[table]
 *   db.insert(TABLE).values(DATA).returning()  → [DATA]  (or fixtures[table])
 *   db.insert(TABLE).values(DATA)              → void
 *   db.update(TABLE).set(DATA).where(...)      → void
 *   db.delete(TABLE).where(...)                → void
 */
export function createMockDb(fixtures: MockFixtures = {}) {
  function getRows(tableName: string) {
    return fixtures[tableName] ?? [];
  }

  const mockDb: any = {
    select: () => ({
      from: (table: any) => {
        const name = getTableName(table);
        const rows = getRows(name);
        // Make the base promise-like AND chainable
        const result = Promise.resolve(rows);
        (result as any).where = () => Promise.resolve(rows);
        (result as any).orderBy = () => {
          const ordered = Promise.resolve(rows);
          (ordered as any).where = () => Promise.resolve(rows);
          return ordered;
        };
        return result;
      },
    }),
    insert: (table: any) => {
      const name = getTableName(table);
      return {
        values: (data: any) => {
          // Store inserted data so returning() can access it
          const insertedRows = Array.isArray(data) ? data : [data];
          const result = Promise.resolve(undefined);
          (result as any).returning = () => {
            // For inserts with returning, return the inserted data merged with defaults
            const rows = getRows(name);
            if (rows.length > 0) return Promise.resolve(rows);
            // Simulate returning the inserted row with an id
            return Promise.resolve(
              insertedRows.map((row: any) => ({
                id: nextId(),
                ...row,
                createdAt: new Date(),
                startedAt: new Date(),
              })),
            );
          };
          (result as any).onConflictDoNothing = () => result;
          return result;
        },
      };
    },
    update: (table: any) => ({
      set: (data: any) => ({
        where: () => Promise.resolve(undefined),
      }),
    }),
    delete: (table: any) => ({
      where: () => Promise.resolve(undefined),
    }),
  };

  return mockDb;
}

// ---------------------------------------------------------------------------
// Mock AI service
// ---------------------------------------------------------------------------

function defaultAIService(): AIServiceShape {
  return {
    evaluateFreeRecall: () =>
      Effect.fail(new AIRequestError({ cause: new Error("No API key") })),
    generateHint: () =>
      Effect.fail(new AIRequestError({ cause: new Error("No API key") })),
    generateMicroLesson: () =>
      Effect.fail(new AIRequestError({ cause: new Error("No API key") })),
  };
}

// ---------------------------------------------------------------------------
// Test app builder
// ---------------------------------------------------------------------------

export function createTestApp(
  fixtures: MockFixtures = {},
  aiOverrides: Partial<AIServiceShape> = {},
) {
  const mockDb = createMockDb(fixtures);
  const aiService: AIServiceShape = {
    ...defaultAIService(),
    ...aiOverrides,
  };

  const TestDbLayer = Layer.succeed(Database, mockDb);
  const TestAILayer = Layer.succeed(AIService, aiService);
  const TestAppLayer = Layer.mergeAll(TestDbLayer, TestAILayer);
  const handle = createEffectHandler(TestAppLayer);

  const app = express();
  app.use(express.json());
  app.use(cookieParser());

  // Public routes
  app.use("/api/skilltrees", skilltreesRouter(handle));

  // Protected routes
  app.use("/api", requireAuth);
  app.use("/api/domains", domainsRouter(handle));
  app.use("/api/reviews", reviewsRouter(handle));
  app.use("/api/sessions", sessionsRouter(handle));
  app.use("/api/hints", hintsRouter(handle));
  app.use("/api/lessons", lessonsRouter(handle));

  return app;
}

// ---------------------------------------------------------------------------
// Auth helper
// ---------------------------------------------------------------------------

export async function authCookie(userId: string): Promise<string> {
  const token = await createAccessToken(userId);
  return `access_token=${token}`;
}
