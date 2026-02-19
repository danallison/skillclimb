import { eq } from "drizzle-orm";
import { db } from "./connection.js";
import { domains, topics, nodes } from "./schema.js";
import {
  domain as networkingDomain,
  topics as networkingTopics,
  nodes as networkingNodes,
} from "../seed/networking-fundamentals.js";
import {
  domain as securityDomain,
  topics as securityTopics,
  nodes as securityNodes,
} from "../seed/security-principles.js";
import {
  domain as osDomain,
  topics as osTopics,
  nodes as osNodes,
} from "../seed/operating-systems.js";
import {
  domain as cryptoDomain,
  topics as cryptoTopics,
  nodes as cryptoNodes,
} from "../seed/cryptography.js";
import {
  domain as iamDomain,
  topics as iamTopics,
  nodes as iamNodes,
} from "../seed/identity-access.js";
import {
  domain as netDefDomain,
  topics as netDefTopics,
  nodes as netDefNodes,
} from "../seed/network-defense.js";
import {
  domain as threatDomain,
  topics as threatTopics,
  nodes as threatNodes,
} from "../seed/threat-landscape.js";

import type { SeedDomain, SeedTopic, SeedNode } from "../seed/networking-fundamentals.js";

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

// Difficulty formula: tierBase + (complexityWeight - 1.0) * 2
const TIER_BASES: Record<number, number> = {
  0: -2.0,
  1: -0.5,
  2: 1.0,
  3: 2.0,
  4: 3.0,
};

function computeDifficulty(tier: number, complexityWeight: number): number {
  const base = TIER_BASES[tier] ?? 0;
  return base + (complexityWeight - 1.0) * 2;
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
        const difficulty = computeDifficulty(data.domain.tier, cw);
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
    const difficulty = computeDifficulty(data.domain.tier, topic.complexityWeight);
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

async function seed() {
  console.log("Seeding database...");

  const topicMap = new Map<string, { id: string; domainId: string; complexityWeight: number }>();

  // All domain seed data in order
  const allSeeds: Array<{ prefix: string; data: SeedData }> = [
    { prefix: "net", data: { domain: networkingDomain, topics: networkingTopics, nodes: networkingNodes } },
    { prefix: "sec", data: { domain: securityDomain, topics: securityTopics, nodes: securityNodes } },
    { prefix: "os", data: { domain: osDomain, topics: osTopics, nodes: osNodes } },
    { prefix: "crypto", data: { domain: cryptoDomain, topics: cryptoTopics, nodes: cryptoNodes } },
    { prefix: "iam", data: { domain: iamDomain, topics: iamTopics, nodes: iamNodes } },
    { prefix: "netdef", data: { domain: netDefDomain, topics: netDefTopics, nodes: netDefNodes } },
    { prefix: "threat", data: { domain: threatDomain, topics: threatTopics, nodes: threatNodes } },
  ];

  let totalNewNodes = 0;
  const domainRows = new Map<string, typeof domains.$inferSelect>();

  for (const { prefix, data } of allSeeds) {
    const { domainRow, nodeCount } = await seedDomain(prefix, data, topicMap);
    domainRows.set(data.domain.name, domainRow);
    if (nodeCount > 0) {
      console.log(`  ${data.domain.name}: created ${nodeCount} nodes`);
    } else {
      console.log(`  ${data.domain.name}: already seeded`);
    }
    totalNewNodes += nodeCount;
  }

  console.log(`Seeded ${domainRows.size} domains with content (${totalNewNodes} new nodes)`);

  // Set prerequisites by domain name
  const prerequisiteMap: Record<string, string[]> = {
    "Cryptography": ["Security Principles"],
    "Identity & Access Management": ["Security Principles"],
    "Network Defense": ["Networking Fundamentals"],
    "Threat Landscape": ["Security Principles"],
  };

  for (const [domainName, prereqNames] of Object.entries(prerequisiteMap)) {
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

  // Seed placeholder domains for the full skill tree (no topics/nodes yet)
  const placeholderDomains = [
    // T0: Foundations (networking, security, OS already seeded above)
    { tier: 0, name: "Programming Fundamentals", description: "Scripting with Python and Bash, data structures, and basic algorithms for security tooling", displayOrder: 4 },

    // T1: Core Technical (crypto, IAM, netdef, threat already seeded above)
    { tier: 1, name: "Web Application Security", description: "OWASP Top 10, injection attacks, authentication flaws, and secure development practices", displayOrder: 6 },
    { tier: 1, name: "System Administration", description: "Hardening, patch management, logging, and secure configuration of servers and endpoints", displayOrder: 7 },

    // T2: Intermediate
    { tier: 2, name: "Penetration Testing", description: "Reconnaissance, scanning, exploitation, post-exploitation, and reporting methodologies", displayOrder: 10 },
    { tier: 2, name: "SOC Operations", description: "Security monitoring, SIEM, incident triage, alert analysis, and threat hunting", displayOrder: 11 },
    { tier: 2, name: "Digital Forensics", description: "Evidence collection, disk and memory forensics, timeline analysis, and chain of custody", displayOrder: 12 },
    { tier: 2, name: "Cloud Security", description: "AWS/Azure/GCP security controls, shared responsibility, IAM policies, and cloud-native threats", displayOrder: 13 },
    { tier: 2, name: "Malware Analysis", description: "Static and dynamic analysis, reverse engineering, behavioral indicators, and sandboxing", displayOrder: 14 },

    // T3: Advanced
    { tier: 3, name: "Exploit Development", description: "Buffer overflows, ROP chains, shellcode, and vulnerability research techniques", displayOrder: 15 },
    { tier: 3, name: "Threat Intelligence", description: "MITRE ATT&CK, threat actor profiling, IOC analysis, and intelligence-driven defense", displayOrder: 16 },
    { tier: 3, name: "Incident Response", description: "IR planning, containment, eradication, recovery, and post-incident analysis", displayOrder: 17 },
    { tier: 3, name: "Security Architecture", description: "Zero trust, defense in depth, secure design patterns, and enterprise security frameworks", displayOrder: 18 },
    { tier: 3, name: "AI Security", description: "Adversarial ML, LLM security, AI for SOC automation, and AI governance", displayOrder: 19 },

    // T4: Specialization
    { tier: 4, name: "Red Team Operations", description: "Advanced adversary simulation, C2 frameworks, evasion techniques, and physical security", displayOrder: 20 },
    { tier: 4, name: "Application Security Engineering", description: "Secure SDLC, threat modeling, code review, SAST/DAST, and DevSecOps pipelines", displayOrder: 21 },
    { tier: 4, name: "GRC & Compliance", description: "Risk frameworks, NIST, ISO 27001, SOC 2, regulatory compliance, and audit preparation", displayOrder: 22 },
    { tier: 4, name: "ICS/OT Security", description: "SCADA systems, industrial protocols, air-gapped networks, and critical infrastructure defense", displayOrder: 23 },
  ];

  let placeholderCount = 0;
  for (const d of placeholderDomains) {
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

  console.log(`Created ${placeholderCount} new placeholder domains (${placeholderDomains.length - placeholderCount} already existed)`);
  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
