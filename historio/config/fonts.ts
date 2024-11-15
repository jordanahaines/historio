import {
  Fira_Code as FontMono,
  Inter as FontSans,
  Rosarivo,
  Outfit,
  Gaegu,
} from "next/font/google"

export const fontHandwriting = Gaegu({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-handwriting",
})

export const fontSans = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const fontSerif = Rosarivo({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
})

export const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
})
