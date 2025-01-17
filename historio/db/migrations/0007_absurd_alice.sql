ALTER TABLE "timelines" ADD COLUMN "is_demo" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "timeline_books" DROP COLUMN IF EXISTS "is_demo";