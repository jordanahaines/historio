import React, { useMemo } from "react"
import { differenceInDays, add, format } from "date-fns"
import _ from "lodash"

export type EventDensityMapProps = {
  start?: Date // timestamp
  end?: Date // timestamp
  events: Date[] // timestamps
  viewports?: { start: Date; end: Date; color: string }[]
  onPress: (ts: Date) => void
}

const NUM_BUCKETS = 25 // Number of distinct bubbles to show
const MAX_SIZE = 10

export default function EventDensityMap(props: EventDensityMapProps) {
  const events = [...props.events].sort()
  if (events.length === 0) return // TODO: Better handling of this case
  const start = props.start ?? events[0]
  const end = props.end ?? events[events.length - 1]

  // number[] of length NUM_BUCKETS where each elt is number of events in that bucket
  const bubbles = useMemo(() => {
    const durationDays = differenceInDays(end, start)
    const bucketSize = durationDays / NUM_BUCKETS

    // for each event, we find first bucket the date is greater than
    const dateIndices = _.range(NUM_BUCKETS).map((i) =>
      add(start, { days: i * bucketSize }),
    )
    const result = _.fill(Array(NUM_BUCKETS), 0)
    _.each(events, (e) => {
      const idx = _.findIndex(dateIndices, (d) => differenceInDays(e, d) >= 0)
      result[idx] = Math.min(result[idx] + 1, MAX_SIZE)
    })
    return result
  }, [JSON.stringify(events)])

  const renderBubble = (eventCount: number) => (
    <div className={`bg-white rounded-full w-[${eventCount}px]`}></div>
  )

  return (
    <div className="event-density-map bg-slate-900 w-full h-8 flex justify-between">
      {bubbles.map(renderBubble)}
    </div>
  )
}
