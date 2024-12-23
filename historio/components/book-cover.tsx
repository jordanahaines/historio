import Image from "next/image"

const BASE_URL =
  "https://tfxthzpmogvsnaaemzdc.supabase.co/storage/v1/object/public/covers/"

export default function BookCover({
  id,
  title,
  author,
  width = 120,
  height = 200,
  customClass = "",
}: {
  id: string
  title: string
  author: string
  width?: number
  height?: number
  customClass?: string
}) {
  return (
    <div className="bookCover">
      <Image
        width={width}
        height={height}
        src={`${BASE_URL}${id}.jpeg`}
        alt={`${title} by ${author}`}
        className={customClass}
      />
    </div>
  )
}
