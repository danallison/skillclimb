import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import {
  createTestApp,
  makeJournal,
  makeJournalEntry,
  authCookie,
  resetIdCounter,
} from "./helpers.js";

describe("POST /api/journals/:skilltreeId/entries", () => {
  beforeEach(() => resetIdCounter());

  it("returns 201 with valid entry", async () => {
    const userId = "user-1";
    const journal = makeJournal({ id: "journal-1", userId, skilltreeId: "cybersecurity" });

    const app = createTestApp({
      journals: [journal],
    });
    const cookie = await authCookie(userId);

    const res = await request(app)
      .post("/api/journals/cybersecurity/entries")
      .set("Cookie", cookie)
      .send({ connection: "This relates to my work in networking." });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("connection", "This relates to my work in networking.");
  });

  it("returns 400 when all sections are empty", async () => {
    const userId = "user-1";
    const journal = makeJournal({ id: "journal-1", userId, skilltreeId: "cybersecurity" });

    const app = createTestApp({
      journals: [journal],
    });
    const cookie = await authCookie(userId);

    const res = await request(app)
      .post("/api/journals/cybersecurity/entries")
      .set("Cookie", cookie)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/at least one/i);
  });

  it("returns 401 without auth", async () => {
    const app = createTestApp();

    const res = await request(app)
      .post("/api/journals/cybersecurity/entries")
      .send({ reflection: "test" });

    expect(res.status).toBe(401);
  });
});

describe("GET /api/journals/:skilltreeId/entries", () => {
  beforeEach(() => resetIdCounter());

  it("returns 200 with entries array", async () => {
    const userId = "user-1";
    const journal = makeJournal({ id: "journal-1", userId, skilltreeId: "cybersecurity" });
    const entry = makeJournalEntry({
      journalId: "journal-1",
      connection: "A connection note",
    });

    const app = createTestApp({
      journals: [journal],
      journal_entries: [entry],
    });
    const cookie = await authCookie(userId);

    const res = await request(app)
      .get("/api/journals/cybersecurity/entries")
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("returns 401 without auth", async () => {
    const app = createTestApp();

    const res = await request(app)
      .get("/api/journals/cybersecurity/entries");

    expect(res.status).toBe(401);
  });
});

describe("DELETE /api/journals/:skilltreeId/entries/:entryId", () => {
  beforeEach(() => resetIdCounter());

  it("returns 200 on success", async () => {
    const userId = "user-1";
    const journal = makeJournal({ id: "journal-1", userId, skilltreeId: "cybersecurity" });
    const entry = makeJournalEntry({
      id: "entry-1",
      journalId: "journal-1",
    });

    const app = createTestApp({
      journals: [journal],
      journal_entries: [entry],
    });
    const cookie = await authCookie(userId);

    const res = await request(app)
      .delete("/api/journals/cybersecurity/entries/entry-1")
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
  });

  it("returns 401 without auth", async () => {
    const app = createTestApp();

    const res = await request(app)
      .delete("/api/journals/cybersecurity/entries/entry-1");

    expect(res.status).toBe(401);
  });
});
