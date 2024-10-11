/* eslint-disable no-console */
import { books, SelectBook } from "@/db/schema/book"
import { SelectInsight, InsertInsight, insights } from "@/db/schema/insight"
import { InsertResearcherRun, researcherRuns } from "@/db/schema/research"
import Researcher, { SignificantEventsReturn } from "@/types/researcher"
import OpenAI from "openai"
import { parse } from "date-fns"
import _ from "lodash"
import { config } from "dotenv"
import { db } from "@/db"
import { eq } from "drizzle-orm"

config({ path: "local.env" })

const OPENAI_ASSISTANT_ID = process.env.SIGNIFICANT_RESEARCHER_ASSISTANT_ID
export const SIGNIFICANT_EVENTS_RESEARCHER_KEY = "significant"

type ParsedInsightDate = {
  date: Date | null
  year: number | null
}

const DATE_FORMATS = ["MM/dd/yyyy", "yyyy", "yyyy G"]
const FINISHED_THRESHOLD = 2 // If we end up with this many events or less, we mark researcher done

/**
 * Parses a date string in multiple formats.
 *
 * @param dateString The date string to parse.
 * @returns The parsed Date object, or the year or null. Note that year (from date or actual year val) will be
 *  negative if the date is actually BC.
 */
export function parseDate(
  dateString: string,
  referenceDate: Date | undefined = undefined,
): ParsedInsightDate {
  // Helper
  const isValidDate = (d: Date) => d instanceof Date && !isNaN(d)

  // Remove commas, which sometimes appear in years
  dateString = dateString.replace(/,/g, "")
  let dateObj: Date | undefined = undefined
  for (const format of DATE_FORMATS) {
    dateObj = parse(dateString, format, new Date())
    if (dateObj && isValidDate(dateObj)) {
      // If year is BC, we just return year
      if (dateObj.getFullYear() < 0)
        return { date: null, year: dateObj.getFullYear() }
      return { date: dateObj, year: dateObj.getFullYear() }
    }
  }
  return { date: null, year: null }
}

export type SignificantEventResearcherProps = {
  iterations: number
}

const significantEventResearcher: Researcher = async (
  book: SelectBook,
  debug = false,
) => {
  const startTime = new Date()
  console.debug(`Start Significant Researcher for ${book.title}`)
  // Start by creating our researcher run
  const run = (
    await db
      .insert(researcherRuns)
      .values({
        researcher_key: SIGNIFICANT_EVENTS_RESEARCHER_KEY,
        book_id: book.id,
      })
      .returning()
  )[0]
  console.debug(`ResearcherRun ID: ${run.id}`)

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  let message = `Title: ${book.title}\nAuthor: ${book.author}`

  const existingInsights = await db
    .select({ link: insights.wikipedia_link, title: insights.name })
    .from(insights)
    .where(eq(insights.book_id, book.id))

  console.debug(`Found ${existingInsights.length} existing insights`)

  const existingWikiLinks = _.map(existingInsights, "link")
  const existingEventNames = _.map(existingInsights, "title")

  // We try to exclude existing events
  if (existingEventNames.length) {
    message += "\n\n Do not include these events in your results:"
    existingEventNames.forEach((e) => (message += `\n- ${e}`))
  }

  if (debug) {
    console.debug("Prompt: ----")
    console.debug(message)
  }

  if (!OPENAI_ASSISTANT_ID)
    throw new Error(
      `Invalid OpenAI assistant ID for: ${SIGNIFICANT_EVENTS_RESEARCHER_KEY}`,
    )

  // Todo: Run in parallel, except then we lose types. How to type that
  const openAIRun = await openai.beta.threads.createAndRunPoll({
    assistant_id: OPENAI_ASSISTANT_ID,
    thread: {
      messages: [{ role: "user", content: message }],
    },
  })
  console.debug(`OpenAI Run: ${openAIRun.thread_id}`)

  // Escape for bad run
  if (openAIRun.status !== "completed") {
    throw new Error("OpenAI Significant Researcher Failed")
  }

  // Process results
  const messages = await openai.beta.threads.messages.list(openAIRun.thread_id)
  const data = messages.data[0].content[0].text.value
  const insightsResponse: SignificantEventsReturn = JSON.parse(data)
  // De-Duplicate insights based on wikipedia link
  let insertInsights: InsertInsight[] = insightsResponse.insights
    .filter((i) => !existingWikiLinks.includes(i.wikipedia_link))
    .map((i) => {
      const insight: InsertInsight = {
        name: i.name,
        description: i.description,
        wikipedia_link: i.wikipedia_link,
        book_id: book.id,
        researcher_run: run.id,
      }
      let eventDate = parseDate(i.date)
      insight.year = eventDate.year?.toString()
      insight.date = eventDate.date?.toISOString()

      return insight
    })
    .filter((i) => !!i)
  let newInsights: SelectInsight[] = []
  if (insertInsights.length === 0) {
    // We are done. Add current researcher to book's finished researchers array
    book.completed_researchers.push(SIGNIFICANT_EVENTS_RESEARCHER_KEY)
    await db
      .update(books)
      .set({ completed_researchers: book.completed_researchers })
      .where(eq(books.id, book.id))
    console.debug(
      `No new insights. Marked researcher complete. (OpenAI returned ${insightsResponse.insights.length} insights)`,
    )
  } else {
    // Insert new insights into db
    newInsights = await db.insert(insights).values(insertInsights).returning()
    console.debug(
      `Inserted ${newInsights.length} new insights for ${book.title}. Filtered out ${insightsResponse.insights.length - insertInsights.length} existing insights.`,
    )
  }

  // If we got a book start or book end, update null values only
  const parsedBookStart = parseDate(insightsResponse.start_date).date
  const parsedBookEnd = parseDate(insightsResponse.end_date).date
  const updateObject: { start_year?: string; end_year?: string } = {}
  if (parsedBookStart && !book.start_year)
    updateObject.start_year = parsedBookStart.getFullYear().toString()
  if (parsedBookEnd && !book.end_year)
    updateObject.end_year = parsedBookEnd.getFullYear().toString()
  if (Object.keys(updateObject).length > 0) {
    await db.update(books).set(updateObject).where(eq(books.id, book.id))
  }

  // The run worked! We get to update the run object
  const duration = new Date().getTime() - startTime.getTime() // Miliseconds
  const runUpdate: InsertResearcherRun = {
    new_insights: insertInsights.length.toString(),
    duration_ms: duration.toString(),
  }
  if (debug) {
    runUpdate.result_log = data
  }
  await db
    .update(researcherRuns)
    .set(runUpdate)
    .where(eq(researcherRuns.id, run.id))

  if (insertInsights.length <= FINISHED_THRESHOLD) {
    book.completed_researchers.push(SIGNIFICANT_EVENTS_RESEARCHER_KEY)
    await db
      .update(books)
      .set({ completed_researchers: book.completed_researchers })
      .where(eq(books.id, book.id))
    console.debug(
      `Significant events research for ${book.title} is now complete!`,
    )
  }

  console.debug(
    `Finished Significant Researcher for ${book.title}. Duration: ${duration}ms`,
  )

  return [run, newInsights, book]
}

export default significantEventResearcher
