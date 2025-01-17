import { db } from "@/db"
import { books, SelectBook } from "@/db/schema/book"
import GetCoverImage from "@/lib/covers/get-cover-image"
import { isNull } from "drizzle-orm"
import _ from "lodash"

async function AttemptFillMissingImages() {
  const missingImages = await db
    .select()
    .from(books)
    .where(isNull(books.image_url))

  for (const book of missingImages) {
    console.log(`Fetch Image: ${book.title}`)
    const result = await GetCoverImage(book)
    console.log(result)
  }
}

AttemptFillMissingImages()
