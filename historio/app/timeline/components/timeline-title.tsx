"use client"
import { Button } from "@nextui-org/button"
import { Input } from "@nextui-org/input"
import { FaCheckCircle } from "react-icons/fa"
import { FiEdit } from "react-icons/fi"
import { useState } from "react"

import { updateTimelineTitle } from "../actions"

import TimelineDisplaySettings from "./drawer-timeline-display-settings"

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
      <div className="flex justify-between items-center">
        <div className="editable-title-container flex justify-beginning items-center mb-4">
          <h1 className="timelineTitle text-6xl ${fontSerif.className">
            Timelines <span className="opacity-40">\\</span>
          </h1>
          {!editing && (
            <>
              <p className="text-3xl mr-6">{title}</p>
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
        <TimelineDisplaySettings />
      </div>
      <hr />
    </div>
  )
}
