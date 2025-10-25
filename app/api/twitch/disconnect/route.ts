import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { validateSession } from "@/lib/auth-middleware"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await validateSession(request)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Удалить Twitch данные
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        twitchId: null,
        twitchUsername: null,
        twitchAccessToken: null,
        twitchRefreshToken: null,
        twitchTokenExpiresAt: null,
        isLive: false,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("❌ Twitch disconnect error:", error)
    return NextResponse.json({ error: "Failed to disconnect Twitch" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
