import { fetchTimelineAndBooks } from "@/db/queries/timelines"
import TimelinePageTitle from "../components/timelineTitle"

export default async function Page({ params }: { params: { id: string } }) {
  const [timeline, timelineBooks, books] = await fetchTimelineAndBooks(
    params.id,
  )

  return (
    <div>
      <TimelinePageTitle timeline={timeline} />
    </div>
  )
}
