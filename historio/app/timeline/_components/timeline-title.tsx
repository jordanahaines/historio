"use client"
import { Button } from "@nextui-org/button"
import { Input } from "@nextui-org/input"
import { useState } from "react"
import { FaCheckCircle } from "react-icons/fa"
import { FiEdit } from "react-icons/fi"

import { updateTimelineTitle } from "../actions"

import { SelectTimeline } from "@/db/schema/timeline"

export type TimelinePageTitleProps = {
  timeline: SelectTimeline
  editable?: boolean
}
export default function TimelinePageTitle({
  timeline,
  editable = false,
}: TimelinePageTitleProps) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(timeline.title || "")
  const [saving, setSaving] = useState(false)

  // Save handler to update title
  const updateTitle = async () => {
    setSaving(true)
    await updateTimelineTitle(timeline.id, title)
    setSaving(false)
    setEditing(false)
  }

  return (
    <div>
      <div className="editable-title-container justify-beginning mb-4 flex items-center">
        <h1 className="timelineTitle mr-4 text-6xl ${fontSerif.className">
          Timelines <span className="opacity-40">\\</span>
        </h1>
        {!editing && (
          <>
            <p className="mr-6 text-3xl">{title}</p>
            {editable && (
              <Button
                isIconOnly
                variant="faded"
                onPress={() => setEditing(true)}
              >
                <FiEdit />
              </Button>
            )}
          </>
        )}
        {editing && (
          <>
            <Input
              defaultValue={timeline.title ?? "New timeline..."}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Button
              isIconOnly
              className="ml-2"
              color="success"
              isLoading={saving}
              variant="faded"
              onPress={updateTitle}
            >
              <FaCheckCircle />
            </Button>
          </>
        )}
      </div>
      <div className="description my-3">{timeline.description}</div>
      <hr />
    </div>
  )
}
