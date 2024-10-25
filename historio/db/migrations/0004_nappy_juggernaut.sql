CREATE TABLE IF NOT EXISTS "timeline_books" (
	"created" timestamp DEFAULT now() NOT NULL,
	"updated" timestamp NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"timeline_id" uuid,
	"book_id" uuid,
	"default_start" timestamp,
	"default_end" timestamp,
	"color" varchar,
	"order" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "timelines" (
	"created" timestamp DEFAULT now() NOT NULL,
	"updated" timestamp NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar,
	"description" varchar,
	"published" boolean DEFAULT false,
	"published_at" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "timeline_books" ADD CONSTRAINT "timeline_books_timeline_id_timelines_id_fk" FOREIGN KEY ("timeline_id") REFERENCES "public"."timelines"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "timeline_books" ADD CONSTRAINT "timeline_books_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
