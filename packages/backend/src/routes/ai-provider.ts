import { Router } from "express";
import { Effect } from "effect";
import { eq } from "drizzle-orm";
import { query } from "../services/Database.js";
import { userAiProviders } from "../db/schema.js";
import { ValidationError } from "../errors.js";
import { HttpResponse, type EffectHandler } from "../effectHandler.js";

const MAX_WEBHOOK_URL_LENGTH = 2048;
const MAX_SECRET_LENGTH = 256;

// Hostnames/IPs that must never be used as webhook targets (SSRF prevention).
// Note: DNS-based rebinding bypasses these checks; for stronger guarantees,
// deploy the backend behind an egress proxy that blocks private ranges.
const BLOCKED_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "[::1]",
  "::1",
  "[::0]",
  "::0",
  "169.254.169.254",    // cloud metadata (AWS, GCP, etc.)
  "[fd00::1]",          // IPv6 link-local metadata
  "metadata.google.internal",
]);

function isBlockedHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (BLOCKED_HOSTS.has(h)) return true;
  // Block 127.x.x.x range and 169.254.x.x range
  if (/^127\.\d+\.\d+\.\d+$/.test(h)) return true;
  if (/^169\.254\.\d+\.\d+$/.test(h)) return true;
  return false;
}

function isValidWebhookUrl(url: string): { valid: boolean; reason?: string } {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return { valid: false, reason: "webhookUrl must be a valid HTTP or HTTPS URL" };
    }
    if (isBlockedHost(parsed.hostname)) {
      return { valid: false, reason: "webhookUrl must not point to a local or internal address" };
    }
    // Block URLs with credentials (http://user:pass@host)
    if (parsed.username || parsed.password) {
      return { valid: false, reason: "webhookUrl must not contain credentials" };
    }
    return { valid: true };
  } catch {
    return { valid: false, reason: "webhookUrl must be a valid HTTP or HTTPS URL" };
  }
}

export function aiProviderRouter(handle: EffectHandler) {
  const router = Router();

  // GET /api/users/me/ai-provider
  router.get(
    "/me/ai-provider",
    handle((req) =>
      Effect.gen(function* () {
        const userId = req.userId!;

        const [row] = yield* query((db) =>
          db
            .select()
            .from(userAiProviders)
            .where(eq(userAiProviders.userId, userId)),
        );

        if (!row || !row.enabled) {
          return new HttpResponse(200, null);
        }

        return new HttpResponse(200, {
          webhookUrl: row.webhookUrl,
          hasSecret: row.secret != null,
          enabled: row.enabled,
        });
      }),
    ),
  );

  // PUT /api/users/me/ai-provider
  router.put(
    "/me/ai-provider",
    handle((req) =>
      Effect.gen(function* () {
        const userId = req.userId!;
        const { webhookUrl, secret } = req.body;

        if (!webhookUrl || typeof webhookUrl !== "string") {
          return yield* Effect.fail(
            new ValidationError({ message: "webhookUrl is required" }),
          );
        }

        if (webhookUrl.length > MAX_WEBHOOK_URL_LENGTH) {
          return yield* Effect.fail(
            new ValidationError({ message: `webhookUrl must be at most ${MAX_WEBHOOK_URL_LENGTH} characters` }),
          );
        }

        const urlCheck = isValidWebhookUrl(webhookUrl);
        if (!urlCheck.valid) {
          return yield* Effect.fail(
            new ValidationError({ message: urlCheck.reason! }),
          );
        }

        if (secret != null && typeof secret !== "string") {
          return yield* Effect.fail(
            new ValidationError({ message: "secret must be a string" }),
          );
        }

        if (typeof secret === "string" && secret.length > MAX_SECRET_LENGTH) {
          return yield* Effect.fail(
            new ValidationError({ message: `secret must be at most ${MAX_SECRET_LENGTH} characters` }),
          );
        }

        // Upsert: insert or update
        const [existing] = yield* query((db) =>
          db
            .select()
            .from(userAiProviders)
            .where(eq(userAiProviders.userId, userId)),
        );

        if (existing) {
          yield* query((db) =>
            db
              .update(userAiProviders)
              .set({
                webhookUrl,
                secret: secret ?? null,
                enabled: true,
                updatedAt: new Date(),
              })
              .where(eq(userAiProviders.userId, userId)),
          );
        } else {
          yield* query((db) =>
            db.insert(userAiProviders).values({
              userId,
              webhookUrl,
              secret: secret ?? null,
              enabled: true,
            }),
          );
        }

        return new HttpResponse(200, {
          webhookUrl,
          hasSecret: secret != null,
          enabled: true,
        });
      }),
    ),
  );

  // DELETE /api/users/me/ai-provider
  router.delete(
    "/me/ai-provider",
    handle((req) =>
      Effect.gen(function* () {
        const userId = req.userId!;

        yield* query((db) =>
          db
            .update(userAiProviders)
            .set({ enabled: false, updatedAt: new Date() })
            .where(eq(userAiProviders.userId, userId)),
        );

        return new HttpResponse(200, { disabled: true });
      }),
    ),
  );

  return router;
}
