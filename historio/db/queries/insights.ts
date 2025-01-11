import { eq, and } from "drizzle-orm"

import { db as database } from ".."
import { insights } from "../schema/insight"

export async function fetchInsightsNotesforTimelineBook(bookID: string) {
  const bookInsights = await database
    .select()
    .from(insights)
    .where(and(eq(insights.book_id, bookID), eq(insights.archived, false)))

  return bookInsights
}
