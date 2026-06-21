import { Router } from "express";
import { Effect } from "effect";
import {
  getOrCreateJournal,
  createJournalEntry,
  listJournalEntries,
  deleteJournalEntry,
} from "../services/journal.service.js";
import { ValidationError, NotFoundError } from "../errors.js";
import { HttpResponse, type EffectHandler } from "../effectHandler.js";

export function journalsRouter(handle: EffectHandler) {
  const router = Router({ mergeParams: true });

  // GET /api/journals/:skilltreeId/entries
  router.get(
    "/:skilltreeId/entries",
    handle((req) =>
      Effect.gen(function* () {
        const userId = req.userId!;
        const skilltreeId = req.params.skilltreeId as string;
        const parsedLimit = parseInt(req.query.limit as string);
        const limit = Math.max(1, Math.min(Number.isFinite(parsedLimit) ? parsedLimit : 20, 100));
        const parsedOffset = parseInt(req.query.offset as string);
        const offset = Number.isFinite(parsedOffset) ? Math.max(0, parsedOffset) : 0;

        const journal = yield* getOrCreateJournal(userId, skilltreeId);
        const entries = yield* listJournalEntries(journal.id, limit, offset);
        return new HttpResponse(200, entries);
      }),
    ),
  );

  // POST /api/journals/:skilltreeId/entries
  router.post(
    "/:skilltreeId/entries",
    handle((req) =>
      Effect.gen(function* () {
        const userId = req.userId!;
        const skilltreeId = req.params.skilltreeId as string;
        const { connection, feeling, reflection, sessionId } = req.body;

        // Validate field lengths (max 10,000 chars each)
        const MAX_ENTRY_LENGTH = 10_000;
        for (const [name, value] of [["connection", connection], ["feeling", feeling], ["reflection", reflection]] as const) {
          if (typeof value === "string" && value.length > MAX_ENTRY_LENGTH) {
            return yield* Effect.fail(
              new ValidationError({
                message: `${name} must be at most ${MAX_ENTRY_LENGTH} characters`,
              }),
            );
          }
        }

        // Validate at least one section is non-empty
        const hasContent =
          (typeof connection === "string" && connection.trim().length > 0) ||
          (typeof feeling === "string" && feeling.trim().length > 0) ||
          (typeof reflection === "string" && reflection.trim().length > 0);

        if (!hasContent) {
          return yield* Effect.fail(
            new ValidationError({
              message: "At least one of feeling, reflection, or connection must be provided",
            }),
          );
        }

        const journal = yield* getOrCreateJournal(userId, skilltreeId);
        const entry = yield* createJournalEntry(journal.id, {
          connection,
          feeling,
          reflection,
          sessionId,
        });
        return new HttpResponse(201, entry);
      }),
    ),
  );

  // DELETE /api/journals/:skilltreeId/entries/:entryId
  router.delete(
    "/:skilltreeId/entries/:entryId",
    handle((req) =>
      Effect.gen(function* () {
        const userId = req.userId!;
        const skilltreeId = req.params.skilltreeId as string;
        const entryId = req.params.entryId as string;

        const journal = yield* getOrCreateJournal(userId, skilltreeId);
        const deleted = yield* deleteJournalEntry(entryId, journal.id);
        if (!deleted) {
          return yield* Effect.fail(
            new NotFoundError({ entity: "JournalEntry", id: entryId }),
          );
        }
        return new HttpResponse(200, { ok: true });
      }),
    ),
  );

  return router;
}
