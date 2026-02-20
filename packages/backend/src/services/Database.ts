import { Context, Effect, Layer } from "effect";
import { db as drizzleDb } from "../db/connection.js";
import { DatabaseError } from "../errors.js";

export type DbClient = typeof drizzleDb;

export class Database extends Context.Tag("Database")<Database, DbClient>() {}

export const DatabaseLive = Layer.succeed(Database, drizzleDb);

export const query = <A>(
  fn: (db: DbClient) => Promise<A>,
): Effect.Effect<A, DatabaseError, Database> =>
  Effect.gen(function* () {
    const db = yield* Database;
    return yield* Effect.tryPromise({
      try: () => fn(db),
      catch: (cause) => new DatabaseError({ cause }),
    });
  });
