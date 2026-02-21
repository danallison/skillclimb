import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import {
  createTestApp,
  makeDomain,
  makeLearnerNode,
  authCookie,
  resetIdCounter,
} from "./helpers.js";

describe("GET /api/domains", () => {
  beforeEach(() => resetIdCounter());

  it("returns 200 with all domains", async () => {
    const d1 = makeDomain({ name: "Networking" });
    const d2 = makeDomain({ name: "Cryptography" });
    const app = createTestApp({ domains: [d1, d2] });
    const cookie = await authCookie("user-1");

    const res = await request(app).get("/api/domains").set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].name).toBe("Networking");
    expect(res.body[1].name).toBe("Cryptography");
  });

  it("returns 200 filtered by skilltreeId", async () => {
    const d1 = makeDomain({ skilltreeId: "cyber", name: "Networking" });
    const d2 = makeDomain({ skilltreeId: "webdev", name: "React" });
    const app = createTestApp({ domains: [d1, d2] });
    const cookie = await authCookie("user-1");

    const res = await request(app)
      .get("/api/domains?skilltreeId=cyber")
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    // The mock returns all rows; the route filters in-memory
    expect(res.body.every((d: any) => d.skilltreeId === "cyber")).toBe(true);
  });

  it("returns 401 without auth", async () => {
    const app = createTestApp();

    const res = await request(app).get("/api/domains");

    expect(res.status).toBe(401);
  });
});

describe("GET /api/domains/:id/progress", () => {
  beforeEach(() => resetIdCounter());

  it("returns 200 with progress shape", async () => {
    const domainId = "domain-1";
    const ln1 = makeLearnerNode({
      userId: "user-1",
      domainId,
      repetitions: 5,
      easiness: 2.8,
      interval: 30,
    });
    const ln2 = makeLearnerNode({
      userId: "user-1",
      domainId,
      repetitions: 0,
      easiness: 2.5,
      interval: 0,
    });
    const app = createTestApp({ learner_nodes: [ln1, ln2] });
    const cookie = await authCookie("user-1");

    const res = await request(app)
      .get(`/api/domains/${domainId}/progress`)
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("domainId", domainId);
    expect(res.body).toHaveProperty("totalNodes");
    expect(res.body).toHaveProperty("mastered");
    expect(res.body).toHaveProperty("inProgress");
    expect(res.body).toHaveProperty("notStarted");
    expect(res.body).toHaveProperty("masteryPercentage");
  });

  it("returns 200 with zeros for unknown domain", async () => {
    const app = createTestApp({ learner_nodes: [] });
    const cookie = await authCookie("user-1");

    const res = await request(app)
      .get("/api/domains/nonexistent/progress")
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.totalNodes).toBe(0);
    expect(res.body.mastered).toBe(0);
    expect(res.body.inProgress).toBe(0);
    expect(res.body.notStarted).toBe(0);
    expect(res.body.masteryPercentage).toBe(0);
  });

  it("returns 401 without auth", async () => {
    const app = createTestApp();

    const res = await request(app).get("/api/domains/some-id/progress");

    expect(res.status).toBe(401);
  });
});
