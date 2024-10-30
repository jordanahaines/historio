import {
  Fira_Code as FontMono,
  Inter as FontSans,
  Rosarivo,
  Outfit,
} from "next/font/google"

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
