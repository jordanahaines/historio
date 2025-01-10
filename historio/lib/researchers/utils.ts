import { parse } from "date-fns/parse"
import _ from "lodash"

import { PromptGeneratorFunction } from "./research-coordinator"

import { SelectBook } from "@/db/schema/book"
import { SelectInsight } from "@/db/schema/insight"

export type ParsedInsightDate = {
  date: Date | undefined
  year: number | undefined
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
  const isValidDate = (d: Date) => d instanceof Date && !Number.isNaN(d)

  // Remove commas, which sometimes appear in years
  dateString = dateString.replaceAll(",", "")
  dateString = dateString.replaceAll("-", "/").trim()
  let dateObject: Date | undefined = undefined
  for (const format of DATE_FORMATS) {
    dateObject = parse(dateString, format, referenceDate || new Date())
    if (dateObject && isValidDate(dateObject)) {
      // If year is BC, we just return year
      if (dateObject.getFullYear() < 0)
        return { date: undefined, year: dateObject.getFullYear() }
      return { date: dateObject, year: dateObject.getFullYear() }
    }
  }
  return { date: undefined, year: undefined }
}

export const generateGenericPrompt: PromptGeneratorFunction = (
  book: SelectBook,
  existingInsights?: SelectInsight[],
) => {
  let message = `Title: ${book.title}\nAuthor: ${book.author}`
  if (existingInsights?.length) {
    message += "\n\n Do not include these events in your results:"
    for (const e of _.map(existingInsights, "name")) message += `\n- ${e}`
  }
  return message
}
