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

export default function TimelineCoordinator({
  timelineBooks,
  timeline,
}: {
  timelineBooks: FrontendTimelineBook[]
  timeline: SelectTimeline
}) {
  return (
    <TimelineContextProvider books={timelineBooks}>
      <TimelinePageTitle timeline={timeline} />
      {timelineBooks.map((book) => (
        <TimelineContainer book={book} key={book.book_id} />
      ))}
    </TimelineContextProvider>
  )
}
