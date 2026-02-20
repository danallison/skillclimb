import { eq, and } from "drizzle-orm";
import { db } from "./connection.js";
import { skilltrees, domains, topics, nodes } from "./schema.js";
import { existsSync, readdirSync } from "fs";
import { fileURLToPath, pathToFileURL } from "url";
import { dirname, join } from "path";
import { loadYamlSkillTree } from "../content/loader.js";
import { computeDifficulty } from "@skillclimb/core";
import type { SkillTreeDef, SeedDomain, SeedTopic, SeedNode } from "../seed/types.js";

async function upsertDomain(skilltreeId: string, values: {
  name: string;
  tier: number;
  description: string;
  prerequisites: string[];
  displayOrder: number;
}) {
  const [row] = await db
    .insert(domains)
    .values({ ...values, skilltreeId })
    .onConflictDoNothing()
    .returning();

  // If conflict (already exists), look it up
  if (!row) {
    const [existing] = await db.select().from(domains).where(
      and(eq(domains.skilltreeId, skilltreeId), eq(domains.name, values.name)),
    );
    return existing;
  }
  return row;
}

interface SeedData {
  domain: SeedDomain;
  topics: SeedTopic[];
  nodes: SeedNode[];
}

/**
 * Generalized seeding function for a single domain.
 * Uses a prefix to namespace topic names in the topicMap.
 */
async function seedDomain(
  skilltreeId: string,
  prefix: string,
  data: SeedData,
  tierBases: Record<number, number>,
  topicMap: Map<string, { id: string; domainId: string; complexityWeight: number }>,
): Promise<{ domainRow: typeof domains.$inferSelect; nodeCount: number }> {
  const domainRow = await upsertDomain(skilltreeId, {
    name: data.domain.name,
    tier: data.domain.tier,
    description: data.domain.description,
    prerequisites: data.domain.prerequisites,
    displayOrder: data.domain.displayOrder,
  });

  // Check if topics already exist for this domain
  const existingTopics = await db.select().from(topics).where(eq(topics.domainId, domainRow.id));

  if (existingTopics.length > 0) {
    // Build map from existing data
    for (const t of existingTopics) {
      // Look up complexity weight from seed data
      const seedTopic = data.topics.find((st) => st.name === t.name);
      topicMap.set(`${prefix}:${t.name}`, {
        id: t.id,
        domainId: domainRow.id,
        complexityWeight: seedTopic?.complexityWeight ?? t.complexityWeight,
      });
    }

    // Still need to update difficulty on existing nodes
    const existingNodes = await db.select().from(nodes).where(eq(nodes.domainId, domainRow.id));
    for (const n of existingNodes) {
      // Find which topic this node belongs to, then compute difficulty
      const nodeTopicEntry = existingTopics.find((t) => t.id === n.topicId);
      if (nodeTopicEntry) {
        const seedTopic = data.topics.find((st) => st.name === nodeTopicEntry.name);
        const cw = seedTopic?.complexityWeight ?? nodeTopicEntry.complexityWeight;
        const difficulty = computeDifficulty(tierBases, data.domain.tier, cw);
        if (n.difficulty !== difficulty) {
          await db
            .update(nodes)
            .set({ difficulty })
            .where(eq(nodes.id, n.id));
        }
      }
    }

    return { domainRow, nodeCount: 0 };
  }

  // Insert topics
  for (const t of data.topics) {
    const [row] = await db
      .insert(topics)
      .values({
        domainId: domainRow.id,
        name: t.name,
        complexityWeight: t.complexityWeight,
        displayOrder: t.displayOrder,
      })
      .returning();
    topicMap.set(`${prefix}:${t.name}`, {
      id: row.id,
      domainId: domainRow.id,
      complexityWeight: t.complexityWeight,
    });
  }

  // Insert nodes with difficulty
  let nodeCount = 0;
  for (const n of data.nodes) {
    const topic = topicMap.get(`${prefix}:${n.topicName}`);
    if (!topic) {
      console.warn(`Topic not found: ${prefix}:${n.topicName}`);
      continue;
    }
    const difficulty = computeDifficulty(tierBases, data.domain.tier, topic.complexityWeight);
    await db.insert(nodes).values({
      topicId: topic.id,
      domainId: topic.domainId,
      concept: n.concept,
      difficulty,
      questionTemplates: n.questionTemplates,
    });
    nodeCount++;
  }

  return { domainRow, nodeCount };
}

/**
 * Seeds the database from a skill tree definition.
 */
