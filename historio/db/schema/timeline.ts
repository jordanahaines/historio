import {
  boolean,
  integer,
  numeric,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import { books } from "./book"
import { BASE_SCHEMA_FIELDS } from "./common"

export const timelines = pgTable("timelines", {
  ...BASE_SCHEMA_FIELDS,
  title: varchar("title"),
  description: varchar("description"),
  published: boolean("published").default(false),
  published_at: timestamp("published_at"),
  is_demo: boolean("is_demo").default(false),
  start_year: numeric("start_year"),
  end_year: numeric("end_year"),
})

export type InsertTimeline = typeof timelines.$inferInsert
export type SelectTimeline = typeof timelines.$inferSelect

export const timelineBooks = pgTable("timeline_books", {
  ...BASE_SCHEMA_FIELDS,
  timeline_id: uuid("timeline_id").references(() => timelines.id),
  book_id: uuid("book_id").references(() => books.id),
  default_start: timestamp("default_start"),
  default_end: timestamp("default_end"),
  color: varchar("color"),
  order: integer("order"),
})

export type InsertTimelineBook = typeof timelineBooks.$inferInsert
export type SelectTimelineBook = typeof timelineBooks.$inferSelect
