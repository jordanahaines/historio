import { SelectInsight } from "@/db/schema/insight"
import { FrontendTimelineBook } from "@/types/timeline"
import "@/styles/timeline.scss"
import _ from "lodash"

export default function ActualTimeline({
  bookDetails,
}: {
  bookDetails: FrontendTimelineBook
}) {
  const renderInsight = (insight: SelectInsight, idx: number) => {
    const even = idx % 2 === 0
    const dte = insight.date ? new Date(insight.date) : null
    let dateDisplay = ""
    if (dte && dte.getMonth() == 0 && dte.getDate() == 1) {
      dateDisplay = dte.getFullYear().toString()
    } else if (dte) {
      dateDisplay = dte.toLocaleDateString()
    }
    if (insight.date)
      return (
        <div key={insight.id} className={`insight ${even ? "even" : "odd"}`}>
          {insight.date}:<br />
          {insight.name}
        </div>
      )
  }

  const orderedInsights = _.orderBy(bookDetails.insights, ["date"], ["asc"])
  return (
    <div className="actualTimeline timelineViewport">
      <div className="timelineInner">
        <div className="timelineBackground flex items-center">
          <div className="timelineLine bg-zinc-300"></div>
        </div>
        <div className="timelineContents px-2 flex items-center">
          <div className="bg-zinc-300 text-white px-3 py-1 mr-8 startDate">
            {bookDetails.start.toLocaleDateString()}
          </div>
          {orderedInsights.map(renderInsight)}
          <div className="bg-zinc-300 text-white px-3 py-1 ml-8 endDate">
            {bookDetails.end.toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  )
}
