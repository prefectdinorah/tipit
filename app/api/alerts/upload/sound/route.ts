import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { prisma } from "@/lib/db"
import { uploadToGridFS, deleteFromGridFS } from "@/lib/gridfs"

export const POST = requireAuth(async (request: NextRequest, user: any) => {
  try {
    console.log("=== SOUND UPLOAD START (GridFS) ===")
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

    // Удаляем старый звук из GridFS если он есть
    try {
      const existingSettings = await prisma.alertSettings.findUnique({
        where: { userId: user.id },
        select: { soundUrl: true },
      })

      if (existingSettings?.soundUrl) {
        // soundUrl теперь содержит GridFS ID
        const fileId = existingSettings.soundUrl
        console.log("Deleting old sound from GridFS:", fileId)
        await deleteFromGridFS(fileId)
        console.log("Old sound deleted from GridFS")
      }
    } catch (deleteError) {
      console.warn("Failed to delete old sound:", deleteError)
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
      type: "sound",
    })

    console.log("File saved to GridFS with ID:", fileId)
    console.log("=== SOUND UPLOAD END (GridFS) ===")

    return NextResponse.json({
      success: true,
      soundUrl: fileId, // Теперь возвращаем GridFS ID вместо пути
      message: "Sound uploaded successfully",
    })
  } catch (error) {
    console.error("=== SOUND UPLOAD ERROR ===")
    console.error("Sound upload error:", error)
    return NextResponse.json({ error: "Failed to upload sound" }, { status: 500 })
  }
})
