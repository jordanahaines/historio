import React, { SyntheticEvent, useMemo, useRef } from "react"
import { differenceInDays, add, format } from "date-fns"
import _ from "lodash"
import { Tooltip } from "@nextui-org/tooltip"

export type EventDensityMapProps = {
  start?: Date // timestamp
  end?: Date // timestamp
  events: Date[] // timestamps
  showLine?: boolean
  viewports?: { start: Date; end: Date; color: string }[]
  onPress: (ts: Date) => void
}

const NUM_BUCKETS = 25 // Number of distinct bubbles to show
const MAX_SIZE = 10
const SCALE_FACTOR = 1.8
const MONTH_THRESHOLD = 300

export default function EventDensityMap(props: EventDensityMapProps) {
  const events = [...props.events].sort()
  if (events.length === 0) return "No Events" // TODO: Better handling of this case
  const end = props.end ?? events[0]
  const start = props.start ?? events[events.length - 1]
  const durationDays = differenceInDays(end, start)
  const bucketSize = durationDays / NUM_BUCKETS
  const showMonths = bucketSize < MONTH_THRESHOLD

  const divRef = useRef<HTMLDivElement>(null)

  // number[] of length NUM_BUCKETS where each elt is number of events in that bucket
  const bubbles = useMemo(() => {
    // for each event, we find first bucket the date is greater than
    const dateIndices = _.range(NUM_BUCKETS).map((i) =>
      add(start, { days: i * bucketSize }),
    )
    const result = _.fill(Array(NUM_BUCKETS), 0)
    _.each(events, (e) => {
      const idx = _.findIndex(dateIndices, (d) => differenceInDays(d, e) >= 0)
      result[idx] += 1
    })
    return result
  }, [JSON.stringify(events)])

  // Render one of our timeline bubbles, to scale
  const renderBubble = (eventCount: number, idx: number) => {
    let scale = Math.min(50 + eventCount * SCALE_FACTOR * 5, 200)
    if (eventCount === 0) scale = 0
    const style = {
      transform: `scale(${scale}%)`,
    }
    const startDate = add(start, { days: idx * bucketSize })
    const endDate = add(startDate, { days: bucketSize })
    const formatStr = showMonths ? "MM yyyy" : "yyyy"
    return (
      <Tooltip
        key={idx}
        content={
          <span>
            <b>{`${format(startDate, formatStr)} - ${format(endDate, formatStr)}:`}</b>
            {` ${eventCount} insights`}
          </span>
        }
      >
        <div className="event-bubble rounded-full" style={style}></div>
      </Tooltip>
    )
  }

  // When someone clicks timeline, calculate date and pass up to parent
  const handleClick = (e: SyntheticEvent) => {
    if (!divRef.current) return
    const rect = divRef.current.getBoundingClientRect()
    const divLeft = rect.left
    const clickX = e.pageX as number
    const diff = Math.max(0, clickX - divLeft)
    const diffPercent = diff / (rect.right - rect.left)
    const days = Math.round(diffPercent * durationDays)
    const clickDate = add(start, { days })
    props.onPress(clickDate)
    console.log({ clickDate })
  }

  return (
    <div
      onClick={handleClick}
      className="relative bg-white event-density-map rounded-t-lg w-full flex justify-center items-center"
    >
      <p className="px-4 font-bold font-serif">{start.getFullYear()}</p>
      <div
        ref={divRef}
        className="bubble-container grow flex justify-between items-center h-full w-full"
      >
        {bubbles.map(renderBubble)}
      </div>

      <p className="px-4 font-bold font-serif">{end.getFullYear()}</p>
      <div className="line"></div>
    </div>
  )
}
