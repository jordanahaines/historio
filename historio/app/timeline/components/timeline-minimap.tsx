import EventDensityMap from "@/components/event-density-map"
import {
  TimelineDispatchActionType,
  useTimelineContext,
} from "../context-timeline"

export type TimelineMinimapProps = {
  events: Date[]
  books: { start: Date; end: Date; id: string }[]
}

export default function TimelineMinimap({
  events,
  books,
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

  return (
    <div className="hover:scale-110 hover:bottom-1 transition-transform border-4 border-zinc-300 timeline-minimap fixed bottom-0 left-4 rounded-t-lg p">
      <EventDensityMap events={events} onPress={handlePress}></EventDensityMap>
    </div>
  )
}
