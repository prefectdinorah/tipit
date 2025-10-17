import type { NextRequest } from "next/server"
import prisma from "./db"

export async function getSessionUser(request: NextRequest) {
  const sessionToken = request.cookies.get("session_token")?.value

  if (!sessionToken) {
    return null
  }

  const session = await prisma.session.findUnique({
    where: {
      token: sessionToken,
      isActive: true,
    },
    include: {
      user: {
        include: {
          settings: true,
        },
      },
    },
  })

  if (!session || session.expiresAt < new Date()) {
    return null
  }

  // Обновляем время последней активности
  await prisma.session.update({
    where: { token: sessionToken },
    data: { lastActivityAt: new Date() },
  })

  return session.user
}

export function requireAuth(handler: (request: NextRequest, user: any) => Promise<Response>) {
  return async (request: NextRequest) => {
    const user = await getSessionUser(request)

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    return handler(request, user)
  }
}
