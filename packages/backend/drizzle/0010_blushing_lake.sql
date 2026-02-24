ALTER TABLE "learner_nodes" ADD CONSTRAINT "learner_nodes_easiness_check" CHECK ("learner_nodes"."easiness" >= 1.3);--> statement-breakpoint
ALTER TABLE "learner_nodes" ADD CONSTRAINT "learner_nodes_interval_check" CHECK ("learner_nodes"."interval" >= 0);--> statement-breakpoint
ALTER TABLE "learner_nodes" ADD CONSTRAINT "learner_nodes_repetitions_check" CHECK ("learner_nodes"."repetitions" >= 0);--> statement-breakpoint
ALTER TABLE "learner_nodes" ADD CONSTRAINT "learner_nodes_domain_weight_check" CHECK ("learner_nodes"."domain_weight" > 0);--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_score_check" CHECK ("reviews"."score" >= 0 AND "reviews"."score" <= 5);--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_confidence_check" CHECK ("reviews"."confidence" >= 1 AND "reviews"."confidence" <= 5);