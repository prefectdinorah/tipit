import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import path from "path"
import { existsSync } from "fs"

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename
    
    // Проверяем что filename безопасный (без ../ и т.д.)
    if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 })
    }

    const avatarPath = path.join(process.cwd(), "public", "uploads", "avatars", filename)
    
    console.log("📸 Serving avatar:", {
      filename,
      path: avatarPath,
      exists: existsSync(avatarPath),
    })

    if (!existsSync(avatarPath)) {
      console.log("❌ Avatar file not found:", avatarPath)
      return NextResponse.json({ error: "Avatar not found" }, { status: 404 })
    }

    const fileBuffer = await readFile(avatarPath)
    
    // Определяем MIME type по расширению
    const ext = path.extname(filename).toLowerCase()
    const mimeTypes: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
    }
    const contentType = mimeTypes[ext] || "application/octet-stream"

    console.log("✅ Serving avatar successfully:", {
      filename,
      contentType,
      size: fileBuffer.length,
    })

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("❌ Error serving avatar:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
