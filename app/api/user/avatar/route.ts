import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import prisma from "@/lib/db"
import { requireAuth } from "@/lib/auth-middleware"

export const POST = requireAuth(async (request: NextRequest, user: any) => {
  try {
    console.log("=== AVATAR UPLOAD START ===")
    const formData = await request.formData()
    const file = formData.get("avatar") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("File received:", {
      name: file.name,
      type: file.type,
      size: file.size,
    })

    // Проверяем тип файла
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only images are allowed" }, { status: 400 })
    }

    // Проверяем размер (максимум 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum 5MB" }, { status: 400 })
    }

    // Создаем директорию для аватаров если её нет
    const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars")
    console.log("Upload directory:", uploadDir)

    if (!existsSync(uploadDir)) {
      console.log("Creating upload directory...")
      await mkdir(uploadDir, { recursive: true })
    }

    // Генерируем уникальное имя файла
    const ext = file.name.split(".").pop()
    const filename = `${user.uuid}-${Date.now()}.${ext}`
    const filepath = path.join(uploadDir, filename)

    console.log("Saving to:", filepath)

    // Сохраняем файл
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    console.log("File saved successfully")

    // Обновляем URL аватара в базе
    const avatarUrl = `/uploads/avatars/${filename}`
    console.log("Updating database with avatarUrl:", avatarUrl)

    await prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl },
    })

    console.log("Database updated successfully")
    console.log("=== AVATAR UPLOAD END ===")

    return NextResponse.json({
      success: true,
      avatarUrl,
      message: "Avatar uploaded successfully",
    })
  } catch (error) {
    console.error("=== AVATAR UPLOAD ERROR ===")
    console.error("Avatar upload error:", error)
    return NextResponse.json({ error: "Failed to upload avatar" }, { status: 500 })
  }
})
