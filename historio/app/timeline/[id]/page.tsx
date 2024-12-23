import { fetchTimelineAndBooks } from "@/db/queries/timelines"
import TimelinePageTitle from "../components/timeline-title"
import TimelineCoordinator from "../components/timeline-coordinator"

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = await params
  const [timeline, timelineBooks] = await fetchTimelineAndBooks(id)

  return (
    <div>
      <TimelinePageTitle timeline={timeline} />
      <TimelineCoordinator timeline={timeline} timelineBooks={timelineBooks} />
    </div>
  )
}
