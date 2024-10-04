import { SelectBook } from "@/db/schema/book"
import { SelectInsight } from "@/db/schema/insight"

type Researcher = {
  key: string
  doResearch: (
    book: SelectBook,
    excludeExistingInsights: boolean,
  ) => Promise<SelectInsight[]>
}
export default Researcher
