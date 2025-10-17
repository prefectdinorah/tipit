import { type NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Donation from "@/lib/models/donation"
import { requireAuth } from "@/lib/auth-middleware"

export const GET = requireAuth(async (request: NextRequest, user: any) => {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "today" // today, week, month, all

    let dateFilter: any = {}
    const now = new Date()

    if (period === "today") {
      const startOfDay = new Date(now)
      startOfDay.setHours(0, 0, 0, 0)
      dateFilter = { createdAt: { $gte: startOfDay } }
    } else if (period === "week") {
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - 7)
      dateFilter = { createdAt: { $gte: startOfWeek } }
    } else if (period === "month") {
      const startOfMonth = new Date(now)
      startOfMonth.setDate(now.getDate() - 30)
      dateFilter = { createdAt: { $gte: startOfMonth } }
    }

    const donations = await Donation.find({
      streamerId: user.uuid,
      ...dateFilter,
    })

    const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0)
    const totalDonations = donations.length
    const totalDonors = new Set(donations.map((d) => d.donorName)).size
    const averageAmount = totalDonations > 0 ? totalAmount / totalDonations : 0
    const highestDonation = donations.length > 0 ? Math.max(...donations.map((d) => d.amount)) : 0

    const trackRequests = donations.filter((d) => d.trackRequest).length
    const playedDonations = donations.filter((d) => d.played).length

    return NextResponse.json({
      stats: {
        totalAmount,
        totalDonations,
        totalDonors,
        averageAmount,
        highestDonation,
        trackRequests,
        playedDonations,
        currency: user.settings?.currency || "USD",
      },
    })
  } catch (error) {
    console.error("Get stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})
