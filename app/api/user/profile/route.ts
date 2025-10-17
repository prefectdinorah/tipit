import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/db"
import { requireAuth } from "@/lib/auth-middleware"

const profileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  bio: z.string().max(500).optional(),
  timezone: z.string().optional(),
})

export const PATCH = requireAuth(async (request: NextRequest, user: any) => {
  try {
    console.log("=== UPDATE PROFILE START ===")
    const body = await request.json()
    console.log("Request body:", body)

    const validatedData = profileSchema.parse(body)
    console.log("Validated data:", validatedData)

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: validatedData,
    })

    console.log("Profile updated successfully")
    console.log("=== UPDATE PROFILE END ===")

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.uuid,
        username: updatedUser.username,
        email: updatedUser.email,
        displayName: updatedUser.displayName,
        bio: updatedUser.bio,
        timezone: updatedUser.timezone,
      },
    })
  } catch (error) {
    console.error("=== UPDATE PROFILE ERROR ===")
    console.error("Error:", error)

    if (error instanceof z.ZodError) {
      console.error("Validation errors:", error.errors)
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})
