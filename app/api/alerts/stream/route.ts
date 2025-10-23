import { type NextRequest } from "next/server"
import prisma from "@/lib/db"
import { AlertEventManager } from "@/lib/alert-event-manager"

// Server-Sent Events endpoint для получения donation alerts в real-time
export async function GET(request: NextRequest) {
  console.log("=== SSE CONNECTION START ===")
  
  const searchParams = request.nextUrl.searchParams
  const username = searchParams.get("username")
  const token = searchParams.get("token")

  console.log("Request params:", { username, token: token?.substring(0, 10) + "..." })

  // Валидация параметров
  if (!username || !token) {
    console.log("❌ Missing username or token")
    return new Response("Missing username or token", { status: 400 })
  }

  try {
    // Проверяем пользователя и токен
    const user = await prisma.user.findUnique({
      where: { username },
      include: { settings: true },
    })

    if (!user) {
      console.log("❌ User not found:", username)
      return new Response("User not found", { status: 404 })
    }

    // Получаем alert settings
    const alertSettings = await prisma.alertSettings.findUnique({
      where: { userId: user.id },
    })

    if (!alertSettings || alertSettings.alertToken !== token) {
      console.log("❌ Invalid token for user:", username)
      return new Response("Invalid token", { status: 401 })
    }

    console.log("✅ User and token validated")
    console.log("Alert Token:", alertSettings.alertToken)

    // Создаем SSE stream
    const stream = new ReadableStream({
      start(controller) {
        console.log("📡 SSE stream started")
        
        // Добавляем подключение в менеджер
        AlertEventManager.addConnection(alertSettings.alertToken, controller)

        // Отправляем начальное сообщение (heartbeat)
        const welcome = `data: ${JSON.stringify({ type: "connected", timestamp: Date.now() })}\n\n`
        controller.enqueue(new TextEncoder().encode(welcome))

        // Keep-alive: отправляем пинг каждые 30 секунд
        const keepAliveInterval = setInterval(() => {
          try {
            const ping = `data: ${JSON.stringify({ type: "ping", timestamp: Date.now() })}\n\n`
            controller.enqueue(new TextEncoder().encode(ping))
          } catch (error) {
            console.log("❌ Keep-alive failed, clearing interval")
            clearInterval(keepAliveInterval)
          }
        }, 30000)

        // Обработка закрытия соединения
        request.signal.addEventListener("abort", () => {
          console.log("📡 SSE connection closed")
          clearInterval(keepAliveInterval)
          AlertEventManager.removeConnection(alertSettings.alertToken, controller)
          controller.close()
        })
      },
    })

    console.log("=== SSE CONNECTION ESTABLISHED ===")

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no", // Отключаем буферизацию в Nginx
      },
    })
  } catch (error) {
    console.error("=== SSE CONNECTION ERROR ===")
    console.error("Error:", error)
    return new Response("Internal server error", { status: 500 })
  }
}
