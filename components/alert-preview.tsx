"use client"

import type React from "react"
import { useState, useRef } from "react"
import { cn } from "@/lib/utils"

export type AlertSettings = {
  minAmount: number
  messageTemplate: string
  showDonorName: boolean
  animationType: "fade" | "slide" | "bounce" | "zoom"
  duration: number
  backgroundColor: string
  textColor: string
  transparentBackground: boolean
  headerFontSize: number
  headerFontFamily: string
  messageFontSize: number
  messageFontFamily: string
  headerPosition: { x: number; y: number }
  headerSize: { width: number; height: number }
  messagePosition: { x: number; y: number }
  messageSize: { width: number; height: number }
  enableImage: boolean
  imageUrl: string
  imageSize: { width: number; height: number }
  imagePosition: { x: number; y: number }
  imageAsBackground: boolean
  enableSound: boolean
  soundUrl: string
  soundVolume: number
  enableTTS: boolean
  ttsVoice: "male" | "female" | "robot"
  ttsSpeed: number
  ttsVolume: number
  readDonorName: boolean
  readAmount: boolean
  readMessage: boolean
}

type AlertPreviewProps = {
  settings: AlertSettings
  donation: {
    name: string
    amount: number
    message: string
  }
  onHeaderPositionChange: (position: { x: number; y: number }) => void
  onHeaderSizeChange: (size: { width: number; height: number }) => void
  onMessagePositionChange: (position: { x: number; y: number }) => void
  onMessageSizeChange: (size: { width: number; height: number }) => void
  onImagePositionChange: (position: { x: number; y: number }) => void
  onImageSizeChange: (size: { width: number; height: number }) => void
}

type ResizeHandle = "nw" | "ne" | "sw" | "se" | "n" | "s" | "e" | "w"

