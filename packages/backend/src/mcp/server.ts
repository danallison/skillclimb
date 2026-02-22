import { Effect, Layer } from "effect";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { DatabaseLive, type Database } from "../services/Database.js";
import { AIServiceLive, type AIService } from "../services/ai/AIService.js";
import { registerTools } from "./tools.js";
import { registerResources } from "./resources.js";

export type RunEffect = <A>(
  effect: Effect.Effect<A, any, Database | AIService>,
) => Promise<A>;

function formatEffectError(error: unknown): string {
  if (error && typeof error === "object" && "_tag" in error) {
    const tagged = error as { _tag: string; [key: string]: unknown };
    switch (tagged._tag) {
      case "NotFoundError":
        return `${tagged.entity} not found: ${tagged.id}`;
      case "ValidationError":
        return `Validation error: ${tagged.message}`;
      case "AIRequestError":
        return "AI service unavailable";
      case "DatabaseError":
        return "Database error";
      default:
        return `Error: ${tagged._tag}`;
    }
  }
  return error instanceof Error ? error.message : String(error);
}

export function createSkillClimbMCPServer() {
  const server = new McpServer({
    name: "skillclimb",
    version: "0.1.0",
  });

  const AppLayer = Layer.mergeAll(DatabaseLive, AIServiceLive);

  const runEffect: RunEffect = <A>(
    effect: Effect.Effect<A, any, Database | AIService>,
  ) =>
    effect.pipe(
      Effect.provide(AppLayer),
      Effect.mapError((error) => {
        throw new Error(formatEffectError(error));
      }),
      Effect.runPromise,
    );

  registerTools(server, runEffect);
  registerResources(server, runEffect);

  return server;
}
