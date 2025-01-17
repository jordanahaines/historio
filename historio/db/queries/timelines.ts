import { and, eq, inArray, isNotNull } from "drizzle-orm"
import _ from "lodash"

import { books, SelectBook } from "../schema/book"
import { insights } from "../schema/insight"
import { SelectTimeline, timelineBooks, timelines } from "../schema/timeline"

import { db } from "@/db"
import colors, { tailwindTimelineColors } from "@/lib/colors"
import { parseDate } from "@/lib/researchers/utils"
import { GroupInsights } from "@/lib/timelines/utils"
import {
  FrontendTimelineBook,
  GroupedInsights,
  ZoomLevel,
} from "@/types/timeline"

/**
 * Helper function to create a new timeline, given a list of books
 * @param books
 */
export async function createTimeline(
  books: SelectBook[],
  timelineTitle?: string,
): Promise<SelectTimeline> {
  const title =
    timelineTitle || "Timeline for: " + _.map(books, "title").join(", ")
  const description = title
  const [newTimeline] = await db
    .insert(timelines)
    .values({ title, description })
    .returning()

  // Create our timelinebooks
  const insertTimelineBooks = books.map((b, index) => {
    let defaultStart, defaultEnd
    if (b.start_year) {
      defaultStart = new Date(Number.parseInt(b.start_year), 0, 1)
    }
    if (b.end_year) {
      defaultEnd = new Date(Number.parseInt(b.end_year), 0, 1)
    }

    return {
      timeline_id: newTimeline.id,
      book_id: b.id,
      order: index,
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
  const [timeline] = await db
    .select()
    .from(timelines)
    .where(eq(timelines.id, timelineID))
    .limit(1)

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
    (t) => t !== null,
  )

  const tinsights = await db
    .select()
    .from(insights)
    .where(
      and(inArray(insights.book_id, bookIDs), eq(insights.archived, false)),
    )

  const keyedInsights = _.groupBy(tinsights, "book_id")

  const usedColors = new Set<string>()
  const flattenedBooks: FrontendTimelineBook[] = tbooks.map((t) => {
    const color = _.find(
      _.keys(tailwindTimelineColors),
      (c) => !usedColors.has(c),
    )
    if (color) usedColors.add(color)
    const bookInsights = t.tb.book_id ? keyedInsights[t.tb.book_id] : []
    const [groupedInsights, hasEarlier, hasLater] = GroupInsights(bookInsights)
    const insightKeys = _.keys(groupedInsights).filter((k) => !!k)
    const start = parseDate(_.min(insightKeys) as string).date as Date
    const end = parseDate(_.max(insightKeys) as string).date as Date
    return {
      timeline_book_id: t.tb.id,
      book_id: t.tb.book_id as string,
      title: t.title || "",
      author: t.author || "",
      color,
      order: t.tb.order || 0,
      default_start: start,
      default_end: end,
      start: start,
      end: end,
      zoom: ZoomLevel.One,
      locked: false,
      insights: bookInsights,
      grouped_insights: (bookInsights.length > 0
        ? groupedInsights
        : []) as GroupedInsights,
      has_earlier_insight: hasEarlier,
      has_later_insight: hasLater,
    }
  })

  return [timeline, flattenedBooks]
}

export type TimelineSummary = {
  timeline: SelectTimeline
  eventDates: Date[]
}

export async function fetchTimelinesSummary(
  timelineID: string,
): Promise<TimelineSummary> {
  const timeline = await db
    .select()
    .from(timelines)
    .where(eq(timelines.id, timelineID))
    .limit(1)
  if (timeline.length === 0) throw new Error("Timeline not found")
  const dates = await db
    .select({ d: insights.date })
    .from(insights)
    .innerJoin(timelineBooks, eq(insights.book_id, timelineBooks.book_id))
    .where(
      and(eq(timelineBooks.timeline_id, timelineID), isNotNull(insights.date)),
    )

  const eventDates = _.filter(
    _.map(dates, (d) => parseDate(d.d as string).date),
    (d) => d !== undefined,
  )

  return {
    timeline: timeline[0],
    eventDates,
  }
}

export async function fetchDemoTimelines(): Promise<TimelineSummary[]> {
  const demoTimelines = await db
    .select()
    .from(timelines)
    .where(eq(timelines.is_demo, true))

  const summaries = await Promise.all(
    demoTimelines.map((dt) => fetchTimelinesSummary(dt.id)),
  )
  return summaries
}
