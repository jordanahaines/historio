import { config } from "dotenv"
import { defineConfig } from "drizzle-kit"

config({ path: "local.env" })

export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema/*",
  out: "./db/migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
})
