import { Effect, Layer } from "effect";
import type { Request, Response } from "express";
import type { Database } from "./services/Database.js";
import type { AIService } from "./services/AIService.js";
import { DatabaseError, NotFoundError, ValidationError, AIRequestError, AuthenticationError } from "./errors.js";
import { logger } from "./logger.js";

export class HttpResponse<T = unknown> {
  constructor(
    public readonly status: number,
    public readonly body: T,
  ) {}
}

function errorToResponse(error: { _tag: string }): HttpResponse {
  switch (error._tag) {
    case "NotFoundError": {
      const e = error as InstanceType<typeof NotFoundError>;
      return new HttpResponse(404, { error: `${e.entity} not found` });
    }
    case "ValidationError": {
      const e = error as InstanceType<typeof ValidationError>;
      return new HttpResponse(400, { error: e.message });
    }
    case "AuthenticationError": {
      const e = error as InstanceType<typeof AuthenticationError>;
      return new HttpResponse(401, { error: e.message });
    }
    case "AIRequestError": {
      const e = error as InstanceType<typeof AIRequestError>;
      logger.error("AI service error", { cause: String(e.cause) });
      return new HttpResponse(502, { error: "AI service unavailable" });
    }
    case "DatabaseError": {
      const e = error as InstanceType<typeof DatabaseError>;
      logger.error("Database error", { cause: String(e.cause) });
      return new HttpResponse(500, { error: "Internal server error" });
    }
    default:
      logger.error("Unhandled error", { error: String(error) });
      return new HttpResponse(500, { error: "Internal server error" });
  }
}

export type EffectHandler = <A, E extends { _tag: string }>(
  handler: (req: Request) => Effect.Effect<HttpResponse<A>, E, Database | AIService>,
) => (req: Request, res: Response) => Promise<void>;

export function createEffectHandler(
  appLayer: Layer.Layer<Database | AIService>,
): EffectHandler {
  return (handler) => async (req, res) => {
    try {
      const response = await handler(req).pipe(
        Effect.catchAll((error: { _tag: string }) =>
          Effect.succeed(errorToResponse(error)),
        ),
        Effect.provide(appLayer),
        Effect.runPromise,
      );
      res.status(response.status).json(response.body);
    } catch (defect) {
      logger.error("Unexpected defect", { error: String(defect) });
      res.status(500).json({ error: "Internal server error" });
    }
  };
}
