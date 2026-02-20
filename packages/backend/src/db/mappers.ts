import type { LearnerNodeState, Node, QuestionTemplate, IRTItem, IRTState, IRTResponse } from "@skillclimb/core";
import type { learnerNodes, nodes as nodesTable, placementTests } from "./schema.js";

export function dbRowToLearnerState(row: typeof learnerNodes.$inferSelect): LearnerNodeState {
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
    misconceptions: (row.misconceptions ?? []) as string[],
  };
}

export function dbRowToNode(row: typeof nodesTable.$inferSelect): Node {
  return {
    id: row.id,
    topicId: row.topicId,
    domainId: row.domainId,
    concept: row.concept,
    questionTemplates: (row.questionTemplates ?? []) as QuestionTemplate[],
  };
}

/**
 * Map DB node rows to IRT items for placement tests.
 */
export function nodesToIRTItems(nodeRows: (typeof nodesTable.$inferSelect)[]): IRTItem[] {
  return nodeRows.map((n) => ({
    nodeId: n.id,
    domainId: n.domainId,
    difficulty: n.difficulty,
  }));
}

/**
 * Reconstruct an IRTState from a placement test DB row.
 */
export function buildIRTStateFromPlacement(placement: typeof placementTests.$inferSelect): IRTState {
  return {
    theta: placement.currentTheta,
    standardError: placement.currentSE,
    responses: placement.responses as IRTResponse[],
    domainThetas: new Map<string, number>(),
  };
}
