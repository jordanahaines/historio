import { fetchTimelineAndBooks } from "@/db/queries/timelines"
import TimelinePageTitle from "../components/timeline-title"
import HistorioTimelineCoordinator from "../components/timeline-coordinator"

export default async function Page({ params }: { params: { id: string } }) {
  const [timeline, timelineBooks] = await fetchTimelineAndBooks(params.id)

  return (
    <div>
      <TimelinePageTitle timeline={timeline} />
      <HistorioTimelineCoordinator
        timeline={timeline}
        timelineBooks={timelineBooks}
      />
    </div>
  )
}
