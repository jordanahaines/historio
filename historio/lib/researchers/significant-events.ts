/* eslint-disable no-console */
import { db } from "@/db"
import { books, SelectBook } from "@/db/schema/book"
import { InsertInsight, SelectInsight } from "@/db/schema/insight"
import { SignificantEventsReturn } from "@/types/researcher"
import { config } from "dotenv"
import { eq } from "drizzle-orm"
import _ from "lodash"
import { ResearcherConfiguration } from "./research-coordinator"
import { generateGenericPrompt, parseDate } from "./utils"

config({ path: "local.env" })

export const SIGNIFICANT_EVENTS_RESEARCHER_KEY = "significant"

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
  const filteredInsights = data.insights.filter((e) => {
    // No matching wiki link OR matching name and year from date
    if (existingWikiLinks.includes(e.wikipedia_link)) return false
    return !existingInsights.find(
      (i) => i.name?.toLowerCase() === e.name.toLowerCase(),
    )
  })

  const filteredCount = data.insights.length - filteredInsights.length

  // Validation -- Wikipedia links required
  const missingWikiLinkCount = _.filter(
    filteredInsights,
    (i) => !i.wikipedia_link,
  ).length

  if (missingWikiLinkCount) {
    console.debug(`Missing wiki links: ${missingWikiLinkCount}`)
    console.debug(JSON.stringify(data))

    throw Error(
      `Missing ${missingWikiLinkCount} links for significatn researcher on book ${book.title}`,
    )
  }

  if (filteredCount) {
    console.debug(`Filtered out ${filteredCount} existing insights`)
  }

  const filteredDatedResults = _.map(filteredInsights, (i, idx) => {
    const insight: InsertInsight = {
      name: i.name,
      description: i.description,
      book_id: book.id,
      wikipedia_link: i.wikipedia_link,
    }
    let eventDate = parseDate(i.date)
    insight.year = eventDate.year?.toString()
    insight.date = eventDate.date?.toISOString()

    if (!(insight.year || insight.date)) {
      console.warn("Missing Date! Data from AI below:")
      console.debug(JSON.stringify(data.insights[idx]))
    }

    return insight
  })

  return filteredDatedResults
}

export const significantEventResearcherConfig: ResearcherConfiguration = {
  key: SIGNIFICANT_EVENTS_RESEARCHER_KEY,
  finishedThreshold: 3,
  assistantID: process.env.SIGNIFICANT_RESEARCHER_ASSISTANT_ID,
  promptGenerator: generateGenericPrompt,
  parseFunction: parseSignificantEvents,
}
export type ParseSignificantEvents = typeof parseSignificantEvents
export default significantEventResearcherConfig