export default function AlertPreview({
  settings,
  donation,
  onHeaderPositionChange,
  onHeaderSizeChange,
  onMessagePositionChange,
  onMessageSizeChange,
  onImagePositionChange,
  onImageSizeChange,
}: AlertPreviewProps) {
  const [isDraggingHeader, setIsDraggingHeader] = useState(false)
  const [isDraggingMessage, setIsDraggingMessage] = useState(false)
  const [isDraggingImage, setIsDraggingImage] = useState(false)

  const [resizingHeader, setResizingHeader] = useState<ResizeHandle | null>(null)
  const [resizingMessage, setResizingMessage] = useState<ResizeHandle | null>(null)
  const [resizingImage, setResizingImage] = useState<ResizeHandle | null>(null)

  const [activeElement, setActiveElement] = useState<"header" | "message" | "image" | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const startPosRef = useRef({ x: 0, y: 0, elementX: 0, elementY: 0, width: 0, height: 0 })

  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingHeader(true)
    setActiveElement("header")
    if (containerRef.current) {
      startPosRef.current = {
        x: e.clientX,
        y: e.clientY,
        elementX: settings.headerPosition.x,
        elementY: settings.headerPosition.y,
        width: settings.headerSize.width,
        height: settings.headerSize.height,
      }
    }
  }

  const handleMessageMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingMessage(true)
    setActiveElement("message")
    if (containerRef.current) {
      startPosRef.current = {
        x: e.clientX,
        y: e.clientY,
        elementX: settings.messagePosition.x,
        elementY: settings.messagePosition.y,
        width: settings.messageSize.width,
        height: settings.messageSize.height,
      }
    }
  }

  const handleImageMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingImage(true)
    setActiveElement("image")
    if (containerRef.current) {
      startPosRef.current = {
        x: e.clientX,
        y: e.clientY,
        elementX: settings.imagePosition.x,
        elementY: settings.imagePosition.y,
        width: settings.imageSize.width,
        height: settings.imageSize.height,
      }
    }
  }

  const handleResizeMouseDown = (
    e: React.MouseEvent,
    handle: ResizeHandle,
    element: "header" | "message" | "image",
  ) => {
    e.preventDefault()
    e.stopPropagation()
    setActiveElement(element)

    if (element === "header") {
      setResizingHeader(handle)
      startPosRef.current = {
        x: e.clientX,
        y: e.clientY,
        elementX: settings.headerPosition.x,
        elementY: settings.headerPosition.y,
        width: settings.headerSize.width,
        height: settings.headerSize.height,
      }
    } else if (element === "message") {
      setResizingMessage(handle)
      startPosRef.current = {
        x: e.clientX,
        y: e.clientY,
        elementX: settings.messagePosition.x,
        elementY: settings.messagePosition.y,
        width: settings.messageSize.width,
        height: settings.messageSize.height,
      }
    } else if (element === "image") {
      setResizingImage(handle)
      startPosRef.current = {
        x: e.clientX,
        y: e.clientY,
        elementX: settings.imagePosition.x,
        elementY: settings.imagePosition.y,
        width: settings.imageSize.width,
        height: settings.imageSize.height,
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const deltaX = e.clientX - startPosRef.current.x
    const deltaY = e.clientY - startPosRef.current.y
    const deltaXPercent = (deltaX / rect.width) * 100
    const deltaYPercent = (deltaY / rect.height) * 100

    if (isDraggingHeader) {
      const newX = Math.max(0, Math.min(100, startPosRef.current.elementX + deltaXPercent))
      const newY = Math.max(0, Math.min(100, startPosRef.current.elementY + deltaYPercent))
      onHeaderPositionChange({ x: newX, y: newY })
    }

    if (isDraggingMessage) {
      const newX = Math.max(0, Math.min(100, startPosRef.current.elementX + deltaXPercent))
      const newY = Math.max(0, Math.min(100, startPosRef.current.elementY + deltaYPercent))
      onMessagePositionChange({ x: newX, y: newY })
    }

    if (isDraggingImage) {
      const newX = Math.max(0, Math.min(100, startPosRef.current.elementX + deltaXPercent))
      const newY = Math.max(0, Math.min(100, startPosRef.current.elementY + deltaYPercent))
      onImagePositionChange({ x: newX, y: newY })
    }

    if (resizingHeader) {
      handleResize(resizingHeader, deltaX, deltaY, "header")
    }

    if (resizingMessage) {
      handleResize(resizingMessage, deltaX, deltaY, "message")
    }

    if (resizingImage) {
      handleResize(resizingImage, deltaX, deltaY, "image")
    }
  }

  const handleResize = (
    handle: ResizeHandle,
    deltaX: number,
    deltaY: number,
    element: "header" | "message" | "image",
  ) => {
    const { width: startWidth, height: startHeight, elementX, elementY } = startPosRef.current

    let newWidth = startWidth
    let newHeight = startHeight
    let newX = elementX
    let newY = elementY

    if (handle.includes("e")) newWidth = Math.max(100, startWidth + deltaX)
    if (handle.includes("w")) {
      newWidth = Math.max(100, startWidth - deltaX)
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        newX = elementX + (deltaX / rect.width) * 100
      }
    }
    if (handle.includes("s")) newHeight = Math.max(40, startHeight + deltaY)
    if (handle.includes("n")) {
      newHeight = Math.max(40, startHeight - deltaY)
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        newY = elementY + (deltaY / rect.height) * 100
      }
    }

    if (element === "header") {
      onHeaderSizeChange({ width: newWidth, height: newHeight })
      if (newX !== elementX || newY !== elementY) {
        onHeaderPositionChange({ x: newX, y: newY })
      }
    } else if (element === "message") {
      onMessageSizeChange({ width: newWidth, height: newHeight })
      if (newX !== elementX || newY !== elementY) {
        onMessagePositionChange({ x: newX, y: newY })
      }
    } else if (element === "image") {
      onImageSizeChange({ width: newWidth, height: newHeight })
      if (newX !== elementX || newY !== elementY) {
        onImagePositionChange({ x: newX, y: newY })
      }
    }
  }

  const handleMouseUp = () => {
    setIsDraggingHeader(false)
    setIsDraggingMessage(false)
    setIsDraggingImage(false)
    setResizingHeader(null)
    setResizingMessage(null)
    setResizingImage(null)
  }

  const formatMessage = () => {
    return settings.messageTemplate
      .replace("{name}", settings.showDonorName ? donation.name : "Аноним")
      .replace("{amount}", `${donation.amount}₽`)
      .replace("{message}", donation.message)
  }

  const renderResizeHandles = (isActive: boolean) => {
    if (!isActive) return null

    const handles: ResizeHandle[] = ["nw", "ne", "sw", "se", "n", "s", "e", "w"]
    const handlePositions: Record<ResizeHandle, string> = {
      nw: "top-0 left-0 -translate-x-1/2 -translate-y-1/2 cursor-nw-resize",
      ne: "top-0 right-0 translate-x-1/2 -translate-y-1/2 cursor-ne-resize",
      sw: "bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-sw-resize",
      se: "bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-se-resize",
      n: "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-n-resize",
      s: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 cursor-s-resize",
      e: "top-1/2 right-0 translate-x-1/2 -translate-y-1/2 cursor-e-resize",
      w: "top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 cursor-w-resize",
    }

    return handles.map((handle) => (
      <div
        key={handle}
        className={cn(
          "absolute z-10 h-3 w-3 rounded-full border-2 border-primary bg-background",
          handlePositions[handle],
        )}
        onMouseDown={(e) => {
          const element = isActive ? activeElement : null
          if (element) handleResizeMouseDown(e, handle, element)
        }}
      />
    ))
  }

  return (
    <div
      ref={containerRef}
      className="relative min-h-[500px] overflow-hidden rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={() => setActiveElement(null)}
    >
      <div className="relative h-full w-full p-8">
        <div
          className="relative h-full w-full overflow-hidden rounded-xl"
          style={{
            backgroundColor: settings.transparentBackground ? "transparent" : settings.backgroundColor,
            minHeight: "400px",
          }}
        >
          {settings.enableImage && settings.imageAsBackground && settings.imageUrl && (
            <img
              src={settings.imageUrl}
              alt="Background"
              className="absolute inset-0 h-full w-full object-cover opacity-20"
            />
          )}

          {settings.enableImage && !settings.imageAsBackground && settings.imageUrl && (
            <div
              className={cn(
                "group absolute cursor-move transition-opacity",
                isDraggingImage && "opacity-60",
                activeElement === "image" && "ring-2 ring-primary ring-offset-2",
              )}
              style={{
                left: `${settings.imagePosition.x}%`,
                top: `${settings.imagePosition.y}%`,
                transform: "translate(-50%, -50%)",
                width: `${settings.imageSize.width}px`,
                height: `${settings.imageSize.height}px`,
              }}
              onMouseDown={handleImageMouseDown}
              onClick={(e) => {
                e.stopPropagation()
                setActiveElement("image")
              }}
            >
              <img
                src={settings.imageUrl?.startsWith('/alerts/') ? `/api/alerts/files${settings.imageUrl}` : settings.imageUrl}
                alt="Donation"
                className="h-full w-full object-contain"
                draggable={false}
              />
              {renderResizeHandles(activeElement === "image")}
            </div>
          )}

          <div
            className={cn(
              "group absolute cursor-move transition-opacity",
              isDraggingHeader && "opacity-60",
              activeElement === "header" && "ring-2 ring-primary ring-offset-2",
            )}
            style={{
              left: `${settings.headerPosition.x}%`,
              top: `${settings.headerPosition.y}%`,
              transform: "translate(-50%, -50%)",
              width: `${settings.headerSize.width}px`,
              minHeight: `${settings.headerSize.height}px`,
            }}
            onMouseDown={handleHeaderMouseDown}
            onClick={(e) => {
              e.stopPropagation()
              setActiveElement("header")
            }}
          >
            <div className="flex h-full items-center justify-center rounded-lg bg-black/20 p-4 backdrop-blur-sm">
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
            {renderResizeHandles(activeElement === "header")}
          </div>

          {donation.message && (
            <div
              className={cn(
                "group absolute cursor-move transition-opacity",
                isDraggingMessage && "opacity-60",
                activeElement === "message" && "ring-2 ring-primary ring-offset-2",
              )}
              style={{
                left: `${settings.messagePosition.x}%`,
                top: `${settings.messagePosition.y}%`,
                transform: "translate(-50%, -50%)",
                width: `${settings.messageSize.width}px`,
                minHeight: `${settings.messageSize.height}px`,
              }}
              onMouseDown={handleMessageMouseDown}
              onClick={(e) => {
                e.stopPropagation()
                setActiveElement("message")
              }}
            >
              <div className="flex h-full items-center justify-center rounded-lg bg-black/20 p-4 backdrop-blur-sm">
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
              {renderResizeHandles(activeElement === "message")}
            </div>
          )}
        </div>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          Кликните на элемент, чтобы выбрать его. Перетаскивайте или тяните за углы для изменения размера.
        </div>
      </div>
    </div>
  )
}
