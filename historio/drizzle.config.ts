import { defineConfig } from "drizzle-kit"
export default defineConfig({
  dialect: "postgresql",
  schema: "./models/*",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
})
