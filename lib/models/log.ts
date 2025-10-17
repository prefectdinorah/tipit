import mongoose from "mongoose"

const LogSchema = new mongoose.Schema({
  level: { type: String, required: true, index: true },
  message: { type: String, required: true },
  userId: { type: String, index: true },
  context: {
    action: String,
    ip: String,
    userAgent: String,
    metadata: mongoose.Schema.Types.Mixed,
  },
  timestamp: { type: Date, default: Date.now, index: true },
})

// Индекс для быстрого поиска логов
LogSchema.index({ timestamp: -1 })
LogSchema.index({ userId: 1, timestamp: -1 })
LogSchema.index({ level: 1, timestamp: -1 })

export default mongoose.models.Log || mongoose.model("Log", LogSchema)
