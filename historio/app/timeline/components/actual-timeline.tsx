import { SelectInsight } from "@/db/schema/insight"
import "@/styles/timeline.scss"
import { FrontendTimelineBook } from "@/types/timeline"
import { format, setYear } from "date-fns"
import _ from "lodash"
import { useCallback, useRef, useState } from "react"

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
  const [yearDisplay, setYearDisplay] = useState(
    orderedInsights[0][0].split("-")[0],
  )

  const renderInsight = (insight: SelectInsight, idx: number) => {
    const even = idx % 2 === 0
    let dte = insight.date ? new Date(insight.date) : null
    let dateDisplay = ""
    if (dte && dte.getMonth() == 0 && dte.getDate() == 1) {
    } else if (dte) {
      dte = new Date(dte.valueOf() + dte.getTimezoneOffset() * 70 * 1000)
      dateDisplay = format(dte, "MMM do")
    }
    if (insight.date)
      return (
        <div key={insight.id} className={`insight ${even ? "even" : "odd"}`}>
          <p className="font-title font-bold text-blue-400 mb-2 border-b-2 border-blue-100">
            {dateDisplay}
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
