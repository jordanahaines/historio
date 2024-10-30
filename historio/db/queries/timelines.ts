import { db } from "@/db"
import colors from "@/lib/colors"
import _ from "lodash"
import { books, SelectBook } from "../schema/book"
import {
  InsertTimeline,
  SelectTimeline,
  SelectTimelineBook,
  timelineBooks,
  timelines,
} from "../schema/timeline"
import { eq, inArray } from "drizzle-orm"
import { time } from "console"

/**
 * Helper function to create a new timeline, given a list of books
 * @param books
 */
export async function createTimeline(
  books: SelectBook[],
): Promise<SelectTimeline> {
  const title = "Timeline for: " + _.map(books, "title").join(", ")
  const description = title
  const newTimeline = (
    await db.insert(timelines).values({ title, description }).returning()
  )[0]

  // Create our timelinebooks
  const insertTimelineBooks = books.map((b, idx) => {
    let defaultStart,
      defaultEnd = null
    if (b.start_year) {
      defaultStart = new Date(parseInt(b.start_year), 0, 1)
    }
    if (b.end_year) {
      defaultEnd = new Date(parseInt(b.end_year), 0, 1)
    }

    return {
      timeline_id: newTimeline.id,
      book_id: b.id,
      order: idx.toString(),
      color: colors[_.random(0, colors.length - 1)],
      default_start: defaultStart,
      default_end: defaultEnd,
    }
  })
  await db.insert(timelineBooks).values(insertTimelineBooks)

  return newTimeline
}

export async function fetchTimelineAndBooks(
  timelineID: string,
): Promise<[SelectTimeline, SelectTimelineBook[], SelectBook[]]> {
  const timeline = (
    await db
      .select()
      .from(timelines)
      .where(eq(timelines.id, timelineID))
      .limit(1)
  )[0]

  if (!timeline) {
    throw new Error(`Timeline not found: ${timelineID}`)
  }

  const tbooks = await db
    .select()
    .from(timelineBooks)
    .where(eq(timelineBooks.timeline_id, timelineID))
  const returnBooks = await db
    .select()
    .from(books)
    .where(inArray(books.id, _.map(tbooks, "id")))

  return [timeline, tbooks, returnBooks]
}
