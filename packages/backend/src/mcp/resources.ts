import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { SkillClimbClient } from "./client.js";

export function registerResources(
  server: McpServer,
  client: SkillClimbClient,
) {
  // ─── Learner Profile ──────────────────────────────────────────────

  server.resource(
    "learner-profile",
    "skillclimb://me/profile",
    {
      description:
        "Comprehensive learner profile: mastery stats, tier completion, badges, streak, velocity, retention, calibration",
    },
    async (uri) => {
      const profile = await client.getUserProfile();
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(profile, null, 2),
          },
        ],
      };
    },
  );

  // ─── Due Items ────────────────────────────────────────────────────

  server.resource(
    "due-items",
    "skillclimb://me/due",
    {
      description:
        "Nodes due for review with concept, domain, and SRS state",
    },
    async (uri) => {
      const dueItems = await client.getDueItems();
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(dueItems, null, 2),
          },
        ],
      };
    },
  );

  // ─── Domain Progress ──────────────────────────────────────────────

  server.resource(
    "domain-progress",
    "skillclimb://me/domains",
    {
      description:
        "Per-domain mastery, freshness, badge state, and topic breakdown",
    },
    async (uri) => {
      const progress = await client.getUserProgress();
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(progress, null, 2),
          },
        ],
      };
    },
  );

  // ─── Skill Tree Map ───────────────────────────────────────────────

  server.resource(
    "skill-tree-map",
    new ResourceTemplate("skillclimb://skilltrees/{id}/map", {
      list: undefined,
    }),
    {
      description:
        "Full skill tree hierarchy with domains, topics, nodes, and prerequisite graph",
    },
    async (uri, variables) => {
      const skilltreeId = variables.id as string;
      const treeMap = await client.getSkilltreeMap(skilltreeId);
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(treeMap, null, 2),
          },
        ],
      };
    },
  );

  // ─── Session History ──────────────────────────────────────────────

  server.resource(
    "session-history",
    "skillclimb://me/sessions",
    {
      description: "Recent session results and analytics",
    },
    async (uri) => {
      const history = await client.getSessionHistory();
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(history, null, 2),
          },
        ],
      };
    },
  );
}
