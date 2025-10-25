import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { validateSession } from "@/lib/auth-middleware"

const prisma = new PrismaClient()

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID!
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET!
const TWITCH_REDIRECT_URI = process.env.TWITCH_REDIRECT_URI || "http://localhost:3001/api/twitch/callback"

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code")
    const error = request.nextUrl.searchParams.get("error")

    if (error || !code) {
      return NextResponse.redirect(new URL("/settings?twitch=error", request.url))
    }

    // Обмен code на access token
    const tokenResponse = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: TWITCH_CLIENT_ID,
        client_secret: TWITCH_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: TWITCH_REDIRECT_URI,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for token")
    }

    const tokenData = await tokenResponse.json()
    const { access_token, refresh_token, expires_in } = tokenData

    // Получить информацию о пользователе Twitch
    const userResponse = await fetch("https://api.twitch.tv/helix/users", {
      headers: {
        "Client-ID": TWITCH_CLIENT_ID,
        Authorization: `Bearer ${access_token}`,
      },
    })

    if (!userResponse.ok) {
      throw new Error("Failed to fetch Twitch user info")
    }

    const userData = await userResponse.json()
    const twitchUser = userData.data[0]

    // Валидация сессии
    const session = await validateSession(request)
    if (!session) {
      return NextResponse.redirect(new URL("/auth/login?twitch=session_expired", request.url))
    }

    // Сохранить в БД
    const expiresAt = new Date(Date.now() + expires_in * 1000)
    
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        twitchId: twitchUser.id,
        twitchUsername: twitchUser.login,
        twitchAccessToken: access_token,
        twitchRefreshToken: refresh_token,
        twitchTokenExpiresAt: expiresAt,
      },
    })

    return NextResponse.redirect(new URL("/settings?twitch=success", request.url))
  } catch (error) {
    console.error("❌ Twitch callback error:", error)
    return NextResponse.redirect(new URL("/settings?twitch=error", request.url))
  } finally {
    await prisma.$disconnect()
  }
}
