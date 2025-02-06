/**
 * Utility that can be run from command line to import Goodreads books into DB
 * npx tsx scripts/goodreads-import.ts db/seed/goodreads_demo.csv
 */
import fs from "node:fs/promises"
import { cwd } from "node:process"

import goodreadsImport from "@/lib/goodreads-import"
import GetCoverImage from "@/lib/covers/get-cover-image"

const main = async () => {
  // Read file passed as prop
  const pth = `${cwd()}/${process.argv[2]}`
  console.log(`Start: Goodreads import script.Reading file ${pth}`)
  const goodreadsFile = await fs.readFile(pth, "utf8")
  const books = await goodreadsImport(goodreadsFile)
  console.log(`End: Goodreads import script. ${books.length} books imported!`)

  // Fetch images for imported books
  for (const book of books) {
    console.log(`Fetch Image: ${book.title}`)
    await GetCoverImage(book)
  }
}

main()
