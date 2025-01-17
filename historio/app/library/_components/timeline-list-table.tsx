import { SelectTimeline } from "@/db/schema/timeline"
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableColumnProps,
  TableHeader,
  TableRow,
} from "@nextui-org/react"
import React from "react"

export const cols = [
  { name: "covers" },
  { name: "title" },
  { name: "minimap" },
  { name: "actions" },
]

export default function TimelineListTable({
  timelines,
}: {
  timelines: SelectTimeline[]
}) {
  // const renderCovers =

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
            <TableRow>
              <TableCell>Covers</TableCell>
              <TableCell>{item.title}</TableCell>
              <TableCell>Minimap</TableCell>
              <TableCell>
                <Button href={`timeline/${item.id}`}>Open</Button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
