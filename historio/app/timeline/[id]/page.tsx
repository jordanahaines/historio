import TimelineCoordinator from "../_components/timeline-coordinator"

import { fetchTimelineAndBooks } from "@/db/queries/timelines"

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = await params
  const [timeline, timelineBooks] = await fetchTimelineAndBooks(id)

  return (
    <div>
      <TimelineCoordinator timeline={timeline} timelineBooks={timelineBooks} />
    </div>
  )
}
