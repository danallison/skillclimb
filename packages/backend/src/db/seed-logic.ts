import { eq, and, isNull, inArray } from "drizzle-orm";
import { skilltrees, domains, topics, nodes } from "./schema.js";
import { computeDifficulty } from "@skillclimb/core";
import type { SkillTreeDef, SeedDomain, SeedTopic, SeedNode } from "../seed/types.js";
import type { db as dbType } from "./connection.js";

// Accept both the db connection and a transaction client
export type DbClient = typeof dbType;

export async function upsertDomain(client: DbClient, skilltreeId: string, values: {
  name: string;
  tier: number;
  description: string;
  prerequisites: string[];
  displayOrder: number;
}) {
  const [row] = await client
    .insert(domains)
    .values({ ...values, skilltreeId })
    .onConflictDoNothing()
    .returning();

  // If conflict (already exists), look it up
  if (!row) {
    const [existing] = await client.select().from(domains).where(
      and(eq(domains.skilltreeId, skilltreeId), eq(domains.name, values.name)),
    );
    return existing;
  }
  return row;
}

export interface SeedData {
  domain: SeedDomain;
  topics: SeedTopic[];
  nodes: SeedNode[];
}

/**
 * Merge question templates: keep existing templates, append new types from seed.
 */
export function mergeTemplates(
  existing: typeof nodes.$inferSelect["questionTemplates"],
  seed: typeof nodes.$inferSelect["questionTemplates"],
): typeof nodes.$inferSelect["questionTemplates"] {
  const existingTypes = new Set(existing.map((t) => t.type));
  const newTemplates = seed.filter((t) => !existingTypes.has(t.type));
  return [...existing, ...newTemplates];
}

/**
 * Generalized seeding function for a single domain.
 * Incrementally upserts topics/nodes and retires absent content.
 */
export async function seedDomain(
  client: DbClient,
  skilltreeId: string,
  prefix: string,
  data: SeedData,
  tierBases: Record<number, number>,
  topicMap: Map<string, { id: string; domainId: string; complexityWeight: number }>,
): Promise<{ domainRow: typeof domains.$inferSelect; created: number; updated: number; retired: number }> {
  const domainRow = await upsertDomain(client, skilltreeId, {
    name: data.domain.name,
    tier: data.domain.tier,
    description: data.domain.description,
    prerequisites: data.domain.prerequisites,
    displayOrder: data.domain.displayOrder,
  });

  let created = 0;
  let updated = 0;
  let retired = 0;

  // Upsert each topic
  const seedTopicNames = new Set(data.topics.map((t) => t.name));
  for (const t of data.topics) {
    const [row] = await client
      .insert(topics)
      .values({
        domainId: domainRow.id,
        name: t.name,
        complexityWeight: t.complexityWeight,
        displayOrder: t.displayOrder,
        retiredAt: null,
      })
      .onConflictDoUpdate({
        target: [topics.domainId, topics.name],
        set: {
          complexityWeight: t.complexityWeight,
          displayOrder: t.displayOrder,
          retiredAt: null,
        },
      })
      .returning();
    topicMap.set(`${prefix}:${t.name}`, {
      id: row.id,
      domainId: domainRow.id,
      complexityWeight: t.complexityWeight,
    });
  }

  // Upsert each node with template merging
  const seedConcepts = new Set(data.nodes.map((n) => n.concept));
  for (const n of data.nodes) {
    const topic = topicMap.get(`${prefix}:${n.topicName}`);
    if (!topic) {
      console.warn(`Topic not found: ${prefix}:${n.topicName}`);
      continue;
    }
    const difficulty = computeDifficulty(tierBases, data.domain.tier, topic.complexityWeight);

    // Check if node already exists to merge templates
    const [existingNode] = await client.select().from(nodes).where(
      and(eq(nodes.domainId, domainRow.id), eq(nodes.concept, n.concept)),
    );

    if (existingNode) {
      const mergedTemplates = mergeTemplates(existingNode.questionTemplates, n.questionTemplates);
      await client
        .update(nodes)
        .set({
          topicId: topic.id,
          difficulty,
          questionTemplates: mergedTemplates,
          retiredAt: null,
        })
        .where(eq(nodes.id, existingNode.id));
      updated++;
    } else {
      await client.insert(nodes).values({
        topicId: topic.id,
        domainId: topic.domainId,
        concept: n.concept,
        difficulty,
        questionTemplates: n.questionTemplates,
      });
      created++;
    }
  }

  // Retire topics not in YAML (only those currently active)
  const existingTopics = await client.select().from(topics).where(
    and(eq(topics.domainId, domainRow.id), isNull(topics.retiredAt)),
  );
  const topicsToRetire = existingTopics.filter((t) => !seedTopicNames.has(t.name));
  if (topicsToRetire.length > 0) {
    const retireIds = topicsToRetire.map((t) => t.id);
    await client
      .update(topics)
      .set({ retiredAt: new Date() })
      .where(inArray(topics.id, retireIds));

    // Also retire all nodes belonging to retired topics
    await client
      .update(nodes)
      .set({ retiredAt: new Date() })
      .where(and(inArray(nodes.topicId, retireIds), isNull(nodes.retiredAt)));

    retired += topicsToRetire.length;
  }

  // Retire nodes not in YAML (only active nodes in non-retired topics)
  const activeTopicIds = existingTopics
    .filter((t) => seedTopicNames.has(t.name))
    .map((t) => t.id);

  if (activeTopicIds.length > 0) {
    const activeNodes = await client.select().from(nodes).where(
      and(
        eq(nodes.domainId, domainRow.id),
        inArray(nodes.topicId, activeTopicIds),
        isNull(nodes.retiredAt),
      ),
    );
    const nodesToRetire = activeNodes.filter((n) => !seedConcepts.has(n.concept));
    if (nodesToRetire.length > 0) {
      const retireNodeIds = nodesToRetire.map((n) => n.id);
      await client
        .update(nodes)
        .set({ retiredAt: new Date() })
        .where(inArray(nodes.id, retireNodeIds));
      retired += nodesToRetire.length;
    }
  }

  return { domainRow, created, updated, retired };
}

