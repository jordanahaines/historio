import React, { SyntheticEvent, useCallback, useMemo, useRef } from "react"
import { differenceInDays, add, format } from "date-fns"
import _ from "lodash"
import { Tooltip } from "@nextui-org/tooltip"
import { TAILWIND_BORDER_COLORS, TailwindColor } from "@/types/colors"

export type DensityMapViewport = {
  start: Date
  end: Date
  color: string
}
export type EventDensityMapProps = {
  start?: Date // timestamp
  end?: Date // timestamp
  events: Date[] // timestamps
  showLine?: boolean
  viewports?: DensityMapViewport[]
  onPress: (ts: Date) => void
  onHoverViewport?: (hovered: boolean, viewportIdx: number) => void
}

const NUM_BUCKETS = 25 // Number of distinct bubbles to show
const MAX_SIZE = 10
const SCALE_FACTOR = 1.8
const MONTH_THRESHOLD = 300

export default function EventDensityMap(props: EventDensityMapProps) {
  const BG_COLORS = {
    red: "bg-red-500/30",
    amber: "bg-amber-500/30",
    lime: "bg-lime-500/30",
    sky: "bg-sky-500/30",
    fuchsia: "bg-fuchsia-500/30",
    pink: "bg-pink-500/30",
    rose: "bg-rose-500/30",
    teal: "bg-teal-500/30",
    emerald: "bg-emerald-500/30",
    indigo: "bg-indigo-500/30",
    yellow: "bg-yellow-500/30",
    violet: "bg-violet-500/30",
  }

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

  const renderViewport = (viewport: DensityMapViewport, idx: number) => {
    if (!divRef.current) return
    const leftPercent = Math.max(
      differenceInDays(viewport.start, start) / durationDays,
      0,
    )
    let widthPercent = 0
    if (viewport.end > start) {
      widthPercent = Math.min(
        differenceInDays(viewport.end, start) / durationDays,
        100 - leftPercent,
      )
    }
    const bg = BG_COLORS[viewport.color as keyof typeof BG_COLORS]
    const border = TAILWIND_BORDER_COLORS[viewport.color as TailwindColor]
    return (
      <div
        onMouseEnter={() => handleViewportHover(true, idx)}
        onMouseLeave={() => handleViewportHover(false, idx)}
        className={`${bg} ${border} border-2 timeline-viewport absolute`}
        style={{ left: `${leftPercent * 100}%`, width: `${widthPercent}%` }}
      ></div>
    )
  }

  const handleViewportHover = useCallback(
    (hovered: boolean, idx: number) => {
      if (!props.onHoverViewport) return
      props.onHoverViewport(hovered, idx)
    },
    [props.viewports?.length],
  )

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
  }

  return (
    <div
      onClick={handleClick}
      className="relative bg-white event-density-map rounded-t-lg w-full flex justify-center items-center"
    >
      <p className="px-4 font-bold font-serif">{start.getFullYear()}</p>
      <div
        ref={divRef}
        className="bubble-container relative grow flex justify-between items-center h-full w-full"
      >
        {bubbles.map(renderBubble)}
        {props.viewports?.map(renderViewport)}
      </div>

      <p className="px-4 font-bold font-serif">{end.getFullYear()}</p>
      <div className="line"></div>
    </div>
  )
}
