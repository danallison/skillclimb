import { Effect } from "effect";
import { eq, and, inArray, gte } from "drizzle-orm";
import {
  learnerNodes,
  nodes as nodesTable,
  domains,
  sessions,
  reviews,
} from "../db/schema.js";
import { dbRowToLearnerState, dbRowToNode } from "../db/mappers.js";
import { query, Database } from "./Database.js";
import { DatabaseError, NotFoundError, ValidationError } from "../errors.js";
import {
  buildSession,
  DEFAULT_SESSION_CONFIG,
  selectQuestionType,
  isStruggling,
  computeSessionSummary,
  computeSessionMomentum,
  computeNextSession,
  formatNextSession,
  CORRECT_SCORE_THRESHOLD,
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
  userId: string,
): Effect.Effect<SessionWithItems | null, DatabaseError, Database> =>
  Effect.gen(function* () {
    const [session] = yield* query((db) =>
      db.select().from(sessions).where(
        and(eq(sessions.id, sessionId), eq(sessions.userId, userId)),
      ),
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
        needsLesson: isStruggling(state),
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

export interface SessionCompletionResult {
  sessionId: string;
  completedAt: string;
  summary: {
    totalReviews: number;
    correctCount: number;
    accuracyPercentage: number;
    calibrationCounts: Record<string, number>;
  };
  momentum: {
    overallAccuracy: number;
    inTargetZone: boolean;
    message: string;
  };
  nextSession: {
    dueNow: number;
    nextDueDate: string | null;
    dueTodayRemaining: number;
    dueWithinWeek: number;
    message: string;
  };
}

export const completeSession = (
  sessionId: string,
  userId: string,
): Effect.Effect<SessionCompletionResult, NotFoundError | ValidationError | DatabaseError, Database> =>
  Effect.gen(function* () {
    // 1. Verify session exists and belongs to user
    const [session] = yield* query((db) =>
      db.select().from(sessions).where(
        and(eq(sessions.id, sessionId), eq(sessions.userId, userId)),
      ),
    );
    if (!session) {
      return yield* Effect.fail(
        new NotFoundError({ entity: "Session", id: sessionId }),
      );
    }
    if (session.completedAt) {
      return yield* Effect.fail(
        new ValidationError({ message: "Session is already completed" }),
      );
    }

    // 2. Fetch reviews for this session's nodes since session start
    const nodeIds = session.nodeIds as string[];
    let sessionReviews: (typeof reviews.$inferSelect)[] = [];
    if (nodeIds.length > 0) {
      sessionReviews = yield* query((db) =>
        db
          .select()
          .from(reviews)
          .where(
            and(
              eq(reviews.userId, userId),
              inArray(reviews.nodeId, nodeIds),
              gte(reviews.createdAt, session.startedAt),
            ),
          ),
      );
    }

    // 3. Compute summary (pure)
    const reviewRecords = sessionReviews.map((r) => ({
      wasCorrect: r.score >= CORRECT_SCORE_THRESHOLD,
      confidence: r.confidence,
    }));
    const summary = computeSessionSummary(reviewRecords);

    // 4. Compute momentum (pure)
    const correctnessResults = sessionReviews.map(
      (r) => r.score >= CORRECT_SCORE_THRESHOLD,
    );
    const momentum = computeSessionMomentum(correctnessResults);

    // 5. Compute next session info
    const now = new Date();
    const learnerRows = yield* query((db) =>
      db.select().from(learnerNodes).where(eq(learnerNodes.userId, userId)),
    );
    const states = learnerRows.map(dbRowToLearnerState);
    const nextSessionInfo = computeNextSession(states, now);
    const nextSessionMessage = formatNextSession(nextSessionInfo, now);

    // 6. Update session record
    const completedAt = now;
    const analytics = {
      summary,
      momentum,
    };
    yield* query((db) =>
      db
        .update(sessions)
        .set({ completedAt, analytics })
        .where(eq(sessions.id, sessionId)),
    );

    return {
      sessionId,
      completedAt: completedAt.toISOString(),
      summary,
      momentum,
      nextSession: {
        dueNow: nextSessionInfo.dueNow,
        nextDueDate: nextSessionInfo.nextDueDate?.toISOString() ?? null,
        dueTodayRemaining: nextSessionInfo.dueTodayRemaining,
        dueWithinWeek: nextSessionInfo.dueWithinWeek,
        message: nextSessionMessage,
      },
    };
  });
