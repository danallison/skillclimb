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

async function seed() {
  console.log("Seeding database...");

  // Upsert domains
  const netDomain = await upsertDomain({
    name: networkingDomain.name,
    tier: networkingDomain.tier,
    description: networkingDomain.description,
    prerequisites: networkingDomain.prerequisites,
    displayOrder: networkingDomain.displayOrder,
  });

  const secDomain = await upsertDomain({
    name: securityDomain.name,
    tier: securityDomain.tier,
    description: securityDomain.description,
    prerequisites: securityDomain.prerequisites,
    displayOrder: securityDomain.displayOrder,
  });

  console.log(`Domains: ${netDomain.name} (${netDomain.id}), ${secDomain.name} (${secDomain.id})`);

  // Check if topics already exist for these domains
  const existingTopics = await db.select().from(topics).where(eq(topics.domainId, netDomain.id));
  const topicMap = new Map<string, { id: string; domainId: string }>();

  if (existingTopics.length > 0) {
    console.log("Topics already exist, skipping topic/node seeding");
    // Build map from existing data
    const allTopics = await db.select().from(topics);
    for (const t of allTopics) {
      if (t.domainId === netDomain.id) {
        topicMap.set(`net:${t.name}`, { id: t.id, domainId: netDomain.id });
      } else if (t.domainId === secDomain.id) {
        topicMap.set(`sec:${t.name}`, { id: t.id, domainId: secDomain.id });
      }
    }
  } else {
    // Insert topics
    for (const t of networkingTopics) {
      const [row] = await db
        .insert(topics)
        .values({
          domainId: netDomain.id,
          name: t.name,
          complexityWeight: t.complexityWeight,
          displayOrder: t.displayOrder,
        })
        .returning();
      topicMap.set(`net:${t.name}`, { id: row.id, domainId: netDomain.id });
    }

    for (const t of securityTopics) {
      const [row] = await db
        .insert(topics)
        .values({
          domainId: secDomain.id,
          name: t.name,
          complexityWeight: t.complexityWeight,
          displayOrder: t.displayOrder,
        })
        .returning();
      topicMap.set(`sec:${t.name}`, { id: row.id, domainId: secDomain.id });
    }

    console.log(`Created ${topicMap.size} topics`);

    // Insert nodes
    let nodeCount = 0;

    for (const n of networkingNodes) {
      const topic = topicMap.get(`net:${n.topicName}`);
      if (!topic) {
        console.warn(`Topic not found: net:${n.topicName}`);
        continue;
      }
      await db.insert(nodes).values({
        topicId: topic.id,
        domainId: topic.domainId,
        concept: n.concept,
        questionTemplates: n.questionTemplates,
      });
      nodeCount++;
    }

    for (const n of securityNodes) {
      const topic = topicMap.get(`sec:${n.topicName}`);
      if (!topic) {
        console.warn(`Topic not found: sec:${n.topicName}`);
        continue;
      }
      await db.insert(nodes).values({
        topicId: topic.id,
        domainId: topic.domainId,
        concept: n.concept,
        questionTemplates: n.questionTemplates,
      });
      nodeCount++;
    }

    console.log(`Created ${nodeCount} nodes`);
  }

  // Seed placeholder domains for the full skill tree (no topics/nodes yet)
  const placeholderDomains = [
    // T0: Foundations (networking + security already seeded above)
    { tier: 0, name: "Operating Systems", description: "Linux and Windows fundamentals, file systems, processes, and permissions", displayOrder: 3 },
    { tier: 0, name: "Programming Fundamentals", description: "Scripting with Python and Bash, data structures, and basic algorithms for security tooling", displayOrder: 4 },

    // T1: Core Technical
    { tier: 1, name: "Cryptography", description: "Symmetric and asymmetric encryption, hashing, PKI, TLS, and cryptanalysis fundamentals", displayOrder: 5 },
    { tier: 1, name: "Web Application Security", description: "OWASP Top 10, injection attacks, authentication flaws, and secure development practices", displayOrder: 6 },
    { tier: 1, name: "System Administration", description: "Hardening, patch management, logging, and secure configuration of servers and endpoints", displayOrder: 7 },
    { tier: 1, name: "Identity & Access Management", description: "Authentication protocols, directory services, federation, SSO, and privilege management", displayOrder: 8 },
    { tier: 1, name: "Network Defense", description: "Firewalls, IDS/IPS, network segmentation, VPNs, and traffic analysis", displayOrder: 9 },

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
