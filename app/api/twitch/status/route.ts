import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID!

export async function GET(request: NextRequest) {
  try {
    const username = request.nextUrl.searchParams.get("username")
    
    if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 })
    }

    // Получить пользователя из БД
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        twitchId: true,
        twitchUsername: true,
        twitchAccessToken: true,
        isLive: true,
      },
    })

    if (!user || !user.twitchId || !user.twitchAccessToken) {
      return NextResponse.json({ 
        connected: false,
        isLive: false,
      })
    }

    // Проверить статус стрима через Twitch API
    const streamResponse = await fetch(
      `https://api.twitch.tv/helix/streams?user_id=${user.twitchId}`,
      {
        headers: {
          "Client-ID": TWITCH_CLIENT_ID,
          Authorization: `Bearer ${user.twitchAccessToken}`,
        },
      }
    )

    if (!streamResponse.ok) {
      return NextResponse.json({
        connected: true,
        isLive: user.isLive,
        username: user.twitchUsername,
      })
    }

    const streamData = await streamResponse.json()
    const isLive = streamData.data.length > 0

    // Обновить статус в БД если изменился
    if (isLive !== user.isLive) {
      await prisma.user.update({
        where: { username },
        data: { isLive },
      })
    }

    return NextResponse.json({
      connected: true,
      isLive,
      username: user.twitchUsername,
      stream: isLive ? streamData.data[0] : null,
    })
  } catch (error) {
    console.error("❌ Twitch status error:", error)
    return NextResponse.json({ error: "Failed to fetch stream status" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
