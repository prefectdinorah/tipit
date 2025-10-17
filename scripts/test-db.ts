// Загружаем переменные окружения из .env
import { config } from "dotenv"
import { resolve } from "path"

// Загружаем .env файл
config({ path: resolve(process.cwd(), ".env") })

console.log("🔍 Starting database connection test...")
console.log("")

// Проверяем, что переменные загружены
console.log("📋 Environment variables:")
console.log("   DATABASE_URL:", process.env.DATABASE_URL ? "✅ Loaded" : "❌ Missing")
console.log("   MONGODB_URI:", process.env.MONGODB_URI ? "✅ Loaded" : "❌ Missing")
console.log("")

if (!process.env.DATABASE_URL || !process.env.MONGODB_URI) {
  console.error("❌ Environment variables not loaded!")
  console.error("Make sure .env file exists in the project root")
  process.exit(1)
}

// Тест PostgreSQL
console.log("1️⃣ Testing PostgreSQL...")
console.log("   Connection string:", process.env.DATABASE_URL.replace(/:[^:@]+@/, ":****@"))

const { Pool } = require("pg")
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
})

pool
  .query("SELECT version(), current_database(), current_user")
  .then((result: any) => {
    console.log("✅ PostgreSQL connected successfully")
    console.log("   Database:", result.rows[0].current_database)
    console.log("   User:", result.rows[0].current_user)
    console.log("   Version:", result.rows[0].version.split(" ").slice(0, 2).join(" "))
    return pool.end()
  })
  .catch((err: any) => {
    console.error("❌ PostgreSQL connection failed:")
    console.error("   Error:", err.message)
    if (err.code) console.error("   Code:", err.code)
    console.error("")
    console.error("💡 Troubleshooting:")
    console.error("   1. Check if PostgreSQL is accepting connections from this IP")
    console.error("   2. Verify firewall allows port 5432")
    console.error("   3. Check pg_hba.conf on database server")
    process.exit(1)
  })
  .then(() => {
    // Тест MongoDB
    console.log("")
    console.log("2️⃣ Testing MongoDB...")
    console.log("   Connection string:", process.env.MONGODB_URI?.replace(/:[^:@]+@/, ":****@"))

    const mongoose = require("mongoose")

    return mongoose
      .connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      })
      .then(() => {
        console.log("✅ MongoDB connected successfully")
        console.log("   Database:", mongoose.connection.db.databaseName)
        console.log("   User:", mongoose.connection.user)

        // Получаем статистику текущей базы (не admin)
        return mongoose.connection.db.stats()
      })
      .then((stats: any) => {
        console.log("   Collections:", stats.collections)
        console.log("   Data Size:", (stats.dataSize / 1024).toFixed(2), "KB")

        // Тестируем создание коллекции
        return mongoose.connection.db.listCollections().toArray()
      })
      .then((collections: any) => {
        console.log("   Available collections:", collections.length)
        if (collections.length > 0) {
          console.log("   Found:", collections.map((c: any) => c.name).join(", "))
        }
        return mongoose.disconnect()
      })
      .catch((err: any) => {
        console.error("❌ MongoDB connection failed:")
        console.error("   Error:", err.message)
        if (err.code) console.error("   Code:", err.code)
        console.error("")
        console.error("💡 Troubleshooting:")
        console.error("   1. Check if MongoDB is accepting connections from this IP")
        console.error("   2. Verify firewall allows port 27017")
        console.error("   3. Check bindIp in /etc/mongod.conf")
        console.error("   4. Verify user has correct permissions on database")
        process.exit(1)
      })
  })
  .then(() => {
    console.log("")
    console.log("✅ All database connections are working!")
    console.log("")
    console.log("📝 Next steps:")
    console.log("   1. Run migrations: npm run prisma:migrate")
    console.log("   2. Seed data: npm run seed")
    console.log("   3. Start app: npm run dev")
    console.log("")
    process.exit(0)
  })
  .catch((err: any) => {
    console.error("")
    console.error("❌ Unexpected error:", err.message)
    console.log("")
    process.exit(1)
  })
