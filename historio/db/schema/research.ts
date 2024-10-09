import { boolean, numeric, pgTable, uuid, varchar } from "drizzle-orm/pg-core"

import { books } from "./book"
import { BASE_SCHEMA_FIELDS } from "./common"

export const researcherRuns = pgTable("researcher_runs", {
  ...BASE_SCHEMA_FIELDS,
  researcher_key: varchar("researcher_key"),
  book_id: uuid("book_id").references(() => books.id),
  failure: boolean("failure").default(false),
  error: varchar("error"),
  new_insights: numeric("new_insights"),
  duration_ms: numeric("duration_ms"),
})

export type SelectResearcherRun = typeof researcherRuns.$inferSelect
export type InsertResearcherRun = typeof researcherRuns.$inferInsert
