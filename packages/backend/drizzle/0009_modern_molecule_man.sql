ALTER TABLE "nodes" ADD COLUMN "retired_at" timestamp;--> statement-breakpoint
ALTER TABLE "topics" ADD COLUMN "retired_at" timestamp;--> statement-breakpoint
ALTER TABLE "nodes" ADD CONSTRAINT "nodes_domain_id_concept_unique" UNIQUE("domain_id","concept");--> statement-breakpoint
ALTER TABLE "topics" ADD CONSTRAINT "topics_domain_id_name_unique" UNIQUE("domain_id","name");