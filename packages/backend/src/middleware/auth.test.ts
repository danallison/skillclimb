import { describe, it, expect, vi } from "vitest";
import { requireAuth } from "./auth.js";
import { createAccessToken } from "../services/auth.service.js";
import type { Request, Response, NextFunction } from "express";

function mockReqResNext(cookies: Record<string, string> = {}) {
  const req = { cookies } as unknown as Request;
  const resBody = { statusCode: 0, body: null as any };
  const res = {
    status: vi.fn((code: number) => {
      resBody.statusCode = code;
      return res;
    }),
    json: vi.fn((body: any) => {
      resBody.body = body;
      return res;
    }),
  } as unknown as Response;
  const next = vi.fn() as NextFunction;
  return { req, res, next, resBody };
}

describe("requireAuth middleware", () => {
  it("calls next and sets req.userId with a valid token", async () => {
    const token = await createAccessToken("user-abc");
    const { req, res, next } = mockReqResNext({ access_token: token });

    await requireAuth(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(req.userId).toBe("user-abc");
    expect((res.status as any)).not.toHaveBeenCalled();
  });

  it("returns 401 when no access_token cookie", async () => {
    const { req, res, next, resBody } = mockReqResNext({});

    await requireAuth(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(resBody.statusCode).toBe(401);
    expect(resBody.body.error).toBe("Authentication required");
  });

  it("returns 401 when cookies object is missing", async () => {
    const req = {} as unknown as Request;
    const { res, next, resBody } = mockReqResNext();

    await requireAuth(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(resBody.statusCode).toBe(401);
  });

  it("returns 401 with an invalid token", async () => {
    const { req, res, next, resBody } = mockReqResNext({ access_token: "bad-token" });

    await requireAuth(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(resBody.statusCode).toBe(401);
    expect(resBody.body.error).toBe("Invalid or expired token");
  });

  it("returns 401 with a tampered token", async () => {
    const token = await createAccessToken("user-abc");
    const tampered = token.slice(0, -4) + "XXXX";
    const { req, res, next, resBody } = mockReqResNext({ access_token: tampered });

    await requireAuth(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(resBody.statusCode).toBe(401);
  });
});
