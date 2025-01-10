/**
 * Utility that can be run from command line to import Goodreads books into DB
 * npx ts-node scripts/scriptGoodreadsImport.ts db/seed/jordan_goodreads.csv
 */
import fs from "node:fs/promises"
import { cwd } from "node:process"

import goodreadsImport from "@/lib/goodreads-import"

const main = async () => {
  // Read file passed as prop
  const pth = `${cwd()}/${process.argv[2]}`
  console.log(`Start: Goodreads import script.Reading file ${pth}`)
  const goodreadsFile = await fs.readFile(pth, "utf8")
  const books = await goodreadsImport(goodreadsFile)
  console.log(`End: Goodreads import script. ${books.length} books imported!`)

  process.exit()
}

main()
