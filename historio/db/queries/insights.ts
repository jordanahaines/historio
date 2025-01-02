import { eq, and } from "drizzle-orm"

import { db } from ".."
import { insights } from "../schema/insight"

export async function fetchInsightsNotesforTimelineBook(bookID: string) {
  const bookInsights = await db
    .select()
    .from(insights)
    .where(and(eq(insights.book_id, bookID), eq(insights.archived, false)))

  return bookInsights
}
