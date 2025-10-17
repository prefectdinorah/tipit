import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/db"
import { hashPassword } from "@/lib/auth-utils"
import { createLog } from "@/lib/logger"

const registerSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscores"),
  email: z.string().email().optional(),
  password: z.string().min(8),
  displayName: z.string().min(1).max(100).optional(),
})

export async function POST(request: NextRequest) {
  try {
    console.log("=== REGISTER REQUEST START ===")
    const body = await request.json()
    console.log("Request body:", JSON.stringify(body, null, 2))

    const validatedData = registerSchema.parse(body)
    console.log("Validated data:", validatedData)

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username: validatedData.username }, ...(validatedData.email ? [{ email: validatedData.email }] : [])],
      },
    })

    if (existingUser) {
      console.log("User already exists:", existingUser.username)
      return NextResponse.json({ error: "Username or email already exists" }, { status: 400 })
    }

    const passwordHash = await hashPassword(validatedData.password)

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          username: validatedData.username,
          email: validatedData.email || `${validatedData.username}@temp.local`,
          passwordHash,
          displayName: validatedData.displayName || validatedData.username,
        },
        select: {
          id: true,
          uuid: true,
          username: true,
          email: true,
          displayName: true,
          createdAt: true,
        },
      })

      await tx.streamerSettings.create({
        data: {
          userId: newUser.id,
        },
      })

      return newUser
    })

    await createLog("info", "User registered", user.uuid, {
      action: "register",
      ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
      userAgent: request.headers.get("user-agent") || undefined,
    })

    console.log("User created successfully:", user.username)
    console.log("=== REGISTER REQUEST END ===")

    return NextResponse.json({
      success: true,
      user: {
        id: user.uuid,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
      },
    })
  } catch (error) {
    console.error("=== REGISTER ERROR ===")
    console.error("Error:", error)

    if (error instanceof z.ZodError) {
      console.error("Validation errors:", error.errors)
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
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
    },
  })
}
