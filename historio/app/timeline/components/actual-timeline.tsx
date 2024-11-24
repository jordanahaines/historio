import { SelectInsight } from "@/db/schema/insight"
import "@/styles/timeline.scss"
import { FrontendTimelineBook } from "@/types/timeline"
import { format, formatDate, parse, setYear } from "date-fns"
import _ from "lodash"
import { useCallback, useMemo, useRef, useState } from "react"

const INSIGHT_WIDTH = 120

export default function ActualTimeline({
  bookDetails,
}: {
  bookDetails: FrontendTimelineBook
}) {
  const orderedInsights = _.toPairs(bookDetails.grouped_insights)
  const timelineRef = useRef(null)
  const numInsights = 5 // TODO: Calculate based on zoom level
  const bucketWidth = numInsights * INSIGHT_WIDTH

  // Whether or not there are duplicate years. If so, we have to put month on those years
  const orderedInsightYears = _.keys(bookDetails.grouped_insights)
  const displayYears = useMemo(() => {
    const oiyDates = orderedInsightYears.map((y) =>
      parse(y, "yyyy-MM-dd", new Date()),
    )
    const counts = _.countBy(oiyDates, (i) => i.getFullYear())
    return _.map(oiyDates, (y) => {
      if (counts[y.getFullYear()] > 1) return formatDate(y, "MMM yyyy")
      return formatDate(y, "yyyy")
    })
  }, [JSON.stringify(orderedInsightYears)])

  // First date that is displayed
  const [yearDisplay, setYearDisplay] = useState(displayYears[0])

  const renderInsight = (insight: SelectInsight, idx: number) => {
    if (insight.date)
      return (
        <div key={insight.id} className="insight">
          <p className="font-title font-bold text-blue-400 mb-2 border-b-2 border-blue-100">
            {displayYears[0]}
          </p>
          {insight.name}
        </div>
      )
  }

  const renderBucket = (bucket: SelectInsight[], date: string, idx: number) => {
    let insights = bucket
    if (insights.length > numInsights) {
      insights = _.sampleSize(insights, numInsights)
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
          className="insightsContainer flex justify-center items-start pt-2 pb-1 h-[170]"
          style={{ width }}
        >
          {insights.map(renderInsight)}
        </div>
        {parseInt(yearDisplay) < parseInt(bucketYear) ? bucketYearDisplay : ""}
      </div>
    )
  }
  // Event Handlers
  const updateScrollContext = useCallback((newScrollOffset: number) => {}, [])
  const handleScroll = useCallback(
    (e: any) => {
      if (timelineRef.current) {
        const currentBucketIdx = timelineRef.current
          ? Math.floor(timelineRef.current.scrollLeft / bucketWidth)
          : 0
        setYearDisplay(orderedInsights[currentBucketIdx][0].split("-")[0])
      }
    },
    [timelineRef, yearDisplay],
  )

  return (
    <div className="timelineWrapper">
      <div className="currentYear z-20 insightBucketYear bg-zinc-600 text-white font-bold font-xl font-title px-2 py-1 rounded absolute">
        {yearDisplay}
      </div>
      <div
        className="actualTimeline timelineViewport"
        onScroll={handleScroll}
        ref={timelineRef}
      >
        <div className="timelineInner">
          <div className="timelineBackground flex items-center">
            <div className="timelineLine bg-zinc-300"></div>
          </div>
          <div className="timelineContents px-2 flex items-center">
            {orderedInsights.map((oi, idx) => renderBucket(oi[1], oi[0], idx))}
          </div>
        </div>
      </div>
    </div>
  )
}
