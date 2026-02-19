import type { LearnerNodeState, Node, SessionConfig, SessionItem, SessionResult } from "../types.js";
import { isDue, daysOverdue } from "../srs/sm2.js";
import { selectQuestionType } from "../question/questionType.js";

/**
 * Calculate priority score for a single learner node.
 * Higher priority = should be reviewed first.
 */
export function calculatePriority(state: LearnerNodeState, node: Node, now: Date): number {
  let priority = 0;

  // Overdue items get highest base priority
  const overdueDays = daysOverdue(state, now);
  if (overdueDays > 0) {
    priority += 100 + overdueDays * 10;
  } else if (isDue(state, now)) {
    priority += 80;
  }

  // New items (never reviewed) get moderate priority
  if (state.repetitions === 0 && state.interval === 0) {
    priority += 50;
  }

  // Items with low easiness (struggling) get a boost
  if (state.easiness < 2.0) {
    priority += 20;
  }

  return priority;
}

/**
 * Reorder items to avoid consecutive same-domain items (interleaving).
 * Uses a simple greedy algorithm: pick the highest priority item whose
 * domain differs from the previous item.
 */
export function interleave(items: SessionItem[]): SessionItem[] {
  if (items.length <= 1) return items;

  const remaining = [...items];
  const result: SessionItem[] = [];

  // Start with the highest priority item
  remaining.sort((a, b) => b.priority - a.priority);
  result.push(remaining.shift()!);

  while (remaining.length > 0) {
    const lastDomain = result[result.length - 1].node.domainId;

    // Find the first item from a different domain
    const diffDomainIdx = remaining.findIndex((item) => item.node.domainId !== lastDomain);

    if (diffDomainIdx >= 0) {
      result.push(remaining.splice(diffDomainIdx, 1)[0]);
    } else {
      // All remaining items are from the same domain — just take the first
      result.push(remaining.shift()!);
    }
  }

  return result;
}

/**
 * Build a review session from the learner's current state.
 * Pure function — no I/O or side effects.
 *
 * 1. Selects due and new items, scored by priority
 * 2. Limits to session size
 * 3. Interleaves across domains
 * 4. Picks a question template for each item
 */
export function buildSession(
  config: SessionConfig,
  learnerNodes: LearnerNodeState[],
  nodes: Node[],
  now: Date,
): SessionResult {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // Score and pair each learner node with its knowledge node
  const candidates: SessionItem[] = [];

  for (const state of learnerNodes) {
    const node = nodeMap.get(state.nodeId);
    if (!node) continue;
    if (node.questionTemplates.length === 0) continue;

    const priority = calculatePriority(state, node, now);
    if (priority === 0) continue; // not due, not new — skip

    // Pick a question template based on learner mastery level
    const selectedType = selectQuestionType(state, node.questionTemplates.map((t) => t.type));
    const template =
      node.questionTemplates.find((t) => t.type === selectedType) ?? node.questionTemplates[0];

    candidates.push({ node, learnerState: state, questionTemplate: template, priority });
  }

  // Sort by priority (highest first)
  candidates.sort((a, b) => b.priority - a.priority);

  // Limit to session size
  const selected = candidates.slice(0, config.maxItems);

  // If we don't have enough items, return what we have
  const items = interleave(selected);

  return {
    items,
    totalItems: items.length,
  };
}
