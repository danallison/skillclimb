import type {
  IRTItem,
  IRTResponse,
  IRTState,
  PlacementConfig,
  PlacementResult,
  NodeClassification,
  NodeClassificationResult,
  LearnerNodeState,
} from "../types.js";

/**
 * 1-Parameter Logistic (Rasch) model probability.
 * P(correct | theta, difficulty) = 1 / (1 + exp(-(theta - difficulty)))
 */
export function irtProbability(theta: number, difficulty: number): number {
  return 1 / (1 + Math.exp(-(theta - difficulty)));
}

/**
 * Fisher information for a single item at a given ability level.
 * I(theta, difficulty) = P * (1 - P)
 * Maximized when theta === difficulty (P = 0.5, I = 0.25).
 */
export function fisherInformation(theta: number, difficulty: number): number {
  const p = irtProbability(theta, difficulty);
  return p * (1 - p);
}

/**
 * Estimate ability (theta) from a set of responses.
 * Uses EAP (Expected A Posteriori) for <3 responses, MLE via Newton-Raphson for 3+.
 * Returns { theta, se }.
 */
export function estimateTheta(responses: IRTResponse[]): { theta: number; se: number } {
  if (responses.length === 0) {
    return { theta: 0, se: 4.0 };
  }

  if (responses.length < 3) {
    return estimateThetaEAP(responses);
  }

  return estimateThetaMLE(responses);
}

/**
 * EAP estimation using a standard normal prior.
 * Numerically integrates over a grid of theta values.
 */
function estimateThetaEAP(responses: IRTResponse[]): { theta: number; se: number } {
  const gridMin = -4;
  const gridMax = 4;
  const gridStep = 0.1;
  const gridPoints: number[] = [];

  for (let t = gridMin; t <= gridMax; t += gridStep) {
    gridPoints.push(t);
  }

  let numerator = 0;
  let denominator = 0;
  let variance = 0;

  for (const t of gridPoints) {
    // Prior: standard normal
    const prior = Math.exp(-0.5 * t * t);

    // Likelihood
    let likelihood = 1;
    for (const r of responses) {
      const p = irtProbability(t, r.difficulty);
      likelihood *= r.correct ? p : 1 - p;
    }

    const posterior = likelihood * prior;
    numerator += t * posterior;
    denominator += posterior;
  }

  const theta = denominator > 0 ? numerator / denominator : 0;

  // Compute variance for SE
  for (const t of gridPoints) {
    const prior = Math.exp(-0.5 * t * t);
    let likelihood = 1;
    for (const r of responses) {
      const p = irtProbability(t, r.difficulty);
      likelihood *= r.correct ? p : 1 - p;
    }
    const posterior = likelihood * prior;
    variance += (t - theta) ** 2 * posterior;
  }

  const se = denominator > 0 ? Math.sqrt(variance / denominator) : 4.0;
  return { theta, se };
}

/**
 * MLE estimation via Newton-Raphson.
 * Falls back to EAP if all responses are the same (perfect/zero score).
 */
function estimateThetaMLE(responses: IRTResponse[]): { theta: number; se: number } {
  const allCorrect = responses.every((r) => r.correct);
  const allIncorrect = responses.every((r) => !r.correct);

  // MLE doesn't converge for perfect/zero scores; use EAP
  if (allCorrect || allIncorrect) {
    return estimateThetaEAP(responses);
  }

  let theta = 0;
  const maxIterations = 50;
  const tolerance = 0.001;

  for (let i = 0; i < maxIterations; i++) {
    let firstDerivative = 0;
    let secondDerivative = 0;

    for (const r of responses) {
      const p = irtProbability(theta, r.difficulty);
      const residual = (r.correct ? 1 : 0) - p;
      firstDerivative += residual;
      secondDerivative -= p * (1 - p);
    }

    if (Math.abs(secondDerivative) < 1e-10) break;

    const delta = firstDerivative / secondDerivative;
    theta -= delta;

    // Clamp to reasonable range
    theta = Math.max(-4, Math.min(4, theta));

    if (Math.abs(delta) < tolerance) break;
  }

  // Compute SE from Fisher information
  let totalInfo = 0;
  for (const r of responses) {
    totalInfo += fisherInformation(theta, r.difficulty);
  }
  const se = totalInfo > 0 ? 1 / Math.sqrt(totalInfo) : 4.0;

  return { theta, se };
}

/**
 * Select the next item to present, maximizing information with domain coverage enforcement.
 * Picks from top-K most informative items, with bonus for under-represented domains.
 */
