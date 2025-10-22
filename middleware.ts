import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Пропускаем статические файлы и API роуты
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/images")
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

  // Пропускаем публичные страницы и страницы донатов
  if (publicRoutes.includes(pathname) || isDonationRoute) {
    return NextResponse.next()
  }

  // Проверяем авторизацию для защищённых страниц
  if (protectedRoutes.includes(pathname)) {
    const token = request.cookies.get("token")
    
    if (!token) {
      // Редирект на страницу логина
      const loginUrl = new URL("/auth/login", request.url)
      return NextResponse.redirect(loginUrl)
    }
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
