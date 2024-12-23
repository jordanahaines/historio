ALTER TABLE "timeline_books" ALTER COLUMN "order" TYPE integer USING ("order"::integer);--> statement-breakpoint
ALTER TABLE "insights" ADD COLUMN "archived" boolean DEFAULT false;