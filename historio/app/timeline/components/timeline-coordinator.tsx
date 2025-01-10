"use client"
/**
 * This is the parent component for multiple timelines. On our timelines page, this
 * is th client boundary. The coordinator gets a timeline, books, and timelineBooks
 * as props (so those should already be loaded when theyre passed to timeline)
 *
 * Put  suspense boundary around this component as those items load
 */
import { useMemo } from "react"
import _ from "lodash"
import { parse } from "date-fns"

import { TimelineContextProvider } from "../context-timeline"

import TimelineContainer from "./timeline-container"
import TimelinePageTitle from "./timeline-title"
import TimelineMinimap from "./timeline-minimap"

import { SelectTimeline } from "@/db/schema/timeline"
import { FrontendTimelineBook } from "@/types/timeline"

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
    const allInsightDates = _.flattenDeep(
      timelineBooks.map((b) => b.insights.map((i) => i.date)),
    )
    const insightDates = _.filter(allInsightDates, (d) => d !== null)
    return _.map(insightDates, (d) => parse(d, "yyyy-MM-dd", new Date()))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventCount, timelineBooks.length])

  return (
    <TimelineContextProvider books={timelineBooks}>
      <div className="timeline-outer-container">
        <TimelinePageTitle timeline={timeline} />
        {timelineBooks.map((book) => (
          <TimelineContainer key={book.book_id} book={book} />
        ))}
        <TimelineMinimap events={events} />
      </div>
    </TimelineContextProvider>
  )
}