async function seedSkillTree(skilltree: SkillTreeDef) {
  console.log(`Loading skill tree: ${skilltree.name}`);

  // Upsert skilltree record
  await db.insert(skilltrees).values({ id: skilltree.id, name: skilltree.name })
    .onConflictDoNothing({ target: skilltrees.id });

  const topicMap = new Map<string, { id: string; domainId: string; complexityWeight: number }>();
  let totalNewNodes = 0;
  const domainRows = new Map<string, typeof domains.$inferSelect>();

  for (const { prefix, domain, topics: t, nodes: n } of skilltree.domains) {
    const { domainRow, nodeCount } = await seedDomain(
      skilltree.id,
      prefix,
      { domain, topics: t, nodes: n },
      skilltree.tierBases,
      topicMap,
    );
    domainRows.set(domain.name, domainRow);
    if (nodeCount > 0) {
      console.log(`  ${domain.name}: created ${nodeCount} nodes`);
    } else {
      console.log(`  ${domain.name}: already seeded`);
    }
    totalNewNodes += nodeCount;
  }

  console.log(`Seeded ${domainRows.size} domains with content (${totalNewNodes} new nodes)`);

  // Set prerequisites by domain name
  for (const [domainName, prereqNames] of Object.entries(skilltree.prerequisites)) {
    const domainRow = domainRows.get(domainName);
    if (!domainRow) continue;

    const prereqDomainNames = prereqNames.filter((n) => domainRows.has(n));
    if (prereqDomainNames.length > 0) {
      await db
        .update(domains)
        .set({ prerequisites: prereqDomainNames })
        .where(eq(domains.id, domainRow.id));
    }
  }

  console.log("Set prerequisites for dependent domains");

  // Seed placeholder domains
  let placeholderCount = 0;
  for (const d of skilltree.placeholderDomains) {
    const result = await db
      .insert(domains)
      .values({
        skilltreeId: skilltree.id,
        name: d.name,
        tier: d.tier,
        description: d.description,
        prerequisites: [],
        displayOrder: d.displayOrder,
      })
      .onConflictDoNothing()
      .returning();
    if (result.length > 0) placeholderCount++;
  }

  console.log(`Created ${placeholderCount} new placeholder domains (${skilltree.placeholderDomains.length - placeholderCount} already existed)`);
}

/**
 * Update question templates on existing nodes by matching on concept text.
 * Merges new template types into the JSONB array without replacing existing ones.
 */
async function updateTemplatesForSkillTree(skilltree: SkillTreeDef) {
  console.log(`Updating templates for skill tree: ${skilltree.name}`);

  let updatedCount = 0;

  for (const { domain: domainData, nodes: seedNodes } of skilltree.domains) {
    // Find the domain by name
    const [domainRow] = await db.select().from(domains).where(eq(domains.name, domainData.name));
    if (!domainRow) {
      console.log(`  Domain "${domainData.name}" not found, skipping`);
      continue;
    }

    // Get all existing nodes for this domain
    const existingNodes = await db.select().from(nodes).where(eq(nodes.domainId, domainRow.id));
    const nodesByConcept = new Map(existingNodes.map((n) => [n.concept, n]));

    for (const seedNode of seedNodes) {
      const existing = nodesByConcept.get(seedNode.concept);
      if (!existing) continue;

      const existingTemplates = existing.questionTemplates ?? [];
      const existingTypes = new Set(existingTemplates.map((t) => t.type));

      // Find new templates that don't exist yet
      const newTemplates = seedNode.questionTemplates.filter((t) => !existingTypes.has(t.type));
      if (newTemplates.length === 0) continue;

      // Merge: append new templates to existing
      const merged = [...existingTemplates, ...newTemplates] as typeof existingTemplates;
      await db
        .update(nodes)
        .set({ questionTemplates: merged })
        .where(eq(nodes.id, existing.id));
      updatedCount++;
    }

    console.log(`  ${domainData.name}: checked ${seedNodes.length} nodes`);
  }

  console.log(`Updated templates on ${updatedCount} nodes`);
}

async function seed() {
  console.log("Seeding database...");

  // Load skill trees from the content directory
  // Accept --skilltree <name> CLI arg, or default to all skill trees
  const args = process.argv.slice(2);
  const skilltreeArgIndex = args.indexOf("--skilltree");
  const requestedSkillTree = skilltreeArgIndex >= 0 ? args[skilltreeArgIndex + 1] : null;
  const updateTemplatesOnly = args.includes("--update-templates");

  // Discover available skill trees
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const contentDir = join(__dirname, "..", "content");

  let skilltreeDirs: string[];
  try {
    skilltreeDirs = readdirSync(contentDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  } catch {
    console.error(`No content directory found at ${contentDir}`);
    process.exit(1);
  }

  if (requestedSkillTree) {
    if (!skilltreeDirs.includes(requestedSkillTree)) {
      console.error(`Skill tree "${requestedSkillTree}" not found. Available: ${skilltreeDirs.join(", ")}`);
      process.exit(1);
    }
    skilltreeDirs = [requestedSkillTree];
  }

  for (const skilltreeDir of skilltreeDirs) {
    const fullSkilltreeDir = join(contentDir, skilltreeDir);
    let skilltree: SkillTreeDef;

    if (existsSync(join(fullSkilltreeDir, "skilltree.yaml"))) {
      skilltree = loadYamlSkillTree(fullSkilltreeDir);
    } else {
      const skilltreePath = pathToFileURL(join(fullSkilltreeDir, "index.ts")).href;
      const skilltreeModule = await import(skilltreePath);
      skilltree = skilltreeModule.default;
    }

    if (updateTemplatesOnly) {
      await updateTemplatesForSkillTree(skilltree);
    } else {
      await seedSkillTree(skilltree);
    }
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
