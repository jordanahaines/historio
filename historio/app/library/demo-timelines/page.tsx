"use server"

import { fetchDemoTimelines } from "@/db/queries/timelines"
import "@/styles/library.scss" // TODO Move to layout?
import TimelineListTable from "../_components/timeline-list-table"

export default async function Page() {
  const timelineSummaries = await fetchDemoTimelines()
  return (
    <div className="demoTimelinesPage">
      <div className="mast">
        <h1 className="w-full font-serif text-6xl">
          Library <span className="opacity-40">\\</span>
          &nbsp;Demo Timelines
        </h1>
      </div>
      <hr className="my-4" />
      <div className="timelineLibraryContainer">
        <TimelineListTable timelines={timelineSummaries} />
      </div>
    </div>
  )
}
