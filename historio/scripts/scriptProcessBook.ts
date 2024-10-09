import { db } from "@/db"
import { books } from "@/db/schema/book"
import { insights } from "@/db/schema/insight"
import significantEventResearcher from "@/lib/researchers/significantEvents"
import Researcher from "@/types/researcher"
import { config } from "dotenv"
import { count, eq, asc } from "drizzle-orm"

config({ path: "local.env" })

import readline from "readline"

const RESEARCHERS = ["significant"]

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
  let researcher: Researcher
  if (researcherName === "significant") researcher = significantEventResearcher
  else throw new Error("Invalid researcher")

  // 10 books with the fewest insights for event processor we picked
  const booksWithLeastInsights = await db
    .select({
      book: books,
      insightCount: count(insights.id),
    })
    .from(books)
    .leftJoin(insights, eq(books.id, insights.book_id))
    .groupBy(books.id)
    .orderBy(asc(count(insights.id)))
    .limit(10)

  // console log all them books
  booksWithLeastInsights.map((b, idx) => {
    console.log(`${idx}: ${b.book.title}. ${b.insightCount} insights`)
  })
  const bookIdx = await promptForInput("Which book?")
  const book = booksWithLeastInsights[parseInt(bookIdx)].book

  const result = await researcher(book)
  console.log("-------------- restarting script")
  processSingleBook()
}
processSingleBook()
