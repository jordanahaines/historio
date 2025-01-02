export const TAILWIND_BG_COLORS = {
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
export const TAILWIND_BORDER_COLORS = {
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

export type TailwindColor = keyof typeof TAILWIND_BG_COLORS &
  keyof typeof TAILWIND_BORDER_COLORS
