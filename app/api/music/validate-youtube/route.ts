import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { validateYouTubeVideo, extractYouTubeId } from "@/lib/youtube"
import { prisma } from "@/lib/db"

export const POST = requireAuth(async (request: NextRequest, user: any) => {
  try {
    const { youtubeUrl } = await request.json()

    if (!youtubeUrl) {
      return NextResponse.json(
        { error: "YouTube URL is required" },
        { status: 400 }
      )
    }

    // Извлекаем video ID
    const videoId = extractYouTubeId(youtubeUrl)
    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL" },
        { status: 400 }
      )
    }

    // Получаем черные списки пользователя
    const blacklist = await prisma.musicBlacklist.findMany({
      where: { userId: user.id },
      select: {
        youtubeId: true,
        channelId: true,
      },
    })

    const blacklistedVideos = blacklist
      .filter((b) => b.youtubeId)
      .map((b) => b.youtubeId!)

    const blacklistedChannels = blacklist
      .filter((b) => b.channelId)
      .map((b) => b.channelId!)

    // Получаем настройки стримера
    const settings = await prisma.streamerSettings.findUnique({
      where: { userId: user.id },
      select: { trackRequestMinimum: true },
    })

    // Валидируем видео
    const validation = await validateYouTubeVideo(videoId, {
      minViews: 5000,
      maxDuration: 600, // 10 минут
      blacklistedChannels,
      blacklistedVideos,
    })

    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      videoId,
      videoInfo: validation.videoInfo,
      minimumAmount: settings?.trackRequestMinimum || 20,
    })
  } catch (error) {
    console.error("YouTube validation error:", error)
    return NextResponse.json(
      { error: "Failed to validate YouTube URL" },
      { status: 500 }
    )
  }
})
