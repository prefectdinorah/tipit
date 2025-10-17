import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import connectToDatabase from "@/lib/mongodb"
import Donation from "@/lib/models/donation"

export async function GET(request: NextRequest, { params }: { params: { username: string } }) {
  try {
    const { username } = params

    console.log("=".repeat(80))
    console.log("=== STREAMER LOOKUP START ===")
    console.log("Looking for username:", username)
    console.log("Request URL:", request.url)

    // Находим стримера (case-insensitive поиск)
    const streamer = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
        isActive: true,
      },
      include: { settings: true },
      select: {
        uuid: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        isActive: true,
        settings: {
          select: {
            donationGoal: true,
            donationGoalDescription: true,
            minDonationAmount: true,
            trackRequestMinimum: true,
            currency: true,
            theme: true,
            primaryColor: true,
            accentColor: true,
          },
        },
      },
    })

    console.log("Query completed")
    console.log("Streamer found:", !!streamer)

    if (streamer) {
      console.log("Streamer details:")
      console.log("  - UUID:", streamer.uuid)
      console.log("  - Username:", streamer.username)
      console.log("  - Display Name:", streamer.displayName)
      console.log("  - Active:", streamer.isActive)
      console.log("  - Has settings:", !!streamer.settings)
    } else {
      // Проверим, существует ли пользователь вообще
      const anyUser = await prisma.user.findFirst({
        where: {
          username: {
            contains: username,
            mode: "insensitive",
          },
        },
        select: {
          username: true,
          isActive: true,
        },
      })

      console.log("Checking if any similar user exists:")
      if (anyUser) {
        console.log("  - Found user:", anyUser.username)
        console.log("  - Active:", anyUser.isActive)
      } else {
        console.log("  - No users found matching:", username)

        // Покажем всех пользователей для отладки
        const allUsers = await prisma.user.findMany({
          select: { username: true, isActive: true },
          take: 10,
        })
        console.log("  - Available users:", allUsers)
      }
    }

    if (!streamer || !streamer.isActive) {
      console.log("❌ Streamer not found or inactive")
      console.log("=== STREAMER LOOKUP END ===")
      console.log("=".repeat(80))
      return NextResponse.json({ error: "Streamer not found" }, { status: 404 })
    }

    // Получаем статистику донатов
    await connectToDatabase()
    const donations = await Donation.find({
      streamerId: streamer.uuid,
    })

    const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0)
    const donationGoal = streamer.settings?.donationGoal || 1000

    console.log("Donation stats:")
    console.log("  - Total donations:", totalDonations)
    console.log("  - Donation goal:", donationGoal)
    console.log("  - Progress:", ((totalDonations / donationGoal) * 100).toFixed(2), "%")

    console.log("✅ Streamer lookup successful")
    console.log("=== STREAMER LOOKUP END ===")
    console.log("=".repeat(80))

    return NextResponse.json({
      streamer: {
        username: streamer.username,
        displayName: streamer.displayName,
        avatarUrl: streamer.avatarUrl,
        bio: streamer.bio,
        settings: streamer.settings,
        stats: {
          totalDonations,
          donationGoal,
          progress: (totalDonations / donationGoal) * 100,
        },
      },
    })
  } catch (error) {
    console.error("=== STREAMER LOOKUP ERROR ===")
    console.error("Error:", error)
    console.error("Stack:", error instanceof Error ? error.stack : "No stack trace")
    console.log("=".repeat(80))
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
