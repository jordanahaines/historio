import { FrontendTimelineBook, ZoomLevel } from "@/types/timeline"
import _ from "lodash"
import {
  createContext,
  Dispatch,
  ReactNode,
  useContext,
  useReducer,
} from "react"

export enum TimelineDispatchActionType {
  updateBook,
  updateSettings
}
export enum TimelineBarsMode {
  fullBook,
  currentView,
  hidden
}

export type TimelineContextBook = {
  bookID: string
  bookTitle: string
  currentColor: string
  currentStart: string
  currentEnd: string
  currentZoom: number // Literally a multiplier
  barsMode: TimelineBarsMode
}

export type TimelineContextSettings = {
  showMiniMap: boolean
}

export type TimelineDispatchAction =
  | { type: TimelineDispatchActionType.updateBook; payload: Partial<TimelineContextBook> & { bookID: string} }
  | { type: TimelineDispatchActionType.updateSettings; payload: Partial<TimelineContextSettings> }

// This is our actual context. An object of FrontendTimelineBooks, keyed on book ID for fast update
export type HistorioTimelineContext = {
  settings: TimelineContextSettings,
  books: TimelineContextBook[]
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
    case TimelineDispatchActionType.updateBook:
      const bookIdx = _.findIndex(state.books, b => b.bookID === update.payload.bookID)
      newState.books[bookIdx] = { ...newState.books[bookIdx], ...update.payload}
    case TimelineDispatchActionType.updateSettings:
      newState.settings = {...newState.settings, ...update.payload}
  }
  return newState
}

type TimelinexContextProviderProps = {
  books: FrontendTimelineBook[]
  children: ReactNode
}

export const TimelineContext = createContext<HistorioTimelineContext>({})
export const UpdateTimelineContext =
  createContext<Dispatch<TimelineDispatchAction> | null>(null)

export function TimelineContextProvider({
  books,
  children,
}: TimelinexContextProviderProps) {
  const initialContext: HistorioTimelineContext = {
    settings: { showMiniMap: true},
    books: books.map(b => ({
      bookID: b.book_id,
      bookTitle: b.title,
      currentColor: b.color,
      currentStart: b.default_start.toISOString(),
      currentEnd: b.default_end.toISOString(),
      currentZoom: 1,
      barsMode: TimelineBarsMode.fullBook
    }))
  }
  const [ctx, updateCtx] = useReducer(
    historioContextReducer,
    initialContext
  )

  return (
    <TimelineContext.Provider value={ctx}>
      <UpdateTimelineContext.Provider value={updateCtx}>
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
