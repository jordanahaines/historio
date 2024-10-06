import { date, numeric, pgTable, uuid, varchar } from "drizzle-orm/pg-core"

import { books } from "./book"
import { BASE_SCHEMA_FIELDS } from "./common"
import { researcherRuns } from "./research"

export const insights = pgTable("insights", {
  ...BASE_SCHEMA_FIELDS,
  name: varchar("name"),
  date: date("date"), // Expect either date or year. Negative years are BC
  year: numeric("year"),
  description: varchar("description"),
  book_id: uuid("book_id").references(() => books.id),
  wikipedia_link: varchar("wikipedia_link"),
  views: numeric("views"),
  researcher_run: uuid("researcher_run").references(() => researcherRuns.id),
})

// Researcher runs represent an instance of one researcher running for one book
export type InsertInsight = typeof insights.$inferInsert
export type SelectInsight = typeof insights.$inferSelect
