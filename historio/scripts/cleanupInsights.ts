import { db } from "@/db"
import { books, SelectBook } from "@/db/schema/book"
import { insights } from "@/db/schema/insight"
import { inArray, eq } from "drizzle-orm"
import _ from "lodash"

async function cleanupInsights() {
  console.debug("Start cleanup insights")
  // Look for duplicate insights per book. Just delete them
  const allInsights = await db
    .select()
    .from(insights)
    .where(eq(insights.archived, false))
  const groupedInsights = _.groupBy(allInsights, (i) => i.book_id)
  // Loop through insights, find IDs of duplicates
  const toArchive = new Set<string>()
  _.forEach(groupedInsights, (insights, bookID) => {
    const orderedInsights = _.sortBy(insights, (i) => i.date)
    const names = new Set<string>()
    insights.forEach((i) => {
      if (!i.name) return
      if (names.has(i.name.toLowerCase())) {
        toArchive.add(i.id)
        console.log("Archive", i.name)
      } else {
        names.add(i.name.toLowerCase())
      }
    })
  })
  console.log(`${toArchive.size} insights to archive`)
  const toArchiveArr: string[] = Array.from(toArchive)
  const result = await db
    .update(insights)
    .set({ archived: true })
    .where(inArray(insights.id, toArchiveArr))
  console.log("Updated!")
  return true
}
cleanupInsights()
