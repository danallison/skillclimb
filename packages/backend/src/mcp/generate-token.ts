import { eq } from "drizzle-orm";
import { db } from "../db/connection.js";
import { users } from "../db/schema.js";
import { createApiToken } from "../services/auth.service.js";

const args = process.argv.slice(2);
const emailIndex = args.indexOf("--email");
const nameIndex = args.indexOf("--name");

if (emailIndex === -1 || !args[emailIndex + 1]) {
  console.error("Usage: npm run api:token --workspace=@skillclimb/backend -- --email user@example.com [--name 'Claude Desktop']");
  process.exit(1);
}

const email = args[emailIndex + 1];
const name = nameIndex !== -1 ? args[nameIndex + 1] : undefined;

const [user] = await db.select().from(users).where(eq(users.email, email));

if (!user) {
  console.error(`No user found with email: ${email}`);
  process.exit(1);
}

const { token, id } = await createApiToken(user.id, name);
console.log(`Token ID: ${id}`);
console.log(`Token:    ${token}`);
console.log(`\nTo revoke: npm run api:tokens --workspace=@skillclimb/backend -- --revoke ${id}`);
process.exit(0);
