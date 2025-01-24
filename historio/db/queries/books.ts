import { and, count, desc, eq, gt, lt, not } from "drizzle-orm"
import { db } from ".."
import { books, SelectBook } from "../schema/book"
import { insights } from "../schema/insight"

export type fetchOverlapParams = {
  book?: SelectBook
  start?: Date
  end?: Date
  limit?: number
}

/**
 * Helper function to get books with most overlapping insights given initial book
 * @param book
 */
export async function fetchOverlappingBooks({
  book,
  start,
  end,
  limit = 5,
}: fetchOverlapParams): Promise<SelectBook[]> {
  if (!book && (!start || !end))
    throw new Error("Either Book or start/end must be specified")
  const startDate =
    start?.toDateString() ||
    new Date(Number.parseInt(book?.start_year as string), 0, 1).toDateString()
  const endDate =
    end?.toDateString() ||
    new Date(Number.parseInt(book?.end_year as string), 12, 31).toDateString()
  const annotatedBooks = await db
    .select({
      book: books,
      insightCount: count(insights.id),
    })
    .from(books)
    .leftJoin(insights, eq(books.id, insights.book_id))
    .where(
      and(
        gt(insights.date, startDate),
        lt(insights.date, endDate),
        not(insights.archived),
        book?.id ? not(eq(books.id, book?.id)) : undefined,
      ),
    )
    .groupBy(books.id)
    .orderBy(desc(count(insights.id)))
    .limit(limit)

  console.log(annotatedBooks.length)
  console.log({ startDate, endDate })

  return annotatedBooks.map((b) => b.book)
}
