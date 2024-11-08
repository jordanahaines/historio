"use client"

import { SelectBook } from "@/db/schema/book"
import { useState } from "react"

/**
 * A single timeline, in all of its glory.
 * Will load insighs async
 */

export type TimelineProps = {
  book: SelectBook
  onZoomPan?: (
    newStart: Date,
    newEnd: Date,
    startYear?: number,
    endYear?: number,
  ) => void
  defaultStart?: Date
  defaultEnd?: Date
}

export default function Timeline({
  book,
  onZoomPan,
  defaultEnd,
  defaultStart,
}: TimelineProps) {
  const [start, setStart] = useState(defaultStart)
  const [end, setEnd] = useState(defaultEnd)

  return (
    <div className="historio-timeline">
      <div className="rule"></div>
      <div className="years-container">
        <h4> </h4>
      </div>
    </div>
  )
}
