CREATE TABLE IF NOT EXISTS "books" (
	"created" timestamp DEFAULT now() NOT NULL,
	"updated" timestamp NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar,
	"author" varchar,
	"isbn" varchar,
	"amazon_id" varchar,
	"description" varchar,
	"start_year" numeric,
	"end_year" numeric,
	"last_import" timestamp,
	"image_url" varchar,
	"completed_researchers" varchar[] DEFAULT ARRAY[]::text[] NOT NULL,
	CONSTRAINT "books_isbn_unique" UNIQUE("isbn"),
	CONSTRAINT "books_amazon_id_unique" UNIQUE("amazon_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "insights" (
	"created" timestamp DEFAULT now() NOT NULL,
	"updated" timestamp NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar,
	"date" date,
	"year" numeric,
	"description" varchar,
	"book_id" uuid,
	"wikipedia_link" varchar,
	"views" numeric
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "insights" ADD CONSTRAINT "insights_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
