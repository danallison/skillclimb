import { describe, it, expect, beforeEach } from "vitest";
import { Effect } from "effect";
import request from "supertest";
import {
  createTestApp,
  makeNode,
  makeLearnerNode,
  makeDomain,
  authCookie,
  resetIdCounter,
} from "./helpers.js";

const RECOGNITION_TEMPLATE = {
  type: "recognition" as const,
  prompt: "What does CIA stand for in cybersecurity?",
  choices: [
    "Confidentiality, Integrity, Availability",
    "Central Intelligence Agency",
    "Cybersecurity Information Act",
    "Critical Infrastructure Assessment",
  ],
  correctAnswer: "Confidentiality, Integrity, Availability",
  explanation: "CIA triad is the foundation of information security.",
};

const CUED_RECALL_TEMPLATE = {
  type: "cued_recall" as const,
  prompt: "What protocol operates on port 443?",
  correctAnswer: "HTTPS",
  acceptableAnswers: ["HTTP over TLS", "HTTP over SSL"],
  explanation: "HTTPS (HTTP Secure) uses port 443 by default.",
};

const FREE_RECALL_TEMPLATE = {
  type: "free_recall" as const,
  prompt: "Explain what SQL injection is and how to prevent it.",
  correctAnswer: "SQL injection is a code injection technique...",
  explanation: "SQL injection exploits application vulnerabilities.",
  keyPoints: ["user input", "parameterized queries", "escaping"],
  rubric: "Should mention input validation and parameterized queries.",
};

const APPLICATION_TEMPLATE = {
  type: "application" as const,
  prompt: "Given a network capture, identify the suspicious traffic.",
  correctAnswer: "Look for unusual port scanning patterns.",
  explanation: "Port scans are a common reconnaissance technique.",
};

function makeTestFixtures(
  nodeId: string,
  userId: string,
  templates: any[],
) {
  const domainId = "domain-test";
  const domain = makeDomain({ id: domainId, name: "Test Domain" });
  const node = makeNode({
    id: nodeId,
    domainId,
    concept: "Test Concept",
    questionTemplates: templates,
  });
  const learnerNode = makeLearnerNode({
    userId,
    nodeId,
    domainId,
    easiness: 2.5,
    interval: 0,
    repetitions: 0,
    confidenceHistory: [],
    misconceptions: [],
  });
  return { domain, node, learnerNode };
}

