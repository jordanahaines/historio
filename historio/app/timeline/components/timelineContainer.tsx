"use client"
import BookCover from "@/components/bookCover"
/** Container for a single timeline */
import { useTimelineContext } from "../timelineContext"

export default function TimelineContainer({ bookID }: { bookID: string }) {
  const { timelineContext } = useTimelineContext()
  const bookDetails = timelineContext[bookID]
  return (
    <>
      <div className="border-4 mt-10 border-zinc-800 rounded-t-lg w-full min-h-40 flex">
        <BookCover
          id={bookDetails.book_id}
          title={bookDetails.title}
          author={bookDetails.author}
          customClass="rounded-tl"
        />
      </div>
      <div className="w-full flex">
        <div className="bg-zinc-800 px-4 py-2 w-1/3 text-white">
          <p>{bookDetails.title}</p>
          <p className="text-xs">by {bookDetails.author}</p>
        </div>
      </div>
    </>
  )
}
