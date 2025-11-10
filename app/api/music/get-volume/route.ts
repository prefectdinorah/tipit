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

    // Найти пользователя
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        streamerSettings: true,
      },
    })

    if (!user || !user.streamerSettings) {
      return NextResponse.json(
        { error: "User settings not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      volume: user.streamerSettings.musicVolume || 50,
    })
  } catch (error) {
    console.error("Failed to get music volume:", error)
    return NextResponse.json(
      { error: "Failed to get music volume" },
      { status: 500 }
    )
  }
}
