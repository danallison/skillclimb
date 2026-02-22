import { pgTable, uuid, text, integer, real, timestamp, jsonb, primaryKey, unique, boolean } from "drizzle-orm/pg-core";
import type { IRTResponse } from "@skillclimb/core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const oauthAccounts = pgTable("oauth_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  unique().on(table.provider, table.providerAccountId),
]);

export const refreshTokens = pgTable("refresh_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const apiTokens = pgTable("api_tokens", {
  id: uuid("id").primaryKey(), // this IS the jti — no defaultRandom, caller provides it
  userId: uuid("user_id").notNull().references(() => users.id),
  name: text("name"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const skilltrees = pgTable("skilltrees", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const domains = pgTable("domains", {
  id: uuid("id").primaryKey().defaultRandom(),
  skilltreeId: text("skilltree_id").notNull().references(() => skilltrees.id),
  tier: integer("tier").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  prerequisites: jsonb("prerequisites").notNull().$type<string[]>().default([]),
  displayOrder: integer("display_order").notNull(),
}, (table) => [
  unique().on(table.skilltreeId, table.name),
]);

export const topics = pgTable("topics", {
  id: uuid("id").primaryKey().defaultRandom(),
  domainId: uuid("domain_id")
    .notNull()
    .references(() => domains.id),
  name: text("name").notNull(),
  complexityWeight: real("complexity_weight").notNull().default(1.0),
  displayOrder: integer("display_order").notNull(),
});

export const nodes = pgTable("nodes", {
  id: uuid("id").primaryKey().defaultRandom(),
  topicId: uuid("topic_id")
    .notNull()
    .references(() => topics.id),
  domainId: uuid("domain_id")
    .notNull()
    .references(() => domains.id),
  concept: text("concept").notNull(),
  difficulty: real("difficulty").notNull().default(0),
  questionTemplates: jsonb("question_templates")
    .notNull()
    .$type<
      Array<{
        type: string;
        prompt: string;
        choices?: string[];
        correctAnswer: string;
        explanation: string;
        acceptableAnswers?: string[];
        hints?: string[];
        rubric?: string;
        keyPoints?: string[];
        microLesson?: string;
      }>
    >()
    .default([]),
});

export const learnerNodes = pgTable(
  "learner_nodes",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    nodeId: uuid("node_id")
      .notNull()
      .references(() => nodes.id),
    domainId: uuid("domain_id")
      .notNull()
      .references(() => domains.id),
    easiness: real("easiness").notNull().default(2.5),
    interval: integer("interval").notNull().default(0),
    repetitions: integer("repetitions").notNull().default(0),
    dueDate: timestamp("due_date").notNull().defaultNow(),
    confidenceHistory: jsonb("confidence_history")
      .notNull()
      .$type<Array<{ confidence: number; wasCorrect: boolean; timestamp: string }>>()
      .default([]),
    domainWeight: real("domain_weight").notNull().default(1.0),
    misconceptions: jsonb("misconceptions").notNull().$type<string[]>().default([]),
  },
  (table) => [primaryKey({ columns: [table.userId, table.nodeId] })],
);

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  nodeId: uuid("node_id")
    .notNull()
    .references(() => nodes.id),
  score: integer("score").notNull(),
  confidence: integer("confidence").notNull(),
  response: text("response").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const studyDays = pgTable(
  "study_days",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    date: text("date").notNull(), // YYYY-MM-DD (UTC)
    reviewCount: integer("review_count").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.date] })],
);

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  itemCount: integer("item_count").notNull().default(0),
  nodeIds: jsonb("node_ids").notNull().$type<string[]>().default([]),
  analytics: jsonb("analytics")
    .notNull()
    .$type<{
      totalCorrect?: number;
      totalIncorrect?: number;
      calibration?: Record<string, number>;
    }>()
    .default({}),
});

export const userAiProviders = pgTable("user_ai_providers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id).unique(),
  webhookUrl: text("webhook_url").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  secret: text("secret"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export interface PlacementResultRow {
  globalTheta: number;
  domainThetas: Record<string, number>;
  nodeClassifications: Array<{
    nodeId: string;
    domainId: string;
    classification: string;
    probability: number;
  }>;
}

export const placementTests = pgTable("placement_tests", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  skilltreeId: text("skilltree_id").references(() => skilltrees.id),
  status: text("status").notNull().default("in_progress"),
  currentTheta: real("current_theta").notNull().default(0),
  currentSE: real("current_se").notNull().default(4.0),
  responses: jsonb("responses").notNull().$type<IRTResponse[]>().default([]),
  result: jsonb("result").$type<PlacementResultRow>(),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});
