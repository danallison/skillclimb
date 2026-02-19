import { eq } from "drizzle-orm";
import { db } from "./connection.js";
import { domains, topics, nodes } from "./schema.js";
import { readdirSync } from "fs";
import { fileURLToPath, pathToFileURL } from "url";
import { dirname, join } from "path";
import { computeDifficulty } from "@skillclimb/core";
import type { ContentPack, SeedDomain, SeedTopic, SeedNode } from "../seed/types.js";

async function upsertDomain(values: {
  name: string;
  tier: number;
  description: string;
  prerequisites: string[];
  displayOrder: number;
}) {
  const [row] = await db
    .insert(domains)
    .values(values)
    .onConflictDoNothing({ target: domains.name })
    .returning();

  // If conflict (already exists), look it up
  if (!row) {
    const [existing] = await db.select().from(domains).where(eq(domains.name, values.name));
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
  prefix: string,
  data: SeedData,
  tierBases: Record<number, number>,
  topicMap: Map<string, { id: string; domainId: string; complexityWeight: number }>,
): Promise<{ domainRow: typeof domains.$inferSelect; nodeCount: number }> {
  const domainRow = await upsertDomain({
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
 * Seeds the database from a content pack.
 */
async function seedContentPack(pack: ContentPack) {
  console.log(`Loading content pack: ${pack.name}`);

  const topicMap = new Map<string, { id: string; domainId: string; complexityWeight: number }>();
  let totalNewNodes = 0;
  const domainRows = new Map<string, typeof domains.$inferSelect>();

  for (const { prefix, domain, topics: t, nodes: n } of pack.domains) {
    const { domainRow, nodeCount } = await seedDomain(
      prefix,
      { domain, topics: t, nodes: n },
      pack.tierBases,
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
  for (const [domainName, prereqNames] of Object.entries(pack.prerequisites)) {
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
  for (const d of pack.placeholderDomains) {
    const result = await db
      .insert(domains)
      .values({
        name: d.name,
        tier: d.tier,
        description: d.description,
        prerequisites: [],
        displayOrder: d.displayOrder,
      })
      .onConflictDoNothing({ target: domains.name })
      .returning();
    if (result.length > 0) placeholderCount++;
  }

  console.log(`Created ${placeholderCount} new placeholder domains (${pack.placeholderDomains.length - placeholderCount} already existed)`);
}

async function seed() {
  console.log("Seeding database...");

  // Load content packs from the content directory
  // Accept --pack <name> CLI arg, or default to all packs
  const args = process.argv.slice(2);
  const packArgIndex = args.indexOf("--pack");
  const requestedPack = packArgIndex >= 0 ? args[packArgIndex + 1] : null;

  // Discover available content packs
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const contentDir = join(__dirname, "..", "content");

  let packDirs: string[];
  try {
    packDirs = readdirSync(contentDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  } catch {
    console.error(`No content directory found at ${contentDir}`);
    process.exit(1);
  }

  if (requestedPack) {
    if (!packDirs.includes(requestedPack)) {
      console.error(`Content pack "${requestedPack}" not found. Available: ${packDirs.join(", ")}`);
      process.exit(1);
    }
    packDirs = [requestedPack];
  }

  for (const packDir of packDirs) {
    const packPath = pathToFileURL(join(contentDir, packDir, "index.ts")).href;
    const packModule = await import(packPath);
    const pack: ContentPack = packModule.default;
    await seedContentPack(pack);
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
