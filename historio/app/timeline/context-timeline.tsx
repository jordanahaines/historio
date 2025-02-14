import _ from "lodash"
import {
  createContext,
  Dispatch,
  ReactNode,
  useContext,
  useReducer,
} from "react"

import { FrontendTimelineBook } from "@/types/timeline"

const DEFAULT_ZOOM = 2

export enum TimelineDispatchActionType {
  updateBook = "update",
  updateSettings = "settings",
  updateScrollTo = "scroll",
}
export enum TimelineBarsMode {
  fullBook = "full",
  currentView = "current",
}

export type TimelineContextBook = {
  bookID: string
  bookTitle: string
  currentColor: string
  start: Date
  end: Date
  currentStart: string
  currentEnd: string
  currentZoom: number // Literally a multiplier
  highlighted: boolean
}

export type TimelineContextSettings = {
  showMiniMap: boolean
  showOverlapBars: boolean
  showOverlapDots: boolean
  barsMode: TimelineBarsMode
  barSize: "sm" | "lg"
}

export type TimelineDispatchAction =
  | {
      type: TimelineDispatchActionType.updateBook
      payload: Partial<TimelineContextBook> & { bookID: string }
    }
  | {
      type: TimelineDispatchActionType.updateSettings
      payload: Partial<TimelineContextSettings>
    }
  | {
      type: TimelineDispatchActionType.updateScrollTo
      payload: Date | null
    }

// This is our actual context. An object of FrontendTimelineBooks, keyed on book ID for fast update
export type HistorioTimelineContext = {
  settings: TimelineContextSettings
  books: TimelineContextBook[]
  scrollTo?: Date
}

/**
 * Pretty simple reducer to update object
 */
const historioContextReducer = (
  state: HistorioTimelineContext,
  update: TimelineDispatchAction,
): HistorioTimelineContext => {
  const newState = { ...state }

  switch (update.type) {
    case TimelineDispatchActionType.updateBook: {
      const bookIndex = _.findIndex(
        state.books,
        (b) => b.bookID === update.payload.bookID,
      )
      newState.books[bookIndex] = {
        ...newState.books[bookIndex],
        ...update.payload,
      }
      if (update.payload.highlighted) {
        _.each(newState.books, (b, i) => {
          if (i !== bookIndex) {
            newState.books[i].highlighted = false
          }
        })
      }
      console.log("Has Highlighted?", _.some(newState.books, "highlighted"))
      break
    }
    case TimelineDispatchActionType.updateSettings: {
      newState.settings = { ...newState.settings, ...update.payload }
      break
    }
    case TimelineDispatchActionType.updateScrollTo: {
      newState.scrollTo = update.payload as Date | undefined
      break
    }
  }
  return newState
}

type TimelinexContextProviderProperties = {
  books: FrontendTimelineBook[]
  children: ReactNode
}

const baseContext: HistorioTimelineContext = {
  settings: {
    showMiniMap: true,
    barsMode: TimelineBarsMode.fullBook,
    showOverlapBars: true,
    showOverlapDots: true,
    barSize: "sm",
  },
  scrollTo: undefined,
  books: [],
}
export const TimelineContext =
  createContext<HistorioTimelineContext>(baseContext)
export const UpdateTimelineContext = createContext<
  Dispatch<TimelineDispatchAction> | undefined
>(undefined)

export function TimelineContextProvider({
  books,
  children,
}: TimelinexContextProviderProperties) {
  const initialContext: HistorioTimelineContext = {
    settings: {
      showMiniMap: true,
      barsMode: TimelineBarsMode.fullBook,
      showOverlapBars: true,
      showOverlapDots: true,
      barSize: "sm",
    },
    scrollTo: undefined,
    books: books.map((b) => ({
      bookID: b.book_id,
      bookTitle: b.title,
      currentColor: b.color,
      start: b.start,
      end: b.end,
      currentStart: b.default_start.toISOString(),
      currentEnd: b.default_end.toISOString(),
      currentZoom: DEFAULT_ZOOM,
      barsMode: TimelineBarsMode.fullBook,
      highlighted: false,
    })),
  }
  const [context, updateContext] = useReducer(
    historioContextReducer,
    initialContext,
  )

  return (
    <TimelineContext.Provider value={context}>
      <UpdateTimelineContext.Provider value={updateContext}>
        {children}
      </UpdateTimelineContext.Provider>
    </TimelineContext.Provider>
  )
}

export function useTimelineContext() {
  return {
    timelineContext: useContext(TimelineContext),
    updateTimelineContext: useContext(UpdateTimelineContext),
  }
}
