import { parse } from "csv-parse/sync"

import { books, InsertBook, SelectBook } from "@/db/schema/book"
import { db } from "@/db"

/**
 * Given a goodreads import file, add all of the books in it to our database as books
 * @param goodreadsFile
 * @returns
 */
export default async function goodreadsImport(
  goodreadsFile: File,
): Promise<SelectBook[]> {
  const buffer = Buffer.from(await goodreadsFile.arrayBuffer())
  const goodreadsFileData = await parse(buffer, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  })

  // Helper function
  const cleanISBN = (isbn: string) => {
    return isbn.replace(/[^0-9]/g, "")
  }

  // Clean up the data a bit so that we can do inserts
  const mappedData: InsertBook[] = goodreadsFileData.map((d) => {
    const isbn = cleanISBN(d.ISBN13 || d.ISBN)

    return {
      title: d.Title,
      author: d.Author,
      isbn,
      amazon_id: d["Book Id"] ? Number(d["Book Id"]) : null,
      last_import: new Date(),
    }
  })

  // Insert the books and then return them
  const result = await db.insert(books).values(mappedData).returning()

  return result
}
