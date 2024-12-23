"use client"
import { MdOutlineDisplaySettings } from "react-icons/md"
import { SelectTimeline } from "@/db/schema/timeline"
import { Button } from "@nextui-org/button"
import { Input } from "@nextui-org/input"
import { FaCheckCircle } from "react-icons/fa"
import { FiEdit } from "react-icons/fi"

import { useState } from "react"
import { updateTimelineTitle } from "../actions"

export type TimelinePageTitleProps = {
  timeline: SelectTimeline
}
export default function TimelinePageTitle({
  timeline,
}: TimelinePageTitleProps) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(timeline.title || "")
  const [saving, setSaving] = useState(false)

  // Save handler
  const updateTitle = async () => {
    setSaving(true)
    await updateTimelineTitle(timeline.id, title)
    setSaving(false)
    setEditing(false)
  }

  return (
    <div>
      <div className="flex justify-between items-center">
        <div className="editable-title-container flex justify-beginning items-center mb-4">
          <h1 className="timelineTitle text-6xl ${fontSerif.className">
            Timelines <span className="opacity-40">\\</span>
          </h1>
          {!editing && (
            <>
              <p className="text-3xl mr-6">{title}</p>
              <Button
                isIconOnly
                variant="faded"
                onClick={() => setEditing(true)}
              >
                <FiEdit />
              </Button>
            </>
          )}
          {editing && (
            <>
              <Input
                defaultValue={timeline.title ?? "New timeline..."}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Button
                onClick={updateTitle}
                isLoading={saving}
                className="ml-2"
                isIconOnly
                variant="faded"
                color="success"
              >
                <FaCheckCircle />
              </Button>
            </>
          )}
        </div>
        <Button color="primary" endContent={<MdOutlineDisplaySettings />}>
          Timeline Display Settings
        </Button>
      </div>
      <hr />
    </div>
  )
}
