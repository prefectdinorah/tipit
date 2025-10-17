import { type NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Donation from "@/lib/models/donation"
import { requireAuth } from "@/lib/auth-middleware"

export const PATCH = requireAuth(async (request: NextRequest, user: any, { params }: { params: { id: string } }) => {
  try {
    await connectToDatabase()

    const body = await request.json()
    const { played } = body

    const donation = await Donation.findOne({
      donationId: params.id,
      streamerId: user.uuid,
    })

    if (!donation) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 })
    }

    donation.played = played
    if (played) {
      donation.playedAt = new Date()
    }
    await donation.save()

    return NextResponse.json({
      success: true,
      donation: {
        id: donation.donationId,
        played: donation.played,
        playedAt: donation.playedAt,
      },
    })
  } catch (error) {
    console.error("Update donation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})
