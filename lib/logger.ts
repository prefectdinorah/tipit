import connectToDatabase from "./mongodb"
import Log from "./models/log"

interface LogContext {
  action?: string
  ip?: string
  userAgent?: string
  metadata?: Record<string, any>
}

export async function createLog(
  level: "info" | "warn" | "error",
  message: string,
  userId?: string,
  context?: LogContext,
) {
  try {
    await connectToDatabase()

    await Log.create({
      level,
      message,
      userId,
      context,
      timestamp: new Date(),
    })
  } catch (error) {
    console.error("Failed to create log:", error)
  }
}
