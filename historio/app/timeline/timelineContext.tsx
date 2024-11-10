import { FrontendTimelineBook } from "@/types/timeline"
import _ from "lodash"
import {
  createContext,
  Dispatch,
  ReactNode,
  useContext,
  useReducer,
} from "react"

export enum timelineDispatchAction {
  ZoomPan,
  ChangeColor,
}
export type DispatchZoomPanPayload = {
  book_id: string
  start: Date
  end: Date
  locked: boolean
}
export type ChangeColorPayload = {
  book_id: string
  color: string
}

export type TimelineDispatchAction =
  | { type: timelineDispatchAction.ZoomPan; payload: DispatchZoomPanPayload }
  | { type: timelineDispatchAction.ChangeColor; payload: ChangeColorPayload }

// This is our actual context. An object of FrontendTimelineBooks, keyed on book ID for fast update
export type HistorioTimelineContext = {
  [key: string]: FrontendTimelineBook
}

/**
 * Update the start/end of all locked books if the new book is locked.
 * If it's not locked, then just update the update book
 */
const historioContextReducer = (
  state: HistorioTimelineContext,
  update: TimelineDispatchAction,
): HistorioTimelineContext => {
  const newState = { ...state }
  switch (update.type) {
    case timelineDispatchAction.ZoomPan:
      newState[update.payload.book_id] = {
        ...newState[update.payload.book_id],
        ...update.payload,
      }
      if (update.payload.locked) {
        // Need to update all locked books and this one
        _.mapValues(newState, (v) => {
          if (v.locked) {
            v.start = update.payload.start
            v.end = update.payload.end
          }
        })
      }
    case timelineDispatchAction.ChangeColor:
      newState[update.payload.book_id].color = (
        update.payload as ChangeColorPayload
      ).color
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
  const [ctx, updateCtx] = useReducer(
    historioContextReducer,
    _.keyBy(books, "book_id"),
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
