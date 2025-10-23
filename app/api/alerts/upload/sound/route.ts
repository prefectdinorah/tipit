import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { requireAuth } from "@/lib/auth-middleware"

export const POST = requireAuth(async (request: NextRequest, user: any) => {
  try {
    console.log("=== SOUND UPLOAD START ===")
    const formData = await request.formData()
    const file = formData.get("sound") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("File received:", {
      name: file.name,
      type: file.type,
      size: file.size,
    })

    // Проверяем тип файла (audio)
    if (!file.type.startsWith("audio/")) {
      return NextResponse.json({ error: "Only audio files are allowed" }, { status: 400 })
    }

    // Проверяем размер (максимум 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum 5MB" }, { status: 400 })
    }

    // Создаем директорию для звуков если её нет
    const uploadDir = path.join(process.cwd(), "public", "alerts", "sounds")
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

    // URL для доступа
    const soundUrl = `/alerts/sounds/${filename}`
    console.log("Sound URL:", soundUrl)
    console.log("=== SOUND UPLOAD END ===")

    return NextResponse.json({
      success: true,
      soundUrl,
      message: "Sound uploaded successfully",
    })
  } catch (error) {
    console.error("=== SOUND UPLOAD ERROR ===")
    console.error("Sound upload error:", error)
    return NextResponse.json({ error: "Failed to upload sound" }, { status: 500 })
  }
})
