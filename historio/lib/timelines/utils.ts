import _ from "lodash"
import stats from "stats-lite"
import { differenceInDays, add, format } from "date-fns"

import { parseDate } from "../researchers/utils"

import { GroupedInsights } from "@/types/timeline"
import { SelectInsight } from "@/db/schema/insight"

const GROUP_INSIGHTS_BUCKETS = 10
const DATE_FORMAT = "yyyy-MM-dd"

/** Group our insights into date buckets */
export function GroupInsights(
  insights: SelectInsight[],
): [GroupedInsights, boolean, boolean] {
  // First we determine outliers using IQR
  const sortedInsights = _.sortBy(
    _.filter(insights, (index) => !!index.date),
    "date",
  )
  if (sortedInsights.length === 0) throw new TypeError("Invalid insights. Empty!")
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
  const dateIndices = _.map(_.range(GROUP_INSIGHTS_BUCKETS), (index) => {
    const di = add(lowerBoundDate, { days: bucketSize * index })
    return di
  })

  // Build the buckets
  // Includes putting lower outliers in first bucket; later outliers in last
  const buckets = _.groupBy(sortedInsights, (index) => {
    const insightDate = parseDate(index.date as string).date as Date
    const d = _.findLast(dateIndices, (di) => insightDate >= di)
    if (!d) return format(lowerBoundDate, DATE_FORMAT)
    return format(d, DATE_FORMAT)
  })
  // In case there are no events in one of the buckets
  _.each(dateIndices, (d) => {
    if (!buckets[format(d, DATE_FORMAT)]) {
      buckets[format(d, DATE_FORMAT)] = []
    }
  })

  return [buckets, lowerBound > 0, upperBound < sortedInsights.length - 1]
}
