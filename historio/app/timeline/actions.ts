"use server"

import { eq } from "drizzle-orm"

import { db } from "@/db"
import { SelectTimeline, timelines } from "@/db/schema/timeline"

// This file contains our server actions. To break apart oce there are too many functions in this file
export async function updateTimelineTitle(
  id: string,
  title: string,
): Promise<SelectTimeline> {
  const result = await db
    .update(timelines)
    .set({ title })
    .where(eq(timelines.id, id))
    .returning()
  return result[0]
}
