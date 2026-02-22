CREATE TABLE "user_ai_providers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"webhook_url" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"secret" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_ai_providers_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "user_ai_providers" ADD CONSTRAINT "user_ai_providers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;