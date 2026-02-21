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

describe("POST /api/lessons", () => {
  beforeEach(() => resetIdCounter());

  it("returns 400 when nodeId is missing", async () => {
    const app = createTestApp();
    const cookie = await authCookie("user-1");

    const res = await request(app)
      .post("/api/lessons")
      .set("Cookie", cookie)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/nodeId/);
  });

  it("returns 404 for nonexistent node", async () => {
    const app = createTestApp({ nodes: [] });
    const cookie = await authCookie("user-1");

    const res = await request(app)
      .post("/api/lessons")
      .set("Cookie", cookie)
      .send({ nodeId: "nonexistent" });

    expect(res.status).toBe(404);
  });

  it("returns 200 with static micro-lesson", async () => {
    const nodeId = "node-static-lesson";
    const node = makeNode({
      id: nodeId,
      concept: "Cross-Site Scripting",
      questionTemplates: [
        {
          type: "free_recall",
          prompt: "What is XSS?",
          correctAnswer: "Cross-site scripting",
          explanation: "XSS is a web vulnerability",
          microLesson: "XSS stands for Cross-Site Scripting...",
        },
      ],
    });
    const app = createTestApp({ nodes: [node] });
    const cookie = await authCookie("user-1");

    const res = await request(app)
      .post("/api/lessons")
      .set("Cookie", cookie)
      .send({ nodeId });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Cross-Site Scripting");
    expect(res.body.content).toBe("XSS stands for Cross-Site Scripting...");
    expect(res.body.source).toBe("static");
  });

  it("returns 200 with AI-generated lesson", async () => {
    const nodeId = "node-ai-lesson";
    const node = makeNode({
      id: nodeId,
      concept: "SQL Injection",
      questionTemplates: [
        {
          type: "free_recall",
          prompt: "What is SQL injection?",
          correctAnswer: "Injecting SQL into queries",
          explanation: "SQL injection is a code injection technique",
          keyPoints: ["input validation", "parameterized queries"],
        },
      ],
    });
    const learnerNode = makeLearnerNode({
      userId: "user-1",
      nodeId,
      misconceptions: ["SQL injection only works on MySQL"],
    });
    const aiLesson = {
      title: "Understanding SQL Injection",
      content: "SQL injection is a technique...",
      keyTakeaways: ["Always parameterize queries", "Validate input"],
    };
    const app = createTestApp(
      { nodes: [node], learner_nodes: [learnerNode] },
      { generateMicroLesson: () => Effect.succeed(aiLesson) },
    );
    const cookie = await authCookie("user-1");

    const res = await request(app)
      .post("/api/lessons")
      .set("Cookie", cookie)
      .send({ nodeId });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Understanding SQL Injection");
    expect(res.body.content).toBe("SQL injection is a technique...");
    expect(res.body.source).toBe("ai");
    expect(res.body.keyTakeaways).toEqual([
      "Always parameterize queries",
      "Validate input",
    ]);
  });

  it("returns 200 with fallback lesson when AI fails", async () => {
    const nodeId = "node-fallback-lesson";
    const node = makeNode({
      id: nodeId,
      concept: "Buffer Overflow",
      questionTemplates: [
        {
          type: "free_recall",
          prompt: "What is a buffer overflow?",
          correctAnswer: "Writing beyond buffer bounds",
          explanation: "A buffer overflow occurs when data exceeds buffer size",
          keyPoints: ["memory safety", "bounds checking"],
        },
      ],
    });
    const learnerNode = makeLearnerNode({ userId: "user-1", nodeId });
    // Default AI service fails — no override needed
    const app = createTestApp({
      nodes: [node],
      learner_nodes: [learnerNode],
    });
    const cookie = await authCookie("user-1");

    const res = await request(app)
      .post("/api/lessons")
      .set("Cookie", cookie)
      .send({ nodeId });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Buffer Overflow");
    expect(res.body.content).toBe(
      "A buffer overflow occurs when data exceeds buffer size",
    );
    expect(res.body.source).toBe("fallback");
    expect(res.body.keyTakeaways).toEqual(["memory safety", "bounds checking"]);
  });

  it("returns 401 without auth", async () => {
    const app = createTestApp();

    const res = await request(app)
      .post("/api/lessons")
      .send({ nodeId: "n1" });

    expect(res.status).toBe(401);
  });
});
