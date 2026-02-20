import { Effect } from "effect";
import { eq } from "drizzle-orm";
import {
  nodes,
  learnerNodes,
  placementTests,
  domains,
} from "../db/schema.js";
import { nodesToIRTItems, buildIRTStateFromPlacement } from "../db/mappers.js";
import { query, Database } from "./Database.js";
import { NotFoundError, ValidationError, DatabaseError } from "../errors.js";
import type { IRTItem, IRTResponse } from "@skillclimb/core";
import {
  createInitialIRTState,
  selectNextItem,
  processResponse,
  shouldTerminate,
  buildPlacementResult,
  evaluateRecognition,
  CORRECT_SCORE_THRESHOLD,
  DEFAULT_PLACEMENT_CONFIG,
} from "@skillclimb/core";

interface PlacementQuestion {
  nodeId: string;
  domainId: string;
  concept: string;
  questionTemplate: {
    type: string;
    prompt: string;
    choices?: string[];
    correctAnswer: string;
    explanation: string;
  };
}

interface PlacementStartResult {
  placementId: string;
  question: PlacementQuestion;
  questionsAnswered: number;
  estimatedTotal: number;
  theta: number;
  standardError: number;
}

interface PlacementAnswerResult {
  correct: boolean;
  explanation: string;
  done: boolean;
  question?: PlacementQuestion;
  questionsAnswered: number;
  estimatedTotal: number;
  theta: number;
  standardError: number;
  result?: {
    globalTheta: number;
    domainThetas: Record<string, number>;
    domainNames: Record<string, string>;
    classifications: {
      mastered: number;
      partial: number;
      weak: number;
      unknown: number;
    };
  };
}

export const startPlacement = (
  userId: string,
): Effect.Effect<
  PlacementStartResult,
  ValidationError | DatabaseError,
  Database
> =>
  Effect.gen(function* () {
    // Check for existing in-progress placement test
    const existing = yield* query((db) =>
      db.select().from(placementTests).where(eq(placementTests.userId, userId)),
    );
    const inProgress = existing.find((p) => p.status === "in_progress");
    if (inProgress) {
      yield* query((db) =>
        db
          .update(placementTests)
          .set({ status: "abandoned" })
          .where(eq(placementTests.id, inProgress.id)),
      );
    }

    // Fetch all nodes with difficulty
    const allNodes = yield* query((db) => db.select().from(nodes));
    if (allNodes.length === 0) {
      return yield* Effect.fail(
        new ValidationError({ message: "No nodes available for placement test" }),
      );
    }

    // Build IRT items
    const irtItems = nodesToIRTItems(allNodes);

    // Create initial state and select first item
    const state = createInitialIRTState();
    const firstItem = selectNextItem(state, irtItems, DEFAULT_PLACEMENT_CONFIG);
    if (!firstItem) {
      return yield* Effect.fail(
        new ValidationError({ message: "Could not select first item" }),
      );
    }

    // Find the node for the selected item
    const firstNode = allNodes.find((n) => n.id === firstItem.nodeId)!;
    const template = firstNode.questionTemplates[0];

    // Create placement record
    const [record] = yield* query((db) =>
      db
        .insert(placementTests)
        .values({
          userId,
          status: "in_progress",
          currentTheta: 0,
          currentSE: 4.0,
          responses: [],
        })
        .returning(),
    );

    return {
      placementId: record.id,
      question: {
        nodeId: firstNode.id,
        domainId: firstNode.domainId,
        concept: firstNode.concept,
        questionTemplate: template,
      },
      questionsAnswered: 0,
      estimatedTotal: DEFAULT_PLACEMENT_CONFIG.minItems,
      theta: 0,
      standardError: 4.0,
    };
  });

export const submitPlacementAnswer = (
  placementId: string,
  nodeId: string,
  selectedAnswer: string | null,
  confidence: number,
): Effect.Effect<
  PlacementAnswerResult,
  NotFoundError | ValidationError | DatabaseError,
  Database
