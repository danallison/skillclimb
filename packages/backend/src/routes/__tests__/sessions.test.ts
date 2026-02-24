import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import {
  createTestApp,
  makeLearnerNode,
  makeNode,
  makeSession,
  authCookie,
  resetIdCounter,
} from "./helpers.js";

describe("POST /api/sessions", () => {
  beforeEach(() => resetIdCounter());

  it("returns 201 with session data", async () => {
    const userId = "user-1";
    const nodeId = "node-1";
    const node = makeNode({
      id: nodeId,
      domainId: "domain-1",
      questionTemplates: [
        {
          type: "recognition",
          prompt: "What is TCP?",
          choices: ["A protocol", "A language"],
          correctAnswer: "A protocol",
          explanation: "TCP is a protocol",
        },
      ],
    });
    const learnerNode = makeLearnerNode({
      userId,
      nodeId,
      domainId: "domain-1",
      dueDate: new Date(Date.now() - 86400000), // due yesterday
    });

    const sessionRow = makeSession({ userId, nodeIds: [nodeId], itemCount: 1 });

    const app = createTestApp({
      learner_nodes: [learnerNode],
      nodes: [node],
      sessions: [sessionRow],
    });
    const cookie = await authCookie(userId);

    const res = await request(app)
      .post("/api/sessions")
      .set("Cookie", cookie)
      .send({});

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("userId");
    expect(res.body).toHaveProperty("startedAt");
    expect(res.body).toHaveProperty("items");
    expect(res.body).toHaveProperty("totalItems");
  });

  it("returns 400 when skilltreeId is a number", async () => {
    const app = createTestApp();
    const cookie = await authCookie("user-1");

    const res = await request(app)
      .post("/api/sessions")
      .set("Cookie", cookie)
      .send({ skilltreeId: 123 });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/skilltreeId/);
  });

  it("returns 401 without auth", async () => {
    const app = createTestApp();

    const res = await request(app).post("/api/sessions").send({});

    expect(res.status).toBe(401);
  });
});

describe("GET /api/sessions/:id", () => {
  beforeEach(() => resetIdCounter());

  it("returns 200 with session", async () => {
    const userId = "user-1";
    const nodeId = "node-1";
    const sessionId = "session-1";
    const node = makeNode({
      id: nodeId,
      domainId: "domain-1",
      questionTemplates: [
        {
          type: "recognition",
          prompt: "What is TCP?",
          choices: ["A protocol", "A language"],
          correctAnswer: "A protocol",
          explanation: "TCP is a protocol",
        },
      ],
    });
    const learnerNode = makeLearnerNode({
      userId,
      nodeId,
      domainId: "domain-1",
    });
    const sessionRow = makeSession({
      id: sessionId,
      userId,
      nodeIds: [nodeId],
      itemCount: 1,
    });

    const app = createTestApp({
      sessions: [sessionRow],
      nodes: [node],
      learner_nodes: [learnerNode],
    });
    const cookie = await authCookie(userId);

    const res = await request(app)
      .get(`/api/sessions/${sessionId}`)
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id", sessionId);
    expect(res.body).toHaveProperty("items");
  });

  it("returns 404 for nonexistent session", async () => {
    const app = createTestApp({ sessions: [] });
    const cookie = await authCookie("user-1");

    const res = await request(app)
      .get("/api/sessions/nonexistent-id")
      .set("Cookie", cookie);

    expect(res.status).toBe(404);
  });

  it("returns 404 when accessing another user's session", async () => {
    const ownerUserId = "user-A";
    const otherUserId = "user-B";
    const sessionId = "session-1";
    const nodeId = "node-1";
    const node = makeNode({
      id: nodeId,
      domainId: "domain-1",
      questionTemplates: [
        {
          type: "recognition",
          prompt: "What is TCP?",
          choices: ["A protocol", "A language"],
          correctAnswer: "A protocol",
          explanation: "TCP is a protocol",
        },
      ],
    });
    const learnerNode = makeLearnerNode({
      userId: ownerUserId,
      nodeId,
      domainId: "domain-1",
    });
    const sessionRow = makeSession({
      id: sessionId,
      userId: ownerUserId,
      nodeIds: [nodeId],
      itemCount: 1,
    });

    const app = createTestApp({
      sessions: [sessionRow],
      nodes: [node],
      learner_nodes: [learnerNode],
    });
    // Authenticate as a different user
    const cookie = await authCookie(otherUserId);

    const res = await request(app)
      .get(`/api/sessions/${sessionId}`)
      .set("Cookie", cookie);

    expect(res.status).toBe(404);
  });

  it("returns 401 without auth", async () => {
    const app = createTestApp();

    const res = await request(app).get("/api/sessions/some-id");

    expect(res.status).toBe(401);
  });
});
