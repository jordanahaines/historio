"use client"
import { TimelineSummary } from "@/db/queries/timelines"
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
  { name: "title", title: "Timeline Name" },
  { name: "minimap", title: "Events" },
  { name: "actions", title: "" },
]

const createButton = (
  <Button color="primary" className="" variant="solid">
    <FaPlusCircle />
    Create your own Timeline
  </Button>
)

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
              set. Feel free to explore or&nbsp;
            </div>
          </Alert>
        </div>
      </div>
      <Table>
        <TableHeader columns={cols}>
          {cols.map((c) => (
            <TableColumn key={c.name}>{c.title}</TableColumn>
          ))}
        </TableHeader>
        <TableBody items={timelines}>
          {(item) => (
            <TableRow key={item.timeline.id}>
              <TableCell>Covers</TableCell>
              <TableCell>{item.timeline.title}</TableCell>
              <TableCell>Minimap</TableCell>
              <TableCell className="flex justify-end">
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
