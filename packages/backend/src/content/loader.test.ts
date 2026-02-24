import { describe, it, expect } from "vitest";
import { validateSkillTreeDef, detectPrerequisiteCycles } from "./validator.js";
import type { SkillTreeDef } from "../seed/types.js";

function makeMinimalDef(overrides?: Partial<SkillTreeDef>): SkillTreeDef {
  return {
    name: "Test Tree",
    id: "test-tree",
    tierBases: { 1: 100 },
    domains: [
      {
        prefix: "basics",
        domain: {
          name: "Basics",
          tier: 1,
          description: "Basic concepts",
          prerequisites: [],
          displayOrder: 0,
        },
        topics: [{ name: "Intro", complexityWeight: 1.0, displayOrder: 0 }],
        nodes: [
          {
            topicName: "Intro",
            concept: "Hello World",
            questionTemplates: [
              {
                type: "recognition",
                prompt: "What is Hello World?",
                correctAnswer: "A greeting",
                explanation: "It is a greeting program",
              },
            ],
          },
        ],
      },
    ],
    prerequisites: {},
    placeholderDomains: [],
    ...overrides,
  };
}

describe("validateSkillTreeDef", () => {
  it("passes for a valid skill tree definition", () => {
    expect(() => validateSkillTreeDef(makeMinimalDef())).not.toThrow();
  });

  it("throws for missing name", () => {
    expect(() => validateSkillTreeDef(makeMinimalDef({ name: "" }))).toThrow(/name/);
  });

  it("throws for missing id", () => {
    expect(() => validateSkillTreeDef(makeMinimalDef({ id: "" }))).toThrow(/id/);
  });

  it("throws for empty topics in a domain", () => {
    const def = makeMinimalDef({
      domains: [
        {
          prefix: "empty",
          domain: {
            name: "Empty",
            tier: 1,
            description: "Empty domain",
            prerequisites: [],
            displayOrder: 0,
          },
          topics: [],
          nodes: [
            {
              topicName: "Intro",
              concept: "Hello World",
              questionTemplates: [
                {
                  type: "recognition",
                  prompt: "p",
                  correctAnswer: "a",
                  explanation: "e",
                },
              ],
            },
          ],
        },
      ],
    });
    expect(() => validateSkillTreeDef(def)).toThrow(/topics/i);
  });

  it("throws for empty nodes in a domain", () => {
    const def = makeMinimalDef({
      domains: [
        {
          prefix: "no-nodes",
          domain: {
            name: "No Nodes",
            tier: 1,
            description: "Domain with no nodes",
            prerequisites: [],
            displayOrder: 0,
          },
          topics: [{ name: "Topic", complexityWeight: 1.0, displayOrder: 0 }],
          nodes: [],
        },
      ],
    });
    expect(() => validateSkillTreeDef(def)).toThrow(/nodes/i);
  });

  it("throws for invalid question type", () => {
    const def = makeMinimalDef({
      domains: [
        {
          prefix: "bad-type",
          domain: {
            name: "Bad Type",
            tier: 1,
            description: "Has invalid question type",
            prerequisites: [],
            displayOrder: 0,
          },
          topics: [{ name: "Topic", complexityWeight: 1.0, displayOrder: 0 }],
          nodes: [
            {
              topicName: "Topic",
              concept: "Something",
              questionTemplates: [
                {
                  type: "invalid_type" as any,
                  prompt: "p",
                  correctAnswer: "a",
                  explanation: "e",
                },
              ],
            },
          ],
        },
      ],
    });
    expect(() => validateSkillTreeDef(def)).toThrow(/type/i);
  });

  it("throws for missing prompt in question template", () => {
    const def = makeMinimalDef({
      domains: [
        {
          prefix: "no-prompt",
          domain: {
            name: "No Prompt",
            tier: 1,
            description: "Missing prompt",
            prerequisites: [],
            displayOrder: 0,
          },
          topics: [{ name: "Topic", complexityWeight: 1.0, displayOrder: 0 }],
          nodes: [
            {
              topicName: "Topic",
              concept: "Something",
              questionTemplates: [
                {
                  type: "recognition",
                  prompt: "",
                  correctAnswer: "a",
                  explanation: "e",
                },
              ],
            },
          ],
        },
      ],
    });
    expect(() => validateSkillTreeDef(def)).toThrow(/prompt/i);
  });

  it("throws for missing correctAnswer in question template", () => {
    const def = makeMinimalDef({
      domains: [
        {
          prefix: "no-answer",
          domain: {
            name: "No Answer",
            tier: 1,
            description: "Missing answer",
            prerequisites: [],
            displayOrder: 0,
          },
          topics: [{ name: "Topic", complexityWeight: 1.0, displayOrder: 0 }],
          nodes: [
            {
              topicName: "Topic",
              concept: "Something",
              questionTemplates: [
                {
                  type: "recognition",
                  prompt: "What?",
                  correctAnswer: "",
                  explanation: "e",
                },
              ],
            },
          ],
        },
      ],
    });
    expect(() => validateSkillTreeDef(def)).toThrow(/correctAnswer/i);
  });

  it("throws for missing explanation in question template", () => {
    const def = makeMinimalDef({
      domains: [
        {
          prefix: "no-explanation",
          domain: {
            name: "No Explanation",
            tier: 1,
            description: "Missing explanation",
            prerequisites: [],
            displayOrder: 0,
          },
          topics: [{ name: "Topic", complexityWeight: 1.0, displayOrder: 0 }],
          nodes: [
            {
              topicName: "Topic",
              concept: "Something",
              questionTemplates: [
                {
                  type: "recognition",
                  prompt: "What?",
                  correctAnswer: "a",
                  explanation: "",
                },
              ],
            },
          ],
        },
      ],
    });
    expect(() => validateSkillTreeDef(def)).toThrow(/explanation/i);
  });
});

describe("detectPrerequisiteCycles", () => {
  it("returns empty array for acyclic graph", () => {
    const prereqs: Record<string, string[]> = {
      B: ["A"],
      C: ["A", "B"],
    };
    expect(detectPrerequisiteCycles(prereqs)).toEqual([]);
  });

  it("detects A↔B cycle", () => {
    const prereqs: Record<string, string[]> = {
      A: ["B"],
      B: ["A"],
    };
    const cycles = detectPrerequisiteCycles(prereqs);
    expect(cycles.length).toBeGreaterThan(0);
  });

  it("detects A→B→C→A cycle", () => {
    const prereqs: Record<string, string[]> = {
      A: ["C"],
      B: ["A"],
      C: ["B"],
    };
    const cycles = detectPrerequisiteCycles(prereqs);
    expect(cycles.length).toBeGreaterThan(0);
  });

  it("returns empty array for empty prerequisites", () => {
    expect(detectPrerequisiteCycles({})).toEqual([]);
  });
});
