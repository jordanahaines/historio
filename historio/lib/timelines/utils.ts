import { SelectInsight } from "@/db/schema/insight"
import { GroupedInsights } from "@/types/timeline"
import _ from "lodash"
import stats from "stats-lite"
import { parseDate } from "../researchers/utils"
import { differenceInDays, add, format } from "date-fns"

const GROUP_INSIGHTS_BUCKETS = 10
const DATE_FORMAT = "yyyy-MM-dd"

/** Group our insights into date buckets */
export function GroupInsights(
  insights: SelectInsight[],
): [GroupedInsights, boolean, boolean] {
  // First we determine outliers using IQR
  const sortedInsights = _.sortBy(
    _.filter(insights, (i) => !!i.date),
    "date",
  )
  if (!sortedInsights.length) throw new TypeError("Invalid insights. Empty!")
  const firstDate = parseDate(sortedInsights[0].date as string).date as Date
  const dateDayCount = _.map(sortedInsights, (insight) => {
    return differenceInDays(
      parseDate(insight.date as string).date as Date,
      firstDate,
    )
  })

  const quartileOne = stats.percentile(dateDayCount, 0.25)
  const quartileThree = stats.percentile(dateDayCount, 0.75)
  const iqr = quartileThree - quartileOne
  const lowerBound = _.findIndex(
    dateDayCount,
    (d) => d >= quartileOne - 1.5 * iqr,
  )
  const lowerBoundDate = parseDate(sortedInsights[lowerBound].date as string)
    .date as Date
  const upperBound = _.findLastIndex(
    dateDayCount,
    (d) => d <= quartileThree + 1.5 * iqr,
  )
  // Total number of days on our timeline
  const totalDuration = dateDayCount[upperBound] - dateDayCount[lowerBound]
  const bucketSize = totalDuration / GROUP_INSIGHTS_BUCKETS
  const dateIndices = _.map(_.range(GROUP_INSIGHTS_BUCKETS), (i) => {
    const di = add(lowerBoundDate, { days: bucketSize * i })
    return di
  })

  // Build the buckets
  // Includes putting lower outliers in first bucket; later outliers in last
  const buckets = _.groupBy(sortedInsights, (i) => {
    const insightDate = parseDate(i.date as string).date as Date
    const d = _.findLast(dateIndices, (di) => insightDate >= di)
    if (!d) return format(lowerBoundDate, DATE_FORMAT)
    return format(d, DATE_FORMAT)
  })
  // console.info("Buckets:")
  // console.log(_.mapValues(buckets, "length"))

  return [buckets, lowerBound > 0, upperBound < sortedInsights.length - 1]
}
