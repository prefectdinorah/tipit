import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { requireAuth } from "@/lib/auth-middleware"
import { z } from "zod"

const alertSettingsSchema = z.object({
  // General settings
  minAmount: z.number().min(0).optional(),
  messageTemplate: z.string().optional(),
  showDonorName: z.boolean().optional(),
  
  // Visual settings
  animationType: z.enum(["fade", "slide", "bounce", "zoom"]).optional(),
  duration: z.number().min(3).max(30).optional(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  transparentBackground: z.boolean().optional(),
  
  // Header settings
  headerFontSize: z.number().min(12).max(72).optional(),
  headerFontFamily: z.string().optional(),
  headerPositionX: z.number().min(0).max(100).optional(),
  headerPositionY: z.number().min(0).max(100).optional(),
  headerWidth: z.number().min(50).max(1000).optional(),
  headerHeight: z.number().min(20).max(200).optional(),
  
  // Message settings
  messageFontSize: z.number().min(12).max(72).optional(),
  messageFontFamily: z.string().optional(),
  messagePositionX: z.number().min(0).max(100).optional(),
  messagePositionY: z.number().min(0).max(100).optional(),
  messageWidth: z.number().min(50).max(1000).optional(),
  messageHeight: z.number().min(20).max(200).optional(),
  
  // Image settings
  enableImage: z.boolean().optional(),
  imageUrl: z.string().nullable().optional(),
  imageWidth: z.number().min(20).max(500).optional(),
  imageHeight: z.number().min(20).max(500).optional(),
  imagePositionX: z.number().min(0).max(100).optional(),
  imagePositionY: z.number().min(0).max(100).optional(),
  imageAsBackground: z.boolean().optional(),
  
  // Sound settings
  enableSound: z.boolean().optional(),
  soundUrl: z.string().nullable().optional(),
  soundVolume: z.number().min(0).max(100).optional(),
  
  // TTS settings
  enableTTS: z.boolean().optional(),
  ttsVoice: z.enum(["male", "female", "robot"]).optional(),
  ttsSpeed: z.number().min(0.5).max(2.0).optional(),
  ttsVolume: z.number().min(0).max(100).optional(),
  readDonorName: z.boolean().optional(),
  readAmount: z.boolean().optional(),
  readMessage: z.boolean().optional(),
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

    // Маппим snake_case из БД в camelCase для фронтенда
    return NextResponse.json({
      success: true,
      minAmount: settings.minAmount,
      messageTemplate: settings.messageTemplate,
      showDonorName: settings.showDonorName,
      animationType: settings.animationType,
      duration: settings.duration,
      backgroundColor: settings.backgroundColor,
      textColor: settings.textColor,
      transparentBackground: settings.transparentBackground,
      headerFontSize: settings.headerFontSize,
      headerFontFamily: settings.headerFontFamily,
      headerPositionX: settings.headerPositionX,
      headerPositionY: settings.headerPositionY,
      headerWidth: settings.headerWidth,
      headerHeight: settings.headerHeight,
      messageFontSize: settings.messageFontSize,
      messageFontFamily: settings.messageFontFamily,
      messagePositionX: settings.messagePositionX,
      messagePositionY: settings.messagePositionY,
      messageWidth: settings.messageWidth,
      messageHeight: settings.messageHeight,
      enableImage: settings.enableImage,
      imageUrl: settings.imageUrl,
      imageWidth: settings.imageWidth,
      imageHeight: settings.imageHeight,
      imagePositionX: settings.imagePositionX,
      imagePositionY: settings.imagePositionY,
      imageAsBackground: settings.imageAsBackground,
      enableSound: settings.enableSound,
      soundUrl: settings.soundUrl,
      soundVolume: settings.soundVolume,
      enableTTS: settings.enableTTS,
      ttsVoice: settings.ttsVoice,
      ttsSpeed: settings.ttsSpeed,
      ttsVolume: settings.ttsVolume,
      readDonorName: settings.readDonorName,
      readAmount: settings.readAmount,
      readMessage: settings.readMessage,
      alertToken: settings.alertToken,
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

    // Маппим camelCase в snake_case для Prisma
    const prismaData: any = {}
    
    if (validatedData.minAmount !== undefined) prismaData.minAmount = validatedData.minAmount
    if (validatedData.messageTemplate !== undefined) prismaData.messageTemplate = validatedData.messageTemplate
    if (validatedData.showDonorName !== undefined) prismaData.showDonorName = validatedData.showDonorName
    if (validatedData.animationType !== undefined) prismaData.animationType = validatedData.animationType
    if (validatedData.duration !== undefined) prismaData.duration = validatedData.duration
    if (validatedData.backgroundColor !== undefined) prismaData.backgroundColor = validatedData.backgroundColor
    if (validatedData.textColor !== undefined) prismaData.textColor = validatedData.textColor
    if (validatedData.transparentBackground !== undefined) prismaData.transparentBackground = validatedData.transparentBackground
    if (validatedData.headerFontSize !== undefined) prismaData.headerFontSize = validatedData.headerFontSize
    if (validatedData.headerFontFamily !== undefined) prismaData.headerFontFamily = validatedData.headerFontFamily
    if (validatedData.headerPositionX !== undefined) prismaData.headerPositionX = validatedData.headerPositionX
    if (validatedData.headerPositionY !== undefined) prismaData.headerPositionY = validatedData.headerPositionY
    if (validatedData.headerWidth !== undefined) prismaData.headerWidth = validatedData.headerWidth
    if (validatedData.headerHeight !== undefined) prismaData.headerHeight = validatedData.headerHeight
    if (validatedData.messageFontSize !== undefined) prismaData.messageFontSize = validatedData.messageFontSize
    if (validatedData.messageFontFamily !== undefined) prismaData.messageFontFamily = validatedData.messageFontFamily
    if (validatedData.messagePositionX !== undefined) prismaData.messagePositionX = validatedData.messagePositionX
    if (validatedData.messagePositionY !== undefined) prismaData.messagePositionY = validatedData.messagePositionY
    if (validatedData.messageWidth !== undefined) prismaData.messageWidth = validatedData.messageWidth
    if (validatedData.messageHeight !== undefined) prismaData.messageHeight = validatedData.messageHeight
    if (validatedData.enableImage !== undefined) prismaData.enableImage = validatedData.enableImage
    if (validatedData.imageUrl !== undefined) prismaData.imageUrl = validatedData.imageUrl
    if (validatedData.imageWidth !== undefined) prismaData.imageWidth = validatedData.imageWidth
    if (validatedData.imageHeight !== undefined) prismaData.imageHeight = validatedData.imageHeight
    if (validatedData.imagePositionX !== undefined) prismaData.imagePositionX = validatedData.imagePositionX
    if (validatedData.imagePositionY !== undefined) prismaData.imagePositionY = validatedData.imagePositionY
    if (validatedData.imageAsBackground !== undefined) prismaData.imageAsBackground = validatedData.imageAsBackground
    if (validatedData.enableSound !== undefined) prismaData.enableSound = validatedData.enableSound
    if (validatedData.soundUrl !== undefined) prismaData.soundUrl = validatedData.soundUrl
    if (validatedData.soundVolume !== undefined) prismaData.soundVolume = validatedData.soundVolume
    if (validatedData.enableTTS !== undefined) prismaData.enableTTS = validatedData.enableTTS
    if (validatedData.ttsVoice !== undefined) prismaData.ttsVoice = validatedData.ttsVoice
    if (validatedData.ttsSpeed !== undefined) prismaData.ttsSpeed = validatedData.ttsSpeed
    if (validatedData.ttsVolume !== undefined) prismaData.ttsVolume = validatedData.ttsVolume
    if (validatedData.readDonorName !== undefined) prismaData.readDonorName = validatedData.readDonorName
    if (validatedData.readAmount !== undefined) prismaData.readAmount = validatedData.readAmount
    if (validatedData.readMessage !== undefined) prismaData.readMessage = validatedData.readMessage

    // Используем upsert для создания или обновления
    const settings = await prisma.alertSettings.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        ...prismaData,
      },
      update: prismaData,
    })

    console.log("Settings saved successfully")
    console.log("=== UPDATE ALERT SETTINGS END ===")

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      alertToken: settings.alertToken,
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
