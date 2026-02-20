CREATE TABLE "packs" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
INSERT INTO "packs" ("id", "name") VALUES ('cybersecurity', 'Cybersecurity');
--> statement-breakpoint
ALTER TABLE "domains" ADD COLUMN "pack_id" text;
--> statement-breakpoint
UPDATE "domains" SET "pack_id" = 'cybersecurity';
--> statement-breakpoint
ALTER TABLE "domains" ALTER COLUMN "pack_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "domains" ADD CONSTRAINT "domains_pack_id_packs_id_fk"
  FOREIGN KEY ("pack_id") REFERENCES "packs"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "domains" DROP CONSTRAINT "domains_name_unique";
--> statement-breakpoint
ALTER TABLE "domains" ADD CONSTRAINT "domains_pack_id_name_unique" UNIQUE ("pack_id", "name");
--> statement-breakpoint
ALTER TABLE "placement_tests" ADD COLUMN "pack_id" text;
--> statement-breakpoint
ALTER TABLE "placement_tests" ADD CONSTRAINT "placement_tests_pack_id_packs_id_fk"
  FOREIGN KEY ("pack_id") REFERENCES "packs"("id") ON DELETE no action ON UPDATE no action;