> =>
  Effect.gen(function* () {
    // Read placement record
    const [placement] = yield* query((db) =>
      db
        .select()
        .from(placementTests)
        .where(eq(placementTests.id, placementId)),
    );

    if (!placement) {
      return yield* Effect.fail(
        new NotFoundError({ entity: "Placement test", id: placementId }),
      );
    }
    if (placement.status !== "in_progress") {
      return yield* Effect.fail(
        new ValidationError({ message: "Placement test is not in progress" }),
      );
    }

    // Read the node to evaluate answer
    const [node] = yield* query((db) =>
      db.select().from(nodes).where(eq(nodes.id, nodeId)),
    );
    if (!node) {
      return yield* Effect.fail(
        new NotFoundError({ entity: "Node", id: nodeId }),
      );
    }

    const template = node.questionTemplates[0];
    const score = evaluateRecognition(selectedAnswer, template.correctAnswer);
    const correct = score >= CORRECT_SCORE_THRESHOLD;

    // Build IRT item for this node
    const item: IRTItem = {
      nodeId: node.id,
      domainId: node.domainId,
      difficulty: node.difficulty,
    };

    // Reconstruct current IRT state from stored responses
    const previousResponses: IRTResponse[] =
      placement.responses as IRTResponse[];
    const currentState = buildIRTStateFromPlacement(placement);

    // Process response (pure)
    const newState = processResponse(currentState, item, correct);
    const newResponses = [
      ...previousResponses,
      {
        nodeId: node.id,
        domainId: node.domainId,
        difficulty: node.difficulty,
        correct,
      },
    ];

    // Check termination
    const done = shouldTerminate(newState, DEFAULT_PLACEMENT_CONFIG);

    if (done) {
      // Classify all nodes
      const allNodes = yield* query((db) => db.select().from(nodes));
      const allItems = nodesToIRTItems(allNodes);

      const now = new Date();
      const placementResult = buildPlacementResult(newState, allItems, now);

      // Batch write learnerNode states
      for (const classification of placementResult.nodeClassifications) {
        yield* query((db) =>
          db
            .insert(learnerNodes)
            .values({
              userId: placement.userId,
              nodeId: classification.nodeId,
              domainId: classification.domainId,
              easiness: classification.initialState.easiness,
              interval: classification.initialState.interval,
              repetitions: classification.initialState.repetitions,
              dueDate: classification.initialState.dueDate,
              confidenceHistory: [],
              domainWeight: classification.initialState.domainWeight,
            })
            .onConflictDoUpdate({
              target: [learnerNodes.userId, learnerNodes.nodeId],
              set: {
                easiness: classification.initialState.easiness,
                interval: classification.initialState.interval,
                repetitions: classification.initialState.repetitions,
                dueDate: classification.initialState.dueDate,
                domainWeight: classification.initialState.domainWeight,
              },
            }),
        );
      }

      // Update placement record
      const resultRow = {
        globalTheta: placementResult.globalTheta,
        domainThetas: placementResult.domainThetas,
        nodeClassifications: placementResult.nodeClassifications.map((c) => ({
          nodeId: c.nodeId,
          domainId: c.domainId,
          classification: c.classification,
          probability: c.probability,
        })),
      };

      yield* query((db) =>
        db
          .update(placementTests)
          .set({
            status: "completed",
            currentTheta: newState.theta,
            currentSE: newState.standardError,
            responses: newResponses,
            result: resultRow,
            completedAt: now,
          })
          .where(eq(placementTests.id, placementId)),
      );

      // Count classifications
      const counts = { mastered: 0, partial: 0, weak: 0, unknown: 0 };
      for (const c of placementResult.nodeClassifications) {
        counts[c.classification]++;
      }

      // Build domain name lookup
      const allDomains = yield* query((db) => db.select().from(domains));
      const domainNamesMap: Record<string, string> = {};
      for (const d of allDomains) {
        domainNamesMap[d.id] = d.name;
      }

      return {
        correct,
        explanation: template.explanation,
        done: true,
        questionsAnswered: newResponses.length,
        estimatedTotal: newResponses.length,
        theta: newState.theta,
        standardError: newState.standardError,
        result: {
          globalTheta: placementResult.globalTheta,
          domainThetas: placementResult.domainThetas,
          domainNames: domainNamesMap,
          classifications: counts,
        },
      };
    }

    // Not done — select next item
    const allNodes = yield* query((db) => db.select().from(nodes));
    const answeredNodeIds = new Set(newResponses.map((r) => r.nodeId));
    const availableItems = nodesToIRTItems(
      allNodes.filter((n) => !answeredNodeIds.has(n.id)),
    );

    const nextItem = selectNextItem(
      newState,
      availableItems,
      DEFAULT_PLACEMENT_CONFIG,
    );
    let nextQuestion: PlacementQuestion | undefined;

    if (nextItem) {
      const nextNode = allNodes.find((n) => n.id === nextItem.nodeId)!;
      nextQuestion = {
        nodeId: nextNode.id,
        domainId: nextNode.domainId,
        concept: nextNode.concept,
        questionTemplate: nextNode.questionTemplates[0],
      };
    }

    // Update placement record
    yield* query((db) =>
      db
        .update(placementTests)
        .set({
          currentTheta: newState.theta,
          currentSE: newState.standardError,
          responses: newResponses,
        })
        .where(eq(placementTests.id, placementId)),
    );

    return {
      correct,
      explanation: template.explanation,
      done: false,
      question: nextQuestion,
      questionsAnswered: newResponses.length,
      estimatedTotal: Math.max(
        DEFAULT_PLACEMENT_CONFIG.minItems,
        newResponses.length + 5,
      ),
      theta: newState.theta,
      standardError: newState.standardError,
    };
  });

export const getPlacement = (placementId: string) =>
  Effect.gen(function* () {
    const [placement] = yield* query((db) =>
      db
        .select()
        .from(placementTests)
        .where(eq(placementTests.id, placementId)),
    );

    if (!placement) return null;

    // If in progress, also return the next question
    if (placement.status === "in_progress") {
      const allNodes = yield* query((db) => db.select().from(nodes));
      const answeredNodeIds = new Set(
        (placement.responses as IRTResponse[]).map((r) => r.nodeId),
      );
      const availableItems = nodesToIRTItems(
        allNodes.filter((n) => !answeredNodeIds.has(n.id)),
      );

      const state = buildIRTStateFromPlacement(placement);

      const nextItem = selectNextItem(
        state,
        availableItems,
        DEFAULT_PLACEMENT_CONFIG,
      );
      let question: PlacementQuestion | undefined;

      if (nextItem) {
        const nextNode = allNodes.find((n) => n.id === nextItem.nodeId)!;
        question = {
          nodeId: nextNode.id,
          domainId: nextNode.domainId,
          concept: nextNode.concept,
          questionTemplate: nextNode.questionTemplates[0],
        };
      }

      return {
        ...placement,
        question,
        questionsAnswered: (placement.responses as IRTResponse[]).length,
      };
    }

    return placement;
  });

export const abandonPlacement = (placementId: string) =>
  query((db) =>
    db
      .update(placementTests)
      .set({ status: "abandoned" })
      .where(eq(placementTests.id, placementId)),
  ).pipe(Effect.asVoid);
