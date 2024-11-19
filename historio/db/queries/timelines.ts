import { db } from "@/db"
import colors, { tailwindTimelineColors } from "@/lib/colors"
import { FrontendTimelineBook, ZoomLevel } from "@/types/timeline"
import { eq, inArray, and } from "drizzle-orm"
import _ from "lodash"
import { books, SelectBook } from "../schema/book"
import { SelectTimeline, timelineBooks, timelines } from "../schema/timeline"
import { insights } from "../schema/insight"

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

/** Fetch everything neded to render a timeline:
 * Timeline, TimelineBook/Book, and Insights
 */
export async function fetchTimelineAndBooks(
  timelineID: string,
): Promise<[SelectTimeline, FrontendTimelineBook[]]> {
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
    .select({ tb: timelineBooks, title: books.title, author: books.author })
    .from(timelineBooks)
    .innerJoin(books, eq(timelineBooks.book_id, books.id))
    .where(eq(timelineBooks.timeline_id, timelineID))

  const bookIDs: string[] = _.filter(
    tbooks.map((t) => t.tb.book_id),
    (t) => !!t,
  )

  const tinsights = await db
    .select()
    .from(insights)
    .where(
      and(inArray(insights.book_id, bookIDs), eq(insights.archived, false)),
    )

  const keyedInsights = _.groupBy(tinsights, "book_id")

  const earliestStart = _.minBy(
    _.filter(tbooks, "tb.default_start"),
    "tb.default_start",
  )?.tb.default_start
  const latestEnd = _.maxBy(
    _.filter(tbooks, "tb.default_end"),
    "tb.default_end",
  )?.tb.default_end

  const usedColors = new Set<string>()
  const flattenedBooks: FrontendTimelineBook[] = tbooks.map((t) => {
    const color = _.filter(
      _.keys(tailwindTimelineColors),
      (c) => !usedColors.has(c),
    )[0]
    usedColors.add(color)
    return {
      timeline_book_id: t.tb.id,
      book_id: t.tb.book_id,
      title: t.title || "",
      author: t.author || "",
      color,
      order: t.tb.order || 0,
      default_start: t.tb.default_start || earliestStart,
      default_end: t.tb.default_end || latestEnd,
      start: t.tb.default_start || earliestStart,
      end: t.tb.default_end || latestEnd,
      zoom: ZoomLevel.One,
      locked: false,
      insights: t.tb.book_id ? keyedInsights[t.tb.book_id] : [],
    }
  })

  return [timeline, flattenedBooks]
}
