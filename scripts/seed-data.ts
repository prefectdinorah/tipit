import prisma from "../lib/db"
import connectToDatabase from "../lib/mongodb"
import Donation from "../lib/models/donation"
import { hashPassword, generateDonationId } from "../lib/auth-utils"

async function seedData() {
  console.log("🌱 Seeding database with test data...\n")

  try {
    await connectToDatabase()

    // Создаём тестовых стримеров
    const streamers = [
      {
        username: "test4",
        email: "test4@example.com",
        password: "1234",
        displayName: "Test Streamer",
      },
      {
        username: "gaming_pro",
        email: "gaming@example.com",
        password: "password123",
        displayName: "Pro Gamer",
      },
    ]

    console.log("1️⃣  Creating test streamers...")

    for (const streamerData of streamers) {
      // Проверяем, не существует ли уже
      const existing = await prisma.user.findUnique({
        where: { username: streamerData.username },
      })

      if (existing) {
        console.log(`   ⚠️  Streamer ${streamerData.username} already exists, skipping`)
        continue
      }

      const passwordHash = await hashPassword(streamerData.password)

      const streamer = await prisma.user.create({
        data: {
          username: streamerData.username,
          email: streamerData.email,
          passwordHash,
          displayName: streamerData.displayName,
          isActive: true,
        },
      })

      // Создаём настройки
      await prisma.streamerSettings.create({
        data: {
          userId: streamer.id,
          donationGoal: 1000,
          minDonationAmount: 5,
          trackRequestMinimum: 20,
          currency: "USD",
          theme: "purple",
        },
      })

      console.log(`   ✅ Created streamer: ${streamerData.username} (password: ${streamerData.password})`)

      // Создаём донаты для каждого стримера
      console.log(`   💰 Creating donations for ${streamerData.username}...`)

      const donations = [
        {
          donorName: "Alice",
          amount: 50,
          message: "Great stream! Keep it up!",
          trackRequest: {
            title: "Bohemian Rhapsody",
            artist: "Queen",
            url: "https://youtube.com/watch?v=fJ9rUzIMcZQ",
          },
        },
        {
          donorName: "Bob",
          amount: 25,
          message: "Love your content!",
        },
        {
          donorName: "Charlie",
          amount: 100,
          message: "Amazing gameplay!",
          trackRequest: {
            title: "Stairway to Heaven",
            artist: "Led Zeppelin",
            url: "https://youtube.com/watch?v=QkF3oxziUI4",
          },
        },
        {
          donorName: "Anonymous",
          amount: 15,
          message: "",
          isAnonymous: true,
        },
      ]

      for (const donationData of donations) {
        const donation = await Donation.create({
          donationId: generateDonationId(),
          streamerId: streamer.uuid,
          donorName: donationData.donorName,
          amount: donationData.amount,
          currency: "USD",
          message: donationData.message,
          trackRequest: donationData.trackRequest,
          isAnonymous: donationData.isAnonymous || false,
          paymentMethod: "test",
          paymentStatus: "completed",
          played: Math.random() > 0.5, // Случайно помечаем некоторые как проигранные
          playedAt: Math.random() > 0.5 ? new Date() : null,
        })

        console.log(`      ✅ Created donation: $${donation.amount} from ${donation.donorName}`)
      }

      // Обновляем статистику
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const allDonations = await Donation.find({ streamerId: streamer.uuid })
      const totalAmount = allDonations.reduce((sum, d) => sum + d.amount, 0)
      const highestAmount = Math.max(...allDonations.map((d) => d.amount))

      await prisma.userStatistic.create({
        data: {
          userId: streamer.id,
          date: today,
          totalDonations: totalAmount,
          totalDonors: allDonations.length,
          totalTrackRequests: allDonations.filter((d) => d.trackRequest).length,
          averageDonation: totalAmount / allDonations.length,
          highestDonation: highestAmount,
        },
      })

      console.log(`   📊 Created statistics for ${streamerData.username}\n`)
    }

    console.log("✅ Database seeded successfully!\n")
    console.log("📝 Test accounts:")
    console.log("   - Username: test4, Password: 1234")
    console.log("   - Username: gaming_pro, Password: password123\n")
  } catch (error) {
    console.error("❌ Error seeding database:", error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedData()
