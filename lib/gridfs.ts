import { MongoClient, GridFSBucket, ObjectId } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env")
}

let cachedClient: MongoClient | null = null
let cachedBucket: GridFSBucket | null = null

/**
 * Получить GridFS bucket для хранения файлов
 */
export async function getGridFSBucket(): Promise<GridFSBucket> {
  if (cachedBucket && cachedClient) {
    return cachedBucket
  }

  const client = await MongoClient.connect(MONGODB_URI)
  const db = client.db()

  cachedClient = client
  cachedBucket = new GridFSBucket(db, {
    bucketName: "alert_files", // Коллекция: alert_files.files и alert_files.chunks
  })

  console.log("✅ GridFS bucket initialized")
  return cachedBucket
}

/**
 * Загрузить файл в GridFS
 */
export async function uploadToGridFS(
  filename: string,
  buffer: Buffer,
  metadata: { contentType: string; userId: string; type: "image" | "sound" }
): Promise<string> {
  const bucket = await getGridFSBucket()

  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, {
      metadata,
    })

    uploadStream.on("finish", () => {
      console.log(`✅ File uploaded to GridFS: ${filename} (id: ${uploadStream.id})`)
      resolve(uploadStream.id.toString())
    })

    uploadStream.on("error", (error) => {
      console.error("❌ GridFS upload error:", error)
      reject(error)
    })

    uploadStream.write(buffer)
    uploadStream.end()
  })
}

/**
 * Получить файл из GridFS по ID
 */
export async function downloadFromGridFS(fileId: string): Promise<{
  stream: NodeJS.ReadableStream
  metadata: any
  contentType: string
}> {
  const bucket = await getGridFSBucket()

  try {
    const objectId = new ObjectId(fileId)

    // Получаем метаданные файла
    const files = await bucket.find({ _id: objectId }).toArray()
    if (files.length === 0) {
      throw new Error("File not found in GridFS")
    }

    const file = files[0]
    const stream = bucket.openDownloadStream(objectId)

    return {
      stream,
      metadata: file.metadata || {},
      contentType: file.metadata?.contentType || "application/octet-stream",
    }
  } catch (error) {
    console.error("❌ GridFS download error:", error)
    throw error
  }
}

/**
 * Удалить файл из GridFS по ID
 */
export async function deleteFromGridFS(fileId: string): Promise<void> {
  const bucket = await getGridFSBucket()

  try {
    const objectId = new ObjectId(fileId)
    await bucket.delete(objectId)
    console.log(`✅ File deleted from GridFS: ${fileId}`)
  } catch (error) {
    console.error("❌ GridFS delete error:", error)
    throw error
  }
}

/**
 * Получить файл из GridFS по имени (для обратной совместимости)
 */
export async function downloadFromGridFSByFilename(filename: string): Promise<{
  stream: NodeJS.ReadableStream
  metadata: any
  contentType: string
} | null> {
  const bucket = await getGridFSBucket()

  try {
    const files = await bucket.find({ filename }).toArray()
    if (files.length === 0) {
      return null
    }

    const file = files[0]
    const stream = bucket.openDownloadStreamByName(filename)

    return {
      stream,
      metadata: file.metadata || {},
      contentType: file.metadata?.contentType || "application/octet-stream",
    }
  } catch (error) {
    console.error("❌ GridFS download by filename error:", error)
    return null
  }
}
