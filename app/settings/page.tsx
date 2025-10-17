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
} from "lucide-react"
import { useToast } from "@/components/ui/toast"

interface Settings {
  // Profile
  displayName: string
  username: string
  email: string
  timezone: string
  bio: string

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

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

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
            <Card className="bg-slate-800/50 border-purple-800/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Alert Settings</CardTitle>
                <CardDescription className="text-purple-300">
                  Customize donation alerts and notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-purple-300">Alert Volume: {settings.alertVolume}%</Label>
                  <Slider
                    value={[settings.alertVolume]}
                    onValueChange={(value) => updateSetting("alertVolume", value[0])}
                    max={100}
                    min={0}
                    step={5}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="alertDuration" className="text-purple-300">
                    Alert Duration (seconds)
                  </Label>
                  <Select
                    value={settings.alertDuration.toString()}
                    onValueChange={(value) => updateSetting("alertDuration", Number(value))}
                  >
                    <SelectTrigger className="mt-1 bg-slate-700/50 border-purple-800/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-purple-800/30">
                      <SelectItem value="3">3 seconds</SelectItem>
                      <SelectItem value="5">5 seconds</SelectItem>
                      <SelectItem value="10">10 seconds</SelectItem>
                      <SelectItem value="15">15 seconds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Sound Alerts</Label>
                    <Switch
                      checked={settings.soundAlertEnabled}
                      onCheckedChange={(checked) => updateSetting("soundAlertEnabled", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Visual Alerts</Label>
                    <Switch
                      checked={settings.visualAlertEnabled}
                      onCheckedChange={(checked) => updateSetting("visualAlertEnabled", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Text-to-Speech</Label>
                    <Switch
                      checked={settings.ttsEnabled}
                      onCheckedChange={(checked) => updateSetting("ttsEnabled", checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <Card className="bg-slate-800/50 border-purple-800/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Appearance Settings</CardTitle>
                <CardDescription className="text-purple-300">Customize your stream's look and feel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-purple-300">Theme</Label>
                  <Select value={settings.theme} onValueChange={(value) => updateSetting("theme", value)}>
                    <SelectTrigger className="mt-1 bg-slate-700/50 border-purple-800/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-purple-800/30">
                      <SelectItem value="purple">Purple</SelectItem>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="red">Red</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primaryColor" className="text-purple-300">
                      Primary Color
                    </Label>
                    <Input
                      id="primaryColor"
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => updateSetting("primaryColor", e.target.value)}
                      className="mt-1 h-12 bg-slate-700/50 border-purple-800/30"
                    />
                  </div>
                  <div>
                    <Label htmlFor="accentColor" className="text-purple-300">
                      Accent Color
                    </Label>
                    <Input
                      id="accentColor"
                      type="color"
                      value={settings.accentColor}
                      onChange={(e) => updateSetting("accentColor", e.target.value)}
                      className="mt-1 h-12 bg-slate-700/50 border-purple-800/30"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Music Tab */}
          <TabsContent value="music" className="space-y-6">
            <Card className="bg-slate-800/50 border-purple-800/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Music Settings</CardTitle>
                <CardDescription className="text-purple-300">Configure track request settings</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-purple-300">Music integration coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="bg-slate-800/50 border-purple-800/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Security Settings</CardTitle>
                <CardDescription className="text-purple-300">Manage your account security</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-purple-300">Security settings coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center mt-8">
          {hasChanges && <p className="text-purple-300 text-sm">You have unsaved changes</p>}
          <div className="flex-1" />
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
                Save All Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
