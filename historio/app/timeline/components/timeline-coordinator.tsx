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

export default function TimelineCoordinator({
  timelineBooks,
}: {
  timelineBooks: FrontendTimelineBook[]
}) {
  return (
    <TimelineContextProvider books={timelineBooks}>
      {timelineBooks.map((book) => (
        <TimelineContainer book={book} key={book.book_id} />
      ))}
    </TimelineContextProvider>
  )
}
