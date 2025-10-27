import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

/**
 * API Route для раздачи статических файлов алертов (картинки и звуки)
 * 
 * Endpoints:
 * - GET /api/alerts/files/images/filename.jpg
 * - GET /api/alerts/files/sounds/filename.mp3
 * 
 * Причина: Next.js не раздаёт файлы из /public/alerts/ напрямую,
 * поэтому создан отдельный API route с проверкой безопасности
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const pathSegments = params.path
    
    if (!pathSegments || pathSegments.length < 2) {
      return new NextResponse("Invalid path", { status: 400 })
    }

    // pathSegments = ["images", "filename.jpg"] или ["sounds", "filename.mp3"]
    const type = pathSegments[0] // "images" или "sounds"
    const filename = pathSegments.slice(1).join("/") // поддержка вложенных путей

    // Безопасность: проверяем что тип валиден
    if (type !== "images" && type !== "sounds") {
      return new NextResponse("Invalid file type", { status: 400 })
    }

    // Путь к файлу
    const filePath = join(process.cwd(), "public", "alerts", type, filename)

    // Проверяем существование
    if (!existsSync(filePath)) {
      console.log("File not found:", filePath)
      return new NextResponse("File not found", { status: 404 })
    }

    // Читаем файл
    const fileBuffer = await readFile(filePath)

    // Определяем Content-Type
    const contentType = getContentType(filename, type)

    // Возвращаем файл с правильными заголовками
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("Error serving alert file:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

function getContentType(filename: string, type: string): string {
  const ext = filename.split(".").pop()?.toLowerCase()

  if (type === "images") {
    switch (ext) {
      case "jpg":
      case "jpeg":
        return "image/jpeg"
      case "png":
        return "image/png"
      case "gif":
        return "image/gif"
      case "webp":
        return "image/webp"
      default:
        return "image/jpeg"
    }
  }

  if (type === "sounds") {
    switch (ext) {
      case "mp3":
        return "audio/mpeg"
      case "wav":
        return "audio/wav"
      case "ogg":
        return "audio/ogg"
      case "m4a":
        return "audio/mp4"
      default:
        return "audio/mpeg"
    }
  }

  return "application/octet-stream"
}
