import { SelectInsight } from "@/db/schema/insight"

import "@/styles/timeline.scss"
import { add, differenceInDays, formatDate, parse } from "date-fns"
import _ from "lodash"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import {
  TimelineDispatchActionType,
  useTimelineContext,
} from "../context-timeline"

import TimelineOverlapBar from "./timeline-overlap-bars"

import { FrontendTimelineBook } from "@/types/timeline"

const INSIGHT_WIDTH = 120
const INSIGHTS_PER_BUCKET = {
  1: 2,
  2: 5,
  3: 7,
  4: 9,
}

export default function ActualTimeline({
  bookDetails,
}: {
  bookDetails: FrontendTimelineBook
}) {
  const orderedInsights = useMemo(
    () => _.sortBy(_.toPairs(bookDetails.grouped_insights), (p) => p[0]),
    [bookDetails.book_id],
  )
  const { timelineContext, updateTimelineContext } = useTimelineContext()
  const bookContext = _.find(
    timelineContext.books,
    (b) => b.bookID === bookDetails.book_id,
  )

  if (!bookContext || !updateTimelineContext) return

  const timelineRef = useRef<HTMLDivElement>(null)
  // @ts-ignore
  const numInsights = INSIGHTS_PER_BUCKET[Math.floor(bookContext.currentZoom)] // TODO: Calculate based on zoom level
  const bucketWidth = numInsights * INSIGHT_WIDTH
  const totalWidth = bucketWidth * orderedInsights.length

  // Whether or not there are duplicate years. If so, we have to put month on those years

  const orderedInsightYears = _.keys(bookDetails.grouped_insights).sort()
  const displayYears = useMemo(() => {
    const oiyDates = orderedInsightYears.map((y) =>
      parse(y, "yyyy-MM-dd", new Date()),
    )
    const counts = _.countBy(oiyDates, (i) => i.getFullYear())
    return _.map(oiyDates, (y, idx) => {
      let display =
        counts[y.getFullYear()] > 1
          ? formatDate(y, "MMM yyyy")
          : formatDate(y, "yyyy")
      if (idx === 0 && bookDetails.has_earlier_insight) {
        display = `${display} and prior`
      } else if (
        idx === orderedInsights.length - 1 &&
        bookDetails.has_later_insight
      ) {
        display = `${display} and later`
      }
      return display
    })
  }, [JSON.stringify(orderedInsightYears)])

  // First date that is displayed
  const [yearDisplay, setYearDisplay] = useState(displayYears[0])

  const renderInsight = (insight: SelectInsight, idx: number) => {
    if (insight.date)
      return (
        <div key={insight.id} className="insight">
          <p className="font-title font-bold text-blue-400 mb-2 border-b-2 border-blue-100">
            {insight.year}
          </p>
          {insight.name}
        </div>
      )
  }

  const renderBucket = (bucket: SelectInsight[], date: string, idx: number) => {
    let insights = bucket
    if (insights.length > numInsights) {
      insights = insights.slice(0, numInsights)
    }
    const width = `${bucketWidth}px`
    const bucketYear = date.split("-")[0]

    const bucketYearDisplay = (
      <div className="insightBucketYear bg-zinc-400 text-white font-bold font-xl font-title px-2 py-1 rounded absolute">
        {bucketYear}
      </div>
    )

    return (
      <div className="insightBucket relative">
        <div
          className="insightsContainer flex justify-center items-start pt-2 pb-1 h-[170] even:bg-zinc-200"
          style={{ width }}
        >
          {insights.map(renderInsight)}
        </div>
        {parseInt(yearDisplay) < parseInt(bucketYear) ? bucketYearDisplay : ""}
      </div>
    )
  }

  // On Scroll:
  // 1) Adjust the static year label
  // 2) Adjust current start/end in context
  const handleScroll = useCallback(
    (_: any) => {
      if (!timelineRef.current) return
      const timelineDiv: HTMLDivElement = timelineRef.current as HTMLDivElement
      // Adjust years
      const left = timelineDiv.scrollLeft
      const right = left + timelineDiv.clientWidth
      const currentBucketIdx = timelineDiv ? Math.floor(left / bucketWidth) : 0
      setYearDisplay(displayYears[currentBucketIdx])

      const leftPct = left / timelineDiv.scrollWidth
      const rightPct = right / timelineDiv.scrollWidth
      const start = add(bookDetails.start, {
        days: leftPct * differenceInDays(bookDetails.end, bookDetails.start),
      })
      const end = add(bookDetails.start, {
        days: rightPct * differenceInDays(bookDetails.end, bookDetails.start),
      })
      updateTimelineContext({
        type: TimelineDispatchActionType.updateBook,
        payload: {
          ...bookContext,
          currentStart: start.toISOString(),
          currentEnd: end.toISOString(),
        },
      })
    },
    [timelineRef, yearDisplay, bookContext],
  )

  // Set initial current start/end so we don't get jitter when scrolling
  // Also do this on zoom so minimap updates
  useEffect(() => {
    handleScroll()
  }, [bookContext.currentZoom])

  // React to scroll events from context
  useEffect(() => {
    const to = timelineContext.scrollTo
    if (!to || !timelineRef.current) return
    // We gotta scroll!
    let scrollPercent =
      (to.getTime() - bookDetails.start.getTime()) /
      (bookDetails.end.getTime() - bookDetails.start.getTime())
    scrollPercent = Math.max(0, Math.min(1, scrollPercent))
    const left = scrollPercent * timelineRef.current.scrollWidth

    timelineRef.current.scrollTo({
      left,
      behavior: "smooth",
    })
  }, [timelineContext.scrollTo])

  /** Update context to indicate a book has been highlighted */
  const handleHighlight = useCallback(
    (id: string, highlighted: boolean) => {
      updateTimelineContext({
        type: TimelineDispatchActionType.updateBook,
        payload: { bookID: id, highlighted },
      })
    },
    [updateTimelineContext],
  )

  // Used to render overlap bars
  const otherBooks = timelineContext.books.filter(
    (b) => b.bookID !== bookDetails.book_id,
  )

  return (
    <div className="timelineWrapper">
      <div className="currentYear z-20 insightBucketYear bg-zinc-600 text-white font-bold font-xl font-title px-2 py-1 rounded absolute">
        {yearDisplay}
      </div>
      <div
        ref={timelineRef}
        className="actualTimeline timelineViewport"
        onScroll={handleScroll}
      >
        <div className="timelineInner">
          <div className="timelineBars" style={{ width: totalWidth }}>
            {otherBooks.map((b) => (
              <TimelineOverlapBar
                key={b.bookID}
                barBookID={b.bookID}
                parentEndDate={bookDetails.end}
                parentStartDate={bookDetails.start}
                onHover={(h) => handleHighlight(b.bookID, h)}
              />
            ))}
          </div>
          <div className="timelineContents px-2 flex items-center">
            {orderedInsights.map((oi, idx) => renderBucket(oi[1], oi[0], idx))}
          </div>
        </div>
      </div>
    </div>
  )
}
