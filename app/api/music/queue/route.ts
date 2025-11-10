import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-utils"
import { validateYouTubeVideo, extractYouTubeId } from "@/lib/youtube"

// GET - получить очередь
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const queue = await prisma.musicQueue.findMany({
      where: {
        userId: parseInt(session.user.id),
        status: {
          in: ["pending", "playing"],
        },
      },
      orderBy: {
        orderIndex: "asc",
      },
    })

    return NextResponse.json({ queue })
  } catch (error) {
    console.error("Failed to get queue:", error)
    return NextResponse.json(
      { error: "Failed to get queue" },
      { status: 500 }
    )
  }
}

// POST - добавить трек в очередь
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { youtubeUrl, donorName, donationAmount } = await request.json()

    if (!youtubeUrl || !donorName || !donationAmount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const youtubeId = extractYouTubeId(youtubeUrl)
    if (!youtubeId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL" },
        { status: 400 }
      )
    }

    // Получить блэклист пользователя
    const blacklist = await prisma.musicBlacklist.findMany({
      where: { userId: parseInt(session.user.id) },
    })

    const blacklistedVideos = blacklist
      .filter((item) => item.youtubeId)
      .map((item) => item.youtubeId!)

    const blacklistedChannels = blacklist
      .filter((item) => item.channelId)
      .map((item) => item.channelId!)

    // Валидация видео
    const validation = await validateYouTubeVideo(youtubeId, {
      minViews: 5000,
      maxDuration: 600,
      blacklistedVideos,
      blacklistedChannels,
    })

    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error || "Video validation failed" },
        { status: 400 }
      )
    }

    // Получить максимальный orderIndex
    const maxOrder = await prisma.musicQueue.findFirst({
      where: {
        userId: parseInt(session.user.id),
        status: "pending",
      },
      orderBy: {
        orderIndex: "desc",
      },
    })

    const newOrderIndex = (maxOrder?.orderIndex || 0) + 1

    // Создать запись в очереди
    const track = await prisma.musicQueue.create({
      data: {
        userId: parseInt(session.user.id),
        donorName,
        youtubeUrl,
        youtubeId,
        title: validation.videoInfo?.title,
        duration: validation.videoInfo?.duration,
        thumbnailUrl: validation.videoInfo?.thumbnailUrl,
        donationAmount,
        orderIndex: newOrderIndex,
      },
    })

    return NextResponse.json({ success: true, track })
  } catch (error) {
    console.error("Failed to add track to queue:", error)
    return NextResponse.json(
      { error: "Failed to add track to queue" },
      { status: 500 }
    )
  }
}

// DELETE - удалить трек из очереди
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const trackId = searchParams.get("trackId")

    if (!trackId) {
      return NextResponse.json(
        { error: "Track ID is required" },
        { status: 400 }
      )
    }

    // Проверить что трек принадлежит пользователю
    const track = await prisma.musicQueue.findFirst({
      where: {
        id: parseInt(trackId),
        userId: parseInt(session.user.id),
      },
    })

    if (!track) {
      return NextResponse.json(
        { error: "Track not found" },
        { status: 404 }
      )
    }

    // Обновить статус на removed
    await prisma.musicQueue.update({
      where: { id: parseInt(trackId) },
      data: { status: "removed" },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to remove track:", error)
    return NextResponse.json(
      { error: "Failed to remove track" },
      { status: 500 }
    )
  }
}

// PUT - изменить порядок треков
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { trackIds } = await request.json()

    if (!Array.isArray(trackIds)) {
      return NextResponse.json(
        { error: "trackIds must be an array" },
        { status: 400 }
      )
    }

    // Обновить orderIndex для каждого трека
    const updates = trackIds.map((id, index) =>
      prisma.musicQueue.update({
        where: {
          id,
          userId: parseInt(session.user.id),
        },
        data: {
          orderIndex: index,
        },
      })
    )

    await Promise.all(updates)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to reorder tracks:", error)
    return NextResponse.json(
      { error: "Failed to reorder tracks" },
      { status: 500 }
    )
  }
}
