import { differenceInDays, parseISO } from "date-fns"

import { TimelineBarsMode, useTimelineContext } from "../context-timeline"

export type TimelineOverlapBarProps = {
  parentStartDate: Date
  parentEndDate: Date
  barBookID: string // ID of book in context we are rendering bar for
  onHover: (hovered: boolean) => void // So that we can highlight other books
}

export default function TimelineOverlapBar(props: TimelineOverlapBarProps) {
  const { parentStartDate, parentEndDate, barBookID } = props
  const { timelineContext } = useTimelineContext()
  const renderBook = timelineContext.books.find((b) => b.bookID === barBookID)
  if (
    !renderBook ||
    timelineContext.settings.barsMode === TimelineBarsMode.hidden
  )
    return

  const { currentStart, currentEnd } = renderBook

  // Dynamic = current view; moves as timeline pans
  const dynamic =
    timelineContext.settings.barsMode === TimelineBarsMode.currentView
  const startDate = dynamic ? parseISO(currentStart) : renderBook.start
  const endDate = dynamic ? parseISO(currentEnd) : renderBook.end

  const parentDurationDays = differenceInDays(parentEndDate, parentStartDate)
  const barDurationDays = differenceInDays(
    endDate < parentEndDate ? endDate : parentEndDate,
    startDate > parentStartDate ? startDate : parentStartDate,
  )

  let left = 0
  if (startDate > parentStartDate) {
    left =
      (100 * differenceInDays(startDate, parentStartDate)) / parentDurationDays
  }
  const width = (100 * barDurationDays) / parentDurationDays

  const tailwindTimelineColors = {
    red: "bg-red-500",
    amber: "bg-amber-500",
    lime: "bg-lime-500",
    sky: "bg-sky-500",
    fuchsia: "bg-fuchsia-500",
    pink: "bg-pink-500",
    rose: "bg-rose-500",
    teal: "bg-teal-500",
    emerald: "bg-emerald-500",
    indigo: "bg-indigo-500",
    yellow: "bg-yellow-500",
    violet: "bg-violet-500",
  }

  const style = { width: `${width}%`, left: `${left}%` }

  // @ts-expect-error current color will be key of timeline color
  const colorClass = `timelineBar ${tailwindTimelineColors[renderBook.currentColor]}`

  return (
    <div
      className={colorClass}
      style={style}
      onMouseEnter={() => props.onHover(true)}
      onMouseLeave={() => props.onHover(false)}
    />
  )
}
