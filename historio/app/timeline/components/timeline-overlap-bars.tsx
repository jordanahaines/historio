import { differenceInDays, parseISO } from "date-fns"
import { useTimelineContext } from "../context-timeline"
import { Tooltip } from "@nextui-org/tooltip"

export type TimelineOverlapBarProps = {
  parentStartDate: Date
  parentEndDate: Date
  barBookID: string // ID of book in context we are rendering bar for
}

export default function TimelineOverlapBar(props: TimelineOverlapBarProps) {
  const { parentStartDate, parentEndDate, barBookID } = props
  const { timelineContext } = useTimelineContext()
  const renderBook = timelineContext.books.find((b) => b.bookID === barBookID)
  if (!renderBook) return

  const { currentStart, currentEnd } = renderBook
  const startDate = parseISO(currentStart)
  const endDate = parseISO(currentEnd)

  const parentDurationDays = differenceInDays(parentEndDate, parentStartDate)
  const barDurationDays = differenceInDays(
    endDate < parentEndDate ? endDate : parentEndDate,
    startDate > parentStartDate ? startDate : parentStartDate,
  )

  let left = 0,
    width = 100
  if (startDate > parentStartDate) {
    left =
      (100 * differenceInDays(startDate, parentStartDate)) / parentDurationDays
  }
  width = (100 * barDurationDays) / parentDurationDays

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
  let tooltip = `${renderBook.bookTitle} (${parseISO(renderBook.currentStart).getFullYear()} - ${parseISO(renderBook.currentEnd).getFullYear()})`

  return (
    <Tooltip content={tooltip}>
      <div
        className={`timelineBar ${tailwindTimelineColors[renderBook.currentColor]}`}
        style={style}
      ></div>
    </Tooltip>
  )
}
