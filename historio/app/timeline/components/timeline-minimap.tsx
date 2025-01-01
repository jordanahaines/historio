import EventDensityMap from "@/components/event-density-map"
import {
  TimelineDispatchActionType,
  useTimelineContext,
} from "../context-timeline"
import { parseISO } from "date-fns"

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

  // Each book gets its own viewport for start and end
  const viewports = timelineContext.books.map((b) => ({
    start: b.currentStart ? parseISO(b.currentStart) : b.start,
    end: b.currentEnd ? parseISO(b.currentEnd) : b.end,
    color: b.currentColor,
  }))

  const handleHover = (hovered: boolean, idx: number) => {
    if (!updateTimelineContext) return
    const book = timelineContext.books[idx]
    updateTimelineContext({
      type: TimelineDispatchActionType.updateBook,
      payload: { ...book, highlighted: hovered },
    })
  }

  return (
    <div className="hover:scale-110 hover:bottom-1 transition-transform border-4 border-zinc-300 timeline-minimap fixed bottom-0 left-4 rounded-t-lg p">
      <EventDensityMap
        viewports={viewports}
        events={events}
        onPress={handlePress}
        onHoverViewport={handleHover}
      ></EventDensityMap>
    </div>
  )
}
