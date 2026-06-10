import { timingSafeEqual } from "node:crypto";
import type { Request, RequestHandler } from "express";

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export function extractApiKey(req: Request): string | undefined {
  const headerKey = req.header("x-api-key");
  if (headerKey) return headerKey;

  const auth = req.header("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);

  return undefined;
}

export function createApiKeyMiddleware(expectedKey?: string): RequestHandler {
  return (req, res, next) => {
    if (!expectedKey) return next();

    const provided = extractApiKey(req);
    if (!provided || !safeEqual(provided, expectedKey)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    return next();
  };
}
