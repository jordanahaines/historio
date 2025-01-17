"use client"
import { Button } from "@nextui-org/button"
import { Input } from "@nextui-org/input"
import { FaCheckCircle } from "react-icons/fa"
import { FiEdit } from "react-icons/fi"
import { useState } from "react"

import { updateTimelineTitle } from "../actions"

import TimelineDisplaySettings from "./drawer-timeline-display-settings"

import { SelectTimeline } from "@/db/schema/timeline"
import { Link } from "@nextui-org/link"
import { FaArrowLeft } from "react-icons/fa6"

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

  const backText = timeline.is_demo ? "Demo Timelines" : "Timeline Library"

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="editable-title-container justify-beginning mb-4 flex items-center">
          <h1 className="timelineTitle text-6xl ${fontSerif.className">
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
        <TimelineDisplaySettings />
      </div>
      <div className="title-sub-button-container flex justify-end">
        <Button
          as={Link}
          size="sm"
          color="primary"
          variant="bordered"
          className="mb-3"
          href={
            timeline.is_demo ? "/library/demo-timelines" : "/library/timelines/"
          }
        >
          <FaArrowLeft />
          {backText}
        </Button>
      </div>
      <hr />
    </div>
  )
}
