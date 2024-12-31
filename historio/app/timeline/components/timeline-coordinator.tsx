"use client"
/**
 * This is the parent component for multiple timelines. On our timelines page, this
 * is th client boundary. The coordinator gets a timeline, books, and timelineBooks
 * as props (so those should already be loaded when theyre passed to timeline)
 *
 * Put  suspense boundary around this component as those items load
 */
import { FrontendTimelineBook } from "@/types/timeline"
import { TimelineContextProvider } from "../context-timeline"
import TimelineContainer from "./timeline-container"
import TimelinePageTitle from "./timeline-title"
import { SelectTimeline } from "@/db/schema/timeline"
import { useMemo } from "react"
import _ from "lodash"
import TimelineMinimap from "./timeline-minimap"
import { parse } from "date-fns"

export default function TimelineCoordinator({
  timelineBooks,
  timeline,
}: {
  timelineBooks: FrontendTimelineBook[]
  timeline: SelectTimeline
}) {
  // Extract all dated events to pass to minimap
  const eventCount = _.sum(
    _.flatten(timelineBooks.map((b) => b.insights.length)),
  )

  // Dates for all of our events
  const events = useMemo(() => {
    return _.filter(
      _.flattenDeep(timelineBooks.map((b) => b.insights.map((i) => i.date))),
      (d) => d !== null,
    ).map((d) => parse(d, "yyyy-MM-dd", new Date()))
  }, [eventCount])

  const minimapBooks = timelineBooks.map((b) => ({
    start: b.start,
    end: b.end,
    id: b.book_id,
  }))

  return (
    <TimelineContextProvider books={timelineBooks}>
      <TimelinePageTitle timeline={timeline} />
      {timelineBooks.map((book) => (
        <TimelineContainer book={book} key={book.book_id} />
      ))}
      <TimelineMinimap books={minimapBooks} events={events} />
    </TimelineContextProvider>
  )
}
