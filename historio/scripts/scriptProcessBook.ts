//  npx tsx scripts/scriptProcessBook.ts
import { db } from "@/db"
import { books, SelectBook } from "@/db/schema/book"
import { insights } from "@/db/schema/insight"
import significantEventResearcher, {
  SIGNIFICANT_EVENTS_RESEARCHER_KEY,
} from "@/lib/researchers/significantEvents"
import { config } from "dotenv"
import { arrayContains, asc, count, eq, not } from "drizzle-orm"
import _ from "lodash"

config({ path: "local.env" })

import readline from "readline"

const RESEARCHERS = [SIGNIFICANT_EVENTS_RESEARCHER_KEY]

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
  RESEARCHERS.map((r, idx) => console.log(`${idx}: ${r}`))
  const researcherIdx = await promptForInput("Which researcher?")
  const researcherName = RESEARCHERS[parseInt(researcherIdx)]
  let researcher
  if (researcherName === "significant") researcher = significantEventResearcher
  else throw new Error("Invalid researcher")

  // 10 books with the fewest insights for event processor we picked
  const booksWithLeastInsights = await db
    .select({
      book: books,
      insightCount: count(insights.id),
    })
    .from(books)
    .where(not(arrayContains(books.completed_researchers, [researcherName])))
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
    const results = Promise.all(
      booksWithLeastInsights.map((b) => researcher(b.book)),
    )
    processSingleBook()
    return
  } else {
    book = booksWithLeastInsights[parseInt(bookPromptResult)].book
    console.debug(`Chose book ${book.title} with ID: ${book.id}`)
  }
  // Instead of forEach, use a for...of loop for sequential async/await
  for (let i = 0; i < iterations; i++) {
    await researcher(book, true) // Wait for researcher to finish
  }

  console.log("-------------- restarting script")
  processSingleBook()
}
processSingleBook()
