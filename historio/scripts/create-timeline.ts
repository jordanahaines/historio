import { db } from "@/db"
import { fetchOverlappingBooks } from "@/db/queries/books"
import { createTimeline } from "@/db/queries/timelines"
import { books } from "@/db/schema/book"
import { timelineBooks } from "@/db/schema/timeline"
import { config } from "dotenv"
import { eq, inArray } from "drizzle-orm"
import _ from "lodash"
import { promptForInput } from "./utils"
config({ path: "local.env" })

/** Create new timeline from a book */
async function doCreateTimeline() {
  console.log("What is the ID of book you want to create timeline for?")
  const bookID = await promptForInput("Book ID")
  const book = await db
    .select()
    .from(books)
    .where(eq(books.id, bookID))
    .limit(1)
  const overlapBooks = await fetchOverlappingBooks({ book: book[0] })
  const title = await promptForInput("Title for timeline?")
  const timeline = await createTimeline({
    books: [book[0], ...overlapBooks],
    timelineTitle: title,
  })
  console.log(`Created Timeline: ${timeline.title}`)
  console.log(`Book count: ${overlapBooks.length}`)
  console.log("Link:")
  console.log(`http://localhost:3000/timeline/${timeline.id}`)
}

async function doCreateFromTimePeriod() {
  let timelineID = await promptForInput(
    "Existing timeline? Leave blank to create a new one",
  )
  if (!timelineID) {
    const timelineName = await promptForInput("Timeline Name?")
    const timeline = await createTimeline({
      books: [],
      timelineTitle: timelineName,
    })
    timelineID = timeline.id
  }
  const existingBookIds = await db
    .select({ id: timelineBooks.book_id })
    .from(timelineBooks)
    .where(eq(timelineBooks.timeline_id, timelineID))

  // Figure out date range to add new book to timeline
  const start = Number(await promptForInput("Start Year?"))
  const end = Number(await promptForInput("End Year?"))
  const books = await fetchOverlappingBooks({
    start: new Date(start, 0, 1),
    end: new Date(end, 0, 1),
    limit: existingBookIds.length + 1,
  })
  const newBook = _.find(
    books,
    (b) => !_.map(existingBookIds, "id").includes(b.id),
  )
  console.log(`Adding ${newBook?.title} to timeline`)
  if (newBook) {
    createTimeline({
      books: [newBook],
      timelineID,
    })
    console.log(`Added ${newBook.title} to timeline`)
  } else {
    console.log("Timeline not found")
  }
}

async function createFromSpecificBooks() {
  const bookIDs: string[] = []
  let bookIDInput = ""

  while (bookIDs.length === 0 || bookIDInput !== "") {
    bookIDInput = await promptForInput("Book ID? blank to stop")
    if (bookIDInput !== "") {
      bookIDs.push(bookIDInput)
    }
  }

  const name = await promptForInput("Timeline Name?")
  const createWithBooks = await db
    .select()
    .from(books)
    .where(inArray(books.id, bookIDs))
  const tl = await createTimeline({
    books: createWithBooks,
    timelineTitle: name,
  })
  console.log(
    `Created timeline ${tl.title}. URL: http://localhost:3000/timeline/${tl.id}`,
  )
}

console.log("1: Create from specific books")
console.log("2: Create from time period (including existing timeline)")
console.log("3: Create from single book")

async function start() {
  const choice = await promptForInput("What do you want to do?")
  // eslint-disable-next-line unicorn/prefer-switch
  if (choice === "1") {
    createFromSpecificBooks()
  } else if (choice === "2") {
    doCreateFromTimePeriod()
  } else if (choice === "3") {
    doCreateTimeline()
  } else {
    console.log("Invalid choice")
  }
}
// eslint-disable-next-line unicorn/prefer-top-level-await
start()
