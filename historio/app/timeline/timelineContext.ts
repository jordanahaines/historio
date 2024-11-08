import { SelectBook } from "@/db/schema/book"
import { SelectTimeline } from "@/db/schema/timeline"
import { createContext } from "react"

export type TimelineContextType = {
  timeline: SelectTimeline | null
  books: SelectBook[] | null

  // Key is book ID
  zoomPan: {
    [key: string]: { start: number; end: number; locked: boolean }
  }
}

const TimelineContext = createContext<TimelineContextType>({
  timeline: null,
  books: null,
  zoomPan: {},
})
export default TimelineContext
