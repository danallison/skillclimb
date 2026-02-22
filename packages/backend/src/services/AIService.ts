// Re-export shim — all AI service code now lives in services/ai/
export {
  AIService,
  AIServiceLive,
  resolveProvider,
  type AIServiceShape,
} from "./ai/AIService.js";
export { resolveAIForUser } from "./ai/resolver.js";
