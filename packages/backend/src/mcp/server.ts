import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SkillClimbClient } from "./client.js";
import { registerTools } from "./tools.js";
import { registerResources } from "./resources.js";

export function createSkillClimbMCPServer() {
  const baseUrl = process.env.SKILLCLIMB_URL;
  const token = process.env.SKILLCLIMB_TOKEN;

  if (!baseUrl) {
    console.error("SKILLCLIMB_URL environment variable is required");
    console.error(
      "Example: SKILLCLIMB_URL=http://localhost:3001 SKILLCLIMB_TOKEN=<jwt> npm run mcp",
    );
    process.exit(1);
  }

  if (!token) {
    console.error("SKILLCLIMB_TOKEN environment variable is required");
    console.error(
      "Generate a token: npm run api:token --workspace=@skillclimb/backend -- --email user@example.com",
    );
    process.exit(1);
  }

  const server = new McpServer({
    name: "skillclimb",
    version: "0.1.0",
  });

  const client = new SkillClimbClient(baseUrl, token);

  registerTools(server, client);
  registerResources(server, client);

  return server;
}
