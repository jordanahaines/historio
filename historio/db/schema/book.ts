import { numeric, pgTable, timestamp, varchar } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

import { BASE_SCHEMA_FIELDS } from "./common"

export const books = pgTable("books", {
  ...BASE_SCHEMA_FIELDS,
  title: varchar("title"),
  author: varchar("author"),
  isbn: varchar("isbn").unique(),
  amazon_id: varchar("amazon_id").unique(), // For Goodreads Books Only
  description: varchar("description"),
  start_year: numeric("start_year"),
  end_year: numeric("end_year"),
  last_import: timestamp("last_import"), // Last datetime at which someone added this book
  image_url: varchar("image_url"), // Full URL Image
  completed_researchers: varchar("completed_researchers")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
})

export type InsertBook = typeof books.$inferInsert
export type SelectBook = typeof books.$inferSelect
