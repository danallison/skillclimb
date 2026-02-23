import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import {
  createTestApp,
  makeDomain,
  makeTopic,
  makeNode,
  makeLearnerNode,
  makeReview,
  authCookie,
  resetIdCounter,
} from "./helpers.js";

describe("GET /api/users/me/data", () => {
  beforeEach(() => resetIdCounter());

  it("returns version and empty arrays for user with no data", async () => {
    const userId = "user-1";
    const app = createTestApp();
    const cookie = await authCookie(userId);

    const res = await request(app)
      .get("/api/users/me/data")
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.version).toBe(1);
    expect(res.body.exportedAt).toBeDefined();
    expect(res.body.learnerNodes).toEqual([]);
    expect(res.body.reviews).toEqual([]);
    expect(res.body.studyDays).toEqual([]);
  });

  it("returns learnerNodes with portable concept identifiers", async () => {
    const userId = "user-1";
    const domainId = "domain-1";
    const nodeId = "node-1";
    const domain = makeDomain({
      id: domainId,
      skilltreeId: "cybersecurity",
      name: "Security Principles",
    });
    const topic = makeTopic({ domainId });
    const node = makeNode({
      id: nodeId,
      domainId,
      topicId: topic.id,
      concept: "Confidentiality",
    });
    const learnerNode = makeLearnerNode({
      userId,
      nodeId,
      domainId,
      easiness: 2.8,
      interval: 10,
      repetitions: 3,
      domainWeight: 1.2,
    });

    const app = createTestApp({
      domains: [domain],
      topics: [topic],
      nodes: [node],
      learner_nodes: [learnerNode],
    });
    const cookie = await authCookie(userId);

    const res = await request(app)
      .get("/api/users/me/data")
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.learnerNodes).toHaveLength(1);
    expect(res.body.learnerNodes[0]).toMatchObject({
      skilltreeId: "cybersecurity",
      domainName: "Security Principles",
      concept: "Confidentiality",
      easiness: 2.8,
      interval: 10,
      repetitions: 3,
      domainWeight: 1.2,
    });
  });

  it("returns reviews with portable identifiers", async () => {
    const userId = "user-1";
    const domainId = "domain-1";
    const nodeId = "node-1";
    const domain = makeDomain({
      id: domainId,
      skilltreeId: "cybersecurity",
      name: "Security Principles",
    });
    const node = makeNode({
      id: nodeId,
      domainId,
      concept: "Confidentiality",
    });
    const review = makeReview({
      userId,
      nodeId,
      score: 4,
      confidence: 3,
      response: "CIA triad",
    });

    const app = createTestApp({
      domains: [domain],
      nodes: [node],
      reviews: [review],
    });
    const cookie = await authCookie(userId);

    const res = await request(app)
      .get("/api/users/me/data")
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.reviews).toHaveLength(1);
    expect(res.body.reviews[0]).toMatchObject({
      skilltreeId: "cybersecurity",
      domainName: "Security Principles",
      concept: "Confidentiality",
      score: 4,
      confidence: 3,
      response: "CIA triad",
    });
  });

  it("returns studyDays", async () => {
    const userId = "user-1";
    const app = createTestApp({
      study_days: [
        { userId, date: "2026-02-20", reviewCount: 15, createdAt: new Date() },
      ],
    });
    const cookie = await authCookie(userId);

    const res = await request(app)
      .get("/api/users/me/data")
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.studyDays).toHaveLength(1);
    expect(res.body.studyDays[0]).toEqual({
      date: "2026-02-20",
      reviewCount: 15,
    });
  });

  it("omits learnerNodes whose node no longer exists", async () => {
    const userId = "user-1";
    const domain = makeDomain({
      id: "domain-1",
      skilltreeId: "cybersecurity",
      name: "Security Principles",
    });
    // learnerNode references a nodeId that doesn't exist in nodes table
    const orphanedLearnerNode = makeLearnerNode({
      userId,
      nodeId: "deleted-node",
      domainId: "domain-1",
    });

    const app = createTestApp({
      domains: [domain],
      nodes: [],
      learner_nodes: [orphanedLearnerNode],
    });
    const cookie = await authCookie(userId);

    const res = await request(app)
      .get("/api/users/me/data")
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.learnerNodes).toEqual([]);
  });

  it("omits reviews whose node no longer exists", async () => {
    const userId = "user-1";
    const domain = makeDomain({
      id: "domain-1",
      skilltreeId: "cybersecurity",
      name: "Security Principles",
    });
    // review references a nodeId that doesn't exist in nodes table
    const orphanedReview = makeReview({
      userId,
      nodeId: "deleted-node",
    });

    const app = createTestApp({
      domains: [domain],
      nodes: [],
      reviews: [orphanedReview],
    });
    const cookie = await authCookie(userId);

    const res = await request(app)
      .get("/api/users/me/data")
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.reviews).toEqual([]);
  });

  it("includes dueDate, confidenceHistory, and misconceptions in exported learnerNodes", async () => {
    const userId = "user-1";
    const domainId = "domain-1";
    const nodeId = "node-1";
    const domain = makeDomain({ id: domainId, skilltreeId: "cyber", name: "D1" });
    const node = makeNode({ id: nodeId, domainId, concept: "C1" });
    const dueDate = new Date("2026-04-15T00:00:00.000Z");
    const confHistory = [{ confidence: 3, wasCorrect: true, timestamp: "2026-02-20T00:00:00Z" }];
    const misconceptions = ["confuses X with Y"];
    const learnerNode = makeLearnerNode({
      userId,
      nodeId,
      domainId,
      dueDate,
      confidenceHistory: confHistory,
      misconceptions,
    });

    const app = createTestApp({
      domains: [domain],
      nodes: [node],
      learner_nodes: [learnerNode],
    });
    const cookie = await authCookie(userId);

    const res = await request(app)
      .get("/api/users/me/data")
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    const ln = res.body.learnerNodes[0];
    expect(ln.dueDate).toBe("2026-04-15T00:00:00.000Z");
    expect(ln.confidenceHistory).toEqual(confHistory);
    expect(ln.misconceptions).toEqual(misconceptions);
  });

  it("includes createdAt as ISO string in exported reviews", async () => {
    const userId = "user-1";
    const domainId = "domain-1";
    const nodeId = "node-1";
    const domain = makeDomain({ id: domainId, skilltreeId: "cyber", name: "D1" });
    const node = makeNode({ id: nodeId, domainId, concept: "C1" });
    const createdAt = new Date("2026-02-20T14:30:00.000Z");
    const review = makeReview({ userId, nodeId, createdAt });

    const app = createTestApp({
      domains: [domain],
      nodes: [node],
      reviews: [review],
    });
    const cookie = await authCookie(userId);

    const res = await request(app)
      .get("/api/users/me/data")
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.reviews[0].createdAt).toBe("2026-02-20T14:30:00.000Z");
  });

  it("returns 401 without auth", async () => {
    const app = createTestApp();

    const res = await request(app).get("/api/users/me/data");

    expect(res.status).toBe(401);
  });
});

