// Правильная конфигурация API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""

console.log("🔧 API Configuration:", {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  API_BASE_URL,
  NODE_ENV: process.env.NODE_ENV,
})

export interface RegisterRequest {
  username: string
  password: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface ApiResponse<T = any> {
  message?: string
  data?: T
  error?: string
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: any,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // Убираем начальный / если он есть
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.substring(1) : endpoint

  // Формируем полный URL
  const url = API_BASE_URL ? `${API_BASE_URL}/${cleanEndpoint}` : `/${cleanEndpoint}`

  console.log("📤 API Request:", {
    url,
    method: options.method || "POST",
    timestamp: new Date().toISOString(),
    baseUrl: API_BASE_URL,
    endpoint: cleanEndpoint,
  })

  const config: RequestInit = {
    method: options.method || "POST",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
    ...options,
  }

  try {
    console.log("🌐 Fetching:", url)
    const response = await fetch(url, config)

    console.log("📥 Response:", {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
    })

    if (response.ok) {
      const contentType = response.headers.get("content-type")

      if (contentType && contentType.includes("application/json")) {
        const data = await response.json()
        console.log("✅ Success:", data)
        return data
      } else {
        console.log("✅ Success (non-JSON)")
        return { message: "Success" } as T
      }
    } else {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`
      let errorDetails = null

      try {
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || errorMessage
          errorDetails = errorData.details
          console.error("❌ Error response:", errorData)
        } else {
          const errorText = await response.text()
          errorMessage = errorText || errorMessage
          console.error("❌ Error text:", errorText)
        }
      } catch (parseError) {
        console.error("❌ Error parsing error response:", parseError)
      }

      throw new ApiError(response.status, errorMessage, errorDetails)
    }
  } catch (error) {
    console.error("❌ API Request failed:", error)

    if (error instanceof ApiError) {
      throw error
    }

    if (error instanceof TypeError) {
      if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
        throw new ApiError(0, "Cannot connect to server. Please check if the server is running.")
      }
    }

    throw new ApiError(0, `Request failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export const authApi = {
  register: async (data: RegisterRequest): Promise<ApiResponse> => {
    console.log("🔐 Register attempt:", { username: data.username })
    return apiRequest("api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  login: async (data: LoginRequest): Promise<ApiResponse> => {
    console.log("🔐 Login attempt:", { username: data.username })
    return apiRequest("api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  logout: async (): Promise<ApiResponse> => {
    console.log("🚪 Logout attempt")
    return apiRequest("api/auth/logout", {
      method: "POST",
    })
  },

  getSession: async (): Promise<ApiResponse> => {
    console.log("🔍 Check session")
    return apiRequest("api/auth/session", {
      method: "GET",
    })
  },
}
