import prisma from "../lib/db"
import connectToDatabase from "../lib/mongodb"
import mongoose from "mongoose"

async function testConnections() {
  console.log("🔍 Testing database connections...\n")

  // Test PostgreSQL
  console.log("1️⃣  Testing PostgreSQL connection...")
  try {
    await prisma.$connect()
    const result = await prisma.$queryRaw`SELECT version()`
    console.log("✅ PostgreSQL connected successfully")
    console.log("   Version:", result)
  } catch (error) {
    console.error("❌ PostgreSQL connection failed:", error)
    process.exit(1)
  }

  // Test MongoDB
  console.log("\n2️⃣  Testing MongoDB connection...")
  try {
    await connectToDatabase()
    const db = mongoose.connection.db
    const stats = await db.stats()
    console.log("✅ MongoDB connected successfully")
    console.log("   Database:", stats.db)
    console.log("   Collections:", stats.collections)
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error)
    process.exit(1)
  }

  // Test tables exist
  console.log("\n3️⃣  Checking PostgreSQL tables...")
  try {
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `
    console.log("✅ Found tables:", tables)
  } catch (error) {
    console.error("❌ Failed to check tables:", error)
  }

  // Test MongoDB collections
  console.log("\n4️⃣  Checking MongoDB collections...")
  try {
    const db = mongoose.connection.db
    const collections = await db.listCollections().toArray()
    console.log(
      "✅ Found collections:",
      collections.map((c) => c.name),
    )
  } catch (error) {
    console.error("❌ Failed to check collections:", error)
  }

  console.log("\n✅ All database connections are working!\n")

  await prisma.$disconnect()
  await mongoose.disconnect()
  process.exit(0)
}

testConnections()
