import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { requireAuth } from "@/lib/auth-middleware"

export const POST = requireAuth(async (request: NextRequest, user: any) => {
  try {
    console.log("=== IMAGE UPLOAD START ===")
    console.log("User authenticated:", user?.id, user?.username)
    
    const formData = await request.formData()
    const file = formData.get("image") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("File received:", {
      name: file.name,
      type: file.type,
      size: file.size,
    })

    // Проверяем тип файла (image)
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 })
    }

    // Проверяем размер (максимум 10MB для GIF)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum 10MB" }, { status: 400 })
    }

    // Создаем директорию для картинок если её нет
    const uploadDir = path.join(process.cwd(), "public", "alerts", "images")
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
    const imageUrl = `/alerts/images/${filename}`
    console.log("Image URL:", imageUrl)
    console.log("=== IMAGE UPLOAD END ===")

    return NextResponse.json({
      success: true,
      imageUrl,
      message: "Image uploaded successfully",
    })
  } catch (error) {
    console.error("=== IMAGE UPLOAD ERROR ===")
    console.error("Image upload error:", error)
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 })
  }
})
