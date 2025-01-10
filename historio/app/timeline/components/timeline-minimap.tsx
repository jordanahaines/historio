import { parseISO } from "date-fns"
import _ from "lodash"

import {
  TimelineDispatchActionType,
  useTimelineContext,
} from "../context-timeline"

import EventDensityMap from "@/components/event-density-map"

export type TimelineMinimapProps = {
  events: Date[]
}

export default function TimelineMinimap({ events }: TimelineMinimapProps) {
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
    <div className="hover:scale-110 hover:bottom-1 transition-transform border-4 border-zinc-300 timeline-minimap fixed bottom-0 left-4 rounded-t-lg p">
      <EventDensityMap
        end={end}
        events={events}
        start={start}
        viewports={viewports}
        onHoverViewport={handleHover}
        onPress={handlePress}
      />
    </div>
  )
}
