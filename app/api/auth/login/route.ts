import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/db"
import { verifyPassword, generateSessionToken } from "@/lib/auth-utils"
import { createLog } from "@/lib/logger"

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    console.log("=== LOGIN REQUEST START ===")
    const body = await request.json()
    console.log("Request body:", { username: body.username, password: "***" })

    const { username, password } = loginSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { username },
      include: { settings: true },
    })

    if (!user || !user.isActive) {
      console.log("User not found or inactive:", username)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    console.log("User found:", user.username)

    const isValid = await verifyPassword(password, user.passwordHash)
    if (!isValid) {
      console.log("Invalid password for user:", username)
      await createLog("warn", "Failed login attempt", user.uuid, {
        action: "login_failed",
        ip: request.headers.get("x-forwarded-for") || "unknown",
      })
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    console.log("Password verified successfully")

    const sessionToken = generateSessionToken()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token: sessionToken,
        expiresAt,
        ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || null,
        userAgent: request.headers.get("user-agent"),
      },
    })

    console.log("Session created:", session.id)

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    await createLog("info", "User logged in", user.uuid, {
      action: "login",
      ip: session.ipAddress || "unknown",
    })

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.uuid,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
      },
    })

    // Устанавливаем cookie с правильными настройками
    response.cookies.set({
      name: "session_token",
      value: sessionToken,
      httpOnly: true,
      secure: false, // false для HTTP, true для HTTPS
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 дней
      path: "/",
    })

    console.log("✅ Login successful, cookie set:", {
      token: sessionToken.substring(0, 10) + "...",
      maxAge: 7 * 24 * 60 * 60,
    })
    console.log("=== LOGIN REQUEST END ===")

    return response
  } catch (error) {
    console.error("=== LOGIN ERROR ===")
    console.error("Error:", error)

    if (error instanceof z.ZodError) {
      console.error("Validation errors:", error.errors)
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    },
  })
}
