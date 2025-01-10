import { db } from "@/db"
import { insights } from "@/db/schema/insight"
import { eq, inArray } from "drizzle-orm"
import _ from "lodash"

async function cleanupInsights() {
  console.debug("Start cleanup insights")
  // Look for duplicate insights per book. Just delete them
  const allInsights = await db
    .select()
    .from(insights)
    .where(eq(insights.archived, false))
  const groupedInsights = _.groupBy(allInsights, (index) => index.book_id)
  // Loop through insights, find IDs of duplicates
  const toArchive = new Set<string>()
  _.forEach(groupedInsights, (insights, _) => {
    const names = new Set<string>()
    for (const index of insights) {
      if (!index.name) continue
      if (names.has(index.name.toLowerCase())) {
        toArchive.add(index.id)
        console.log("Archive", index.name)
      } else {
        names.add(index.name.toLowerCase())
      }
    }
  })
  console.log(`${toArchive.size} insights to archive`)
  const toArchiveArray: string[] = [...toArchive]
  await db
    .update(insights)
    .set({ archived: true })
    .where(inArray(insights.id, toArchiveArray))
  console.log("Updated!")
  return true
}
cleanupInsights()
