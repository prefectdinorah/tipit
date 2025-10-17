// Быстрый тест подключения к базам данных
console.log("🔍 Starting database connection test...")
console.log("")

// Тест PostgreSQL
console.log("1️⃣ Testing PostgreSQL...")
console.log("Connection string:", process.env.DATABASE_URL?.replace(/:[^:@]+@/, ":****@"))

const { Pool } = require("pg")
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
})

pool
  .query("SELECT version(), current_database()")
  .then((result: any) => {
    console.log("✅ PostgreSQL connected successfully")
    console.log("   Database:", result.rows[0].current_database)
    console.log("   Version:", result.rows[0].version.split(" ").slice(0, 2).join(" "))
    return pool.end()
  })
  .catch((err: any) => {
    console.error("❌ PostgreSQL connection failed:")
    console.error("   Error:", err.message)
    if (err.code) console.error("   Code:", err.code)
  })
  .then(() => {
    // Тест MongoDB
    console.log("")
    console.log("2️⃣ Testing MongoDB...")
    console.log("Connection string:", process.env.MONGODB_URI?.replace(/:[^:@]+@/, ":****@"))

    const mongoose = require("mongoose")

    mongoose
      .connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      })
      .then(() => {
        console.log("✅ MongoDB connected successfully")
        console.log("   Database:", mongoose.connection.db.databaseName)
        return mongoose.connection.db.admin().serverStatus()
      })
      .then((status: any) => {
        console.log("   Version:", status.version)
        console.log("   Uptime:", Math.floor(status.uptime / 60), "minutes")
        return mongoose.disconnect()
      })
      .then(() => {
        console.log("")
        console.log("✅ All tests passed!")
        console.log("")
        process.exit(0)
      })
      .catch((err: any) => {
        console.error("❌ MongoDB connection failed:")
        console.error("   Error:", err.message)
        if (err.code) console.error("   Code:", err.code)
        console.log("")
        process.exit(1)
      })
  })
