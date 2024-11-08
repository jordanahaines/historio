import { SelectBook } from "@/db/schema/book"
import { SelectTimeline, SelectTimelineBook } from "@/db/schema/timeline"

export default function TimelineContainer({
  timeline,
  timelineBooks,
  books,
}: {
  timeline: SelectTimeline
  timelineBooks: SelectTimelineBook[]
  books: SelectBook[]
}) {
  return <div className="timeline-container"></div>
}
