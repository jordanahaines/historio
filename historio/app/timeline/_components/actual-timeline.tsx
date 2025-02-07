import { SelectInsight } from "@/db/schema/insight"

import "@/styles/timeline.scss"
import { add, differenceInDays, formatDate, parse } from "date-fns"
import _ from "lodash"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import {
  TimelineDispatchActionType,
  useTimelineContext,
} from "../context-timeline"

import TimelineOverlapBar from "./timeline-overlap-bar"

import { FrontendTimelineBook } from "@/types/timeline"

const INSIGHT_WIDTH = 120
const INSIGHTS_PER_BUCKET = {
  1: 2,
  2: 5,
  3: 7,
  4: 9,
}
type INSIGHTS_PER_BUCKET_KEY = keyof typeof INSIGHTS_PER_BUCKET

export default function ActualTimeline({
  bookDetails,
}: {
  bookDetails: FrontendTimelineBook
}) {
  const orderedInsights = useMemo(
    () => _.sortBy(_.toPairs(bookDetails.grouped_insights), (p) => p[0]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [bookDetails.book_id],
  )
  const { timelineContext, updateTimelineContext } = useTimelineContext()
  const bookContext = _.find(
    timelineContext.books,
    (b) => b.bookID === bookDetails.book_id,
  )

  const timelineReference = useRef<HTMLDivElement>(null)
  const numberInsights =
    INSIGHTS_PER_BUCKET[
      Math.floor(bookContext?.currentZoom || 1) as INSIGHTS_PER_BUCKET_KEY
    ] // TODO: Calculate based on zoom level
  const bucketWidth = numberInsights * INSIGHT_WIDTH
  const totalWidth = bucketWidth * orderedInsights.length

  // Whether or not there are duplicate years. If so, we have to put month on those years

  const orderedInsightYears = _.keys(bookDetails.grouped_insights).sort()
  const displayYears = useMemo(() => {
    const oiyDates = orderedInsightYears.map((y) =>
      parse(y, "yyyy-MM-dd", new Date()),
    )
    const counts = _.countBy(oiyDates, (index) => index.getFullYear())
    return _.map(oiyDates, (y, index) => {
      let display =
        counts[y.getFullYear()] > 1
          ? formatDate(y, "MMM yyyy")
          : formatDate(y, "yyyy")
      if (index === 0 && bookDetails.has_earlier_insight) {
        display = `${display} and prior`
      } else if (
        index === orderedInsights.length - 1 &&
        bookDetails.has_later_insight
      ) {
        display = `${display} and later`
      }
      return display
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(orderedInsightYears), bookDetails.book_id])

  // First date that is displayed
  const [yearDisplay, setYearDisplay] = useState(displayYears[0])

  const renderInsight = (insight: SelectInsight, _?: number) => {
    if (insight.date)
      return (
        <div key={insight.id} className="insight">
          <p className="font-title mb-2 border-b-2 border-blue-100 font-bold text-blue-400">
            {insight.year}
          </p>
          {insight.name}
        </div>
      )
  }

  const renderBucket = (bucket: SelectInsight[], date: string, _?: number) => {
    let insights = bucket
    if (insights.length > numberInsights) {
      insights = insights.slice(0, numberInsights)
    }
    const width = `${bucketWidth}px`
    const bucketYear = date.split("-")[0]

    const bucketYearDisplay = (
      <div className="insightBucketYear font-xl font-title absolute rounded bg-zinc-400 px-2 py-1 font-bold text-white">
        {bucketYear}
      </div>
    )

    return (
      <div className="insightBucket relative">
        <div
          className="insightsContainer flex h-[170] items-start justify-center pb-1 pt-2 even:bg-zinc-200"
          style={{ width }}
        >
          {insights.map((i) => renderInsight(i))}
        </div>
        {Number.parseInt(yearDisplay) < Number.parseInt(bucketYear)
          ? bucketYearDisplay
          : ""}
      </div>
    )
  }

  // On Scroll:
  // 1) Adjust the static year label
  // 2) Adjust current start/end in context
  const handleScroll = useCallback(() => {
    if (!updateTimelineContext || !bookContext) return
    if (!timelineReference.current) return
    const timelineDiv: HTMLDivElement =
      timelineReference.current as HTMLDivElement
    // Adjust years
    const left = timelineDiv.scrollLeft
    const right = left + timelineDiv.clientWidth
    const currentBucketIndex = timelineDiv ? Math.floor(left / bucketWidth) : 0
    setYearDisplay(displayYears[currentBucketIndex])

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
        bookID: bookDetails.book_id,
        currentStart: start.toISOString(),
        currentEnd: end.toISOString(),
      },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    timelineReference,
    yearDisplay,
    bookContext,
    // TODO: Should this actually be a useCallback? What if we add more properties to bookContext then need to account for them here
    // Should we just create a new updateContext method just to change start/end?
    bookContext?.currentColor,
    bookContext?.highlighted,
    bookContext?.currentZoom,
    bookDetails.end,
    bookDetails.start,
    bucketWidth,
  ])

  // Set initial current start/end so we don't get jitter when scrolling
  // Also do this on zoom so minimap updates
  useEffect(() => {
    handleScroll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookContext?.currentZoom])

  // React to scroll events from context
  useEffect(() => {
    const to = timelineContext.scrollTo
    if (!to || !timelineReference.current) return
    // We gotta scroll!
    let scrollPercent =
      (to.getTime() - bookDetails.start.getTime()) /
      (bookDetails.end.getTime() - bookDetails.start.getTime())
    scrollPercent = Math.max(0, Math.min(1, scrollPercent))
    const left = scrollPercent * timelineReference.current.scrollWidth

    timelineReference.current.scrollTo({
      left,
      behavior: "smooth",
    })
  }, [timelineContext.scrollTo, bookDetails.start, bookDetails.end])

  /** Update context to indicate a book has been highlighted */
  const handleHighlight = (id: string, highlighted: boolean) => {
    if (!updateTimelineContext) return
    updateTimelineContext({
      type: TimelineDispatchActionType.updateBook,
      payload: { bookID: id, highlighted },
    })
  }

  // Used to render overlap bars
  const otherBooks = timelineContext.books.filter(
    (b) => b.bookID !== bookDetails.book_id,
  )

  if (!bookContext || !updateTimelineContext) return
  return (
    <div className="timelineWrapper">
      <div className="currentYear insightBucketYear font-xl font-title absolute z-20 rounded bg-zinc-600 px-2 py-1 font-bold text-white">
        {yearDisplay}
      </div>
      <div
        ref={timelineReference}
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
          <div className="timelineContents flex items-center px-2">
            {orderedInsights.map((oi, index) =>
              renderBucket(oi[1], oi[0], index),
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
