import { Data } from "effect";

export class DatabaseError extends Data.TaggedError("DatabaseError")<{
  cause: unknown;
}> {}

export class NotFoundError extends Data.TaggedError("NotFoundError")<{
  entity: string;
  id: string;
}> {}

export class ValidationError extends Data.TaggedError("ValidationError")<{
  message: string;
}> {}

export class AIRequestError extends Data.TaggedError("AIRequestError")<{
  cause: unknown;
}> {}
