import { and, count, desc, eq, gt, lt, not } from "drizzle-orm"
import { db } from ".."
import { books, SelectBook } from "../schema/book"
import { insights } from "../schema/insight"

/**
 * Helper function to get books with most overlapping insights given initial book
 * @param book
 */
export async function fetchOverlappingBooks(
  book: SelectBook,
  limit: number = 5,
): Promise<SelectBook[]> {
  const startDate = new Date(
    Number.parseInt(book.start_year as string),
    0,
    1,
  ).toDateString()
  const endDate = new Date(
    Number.parseInt(book.end_year as string),
    12,
    31,
  ).toDateString()
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
        not(eq(books.id, book.id)),
      ),
    )
    .groupBy(books.id)
    .orderBy(desc(count(insights.id)))
    .limit(limit)

  console.log(annotatedBooks.length)
  console.log({ startDate, endDate })

  return annotatedBooks.map((b) => b.book)
}
