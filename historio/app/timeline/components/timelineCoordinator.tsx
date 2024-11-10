"use client"
/**
 * This is the parent component for multiple timelines. On our timelines page, this
 * is th client boundary. The coordinator gets a timeline, books, and timelineBooks
 * as props (so those should already be loaded when theyre passed to timeline)
 *
 * Put  suspense boundary around this component as those items load
 */
import { SelectTimeline, SelectTimelineBook } from "@/db/schema/timeline"
import { TimelineContextProvider } from "../timelineContext"
import { FrontendTimelineBook } from "@/types/timeline"
import TimelineContainer from "./timelineContainer"

export default function HistorioTimelineCoordinator({
  timeline,
  timelineBooks,
}: {
  timeline: SelectTimeline
  timelineBooks: FrontendTimelineBook[]
}) {
  return (
    <TimelineContextProvider books={timelineBooks}>
      {timelineBooks.map((book) => (
        <TimelineContainer bookID={book.book_id} key={book.book_id} />
      ))}
    </TimelineContextProvider>
  )
}
