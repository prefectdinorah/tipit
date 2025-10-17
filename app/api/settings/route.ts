import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/db"
import { requireAuth } from "@/lib/auth-middleware"

const settingsSchema = z.object({
  donationGoal: z.number().optional(),
  donationGoalDescription: z.string().optional(),
  minDonationAmount: z.number().positive().optional(),
  trackRequestMinimum: z.number().positive().optional(),
  alertVolume: z.number().min(0).max(100).optional(),
  alertDuration: z.number().positive().optional(),
  soundAlertEnabled: z.boolean().optional(),
  visualAlertEnabled: z.boolean().optional(),
  ttsEnabled: z.boolean().optional(),
  theme: z.string().optional(),
  primaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  currency: z.string().optional(),
  language: z.string().optional(),
})

export const GET = requireAuth(async (request: NextRequest, user: any) => {
  try {
    console.log("=== GET SETTINGS START ===")
    console.log("User ID:", user.id)
    console.log("User UUID:", user.uuid)

    const settings = await prisma.streamerSettings.findUnique({
      where: { userId: user.id },
    })

    console.log("Settings found:", !!settings)

    if (!settings) {
      console.log("Creating default settings for user:", user.id)

      // Создаём настройки по умолчанию если их нет
      const newSettings = await prisma.streamerSettings.create({
        data: {
          userId: user.id,
        },
      })

      console.log("Default settings created")
      return NextResponse.json({ settings: newSettings })
    }

    console.log("=== GET SETTINGS END ===")
    return NextResponse.json({ settings })
  } catch (error) {
    console.error("=== GET SETTINGS ERROR ===")
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})

export const PATCH = requireAuth(async (request: NextRequest, user: any) => {
  try {
    console.log("=== PATCH SETTINGS START ===")
    const body = await request.json()
    console.log("Request body:", body)
    console.log("User ID:", user.id)

    const validatedData = settingsSchema.parse(body)
    console.log("Validated data:", validatedData)

    const settings = await prisma.streamerSettings.update({
      where: { userId: user.id },
      data: validatedData,
    })

    console.log("Settings updated successfully")
    console.log("=== PATCH SETTINGS END ===")

    return NextResponse.json({
      success: true,
      settings,
    })
  } catch (error) {
    console.error("=== PATCH SETTINGS ERROR ===")
    console.error("Error:", error)

    if (error instanceof z.ZodError) {
      console.error("Validation errors:", error.errors)
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})
