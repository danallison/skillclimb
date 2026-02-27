import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import {
  createTestApp,
  makeLearnerNode,
  makeSession,
  makeReview,
  authCookie,
  resetIdCounter,
} from "./helpers.js";

describe("POST /api/sessions/:id/complete", () => {
  beforeEach(() => resetIdCounter());

  it("returns 200 with session summary", async () => {
    const userId = "user-1";
    const nodeId = "node-1";
    const sessionId = "session-1";
    // Use the same Date for both so the mock DB's strict-equality filter
    // on the gte(createdAt, startedAt) condition includes the review.
    const sharedTime = new Date();

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
      startedAt: sharedTime,
      completedAt: null,
    });
    const review = makeReview({
      userId,
      nodeId,
      score: 4,
      confidence: 3,
      createdAt: sharedTime,
    });

    const app = createTestApp({
      sessions: [sessionRow],
      learner_nodes: [learnerNode],
      reviews: [review],
    });
    const cookie = await authCookie(userId);

    const res = await request(app)
      .post(`/api/sessions/${sessionId}/complete`)
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id", sessionId);
    expect(res.body).toHaveProperty("completedAt");
    expect(res.body.summary.totalReviews).toBe(1);
    expect(res.body.summary.correctCount).toBe(1);
    expect(res.body.summary.accuracyPercentage).toBe(100);
    expect(res.body.momentum.overallAccuracy).toBe(100);
    expect(res.body.momentum).toHaveProperty("inTargetZone");
    expect(res.body.momentum).toHaveProperty("message");
    expect(res.body.nextSession).toHaveProperty("dueNow");
    expect(res.body.nextSession).toHaveProperty("message");
  });

  it("returns 404 for nonexistent session", async () => {
    const app = createTestApp({ sessions: [] });
    const cookie = await authCookie("user-1");

    const res = await request(app)
      .post("/api/sessions/nonexistent-id/complete")
      .set("Cookie", cookie);

    expect(res.status).toBe(404);
  });

  it("returns 400 when session is already completed", async () => {
    const userId = "user-1";
    const sessionId = "session-completed";
    const sessionRow = makeSession({
      id: sessionId,
      userId,
      nodeIds: [],
      completedAt: new Date(), // already completed
    });

    const app = createTestApp({
      sessions: [sessionRow],
    });
    const cookie = await authCookie(userId);

    const res = await request(app)
      .post(`/api/sessions/${sessionId}/complete`)
      .set("Cookie", cookie);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/already completed/);
  });

  it("returns 404 when accessing another user's session", async () => {
    const ownerUserId = "user-A";
    const otherUserId = "user-B";
    const sessionId = "session-other";
    const sessionRow = makeSession({
      id: sessionId,
      userId: ownerUserId,
      nodeIds: [],
      completedAt: null,
    });

    const app = createTestApp({
      sessions: [sessionRow],
    });
    const cookie = await authCookie(otherUserId);

    const res = await request(app)
      .post(`/api/sessions/${sessionId}/complete`)
      .set("Cookie", cookie);

    expect(res.status).toBe(404);
  });

  it("returns 401 without auth", async () => {
    const app = createTestApp();

    const res = await request(app)
      .post("/api/sessions/some-id/complete");

    expect(res.status).toBe(401);
  });
});
