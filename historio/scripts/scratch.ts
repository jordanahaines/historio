import { db } from "@/db"
import { createTimeline } from "@/db/queries/timelines"
import { books } from "@/db/schema/book"
import { eq, inArray } from "drizzle-orm"

async function createDemoTimeline() {
  const bookIDs = [
    "1a0bb8db-d4e4-439b-b3e1-ebd3ac1884a3",
    "a7c49aee-2d3b-4d78-8cdb-c650d3cfc6df",
    "466aff54-de8a-4db5-8d32-4704561847f8",
  ]

  const selectBooks = await db
    .select()
    .from(books)
    .where(inArray(books.id, bookIDs))

  createTimeline(selectBooks)
  console.log(`Created timeline with books: ${selectBooks.map((b) => b.title)}`)
}
createDemoTimeline()
