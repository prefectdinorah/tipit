import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { prisma } from "@/lib/db"
import { uploadToGridFS, deleteFromGridFS } from "@/lib/gridfs"

export const POST = requireAuth(async (request: NextRequest, user: any) => {
  try {
    console.log("=== IMAGE UPLOAD START (GridFS) ===")
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

    // Удаляем старое изображение из GridFS если оно есть
    try {
      const existingSettings = await prisma.alertSettings.findUnique({
        where: { userId: user.id },
        select: { imageUrl: true },
      })

      if (existingSettings?.imageUrl) {
        // imageUrl теперь содержит GridFS ID
        const fileId = existingSettings.imageUrl
        console.log("Deleting old image from GridFS:", fileId)
        await deleteFromGridFS(fileId)
        console.log("Old image deleted from GridFS")
      }
    } catch (deleteError) {
      console.warn("Failed to delete old image:", deleteError)
      // Не критично, продолжаем загрузку
    }

    // Генерируем уникальное имя файла
    const ext = file.name.split(".").pop()
    const filename = `${user.uuid}-${Date.now()}.${ext}`

    // Сохраняем файл в GridFS
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const fileId = await uploadToGridFS(filename, buffer, {
      contentType: file.type,
      userId: user.id.toString(),
      type: "image",
    })

    console.log("File saved to GridFS with ID:", fileId)
    console.log("=== IMAGE UPLOAD END (GridFS) ===")

    return NextResponse.json({
      success: true,
      imageUrl: fileId, // Теперь возвращаем GridFS ID вместо пути
      message: "Image uploaded successfully",
    })
  } catch (error) {
    console.error("=== IMAGE UPLOAD ERROR ===")
    console.error("Image upload error:", error)
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 })
  }
})
