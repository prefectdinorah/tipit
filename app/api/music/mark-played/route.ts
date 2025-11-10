import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { trackId, username } = await request.json()

    if (!trackId || !username) {
      return NextResponse.json(
        { error: "Track ID and username are required" },
        { status: 400 }
      )
    }

    // Обновить статус трека на played
    await prisma.musicQueue.update({
      where: { id: trackId },
      data: {
        status: "played",
        playedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to mark track as played:", error)
    return NextResponse.json(
      { error: "Failed to mark track as played" },
      { status: 500 }
    )
  }
}
