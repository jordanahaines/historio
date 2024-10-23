CREATE TABLE IF NOT EXISTS "researcher_runs" (
	"created" timestamp DEFAULT now() NOT NULL,
	"updated" timestamp NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"researcher_key" varchar,
	"book_id" uuid,
	"failure" boolean DEFAULT false,
	"error" varchar,
	"new_insights" numeric,
	"duration_ms" numeric
);
--> statement-breakpoint
ALTER TABLE "insights" ADD COLUMN "researcher_run" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "researcher_runs" ADD CONSTRAINT "researcher_runs_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "insights" ADD CONSTRAINT "insights_researcher_run_researcher_runs_id_fk" FOREIGN KEY ("researcher_run") REFERENCES "public"."researcher_runs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
