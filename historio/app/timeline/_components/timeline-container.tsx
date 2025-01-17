"use client"
/** Container for a single timeline */
import { Button } from "@nextui-org/button"
import { Chip } from "@nextui-org/chip"
import { Tooltip } from "@nextui-org/tooltip"
import _ from "lodash"
import { useCallback } from "react"
import { FaCircleMinus, FaCirclePlus } from "react-icons/fa6"
import { MdStickyNote2 } from "react-icons/md"
import { RiLightbulbFlashFill } from "react-icons/ri"

import {
  TimelineDispatchActionType,
  useTimelineContext,
} from "../context-timeline"

import ActualTimeline from "./actual-timeline"

import { FrontendTimelineBook } from "@/types/timeline"
import BookCover from "@/components/book-cover"

const MIN_ZOOM = 1
const MAX_ZOOM = 4

export default function TimelineContainer({
  book,
}: {
  book: FrontendTimelineBook
}) {
  const { timelineContext, updateTimelineContext } = useTimelineContext()
  const bookContext = _.find(
    timelineContext.books,
    (b) => b.bookID === book.book_id,
  )
  // Another book is highlighted; adjust our opacity down
  const antiHighlighted =
    !bookContext.highlighted && _.some(timelineContext.books, "highlighted")

  // Only take title before colon to disregard subtitle
  const displayTitle = book.title.includes(":")
    ? book.title.split(":")[0]
    : book.title

  const byline =
    book.author +
    ` (${book.default_start.getFullYear()} - ${book.default_end.getFullYear()})`

  const tailwindTimelineColors = {
    red: "bg-red-500",
    amber: "bg-amber-500",
    lime: "bg-lime-500",
    sky: "bg-sky-500",
    fuchsia: "bg-fuchsia-500",
    pink: "bg-pink-500",
    rose: "bg-rose-500",
    teal: "bg-teal-500",
    emerald: "bg-emerald-500",
    indigo: "bg-indigo-500",
    yellow: "bg-yellow-500",
    violet: "bg-violet-500",
  }
  type TailwindTimelineColors = keyof typeof tailwindTimelineColors
  const tailwindBorderColors: { [key in TailwindTimelineColors]: string } = {
    red: "border-red-500",
    amber: "border-amber-500",
    lime: "border-lime-500",
    sky: "border-sky-500",
    fuchsia: "border-fuchsia-500",
    pink: "border-pink-500",
    rose: "border-rose-500",
    teal: "border-teal-500",
    emerald: "border-emerald-500",
    indigo: "border-indigo-500",
    yellow: "border-yellow-500",
    violet: "border-violet-500",
  }

  const handleZoom = useCallback(
    (newZoom: number) => {
      if (!bookContext) return
      if (newZoom < MIN_ZOOM || newZoom > MAX_ZOOM) return
      if (updateTimelineContext) {
        updateTimelineContext({
          type: TimelineDispatchActionType.updateBook,
          payload: { ...bookContext, currentZoom: newZoom },
        })
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [bookContext?.bookID, updateTimelineContext],
  )

  if (!bookContext) return
  let bg =
    tailwindTimelineColors[bookContext.currentColor as TailwindTimelineColors]
  if (antiHighlighted) bg = "bg-zinc-300"

  let border = "border-zinc-300"
  if (bookContext.highlighted) {
    border =
      tailwindBorderColors[bookContext.currentColor as TailwindTimelineColors]
  }

  return (
    <>
      <div
        className={`relative z-20 border-4 !border-b-8 ${border} mt-10 flex  min-h-40 w-full rounded-t-lg bg-white`}
      >
        <BookCover
          author={book.author}
          customClass="rounded-tl"
          id={book.book_id}
          src={book.image_url}
          title={book.title}
        />
        <ActualTimeline bookDetails={book} />
      </div>
      <div className="flex w-full">
        <div
          className={`${bg} tab-author relative ml-8 flex w-1/5 items-center justify-between px-2 pb-2 text-white`}
        >
          <div className={`tab-diagonal left z-0 ${bg}`} />
          <div className="flex grow flex-col justify-center">
            <p className="font-title text-bold z-10">{displayTitle}</p>
            <p className="z-10 text-xs">by {byline}</p>
          </div>
          <div className="flex w-1/5 justify-end" />
          <div className={`tab-diagonal z-0 ${bg} right`} />
        </div>
        <div className="flex w-1/2 justify-center" />
        <div className="flex w-1/4 grow items-center justify-between rounded-b-lg border-4 !border-t-0 border-zinc-300 bg-white px-4 py-2">
          <div className="flex justify-start gap-2">
            <Tooltip content={`${book.insights.length} insights for this book`}>
              <Chip
                color="primary"
                endContent={<RiLightbulbFlashFill size={18} />}
                size="sm"
              >
                {book.insights.length}&nbsp;
              </Chip>
            </Tooltip>
            <Tooltip content={`0 notes for this book`}>
              <Chip
                color="default"
                endContent={<MdStickyNote2 size={18} />}
                size="sm"
              >
                0
              </Chip>
            </Tooltip>
          </div>
          <div className="flex items-center justify-end">
            <div className="vertical-rule h-3/4 w-1 bg-zinc-200" />
            <Tooltip content="Zoom in (show more events)">
              <Button
                isIconOnly
                className="border-0"
                isDisabled={bookContext.currentZoom >= MAX_ZOOM}
                variant="ghost"
                onPress={() => handleZoom(bookContext.currentZoom + 1)}
              >
                <FaCirclePlus size={20} />
              </Button>
            </Tooltip>
            <Tooltip content="Zoom out (show fewer events)">
              <Button
                isIconOnly
                className="border-0"
                isDisabled={bookContext.currentZoom <= MIN_ZOOM}
                variant="ghost"
                onPress={() => handleZoom(bookContext.currentZoom - 1)}
              >
                <FaCircleMinus size={20} />
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>
    </>
  )
}
