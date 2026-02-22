import { Effect } from "effect";
import { eq, and } from "drizzle-orm";
import { AIService, type AIServiceShape } from "./AIService.js";
import { query } from "../Database.js";
import { userAiProviders } from "../../db/schema.js";
import { createWebhookAdapter } from "./webhook.adapter.js";
import type { Database } from "../Database.js";
import type { DatabaseError } from "../../errors.js";

export const resolveAIForUser = (
  userId: string,
): Effect.Effect<AIServiceShape, DatabaseError, Database | AIService> =>
  Effect.gen(function* () {
    const defaultProvider = yield* AIService;

    const [row] = yield* query((db) =>
      db
        .select()
        .from(userAiProviders)
        .where(
          and(
            eq(userAiProviders.userId, userId),
            eq(userAiProviders.enabled, true),
          ),
        ),
    );

    if (row?.webhookUrl) {
      return createWebhookAdapter(
        { webhookUrl: row.webhookUrl, secret: row.secret, userId },
        defaultProvider,
      );
    }

    return defaultProvider;
  });
