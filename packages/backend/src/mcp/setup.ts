import { eq } from "drizzle-orm";
import { resolve } from "node:path";
import { db } from "../db/connection.js";
import { users } from "../db/schema.js";
import { createApiToken } from "../services/auth.service.js";
import { initializeLearnerNodes } from "../routes/auth.js";

const args = process.argv.slice(2);

function getArg(flag: string): string | undefined {
  const idx = args.indexOf(flag);
  return idx !== -1 ? args[idx + 1] : undefined;
}

const email = getArg("--email");
const tokenName = getArg("--name") ?? "MCP Client";
const serverUrl = getArg("--url") ?? "http://localhost:3001";

if (!email) {
  console.error(
    "Usage: npm run mcp:setup --workspace=@skillclimb/backend -- --email user@example.com [--name 'My Assistant'] [--url http://localhost:3001]",
  );
  process.exit(1);
}

// 1. Upsert user by email
let [user] = await db.select().from(users).where(eq(users.email, email));

if (!user) {
  [user] = await db.insert(users).values({ email }).returning();
  console.error(`Created new user: ${user.id}`);
} else {
  console.error(`Found existing user: ${user.id}`);
}

// 2. Initialize learner nodes (idempotent — uses onConflictDoNothing)
await initializeLearnerNodes(user.id);
console.error("Learner nodes initialized");

// 3. Generate API token
const { token, id } = await createApiToken(user.id, tokenName);
console.error(`API token created: ${id}`);

// 4. Print MCP config JSON to stdout
const backendPath = resolve(import.meta.dirname, "../..");

const config = {
  mcpServers: {
    skillclimb: {
      command: "npx",
      args: ["tsx", "src/mcp/index.ts"],
      cwd: backendPath,
      env: {
        SKILLCLIMB_URL: serverUrl,
        SKILLCLIMB_TOKEN: token,
      },
    },
  },
};

console.log(JSON.stringify(config, null, 2));

process.exit(0);
