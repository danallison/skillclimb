import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import {
  createTestApp,
  makeNode,
  makePlacement,
  authCookie,
  resetIdCounter,
} from "./helpers.js";

describe("GET /api/placement/:id", () => {
  beforeEach(() => resetIdCounter());

  it("returns 404 when accessing another user's placement", async () => {
    const ownerUserId = "user-A";
    const otherUserId = "user-B";
    const placementId = "placement-1";
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
    const placement = makePlacement({
      id: placementId,
      userId: ownerUserId,
    });

    const app = createTestApp({
      placement_tests: [placement],
      nodes: [node],
    });
    const cookie = await authCookie(otherUserId);

    const res = await request(app)
      .get(`/api/placement/${placementId}`)
      .set("Cookie", cookie);

    expect(res.status).toBe(404);
  });
});

describe("POST /api/placement/:id/answer", () => {
  beforeEach(() => resetIdCounter());

  it("returns 404 when submitting answer to another user's placement", async () => {
    const ownerUserId = "user-A";
    const otherUserId = "user-B";
    const placementId = "placement-1";
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
    const placement = makePlacement({
      id: placementId,
      userId: ownerUserId,
    });

    const app = createTestApp({
      placement_tests: [placement],
      nodes: [node],
    });
    const cookie = await authCookie(otherUserId);

    const res = await request(app)
      .post(`/api/placement/${placementId}/answer`)
      .set("Cookie", cookie)
      .send({ nodeId, selectedAnswer: "A protocol", confidence: 3 });

    expect(res.status).toBe(404);
  });
});

describe("POST /api/placement/:id/abandon", () => {
  beforeEach(() => resetIdCounter());

  it("returns 404 when abandoning another user's placement", async () => {
    const ownerUserId = "user-A";
    const otherUserId = "user-B";
    const placementId = "placement-1";

    const placement = makePlacement({
      id: placementId,
      userId: ownerUserId,
    });

    const app = createTestApp({
      placement_tests: [placement],
    });
    const cookie = await authCookie(otherUserId);

    const res = await request(app)
      .post(`/api/placement/${placementId}/abandon`)
      .set("Cookie", cookie);

    expect(res.status).toBe(404);
  });
});
