import { db } from ".."
import { insights } from "../schema/insight"
import { eq } from "drizzle-orm"

export async function fetchInsightsNotesforTimelineBook(bookID: string) {
  const bookInsights = await db
    .select()
    .from(insights)
    .where(eq(insights.book_id, bookID))

  return bookInsights
}
