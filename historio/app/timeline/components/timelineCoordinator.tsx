"use client"
/**
 * This is the parent component for multiple timelines. On our timelines page, this
 * is th client boundary. The coordinator gets a timeline, books, and timelineBooks
 * as props (so those should already be loaded when theyre passed to timeline)
 *
 * Put  suspense boundary around this component as those items load
 */
import { SelectTimeline, SelectTimelineBook } from "@/db/schema/timeline"
import TimelineContext from "../timelineContext"
import React from "react"
import { SelectBook } from "@/db/schema/book"

export default function HistorioTimelineCoordinator({
  timeline,
  books,
  timelineBooks,
}: {
  timeline: SelectTimeline
  books: SelectBook[]
  timelineBooks: SelectTimelineBook[]
}) {
  return (
    <TimelineContext.Provider value={{ timeline, books: null, zoomPan: {} }}>
      {/* Timelines go here */}
    </TimelineContext.Provider>
  )
}