export function selectNextItem(
  state: IRTState,
  availableItems: IRTItem[],
  config: PlacementConfig,
): IRTItem | null {
  if (availableItems.length === 0) return null;

  // Count domain representation in responses so far
  const domainCounts = new Map<string, number>();
  for (const r of state.responses) {
    domainCounts.set(r.domainId, (domainCounts.get(r.domainId) ?? 0) + 1);
  }

  // Count available domains
  const availableDomains = new Set(availableItems.map((i) => i.domainId));
  const totalResponses = state.responses.length;
  const expectedPerDomain = availableDomains.size > 0 ? totalResponses / availableDomains.size : 0;

  // Score each item: Fisher information + domain coverage bonus
  const scored = availableItems.map((item) => {
    const info = fisherInformation(state.theta, item.difficulty);
    const domainCount = domainCounts.get(item.domainId) ?? 0;

    // Domain coverage bonus: boost under-represented domains
    let coverageBonus = 0;
    if (totalResponses > 0 && domainCount < expectedPerDomain) {
      coverageBonus = (expectedPerDomain - domainCount) / expectedPerDomain * config.domainCoverageWeight * 0.25;
    }

    return { item, score: info + coverageBonus };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Pick randomly from top-K
  const topK = Math.min(config.topK, scored.length);
  const randomIndex = Math.floor(Math.random() * topK);
  return scored[randomIndex].item;
}

/**
 * Check if the placement test should terminate.
 */
export function shouldTerminate(state: IRTState, config: PlacementConfig): boolean {
  const n = state.responses.length;

  // Hard cap
  if (n >= config.maxItems) return true;

  // Minimum items before any termination
  if (n < config.minItems) return false;

  // Precision target met
  if (state.standardError < config.sePrecisionTarget) return true;

  // Relaxed precision target after extended test
  if (n >= config.relaxedMinItems && state.standardError < config.seRelaxedTarget) return true;

  return false;
}

/**
 * Process a response and return updated IRT state.
 */
export function processResponse(
  state: IRTState,
  item: IRTItem,
  correct: boolean,
): IRTState {
  const response: IRTResponse = {
    nodeId: item.nodeId,
    domainId: item.domainId,
    difficulty: item.difficulty,
    correct,
  };

  const newResponses = [...state.responses, response];
  const { theta, se } = estimateTheta(newResponses);
  const domainThetas = computeDomainThetas(newResponses);

  return {
    theta,
    standardError: se,
    responses: newResponses,
    domainThetas,
  };
}

/**
 * Compute per-domain ability estimates from a subset of responses.
 */
export function computeDomainThetas(responses: IRTResponse[]): Map<string, number> {
  const byDomain = new Map<string, IRTResponse[]>();
  for (const r of responses) {
    const list = byDomain.get(r.domainId) ?? [];
    list.push(r);
    byDomain.set(r.domainId, list);
  }

  const domainThetas = new Map<string, number>();
  for (const [domainId, domainResponses] of byDomain) {
    if (domainResponses.length >= 2) {
      const { theta } = estimateTheta(domainResponses);
      domainThetas.set(domainId, theta);
    } else {
      // With only 1 response, use a simple heuristic based on global theta range
      const r = domainResponses[0];
      domainThetas.set(domainId, r.correct ? r.difficulty + 0.5 : r.difficulty - 0.5);
    }
  }

  return domainThetas;
}

/**
 * Classify all nodes based on global and domain theta estimates.
 * Maps each node's probability of being answered correctly to an initial SRS state.
 */
export function classifyNodes(
  globalTheta: number,
  domainThetas: Map<string, number>,
  allItems: IRTItem[],
  now: Date,
): NodeClassificationResult[] {
  return allItems.map((item) => {
    // Use domain theta if available, otherwise global theta
    const theta = domainThetas.get(item.domainId) ?? globalTheta;
    const probability = irtProbability(theta, item.difficulty);
    const classification = classifyByProbability(probability);
    const initialState = classificationToSRSState(classification, now);

    return {
      nodeId: item.nodeId,
      domainId: item.domainId,
      classification,
      probability,
      initialState,
    };
  });
}

function classifyByProbability(probability: number): NodeClassification {
  if (probability >= 0.85) return "mastered";
  if (probability >= 0.60) return "partial";
  if (probability >= 0.30) return "weak";
  return "unknown";
}

function classificationToSRSState(
  classification: NodeClassification,
  now: Date,
): Omit<LearnerNodeState, "userId" | "nodeId" | "domainId"> {
  const baseState = {
    confidenceHistory: [],
    domainWeight: 1.0,
  };

  switch (classification) {
    case "mastered":
      return {
        ...baseState,
        repetitions: 3,
        interval: 30,
        easiness: 2.5,
        dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      };
    case "partial":
      return {
        ...baseState,
        repetitions: 1,
        interval: 3,
        easiness: 2.3,
        dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      };
    case "weak":
      return {
        ...baseState,
        repetitions: 0,
        interval: 1,
        easiness: 2.0,
        dueDate: now,
      };
    case "unknown":
      return {
        ...baseState,
        repetitions: 0,
        interval: 0,
        easiness: 2.5,
        dueDate: now,
      };
  }
}

/**
 * Create the initial IRT state for a new placement test.
 */
export function createInitialIRTState(): IRTState {
  return {
    theta: 0,
    standardError: 4.0,
    responses: [],
    domainThetas: new Map(),
  };
}

/**
 * Build a PlacementResult from the final IRT state.
 */
export function buildPlacementResult(
  state: IRTState,
  allItems: IRTItem[],
  now: Date,
): PlacementResult {
  const domainThetasRecord: Record<string, number> = {};
  for (const [domainId, theta] of state.domainThetas) {
    domainThetasRecord[domainId] = theta;
  }

  const nodeClassifications = classifyNodes(state.theta, state.domainThetas, allItems, now);

  return {
    globalTheta: state.theta,
    domainThetas: domainThetasRecord,
    nodeClassifications,
  };
}
