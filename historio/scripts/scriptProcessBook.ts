//  npx tsx scripts/scriptProcessBook.ts
import { db } from "@/db"
import { books, SelectBook } from "@/db/schema/book"
import { insights } from "@/db/schema/insight"
import minorEventResearcherConfig from "@/lib/researchers/minorEvents"
import doResearch, {
  ResearcherConfiguration,
} from "@/lib/researchers/researchCoordinator"
import { significantEventResearcherConfig } from "@/lib/researchers/significantEvents"
import { config } from "dotenv"
import { arrayContains, asc, count, eq, not } from "drizzle-orm"
import _ from "lodash"

config({ path: "local.env" })

import readline from "readline"

const RESEARCHERS = {
  significant: significantEventResearcherConfig,
  minor: minorEventResearcherConfig,
}

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

async function processSingleBook() {
  const insightCount = await db.select({ c: count(insights.id) }).from(insights)
  console.log(`Total insights: ${insightCount[0].c}`)
  const researcherKeys = Object.keys(RESEARCHERS)
  researcherKeys.map((r, idx) => console.log(`${idx}: ${r}`))
  let researcherIdx = "0"
  if (researcherKeys.length > 1) {
    researcherIdx = await promptForInput("Which researcher?")
  }
  const researcherKey = researcherKeys[parseInt(researcherIdx)]
  const researcherConfig: ResearcherConfiguration = RESEARCHERS[researcherKey]

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

  // console log all them books
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
processSingleBook()
