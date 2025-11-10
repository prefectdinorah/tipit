"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  User,
  Bell,
  Palette,
  Music,
  DollarSign,
  Shield,
  Upload,
  Save,
  SettingsIcon,
  Loader2,
  Twitch,
  Link as LinkIcon,
} from "lucide-react"
import { useToast } from "@/components/ui/toast"
import SecuritySettings from "@/components/settings/security-settings"

interface Settings {
  // Profile
  displayName: string
  username: string
  email: string
  timezone: string
  bio: string
  
  // Twitch integration
  twitchUsername: string | null
  twitchId: string | null
  isLive: boolean

  // Donations
  donationGoal: number
  donationGoalDescription: string
  minDonationAmount: number
  trackRequestMinimum: number
  currency: string

  // Alerts
  alertVolume: number
  alertDuration: number
  soundAlertEnabled: boolean
  visualAlertEnabled: boolean
  ttsEnabled: boolean

  // Appearance
  theme: string
  primaryColor: string
  accentColor: string
}

interface AlertSettings {
  alertToken: string
  // General
  minAmount: number
  messageTemplate: string
  showDonorName: boolean
  // Visual
  animationType: "fade" | "slide" | "bounce" | "zoom"
  duration: number
  backgroundColor: string
  textColor: string
  transparentBackground: boolean
  // Header (template)
  headerFontSize: number
  headerFontFamily: string
  headerPositionX: number
  headerPositionY: number
  headerWidth: number
  headerHeight: number
  // Message
  messageFontSize: number
  messageFontFamily: string
  messagePositionX: number
  messagePositionY: number
  messageWidth: number
  messageHeight: number
  // Image
  enableImage: boolean
  imageUrl: string | null
  imageWidth: number
  imageHeight: number
  imagePositionX: number
  imagePositionY: number
  imageAsBackground: boolean
  // Sound
  enableSound: boolean
  soundUrl: string | null
  soundVolume: number
  // TTS
  enableTTS: boolean
  ttsVoice: "male" | "female" | "robot"
  ttsSpeed: number
  ttsVolume: number
  readDonorName: boolean
  readAmount: boolean
  readMessage: boolean
}

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false)
  const [isUploadingSound, setIsUploadingSound] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const [alertSettings, setAlertSettings] = useState<AlertSettings>({
    alertToken: "",
    // General
    minAmount: 1,
    messageTemplate: "{name} задонатил {amount}!",
    showDonorName: true,
    // Visual
    animationType: "slide",
    duration: 5,
    backgroundColor: "#6366f1",
    textColor: "#ffffff",
    transparentBackground: false,
    // Header
    headerFontSize: 24,
    headerFontFamily: "sans-serif",
    headerPositionX: 50,
    headerPositionY: 30,
    headerWidth: 400,
    headerHeight: 60,
    // Message
    messageFontSize: 18,
    messageFontFamily: "sans-serif",
    messagePositionX: 50,
    messagePositionY: 70,
    messageWidth: 400,
    messageHeight: 80,
    // Image
    enableImage: true,
    imageUrl: null,
    imageWidth: 80,
    imageHeight: 80,
    imagePositionX: 20,
    imagePositionY: 50,
    imageAsBackground: false,
    // Sound
    enableSound: true,
    soundUrl: null,
    soundVolume: 70,
    // TTS
    enableTTS: false,
    ttsVoice: "female",
    ttsSpeed: 1.0,
    ttsVolume: 80,
    readDonorName: true,
    readAmount: true,
    readMessage: true,
  })

  const [settings, setSettings] = useState<Settings>({
    displayName: "",
    username: "",
    email: "",
    timezone: "UTC",
    bio: "",
    donationGoal: 1000,
    donationGoalDescription: "New Gaming Setup",
    minDonationAmount: 5,
    trackRequestMinimum: 20,
    currency: "USD",
    alertVolume: 75,
    alertDuration: 5,
    soundAlertEnabled: true,
    visualAlertEnabled: true,
    ttsEnabled: false,
    theme: "purple",
    primaryColor: "#7c3aed",
    accentColor: "#ec4899",
  })

  const { toast, ToastContainer } = useToast()

  // Загружаем настройки
  useEffect(() => {
    loadSettings()
    loadAlertSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setIsLoading(true)

      // Загружаем данные пользователя
      const sessionResponse = await fetch("/api/auth/session", {
        credentials: "include",
      })

      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json()
        if (sessionData.user) {
          setSettings((prev) => ({
            ...prev,
            username: sessionData.user.username || "",
            email: sessionData.user.email || "",
            displayName: sessionData.user.displayName || "",
            timezone: sessionData.user.timezone || "UTC", // Добавлено
          }))
          setAvatarUrl(sessionData.user.avatarUrl) // Добавить эту строку
        }
      }

      // Загружаем настройки
      const settingsResponse = await fetch("/api/settings", {
        credentials: "include",
      })

      if (settingsResponse.ok) {
        const data = await settingsResponse.json()
        if (data.settings) {
          setSettings((prev) => ({
            ...prev,
            donationGoal: data.settings.donationGoal || 1000,
            donationGoalDescription: data.settings.donationGoalDescription || "New Gaming Setup",
            minDonationAmount: Number(data.settings.minDonationAmount) || 5,
            trackRequestMinimum: Number(data.settings.trackRequestMinimum) || 20,
            alertVolume: data.settings.alertVolume || 75,
            alertDuration: data.settings.alertDuration || 5,
            soundAlertEnabled: data.settings.soundAlertEnabled ?? true,
            visualAlertEnabled: data.settings.visualAlertEnabled ?? true,
            ttsEnabled: data.settings.ttsEnabled ?? false,
            theme: data.settings.theme || "purple",
            primaryColor: data.settings.primaryColor || "#7c3aed",
            accentColor: data.settings.accentColor || "#ec4899",
            currency: data.settings.currency || "USD",
          }))
        }
      }
    } catch (error) {
      console.error("Failed to load settings:", error)
      toast({
        type: "error",
        title: "Load Failed",
        description: "Failed to load settings. Please refresh the page.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const loadAlertSettings = async () => {
    try {
      setIsLoadingAlerts(true)
      const response = await fetch("/api/alerts/settings", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        if (data.settings) {
          setAlertSettings(data.settings)
        }
      }
    } catch (error) {
      console.error("Failed to load alert settings:", error)
      toast({
        type: "error",
        title: "Load Failed",
        description: "Failed to load alert settings",
      })
    } finally {
      setIsLoadingAlerts(false)
    }
  }

  const updateAlertSetting = <K extends keyof AlertSettings>(key: K, value: AlertSettings[K]) => {
    setAlertSettings((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleSaveAlertSettings = async () => {
    setIsSaving(true)

    try {
      // Отправляем только нужные поля (без id, userId, createdAt, updatedAt, alertToken)
      const payload = {
        fontSize: alertSettings.fontSize,
        fontFamily: alertSettings.fontFamily,
        textColor: alertSettings.textColor,
        textAnimation: alertSettings.textAnimation,
        duration: alertSettings.duration,
        position: alertSettings.position,
        minAmount: Number(alertSettings.minAmount), // Конвертируем в number
        imageEnabled: alertSettings.imageEnabled,
        imageUrl: alertSettings.imageUrl,
        imageSize: alertSettings.imageSize,
        soundEnabled: alertSettings.soundEnabled,
        soundUrl: alertSettings.soundUrl,
        soundVolume: alertSettings.soundVolume,
        ttsEnabled: alertSettings.ttsEnabled,
        ttsVoice: alertSettings.ttsVoice,
        ttsSpeed: alertSettings.ttsSpeed,
        ttsVolume: alertSettings.ttsVolume,
      }

      const response = await fetch("/api/alerts/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save alert settings")
      }

      const data = await response.json()
      
      // Обновляем state с данными с сервера (включая alertToken если был создан)
      if (data.settings) {
        setAlertSettings(data.settings)
      }

      setHasChanges(false)
      toast({
        type: "success",
        title: "Alert Settings Saved",
        description: "Your alert settings have been saved successfully!",
      })
    } catch (error) {
      toast({
        type: "error",
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save alert settings",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSoundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("audio/")) {
      toast({
        type: "error",
        title: "Invalid File",
        description: "Please upload an audio file (MP3, WAV, etc.)",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        type: "error",
        title: "File Too Large",
        description: "Sound file must be less than 5MB",
      })
      return
    }

    setIsUploadingSound(true)

    try {
      const formData = new FormData()
      formData.append("sound", file)

      const response = await fetch("/api/alerts/upload/sound", {
        method: "POST",
        credentials: "include",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to upload sound")
      }

      const data = await response.json()
      
      console.log('🔊 Sound uploaded:', data.soundUrl)
      
      // Сразу сохраняем в БД с новым soundUrl
      const updatedSettings = {
        ...alertSettings,
        soundUrl: data.soundUrl,
      }
      
      console.log('💾 Saving to server:', { soundUrl: updatedSettings.soundUrl })
      
      await saveAlertSettingsToServer(updatedSettings)
      
      // Обновляем локальный state после успешного сохранения
      updateAlertSetting("soundUrl", data.soundUrl)

      toast({
        type: "success",
        title: "Sound Uploaded & Saved",
        description: "Custom sound has been uploaded and saved successfully!",
      })
    } catch (error) {
      toast({
        type: "error",
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload sound",
      })
    } finally {
      setIsUploadingSound(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast({
        type: "error",
        title: "Invalid File",
        description: "Please upload an image file (JPG, PNG, GIF, etc.)",
      })
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        type: "error",
        title: "File Too Large",
        description: "Image file must be less than 10MB",
      })
      return
    }

    setIsUploadingImage(true)

    try {
      const formData = new FormData()
      formData.append("image", file)

      const response = await fetch("/api/alerts/upload/image", {
        method: "POST",
        credentials: "include",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to upload image")
      }

      const data = await response.json()
      
      console.log('🖼️ Image uploaded:', data.imageUrl)
      
      // Сразу сохраняем в БД с новым imageUrl
      const updatedSettings = {
        ...alertSettings,
        imageUrl: data.imageUrl,
      }
      
      console.log('💾 Saving to server:', { imageUrl: updatedSettings.imageUrl })
      
      await saveAlertSettingsToServer(updatedSettings)
      
      // Обновляем локальный state после успешного сохранения
      updateAlertSetting("imageUrl", data.imageUrl)

      toast({
        type: "success",
        title: "Image Uploaded & Saved",
        description: "Custom image has been uploaded and saved successfully!",
      })
    } catch (error) {
      toast({
        type: "error",
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
      })
    } finally {
      setIsUploadingImage(false)
    }
  }

  // Вспомогательная функция для сохранения на сервер
  const saveAlertSettingsToServer = async (settings: typeof alertSettings) => {
    const payload = {
      fontSize: settings.fontSize,
      fontFamily: settings.fontFamily,
      textColor: settings.textColor,
      textAnimation: settings.textAnimation,
      duration: settings.duration,
      position: settings.position,
      minAmount: Number(settings.minAmount),
      imageEnabled: settings.imageEnabled,
      imageUrl: settings.imageUrl,
      imageSize: settings.imageSize,
      soundEnabled: settings.soundEnabled,
      soundUrl: settings.soundUrl,
      soundVolume: settings.soundVolume,
      ttsEnabled: settings.ttsEnabled,
      ttsVoice: settings.ttsVoice,
      ttsSpeed: settings.ttsSpeed,
      ttsVolume: settings.ttsVolume,
    }
    
    console.log('📤 Payload to server:', payload)

    const response = await fetch("/api/alerts/settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error("Failed to save alert settings")
    }

    const data = await response.json()
    console.log('✅ Server response:', data)
    
    if (data.settings) {
      setAlertSettings(data.settings)
    }
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)

    try {
      // Сохраняем настройки стримера
      const settingsResponse = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          donationGoal: settings.donationGoal,
          donationGoalDescription: settings.donationGoalDescription,
          minDonationAmount: settings.minDonationAmount,
          trackRequestMinimum: settings.trackRequestMinimum,
          alertVolume: settings.alertVolume,
          alertDuration: settings.alertDuration,
          soundAlertEnabled: settings.soundAlertEnabled,
          visualAlertEnabled: settings.visualAlertEnabled,
          ttsEnabled: settings.ttsEnabled,
          theme: settings.theme,
          primaryColor: settings.primaryColor,
          accentColor: settings.accentColor,
          currency: settings.currency,
        }),
      })

      if (!settingsResponse.ok) {
        const error = await settingsResponse.json()
        throw new Error(error.error || "Failed to save settings")
      }

      // Сохраняем профиль пользователя
      const profileResponse = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          displayName: settings.displayName,
          email: settings.email,
          bio: settings.bio,
          timezone: settings.timezone,
        }),
      })

      if (!profileResponse.ok) {
        const error = await profileResponse.json()
        throw new Error(error.error || "Failed to save profile")
      }

      setHasChanges(false)
      toast({
        type: "success",
        title: "Settings Saved",
        description: "All your settings have been saved successfully!",
      })
    } catch (error) {
      toast({
        type: "error",
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save settings. Please try again.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Проверка типа файла
    if (!file.type.startsWith("image/")) {
      toast({
        type: "error",
        title: "Invalid File",
        description: "Please upload an image file (JPG, PNG, etc.)",
      })
      return
    }

    // Проверка размера файла (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        type: "error",
        title: "File Too Large",
        description: "Image must be less than 5MB",
      })
      return
    }

    setIsUploadingAvatar(true)

    try {
      const formData = new FormData()
      formData.append("avatar", file)

      const response = await fetch("/api/user/avatar", {
        method: "POST",
        credentials: "include",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to upload avatar")
      }

      const data = await response.json()

      // Добавляем случайный параметр чтобы обойти кэш браузера
      const newAvatarUrl = `${data.avatarUrl}?t=${Date.now()}`
      setAvatarUrl(newAvatarUrl)

      // Отправляем событие для обновления аватарки на всех страницах
      window.dispatchEvent(
        new CustomEvent("avatarUpdated", {
          detail: { avatarUrl: newAvatarUrl },
        }),
      )

      toast({
        type: "success",
        title: "Avatar Updated",
        description: "Your avatar has been updated successfully!",
      })

      // Перезагружаем настройки чтобы обновить все аватарки на странице
      loadSettings()
    } catch (error) {
      toast({
        type: "error",
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload avatar",
      })
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <ToastContainer />

      <header className="border-b border-purple-800/30 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-purple-300 hover:text-white hover:bg-purple-800/30">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <SettingsIcon className="h-6 w-6 text-purple-400" />
                <h1 className="text-2xl font-bold text-white">Settings</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Avatar className="h-10 w-10 border-2 border-purple-500">
                <AvatarImage src={avatarUrl || "/placeholder.svg?height=40&width=40"} />
                <AvatarFallback className="bg-purple-600 text-white">
                  {settings.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-right">
                <p className="text-white font-medium">{settings.displayName || settings.username}</p>
                <p className="text-purple-300 text-sm">Premium Account</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="grid w-full grid-cols-6 bg-slate-800/50 border border-purple-800/30">
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-white/90 hover:text-white"
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="donations"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-white/90 hover:text-white"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Donations
            </TabsTrigger>
            <TabsTrigger
              value="alerts"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-white/90 hover:text-white"
            >
              <Bell className="h-4 w-4 mr-2" />
              Alerts
            </TabsTrigger>
            <TabsTrigger
              value="appearance"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-white/90 hover:text-white"
            >
              <Palette className="h-4 w-4 mr-2" />
              Appearance
            </TabsTrigger>
            <TabsTrigger
              value="music"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-white/90 hover:text-white"
            >
              <Music className="h-4 w-4 mr-2" />
              Music
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-white/90 hover:text-white"
            >
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-slate-800/50 border-purple-800/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Profile Information</CardTitle>
                <CardDescription className="text-purple-300">
                  Update your profile details and streaming information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-6">
                  <Avatar className="h-24 w-24 border-4 border-purple-500">
                    <AvatarImage src={avatarUrl || "/placeholder.svg?height=96&width=96"} />
                    <AvatarFallback className="bg-purple-600 text-white text-2xl">
                      {settings.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      disabled={isUploadingAvatar}
                    />
                    <Button
                      className="bg-purple-600 hover:bg-purple-700"
                      onClick={() => document.getElementById("avatar-upload")?.click()}
                      disabled={isUploadingAvatar}
                    >
                      {isUploadingAvatar ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Avatar
                        </>
                      )}
                    </Button>
                    <p className="text-purple-300 text-sm">JPG, PNG up to 5MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="displayName" className="text-purple-300">
                      Display Name
                    </Label>
                    <Input
                      id="displayName"
                      value={settings.displayName}
                      onChange={(e) => updateSetting("displayName", e.target.value)}
                      placeholder="Your display name"
                      className="mt-1 bg-slate-700/50 border-purple-800/30 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="username" className="text-purple-300">
                      Username
                    </Label>
                    <Input
                      id="username"
                      value={settings.username}
                      placeholder="username"
                      className="mt-1 bg-slate-700/50 border-purple-800/30 text-white"
                      disabled
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-purple-300">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.email}
                      onChange={(e) => updateSetting("email", e.target.value)}
                      placeholder="your@email.com"
                      className="mt-1 bg-slate-700/50 border-purple-800/30 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="timezone" className="text-purple-300">
                      Timezone
                    </Label>
                    <Select value={settings.timezone} onValueChange={(value) => updateSetting("timezone", value)}>
                      <SelectTrigger className="mt-1 bg-slate-700/50 border-purple-800/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-purple-800/30">
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="EST">EST</SelectItem>
                        <SelectItem value="PST">PST</SelectItem>
                        <SelectItem value="MSK">MSK</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio" className="text-purple-300">
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    value={settings.bio}
                    onChange={(e) => updateSetting("bio", e.target.value)}
                    placeholder="Tell your viewers about yourself..."
                    className="mt-1 bg-slate-700/50 border-purple-800/30 text-white placeholder:text-purple-400"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Twitch Integration Card */}
            <Card className="bg-slate-800/50 border-purple-800/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Twitch className="h-5 w-5 mr-2 text-purple-500" />
                  Twitch Integration
                </CardTitle>
                <CardDescription className="text-purple-300">
                  Connect your Twitch account to show live status on your donation page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {settings.twitchUsername ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                          <Twitch className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{settings.twitchUsername}</p>
                          <p className="text-purple-300 text-sm">Connected</p>
                        </div>
                      </div>
                      <Button
                        onClick={async () => {
                          try {
                            const response = await fetch("/api/twitch/disconnect", {
                              method: "POST",
                              credentials: "include",
                            })
                            if (response.ok) {
                              setSettings((prev: any) => ({
                                ...prev,
                                twitchUsername: null,
                                twitchId: null,
                                isLive: false,
                              }))
                              toast({
                                type: "success",
                                title: "Disconnected",
                                description: "Twitch account has been disconnected",
                              })
                            }
                          } catch (error) {
                            toast({
                              type: "error",
                              title: "Error",
                              description: "Failed to disconnect Twitch",
                            })
                          }
                        }}
                        variant="outline"
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                      >
                        Disconnect
                      </Button>
                    </div>
                    
                    {settings.isLive && (
                      <div className="flex items-center space-x-2 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        <p className="text-white font-medium">You are currently LIVE on Twitch</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-purple-300">
                      Connect your Twitch account to automatically show your live status on your donation page.
                    </p>
                    <Button
                      onClick={async () => {
                        try {
                          const response = await fetch("/api/twitch/auth")
                          const data = await response.json()
                          if (data.url) {
                            window.location.href = data.url
                          }
                        } catch (error) {
                          toast({
                            type: "error",
                            title: "Error",
                            description: "Failed to initiate Twitch OAuth",
                          })
                        }
                      }}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Twitch className="h-4 w-4 mr-2" />
                      Connect Twitch Account
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Donations Tab */}
          <TabsContent value="donations" className="space-y-6">
            <Card className="bg-slate-800/50 border-purple-800/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Donation Settings</CardTitle>
                <CardDescription className="text-purple-300">
                  Configure donation amounts, goals, and payment methods
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-purple-300">Minimum Donation Amount: ${settings.minDonationAmount}</Label>
                  <Slider
                    value={[settings.minDonationAmount]}
                    onValueChange={(value) => updateSetting("minDonationAmount", value[0])}
                    max={50}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-purple-300">Track Request Minimum: ${settings.trackRequestMinimum}</Label>
                  <Slider
                    value={[settings.trackRequestMinimum]}
                    onValueChange={(value) => updateSetting("trackRequestMinimum", value[0])}
                    max={100}
                    min={5}
                    step={5}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-purple-300">Donation Goal: ${settings.donationGoal}</Label>
                  <Slider
                    value={[settings.donationGoal]}
                    onValueChange={(value) => updateSetting("donationGoal", value[0])}
                    max={10000}
                    min={100}
                    step={100}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="goalDescription" className="text-purple-300">
                    Goal Description
                  </Label>
                  <Input
                    id="goalDescription"
                    value={settings.donationGoalDescription}
                    onChange={(e) => updateSetting("donationGoalDescription", e.target.value)}
                    className="mt-1 bg-slate-700/50 border-purple-800/30 text-white"
                  />
                </div>

                <div>
                  <Label className="text-purple-300">Currency</Label>
                  <Select value={settings.currency} onValueChange={(value) => updateSetting("currency", value)}>
                    <SelectTrigger className="mt-1 bg-slate-700/50 border-purple-800/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-purple-800/30">
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="RUB">RUB (₽)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            {/* Widget URL Card */}
            <Card className="bg-slate-800/50 border-purple-800/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-purple-400" />
                  OBS Widget URL
                </CardTitle>
                <CardDescription className="text-purple-300">
                  Copy this URL and add it as a Browser Source in OBS
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={
                      alertSettings.alertToken
                        ? `${window.location.origin}/alerts/${settings.username}?token=${alertSettings.alertToken}`
                        : "Loading..."
                    }
                    readOnly
                    className="bg-slate-700/50 border-purple-800/30 text-white font-mono text-sm"
                  />
                  <Button
                    onClick={async () => {
                      if (alertSettings.alertToken) {
                        const url = `${window.location.origin}/alerts/${settings.username}?token=${alertSettings.alertToken}`
                        
                        try {
                          // Пробуем современный API
                          if (navigator?.clipboard?.writeText) {
                            await navigator.clipboard.writeText(url)
                          } else {
                            // Fallback для старых браузеров
                            const textarea = document.createElement('textarea')
                            textarea.value = url
                            textarea.style.position = 'fixed'
                            textarea.style.opacity = '0'
                            document.body.appendChild(textarea)
                            textarea.select()
                            document.execCommand('copy')
                            document.body.removeChild(textarea)
                          }
                          
                          toast({
                            type: "success",
                            title: "Copied!",
                            description: "Widget URL copied to clipboard",
                          })
                        } catch (err) {
                          console.error('Copy failed:', err)
                          toast({
                            type: "error",
                            title: "Copy Failed",
                            description: "Please copy the URL manually",
                          })
                        }
                      }
                    }}
                    disabled={!alertSettings.alertToken}
                    className="bg-purple-600 hover:bg-purple-700 shrink-0"
                  >
                    Copy
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={async () => {
                      try {
                        const response = await fetch("/api/alerts/test", {
                          method: "POST",
                          credentials: "include",
                        })
                        if (response.ok) {
                          toast({
                            type: "success",
                            title: "Test Alert Sent!",
                            description: "Check your OBS to see the alert",
                          })
                        } else {
                          throw new Error("Failed to send test alert")
                        }
                      } catch (error) {
                        toast({
                          type: "error",
                          title: "Failed",
                          description: "Could not send test alert",
                        })
                      }
                    }}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Send Test Alert
                  </Button>
                  <Button variant="outline" className="border-purple-800/30 text-purple-300 hover:text-white">
                    <Upload className="h-4 w-4 mr-2" />
                    View Setup Guide
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Text Settings */}
            <Card className="bg-slate-800/50 border-purple-800/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Text Settings</CardTitle>
                <CardDescription className="text-purple-300">
                  Customize the appearance of alert text
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-purple-300">Font Family</Label>
                    <Select
                      value={alertSettings.fontFamily}
                      onValueChange={(value) => updateAlertSetting("fontFamily", value)}
                    >
                      <SelectTrigger className="mt-1 bg-slate-700/50 border-purple-800/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-purple-800/30">
                        <SelectItem value="Roboto">Roboto</SelectItem>
                        <SelectItem value="Arial">Arial</SelectItem>
                        <SelectItem value="Impact">Impact</SelectItem>
                        <SelectItem value="Comic Sans MS">Comic Sans MS</SelectItem>
                        <SelectItem value="Courier New">Courier New</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-purple-300">Font Size: {alertSettings.fontSize}px</Label>
                    <Slider
                      value={[alertSettings.fontSize]}
                      onValueChange={(value) => updateAlertSetting("fontSize", value[0])}
                      max={100}
                      min={20}
                      step={5}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-purple-300">Text Color</Label>
                    <Input
                      type="color"
                      value={alertSettings.textColor}
                      onChange={(e) => updateAlertSetting("textColor", e.target.value)}
                      className="mt-1 h-12 bg-slate-700/50 border-purple-800/30"
                    />
                  </div>
                  <div>
                    <Label className="text-purple-300">Animation</Label>
                    <Select
                      value={alertSettings.textAnimation}
                      onValueChange={(value) => updateAlertSetting("textAnimation", value)}
                    >
                      <SelectTrigger className="mt-1 bg-slate-700/50 border-purple-800/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-purple-800/30">
                        <SelectItem value="fade">Fade</SelectItem>
                        <SelectItem value="slide">Slide</SelectItem>
                        <SelectItem value="bounce">Bounce</SelectItem>
                        <SelectItem value="zoom">Zoom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Display Settings */}
            <Card className="bg-slate-800/50 border-purple-800/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Display Settings</CardTitle>
                <CardDescription className="text-purple-300">Configure alert display behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-purple-300">Duration: {alertSettings.duration} seconds</Label>
                    <Slider
                      value={[alertSettings.duration]}
                      onValueChange={(value: number[]) => updateAlertSetting("duration", value[0])}
                      max={30}
                      min={3}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-purple-300">Position</Label>
                    <Select
                      value={alertSettings.position}
                      onValueChange={(value: string) => updateAlertSetting("position", value)}
                    >
                      <SelectTrigger className="mt-1 bg-slate-700/50 border-purple-800/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-purple-800/30">
                        <SelectItem value="top">Top</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="bottom">Bottom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-purple-300">Minimum Amount: ${alertSettings.minAmount}</Label>
                    <Slider
                      value={[alertSettings.minAmount]}
                      onValueChange={(value: number[]) => updateAlertSetting("minAmount", value[0])}
                      max={50}
                      min={1}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Image Settings */}
            <Card className="bg-slate-800/50 border-purple-800/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Image Settings</CardTitle>
                <CardDescription className="text-purple-300">Configure alert images and GIFs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label className="text-white">Enable Image</Label>
                  <Switch
                    checked={alertSettings.imageEnabled}
                    onCheckedChange={(checked: boolean) => updateAlertSetting("imageEnabled", checked)}
                  />
                </div>

                <div>
                  <Label className="text-purple-300 mb-2 block">Upload Custom Image/GIF</Label>
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isUploadingImage}
                  />
                  <div
                    onClick={() => !isUploadingImage && document.getElementById("image-upload")?.click()}
                    className="border-2 border-dashed border-purple-800/30 rounded-lg overflow-hidden hover:border-purple-600/50 transition-colors cursor-pointer"
                  >
                    {isUploadingImage ? (
                      <div className="p-8 text-center">
                        <Loader2 className="h-12 w-12 mx-auto mb-4 text-purple-400 animate-spin" />
                        <p className="text-white mb-2">Uploading...</p>
                      </div>
                    ) : alertSettings.imageUrl ? (
                      <div className="relative group">
                        <img
                          src={alertSettings.imageUrl}
                          alt="Current alert image"
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="text-center">
                            <Upload className="h-8 w-8 mx-auto mb-2 text-white" />
                            <p className="text-white font-medium">Click to change</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <Upload className="h-12 w-12 mx-auto mb-4 text-purple-400" />
                        <p className="text-white mb-2">Click to upload</p>
                        <p className="text-purple-300 text-sm">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-purple-300">Image Size: {alertSettings.imageSize}px</Label>
                  <Slider
                    value={[alertSettings.imageSize]}
                    onValueChange={(value: number[]) => updateAlertSetting("imageSize", value[0])}
                    max={500}
                    min={50}
                    step={10}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Sound Settings */}
            <Card className="bg-slate-800/50 border-purple-800/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Sound Settings</CardTitle>
                <CardDescription className="text-purple-300">Configure alert sounds</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label className="text-white">Enable Sound</Label>
                  <Switch
                    checked={alertSettings.soundEnabled}
                    onCheckedChange={(checked: boolean) => updateAlertSetting("soundEnabled", checked)}
                  />
                </div>

                <div>
                  <Label className="text-purple-300 mb-2 block">Upload Custom Sound</Label>
                  <input
                    type="file"
                    id="sound-upload"
                    accept="audio/*"
                    onChange={handleSoundUpload}
                    className="hidden"
                    disabled={isUploadingSound}
                  />
                  <div
                    onClick={() => !isUploadingSound && document.getElementById("sound-upload")?.click()}
                    className="border-2 border-dashed border-purple-800/30 rounded-lg p-8 text-center hover:border-purple-600/50 transition-colors cursor-pointer"
                  >
                    {isUploadingSound ? (
                      <>
                        <Loader2 className="h-12 w-12 mx-auto mb-4 text-purple-400 animate-spin" />
                        <p className="text-white mb-2">Uploading...</p>
                      </>
                    ) : (
                      <>
                        <Music className="h-12 w-12 mx-auto mb-4 text-purple-400" />
                        {alertSettings.soundUrl ? (
                          <>
                            <p className="text-white mb-2 font-medium">Sound uploaded</p>
                            <p className="text-purple-300 text-sm mb-2">{alertSettings.soundUrl.split("/").pop()}</p>
                            <p className="text-purple-400 text-xs">Click to change</p>
                          </>
                        ) : (
                          <>
                            <p className="text-white mb-2">Click to upload</p>
                            <p className="text-purple-300 text-sm">MP3, WAV up to 5MB</p>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-purple-300">Volume: {alertSettings.soundVolume}%</Label>
                  <Slider
                    value={[alertSettings.soundVolume]}
                    onValueChange={(value: number[]) => updateAlertSetting("soundVolume", value[0])}
                    max={100}
                    min={0}
                    step={5}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* TTS Settings */}
            <Card className="bg-slate-800/50 border-purple-800/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Text-to-Speech Settings</CardTitle>
                <CardDescription className="text-purple-300">Configure voice reading of donation messages</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Enable TTS</Label>
                    <p className="text-purple-300 text-sm mt-1">Reads donation messages aloud</p>
                  </div>
                  <Switch
                    checked={alertSettings.ttsEnabled}
                    onCheckedChange={(checked: boolean) => updateAlertSetting("ttsEnabled", checked)}
                  />
                </div>

                <div>
                  <Label className="text-purple-300">Voice</Label>
                  <Select
                    value={alertSettings.ttsVoice}
                    onValueChange={(value: string) => updateAlertSetting("ttsVoice", value)}
                  >
                    <SelectTrigger className="mt-1 bg-slate-700/50 border-purple-800/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-purple-800/30">
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="en-GB">English (UK)</SelectItem>
                      <SelectItem value="ru-RU">Russian</SelectItem>
                      <SelectItem value="es-ES">Spanish</SelectItem>
                      <SelectItem value="fr-FR">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-purple-300">Speed: {alertSettings.ttsSpeed.toFixed(1)}x</Label>
                    <Slider
                      value={[alertSettings.ttsSpeed]}
                      onValueChange={(value: number[]) => updateAlertSetting("ttsSpeed", value[0])}
                      max={2.0}
                      min={0.5}
                      step={0.1}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-purple-300">Volume: {alertSettings.ttsVolume}%</Label>
                    <Slider
                      value={[alertSettings.ttsVolume]}
                      onValueChange={(value: number[]) => updateAlertSetting("ttsVolume", value[0])}
                      max={100}
                      min={0}
                      step={5}
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preview Card */}
            <Card className="bg-slate-800/50 border-purple-800/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Live Preview</CardTitle>
                <CardDescription className="text-purple-300">
                  See how your alert will look in real-time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative bg-black/50 rounded-lg overflow-hidden" style={{ height: "400px" }}>
                  {/* Position container */}
                  <div
                    className={`absolute w-full flex items-center justify-center ${
                      alertSettings.position === "top"
                        ? "top-8"
                        : alertSettings.position === "bottom"
                          ? "bottom-8"
                          : "top-1/2 -translate-y-1/2"
                    }`}
                  >
                    {/* Alert content */}
                    <div
                      key={`${alertSettings.textAnimation}-${alertSettings.fontSize}-${alertSettings.imageUrl}`}
                      className="flex flex-col items-center gap-4"
                      style={{
                        animation: `${alertSettings.textAnimation} 0.5s ease-out`,
                      }}
                    >
                      {/* Image */}
                      {alertSettings.imageEnabled && alertSettings.imageUrl && (
                        <img
                          src={alertSettings.imageUrl}
                          alt="Alert"
                          className="rounded-lg shadow-lg"
                          style={{
                            width: `${alertSettings.imageSize}px`,
                            height: `${alertSettings.imageSize}px`,
                            objectFit: "cover",
                          }}
                        />
                      )}

                      {/* Text */}
                      <div className="text-center space-y-2">
                        <p
                          className="font-bold"
                          style={{
                            fontSize: `${alertSettings.fontSize}px`,
                            fontFamily: alertSettings.fontFamily,
                            color: alertSettings.textColor,
                            textShadow: "2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(255,255,255,0.3)",
                          }}
                        >
                          ${alertSettings.minAmount || 10}.00
                        </p>
                        <p
                          className="font-semibold"
                          style={{
                            fontSize: `${alertSettings.fontSize * 0.6}px`,
                            fontFamily: alertSettings.fontFamily,
                            color: alertSettings.textColor,
                            opacity: 0.9,
                            textShadow: "2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(255,255,255,0.3)",
                          }}
                        >
                          from Test Donor
                        </p>
                        <p
                          className="text-lg italic"
                          style={{
                            fontSize: `${alertSettings.fontSize * 0.5}px`,
                            fontFamily: alertSettings.fontFamily,
                            color: alertSettings.textColor,
                            opacity: 0.8,
                            textShadow: "2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(255,255,255,0.3)",
                          }}
                        >
                          This is a test donation message!
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Info overlay */}
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-xs text-purple-300">
                    <span>Duration: {alertSettings.duration}s</span>
                    <span>Animation: {alertSettings.textAnimation}</span>
                    <span>Min: ${alertSettings.minAmount}</span>
                  </div>
                </div>

                {/* Animation CSS */}
                <style jsx>{`
                  @keyframes fade {
                    from {
                      opacity: 0;
                    }
                    to {
                      opacity: 1;
                    }
                  }
                  @keyframes slide {
                    from {
                      transform: translateX(-100%);
                      opacity: 0;
                    }
                    to {
                      transform: translateX(0);
                      opacity: 1;
                    }
                  }
                  @keyframes bounce {
                    0%,
                    100% {
                      transform: translateY(0);
                      opacity: 1;
                    }
                    50% {
                      transform: translateY(-20px);
                    }
                  }
                  @keyframes zoom {
                    from {
                      transform: scale(0);
                      opacity: 0;
                    }
                    to {
                      transform: scale(1);
                      opacity: 1;
                    }
                  }
                `}</style>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <Card className="bg-slate-800/50 border-purple-800/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Appearance Settings
                </CardTitle>
                <CardDescription className="text-purple-300">
                  Customize your donation page colors and theme
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-white">Theme Preset</Label>
                    <Select value={settings.theme} onValueChange={(value) => updateSetting("theme", value)}>
                      <SelectTrigger className="mt-2 bg-slate-700/50 border-purple-800/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-purple-800/30">
                        <SelectItem value="purple">💜 Purple (Default)</SelectItem>
                        <SelectItem value="blue">💙 Blue Ocean</SelectItem>
                        <SelectItem value="green">💚 Green Forest</SelectItem>
                        <SelectItem value="red">❤️ Red Flame</SelectItem>
                        <SelectItem value="custom">🎨 Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-purple-400 mt-1">
                      Choose a pre-made theme or create your own
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="primaryColor" className="text-white">
                        Primary Color
                      </Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          id="primaryColor"
                          type="color"
                          value={settings.primaryColor}
                          onChange={(e) => updateSetting("primaryColor", e.target.value)}
                          className="h-12 w-16 bg-slate-700/50 border-purple-800/30 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={settings.primaryColor}
                          onChange={(e) => updateSetting("primaryColor", e.target.value)}
                          className="flex-1 bg-slate-700/50 border-purple-800/30 text-white"
                          placeholder="#6366f1"
                        />
                      </div>
                      <p className="text-sm text-purple-400 mt-1">Main color for buttons</p>
                    </div>
                    <div>
                      <Label htmlFor="accentColor" className="text-white">
                        Accent Color
                      </Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          id="accentColor"
                          type="color"
                          value={settings.accentColor}
                          onChange={(e) => updateSetting("accentColor", e.target.value)}
                          className="h-12 w-16 bg-slate-700/50 border-purple-800/30 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={settings.accentColor}
                          onChange={(e) => updateSetting("accentColor", e.target.value)}
                          className="flex-1 bg-slate-700/50 border-purple-800/30 text-white"
                          placeholder="#ec4899"
                        />
                      </div>
                      <p className="text-sm text-purple-400 mt-1">Color for highlights</p>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="space-y-2">
                    <Label className="text-white">Preview</Label>
                    <div
                      className="rounded-lg p-6 border-2 border-dashed"
                      style={{
                        background: `linear-gradient(135deg, ${settings.primaryColor}20 0%, ${settings.accentColor}20 100%)`,
                        borderColor: settings.primaryColor + "40",
                      }}
                    >
                      <div className="space-y-3">
                        <h3 className="text-white font-bold text-lg">Donation Page Preview</h3>
                        <button
                          className="px-6 py-3 rounded-lg font-semibold text-white transition-all hover:scale-105"
                          style={{
                            background: `linear-gradient(135deg, ${settings.primaryColor} 0%, ${settings.accentColor} 100%)`,
                          }}
                        >
                          Support Me ❤️
                        </button>
                        <p className="text-sm text-purple-300">
                          These colors will be applied to your donation page
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg bg-blue-500/10 border border-blue-500/30 p-4">
                    <p className="text-sm text-blue-300">
                      <strong>💡 Tip:</strong> Choose colors that match your stream's branding.
                      High contrast colors work best for visibility!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Music Tab */}
          <TabsContent value="music" className="space-y-6">
            <Card className="bg-slate-800/50 border-purple-800/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  Music Settings
                </CardTitle>
                <CardDescription className="text-purple-300">
                  Configure music playback for donations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="alertVolume" className="text-white">
                        Alert Volume
                      </Label>
                      <span className="text-sm text-purple-300">{settings.alertVolume}%</span>
                    </div>
                    <Slider
                      id="alertVolume"
                      min={0}
                      max={100}
                      step={5}
                      value={[settings.alertVolume]}
                      onValueChange={(value) =>
                        setSettings({ ...settings, alertVolume: value[0] })
                      }
                      className="w-full"
                    />
                    <p className="text-sm text-purple-400">
                      Volume level for alert sounds and music
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="alertDuration" className="text-white">
                      Alert Duration (seconds)
                    </Label>
                    <Input
                      id="alertDuration"
                      type="number"
                      min={1}
                      max={60}
                      value={settings.alertDuration}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          alertDuration: parseInt(e.target.value) || 5,
                        })
                      }
                      className="bg-slate-700/50 border-purple-800/30 text-white"
                    />
                    <p className="text-sm text-purple-400">
                      How long alerts are displayed (1-60 seconds)
                    </p>
                  </div>

                  <div className="rounded-lg bg-blue-500/10 border border-blue-500/30 p-4">
                    <p className="text-sm text-blue-300">
                      <strong>ℹ️ Note:</strong> These settings will be applied to donation
                      alerts and music requests. Music integration coming soon!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <SecuritySettings />
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center mt-8">
          {hasChanges && <p className="text-purple-300 text-sm">You have unsaved changes</p>}
          <div className="flex-1" />
          <div className="flex gap-3">
            <Button
              onClick={handleSaveAlertSettings}
              disabled={isSaving || !hasChanges}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4 mr-2" />
                  Save Alert Settings
                </>
              )}
            </Button>
            <Button
              onClick={handleSaveSettings}
              disabled={isSaving || !hasChanges}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save All Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
