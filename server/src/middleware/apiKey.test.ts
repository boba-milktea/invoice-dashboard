import { describe, expect, it, vi } from "vitest";
import type { Request, Response } from "express";
import { createApiKeyMiddleware, extractApiKey } from "./apiKey.js";

function mockReq(headers: Record<string, string> = {}): Request {
  return {
    header(name: string) {
      const key = Object.keys(headers).find(
        (h) => h.toLowerCase() === name.toLowerCase(),
      );
      return key ? headers[key] : undefined;
    },
  } as Request;
}

function mockRes() {
  const res = {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(payload: unknown) {
      res.body = payload;
      return res;
    },
  };
  return res as Response & { statusCode: number; body: unknown };
}

describe("extractApiKey", () => {
  it("reads X-API-Key header", () => {
    expect(extractApiKey(mockReq({ "X-API-Key": "secret" }))).toBe("secret");
  });

  it("reads Authorization Bearer token", () => {
    expect(
      extractApiKey(mockReq({ Authorization: "Bearer secret" })),
    ).toBe("secret");
  });
});

describe("createApiKeyMiddleware", () => {
  it("passes when API_KEY is unset", () => {
    const middleware = createApiKeyMiddleware(undefined);
    const next = vi.fn();
    middleware(mockReq(), mockRes(), next);
    expect(next).toHaveBeenCalled();
  });

  it("returns 401 when key is missing", () => {
    const middleware = createApiKeyMiddleware("expected-key");
    const res = mockRes();
    const next = vi.fn();
    middleware(mockReq(), res, next);
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: "Unauthorized" });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when key is wrong", () => {
    const middleware = createApiKeyMiddleware("expected-key");
    const res = mockRes();
    const next = vi.fn();
    middleware(mockReq({ "X-API-Key": "wrong-key" }), res, next);
    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("passes when key matches via X-API-Key", () => {
    const middleware = createApiKeyMiddleware("expected-key");
    const res = mockRes();
    const next = vi.fn();
    middleware(mockReq({ "X-API-Key": "expected-key" }), res, next);
    expect(next).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
  });
});
