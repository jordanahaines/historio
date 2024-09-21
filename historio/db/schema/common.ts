/**
 * This module exports common fields across all models. (Similar to Django model inheritance)
 */
import { timestamp, uuid } from "drizzle-orm/pg-core"

export const BASE_SCHEMA_FIELDS = {
  created: timestamp("created").notNull().defaultNow(),
  updated: timestamp("updated")
    .notNull()
    .$onUpdate(() => new Date()),
  id: uuid("id").primaryKey().defaultRandom(),
}
