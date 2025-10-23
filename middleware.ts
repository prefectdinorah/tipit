import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Пропускаем статические файлы и API роуты
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/uploads") ||
    pathname.startsWith("/alerts/sounds") ||
    pathname.startsWith("/alerts/images")
  ) {
    return NextResponse.next()
  }

  // Handle CORS для API
  if (pathname.startsWith("/api")) {
    if (request.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Credentials": "true",
        },
      })
    }

    const response = NextResponse.next()
    response.headers.set("Access-Control-Allow-Credentials", "true")
    return response
  }

  // Защита главной страницы и других защищённых роутов
  const protectedRoutes = ["/", "/settings", "/donations"]
  const publicRoutes = ["/auth/login", "/auth/register"]
  const isDonationRoute = pathname.startsWith("/donate/")
  const isAlertWidget = pathname.startsWith("/alerts/")

  // Пропускаем публичные страницы, страницы донатов и alert widgets
  if (publicRoutes.includes(pathname) || isDonationRoute || isAlertWidget) {
    // Если пользователь авторизован и пытается зайти на login/register, редиректим на главную
    const token = request.cookies.get("session_token")
    if (token && publicRoutes.includes(pathname)) {
      console.log(`✅ User is logged in, redirecting from ${pathname} to /`)
      return NextResponse.redirect(new URL("/", request.url))
    }
    return NextResponse.next()
  }

  // Проверяем авторизацию для защищённых страниц
  if (protectedRoutes.includes(pathname)) {
    const token = request.cookies.get("session_token") // Исправлено: было "token", должно быть "session_token"
    
    console.log(`🔒 Middleware check for ${pathname}:`, {
      hasToken: !!token,
      tokenValue: token?.value ? `${token.value.substring(0, 10)}...` : 'none',
      cookies: request.cookies.getAll().map((c: any) => c.name)
    })
    
    if (!token) {
      console.log(`❌ No session_token found, redirecting to login`)
      const loginUrl = new URL("/auth/login", request.url)
      return NextResponse.redirect(loginUrl)
    }
    
    console.log(`✅ Session token found, allowing access to ${pathname}`)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
