"use client"
import { TimelineSummary } from "@/db/queries/timelines"
import {
  Button,
  Link,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react"

export const cols = [
  { name: "covers" },
  { name: "title" },
  { name: "minimap" },
  { name: "actions" },
]

export default function TimelineListTable({
  timelines,
}: {
  timelines: TimelineSummary[]
}) {
  return (
    <div className="timelines-table">
      <Table>
        <TableHeader columns={cols}>
          {cols.map((c) => (
            <TableColumn key={c.name}>{c.name}</TableColumn>
          ))}
        </TableHeader>
        <TableBody items={timelines}>
          {(item) => (
            <TableRow key={item.timeline.id}>
              <TableCell>Covers</TableCell>
              <TableCell>{item.timeline.title}</TableCell>
              <TableCell>Minimap</TableCell>
              <TableCell>
                <Button as={Link} href={`/timeline/${item.timeline.id}`}>
                  Open
                </Button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
