import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { createLog } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session_token")?.value

    if (sessionToken) {
      // Находим сессию
      const session = await prisma.session.findUnique({
        where: { token: sessionToken },
        include: { user: true },
      })

      if (session) {
        // Деактивируем сессию
        await prisma.session.update({
          where: { token: sessionToken },
          data: { isActive: false },
        })

        // Логируем выход
        await createLog("info", "User logged out", session.user.uuid, {
          action: "logout",
        })
      }
    }

    // Удаляем cookie
    const response = NextResponse.json({ success: true })
    response.cookies.delete("session_token")

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
