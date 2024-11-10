import { fetchTimelineAndBooks } from "@/db/queries/timelines"
import TimelinePageTitle from "../components/timelineTitle"
import HistorioTimelineCoordinator from "../components/timelineCoordinator"

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
