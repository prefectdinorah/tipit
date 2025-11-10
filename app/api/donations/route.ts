import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/db"
import connectToDatabase from "@/lib/mongodb"
import Donation from "@/lib/models/donation"
import { generateDonationId } from "@/lib/auth-utils"
import { createLog } from "@/lib/logger"
import { requireAuth } from "@/lib/auth-middleware"
import { AlertEventManager } from "@/lib/alert-event-manager"
import { extractYouTubeId, validateYouTubeVideo } from "@/lib/youtube"

const donationSchema = z.object({
  streamerUsername: z.string(),
  donorName: z.string().min(1).max(100),
  amount: z.number().positive(),
  currency: z.string().default("USD"),
  message: z.string().max(500).optional(),
  youtubeUrl: z.string().url().optional(),
  isAnonymous: z.boolean().default(false),
})

// POST /api/donations - Создание доната (публичный endpoint)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = donationSchema.parse(body)

    // Находим стримера
    const streamer = await prisma.user.findUnique({
      where: { username: validatedData.streamerUsername },
      include: { settings: true },
    })

    if (!streamer || !streamer.isActive) {
      return NextResponse.json({ error: "Streamer not found" }, { status: 404 })
    }

    // Проверяем минимальную сумму
    const minAmount = streamer.settings?.minDonationAmount || 1
    if (validatedData.amount < Number(minAmount)) {
      return NextResponse.json(
        { error: `Minimum donation amount is ${minAmount} ${validatedData.currency}` },
        { status: 400 },
      )
    }

    // Если есть YouTube URL, добавляем в очередь музыки
    let youtubeVideoInfo = null
    if (validatedData.youtubeUrl) {
      const trackMinAmount = streamer.settings?.trackRequestMinimum || 20
      if (validatedData.amount < Number(trackMinAmount)) {
        return NextResponse.json(
          { error: `Minimum amount for track request is ${trackMinAmount} ${validatedData.currency}` },
          { status: 400 },
        )
      }

      const youtubeId = extractYouTubeId(validatedData.youtubeUrl)
      if (!youtubeId) {
        return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 })
      }

      // Получить блэклист
      const blacklist = await prisma.musicBlacklist.findMany({
        where: { userId: streamer.id },
      })

      const blacklistedVideos = blacklist.filter((item) => item.youtubeId).map((item) => item.youtubeId!)
      const blacklistedChannels = blacklist.filter((item) => item.channelId).map((item) => item.channelId!)

      // Валидация YouTube видео
      const validation = await validateYouTubeVideo(youtubeId, {
        minViews: 5000,
        maxDuration: 600,
        blacklistedVideos,
        blacklistedChannels,
      })

      if (!validation.isValid) {
        return NextResponse.json({ error: validation.error || "YouTube video validation failed" }, { status: 400 })
      }

      youtubeVideoInfo = validation.videoInfo

      // Получить максимальный orderIndex
      const maxOrder = await prisma.musicQueue.findFirst({
        where: {
          userId: streamer.id,
          status: "pending",
        },
        orderBy: {
          orderIndex: "desc",
        },
      })

      const newOrderIndex = (maxOrder?.orderIndex || 0) + 1

      // Добавить в очередь
      await prisma.musicQueue.create({
        data: {
          userId: streamer.id,
          donorName: validatedData.isAnonymous ? "Anonymous" : validatedData.donorName,
          youtubeUrl: validatedData.youtubeUrl,
          youtubeId,
          title: youtubeVideoInfo?.title,
          duration: youtubeVideoInfo?.duration,
          thumbnailUrl: youtubeVideoInfo?.thumbnailUrl,
          donationAmount: validatedData.amount,
          orderIndex: newOrderIndex,
        },
      })
    }

    // Убираем старое поле trackRequest
    // Если есть трек-реквест, проверяем минимальную сумму для него
    // if (validatedData.trackRequest) {
    //   const trackMinAmount = streamer.settings?.trackRequestMinimum || 20
    //   if (validatedData.amount < Number(trackMinAmount)) {
    //     return NextResponse.json(
    //       { error: `Minimum amount for track request is ${trackMinAmount} ${validatedData.currency}` },
    //       { status: 400 },
    //     )
    //   }
    // }

    // Подключаемся к MongoDB
    await connectToDatabase()

    // Создаём донат в MongoDB
    const donationId = generateDonationId()
    const donation = await Donation.create({
      donationId,
      streamerId: streamer.uuid,
      donorName: validatedData.isAnonymous ? "Anonymous" : validatedData.donorName,
      amount: validatedData.amount,
      currency: validatedData.currency,
      message: validatedData.message,
      trackRequest: validatedData.youtubeUrl
        ? {
            title: youtubeVideoInfo?.title || "YouTube Track",
            artist: youtubeVideoInfo?.channelTitle || "",
            url: validatedData.youtubeUrl,
          }
        : undefined,
      isAnonymous: validatedData.isAnonymous,
      paymentMethod: "test", // В будущем интегрируем реальные платежи
      paymentStatus: "completed",
      played: false,
      metadata: {
        ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
        userAgent: request.headers.get("user-agent") || undefined,
        referer: request.headers.get("referer") || undefined,
      },
    })

    // Обновляем статистику стримера
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    await prisma.userStatistic.upsert({
      where: {
        userId_date: {
          userId: streamer.id,
          date: today,
        },
      },
      create: {
        userId: streamer.id,
        date: today,
        totalDonations: validatedData.amount,
        totalDonors: 1,
        totalTrackRequests: validatedData.trackRequest ? 1 : 0,
        averageDonation: validatedData.amount,
        highestDonation: validatedData.amount,
      },
      update: {
        totalDonations: {
          increment: validatedData.amount,
        },
        totalDonors: {
          increment: 1,
        },
        totalTrackRequests: validatedData.youtubeUrl
          ? {
              increment: 1,
            }
          : undefined,
        highestDonation: {
          set: Math.max(validatedData.amount, 0), // Будет обновлено в следующем запросе
        },
      },
    })

    // Логируем создание доната
    await createLog("info", "Donation created", streamer.uuid, {
      action: "donation_created",
      metadata: {
        donationId,
        amount: validatedData.amount,
        currency: validatedData.currency,
        hasTrackRequest: !!validatedData.trackRequest,
      },
    })

    // 🔔 ОТПРАВЛЯЕМ ALERT через SSE
    try {
      const alertSettings = await prisma.alertSettings.findUnique({
        where: { userId: streamer.id },
      })

      if (alertSettings && validatedData.amount >= Number(alertSettings.minAmount)) {
        console.log("🔔 Sending donation alert to SSE stream...")
        
        const alertData = {
          id: donationId,
          type: "donation" as const,
          donorName: validatedData.isAnonymous ? "Anonymous" : validatedData.donorName,
          amount: validatedData.amount,
          currency: validatedData.currency,
          message: validatedData.message,
          trackRequest: validatedData.youtubeUrl
            ? {
                title: youtubeVideoInfo?.title || "YouTube Track",
                artist: youtubeVideoInfo?.channelTitle || "",
                url: validatedData.youtubeUrl,
              }
            : undefined,
          timestamp: Date.now(),
        }

        const sent = AlertEventManager.sendAlert(alertSettings.alertToken, alertData)
        console.log(sent ? "✅ Alert sent successfully" : "⚠️ No active alert connections")
      } else {
        console.log("⚠️ Alert not sent: settings not found or amount below minimum")
      }
    } catch (alertError) {
      // Не падаем если alert не отправился
      console.error("❌ Error sending alert:", alertError)
    }

    return NextResponse.json({
      success: true,
      donation: {
        id: donation.donationId,
        amount: donation.amount,
        currency: donation.currency,
        streamer: streamer.username,
        createdAt: donation.createdAt,
      },
    })
  } catch (error) {
    console.error("Donation creation error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET /api/donations - Получение донатов (приватный endpoint)
export const GET = requireAuth(async (request: NextRequest, user: any) => {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const played = searchParams.get("played")

    const query: any = { streamerId: user.uuid }

    if (played === "true") {
      query.played = true
    } else if (played === "false") {
      query.played = false
    }

    const donations = await Donation.find(query).sort({ createdAt: -1 }).limit(limit).lean()

    return NextResponse.json({
      donations: donations.map((d: any) => ({
        id: d.donationId,
        donorName: d.donorName,
        amount: d.amount,
        currency: d.currency,
        message: d.message,
        trackRequest: d.trackRequest,
        played: d.played,
        playedAt: d.playedAt,
        createdAt: d.createdAt,
      })),
    })
  } catch (error) {
    console.error("Get donations error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})
