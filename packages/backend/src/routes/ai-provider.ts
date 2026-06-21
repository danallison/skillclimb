import { Router } from "express";
import { Effect } from "effect";
import { eq } from "drizzle-orm";
import { resolve4, resolve6 } from "node:dns/promises";
import { query } from "../services/Database.js";
import { userAiProviders } from "../db/schema.js";
import { ValidationError } from "../errors.js";
import { HttpResponse, type EffectHandler } from "../effectHandler.js";

const MAX_WEBHOOK_URL_LENGTH = 2048;
const MAX_SECRET_LENGTH = 256;

// Hostnames/IPs that must never be used as webhook targets (SSRF prevention).
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

function isPrivateIP(ip: string): boolean {
  // IPv4 private/reserved ranges
  if (/^127\.\d+\.\d+\.\d+$/.test(ip)) return true;
  if (/^10\.\d+\.\d+\.\d+$/.test(ip)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/.test(ip)) return true;
  if (/^192\.168\.\d+\.\d+$/.test(ip)) return true;
  if (/^169\.254\.\d+\.\d+$/.test(ip)) return true;
  if (/^0\.\d+\.\d+\.\d+$/.test(ip)) return true;
  // IPv6 private/reserved addresses
  const normalized = ip.toLowerCase();
  if (normalized === "::1" || normalized === "::") return true;
  if (normalized.startsWith("fe80:")) return true;   // link-local
  if (normalized.startsWith("fd") || normalized.startsWith("fc")) return true; // unique local (ULA)
  if (normalized.startsWith("::ffff:")) {
    // IPv4-mapped IPv6 — extract and check the IPv4 portion
    const v4 = normalized.slice(7);
    return isPrivateIP(v4);
  }
  return false;
}

function isBlockedHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (BLOCKED_HOSTS.has(h)) return true;
  // URL.hostname preserves brackets on IPv6 literals (e.g. "[fe80::1]");
  // strip them before the private-IP check.
  const stripped = h.startsWith("[") && h.endsWith("]") ? h.slice(1, -1) : h;
  if (isPrivateIP(stripped)) return true;
  return false;
}

/**
 * Resolve hostname to IPs and check none are private (DNS rebinding mitigation).
 * Returns a reason string if blocked, or null if safe.
 */
async function checkDNSRebinding(hostname: string): Promise<string | null> {
  // Skip for IP literals — already checked by isBlockedHost
  if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname) || hostname.startsWith("[")) {
    return null;
  }
  try {
    // Resolve both A (IPv4) and AAAA (IPv6) records
    const [v4, v6] = await Promise.all([
      resolve4(hostname).catch(() => [] as string[]),
      resolve6(hostname).catch(() => [] as string[]),
    ]);
    const addresses = [...v4, ...v6];
    if (addresses.length === 0) {
      return "webhookUrl hostname could not be resolved";
    }
    for (const addr of addresses) {
      if (isPrivateIP(addr)) {
        return "webhookUrl hostname resolves to a private/internal IP address";
      }
    }
  } catch {
    return "webhookUrl hostname could not be resolved";
  }
  return null;
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

        // DNS rebinding mitigation: resolve hostname and verify IPs are not private
        const parsed = new URL(webhookUrl);
        const dnsBlock = yield* Effect.tryPromise({
          try: () => checkDNSRebinding(parsed.hostname),
          catch: () => new ValidationError({ message: "Failed to validate webhook hostname" }),
        });
        if (dnsBlock) {
          return yield* Effect.fail(
            new ValidationError({ message: dnsBlock }),
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
