"use client"
import BookCover from "@/components/bookCover"
/** Container for a single timeline */
import { useTimelineContext } from "../timelineContext"
import { IoSyncCircle } from "react-icons/io5"
import { FaUnlock, FaLock } from "react-icons/fa"
import { FaCirclePlus, FaCircleMinus } from "react-icons/fa6"
import { Button } from "@nextui-org/button"
import { Tooltip } from "@nextui-org/tooltip"
import ActualTimeline from "./actual-timeline"

export default function TimelineContainer({ bookID }: { bookID: string }) {
  const { timelineContext } = useTimelineContext()
  const bookDetails = timelineContext[bookID]

  // Only take title before colon to disregard subtitle
  const displayTitle = bookDetails.title.includes(":")
    ? bookDetails.title.split(":")[0]
    : bookDetails.title

  return (
    <>
      <div className="border-4 mt-10 border-zinc-800 rounded-t-lg w-full min-h-40 flex">
        <BookCover
          id={bookDetails.book_id}
          title={bookDetails.title}
          author={bookDetails.author}
          customClass="rounded-tl"
        />
        <ActualTimeline bookDetails={bookDetails} />
      </div>
      <div className="w-full flex">
        <div className="border-2 border-top-0 bg-white border-zinc-800 px-4 py-2 w-1/3 flex flex-col justify-center">
          <p className="font-title">{displayTitle}</p>
          <p className="text-xs">by {bookDetails.author}</p>
        </div>
        <div className="border-2 border-top-0 bg-white border-zinc-800 px-4 py-2 w-1/3 flex justify-center">
          <p>{bookDetails.insights.length} Insights</p>
        </div>
        <div className="border-2 border-top-0 bg-white border-zinc-800 px-4 py-2 w-1/3 flex justify-center">
          <Tooltip content="Sync all other timelines to match this one">
            <Button isIconOnly variant="faded">
              <IoSyncCircle />
            </Button>
          </Tooltip>
          <Tooltip content="Lock all other timelines to stay in sync with this one">
            <Button isIconOnly variant="faded">
              {bookDetails.locked ? <FaLock /> : <FaUnlock />}
            </Button>
          </Tooltip>
          <div className="vertical-rule"></div>
          <Tooltip content="Zoom in">
            <Button isIconOnly variant="faded">
              <FaCirclePlus />
            </Button>
          </Tooltip>
          <Tooltip content="Zoom out">
            <Button isDisabled isIconOnly variant="faded">
              <FaCircleMinus />
            </Button>
          </Tooltip>
        </div>
      </div>
    </>
  )
}
