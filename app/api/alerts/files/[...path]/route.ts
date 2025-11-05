import { NextRequest, NextResponse } from "next/server"
import { downloadFromGridFS } from "@/lib/gridfs"

/**
 * API Route для раздачи файлов алертов из GridFS (картинки и звуки)
 * 
 * Endpoints:
 * - GET /api/alerts/files/{gridfs_id}
 * 
 * Теперь файлы хранятся в MongoDB GridFS, а не в файловой системе
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const pathSegments = params.path
    
    if (!pathSegments || pathSegments.length === 0) {
      return new NextResponse("Invalid path", { status: 400 })
    }

    // pathSegments теперь содержат GridFS ID: ["67xxxxxxxxxxxxxxxx"]
    const fileId = pathSegments.join("/")

    console.log("Fetching file from GridFS:", fileId)

    // Получаем файл из GridFS
    const fileData = await downloadFromGridFS(fileId)

    if (!fileData) {
      console.log("File not found in GridFS:", fileId)
      return new NextResponse("File not found", { status: 404 })
    }

    // Читаем stream в buffer
    const chunks: Buffer[] = []
    for await (const chunk of fileData.stream) {
      chunks.push(chunk)
    }
    const fileBuffer = Buffer.concat(chunks)

    console.log(`File loaded from GridFS: ${fileId} (${fileBuffer.length} bytes)`)

    // Возвращаем файл с правильными заголовками
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": fileData.contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("Error serving alert file from GridFS:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
