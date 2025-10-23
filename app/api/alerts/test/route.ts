import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { requireAuth } from "@/lib/auth-middleware"
import { AlertEventManager } from "@/lib/alert-event-manager"

// POST - отправить тестовый alert
export const POST = requireAuth(async (request: NextRequest, user: any) => {
  try {
    console.log("=== TEST ALERT START ===")

    // Получаем alert settings пользователя
    const alertSettings = await prisma.alertSettings.findUnique({
      where: { userId: user.id },
    })

    if (!alertSettings) {
      return NextResponse.json({ error: "Alert settings not found" }, { status: 404 })
    }

    console.log("Alert Token:", alertSettings.alertToken)

    // Создаем тестовый донат
    const testAlert = {
      id: `test-${Date.now()}`,
      type: "test" as const,
      donorName: "Test Donor",
      amount: 50.00,
      currency: "USD",
      message: "This is a test donation alert! 🎉",
      timestamp: Date.now(),
    }

    console.log("Sending test alert:", testAlert)

    // Отправляем через Event Manager
    const sent = AlertEventManager.sendAlert(alertSettings.alertToken, testAlert)

    if (!sent) {
      console.log("⚠️ No active connections to send test alert")
      return NextResponse.json({
        success: false,
        message: "No active alert widget connections. Open the alert widget in OBS first.",
      }, { status: 200 })
    }

    console.log("✅ Test alert sent successfully")
    console.log("=== TEST ALERT END ===")

    return NextResponse.json({
      success: true,
      message: "Test alert sent successfully",
      connectionsCount: AlertEventManager.getConnectionCount(alertSettings.alertToken),
    })
  } catch (error) {
    console.error("=== TEST ALERT ERROR ===")
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to send test alert" }, { status: 500 })
  }
})
