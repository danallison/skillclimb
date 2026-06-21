import { Effect } from "effect";
import { eq, and, desc } from "drizzle-orm";
import { journals, journalEntries } from "../db/schema.js";
import { query, Database } from "./Database.js";
import { DatabaseError } from "../errors.js";

export const getOrCreateJournal = (
  userId: string,
  skilltreeId: string,
): Effect.Effect<typeof journals.$inferSelect, DatabaseError, Database> =>
  Effect.gen(function* () {
    // Upsert: insert or do nothing on conflict, then select
    yield* query((db) =>
      db
        .insert(journals)
        .values({ userId, skilltreeId })
        .onConflictDoNothing(),
    );
    const [journal] = yield* query((db) =>
      db
        .select()
        .from(journals)
        .where(and(eq(journals.userId, userId), eq(journals.skilltreeId, skilltreeId))),
    );
    return journal;
  });

export const createJournalEntry = (
  journalId: string,
  data: {
    connection?: string | null;
    feeling?: string | null;
    reflection?: string | null;
    sessionId?: string | null;
  },
): Effect.Effect<typeof journalEntries.$inferSelect, DatabaseError, Database> =>
  Effect.gen(function* () {
    const [entry] = yield* query((db) =>
      db
        .insert(journalEntries)
        .values({
          journalId,
          connection: data.connection ?? null,
          feeling: data.feeling ?? null,
          reflection: data.reflection ?? null,
          sessionId: data.sessionId ?? null,
        })
        .returning(),
    );
    return entry;
  });

export const listJournalEntries = (
  journalId: string,
  limit: number,
  offset: number,
): Effect.Effect<(typeof journalEntries.$inferSelect)[], DatabaseError, Database> =>
  query((db) =>
    db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.journalId, journalId))
      .orderBy(desc(journalEntries.createdAt))
      .limit(limit)
      .offset(offset),
  );

export const deleteJournalEntry = (
  entryId: string,
  journalId: string,
): Effect.Effect<boolean, DatabaseError, Database> =>
  query((db) =>
    db
      .delete(journalEntries)
      .where(
        and(eq(journalEntries.id, entryId), eq(journalEntries.journalId, journalId)),
      )
      .returning({ id: journalEntries.id }),
  ).pipe(Effect.map((rows) => rows.length > 0));
