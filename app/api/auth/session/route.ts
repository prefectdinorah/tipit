import { type NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth-middleware"

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request)

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    return NextResponse.json({
      user: {
        id: user.uuid,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        isPremium: user.isPremium,
        timezone: user.timezone, // Добавить это поле
        settings: user.settings,
      },
    })
  } catch (error) {
    console.error("Session check error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
