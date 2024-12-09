import { fetchTimelineAndBooks } from "@/db/queries/timelines"
import TimelinePageTitle from "../components/TimelineTitle"
import HistorioTimelineCoordinator from "../components/TimelineCoordinator"

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = await params
  const [timeline, timelineBooks] = await fetchTimelineAndBooks(id)

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
