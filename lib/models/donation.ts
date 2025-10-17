import mongoose from "mongoose"

const TrackRequestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    artist: { type: String, required: true },
    url: String,
  },
  { _id: false },
)

const MetadataSchema = new mongoose.Schema(
  {
    ipAddress: String,
    userAgent: String,
    referer: String,
  },
  { _id: false },
)

const DonationSchema = new mongoose.Schema(
  {
    donationId: { type: String, required: true, unique: true },
    streamerId: { type: String, required: true, index: true },
    donorId: String,
    donorName: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    message: String,
    trackRequest: TrackRequestSchema,
    isAnonymous: { type: Boolean, default: false },
    paymentMethod: String,
    paymentStatus: { type: String, default: "completed" },
    paymentId: String,
    played: { type: Boolean, default: false },
    playedAt: Date,
    metadata: MetadataSchema,
  },
  {
    timestamps: true,
  },
)

// Индексы для оптимизации запросов
DonationSchema.index({ streamerId: 1, createdAt: -1 })
DonationSchema.index({ paymentStatus: 1 })
DonationSchema.index({ played: 1 })

export default mongoose.models.Donation || mongoose.model("Donation", DonationSchema)
