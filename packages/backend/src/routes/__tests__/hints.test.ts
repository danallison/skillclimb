import { describe, it, expect, beforeEach } from "vitest";
import { Effect } from "effect";
import request from "supertest";
import {
  createTestApp,
  makeNode,
  authCookie,
  resetIdCounter,
} from "./helpers.js";

describe("POST /api/hints", () => {
  beforeEach(() => resetIdCounter());

  it("returns 400 when nodeId is missing", async () => {
    const app = createTestApp();
    const cookie = await authCookie("user-1");

    const res = await request(app)
      .post("/api/hints")
      .set("Cookie", cookie)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/nodeId/);
  });

  it("returns 404 for nonexistent node", async () => {
    const app = createTestApp({ nodes: [] });
    const cookie = await authCookie("user-1");

    const res = await request(app)
      .post("/api/hints")
      .set("Cookie", cookie)
      .send({ nodeId: "nonexistent" });

    expect(res.status).toBe(404);
  });

  it("returns 200 with static hint when node has hints array", async () => {
    const nodeId = "node-static-hints";
    const node = makeNode({
      id: nodeId,
      questionTemplates: [
        {
          type: "free_recall",
          prompt: "What is XSS?",
          correctAnswer: "Cross-site scripting",
          explanation: "XSS is a web vulnerability",
          hints: ["Think about browser security", "It involves scripts"],
        },
      ],
    });
    const app = createTestApp({ nodes: [node] });
    const cookie = await authCookie("user-1");

    const res = await request(app)
      .post("/api/hints")
      .set("Cookie", cookie)
      .send({ nodeId });

    expect(res.status).toBe(200);
    expect(res.body.hint).toBe("Think about browser security");
    expect(res.body.source).toBe("static");
  });

  it("returns 200 with AI hint when no static hints and AI succeeds", async () => {
    const nodeId = "node-ai-hint";
    const node = makeNode({
      id: nodeId,
      questionTemplates: [
        {
          type: "free_recall",
          prompt: "What is XSS?",
          correctAnswer: "Cross-site scripting",
          explanation: "XSS is a web vulnerability",
          // no hints array
        },
      ],
    });
    const app = createTestApp(
      { nodes: [node] },
      { generateHint: () => Effect.succeed("Consider how browsers handle scripts") },
    );
    const cookie = await authCookie("user-1");

    const res = await request(app)
      .post("/api/hints")
      .set("Cookie", cookie)
      .send({ nodeId });

    expect(res.status).toBe(200);
    expect(res.body.hint).toBe("Consider how browsers handle scripts");
    expect(res.body.source).toBe("ai");
  });

  it("returns 200 with generic hint when no static hints and AI fails", async () => {
    const nodeId = "node-generic-hint";
    const node = makeNode({
      id: nodeId,
      questionTemplates: [
        {
          type: "free_recall",
          prompt: "What is XSS?",
          correctAnswer: "Cross-site scripting",
          explanation: "XSS is a web vulnerability. It allows injection.",
          // no hints array
        },
      ],
    });
    // Default AI service fails — no override needed
    const app = createTestApp({ nodes: [node] });
    const cookie = await authCookie("user-1");

    const res = await request(app)
      .post("/api/hints")
      .set("Cookie", cookie)
      .send({ nodeId });

    expect(res.status).toBe(200);
    expect(res.body.hint).toMatch(/Think about/);
    expect(res.body.source).toBe("generic");
  });

  it("returns 401 without auth", async () => {
    const app = createTestApp();

    const res = await request(app)
      .post("/api/hints")
      .send({ nodeId: "n1" });

    expect(res.status).toBe(401);
  });
});
