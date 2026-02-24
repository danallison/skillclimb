import { readFileSync } from "fs";
import { join } from "path";
import { parse } from "yaml";
import type { SkillTreeDef, SeedDomain, SeedTopic, SeedNode } from "../seed/types.js";
import { validateSkillTreeDef } from "./validator.js";

// ---------------------------------------------------------------------------
// YAML shape types (what authors write)
// ---------------------------------------------------------------------------

interface YamlQuestion {
  type: "recognition" | "cued_recall" | "free_recall" | "application" | "practical";
  prompt: string;
  answer: string;
  explanation: string;
  choices?: string[];
  acceptableAnswers?: string[];
  hints?: string[];
  rubric?: string;
  keyPoints?: string[];
}

interface YamlNode {
  concept: string;
  questions: YamlQuestion[];
}

interface YamlTopic {
  name: string;
  complexityWeight?: number; // defaults to 1.0
  nodes: YamlNode[];
}

interface YamlDomain {
  name: string;
  tier: number;
  description: string;
  displayOrder?: number; // defaults to array position in skilltree.yaml domains list
  topics: YamlTopic[];
}

interface YamlSkillTree {
  name: string;
  id: string;
  tierBases: Record<number, number>;
  domains: string[]; // slugs referencing domains/<slug>.yaml
  prerequisites: Record<string, string[]>; // slug → [slug, ...]
  placeholders: Array<{
    name: string;
    tier: number;
    description: string;
    displayOrder: number;
  }>;
}

// ---------------------------------------------------------------------------
// Loader
// ---------------------------------------------------------------------------

/**
 * Load a skill tree from a directory containing skilltree.yaml and domains/*.yaml.
 */
export function loadYamlSkillTree(skilltreeDir: string): SkillTreeDef {
  const skilltreePath = join(skilltreeDir, "skilltree.yaml");
  const skilltreeYaml: YamlSkillTree = parse(readFileSync(skilltreePath, "utf-8"));

  // Build slug → domain name map as we load domains
  const slugToName = new Map<string, string>();
  const domainEntries: SkillTreeDef["domains"] = [];

  for (let domainIndex = 0; domainIndex < skilltreeYaml.domains.length; domainIndex++) {
    const slug = skilltreeYaml.domains[domainIndex];
    const domainPath = join(skilltreeDir, "domains", `${slug}.yaml`);
    const domainYaml: YamlDomain = parse(readFileSync(domainPath, "utf-8"));

    slugToName.set(slug, domainYaml.name);

    const domain: SeedDomain = {
      name: domainYaml.name,
      tier: domainYaml.tier,
      description: domainYaml.description,
      prerequisites: [], // resolved below from skilltree-level prerequisites
      displayOrder: domainYaml.displayOrder ?? domainIndex,
    };

    const topics: SeedTopic[] = [];
    const nodes: SeedNode[] = [];

    for (let topicIndex = 0; topicIndex < domainYaml.topics.length; topicIndex++) {
      const yamlTopic = domainYaml.topics[topicIndex];

      topics.push({
        name: yamlTopic.name,
        complexityWeight: yamlTopic.complexityWeight ?? 1.0,
        displayOrder: topicIndex,
      });

      for (const yamlNode of yamlTopic.nodes) {
        nodes.push({
          topicName: yamlTopic.name,
          concept: yamlNode.concept,
          questionTemplates: yamlNode.questions.map((q) => {
            const template: SeedNode["questionTemplates"][number] = {
              type: q.type,
              prompt: q.prompt,
              correctAnswer: q.answer,
              explanation: q.explanation,
            };
            if (q.choices) template.choices = q.choices;
            if (q.acceptableAnswers) template.acceptableAnswers = q.acceptableAnswers;
            if (q.hints) template.hints = q.hints;
            if (q.rubric) template.rubric = q.rubric;
            if (q.keyPoints) template.keyPoints = q.keyPoints;
            return template;
          }),
        });
      }
    }

    domainEntries.push({ prefix: slug, domain, topics, nodes });
  }

  // Resolve prerequisites: slug keys → domain names
  const prerequisites: Record<string, string[]> = {};
  for (const [slug, prereqSlugs] of Object.entries(skilltreeYaml.prerequisites ?? {})) {
    const domainName = slugToName.get(slug);
    if (!domainName) continue;
    prerequisites[domainName] = prereqSlugs
      .map((ps) => slugToName.get(ps))
      .filter((n): n is string => n !== undefined);
  }

  // Placeholder domains
  const placeholderDomains = (skilltreeYaml.placeholders ?? []).map((p) => ({
    name: p.name,
    tier: p.tier,
    description: p.description,
    displayOrder: p.displayOrder,
  }));

  const result: SkillTreeDef = {
    name: skilltreeYaml.name,
    id: skilltreeYaml.id,
    tierBases: skilltreeYaml.tierBases,
    domains: domainEntries,
    prerequisites,
    placeholderDomains,
  };

  validateSkillTreeDef(result);

  return result;
}
