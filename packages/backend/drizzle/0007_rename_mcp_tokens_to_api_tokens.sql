ALTER TABLE "mcp_tokens" RENAME TO "api_tokens";--> statement-breakpoint
ALTER TABLE "api_tokens" RENAME CONSTRAINT "mcp_tokens_user_id_users_id_fk" TO "api_tokens_user_id_users_id_fk";
