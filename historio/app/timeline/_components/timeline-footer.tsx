import { parseISO } from "date-fns"
import _ from "lodash"

import {
  TimelineDispatchActionType,
  useTimelineContext,
} from "../context-timeline"

import EventDensityMap from "@/components/event-density-map"
import { Button } from "@nextui-org/button"
import { Link } from "@nextui-org/link"
import TimelineDisplaySettings from "./drawer-timeline-display-settings"
import { FaArrowLeft } from "react-icons/fa6"

export type TimelineMinimapProps = {
  events: Date[]
  isDemo?: boolean
}

export default function TimelineFooter({
  events,
  isDemo = false,
}: TimelineMinimapProps) {
  const { timelineContext, updateTimelineContext } = useTimelineContext()

  // Pan all timelines that overlap this date to this date
  // TODO: Put method in context provider?
  const handlePress = (d: Date) => {
    if (!updateTimelineContext) return
    updateTimelineContext({
      type: TimelineDispatchActionType.updateScrollTo,
      payload: d,
    })
  }

  // Map each book with current start and end to viewport
  const viewports = timelineContext.books
    .filter((b) => b.currentStart && b.currentEnd)
    .map((b) => ({
      start: parseISO(b.currentStart),
      end: parseISO(b.currentEnd),
      color: b.currentColor,
    }))

  // Highlight book when its viewport on minimap is hovered
  const handleHover = (hovered: boolean, index: number) => {
    if (!updateTimelineContext) return
    const book = timelineContext.books[index]
    updateTimelineContext({
      type: TimelineDispatchActionType.updateBook,
      payload: { ...book, highlighted: hovered },
    })
  }

  const start = _.min(timelineContext.books.map((b) => b.start))
  const end = _.max(timelineContext.books.map((b) => b.end))

  return (
    <div className="timeline-footer bg-slate-950 px-2 fixed items-center flex justify-around">
      <Button
        as={Link}
        size="sm"
        variant="ghost"
        className="text-white hover:bg-white"
        href={isDemo ? "/library/demo-timelines" : "/library/timelines/"}
      >
        <FaArrowLeft />
        {isDemo ? "Demo Timelines" : "Timeline Library"}
      </Button>
      <div className="event-map-container">
        <EventDensityMap
          end={end}
          events={events}
          start={start}
          viewports={viewports}
          onHoverViewport={handleHover}
          onPress={handlePress}
          white
        />
      </div>
      <div>
        <TimelineDisplaySettings />
      </div>
    </div>
  )
}
