import { describe, it, expect, beforeEach } from "vitest";
import { Effect } from "effect";
import request from "supertest";
import {
  createTestApp,
  makeNode,
  makeLearnerNode,
  authCookie,
  resetIdCounter,
} from "./helpers.js";

describe("POST /api/reviews", () => {
  beforeEach(() => resetIdCounter());

  it("returns 201 with valid review submission", async () => {
    const nodeId = "node-review-1";
    const userId = "user-1";
    const node = makeNode({ id: nodeId });
    const learnerNode = makeLearnerNode({
      userId,
      nodeId,
      easiness: 2.5,
      interval: 0,
      repetitions: 0,
      confidenceHistory: [],
      misconceptions: [],
    });
    const app = createTestApp({
      nodes: [node],
      learner_nodes: [learnerNode],
    });
    const cookie = await authCookie(userId);

    const res = await request(app)
      .post("/api/reviews")
      .set("Cookie", cookie)
      .send({ nodeId, score: 4, confidence: 3, response: "my answer" });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("previousState");
    expect(res.body).toHaveProperty("nextState");
    expect(res.body).toHaveProperty("wasCorrect");
    expect(res.body).toHaveProperty("calibrationQuadrant");
  });

  it("returns 400 when nodeId is missing", async () => {
    const app = createTestApp();
    const cookie = await authCookie("user-1");

    const res = await request(app)
      .post("/api/reviews")
      .set("Cookie", cookie)
      .send({ score: 4, confidence: 3 });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/nodeId/);
  });

  it("returns 400 when score is missing", async () => {
    const app = createTestApp();
    const cookie = await authCookie("user-1");

    const res = await request(app)
      .post("/api/reviews")
      .set("Cookie", cookie)
      .send({ nodeId: "n1", confidence: 3 });

    expect(res.status).toBe(400);
  });

  it("returns 400 when confidence is missing", async () => {
    const app = createTestApp();
    const cookie = await authCookie("user-1");

    const res = await request(app)
      .post("/api/reviews")
      .set("Cookie", cookie)
      .send({ nodeId: "n1", score: 4 });

    expect(res.status).toBe(400);
  });

  it("returns 400 when score is out of range (> 5)", async () => {
    const app = createTestApp();
    const cookie = await authCookie("user-1");

    const res = await request(app)
      .post("/api/reviews")
      .set("Cookie", cookie)
      .send({ nodeId: "n1", score: 6, confidence: 3 });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/score/);
  });

  it("returns 400 when score is out of range (< 0)", async () => {
    const app = createTestApp();
    const cookie = await authCookie("user-1");

    const res = await request(app)
      .post("/api/reviews")
      .set("Cookie", cookie)
      .send({ nodeId: "n1", score: -1, confidence: 3 });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/score/);
  });

  it("returns 400 when confidence is out of range (> 5)", async () => {
    const app = createTestApp();
    const cookie = await authCookie("user-1");

    const res = await request(app)
      .post("/api/reviews")
      .set("Cookie", cookie)
      .send({ nodeId: "n1", score: 3, confidence: 6 });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/confidence/);
  });

  it("returns 400 when confidence is out of range (< 1)", async () => {
    const app = createTestApp();
    const cookie = await authCookie("user-1");

    const res = await request(app)
      .post("/api/reviews")
      .set("Cookie", cookie)
      .send({ nodeId: "n1", score: 3, confidence: 0 });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/confidence/);
  });

  it("returns 401 without auth", async () => {
    const app = createTestApp();

    const res = await request(app)
      .post("/api/reviews")
      .send({ nodeId: "n1", score: 4, confidence: 3 });

    expect(res.status).toBe(401);
  });
});

describe("POST /api/reviews/evaluate", () => {
  beforeEach(() => resetIdCounter());

  it("returns 400 when nodeId is missing", async () => {
    const app = createTestApp();
    const cookie = await authCookie("user-1");

    const res = await request(app)
      .post("/api/reviews/evaluate")
      .set("Cookie", cookie)
      .send({ response: "my answer" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/nodeId/);
  });

  it("returns 400 when response is missing", async () => {
    const app = createTestApp();
    const cookie = await authCookie("user-1");

    const res = await request(app)
      .post("/api/reviews/evaluate")
      .set("Cookie", cookie)
      .send({ nodeId: "n1" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/response/);
  });

  it("returns 200 with null when node has no question templates", async () => {
    const nodeId = "node-no-templates";
    const node = makeNode({ id: nodeId, questionTemplates: [] });
    const learnerNode = makeLearnerNode({ userId: "user-1", nodeId });
    const app = createTestApp({
      nodes: [node],
      learner_nodes: [learnerNode],
    });
    const cookie = await authCookie("user-1");

    const res = await request(app)
      .post("/api/reviews/evaluate")
      .set("Cookie", cookie)
      .send({ nodeId, response: "my answer" });

    expect(res.status).toBe(200);
    expect(res.body).toBeNull();
  });

  it("returns 200 with AI result when successful", async () => {
    const nodeId = "node-with-template";
    const node = makeNode({
      id: nodeId,
      questionTemplates: [
        {
          type: "free_recall",
          prompt: "What is XSS?",
          correctAnswer: "Cross-site scripting",
          explanation: "XSS is a web vulnerability",
          keyPoints: ["injection", "scripts"],
        },
      ],
    });
    const learnerNode = makeLearnerNode({ userId: "user-1", nodeId });
    const aiFeedback = {
      score: 4,
      feedback: "Good answer!",
      keyPointsCovered: ["injection"],
      keyPointsMissed: ["scripts"],
      misconceptions: [],
    };
    const app = createTestApp(
      { nodes: [node], learner_nodes: [learnerNode] },
      { evaluateFreeRecall: () => Effect.succeed(aiFeedback) },
    );
    const cookie = await authCookie("user-1");

    const res = await request(app)
      .post("/api/reviews/evaluate")
      .set("Cookie", cookie)
      .send({ nodeId, response: "XSS is injection" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(aiFeedback);
  });

  it("returns 200 with null when AI fails (graceful fallback)", async () => {
    const nodeId = "node-ai-fail";
    const node = makeNode({
      id: nodeId,
      questionTemplates: [
        {
          type: "free_recall",
          prompt: "What is XSS?",
          correctAnswer: "Cross-site scripting",
          explanation: "XSS is a web vulnerability",
        },
      ],
    });
    const learnerNode = makeLearnerNode({ userId: "user-1", nodeId });
    // Default AI service fails with AIRequestError — no override needed
    const app = createTestApp({
      nodes: [node],
      learner_nodes: [learnerNode],
    });
    const cookie = await authCookie("user-1");

    const res = await request(app)
      .post("/api/reviews/evaluate")
      .set("Cookie", cookie)
      .send({ nodeId, response: "XSS is injection" });

    expect(res.status).toBe(200);
    expect(res.body).toBeNull();
  });

  it("returns 401 without auth", async () => {
    const app = createTestApp();

    const res = await request(app)
      .post("/api/reviews/evaluate")
      .send({ nodeId: "n1", response: "answer" });

    expect(res.status).toBe(401);
  });
});
