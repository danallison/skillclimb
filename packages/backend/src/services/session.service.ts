import { eq } from "drizzle-orm";
import { db } from "../db/connection.js";
import { learnerNodes, nodes as nodesTable, sessions, domains as domainsTable } from "../db/schema.js";
import { buildSession, DEFAULT_SESSION_CONFIG } from "@cyberclimb/core";
import type { LearnerNodeState, Node, QuestionTemplate, SessionResult } from "@cyberclimb/core";

function dbRowToLearnerState(row: typeof learnerNodes.$inferSelect): LearnerNodeState {
  return {
    userId: row.userId,
    nodeId: row.nodeId,
    domainId: row.domainId,
    easiness: row.easiness,
    interval: row.interval,
    repetitions: row.repetitions,
    dueDate: row.dueDate,
    confidenceHistory: (row.confidenceHistory ?? []).map((e) => ({
      confidence: e.confidence,
      wasCorrect: e.wasCorrect,
      timestamp: new Date(e.timestamp),
    })),
    domainWeight: row.domainWeight,
  };
}

function dbRowToNode(row: typeof nodesTable.$inferSelect): Node {
  return {
    id: row.id,
    topicId: row.topicId,
    domainId: row.domainId,
    concept: row.concept,
    questionTemplates: (row.questionTemplates ?? []) as QuestionTemplate[],
  };
}

export interface SessionWithItems {
  id: string;
  userId: string;
  startedAt: Date;
  items: SessionResult["items"];
  totalItems: number;
}

export async function createSession(userId: string): Promise<SessionWithItems> {
  const now = new Date();

  // 1. READ all learner nodes for this user
  const learnerRows = await db.select().from(learnerNodes).where(eq(learnerNodes.userId, userId));

  // 2. READ corresponding nodes
  const nodeIds = learnerRows.map((r) => r.nodeId);
  let nodeRows: (typeof nodesTable.$inferSelect)[] = [];
  if (nodeIds.length > 0) {
    nodeRows = await db.select().from(nodesTable);
    nodeRows = nodeRows.filter((n) => nodeIds.includes(n.id));
  }

  const states = learnerRows.map(dbRowToLearnerState);
  const nodeList = nodeRows.map(dbRowToNode);

  // 3. Build session (pure)
  const sessionResult = buildSession(DEFAULT_SESSION_CONFIG, states, nodeList, now);

  // 4. WRITE session record
  const sessionNodeIds = sessionResult.items.map((item) => item.node.id);
  const [session] = await db
    .insert(sessions)
    .values({
      userId,
      itemCount: sessionResult.totalItems,
      nodeIds: sessionNodeIds,
      analytics: {},
    })
    .returning();

  return {
    id: session.id,
    userId: session.userId,
    startedAt: session.startedAt,
    items: sessionResult.items,
    totalItems: sessionResult.totalItems,
  };
}

export async function getSession(sessionId: string): Promise<SessionWithItems | null> {
  const [session] = await db.select().from(sessions).where(eq(sessions.id, sessionId));
  if (!session) return null;

  const nodeIds = session.nodeIds as string[];
  let nodeRows: (typeof nodesTable.$inferSelect)[] = [];
  if (nodeIds.length > 0) {
    const allNodes = await db.select().from(nodesTable);
    nodeRows = allNodes.filter((n) => nodeIds.includes(n.id));
  }

  const learnerRows = await db
    .select()
    .from(learnerNodes)
    .where(eq(learnerNodes.userId, session.userId));

  const learnerMap = new Map(learnerRows.map((r) => [r.nodeId, dbRowToLearnerState(r)]));

  const items = nodeRows.map((nodeRow) => {
    const node = dbRowToNode(nodeRow);
    const state = learnerMap.get(node.id)!;
    const template = node.questionTemplates.find((t) => t.type === "recognition") ?? node.questionTemplates[0];
    return {
      node,
      learnerState: state,
      questionTemplate: template,
      priority: 0,
    };
  });

  return {
    id: session.id,
    userId: session.userId,
    startedAt: session.startedAt,
    items,
    totalItems: session.itemCount,
  };
}
