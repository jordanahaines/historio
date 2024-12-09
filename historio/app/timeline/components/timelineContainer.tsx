"use client"
import BookCover from "@/components/bookCover"
/** Container for a single timeline */
import { FrontendTimelineBook } from "@/types/timeline"
import { Button } from "@nextui-org/button"
import { Chip } from "@nextui-org/chip"
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/dropdown"
import { Tooltip } from "@nextui-org/tooltip"
import _ from "lodash"
import { useCallback } from "react"
import { FaCircleMinus, FaCirclePlus } from "react-icons/fa6"
import { IoColorPaletteOutline } from "react-icons/io5"
import { MdStickyNote2 } from "react-icons/md"
import { RiLightbulbFlashFill } from "react-icons/ri"
import {
  TimelineDispatchActionType,
  UpdateTimelineContext,
  useTimelineContext,
} from "../timelineContext"
import ActualTimeline from "./ActualTimeline"

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
  if (!bookContext) return

  // Only take title before colon to disregard subtitle
  let displayTitle = book.title.includes(":")
    ? book.title.split(":")[0]
    : book.title

  displayTitle += `(${book.default_start.getFullYear()} - ${book.default_end.getFullYear()})`

  // This has to be defined here to be picked up by tailwind
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
  const bg = tailwindTimelineColors[bookContext.currentColor]

  const renderColorMenuItem = (color: keyof typeof tailwindTimelineColors) => {
    return (
      <DropdownItem key={color}>
        <div className="flex justify-start items-center">
          <div
            className={`${tailwindTimelineColors[color]} rounded-full w-2 h-2 mr-4`}
          ></div>
          <span>{_.capitalize(color)}</span>
        </div>
      </DropdownItem>
    )
  }

  const updateColor = useCallback(
    (color: string) => {
      if (updateTimelineContext) {
        updateTimelineContext({
          type: TimelineDispatchActionType.updateBook,
          payload: { ...bookContext, currentColor: color },
        })
      }
    },
    [updateTimelineContext, bookContext.bookID],
  )

  const onZoom = useCallback(
    (newZoom: number) => {
      if (newZoom < MIN_ZOOM || newZoom > MAX_ZOOM) return
      if (updateTimelineContext) {
        updateTimelineContext({
          type: TimelineDispatchActionType.updateBook,
          payload: { ...bookContext, currentZoom: newZoom },
        })
      }
    },
    [bookContext.currentZoom, updateTimelineContext],
  )

  return (
    <>
      <div className="border-4 z-20 relative !border-b-8 bg-white mt-10 border-zinc-300 rounded-t-lg w-full min-h-40 flex">
        <BookCover
          id={book.book_id}
          title={book.title}
          author={book.author}
          customClass="rounded-tl"
        />
        <ActualTimeline bookDetails={book} />
      </div>
      <div className="w-full flex">
        <div
          className={`${bg} tab-author relative ml-8 text-white px-2 pb-2 w-1/5 flex justify-between items-center`}
        >
          <div className={`tab-diagonal z-0 left ${bg}`}></div>
          <div className="flex grow flex-col justify-center">
            <p className="font-title z-10 text-bold">{displayTitle}</p>
            <p className="text-xs z-10">by {book.author}</p>
          </div>
          <div className="w-1/5 flex justify-end">
            <Dropdown>
              <DropdownTrigger>
                <Button
                  className="!border-0 text-white !hover:bg-white hover:text-black"
                  variant="ghost"
                  isIconOnly
                >
                  <IoColorPaletteOutline size={30} />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                onAction={(k) => updateColor(k.toString())}
                aria-label="Timeline Colors"
              >
                {Object.keys(tailwindTimelineColors).map(renderColorMenuItem)}
              </DropdownMenu>
            </Dropdown>
          </div>
          <div className={`tab-diagonal z-0 ${bg} right`}></div>
        </div>
        <div className="w-1/2 flex justify-center"></div>
        <div className="bg-white border-4 border-zinc-300 !border-t-0 rounded-b-lg px-4 py-2 w-1/4 grow flex justify-between items-center">
          <div className="flex justify-start gap-2">
            <Tooltip content={`${book.insights.length} insights for this book`}>
              <Chip
                color="primary"
                size="sm"
                endContent={<RiLightbulbFlashFill size={18} />}
              >
                {book.insights.length}&nbsp;
              </Chip>
            </Tooltip>
            <Tooltip content={`0 notes for this book`}>
              <Chip
                color="default"
                size="sm"
                endContent={<MdStickyNote2 size={18} />}
              >
                0
              </Chip>
            </Tooltip>
          </div>
          <div className="flex justify-end items-center">
            {/* <Tooltip content="Sync all other timelines to match this one">
              <Button isIconOnly variant="ghost" className="border-0">
                <IoSyncCircle />
              </Button>
            </Tooltip>
            <Tooltip content="Lock all other timelines to stay in sync with this one">
              <Button isIconOnly variant="ghost" className="border-0">
                {bookDetails.locked ? <FaLock /> : <FaUnlock />}
              </Button>
            </Tooltip> */}
            <div className="vertical-rule bg-zinc-200 w-1 h-3/4"></div>
            <Tooltip content="Zoom in (show more events)">
              <Button
                onClick={() => onZoom(bookContext.currentZoom + 1)}
                isDisabled={bookContext.currentZoom >= MAX_ZOOM}
                isIconOnly
                variant="ghost"
                className="border-0"
              >
                <FaCirclePlus size={20} />
              </Button>
            </Tooltip>
            <Tooltip content="Zoom out (show fewer events)">
              <Button
                isDisabled={bookContext.currentZoom <= MIN_ZOOM}
                isIconOnly
                variant="ghost"
                className="border-0"
                onClick={() => onZoom(bookContext.currentZoom - 1)}
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
