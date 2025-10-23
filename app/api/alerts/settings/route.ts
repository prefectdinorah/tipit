import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { requireAuth } from "@/lib/auth-middleware"
import { z } from "zod"

const alertSettingsSchema = z.object({
  // Text settings
  fontSize: z.number().min(24).max(72).optional(),
  fontFamily: z.string().optional(),
  textColor: z.string().optional(),
  textAnimation: z.enum(["fade", "slide", "bounce", "zoom"]).optional(),
  
  // Display settings
  duration: z.number().min(3).max(30).optional(),
  position: z.enum(["top", "center", "bottom"]).optional(),
  minAmount: z.number().min(0).optional(),
  
  // Image settings
  imageEnabled: z.boolean().optional(),
  imageUrl: z.string().nullable().optional(),
  imageSize: z.number().min(50).max(500).optional(),
  
  // Sound settings
  soundEnabled: z.boolean().optional(),
  soundUrl: z.string().nullable().optional(),
  soundVolume: z.number().min(0).max(100).optional(),
  
  // TTS settings
  ttsEnabled: z.boolean().optional(),
  ttsVoice: z.string().optional(),
  ttsSpeed: z.number().min(0.5).max(2.0).optional(),
  ttsVolume: z.number().min(0).max(100).optional(),
})

// GET - получить настройки alerts
export const GET = requireAuth(async (request: NextRequest, user: any) => {
  try {
    console.log("=== GET ALERT SETTINGS START ===")
    console.log("User ID:", user.id)

    let settings = await prisma.alertSettings.findUnique({
      where: { userId: user.id },
    })

    // Если настроек нет - создаем с дефолтными значениями
    if (!settings) {
      console.log("No settings found, creating default...")
      settings = await prisma.alertSettings.create({
        data: {
          userId: user.id,
          // Дефолтные значения из schema.prisma
        },
      })
    }

    console.log("Settings found:", !!settings)
    console.log("Alert Token:", settings.alertToken)
    console.log("=== GET ALERT SETTINGS END ===")

    return NextResponse.json({
      success: true,
      settings,
    })
  } catch (error) {
    console.error("=== GET ALERT SETTINGS ERROR ===")
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
})

// POST - обновить настройки alerts
export const POST = requireAuth(async (request: NextRequest, user: any) => {
  try {
    console.log("=== UPDATE ALERT SETTINGS START ===")
    const body = await request.json()
    console.log("Request body:", body)

    // Валидация
    const validatedData = alertSettingsSchema.parse(body)

    // Проверяем существуют ли настройки
    let settings = await prisma.alertSettings.findUnique({
      where: { userId: user.id },
    })

    if (!settings) {
      // Создаем новые настройки
      settings = await prisma.alertSettings.create({
        data: {
          userId: user.id,
          ...validatedData,
        },
      })
      console.log("Settings created")
    } else {
      // Обновляем существующие
      settings = await prisma.alertSettings.update({
        where: { userId: user.id },
        data: validatedData,
      })
      console.log("Settings updated")
    }

    console.log("=== UPDATE ALERT SETTINGS END ===")

    return NextResponse.json({
      success: true,
      settings,
      message: "Settings updated successfully",
    })
  } catch (error) {
    console.error("=== UPDATE ALERT SETTINGS ERROR ===")
    console.error("Error:", error)

    if (error instanceof z.ZodError) {
      console.error("Validation errors:", error.errors)
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
})
