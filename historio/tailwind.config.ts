import type { Config } from "tailwindcss"

import { nextui } from "@nextui-org/theme"

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}", // Note the addition of the `app` directory.
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        light: {
          colors: {
            primary: {
              DEFAULT: "#4A558C",
              foreground: "#fff",
            },
            secondary: {
              DEFAULT: "#4D770A",
              foreground: "#fff",
            },
            danger: {
              DEFAULT: "#961210",
              foreground: "#fff",
            },
            focus: "#7B89C5",
          },
        },
      },
    }),
  ],
}
export default config
