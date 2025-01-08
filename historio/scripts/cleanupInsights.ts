import { db } from "@/db"
import { insights, SelectInsight } from "@/db/schema/insight"
import { isDuplicateEvent } from "@/lib/researchers/utils"
import { eq, inArray, and } from "drizzle-orm"
import _ from "lodash"

async function cleanupInsights(bookID?: string) {
  console.debug("Start cleanup insights")
  // Look for duplicate insights per book. Just delete them
  let query = db.select().from(insights).$dynamic()
  if (bookID) {
    query = query.where(
      and(eq(insights.book_id, bookID), eq(insights.archived, false)),
    )
  } else {
    query = query.where(eq(insights.archived, false))
  }
  const allInsights = await query
  const groupedInsights = _.groupBy(allInsights, (i) => i.book_id)
  // Loop through insights, find IDs of duplicates
  const toArchive = new Set<string>()
  _.forEach(groupedInsights, (insights) => {
    const insightsToKeep: SelectInsight[] = []
    insights.forEach((i) => {
      if (!i.name) return
      const dupe = isDuplicateEvent(
        i.name,
        insightsToKeep,
        i.date ? new Date(i.date) : undefined,
      )
      if (dupe) {
        toArchive.add(i.id)
        // const hasSameWikiLink = i.wikipedia_link == dupe.wikipedia_link
        // console.log(
        //   "Archive",
        //   i.name,
        //   i.date,
        //   " DUPE:",
        //   dupe.name,
        //   dupe.date,
        //   " Same wiki link:",
        //   hasSameWikiLink,
        // )
      } else {
        insightsToKeep.push(i)
      }
    })
  })
  console.log(`${toArchive.size} insights to archive`)
  const toArchiveArr: string[] = Array.from(toArchive)
  const result = await db
    .update(insights)
    .set({ archived: true })
    .where(inArray(insights.id, toArchiveArr))
  console.log("Updated!", result)
  return true
}
cleanupInsights()
