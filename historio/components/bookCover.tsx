import { SelectBook } from "@/db/schema/book"
import Image from "next/image"

const BASE_URL =
  "https://tfxthzpmogvsnaaemzdc.supabase.co/storage/v1/object/public/"

export default function BookCover({ book }: { book: SelectBook }) {
  return (
    <div className="book-cover">
      <Image
        src={`${BASE_URL}${book.id}.jpeg`}
        alt={`${book.title} by ${book.author}`}
      />
    </div>
  )
}