/**
 * Seeds the database from a skill tree definition.
 */
export async function seedSkillTree(client: DbClient, skilltree: SkillTreeDef) {
  console.log(`Loading skill tree: ${skilltree.name}`);

  // Upsert skilltree record
  await client.insert(skilltrees).values({ id: skilltree.id, name: skilltree.name })
    .onConflictDoNothing({ target: skilltrees.id });

  const topicMap = new Map<string, { id: string; domainId: string; complexityWeight: number }>();
  const domainRows = new Map<string, typeof domains.$inferSelect>();

  let totalCreated = 0;
  let totalUpdated = 0;
  let totalRetired = 0;

  for (const { prefix, domain, topics: t, nodes: n } of skilltree.domains) {
    const { domainRow, created, updated, retired } = await seedDomain(
      client,
      skilltree.id,
      prefix,
      { domain, topics: t, nodes: n },
      skilltree.tierBases,
      topicMap,
    );
    domainRows.set(domain.name, domainRow);
    const parts: string[] = [];
    if (created > 0) parts.push(`${created} created`);
    if (updated > 0) parts.push(`${updated} updated`);
    if (retired > 0) parts.push(`${retired} retired`);
    console.log(`  ${domain.name}: ${parts.length > 0 ? parts.join(", ") : "no changes"}`);
    totalCreated += created;
    totalUpdated += updated;
    totalRetired += retired;
  }

  console.log(`Seeded ${domainRows.size} domains (${totalCreated} created, ${totalUpdated} updated, ${totalRetired} retired)`);

  // Set prerequisites by domain name
  for (const [domainName, prereqNames] of Object.entries(skilltree.prerequisites)) {
    const domainRow = domainRows.get(domainName);
    if (!domainRow) continue;

    const prereqDomainNames = prereqNames.filter((n) => domainRows.has(n));
    if (prereqDomainNames.length > 0) {
      await client
        .update(domains)
        .set({ prerequisites: prereqDomainNames })
        .where(eq(domains.id, domainRow.id));
    }
  }

  console.log("Set prerequisites for dependent domains");

  // Seed placeholder domains
  let placeholderCount = 0;
  for (const d of skilltree.placeholderDomains) {
    const result = await client
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
export async function updateTemplatesForSkillTree(client: DbClient, skilltree: SkillTreeDef) {
  console.log(`Updating templates for skill tree: ${skilltree.name}`);

  let updatedCount = 0;

  for (const { domain: domainData, nodes: seedNodes } of skilltree.domains) {
    // Find the domain by name, scoped to this skill tree
    const [domainRow] = await client.select().from(domains).where(
      and(eq(domains.skilltreeId, skilltree.id), eq(domains.name, domainData.name)),
    );
    if (!domainRow) {
      console.log(`  Domain "${domainData.name}" not found, skipping`);
      continue;
    }

    // Get all existing nodes for this domain
    const existingNodes = await client.select().from(nodes).where(eq(nodes.domainId, domainRow.id));
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
      await client
        .update(nodes)
        .set({ questionTemplates: merged })
        .where(eq(nodes.id, existing.id));
      updatedCount++;
    }

    console.log(`  ${domainData.name}: checked ${seedNodes.length} nodes`);
  }

  console.log(`Updated templates on ${updatedCount} nodes`);
}
