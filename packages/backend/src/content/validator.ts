import { VALID_QUESTION_TYPES } from "@skillclimb/core";
import type { SkillTreeDef } from "../seed/types.js";

/**
 * Validate a SkillTreeDef for structural correctness.
 * Throws descriptive errors for invalid data.
 */
export function validateSkillTreeDef(def: SkillTreeDef): void {
  if (!def.name || def.name.trim().length === 0) {
    throw new Error("Skill tree name is required");
  }

  if (!def.id || def.id.trim().length === 0) {
    throw new Error("Skill tree id is required");
  }

  for (const entry of def.domains) {
    const domainLabel = `domain "${entry.domain.name}" (${entry.prefix})`;

    if (entry.topics.length === 0) {
      throw new Error(`${domainLabel} must have at least one topics entry`);
    }

    if (entry.nodes.length === 0) {
      throw new Error(`${domainLabel} must have at least one nodes entry`);
    }

    for (const node of entry.nodes) {
      for (const qt of node.questionTemplates) {
        if (!(VALID_QUESTION_TYPES as readonly string[]).includes(qt.type)) {
          throw new Error(
            `${domainLabel}, node "${node.concept}": invalid question type "${qt.type}". Must be one of ${VALID_QUESTION_TYPES.join(", ")}`,
          );
        }

        if (!qt.prompt || qt.prompt.trim().length === 0) {
          throw new Error(
            `${domainLabel}, node "${node.concept}": prompt is required`,
          );
        }

        if (!qt.correctAnswer || qt.correctAnswer.trim().length === 0) {
          throw new Error(
            `${domainLabel}, node "${node.concept}": correctAnswer is required`,
          );
        }

        if (!qt.explanation || qt.explanation.trim().length === 0) {
          throw new Error(
            `${domainLabel}, node "${node.concept}": explanation is required`,
          );
        }
      }
    }
  }

  // Validate prerequisite references and cycles
  const cycles = detectPrerequisiteCycles(def.prerequisites);
  if (cycles.length > 0) {
    throw new Error(`Prerequisite cycle detected: ${cycles.join(" → ")}`);
  }
}

/**
 * Detect cycles in a prerequisite graph using DFS.
 * Returns an array describing the first cycle found, or empty array if acyclic.
 */
export function detectPrerequisiteCycles(
  prereqs: Record<string, string[]>,
): string[] {
  const WHITE = 0; // unvisited
  const GRAY = 1;  // in current path
  const BLACK = 2; // fully processed

  const color = new Map<string, number>();

  // Collect all nodes
  const allNodes = new Set<string>();
  for (const [node, deps] of Object.entries(prereqs)) {
    allNodes.add(node);
    for (const dep of deps) {
      allNodes.add(dep);
    }
  }

  for (const node of allNodes) {
    color.set(node, WHITE);
  }

  for (const node of allNodes) {
    if (color.get(node) === WHITE) {
      const cycle = dfs(node, prereqs, color);
      if (cycle.length > 0) return cycle;
    }
  }

  return [];
}

function dfs(
  node: string,
  prereqs: Record<string, string[]>,
  color: Map<string, number>,
): string[] {
  const WHITE = 0;
  const GRAY = 1;
  const BLACK = 2;

  color.set(node, GRAY);

  for (const neighbor of prereqs[node] ?? []) {
    if (color.get(neighbor) === GRAY) {
      return [neighbor, node];
    }
    if (color.get(neighbor) === WHITE) {
      const cycle = dfs(neighbor, prereqs, color);
      if (cycle.length > 0) return cycle;
    }
  }

  color.set(node, BLACK);
  return [];
}
