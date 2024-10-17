/* eslint-disable no-console */
import { db } from "@/db"
import { books, SelectBook } from "@/db/schema/book"
import { InsertInsight, SelectInsight } from "@/db/schema/insight"
import { SignificantEventsReturn } from "@/types/researcher"
import { config } from "dotenv"
import { eq } from "drizzle-orm"
import _ from "lodash"
import {
  PromptGeneratorFunction,
  ResearcherConfiguration,
} from "./researchCoordinator"
import { parseDate } from "./utils"

config({ path: "local.env" })

export const SIGNIFICANT_EVENTS_RESEARCHER_KEY = "significant"

const generateSignificantEventsPrompt: PromptGeneratorFunction = (
  book: SelectBook,
  existingInsights?: SelectInsight[],
) => {
  let msg = `Title: ${book.title}\nAuthor: ${book.author}`
  if (existingInsights?.length) {
    msg += "\n\n Do not include these events in your results:"
    _.map(existingInsights, "name").forEach((e) => (msg += `\n- ${e}`))
  }
  return msg
}

const parseSignificantEvents = async (
  data: SignificantEventsReturn,
  book: SelectBook,
  existingInsights: SelectInsight[],
): Promise<InsertInsight[]> => {
  // FIrst we parse start/end year and update book
  // If we got a book start or book end, update null values only
  const parsedBookStart = parseDate(data.start_date).date
  const parsedBookEnd = parseDate(data.end_date).date
  const updateObject: { start_year?: string; end_year?: string } = {}
  if (parsedBookStart && !book.start_year)
    updateObject.start_year = parsedBookStart.getFullYear().toString()
  if (parsedBookEnd && !book.end_year)
    updateObject.end_year = parsedBookEnd.getFullYear().toString()
  if (Object.keys(updateObject).length > 0) {
    await db.update(books).set(updateObject).where(eq(books.id, book.id))
    console.debug(`Updated start/end date for ${book.title}: ${updateObject}`)
  }

  // Next we return filtered set of significant events that aren't already in DB
  const existingWikiLinks = _.map(existingInsights, "wikipedia_link")
  const filteredInsights = data.insights.filter(
    (i) => !existingWikiLinks.includes(i.wikipedia_link),
  )
  console.debug(
    `Filtered out ${data.insights.length - filteredInsights.length} existing insights`,
  )
  return _.map(filteredInsights, (i) => {
    const insight: InsertInsight = {
      name: i.name,
      description: i.description,
      book_id: book.id,
    }
    let eventDate = parseDate(i.date)
    insight.year = eventDate.year?.toString()
    insight.date = eventDate.date?.toISOString()

    return insight
  })
}

export const significantEventResearcherConfig: ResearcherConfiguration = {
  key: SIGNIFICANT_EVENTS_RESEARCHER_KEY,
  finishedThreshold: 3,
  assistantID: process.env.SIGNIFICANT_RESEARCHER_ASSISTANT_ID,
  promptGenerator: generateSignificantEventsPrompt,
  parseFunction: parseSignificantEvents,
}
export type ParseSignificantEvents = typeof parseSignificantEvents
export default significantEventResearcherConfig
