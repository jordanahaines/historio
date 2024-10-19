// Our main researcher class. Pulls in filter functions from other researchers

import { db } from "@/db"
import { books, SelectBook } from "@/db/schema/book"
import { insights, SelectInsight } from "@/db/schema/insight"
import { InsertResearcherRun, researcherRuns } from "@/db/schema/research"
import { eq } from "drizzle-orm"
import OpenAI from "openai"
import { ParseSignificantEvents } from "./significantEvents"
import { ParseMinorEvents } from "./minorEvents"

export type PromptGeneratorFunction = (
  book: SelectBook,
  existingInsights?: SelectInsight[],
) => string

type ParseFunction = ParseSignificantEvents | ParseMinorEvents // | other parse types

// Each individual researcher has this
export type ResearcherConfiguration = {
  key: string
  finishedThreshold: number | null
  assistantID?: string
  promptGenerator: PromptGeneratorFunction
  // TODO: We can cash existing insights between these functions, potentially
  // maybe in a query?
  parseFunction: ParseFunction
}

/**
 * All research happens here.
 * Pass a book. Pass a config. Get back insights. Coolio.
 */
export default async function doResearch(
  book: SelectBook,
  researcherConfiguration: ResearcherConfiguration,
  debug = false,
): Promise<[InsertResearcherRun, SelectInsight[], SelectBook]> {
  const startTime = new Date()
  console.debug(
    `Start researcher ${researcherConfiguration.key} for ${book.title}`,
  )
  // Start by creating our researcher run
  const run = (
    await db
      .insert(researcherRuns)
      .values({
        researcher_key: researcherConfiguration.key,
        book_id: book.id,
      })
      .returning()
  )[0]
  console.debug(`ResearcherRun ID: ${run.id}`)

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const existingInsights = await db
    .select()
    .from(insights)
    .where(eq(insights.book_id, book.id))

  console.debug(`Found ${existingInsights.length} existing insights`)
  const prompt = researcherConfiguration.promptGenerator(book, existingInsights)

  if (debug) {
    console.debug("Prompt: ----")
    console.debug(prompt)
  }
  if (!researcherConfiguration.assistantID) {
    throw new Error(
      `Invalid OpenAI assistant ID for: ${researcherConfiguration.key}`,
    )
  }

  // Todo: Run in parallel, except then we lose types. How to type that
  const openAIRun = await openai.beta.threads.createAndRunPoll({
    assistant_id: researcherConfiguration.assistantID,
    thread: {
      messages: [{ role: "user", content: prompt }],
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
  const insightsToInsert = await researcherConfiguration.parseFunction(
    JSON.parse(data),
    book,
    existingInsights,
  )
  insightsToInsert.forEach((i) => (i.researcher_run = run.id))

  let newInsights: SelectInsight[] = []

  // Insights without a date are filtered out
  const filteredInsightsToInsert = insightsToInsert.filter(
    (i) => i.date || i.year,
  )
  if (filteredInsightsToInsert.length < insightsToInsert.length) {
    console.warn(
      `Filtered out ${insightsToInsert.length - filteredInsightsToInsert.length} insights without a date!`,
    )
  }

  // Insert our new insights
  let newInsightCount = 0
  if (filteredInsightsToInsert.length) {
    const newInsights = await db
      .insert(insights)
      .values(filteredInsightsToInsert)
      .returning()
    newInsightCount = newInsights.length
    console.debug(
      `Inserted ${newInsights.length} new insights for ${book.title}.`,
    )
  }

  // The run worked! We get to update the run object
  const duration = new Date().getTime() - startTime.getTime() // Miliseconds
  const runUpdate: InsertResearcherRun = {
    new_insights: newInsightCount.toString(),
    duration_ms: duration.toString(),
  }
  if (debug) {
    runUpdate.result_log = data
  }
  await db
    .update(researcherRuns)
    .set(runUpdate)
    .where(eq(researcherRuns.id, run.id))

  if (
    researcherConfiguration.finishedThreshold !== null &&
    newInsightCount <= researcherConfiguration.finishedThreshold
  ) {
    book.completed_researchers.push(researcherConfiguration.key)
    await db
      .update(books)
      .set({ completed_researchers: book.completed_researchers })
      .where(eq(books.id, book.id))
    console.debug(
      `Researcher ${researcherConfiguration.key} for ${book.title} is now complete!`,
    )
  }
  console.debug(
    `Finished run of researcher ${researcherConfiguration.key} for ${book.title}. Duration: ${duration}ms`,
  )

  return [run, newInsights, book]
}
