import { eq } from "drizzle-orm";
import { db } from "../db/connection.js";
import { nodes, learnerNodes, placementTests, domains } from "../db/schema.js";
import { nodesToIRTItems, buildIRTStateFromPlacement } from "../db/mappers.js";
import type { IRTItem, IRTResponse } from "@skillclimb/core";
import {
  createInitialIRTState,
  selectNextItem,
  processResponse,
  shouldTerminate,
  buildPlacementResult,
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

/**
 * Start a new placement test for a user.
 */
export async function startPlacement(userId: string): Promise<PlacementStartResult> {
  // Check for existing in-progress placement test
  const existing = await db
    .select()
    .from(placementTests)
    .where(eq(placementTests.userId, userId));
  const inProgress = existing.find((p) => p.status === "in_progress");
  if (inProgress) {
    // Abandon the old one before starting a new one
    await db
      .update(placementTests)
      .set({ status: "abandoned" })
      .where(eq(placementTests.id, inProgress.id));
  }

  // Fetch all nodes with difficulty
  const allNodes = await db.select().from(nodes);
  if (allNodes.length === 0) {
    throw new Error("No nodes available for placement test");
  }

  // Build IRT items
  const irtItems = nodesToIRTItems(allNodes);

  // Create initial state and select first item
  const state = createInitialIRTState();
  const firstItem = selectNextItem(state, irtItems, DEFAULT_PLACEMENT_CONFIG);
  if (!firstItem) {
    throw new Error("Could not select first item");
  }

  // Find the node for the selected item
  const firstNode = allNodes.find((n) => n.id === firstItem.nodeId)!;
  const template = firstNode.questionTemplates[0];

  // Create placement record
  const [record] = await db
    .insert(placementTests)
    .values({
      userId,
      status: "in_progress",
      currentTheta: 0,
      currentSE: 4.0,
      responses: [],
    })
    .returning();

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
}

/**
 * Submit an answer for a placement test question.
 */
export async function submitPlacementAnswer(
  placementId: string,
  nodeId: string,
  selectedAnswer: string | null,
  confidence: number,
): Promise<PlacementAnswerResult> {
  // Read placement record
  const [placement] = await db
    .select()
    .from(placementTests)
    .where(eq(placementTests.id, placementId));

  if (!placement) throw new Error("Placement test not found");
  if (placement.status !== "in_progress") throw new Error("Placement test is not in progress");

  // Read the node to evaluate answer
  const [node] = await db.select().from(nodes).where(eq(nodes.id, nodeId));
  if (!node) throw new Error("Node not found");

  const template = node.questionTemplates[0];
  const correct = selectedAnswer === template.correctAnswer;

  // Build IRT item for this node
  const item: IRTItem = {
    nodeId: node.id,
    domainId: node.domainId,
    difficulty: node.difficulty,
  };

  // Reconstruct current IRT state from stored responses
  const previousResponses: IRTResponse[] = placement.responses as IRTResponse[];
  const currentState = buildIRTStateFromPlacement(placement);

  // Process response (pure)
  const newState = processResponse(currentState, item, correct);
  const newResponses = [...previousResponses, {
    nodeId: node.id,
    domainId: node.domainId,
    difficulty: node.difficulty,
    correct,
  }];

  // Check termination
  const done = shouldTerminate(newState, DEFAULT_PLACEMENT_CONFIG);

  if (done) {
    // Classify all nodes
    const allNodes = await db.select().from(nodes);
    const allItems = nodesToIRTItems(allNodes);

    const now = new Date();
    const placementResult = buildPlacementResult(newState, allItems, now);

    // Batch write learnerNode states (upsert to overwrite defaults from user creation)
    for (const classification of placementResult.nodeClassifications) {
      await db
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
        });
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

    await db
      .update(placementTests)
      .set({
        status: "completed",
        currentTheta: newState.theta,
        currentSE: newState.standardError,
        responses: newResponses,
        result: resultRow,
        completedAt: now,
      })
      .where(eq(placementTests.id, placementId));

    // Count classifications
    const counts = { mastered: 0, partial: 0, weak: 0, unknown: 0 };
    for (const c of placementResult.nodeClassifications) {
      counts[c.classification]++;
    }

    // Build domain name lookup for the result
    const allDomains = await db.select().from(domains);
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
  const allNodes = await db.select().from(nodes);
  const answeredNodeIds = new Set(newResponses.map((r) => r.nodeId));
  const availableItems = nodesToIRTItems(allNodes.filter((n) => !answeredNodeIds.has(n.id)));

  const nextItem = selectNextItem(newState, availableItems, DEFAULT_PLACEMENT_CONFIG);
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
  await db
    .update(placementTests)
    .set({
      currentTheta: newState.theta,
      currentSE: newState.standardError,
      responses: newResponses,
    })
    .where(eq(placementTests.id, placementId));

  return {
    correct,
    explanation: template.explanation,
    done: false,
    question: nextQuestion,
    questionsAnswered: newResponses.length,
    estimatedTotal: Math.max(DEFAULT_PLACEMENT_CONFIG.minItems, newResponses.length + 5),
    theta: newState.theta,
    standardError: newState.standardError,
  };
}

/**
 * Get the current state of a placement test.
 */
export async function getPlacement(placementId: string) {
  const [placement] = await db
    .select()
    .from(placementTests)
    .where(eq(placementTests.id, placementId));

  if (!placement) return null;

  // If in progress, also return the next question
  if (placement.status === "in_progress") {
    const allNodes = await db.select().from(nodes);
    const answeredNodeIds = new Set(
      (placement.responses as IRTResponse[]).map((r) => r.nodeId),
    );
    const availableItems = nodesToIRTItems(allNodes.filter((n) => !answeredNodeIds.has(n.id)));

    const state = buildIRTStateFromPlacement(placement);

    const nextItem = selectNextItem(state, availableItems, DEFAULT_PLACEMENT_CONFIG);
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
}

/**
 * Abandon a placement test.
 */
export async function abandonPlacement(placementId: string) {
  await db
    .update(placementTests)
    .set({ status: "abandoned" })
    .where(eq(placementTests.id, placementId));
}
