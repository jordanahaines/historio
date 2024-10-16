import { parse } from "date-fns/parse"

export type ParsedInsightDate = {
  date: Date | null
  year: number | null
}

const DATE_FORMATS = ["MM/dd/yyyy", "yyyy", "yyyy G"]

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
