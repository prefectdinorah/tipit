import type { NextRequest } from "next/server"

export function logRequest(request: NextRequest) {
  const timestamp = new Date().toISOString()
  const method = request.method
  const url = request.url
  const headers = Object.fromEntries(request.headers.entries())

  console.log("=".repeat(80))
  console.log(`[${timestamp}] ${method} ${url}`)
  console.log("Headers:", JSON.stringify(headers, null, 2))
  console.log("=".repeat(80))
}