describe("POST /api/answers", () => {
  beforeEach(() => resetIdCounter());

  describe("recognition questions", () => {
    it("scores a correct recognition answer", async () => {
      const nodeId = "node-recog-1";
      const userId = "user-1";
      const { domain, node, learnerNode } = makeTestFixtures(
        nodeId, userId, [RECOGNITION_TEMPLATE],
      );
      const app = createTestApp({
        nodes: [node],
        learner_nodes: [learnerNode],
        domains: [domain],
      });
      const cookie = await authCookie(userId);

      const res = await request(app)
        .post("/api/answers")
        .set("Cookie", cookie)
        .send({
          nodeId,
          answer: "Confidentiality, Integrity, Availability",
          confidence: 4,
          questionType: "recognition",
        });

      expect(res.status).toBe(200);
      expect(res.body.score).toBe(5);
      expect(res.body.wasCorrect).toBe(true);
      expect(res.body.feedback.correctAnswer).toBe("Confidentiality, Integrity, Availability");
      expect(res.body.feedback.explanation).toBe("CIA triad is the foundation of information security.");
      expect(res.body.srs).toHaveProperty("easiness");
      expect(res.body.srs).toHaveProperty("interval");
      expect(res.body.srs).toHaveProperty("nextReviewIn");
      expect(res.body.calibration).toHaveProperty("quadrant");
    });

    it("scores an incorrect recognition answer", async () => {
      const nodeId = "node-recog-2";
      const userId = "user-1";
      const { domain, node, learnerNode } = makeTestFixtures(
        nodeId, userId, [RECOGNITION_TEMPLATE],
      );
      const app = createTestApp({
        nodes: [node],
        learner_nodes: [learnerNode],
        domains: [domain],
      });
      const cookie = await authCookie(userId);

      const res = await request(app)
        .post("/api/answers")
        .set("Cookie", cookie)
        .send({
          nodeId,
          answer: "Central Intelligence Agency",
          confidence: 3,
          questionType: "recognition",
        });

      expect(res.status).toBe(200);
      expect(res.body.score).toBe(0);
      expect(res.body.wasCorrect).toBe(false);
    });

    it("scores null answer as 'I don't know' (score 1)", async () => {
      const nodeId = "node-recog-3";
      const userId = "user-1";
      const { domain, node, learnerNode } = makeTestFixtures(
        nodeId, userId, [RECOGNITION_TEMPLATE],
      );
      const app = createTestApp({
        nodes: [node],
        learner_nodes: [learnerNode],
        domains: [domain],
      });
      const cookie = await authCookie(userId);

      const res = await request(app)
        .post("/api/answers")
        .set("Cookie", cookie)
        .send({
          nodeId,
          answer: null,
          confidence: 1,
          questionType: "recognition",
        });

      expect(res.status).toBe(200);
      expect(res.body.score).toBe(1);
      expect(res.body.wasCorrect).toBe(false);
    });
  });

  describe("cued_recall questions", () => {
    it("scores exact match as 5", async () => {
      const nodeId = "node-cued-1";
      const userId = "user-1";
      const { domain, node, learnerNode } = makeTestFixtures(
        nodeId, userId, [CUED_RECALL_TEMPLATE],
      );
      const app = createTestApp({
        nodes: [node],
        learner_nodes: [learnerNode],
        domains: [domain],
      });
      const cookie = await authCookie(userId);

      const res = await request(app)
        .post("/api/answers")
        .set("Cookie", cookie)
        .send({
          nodeId,
          answer: "HTTPS",
          confidence: 5,
          questionType: "cued_recall",
        });

      expect(res.status).toBe(200);
      expect(res.body.score).toBe(5);
      expect(res.body.wasCorrect).toBe(true);
    });

    it("scores acceptable answer as 4", async () => {
      const nodeId = "node-cued-2";
      const userId = "user-1";
      const { domain, node, learnerNode } = makeTestFixtures(
        nodeId, userId, [CUED_RECALL_TEMPLATE],
      );
      const app = createTestApp({
        nodes: [node],
        learner_nodes: [learnerNode],
        domains: [domain],
      });
      const cookie = await authCookie(userId);

      const res = await request(app)
        .post("/api/answers")
        .set("Cookie", cookie)
        .send({
          nodeId,
          answer: "HTTP over TLS",
          confidence: 4,
          questionType: "cued_recall",
        });

      expect(res.status).toBe(200);
      expect(res.body.score).toBe(4);
      expect(res.body.wasCorrect).toBe(true);
    });

    it("scores wrong answer as 0", async () => {
      const nodeId = "node-cued-3";
      const userId = "user-1";
      const { domain, node, learnerNode } = makeTestFixtures(
        nodeId, userId, [CUED_RECALL_TEMPLATE],
      );
      const app = createTestApp({
        nodes: [node],
        learner_nodes: [learnerNode],
        domains: [domain],
      });
      const cookie = await authCookie(userId);

      const res = await request(app)
        .post("/api/answers")
        .set("Cookie", cookie)
        .send({
          nodeId,
          answer: "FTP",
          confidence: 2,
          questionType: "cued_recall",
        });

      expect(res.status).toBe(200);
      expect(res.body.score).toBe(0);
      expect(res.body.wasCorrect).toBe(false);
    });
  });

  describe("free_recall questions", () => {
    it("uses AI evaluation when available", async () => {
      const nodeId = "node-free-1";
      const userId = "user-1";
      const { domain, node, learnerNode } = makeTestFixtures(
        nodeId, userId, [FREE_RECALL_TEMPLATE],
      );
      const aiFeedback = {
        score: 4,
        feedback: "Good explanation!",
        keyPointsCovered: ["user input"],
        keyPointsMissed: ["parameterized queries"],
        misconceptions: [],
      };
      const app = createTestApp(
        { nodes: [node], learner_nodes: [learnerNode], domains: [domain] },
        { evaluateFreeRecall: () => Effect.succeed(aiFeedback) },
      );
      const cookie = await authCookie(userId);

      const res = await request(app)
        .post("/api/answers")
        .set("Cookie", cookie)
        .send({
          nodeId,
          answer: "SQL injection is when user input is used in queries",
          confidence: 3,
          questionType: "free_recall",
        });

      expect(res.status).toBe(200);
      expect(res.body.score).toBe(4);
      expect(res.body.wasCorrect).toBe(true);
      expect(res.body.feedback.aiFeedback).toBe("Good explanation!");
      expect(res.body.feedback.keyPointsCovered).toEqual(["user input"]);
      expect(res.body.feedback.keyPointsMissed).toEqual(["parameterized queries"]);
    });

    it("falls back to selfRating when AI unavailable", async () => {
      const nodeId = "node-free-2";
      const userId = "user-1";
      const { domain, node, learnerNode } = makeTestFixtures(
        nodeId, userId, [FREE_RECALL_TEMPLATE],
      );
      // Default AI service fails — no override
      const app = createTestApp({
        nodes: [node],
        learner_nodes: [learnerNode],
        domains: [domain],
      });
      const cookie = await authCookie(userId);

      const res = await request(app)
        .post("/api/answers")
        .set("Cookie", cookie)
        .send({
          nodeId,
          answer: "SQL injection involves inserting SQL code",
          confidence: 3,
          questionType: "free_recall",
          selfRating: "partially_correct",
        });

      expect(res.status).toBe(200);
      expect(res.body.score).toBe(3);
      expect(res.body.wasCorrect).toBe(true);
    });

    it("returns 400 when AI unavailable and no selfRating", async () => {
      const nodeId = "node-free-3";
      const userId = "user-1";
      const { domain, node, learnerNode } = makeTestFixtures(
        nodeId, userId, [FREE_RECALL_TEMPLATE],
      );
      const app = createTestApp({
        nodes: [node],
        learner_nodes: [learnerNode],
        domains: [domain],
      });
      const cookie = await authCookie(userId);

      const res = await request(app)
        .post("/api/answers")
        .set("Cookie", cookie)
        .send({
          nodeId,
          answer: "SQL injection is bad",
          confidence: 3,
          questionType: "free_recall",
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/selfRating/);
    });
  });

  describe("application/practical questions", () => {
    it("requires selfRating for application questions", async () => {
      const nodeId = "node-app-1";
      const userId = "user-1";
      const { domain, node, learnerNode } = makeTestFixtures(
        nodeId, userId, [APPLICATION_TEMPLATE],
      );
      const app = createTestApp({
        nodes: [node],
        learner_nodes: [learnerNode],
        domains: [domain],
      });
      const cookie = await authCookie(userId);

      const res = await request(app)
        .post("/api/answers")
        .set("Cookie", cookie)
        .send({
          nodeId,
          answer: "I identified the port scan",
          confidence: 4,
          questionType: "application",
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/selfRating/);
    });

    it("accepts selfRating for application questions", async () => {
      const nodeId = "node-app-2";
      const userId = "user-1";
      const { domain, node, learnerNode } = makeTestFixtures(
        nodeId, userId, [APPLICATION_TEMPLATE],
      );
      const app = createTestApp({
        nodes: [node],
        learner_nodes: [learnerNode],
        domains: [domain],
      });
      const cookie = await authCookie(userId);

      const res = await request(app)
        .post("/api/answers")
        .set("Cookie", cookie)
        .send({
          nodeId,
          answer: "I identified the port scan",
          confidence: 4,
          questionType: "application",
          selfRating: "correct",
        });

      expect(res.status).toBe(200);
      expect(res.body.score).toBe(5);
      expect(res.body.wasCorrect).toBe(true);
    });
  });

  describe("hinted attempts", () => {
    it("caps score at 3 for attemptNumber >= 2", async () => {
      const nodeId = "node-hint-1";
      const userId = "user-1";
      const { domain, node, learnerNode } = makeTestFixtures(
        nodeId, userId, [RECOGNITION_TEMPLATE],
      );
      const app = createTestApp({
        nodes: [node],
        learner_nodes: [learnerNode],
        domains: [domain],
      });
      const cookie = await authCookie(userId);

      const res = await request(app)
        .post("/api/answers")
        .set("Cookie", cookie)
        .send({
          nodeId,
          answer: "Confidentiality, Integrity, Availability",
          confidence: 4,
          questionType: "recognition",
          attemptNumber: 2,
        });

      expect(res.status).toBe(200);
      // Would normally be 5 but capped at 3
      expect(res.body.score).toBe(3);
      expect(res.body.wasCorrect).toBe(true);
    });
  });

  describe("validation", () => {
    it("returns 400 when nodeId is missing", async () => {
      const app = createTestApp();
      const cookie = await authCookie("user-1");

      const res = await request(app)
        .post("/api/answers")
        .set("Cookie", cookie)
        .send({ answer: "test", confidence: 3, questionType: "recognition" });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/nodeId/);
    });

    it("returns 400 for invalid confidence", async () => {
      const app = createTestApp();
      const cookie = await authCookie("user-1");

      const res = await request(app)
        .post("/api/answers")
        .set("Cookie", cookie)
        .send({ nodeId: "n1", answer: "test", confidence: 6, questionType: "recognition" });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/confidence/);
    });

    it("returns 400 for invalid questionType", async () => {
      const app = createTestApp();
      const cookie = await authCookie("user-1");

      const res = await request(app)
        .post("/api/answers")
        .set("Cookie", cookie)
        .send({ nodeId: "n1", answer: "test", confidence: 3, questionType: "invalid" });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/questionType/);
    });

    it("returns 400 for invalid selfRating", async () => {
      const app = createTestApp();
      const cookie = await authCookie("user-1");

      const res = await request(app)
        .post("/api/answers")
        .set("Cookie", cookie)
        .send({
          nodeId: "n1",
          answer: "test",
          confidence: 3,
          questionType: "recognition",
          selfRating: "maybe",
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/selfRating/);
    });

    it("returns 400 when question template not found", async () => {
      const nodeId = "node-no-template";
      const userId = "user-1";
      const { domain, node, learnerNode } = makeTestFixtures(
        nodeId, userId, [RECOGNITION_TEMPLATE],
      );
      const app = createTestApp({
        nodes: [node],
        learner_nodes: [learnerNode],
        domains: [domain],
      });
      const cookie = await authCookie(userId);

      const res = await request(app)
        .post("/api/answers")
        .set("Cookie", cookie)
        .send({
          nodeId,
          answer: "test",
          confidence: 3,
          questionType: "free_recall",
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/template/i);
    });

    it("returns 401 without auth", async () => {
      const app = createTestApp();

      const res = await request(app)
        .post("/api/answers")
        .send({ nodeId: "n1", answer: "test", confidence: 3, questionType: "recognition" });

      expect(res.status).toBe(401);
    });
  });
});
