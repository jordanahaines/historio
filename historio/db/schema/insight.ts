import {
  date,
  numeric,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import { BASE_SCHEMA_FIELDS } from "./common"
import { books } from "./book"

export const insights = pgTable("insights", {
  ...BASE_SCHEMA_FIELDS,
  name: varchar("name"),
  date: date("date"),
  year: numeric("year"),
  description: varchar("description"),
  book_id: uuid("book_id").references(() => books.id),
  wikipedia_link: varchar("wikipedia_link"),
  views: numeric("views"),
})

// Researcher runs represent an instance of one researcher running for one book
export type InsertInsight = typeof insights.$inferInsert
export type SelectInsight = typeof insights.$inferSelect
