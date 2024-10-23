import { SelectBook } from "@/db/schema/book"
import { SelectInsight } from "@/db/schema/insight"
import { InsertResearcherRun } from "@/db/schema/research"

// Signature of our researcher function. Most of these are implemented in lib/researchers
type Researcher = (
  book: SelectBook,
  debug?: boolean,
) => Promise<[InsertResearcherRun, SelectInsight[], book?: SelectBook]>

export type SignificantEventsReturn = {
  start_date: string
  end_date: string
  insights: {
    date: string
    name: string
    description: string
    wikipedia_link: string
  }[]
}

export type MinorEventsReturn = {
  insights: {
    date: string
    name: string
    description?: string
  }[]
}

export default Researcher
