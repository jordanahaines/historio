//  npx tsx scripts/scriptProcessBook.ts
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

import readline from "readline"

const RESEARCHERS = {
  significant: significantEventResearcherConfig,
  minor: minorEventResearcherConfig,
}
const PARALLELISM = 10

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

async function promptForInput(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer)
    })
  })
}

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
  researcherKeys.map((r, idx) => console.log(`${idx}: ${r}`))
  let researcherIdx = "0"
  if (researcherKeys.length > 1) {
    researcherIdx = await promptForInput("Which researcher?")
  }
  const researcherKey = researcherKeys[parseInt(researcherIdx)]
  const researcherConfig: ResearcherConfiguration = RESEARCHERS[researcherKey]

  // console log all them books
  const booksWithLeastInsights = await getBooksWithFewestInsights(researcherKey)
  booksWithLeastInsights.map((b, idx) => {
    console.log(`${idx}: ${b.book.title}. ${b.insightCount} insights`)
  })
  console.log(`${booksWithLeastInsights.length}: All the books!`)
  // And provide an option to do all books
  let bookPromptResult = await promptForInput(
    "Which book? You can also enter a book ID",
  )
  const iterations = parseInt(await promptForInput("How many iterations?"))
  let book: SelectBook
  if (bookPromptResult.length > 3) {
    const bookFetch = await db
      .select()
      .from(books)
      .where(eq(books.id, bookPromptResult))
      .limit(1)
    if (!bookFetch.length) throw new Error("No book found for id")
    book = bookFetch[0]
  } else if (parseInt(bookPromptResult) === booksWithLeastInsights.length) {
    // Process all books a single time
    const results = Promise.all(
      booksWithLeastInsights.map((b) =>
        doResearch(b.book, researcherConfig, true),
      ),
    )
    processSingleBook()
    return
  } else {
    book = booksWithLeastInsights[parseInt(bookPromptResult)].book
    console.debug(`Chose book ${book.title} with ID: ${book.id}`)
  }
  // Instead of forEach, use a for...of loop for sequential async/await
  for (let i = 0; i < iterations; i++) {
    const [run, insights, updatedBook] = await doResearch(
      book,
      researcherConfig,
      true,
    ) // Wait for researcher to finish
    if (updatedBook) book = updatedBook
    if (updatedBook?.completed_researchers.includes(researcherKey)) {
      // Yay we're done early. No need to waste OpenAI $$!
      break
    }
  }

  console.log("-------------- restarting script")
  processSingleBook()
}

/** Randomly chooose books and unfinished researchers to achieve some fixed insight count */
async function processToInsightGoal() {
  const goal = parseInt(await promptForInput("How many more insights we want?"))

  async function processBooks() {
    // Execute researcher on three of them
    const books = await getBooksWithFewestInsights("bad")
    let idx = 0
    let promises: ReturnType<typeof doResearch>[] = []
    while (idx < books.length && promises.length <= PARALLELISM) {
      const book = books[idx]
      const randomResearchers = _.shuffle(_.keys(RESEARCHERS))
      const researcherKey = _.find(
        randomResearchers,
        (r) => !book.book.completed_researchers.includes(r),
      )
      if (!researcherKey) {
        idx += 1
        continue
      }
      promises.push(doResearch(book.book, RESEARCHERS[researcherKey]))
      idx += 1
    }
    console.log("Returning Promises. Length: ", promises.length)
    return Promise.all(promises)
  }

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
  console.log(`Total insights: ${insightCount[0].c}`)
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
