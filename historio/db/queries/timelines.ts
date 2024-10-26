import { db } from "@/db"
import colors from "@/lib/colors"
import _ from "lodash"
import { SelectBook } from "../schema/book"
import { SelectTimeline, timelineBooks, timelines } from "../schema/timeline"

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
