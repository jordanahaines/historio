import { db } from "@/db"
import { books } from "@/db/schema/book"
import { eq } from "drizzle-orm"
import { promptForInput } from "./process-books"
import { fetchOverlappingBooks } from "@/db/queries/books"
import { createTimeline } from "@/db/queries/timelines"
import { config } from "dotenv"
config({ path: "local.env" })

async function doCreateTimeline() {
  console.log("What is the ID of book you want to create timeline for?")
  const bookID = await promptForInput("Book ID")
  const book = await db
    .select()
    .from(books)
    .where(eq(books.id, bookID))
    .limit(1)
  const overlapBooks = await fetchOverlappingBooks(book[0])
  const title = await promptForInput("Title for timeline?")
  const timeline = await createTimeline([book[0], ...overlapBooks], title)
  console.log(`Created Timeline: ${timeline.title}`)
  console.log("Link:")
  console.log(`http://localhost:3000/timeline/${timeline.id}`)
}

console.log("start")
doCreateTimeline()
