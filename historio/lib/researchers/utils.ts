import { parse } from "date-fns/parse"
import { PromptGeneratorFunction } from "./researchCoordinator"
import { SelectBook } from "@/db/schema/book"
import { SelectInsight } from "@/db/schema/insight"
import _ from "lodash"

export type ParsedInsightDate = {
  date: Date | null
  year: number | null
}

// Note that hyphens are replaced with / in dates, so we don't need any formats with hyphens
const DATE_FORMATS = [
  "MM/dd/yyyy",
  "yyyy/MM/dd",
  "yyyy/M/d",
  "MM/yyyy",
  "yyyy",
  "yyyy G",
  "MM/dd/yyyy G",
  "MM/yyyy G",
  "MMM yyyy G",
  "MMMM yyyy G",
]

/**
 * Parses a date string in multiple formats.
 *
 * @param dateString The date string to parse.
 * @returns The parsed Date object, or the year or null. Note that year (from date or actual year val) will be
 *  negative if the date is actually BC.
 */
export function parseDate(
  dateString: string,
  referenceDate: Date | undefined = undefined,
): ParsedInsightDate {
  // Helper
  const isValidDate = (d: Date) => d instanceof Date && !isNaN(d)

  // Remove commas, which sometimes appear in years
  dateString = dateString.replace(/,/g, "")
  dateString = dateString.replaceAll("-", "/").trim()
  let dateObj: Date | undefined = undefined
  for (const format of DATE_FORMATS) {
    dateObj = parse(dateString, format, new Date())
    if (dateObj && isValidDate(dateObj)) {
      // If year is BC, we just return year
      if (dateObj.getFullYear() < 0)
        return { date: null, year: dateObj.getFullYear() }
      return { date: dateObj, year: dateObj.getFullYear() }
    }
  }
  return { date: null, year: null }
}

export const generateGenericPrompt: PromptGeneratorFunction = (
  book: SelectBook,
  existingInsights?: SelectInsight[],
) => {
  let msg = `Title: ${book.title}\nAuthor: ${book.author}`
  if (existingInsights?.length) {
    msg += "\n\n Do not include these events in your results:"
    _.map(existingInsights, "name").forEach((e) => (msg += `\n- ${e}`))
  }
  return msg
}
