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
  onHoverViewport?: (hovered: boolean, viewportIndex: number) => void
}

const NUM_BUCKETS = 25 // Number of distinct bubbles to show
const SCALE_FACTOR = 1.8
const MONTH_THRESHOLD = 300
const BASE_Z_INDEX = 23

export default function EventDensityMap(properties: EventDensityMapProps) {
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

  const events = _.sortBy([...properties.events]).toReversed()
  const end = properties.end ?? events[0]
  const start = properties.start ?? events.at(-1)
  if (!start || !end) {
    throw new Error("Event Density Map Requires Start and End Date.")
  }
  const durationDays = differenceInDays(end, start)
  const bucketSize = durationDays / NUM_BUCKETS
  const showMonths = bucketSize < MONTH_THRESHOLD
  const divReference = useRef<HTMLDivElement>(null)

  // This is used to determine Z-index of viewports so that smallest is on top
  const viewportSizes = _.sortBy(
    properties.viewports?.map((v) => differenceInDays(v.end, v.start)),
  ).toReversed()

  // number[] of length NUM_BUCKETS where each elt is number of events in that bucket
  const bubbles = useMemo(() => {
    // for each event, we find first bucket the date is greater than
    const dateIndices = _.range(NUM_BUCKETS).map((index) =>
      add(start, { days: index * bucketSize }),
    )
    const result = _.fill(Array.from({ length: NUM_BUCKETS }), 0)
    _.each(events, (e) => {
      const index = _.findIndex(dateIndices, (d) => differenceInDays(d, e) >= 0)
      result[index] += 1
    })
    return result
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events.length, bucketSize, events.length, start])

  // Render one of our timeline bubbles, to scale
  const renderBubble = (eventCount: number, index: number) => {
    let scale = Math.min(50 + eventCount * SCALE_FACTOR * 5, 200)
    if (eventCount === 0) scale = 0
    const style = {
      transform: `scale(${scale}%)`,
    }
    const startDate = add(start, { days: index * bucketSize })
    const endDate = add(startDate, { days: bucketSize })
    const formatString = showMonths ? "MM yyyy" : "yyyy"
    return (
      <Tooltip
        key={index}
        content={
          <span>
            <b>{`${format(startDate, formatString)} - ${format(endDate, formatString)}:`}</b>
            {` ${eventCount} insights`}
          </span>
        }
      >
        <div className="event-bubble rounded-full" style={style} />
      </Tooltip>
    )
  }

  // Render one viewport overlay on top of density map (represents one book)
  const renderViewport = (viewport: DensityMapViewport, index: number) => {
    if (!divReference.current) return
    const days = differenceInDays(viewport.end, viewport.start)
    const leftPercent = Math.max(
      differenceInDays(viewport.start, start) / durationDays,
      0,
    )
    const widthPercent = days / durationDays
    const bg = BG_COLORS[viewport.color as keyof typeof BG_COLORS]
    const border = TAILWIND_BORDER_COLORS[viewport.color as TailwindColor]
    const zIndex = BASE_Z_INDEX + _.findIndex(viewportSizes, (s) => s === days)
    return (
      <div
        className={`${bg} ${border} timeline-viewport absolute border-2`}
        style={{
          left: `${leftPercent * 100}%`,
          width: `${widthPercent * 100}%`,
          zIndex,
        }}
        onMouseEnter={() => handleViewportHover(true, index)}
        onMouseLeave={() => handleViewportHover(false, index)}
      />
    )
  }

  const handleViewportHover = useCallback(
    (hovered: boolean, index: number) => {
      if (!properties.onHoverViewport || !properties.viewports) return
      properties.onHoverViewport(hovered, index)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [properties.viewports?.length],
  )

  // When someone clicks timeline, calculate date and pass up to parent
  const handleClick = (e: SyntheticEvent) => {
    if (!divReference.current) return
    const rect = divReference.current.getBoundingClientRect()
    const divLeft = rect.left
    const clickX = e.pageX as number
    const diff = Math.max(0, clickX - divLeft)
    const diffPercent = diff / (rect.right - rect.left)
    const days = Math.round(diffPercent * durationDays)
    if (!start) return
    const clickDate = add(start, { days })
    properties.onPress(clickDate)
  }

  return (
    <div
      className="event-density-map relative flex w-full items-center justify-center rounded-t-lg bg-white"
      role="presentation"
      onClick={handleClick}
    >
      <p className="px-4 font-serif font-bold">{start?.getFullYear()}</p>
      <div
        ref={divReference}
        className="bubble-container relative flex size-full grow items-center justify-between"
      >
        {bubbles.map((b, i) => renderBubble(b, i))}
        {properties.viewports?.map(renderViewport)}
      </div>

      <p className="px-4 font-serif font-bold">{end.getFullYear()}</p>
      <div className="line" />
    </div>
  )
}
