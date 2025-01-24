//  npx tsx scripts/process-books.ts
import { db } from "@/db"
import { books, SelectBook } from "@/db/schema/book"
import { insights } from "@/db/schema/insight"
import minorEventResearcherConfig from "@/lib/researchers/minor-events"
import doResearch, {
  ResearcherConfiguration,
} from "@/lib/researchers/research-coordinator"
import { significantEventResearcherConfig } from "@/lib/researchers/significant-events"
import { config } from "dotenv"
import { arrayContains, asc, count, eq, not } from "drizzle-orm"
import _ from "lodash"

config({ path: "local.env" })

const RESEARCHERS = {
  significant: significantEventResearcherConfig,
  minor: minorEventResearcherConfig,
}
type ResearcherKeys = keyof typeof RESEARCHERS
const PARALLELISM = 10

async function getBooksWithFewestInsights(researcherKey: string) {
  // 10 books with the fewest insights for event processor we picked
  const booksWithLeastInsights = await db
    .select({
      book: books,
      insightCount: count(insights.id),
    })
    .from(books)
    .where(not(arrayContains(books.completed_researchers, [researcherKey])))
    .leftJoin(insights, eq(books.id, insights.book_id))
    .groupBy(books.id)
    .orderBy(asc(count(insights.id)))
    .limit(10)
  return booksWithLeastInsights
}

async function processSingleBook() {
  const researcherKeys = Object.keys(RESEARCHERS)
  researcherKeys.map((r, index) => console.log(`${index}: ${r}`))
  let researcherIndex = "0"
  if (researcherKeys.length > 1) {
    researcherIndex = await promptForInput("Which researcher?")
  }
  const researcherKey = researcherKeys[
    Number.parseInt(researcherIndex)
  ] as ResearcherKeys
  const researcherConfig: ResearcherConfiguration = RESEARCHERS[researcherKey]

  // console log all them books
  const booksWithLeastInsights = await getBooksWithFewestInsights(researcherKey)
  booksWithLeastInsights.map((b, index) => {
    console.log(`${index}: ${b.book.title}. ${b.insightCount} insights`)
  })
  console.log(`${booksWithLeastInsights.length}: All the books!`)
  // And provide an option to do all books
  const bookPromptResult = await promptForInput(
    "Which book? You can also enter a book ID",
  )
  const iterations = Number.parseInt(
    await promptForInput("How many iterations?"),
  )
  let book: SelectBook
  if (bookPromptResult.length > 3) {
    const bookFetch = await db
      .select()
      .from(books)
      .where(eq(books.id, bookPromptResult))
      .limit(1)
    if (bookFetch.length === 0) throw new Error("No book found for id")
    book = bookFetch[0]
  } else if (
    Number.parseInt(bookPromptResult) === booksWithLeastInsights.length
  ) {
    // Process all books a single time
    const results = Promise.all(
      booksWithLeastInsights.map((b) =>
        doResearch(b.book, researcherConfig, true),
      ),
    )
    await results
    processSingleBook()
    return
  } else {
    book = booksWithLeastInsights[Number.parseInt(bookPromptResult)].book
    console.debug(`Chose book ${book.title} with ID: ${book.id}`)
  }
  // Instead of forEach, use a for...of loop for sequential async/await
  for (let index = 0; index < iterations; index++) {
    const [_, __, updatedBook] = await doResearch(book, researcherConfig, true) // Wait for researcher to finish
    if (updatedBook) book = updatedBook
    if (updatedBook?.completed_researchers.includes(researcherKey)) {
      // Yay we're done early. No need to waste OpenAI $$!
      break
    }
  }

  console.log("-------------- restarting script")
  processSingleBook()
}

// Helper function to process a single book
async function processBooks() {
  // Execute researcher on three of them
  const books = await getBooksWithFewestInsights("bad")
  let index = 0
  const promises: ReturnType<typeof doResearch>[] = []
  while (index < books.length && promises.length <= PARALLELISM) {
    const book = books[index]
    const randomResearchers = _.shuffle(_.keys(RESEARCHERS))
    const researcherKey = _.find(
      randomResearchers,
      (r) => !book.book.completed_researchers.includes(r),
    )
    if (!researcherKey) {
      index += 1
      continue
    }
    promises.push(
      doResearch(book.book, RESEARCHERS[researcherKey as ResearcherKeys]),
    )
    index += 1
  }
  console.log("Returning Promises. Length:", promises.length)
  return Promise.all(promises)
}

/** Randomly chooose books and unfinished researchers to achieve some fixed insight count */
async function processToInsightGoal() {
  const goal = Number.parseInt(
    await promptForInput("How many more insights we want?"),
  )

  let newInsightCount = 0
  while (newInsightCount < goal) {
    const result = await processBooks()
    newInsightCount += _.sumBy(result, (r) => r[1].length)
    console.log(`Total New insights: ${newInsightCount}`)
    console.log("---------------")
  }
}

async function start() {
  const insightCount = await db
    .select({ c: count(insights.id) })
    .from(insights)
    .where(eq(insights.archived, false))
  console.log(`Total insights (active): ${insightCount[0].c}`)
  console.log("1: Choose Books")
  console.log("2: Process to Goal")
  const choice = await promptForInput("What do you want to do?")
  if (choice === "1") {
    processSingleBook()
  } else if (choice === "2") {
    processToInsightGoal()
  } else {
    console.log("Invalid choice")
    start()
  }
}

start()
