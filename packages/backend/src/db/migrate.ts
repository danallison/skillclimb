import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db, client } from "./connection.js";
import { logger } from "../logger.js";

export async function runMigrations() {
  logger.info("Running migrations...");
  await migrate(db, { migrationsFolder: "./drizzle" });
  logger.info("Migrations complete.");
}

// Run standalone when executed directly
const isMain = process.argv[1]?.endsWith("migrate.js") || process.argv[1]?.endsWith("migrate.ts");
if (isMain) {
  runMigrations()
    .then(() => client.end())
    .catch((err) => {
      logger.error("Migration failed", { error: String(err) });
      process.exit(1);
    });
}
