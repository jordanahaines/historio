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

type createTimelineParams = {
  books: SelectBook[]
  timelineTitle?: string
  timelineID?: string // Existing timeline to add books to
}

/**
 * Helper function to create a new timeline, given a list of books
 * @param books
 */
export async function createTimeline({
  books,
  timelineTitle,
  timelineID,
}: createTimelineParams): Promise<SelectTimeline> {
  console.log("Creating Timeline")
  let newTimeline: SelectTimeline
  if (timelineID === undefined) {
    const title =
      timelineTitle || "Timeline for: " + _.map(books, "title").join(", ")
    const description = title
    console.log("Creating timeline", { title, description })
    const [createdTimeline] = await db
      .insert(timelines)
      .values({ title, description })
      .returning()
    newTimeline = createdTimeline
  } else {
    const fetchTimeline = await db
      .select()
      .from(timelines)
      .where(eq(timelines.id, timelineID))
      .limit(1)
    newTimeline = fetchTimeline[0]
  }

  if (books.length === 0) return newTimeline

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
  console.log("Inserting")
  console.log(JSON.stringify(insertTimelineBooks))
  await db.insert(timelineBooks).values(insertTimelineBooks)

  return newTimeline
}

/** Fetch everything neded to render a timeline:
 * Timeline, TimelineBook/Book, and Insights
 */
export async function fetchTimelineAndBooks(
  timelineID: string,
  filterEvents: boolean = true,
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
    .select({
      tb: timelineBooks,
      title: books.title,
      author: books.author,
      image_url: books.image_url,
    })
    .from(timelineBooks)
    .innerJoin(books, eq(timelineBooks.book_id, books.id))
    .where(eq(timelineBooks.timeline_id, timelineID))

  const bookIDs: string[] = _.filter(
    tbooks.map((t) => t.tb.book_id),
    (t) => t !== null,
  )

  const doFilterEvents =
    filterEvents && timeline.start_year && timeline.end_year

  let tinsights = await db
    .select()
    .from(insights)
    .where(
      and(inArray(insights.book_id, bookIDs), eq(insights.archived, false)),
    )

  if (doFilterEvents) {
    const startYear = Number(timeline.start_year)
    const endYear = Number(timeline.end_year)
    tinsights = _.filter(tinsights, (i) => {
      const dte = parseDate(i.date as string).date
      if (dte === undefined) return false
      return dte.getFullYear() >= startYear && dte.getFullYear() <= endYear
    })
  }

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
      image_url: t.image_url as string,
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

export type BookSummary = Pick<SelectBook, "title" | "author" | "image_url">

export type TimelineSummary = {
  timeline: SelectTimeline
  eventDates: Date[]
  books: BookSummary[]
}

export async function fetchTimelinesSummary(
  timelineID: string,
  filterEvents: boolean = true,
): Promise<TimelineSummary> {
  const timelineResponse = await db
    .select()
    .from(timelines)
    .where(eq(timelines.id, timelineID))
    .limit(1)
  if (timelineResponse.length === 0) throw new Error("Timeline not found")
  const timeline = timelineResponse[0]
  const dates = await db
    .select({ d: insights.date })
    .from(insights)
    .innerJoin(timelineBooks, eq(insights.book_id, timelineBooks.book_id))
    .where(
      and(eq(timelineBooks.timeline_id, timelineID), isNotNull(insights.date)),
    )

  const booksForTimeline = await db
    .select({
      title: books.title,
      author: books.author,
      image_url: books.image_url,
    })
    .from(timelineBooks)
    .innerJoin(books, eq(timelineBooks.book_id, books.id))
    .where(eq(timelineBooks.timeline_id, timelineID))

  const eventDates = _.filter(
    _.map(dates, (d) => parseDate(d.d as string).date),
    (d) => {
      if (d === undefined) return false
      const dte = d as Date

      // Fitler for dates timeline is bound by
      if (
        filterEvents &&
        timeline.start_year &&
        dte.getFullYear() < Number(timeline.start_year)
      ) {
        return false
      }
      if (
        filterEvents &&
        timeline.end_year &&
        dte.getFullYear() > Number(timeline.end_year)
      ) {
        return false
      }
      return true
    },
  ) as Date[]

  return {
    timeline: timeline,
    eventDates,
    books: booksForTimeline,
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
