import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get("username")

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      )
    }

    // Найти пользователя по username
    const user = await prisma.user.findUnique({
      where: { username },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Получить следующий трек из очереди
    const nextTrack = await prisma.musicQueue.findFirst({
      where: {
        userId: user.id,
        status: "pending",
      },
      orderBy: {
        orderIndex: "asc",
      },
    })

    if (!nextTrack) {
      return NextResponse.json({ track: null })
    }

    // Обновить статус на playing
    await prisma.musicQueue.update({
      where: { id: nextTrack.id },
      data: { status: "playing" },
    })

    return NextResponse.json({
      track: {
        id: nextTrack.id,
        youtubeId: nextTrack.youtubeId,
        title: nextTrack.title,
        donorName: nextTrack.donorName,
        donationAmount: nextTrack.donationAmount,
      },
    })
  } catch (error) {
    console.error("Failed to get next track:", error)
    return NextResponse.json(
      { error: "Failed to get next track" },
      { status: 500 }
    )
  }
}
