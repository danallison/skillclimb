import { Router } from "express";
import { Effect } from "effect";
import {
  getOrCreateJournal,
  createJournalEntry,
  listJournalEntries,
  deleteJournalEntry,
} from "../services/journal.service.js";
import { ValidationError } from "../errors.js";
import { HttpResponse, type EffectHandler } from "../effectHandler.js";

export function journalsRouter(handle: EffectHandler) {
  const router = Router({ mergeParams: true });

  // GET /api/journals/:skilltreeId/entries
  router.get(
    "/:skilltreeId/entries",
    handle((req) =>
      Effect.gen(function* () {
        const userId = req.userId!;
        const { skilltreeId } = req.params;
        const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
        const offset = parseInt(req.query.offset as string) || 0;

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
        const { skilltreeId } = req.params;
        const { connection, feeling, reflection, sessionId } = req.body;

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
        const { skilltreeId, entryId } = req.params;

        const journal = yield* getOrCreateJournal(userId, skilltreeId);
        yield* deleteJournalEntry(entryId, journal.id);
        return new HttpResponse(200, { ok: true });
      }),
    ),
  );

  return router;
}
