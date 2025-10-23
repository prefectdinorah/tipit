// Event Manager для отправки donation alerts через Server-Sent Events
// Хранит активные подключения стримеров и отправляет им события

interface AlertEvent {
  id: string
  type: "donation" | "test"
  donorName: string
  amount: number
  currency: string
  message?: string
  trackRequest?: {
    title: string
    artist: string
  }
  timestamp: number
}

// Map: alertToken -> Set of response streams
const activeConnections = new Map<string, Set<ReadableStreamDefaultController>>()

export class AlertEventManager {
  // Добавить новое подключение
  static addConnection(alertToken: string, controller: ReadableStreamDefaultController) {
    if (!activeConnections.has(alertToken)) {
      activeConnections.set(alertToken, new Set())
    }
    activeConnections.get(alertToken)!.add(controller)
    console.log(`📡 New connection for token: ${alertToken.substring(0, 10)}...`)
    console.log(`📡 Total connections for this token: ${activeConnections.get(alertToken)!.size}`)
  }

  // Удалить подключение
  static removeConnection(alertToken: string, controller: ReadableStreamDefaultController) {
    const connections = activeConnections.get(alertToken)
    if (connections) {
      connections.delete(controller)
      console.log(`📡 Connection removed for token: ${alertToken.substring(0, 10)}...`)
      console.log(`📡 Remaining connections: ${connections.size}`)
      
      if (connections.size === 0) {
        activeConnections.delete(alertToken)
        console.log(`📡 No more connections for token, removed from map`)
      }
    }
  }

  // Отправить событие всем подключениям стримера
  static sendAlert(alertToken: string, event: AlertEvent) {
    const connections = activeConnections.get(alertToken)
    
    if (!connections || connections.size === 0) {
      console.log(`⚠️ No active connections for token: ${alertToken.substring(0, 10)}...`)
      return false
    }

    console.log(`🔔 Sending alert to ${connections.size} connection(s)`)
    console.log(`🔔 Alert data:`, event)

    const data = JSON.stringify(event)
    const message = `data: ${data}\n\n`

    let successCount = 0
    connections.forEach((controller) => {
      try {
        controller.enqueue(new TextEncoder().encode(message))
        successCount++
      } catch (error) {
        console.error(`❌ Failed to send to connection:`, error)
        // Удаляем мертвое подключение
        connections.delete(controller)
      }
    })

    console.log(`✅ Alert sent to ${successCount}/${connections.size} connection(s)`)
    return successCount > 0
  }

  // Получить количество активных подключений
  static getConnectionCount(alertToken: string): number {
    return activeConnections.get(alertToken)?.size || 0
  }

  // Получить всего подключений
  static getTotalConnections(): number {
    let total = 0
    activeConnections.forEach((connections) => {
      total += connections.size
    })
    return total
  }
}
