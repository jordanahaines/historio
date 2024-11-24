import { SelectInsight } from "@/db/schema/insight"

/**
 * These zooms are multipliers. 4x means literally 4x the time per pixel
 * in horizontal timeline
 */
export enum ZoomLevel {
  One = 1,
  Two = 2,
  Three = 3,
  Four = 4, // Most zoomed in
}

// Keyed on a date string
export type GroupedInsights = {
  string: SelectInsight[]
}

// Data we need to render book in timeline on frontend
// This is what we use in a reducer in context
export type FrontendTimelineBook = {
  timeline_book_id: string
  book_id: string
  title: string
  author: string
  color: string
  order: number
  default_start: Date
  default_end: Date
  start: Date
  end: Date
  zoom: ZoomLevel
  locked: boolean
  grouped_insights: GroupedInsights
  has_earlier_insight?: boolean
  has_later_insight?: boolean
  // Deprecated
  insights: SelectInsight[]
}
