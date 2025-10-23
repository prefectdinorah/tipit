"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useSearchParams } from "next/navigation"

interface AlertData {
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

interface AlertSettings {
  fontSize: number
  fontFamily: string
  textColor: string
  textAnimation: string
  duration: number
  position: string
  imageEnabled: boolean
  imageUrl: string | null
  imageSize: number
  soundEnabled: boolean
  soundUrl: string | null
  soundVolume: number
  ttsEnabled: boolean
  ttsVoice: string
  ttsSpeed: number
  ttsVolume: number
}

export default function AlertWidgetPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const username = params.username as string
  const token = searchParams.get("token")

  const [settings, setSettings] = useState<AlertSettings | null>(null)
  const [currentAlert, setCurrentAlert] = useState<AlertData | null>(null)
  const [alertQueue, setAlertQueue] = useState<AlertData[]>([])
  const [isPlaying, setIsPlaying] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  // Загрузка настроек при монтировании
  useEffect(() => {
    if (!username || !token) {
      console.error("Missing username or token")
      return
    }

    loadSettings()
    connectToSSE()

    return () => {
      // Очистка при размонтировании
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [username, token])

  const loadSettings = async () => {
    try {
      const response = await fetch(`/api/alerts/settings`, {
        credentials: "include",
      })
      
      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings)
        console.log("✅ Settings loaded:", data.settings)
      } else {
        console.error("❌ Failed to load settings")
      }
    } catch (error) {
      console.error("❌ Error loading settings:", error)
    }
  }

  const connectToSSE = () => {
    const url = `/api/alerts/stream?username=${username}&token=${token}`
    console.log("📡 Connecting to SSE:", url)

    const eventSource = new EventSource(url)
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      console.log("✅ SSE connected")
    }

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log("📨 SSE message received:", data)

        if (data.type === "connected" || data.type === "ping") {
          // Игнорируем служебные сообщения
          return
        }

        if (data.type === "donation" || data.type === "test") {
          // Добавляем в очередь
          setAlertQueue((prev) => [...prev, data])
        }
      } catch (error) {
        console.error("❌ Error parsing SSE message:", error)
      }
    }

    eventSource.onerror = (error) => {
      console.error("❌ SSE error:", error)
      eventSource.close()
      
      // Переподключение через 5 секунд
      setTimeout(() => {
        console.log("🔄 Reconnecting to SSE...")
        connectToSSE()
      }, 5000)
    }
  }

  // Обработка очереди alerts
  useEffect(() => {
    if (!isPlaying && alertQueue.length > 0 && settings) {
      // Берем первый alert из очереди
      const nextAlert = alertQueue[0]
      setAlertQueue((prev) => prev.slice(1))
      showAlert(nextAlert)
    }
  }, [alertQueue, isPlaying, settings])

  const showAlert = async (alert: AlertData) => {
    console.log("🔔 Showing alert:", alert)
    setIsPlaying(true)
    setCurrentAlert(alert)

    // Воспроизводим звук
    if (settings?.soundEnabled && settings.soundUrl) {
      playSound(settings.soundUrl, settings.soundVolume)
    }

    // TTS озвучка сообщения
    if (settings?.ttsEnabled && alert.message) {
      speakText(alert.message, settings.ttsVoice, settings.ttsSpeed, settings.ttsVolume)
    }

    // Показываем alert на duration секунд
    const duration = (settings?.duration || 5) * 1000
    setTimeout(() => {
      setCurrentAlert(null)
      setIsPlaying(false)
    }, duration)
  }

  const playSound = (url: string, volume: number) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause()
      }

      const audio = new Audio(url)
      audio.volume = volume / 100
      audio.play().catch((error) => {
        console.error("❌ Error playing sound:", error)
      })
      audioRef.current = audio
    } catch (error) {
      console.error("❌ Error creating audio:", error)
    }
  }

  const speakText = (text: string, voice: string, speed: number, volume: number) => {
    try {
      // Web Speech API
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = voice
      utterance.rate = speed
      utterance.volume = volume / 100

      // Пытаемся найти нужный голос
      const voices = speechSynthesis.getVoices()
      const selectedVoice = voices.find((v) => v.lang === voice || v.name.includes(voice))
      if (selectedVoice) {
        utterance.voice = selectedVoice
      }

      speechSynthesis.speak(utterance)
    } catch (error) {
      console.error("❌ TTS error:", error)
    }
  }

  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      RUB: "₽",
    }
    return symbols[currency] || currency
  }

  if (!settings || !currentAlert) {
    return (
      <div className="fixed inset-0 bg-transparent">
        {/* Пустая прозрачная страница когда нет alerts */}
      </div>
    )
  }

  const { fontSize, fontFamily, textColor, textAnimation, position, imageEnabled, imageUrl, imageSize } = settings
  const { donorName, amount, currency, message } = currentAlert

  const currencySymbol = getCurrencySymbol(currency)

  // Определяем позицию
  const positionClasses = {
    top: "justify-start pt-16",
    center: "justify-center",
    bottom: "justify-end pb-16",
  }

  // Определяем анимацию
  const animationClasses = {
    fade: "animate-fade-in",
    slide: "animate-slide-in",
    bounce: "animate-bounce-in",
    zoom: "animate-zoom-in",
  }

  return (
    <div className={`fixed inset-0 flex items-center ${positionClasses[position as keyof typeof positionClasses] || positionClasses.center} pointer-events-none`}>
      <div
        className={`${animationClasses[textAnimation as keyof typeof animationClasses] || animationClasses.slide} bg-gradient-to-r from-purple-900/90 to-pink-900/90 backdrop-blur-md rounded-2xl shadow-2xl border-4 border-purple-500/50 p-8 max-w-2xl mx-auto`}
        style={{ fontFamily }}
      >
        <div className="flex items-center gap-6">
          {/* Image */}
          {imageEnabled && imageUrl && (
            <div className="flex-shrink-0">
              <img
                src={imageUrl}
                alt="Alert"
                style={{ width: `${imageSize}px`, height: `${imageSize}px` }}
                className="object-contain"
              />
            </div>
          )}

          {/* Text Content */}
          <div className="flex-1">
            {/* Amount */}
            <div
              className="font-bold mb-2"
              style={{
                fontSize: `${fontSize}px`,
                color: textColor,
              }}
            >
              💰 {currencySymbol}{amount.toFixed(2)}
            </div>

            {/* Donor Name */}
            <div
              className="font-semibold mb-2"
              style={{
                fontSize: `${fontSize * 0.6}px`,
                color: textColor,
                opacity: 0.9,
              }}
            >
              from {donorName}
            </div>

            {/* Message */}
            {message && (
              <div
                className="italic"
                style={{
                  fontSize: `${fontSize * 0.5}px`,
                  color: textColor,
                  opacity: 0.8,
                }}
              >
                "{message}"
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Animations CSS */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes bounceIn {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes zoomIn {
          from { transform: scale(0) rotate(-180deg); opacity: 0; }
          to { transform: scale(1) rotate(0); opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-slide-in {
          animation: slideIn 0.6s ease-out;
        }
        .animate-bounce-in {
          animation: bounceIn 0.7s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        .animate-zoom-in {
          animation: zoomIn 0.8s ease-out;
        }
      `}</style>
    </div>
  )
}