describe("POST /api/users/me/data", () => {
  beforeEach(() => resetIdCounter());

  it("imports learnerNodes matched by concept identifiers", async () => {
    const userId = "user-1";
    const domainId = "domain-1";
    const nodeId = "node-1";
    const domain = makeDomain({
      id: domainId,
      skilltreeId: "cybersecurity",
      name: "Security Principles",
    });
    const node = makeNode({
      id: nodeId,
      domainId,
      concept: "Confidentiality",
    });

    const app = createTestApp({
      domains: [domain],
      nodes: [node],
    });
    const cookie = await authCookie(userId);

    const res = await request(app)
      .post("/api/users/me/data")
      .set("Cookie", cookie)
      .send({
        version: 1,
        learnerNodes: [
          {
            skilltreeId: "cybersecurity",
            domainName: "Security Principles",
            concept: "Confidentiality",
            easiness: 2.8,
            interval: 10,
            repetitions: 3,
            dueDate: "2026-03-01T00:00:00.000Z",
            domainWeight: 1.0,
            confidenceHistory: [],
            misconceptions: [],
          },
        ],
        reviews: [],
        studyDays: [],
      });

    expect(res.status).toBe(200);
    expect(res.body.imported.learnerNodes).toBe(1);
    expect(res.body.skipped.learnerNodes).toBe(0);
  });

  it("skips unmatched nodes and returns skip count", async () => {
    const userId = "user-1";
    const app = createTestApp({
      domains: [],
      nodes: [],
    });
    const cookie = await authCookie(userId);

    const res = await request(app)
      .post("/api/users/me/data")
      .set("Cookie", cookie)
      .send({
        version: 1,
        learnerNodes: [
          {
            skilltreeId: "nonexistent",
            domainName: "No Domain",
            concept: "No Concept",
            easiness: 2.5,
            interval: 0,
            repetitions: 0,
            dueDate: "2026-03-01T00:00:00.000Z",
            domainWeight: 1.0,
          },
        ],
        reviews: [
          {
            skilltreeId: "nonexistent",
            domainName: "No Domain",
            concept: "No Concept",
            score: 4,
            confidence: 3,
            response: "test",
            createdAt: "2026-02-20T00:00:00.000Z",
          },
        ],
        studyDays: [],
      });

    expect(res.status).toBe(200);
    expect(res.body.imported.learnerNodes).toBe(0);
    expect(res.body.skipped.learnerNodes).toBe(1);
    expect(res.body.imported.reviews).toBe(0);
    expect(res.body.skipped.reviews).toBe(1);
  });

  it("imports reviews (append-only)", async () => {
    const userId = "user-1";
    const domainId = "domain-1";
    const nodeId = "node-1";
    const domain = makeDomain({
      id: domainId,
      skilltreeId: "cybersecurity",
      name: "Security Principles",
    });
    const node = makeNode({
      id: nodeId,
      domainId,
      concept: "Confidentiality",
    });

    const app = createTestApp({
      domains: [domain],
      nodes: [node],
    });
    const cookie = await authCookie(userId);

    const res = await request(app)
      .post("/api/users/me/data")
      .set("Cookie", cookie)
      .send({
        version: 1,
        learnerNodes: [],
        reviews: [
          {
            skilltreeId: "cybersecurity",
            domainName: "Security Principles",
            concept: "Confidentiality",
            score: 4,
            confidence: 3,
            response: "CIA triad",
            createdAt: "2026-02-20T00:00:00.000Z",
          },
        ],
        studyDays: [],
      });

    expect(res.status).toBe(200);
    expect(res.body.imported.reviews).toBe(1);
  });

  it("imports studyDays", async () => {
    const userId = "user-1";
    const app = createTestApp();
    const cookie = await authCookie(userId);

    const res = await request(app)
      .post("/api/users/me/data")
      .set("Cookie", cookie)
      .send({
        version: 1,
        learnerNodes: [],
        reviews: [],
        studyDays: [
          { date: "2026-02-20", reviewCount: 15 },
          { date: "2026-02-21", reviewCount: 10 },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.imported.studyDays).toBe(2);
  });

  it("returns 400 for invalid version", async () => {
    const userId = "user-1";
    const app = createTestApp();
    const cookie = await authCookie(userId);

    const res = await request(app)
      .post("/api/users/me/data")
      .set("Cookie", cookie)
      .send({ version: 99 });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/version/);
  });

  it("returns 401 without auth", async () => {
    const app = createTestApp();

    const res = await request(app)
      .post("/api/users/me/data")
      .send({ version: 1 });

    expect(res.status).toBe(401);
  });

  it("skips learnerNodes with invalid numeric fields", async () => {
    const userId = "user-1";
    const domain = makeDomain({
      id: "domain-1",
      skilltreeId: "cybersecurity",
      name: "Security Principles",
    });
    const node = makeNode({
      id: "node-1",
      domainId: "domain-1",
      concept: "Confidentiality",
    });
    const app = createTestApp({ domains: [domain], nodes: [node] });
    const cookie = await authCookie(userId);

    const res = await request(app)
      .post("/api/users/me/data")
      .set("Cookie", cookie)
      .send({
        version: 1,
        learnerNodes: [
          {
            skilltreeId: "cybersecurity",
            domainName: "Security Principles",
            concept: "Confidentiality",
            easiness: "not a number",
            interval: 10,
            repetitions: 3,
            dueDate: "2026-03-01T00:00:00.000Z",
            domainWeight: 1.0,
          },
        ],
        reviews: [],
        studyDays: [],
      });

    expect(res.status).toBe(200);
    expect(res.body.imported.learnerNodes).toBe(0);
    expect(res.body.skipped.learnerNodes).toBe(1);
  });

  it("skips learnerNodes with invalid dates", async () => {
    const userId = "user-1";
    const domain = makeDomain({
      id: "domain-1",
      skilltreeId: "cybersecurity",
      name: "Security Principles",
    });
    const node = makeNode({
      id: "node-1",
      domainId: "domain-1",
      concept: "Confidentiality",
    });
    const app = createTestApp({ domains: [domain], nodes: [node] });
    const cookie = await authCookie(userId);

    const res = await request(app)
      .post("/api/users/me/data")
      .set("Cookie", cookie)
      .send({
        version: 1,
        learnerNodes: [
          {
            skilltreeId: "cybersecurity",
            domainName: "Security Principles",
            concept: "Confidentiality",
            easiness: 2.5,
            interval: 0,
            repetitions: 0,
            dueDate: "not-a-date",
            domainWeight: 1.0,
          },
        ],
        reviews: [],
        studyDays: [],
      });

    expect(res.status).toBe(200);
    expect(res.body.imported.learnerNodes).toBe(0);
    expect(res.body.skipped.learnerNodes).toBe(1);
  });

  it("skips reviews with out-of-range score or confidence", async () => {
    const userId = "user-1";
    const domain = makeDomain({
      id: "domain-1",
      skilltreeId: "cybersecurity",
      name: "Security Principles",
    });
    const node = makeNode({
      id: "node-1",
      domainId: "domain-1",
      concept: "Confidentiality",
    });
    const app = createTestApp({ domains: [domain], nodes: [node] });
    const cookie = await authCookie(userId);

    const res = await request(app)
      .post("/api/users/me/data")
      .set("Cookie", cookie)
      .send({
        version: 1,
        learnerNodes: [],
        reviews: [
          {
            skilltreeId: "cybersecurity",
            domainName: "Security Principles",
            concept: "Confidentiality",
            score: 999,
            confidence: 3,
            response: "answer",
            createdAt: "2026-02-20T00:00:00.000Z",
          },
          {
            skilltreeId: "cybersecurity",
            domainName: "Security Principles",
            concept: "Confidentiality",
            score: 4,
            confidence: 0,
            response: "answer",
            createdAt: "2026-02-20T00:00:00.000Z",
          },
        ],
        studyDays: [],
      });

    expect(res.status).toBe(200);
    expect(res.body.imported.reviews).toBe(0);
    expect(res.body.skipped.reviews).toBe(2);
  });

  it("skips studyDays with invalid date format", async () => {
    const userId = "user-1";
    const app = createTestApp();
    const cookie = await authCookie(userId);

    const res = await request(app)
      .post("/api/users/me/data")
      .set("Cookie", cookie)
      .send({
        version: 1,
        learnerNodes: [],
        reviews: [],
        studyDays: [
          { date: "not-a-date", reviewCount: 5 },
          { date: "2026-02-20", reviewCount: "not-a-number" },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.imported.studyDays).toBe(0);
  });

  it("handles non-array inputs gracefully", async () => {
    const userId = "user-1";
    const app = createTestApp();
    const cookie = await authCookie(userId);

    const res = await request(app)
      .post("/api/users/me/data")
      .set("Cookie", cookie)
      .send({
        version: 1,
        learnerNodes: "not an array",
        reviews: 42,
        studyDays: null,
      });

    expect(res.status).toBe(200);
    expect(res.body.imported).toEqual({ learnerNodes: 0, reviews: 0, studyDays: 0 });
    expect(res.body.skipped).toEqual({ learnerNodes: 0, reviews: 0 });
  });

  it("upserts learnerNodes on re-import (updates existing)", async () => {
    const userId = "user-1";
    const domain = makeDomain({
      id: "domain-1",
      skilltreeId: "cybersecurity",
      name: "Security Principles",
    });
    const node = makeNode({
      id: "node-1",
      domainId: "domain-1",
      concept: "Confidentiality",
    });
    const app = createTestApp({ domains: [domain], nodes: [node] });
    const cookie = await authCookie(userId);

    // Import once
    const res1 = await request(app)
      .post("/api/users/me/data")
      .set("Cookie", cookie)
      .send({
        version: 1,
        learnerNodes: [
          {
            skilltreeId: "cybersecurity",
            domainName: "Security Principles",
            concept: "Confidentiality",
            easiness: 2.5,
            interval: 0,
            repetitions: 0,
            dueDate: "2026-03-01T00:00:00.000Z",
            domainWeight: 1.0,
          },
        ],
        reviews: [],
        studyDays: [],
      });
    expect(res1.status).toBe(200);
    expect(res1.body.imported.learnerNodes).toBe(1);

    // Import again with updated values — should upsert, not fail
    const res2 = await request(app)
      .post("/api/users/me/data")
      .set("Cookie", cookie)
      .send({
        version: 1,
        learnerNodes: [
          {
            skilltreeId: "cybersecurity",
            domainName: "Security Principles",
            concept: "Confidentiality",
            easiness: 3.0,
            interval: 10,
            repetitions: 5,
            dueDate: "2026-04-01T00:00:00.000Z",
            domainWeight: 1.5,
          },
        ],
        reviews: [],
        studyDays: [],
      });
    expect(res2.status).toBe(200);
    expect(res2.body.imported.learnerNodes).toBe(1);
  });

  it("upserts studyDays on re-import (updates existing)", async () => {
    const userId = "user-1";
    const app = createTestApp();
    const cookie = await authCookie(userId);

    // Import once
    const res1 = await request(app)
      .post("/api/users/me/data")
      .set("Cookie", cookie)
      .send({
        version: 1,
        learnerNodes: [],
        reviews: [],
        studyDays: [{ date: "2026-02-20", reviewCount: 10 }],
      });
    expect(res1.status).toBe(200);
    expect(res1.body.imported.studyDays).toBe(1);

    // Import again with updated count — should upsert
    const res2 = await request(app)
      .post("/api/users/me/data")
      .set("Cookie", cookie)
      .send({
        version: 1,
        learnerNodes: [],
        reviews: [],
        studyDays: [{ date: "2026-02-20", reviewCount: 25 }],
      });
    expect(res2.status).toBe(200);
    expect(res2.body.imported.studyDays).toBe(1);
  });

  it("skips reviews with invalid createdAt date", async () => {
    const userId = "user-1";
    const domain = makeDomain({
      id: "domain-1",
      skilltreeId: "cybersecurity",
      name: "Security Principles",
    });
    const node = makeNode({
      id: "node-1",
      domainId: "domain-1",
      concept: "Confidentiality",
    });
    const app = createTestApp({ domains: [domain], nodes: [node] });
    const cookie = await authCookie(userId);

    const res = await request(app)
      .post("/api/users/me/data")
      .set("Cookie", cookie)
      .send({
        version: 1,
        learnerNodes: [],
        reviews: [
          {
            skilltreeId: "cybersecurity",
            domainName: "Security Principles",
            concept: "Confidentiality",
            score: 4,
            confidence: 3,
            response: "answer",
            createdAt: "not-a-date",
          },
        ],
        studyDays: [],
      });

    expect(res.status).toBe(200);
    expect(res.body.imported.reviews).toBe(0);
    expect(res.body.skipped.reviews).toBe(1);
  });

  it("skips reviews with non-integer score or confidence", async () => {
    const userId = "user-1";
    const domain = makeDomain({
      id: "domain-1",
      skilltreeId: "cybersecurity",
      name: "Security Principles",
    });
    const node = makeNode({
      id: "node-1",
      domainId: "domain-1",
      concept: "Confidentiality",
    });
    const app = createTestApp({ domains: [domain], nodes: [node] });
    const cookie = await authCookie(userId);

    const res = await request(app)
      .post("/api/users/me/data")
      .set("Cookie", cookie)
      .send({
        version: 1,
        learnerNodes: [],
        reviews: [
          {
            skilltreeId: "cybersecurity",
            domainName: "Security Principles",
            concept: "Confidentiality",
            score: 3.5,
            confidence: 3,
            response: "answer",
            createdAt: "2026-02-20T00:00:00.000Z",
          },
          {
            skilltreeId: "cybersecurity",
            domainName: "Security Principles",
            concept: "Confidentiality",
            score: 4,
            confidence: "high",
            response: "answer",
            createdAt: "2026-02-20T00:00:00.000Z",
          },
        ],
        studyDays: [],
      });

    expect(res.status).toBe(200);
    expect(res.body.imported.reviews).toBe(0);
    expect(res.body.skipped.reviews).toBe(2);
  });

  it("skips learnerNodes with Infinity or NaN numeric fields", async () => {
    const userId = "user-1";
    const domain = makeDomain({
      id: "domain-1",
      skilltreeId: "cybersecurity",
      name: "Security Principles",
    });
    const node = makeNode({
      id: "node-1",
      domainId: "domain-1",
      concept: "Confidentiality",
    });
    const app = createTestApp({ domains: [domain], nodes: [node] });
    const cookie = await authCookie(userId);

    // Note: JSON.stringify converts Infinity/NaN to null, so we send null
    // to simulate what would arrive over the wire
    const res = await request(app)
      .post("/api/users/me/data")
      .set("Cookie", cookie)
      .send({
        version: 1,
        learnerNodes: [
          {
            skilltreeId: "cybersecurity",
            domainName: "Security Principles",
            concept: "Confidentiality",
            easiness: null,
            interval: 10,
            repetitions: 0,
            dueDate: "2026-03-01T00:00:00.000Z",
            domainWeight: 1.0,
          },
        ],
        reviews: [],
        studyDays: [],
      });

    expect(res.status).toBe(200);
    expect(res.body.imported.learnerNodes).toBe(0);
    expect(res.body.skipped.learnerNodes).toBe(1);
  });

  it("skips items with missing identifier fields", async () => {
    const userId = "user-1";
    const domain = makeDomain({
      id: "domain-1",
      skilltreeId: "cybersecurity",
      name: "Security Principles",
    });
    const node = makeNode({
      id: "node-1",
      domainId: "domain-1",
      concept: "Confidentiality",
    });
    const app = createTestApp({ domains: [domain], nodes: [node] });
    const cookie = await authCookie(userId);

    const res = await request(app)
      .post("/api/users/me/data")
      .set("Cookie", cookie)
      .send({
        version: 1,
        learnerNodes: [
          {
            // missing skilltreeId
            domainName: "Security Principles",
            concept: "Confidentiality",
            easiness: 2.5,
            interval: 0,
            repetitions: 0,
            dueDate: "2026-03-01T00:00:00.000Z",
            domainWeight: 1.0,
          },
        ],
        reviews: [
          {
            skilltreeId: "cybersecurity",
            // missing domainName
            concept: "Confidentiality",
            score: 4,
            confidence: 3,
            response: "answer",
            createdAt: "2026-02-20T00:00:00.000Z",
          },
        ],
        studyDays: [],
      });

    expect(res.status).toBe(200);
    expect(res.body.imported.learnerNodes).toBe(0);
    expect(res.body.skipped.learnerNodes).toBe(1);
    expect(res.body.imported.reviews).toBe(0);
    expect(res.body.skipped.reviews).toBe(1);
  });

  it("coerces null response to empty string for reviews", async () => {
    const userId = "user-1";
    const domain = makeDomain({
      id: "domain-1",
      skilltreeId: "cybersecurity",
      name: "Security Principles",
    });
    const node = makeNode({
      id: "node-1",
      domainId: "domain-1",
      concept: "Confidentiality",
    });
    const app = createTestApp({ domains: [domain], nodes: [node] });
    const cookie = await authCookie(userId);

    const res = await request(app)
      .post("/api/users/me/data")
      .set("Cookie", cookie)
      .send({
        version: 1,
        learnerNodes: [],
        reviews: [
          {
            skilltreeId: "cybersecurity",
            domainName: "Security Principles",
            concept: "Confidentiality",
            score: 4,
            confidence: 3,
            response: null,
            createdAt: "2026-02-20T00:00:00.000Z",
          },
        ],
        studyDays: [],
      });

    expect(res.status).toBe(200);
    expect(res.body.imported.reviews).toBe(1);
  });

  it("returns 400 for missing body", async () => {
    const userId = "user-1";
    const app = createTestApp();
    const cookie = await authCookie(userId);

    const res = await request(app)
      .post("/api/users/me/data")
      .set("Cookie", cookie)
      .set("Content-Type", "application/json")
      .send("");

    expect(res.status).toBe(400);
  });

  it("returns 400 for version 0", async () => {
    const userId = "user-1";
    const app = createTestApp();
    const cookie = await authCookie(userId);

    const res = await request(app)
      .post("/api/users/me/data")
      .set("Cookie", cookie)
      .send({ version: 0 });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/version/);
  });

  it("handles undefined learnerNodes/reviews/studyDays fields", async () => {
    const userId = "user-1";
    const app = createTestApp();
    const cookie = await authCookie(userId);

    const res = await request(app)
      .post("/api/users/me/data")
      .set("Cookie", cookie)
      .send({ version: 1 });

    expect(res.status).toBe(200);
    expect(res.body.imported).toEqual({ learnerNodes: 0, reviews: 0, studyDays: 0 });
    expect(res.body.skipped).toEqual({ learnerNodes: 0, reviews: 0 });
  });
});
