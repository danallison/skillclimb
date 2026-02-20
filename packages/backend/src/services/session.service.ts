import { Effect } from "effect";
import { eq, inArray } from "drizzle-orm";
import {
  learnerNodes,
  nodes as nodesTable,
  domains,
  sessions,
} from "../db/schema.js";
import { dbRowToLearnerState, dbRowToNode } from "../db/mappers.js";
import { query, Database } from "./Database.js";
import { DatabaseError } from "../errors.js";
import {
  buildSession,
  DEFAULT_SESSION_CONFIG,
  selectQuestionType,
} from "@skillclimb/core";
import type { SessionResult } from "@skillclimb/core";

export interface SessionWithItems {
  id: string;
  userId: string;
  startedAt: Date;
  items: SessionResult["items"];
  totalItems: number;
}

export const createSession = (
  userId: string,
  skilltreeId?: string,
): Effect.Effect<SessionWithItems, DatabaseError, Database> =>
  Effect.gen(function* () {
    const now = new Date();

    // 1. READ all learner nodes for this user
    let learnerRows = yield* query((db) =>
      db.select().from(learnerNodes).where(eq(learnerNodes.userId, userId)),
    );

    // If skilltreeId provided, filter learnerNodes to skill tree's domains
    let skilltreeDomainIds: Set<string> | null = null;
    if (skilltreeId) {
      const stDomains = yield* query((db) =>
        db.select().from(domains).where(eq(domains.skilltreeId, skilltreeId)),
      );
      skilltreeDomainIds = new Set(stDomains.map((d) => d.id));
      learnerRows = learnerRows.filter((r) => skilltreeDomainIds!.has(r.domainId));
    }

    // 2. READ corresponding nodes
    const nodeIds = learnerRows.map((r) => r.nodeId);
    let nodeRows: (typeof nodesTable.$inferSelect)[] = [];
    if (nodeIds.length > 0) {
      nodeRows = yield* query((db) =>
        db.select().from(nodesTable).where(inArray(nodesTable.id, nodeIds)),
      );
    }

    const states = learnerRows.map(dbRowToLearnerState);
    const nodeList = nodeRows.map(dbRowToNode);

    // 3. Build session (pure)
    const sessionResult = buildSession(
      DEFAULT_SESSION_CONFIG,
      states,
      nodeList,
      now,
    );

    // 4. WRITE session record
    const sessionNodeIds = sessionResult.items.map((item) => item.node.id);
    const [session] = yield* query((db) =>
      db
        .insert(sessions)
        .values({
          userId,
          itemCount: sessionResult.totalItems,
          nodeIds: sessionNodeIds,
          analytics: {},
        })
        .returning(),
    );

    return {
      id: session.id,
      userId: session.userId,
      startedAt: session.startedAt,
      items: sessionResult.items,
      totalItems: sessionResult.totalItems,
    };
  });

export const getSession = (
  sessionId: string,
): Effect.Effect<SessionWithItems | null, DatabaseError, Database> =>
  Effect.gen(function* () {
    const [session] = yield* query((db) =>
      db.select().from(sessions).where(eq(sessions.id, sessionId)),
    );
    if (!session) return null;

    const nodeIds = session.nodeIds as string[];
    let nodeRows: (typeof nodesTable.$inferSelect)[] = [];
    if (nodeIds.length > 0) {
      nodeRows = yield* query((db) =>
        db.select().from(nodesTable).where(inArray(nodesTable.id, nodeIds)),
      );
    }

    const learnerRows = yield* query((db) =>
      db
        .select()
        .from(learnerNodes)
        .where(eq(learnerNodes.userId, session.userId)),
    );

    const learnerMap = new Map(
      learnerRows.map((r) => [r.nodeId, dbRowToLearnerState(r)]),
    );

    const items = nodeRows.map((nodeRow) => {
      const node = dbRowToNode(nodeRow);
      const state = learnerMap.get(node.id)!;
      const selectedType = selectQuestionType(
        state,
        node.questionTemplates.map((t) => t.type),
      );
      const template =
        node.questionTemplates.find((t) => t.type === selectedType) ??
        node.questionTemplates[0];
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
  });
