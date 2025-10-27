"use client"

import { useEffect, useState } from "react"
import type { DonationSettings } from "./donation-settings"
import { cn } from "@/lib/utils"

type DonationFinalPreviewProps = {
  settings: DonationSettings
  donation: {
    name: string
    amount: number
    message: string
  }
  show: boolean
}

export default function DonationFinalPreview({ settings, donation, show }: DonationFinalPreviewProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (show) {
      setIsVisible(true)

      // Play sound
      if (settings.enableSound && settings.soundUrl) {
        const audio = new Audio(settings.soundUrl)
        audio.volume = settings.soundVolume / 100
        audio.play().catch(() => {
          console.log("[v0] Sound playback failed")
        })
        setAudioElement(audio)
      }

      // TTS
      if (settings.enableTTS && "speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance()
        let text = ""

        if (settings.readDonorName) text += `${donation.name} `
        if (settings.readAmount) text += `задонатил ${donation.amount} рублей. `
        if (settings.readMessage && donation.message) text += donation.message

        utterance.text = text
        utterance.rate = settings.ttsSpeed
        utterance.volume = settings.ttsVolume / 100
        utterance.lang = "ru-RU"

        window.speechSynthesis.speak(utterance)
      }

      const timer = setTimeout(() => {
        setIsVisible(false)
      }, settings.duration * 1000)

      return () => {
        clearTimeout(timer)
        if (audioElement) {
          audioElement.pause()
          audioElement.currentTime = 0
        }
        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel()
        }
      }
    } else {
      setIsVisible(false)
    }
  }, [show, settings, donation, audioElement])

  const formatMessage = () => {
    return settings.messageTemplate
      .replace("{name}", settings.showDonorName ? donation.name : "Аноним")
      .replace("{amount}", `${donation.amount}₽`)
      .replace("{message}", donation.message)
  }

  const getAnimationClass = () => {
    if (!isVisible) return "opacity-0 scale-95"

    switch (settings.animationType) {
      case "fade":
        return "animate-in fade-in duration-500"
      case "slide":
        return "animate-in slide-in-from-right duration-500"
      case "bounce":
        return "animate-in zoom-in duration-500 animate-bounce"
      case "zoom":
        return "animate-in zoom-in duration-500"
      default:
        return "animate-in fade-in duration-500"
    }
  }

  return (
    <div className="relative min-h-[500px] overflow-hidden rounded-lg border-2 border-border bg-muted/50 p-8">
      <div className="flex h-full items-center justify-center">
        {!isVisible && (
          <div className="text-center text-muted-foreground">
            <p className="text-lg font-medium">Финальный результат</p>
            <p className="mt-2 text-sm">Нажмите "Отправить тестовый донат" чтобы увидеть анимацию</p>
          </div>
        )}

        {isVisible && (
          <div
            className={cn("relative w-full overflow-hidden rounded-xl shadow-2xl", getAnimationClass())}
            style={{
              backgroundColor: settings.transparentBackground ? "transparent" : settings.backgroundColor,
              minHeight: "400px",
            }}
          >
            {settings.enableImage && settings.imageAsBackground && settings.imageUrl && (
              <img
                src={settings.imageUrl || "/placeholder.svg"}
                alt="Background"
                className="absolute inset-0 h-full w-full object-cover opacity-20"
              />
            )}

            {settings.enableImage && !settings.imageAsBackground && settings.imageUrl && (
              <div
                className="absolute"
                style={{
                  left: `${settings.imagePosition.x}%`,
                  top: `${settings.imagePosition.y}%`,
                  transform: "translate(-50%, -50%)",
                  width: `${settings.imageSize.width}px`,
                  height: `${settings.imageSize.height}px`,
                }}
              >
                <img
                  src={settings.imageUrl || "/placeholder.svg"}
                  alt="Donation"
                  className="h-full w-full object-contain"
                />
              </div>
            )}

            <div
              className="absolute"
              style={{
                left: `${settings.headerPosition.x}%`,
                top: `${settings.headerPosition.y}%`,
                transform: "translate(-50%, -50%)",
                width: `${settings.headerSize.width}px`,
                minHeight: `${settings.headerSize.height}px`,
              }}
            >
              <div className="flex h-full items-center justify-center p-4">
                <div
                  className="text-balance text-center font-bold leading-tight"
                  style={{
                    fontSize: `${settings.headerFontSize}px`,
                    fontFamily: settings.headerFontFamily,
                    color: settings.textColor,
                  }}
                >
                  {formatMessage()}
                </div>
              </div>
            </div>

            {donation.message && (
              <div
                className="absolute"
                style={{
                  left: `${settings.messagePosition.x}%`,
                  top: `${settings.messagePosition.y}%`,
                  transform: "translate(-50%, -50%)",
                  width: `${settings.messageSize.width}px`,
                  minHeight: `${settings.messageSize.height}px`,
                }}
              >
                <div className="flex h-full items-center justify-center p-4">
                  <div
                    className="text-pretty text-center leading-relaxed opacity-90"
                    style={{
                      fontSize: `${settings.messageFontSize}px`,
                      fontFamily: settings.messageFontFamily,
                      color: settings.textColor,
                    }}
                  >
                    {donation.message}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
