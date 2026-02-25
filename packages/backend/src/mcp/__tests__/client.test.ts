import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import {
  createTestApp,
  makeSkilltree,
  makeDomain,
  makeTopic,
  makeNode,
  makeLearnerNode,
  makeSession,
  resetIdCounter,
} from "../../routes/__tests__/helpers.js";
import { createAccessToken } from "../../services/auth.service.js";
import { SkillClimbClient } from "../client.js";

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const USER_ID = "user-1";

function buildFixtures() {
  resetIdCounter();

  const st = makeSkilltree({ id: "cybersecurity", name: "Cybersecurity" });
  const domain = makeDomain({
    id: "domain-1",
    skilltreeId: "cybersecurity",
    name: "Network Fundamentals",
    tier: 1,
  });
  const topic = makeTopic({
    id: "topic-1",
    domainId: "domain-1",
    name: "TCP/IP",
  });
  const node = makeNode({
    id: "node-1",
    topicId: "topic-1",
    domainId: "domain-1",
    concept: "TCP Handshake",
    questionTemplates: [
      {
        type: "recognition",
        prompt: "What is a TCP handshake?",
        choices: ["Three-way handshake", "Two-way handshake"],
        correctAnswer: "Three-way handshake",
        explanation: "TCP uses a three-way handshake",
      },
    ],
  });
  const learnerNode = makeLearnerNode({
    userId: USER_ID,
    nodeId: "node-1",
    domainId: "domain-1",
    dueDate: new Date(Date.now() - 86400000), // due yesterday
  });
  const session = makeSession({
    id: "session-1",
    userId: USER_ID,
    nodeIds: ["node-1"],
    itemCount: 1,
  });

  return {
    skilltrees: [st],
    domains: [domain],
    topics: [topic],
    nodes: [node],
    learner_nodes: [learnerNode],
    sessions: [session],
  };
}

// ---------------------------------------------------------------------------
// Server lifecycle
// ---------------------------------------------------------------------------

let server: Server;
let client: SkillClimbClient;

beforeAll(async () => {
  const fixtures = buildFixtures();
  const app = createTestApp(fixtures);
  server = app.listen(0);
  const { port } = server.address() as AddressInfo;
  const token = await createAccessToken(USER_ID);
  client = new SkillClimbClient(`http://localhost:${port}`, token);
});

afterAll(() => {
  server?.close();
});

// ═══════════════════════════════════════════════════════════════════════════
// Content discovery
// ═══════════════════════════════════════════════════════════════════════════

describe("content discovery", () => {
  it("listSkilltrees returns array", async () => {
    const result = (await client.listSkilltrees()) as any[];
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[0]).toHaveProperty("id", "cybersecurity");
  });

  it("listDomains returns array", async () => {
    const result = (await client.listDomains()) as any[];
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  it("listDomains with skilltreeId filters correctly", async () => {
    const result = (await client.listDomains("cybersecurity")) as any[];
    expect(Array.isArray(result)).toBe(true);
    for (const domain of result) {
      expect(domain.skilltreeId).toBe("cybersecurity");
    }
  });

  it("listDomains with nonexistent skilltreeId returns empty array", async () => {
    const result = (await client.listDomains("nonexistent")) as any[];
    expect(result).toEqual([]);
  });

  it("getSkilltreeMap returns tree hierarchy", async () => {
    const result = (await client.getSkilltreeMap("cybersecurity")) as any[];
    expect(Array.isArray(result)).toBe(true);
    if (result.length > 0) {
      expect(result[0]).toHaveProperty("id");
      expect(result[0]).toHaveProperty("name");
      expect(result[0]).toHaveProperty("topics");
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// User endpoints
// ═══════════════════════════════════════════════════════════════════════════

describe("user endpoints", () => {
  it("getUserProgress returns progress shape", async () => {
    const result = (await client.getUserProgress()) as any;
    expect(result).toHaveProperty("totalNodes");
    expect(result).toHaveProperty("mastered");
    expect(result).toHaveProperty("inProgress");
    expect(result).toHaveProperty("notStarted");
    expect(result).toHaveProperty("masteryPercentage");
    expect(result).toHaveProperty("domains");
  });

  it("getUserProfile returns profile shape", async () => {
    const result = (await client.getUserProfile()) as any;
    expect(result).toHaveProperty("totalMastered");
    expect(result).toHaveProperty("totalNodes");
    expect(result).toHaveProperty("badges");
    expect(result).toHaveProperty("streak");
  });

  it("getDueItems returns array", async () => {
    const result = (await client.getDueItems()) as any[];
    expect(Array.isArray(result)).toBe(true);
  });

  it("getSessionHistory returns array", async () => {
    const result = (await client.getSessionHistory()) as any[];
    expect(Array.isArray(result)).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Sessions
// ═══════════════════════════════════════════════════════════════════════════

describe("sessions", () => {
  it("createSession returns session with id", async () => {
    const result = (await client.createSession()) as any;
    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("userId");
  });

  it("getSession returns session details", async () => {
    const result = (await client.getSession("session-1")) as any;
    expect(result).toHaveProperty("id", "session-1");
    expect(result).toHaveProperty("items");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Answers
// ═══════════════════════════════════════════════════════════════════════════

describe("answers", () => {
  it("submitAnswer scores a recognition answer", async () => {
    const result = (await client.submitAnswer({
      nodeId: "node-1",
      answer: "Three-way handshake",
      confidence: 4,
      questionType: "recognition",
    })) as any;

    expect(result).toHaveProperty("score");
    expect(result).toHaveProperty("wasCorrect");
    expect(result).toHaveProperty("feedback");
    expect(result.feedback).toHaveProperty("correctAnswer");
    expect(result.feedback).toHaveProperty("explanation");
    expect(result).toHaveProperty("srs");
    expect(result).toHaveProperty("calibration");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Session completion
// ═══════════════════════════════════════════════════════════════════════════

describe("session completion", () => {
  it("completeSession returns completion summary", async () => {
    const result = (await client.completeSession("session-1")) as any;

    expect(result).toHaveProperty("id", "session-1");
    expect(result).toHaveProperty("completedAt");
    expect(result).toHaveProperty("summary");
    expect(result.summary).toHaveProperty("totalReviews");
    expect(result.summary).toHaveProperty("accuracyPercentage");
    expect(result).toHaveProperty("momentum");
    expect(result).toHaveProperty("nextSession");
  });

  it("completeSession throws for nonexistent session", async () => {
    await expect(client.completeSession("00000000-0000-0000-0000-000000000099")).rejects.toThrow(/HTTP/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Error handling
// ═══════════════════════════════════════════════════════════════════════════

describe("error handling", () => {
  it("invalid token throws with HTTP 401", async () => {
    const { port } = server.address() as AddressInfo;
    const badClient = new SkillClimbClient(
      `http://localhost:${port}`,
      "invalid-token",
    );

    await expect(badClient.getUserProgress()).rejects.toThrow("HTTP 401");
  });

  it("nonexistent session throws with appropriate HTTP error", async () => {
    await expect(client.getSession("nonexistent-id")).rejects.toThrow(/HTTP/);
  });
});
