/**
 * Sup
 */

import { db } from "@/db"
import { books, SelectBook } from "@/db/schema/book"
import * as cheerio from "cheerio"
import { eq } from "drizzle-orm"

/**
 * Function that attempts to retrieve cover image for book, save it, set it on image_url
 * If all that is successful or image already exists, returns True
 * @param book
 */
export default async function GetCoverImage(
  book: SelectBook,
  forceUpdate: boolean = false,
): Promise<boolean> {
  if (book.image_url && !forceUpdate) return true

  // First, if we have an Amazon ID then we attempt to get Goodreads image
  if (book.amazon_id) {
    const $ = await cheerio.fromURL(
      `https://www.goodreads.com/book/show/${book.amazon_id}`,
    )
    const $images = $("img")
    $images.each((__, element) => {
      if (book.amazon_id && element.attribs.src.includes(book.amazon_id)) {
        book.image_url = element.attribs.src
      }
    })
    if (book.image_url) {
      await db
        .update(books)
        .set({ image_url: book.image_url })
        .where(eq(books.id, book.id))
      return true
    }
  }

  return false
}
