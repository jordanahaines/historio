"use client"
import BookCover from "@/components/book-cover"
import EventDensityMap from "@/components/event-density-map"
import { BookSummary, TimelineSummary } from "@/db/queries/timelines"
import {
  Alert,
  Button,
  Link,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react"
import { FaPlusCircle } from "react-icons/fa"
import { FaArrowRight } from "react-icons/fa6"

export const cols = [
  { name: "books", title: "Books" },
  { name: "title", title: "Title" },
  { name: "minimap", title: "Timeline" },
  { name: "actions", title: "" },
]

const createButton = (
  <Button color="primary" className="" variant="solid">
    <FaPlusCircle />
    Create your own Timeline
  </Button>
)

// Render list of book covers
const renderCover = (b: BookSummary) => {
  if (!b.title && b.author && b.image_url) return ""
  return (
    <BookCover
      customClass="border-b-3 border-b-yellow-800 pb-1"
      width={60}
      height={90}
      title={b.title as string}
      author={b.author as string}
      src={b.image_url as string}
    />
  )
}

const renderMinimap = (dates: Date[]) => {
  return (
    <div className="flex items-center justify-center">
      <div className="library-minimap-container">
        <EventDensityMap showLine events={dates} />
      </div>
    </div>
  )
}

export default function TimelineListTable({
  timelines,
}: {
  timelines: TimelineSummary[]
}) {
  return (
    <div className="timelines-table">
      <div className="page-description">
        <div className="alert-container my-4 flex items-center">
          <Alert endContent={createButton} color="primary">
            <div className="text-center">
              Below are demo timelines to demonstrate Historio&apos;s feature
              set. Have fun exploring!
            </div>
          </Alert>
        </div>
      </div>
      <Table isStriped>
        <TableHeader columns={cols}>
          {cols.map((c) => (
            <TableColumn key={c.name}>{c.title}</TableColumn>
          ))}
        </TableHeader>
        <TableBody items={timelines}>
          {(item) => (
            <TableRow key={item.timeline.id}>
              <TableCell>
                <div className="book-covers-container flex flex-wrap justify-start">
                  {item.books.map((b) => renderCover(b))}
                </div>
              </TableCell>
              <TableCell>{item.timeline.title}</TableCell>
              <TableCell>{renderMinimap(item.eventDates)}</TableCell>
              <TableCell>
                <Button
                  variant="bordered"
                  color="primary"
                  as={Link}
                  href={`/timeline/${item.timeline.id}`}
                >
                  Open
                  <FaArrowRight />
                </Button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
