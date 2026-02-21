import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { createTestApp, makeSkilltree, resetIdCounter } from "./helpers.js";

describe("GET /api/skilltrees", () => {
  beforeEach(() => resetIdCounter());

  it("returns 200 with array of skill trees", async () => {
    const st1 = makeSkilltree({ id: "cybersecurity", name: "Cybersecurity" });
    const st2 = makeSkilltree({ id: "web-dev", name: "Web Development" });
    const app = createTestApp({ skilltrees: [st1, st2] });

    const res = await request(app).get("/api/skilltrees");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].id).toBe("cybersecurity");
    expect(res.body[1].id).toBe("web-dev");
  });

  it("returns 200 with empty array when no data", async () => {
    const app = createTestApp({ skilltrees: [] });

    const res = await request(app).get("/api/skilltrees");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});
