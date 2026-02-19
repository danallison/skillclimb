import type { LearnerNodeState, Node, QuestionTemplate } from "@cyberclimb/core";
import type { learnerNodes, nodes as nodesTable } from "./schema.js";

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
