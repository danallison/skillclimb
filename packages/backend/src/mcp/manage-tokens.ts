import { eq } from "drizzle-orm";
import { db } from "../db/connection.js";
import { users } from "../db/schema.js";
import { listApiTokens, revokeApiToken } from "../services/auth.service.js";

const args = process.argv.slice(2);

if (args.includes("--list")) {
  const emailIndex = args.indexOf("--email");
  if (emailIndex === -1 || !args[emailIndex + 1]) {
    console.error("Usage: npm run api:tokens -- --list --email user@example.com");
    process.exit(1);
  }
  const email = args[emailIndex + 1];

  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) {
    console.error(`No user found with email: ${email}`);
    process.exit(1);
  }

  const tokens = await listApiTokens(user.id);
  if (tokens.length === 0) {
    console.log("No API tokens found.");
  } else {
    console.log(`API tokens for ${email}:\n`);
    for (const t of tokens) {
      const expired = t.expiresAt < new Date() ? " (EXPIRED)" : "";
      console.log(`  ID:      ${t.id}`);
      console.log(`  Name:    ${t.name ?? "(unnamed)"}`);
      console.log(`  Created: ${t.createdAt.toISOString()}`);
      console.log(`  Expires: ${t.expiresAt.toISOString()}${expired}`);
      console.log();
    }
  }
} else if (args.includes("--revoke")) {
  const revokeIndex = args.indexOf("--revoke");
  const tokenId = args[revokeIndex + 1];
  if (!tokenId) {
    console.error("Usage: npm run api:tokens -- --revoke <token-id>");
    process.exit(1);
  }

  await revokeApiToken(tokenId);
  console.log(`Revoked API token: ${tokenId}`);
} else {
  console.error("Usage:");
  console.error("  npm run api:tokens -- --list --email user@example.com");
  console.error("  npm run api:tokens -- --revoke <token-id>");
  process.exit(1);
}

process.exit(0);
