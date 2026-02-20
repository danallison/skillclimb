ALTER TABLE "packs" RENAME TO "skilltrees";
--> statement-breakpoint
ALTER TABLE "domains" RENAME CONSTRAINT "domains_pack_id_packs_id_fk" TO "domains_skilltree_id_skilltrees_id_fk";
--> statement-breakpoint
ALTER TABLE "domains" RENAME COLUMN "pack_id" TO "skilltree_id";
--> statement-breakpoint
ALTER TABLE "domains" RENAME CONSTRAINT "domains_pack_id_name_unique" TO "domains_skilltree_id_name_unique";
--> statement-breakpoint
ALTER TABLE "placement_tests" RENAME CONSTRAINT "placement_tests_pack_id_packs_id_fk" TO "placement_tests_skilltree_id_skilltrees_id_fk";
--> statement-breakpoint
ALTER TABLE "placement_tests" RENAME COLUMN "pack_id" TO "skilltree_id";
