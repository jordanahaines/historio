import { config } from "dotenv"

import { ResearcherConfiguration } from "./research-coordinator"
import { generateGenericPrompt, isDuplicateEvent, parseDate } from "./utils"

import { SelectBook } from "@/db/schema/book"
import { InsertInsight, SelectInsight } from "@/db/schema/insight"
import { MinorEventsReturn } from "@/types/researcher"

config({ path: "local.env" })

const OPENAI_ASSISTANT_ID = process.env.MINOR_RESEARCHER_ASSISTANT_ID
export const MINOR_EVENTS_RESEARCHER_KEY = "minor"
const FINISHED_THRESHOLD = 5 // If we end up with this many events or less, we mark researcher done

export const parseMinorEvents = async (
  data: MinorEventsReturn,
  book: SelectBook,
  existingInsights: SelectInsight[],
): Promise<InsertInsight[]> => {
  // The only filtering we do is to remove events with the same name and date
  // also events must havea  date
  const filteredEvents = data.insights.filter((e) => {
    return !isDuplicateEvent(
      e.name,
      existingInsights,
      parseDate(e.date).date || undefined,
    )
  })

  console.debug(
    `Filtered out ${data.insights.length - filteredEvents.length} existing insights`,
  )
  return filteredEvents.map((e) => {
    const insight: InsertInsight = {
      name: e.name,
      description: e.description,
      book_id: book.id,
    }
    const eventDate = parseDate(e.date)
    insight.year = eventDate.year?.toString()
    insight.date = eventDate.date?.toISOString()

    return insight
  })
}

export const minorEventResearcherConfig: ResearcherConfiguration = {
  key: MINOR_EVENTS_RESEARCHER_KEY,
  finishedThreshold: FINISHED_THRESHOLD,
  assistantID: OPENAI_ASSISTANT_ID,
  promptGenerator: generateGenericPrompt,
  parseFunction: parseMinorEvents,
}

export type ParseMinorEvents = typeof parseMinorEvents
export default minorEventResearcherConfig
