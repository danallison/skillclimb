import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createSkillClimbMCPServer } from "./server.js";

const server = createSkillClimbMCPServer();
const transport = new StdioServerTransport();
await server.connect(transport);
