"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ToastProps {
  id: string
  title?: string
  description?: string
  type?: "success" | "error" | "info"
  duration?: number
  onClose: (id: string) => void
}

export function Toast({ id, title, description, type = "info", onClose }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id)
    }, 5000)

    return () => clearTimeout(timer)
  }, [id, onClose])

  const typeStyles = {
    success: "bg-green-600 border-green-500",
    error: "bg-red-600 border-red-500",
    info: "bg-purple-600 border-purple-500",
  }

  return (
    <div
      className={cn(
        "w-96 rounded-lg border p-4 shadow-2xl backdrop-blur-sm animate-in slide-in-from-right-full",
        typeStyles[type],
      )}
      style={{ zIndex: 99999 }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {title && <h4 className="text-sm font-semibold text-white mb-1">{title}</h4>}
          {description && <p className="text-sm text-white break-words">{description}</p>}
        </div>
        <button
          onClick={() => onClose(id)}
          className="text-white/80 hover:text-white transition-colors flex-shrink-0 mt-0.5"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export function useToast() {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const addToast = React.useCallback((toast: Omit<ToastProps, "id" | "onClose">) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { ...toast, id, onClose: removeToast }])
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const ToastContainer = React.useCallback(
    () => (
      <>
        {toasts.length > 0 && (
          <div
            className="fixed top-20 right-4 flex flex-col gap-3 pointer-events-none"
            style={{ zIndex: 99999 }}
            role="region"
            aria-live="polite"
            aria-label="Notifications"
          >
            {toasts.map((toast) => (
              <div key={toast.id} className="pointer-events-auto">
                <Toast {...toast} />
              </div>
            ))}
          </div>
        )}
      </>
    ),
    [toasts],
  )

  return {
    toast: addToast,
    ToastContainer,
  }
}
