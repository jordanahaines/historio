import { parse } from "csv-parse/sync"

import { books, InsertBook, SelectBook } from "@/db/schema/book"
import { db } from "@/db"

type GoodreadsCSVRow = {
  "Book Id": number
  Title: string
  Author: string
  "Author l-f": string
  "Additional Authors": string
  ISBN: string
  ISBN13: string
  "My Rating": string
  "Average Rating": string
  Publisher: string
  Binding: string
  "Number of Pages": string
  "Year Published": string
  "Original Publication Year": string
  "Date Read": string
  "Date Added": string
  Bookshelves: string
  "Bookshelves with positions": string
  "Exclusive Shelf": string
  "My Review": string
  Spoiler: string
  "Private Notes": string
  "Read Count": string
  "Owned Copies": string
}

/**
 * Given a goodreads import file, add all of the books in it to our database as books
 * @param goodreadsFile
 * @returns
 */
export default async function goodreadsImport(
  goodreadsFile: Buffer | string,
): Promise<SelectBook[]> {
  const goodreadsFileData = (await parse(goodreadsFile, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  })) as GoodreadsCSVRow[]

  // Helper function
  const cleanISBN = (isbn: string) => {
    return isbn.replace(/[^0-9]/g, "")
  }

  // Clean up the data a bit so that we can do inserts
  const mappedData: InsertBook[] = goodreadsFileData.map(
    (d: GoodreadsCSVRow) => {
      const isbn = cleanISBN(d.ISBN13 || d.ISBN)

      return {
        title: d.Title,
        author: d.Author,
        isbn: isbn || null,
        amazon_id: d["Book Id"] ? Number(d["Book Id"]).toString() : null,
        last_import: new Date(),
      }
    },
  )

  // console.log(mappedData.map((d) => d.isbn))
  // Insert the books and then return them
  const result = await db
    .insert(books)
    .values(mappedData)
    .onConflictDoNothing()
    .returning()

  return result
}
