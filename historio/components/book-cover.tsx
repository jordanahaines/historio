import Image from "next/image"

const BASE_URL =
  "https://tfxthzpmogvsnaaemzdc.supabase.co/storage/v1/object/public/covers/"

export default function BookCover({
  id,
  src,
  title,
  author,
  width = 120,
  height = 200,
  customClass = "",
}: {
  id?: string
  src?: string
  title: string
  author: string
  width?: number
  height?: number
  customClass?: string
}) {
  const source = src || `${BASE_URL}${id}.jpeg`
  return (
    <div className="book-cover">
      <Image
        alt={`${title} by ${author}`}
        className={customClass}
        height={height}
        src={source}
        width={width}
      />
    </div>
  )
}
