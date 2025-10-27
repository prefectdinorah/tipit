"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import AlertPreview from "@/components/alert-preview"
import AlertFinalPreview from "@/components/alert-final-preview"
import type { AlertSettings } from "@/components/alert-preview"
import { Volume2, ImageIcon, Type, Sparkles, Send, ArrowLeft, Upload, Save } from "lucide-react"
import { useToast } from "@/components/ui/toast"

export default function AlertsAdvancedPage() {
  const router = useRouter()
  const { toast, ToastContainer } = useToast()
  
  const [settings, setSettings] = useState<AlertSettings>({
    minAmount: 1,
    messageTemplate: "{name} задонатил {amount}!",
    showDonorName: true,
    animationType: "slide",
    duration: 5,
    backgroundColor: "#6366f1",
    textColor: "#ffffff",
    transparentBackground: false,
    headerFontSize: 24,
    headerFontFamily: "sans-serif",
    messageFontSize: 18,
    messageFontFamily: "sans-serif",
    headerPosition: { x: 50, y: 30 },
    headerSize: { width: 400, height: 60 },
    messagePosition: { x: 50, y: 70 },
    messageSize: { width: 400, height: 80 },
    enableImage: true,
    imageUrl: "",
    imageSize: { width: 80, height: 80 },
    imagePosition: { x: 20, y: 50 },
    imageAsBackground: false,
    enableSound: true,
    soundUrl: "",
    soundVolume: 70,
    enableTTS: false,
    ttsVoice: "female",
    ttsSpeed: 1,
    ttsVolume: 80,
    readDonorName: true,
    readAmount: true,
    readMessage: true,
  })

  const [testDonation, setTestDonation] = useState({
    name: "Иван",
    amount: 100,
    message: "Спасибо за стрим!",
  })

  const [showFinalPreview, setShowFinalPreview] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isUploadingSound, setIsUploadingSound] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/alerts/settings", {
        credentials: "include",
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // Маппим данные из БД в формат компонента
        setSettings({
          minAmount: data.minAmount || 1,
          messageTemplate: data.messageTemplate || "{name} задонатил {amount}!",
          showDonorName: data.showDonorName ?? true,
          animationType: data.animationType || "slide",
          duration: data.duration || 5,
          backgroundColor: data.backgroundColor || "#6366f1",
          textColor: data.textColor || "#ffffff",
          transparentBackground: data.transparentBackground ?? false,
          headerFontSize: data.headerFontSize || 24,
          headerFontFamily: data.headerFontFamily || "sans-serif",
          messageFontSize: data.messageFontSize || 18,
          messageFontFamily: data.messageFontFamily || "sans-serif",
          headerPosition: { 
            x: data.headerPositionX || 50, 
            y: data.headerPositionY || 30 
          },
          headerSize: { 
            width: data.headerWidth || 400, 
            height: data.headerHeight || 60 
          },
          messagePosition: { 
            x: data.messagePositionX || 50, 
            y: data.messagePositionY || 70 
          },
          messageSize: { 
            width: data.messageWidth || 400, 
            height: data.messageHeight || 80 
          },
          enableImage: data.enableImage ?? true,
          imageUrl: data.imageUrl || "",
          imageSize: { 
            width: data.imageWidth || 80, 
            height: data.imageHeight || 80 
          },
          imagePosition: { 
            x: data.imagePositionX || 20, 
            y: data.imagePositionY || 50 
          },
          imageAsBackground: data.imageAsBackground ?? false,
          enableSound: data.enableSound ?? true,
          soundUrl: data.soundUrl || "",
          soundVolume: data.soundVolume || 70,
          enableTTS: data.enableTTS ?? false,
          ttsVoice: data.ttsVoice || "female",
          ttsSpeed: data.ttsSpeed || 1,
          ttsVolume: data.ttsVolume || 80,
          readDonorName: data.readDonorName ?? true,
          readAmount: data.readAmount ?? true,
          readMessage: data.readMessage ?? true,
        })
      }
    } catch (error) {
      console.error("Failed to load settings:", error)
      toast({
        type: "error",
        title: "Ошибка",
        description: "Не удалось загрузить настройки",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setIsSaving(true)
      
      // Маппим обратно в формат БД
      const payload = {
        minAmount: settings.minAmount,
        messageTemplate: settings.messageTemplate,
        showDonorName: settings.showDonorName,
        animationType: settings.animationType,
        duration: settings.duration,
        backgroundColor: settings.backgroundColor,
        textColor: settings.textColor,
        transparentBackground: settings.transparentBackground,
        headerFontSize: settings.headerFontSize,
        headerFontFamily: settings.headerFontFamily,
        headerPositionX: settings.headerPosition.x,
        headerPositionY: settings.headerPosition.y,
        headerWidth: settings.headerSize.width,
        headerHeight: settings.headerSize.height,
        messageFontSize: settings.messageFontSize,
        messageFontFamily: settings.messageFontFamily,
        messagePositionX: settings.messagePosition.x,
        messagePositionY: settings.messagePosition.y,
        messageWidth: settings.messageSize.width,
        messageHeight: settings.messageSize.height,
        enableImage: settings.enableImage,
        imageUrl: settings.imageUrl || null,
        imageWidth: settings.imageSize.width,
        imageHeight: settings.imageSize.height,
        imagePositionX: settings.imagePosition.x,
        imagePositionY: settings.imagePosition.y,
        imageAsBackground: settings.imageAsBackground,
        enableSound: settings.enableSound,
        soundUrl: settings.soundUrl || null,
        soundVolume: settings.soundVolume,
        enableTTS: settings.enableTTS,
        ttsVoice: settings.ttsVoice,
        ttsSpeed: settings.ttsSpeed,
        ttsVolume: settings.ttsVolume,
        readDonorName: settings.readDonorName,
        readAmount: settings.readAmount,
        readMessage: settings.readMessage,
      }

      console.log("💾 Saving settings payload:", payload)

      const response = await fetch("/api/alerts/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      })

      console.log("📡 Response status:", response.status)

      if (response.ok) {
        toast({
          type: "success",
          title: "Сохранено!",
          description: "Настройки алертов обновлены",
        })
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ Save failed:", errorData)
        throw new Error(errorData.error || "Failed to save")
      }
    } catch (error) {
      console.error("Save error:", error)
      toast({
        type: "error",
        title: "Ошибка",
        description: "Не удалось сохранить настройки",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const updateSetting = <K extends keyof AlertSettings>(key: K, value: AlertSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploadingImage(true)
      const formData = new FormData()
      formData.append("image", file)

      const response = await fetch("/api/alerts/upload/image", {
        method: "POST",
        credentials: "include",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        updateSetting("imageUrl", data.imageUrl)
        
        toast({
          type: "success",
          title: "Загружено!",
          description: "Изображение успешно загружено",
        })
      } else {
        throw new Error("Upload failed")
      }
    } catch (error) {
      console.error("Image upload error:", error)
      toast({
        type: "error",
        title: "Ошибка",
        description: "Не удалось загрузить изображение",
      })
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleSoundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploadingSound(true)
      const formData = new FormData()
      formData.append("sound", file)

      const response = await fetch("/api/alerts/upload/sound", {
        method: "POST",
        credentials: "include",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        updateSetting("soundUrl", data.soundUrl)
        
        toast({
          type: "success",
          title: "Загружено!",
          description: "Звук успешно загружен",
        })
      } else {
        throw new Error("Upload failed")
      }
    } catch (error) {
      console.error("Sound upload error:", error)
      toast({
        type: "error",
        title: "Ошибка",
        description: "Не удалось загрузить звук",
      })
    } finally {
      setIsUploadingSound(false)
    }
  }

  const handleTestDonation = () => {
    setShowFinalPreview(true)
    setTimeout(() => setShowFinalPreview(false), settings.duration * 1000)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <ToastContainer />
      
      <div className="container mx-auto p-4 md:p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Button
                variant="outline"
                onClick={() => router.push("/settings")}
                className="border-purple-800/30 text-purple-300 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Назад
              </Button>
              <h1 className="text-4xl font-bold text-white">Расширенный редактор алертов</h1>
            </div>
            <p className="text-lg text-purple-300">
              Настройте внешний вид и поведение донат-алертов с помощью drag & drop
            </p>
          </div>
          <Button
            onClick={saveSettings}
            disabled={isSaving}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            size="lg"
          >
            {isSaving ? (
              <>
                <Save className="h-4 w-4 mr-2 animate-spin" />
                Сохранение...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Сохранить
              </>
            )}
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Settings Panel */}
          <div className="space-y-6">
            <Tabs defaultValue="visual" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-purple-800/30">
                <TabsTrigger value="visual" className="data-[state=active]:bg-purple-600">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Визуал
                </TabsTrigger>
                <TabsTrigger value="sound" className="data-[state=active]:bg-purple-600">
                  <Volume2 className="mr-2 h-4 w-4" />
                  Звук
                </TabsTrigger>
                <TabsTrigger value="tts" className="data-[state=active]:bg-purple-600">
                  <Type className="mr-2 h-4 w-4" />
                  TTS
                </TabsTrigger>
                <TabsTrigger value="image" className="data-[state=active]:bg-purple-600">
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Картинка
                </TabsTrigger>
              </TabsList>

              <TabsContent value="visual" className="space-y-4 mt-4">
                <Card className="bg-slate-800/50 border-purple-800/30">
                  <CardHeader>
                    <CardTitle className="text-white">Визуальные настройки</CardTitle>
                    <CardDescription className="text-purple-300">Настройте внешний вид донат-алерта</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-purple-300">Минимальная сумма (₽)</Label>
                      <Input
                        type="number"
                        value={settings.minAmount}
                        onChange={(e) => updateSetting("minAmount", Number(e.target.value))}
                        className="bg-slate-700/50 border-purple-800/30 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-purple-300">Шаблон сообщения</Label>
                      <Input
                        value={settings.messageTemplate}
                        onChange={(e) => updateSetting("messageTemplate", e.target.value)}
                        placeholder="{name} задонатил {amount}!"
                        className="bg-slate-700/50 border-purple-800/30 text-white"
                      />
                      <p className="text-xs text-purple-400">
                        Используйте {"{name}"}, {"{amount}"}, {"{message}"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-purple-300">Тип анимации</Label>
                      <Select
                        value={settings.animationType}
                        onValueChange={(value: any) => updateSetting("animationType", value)}
                      >
                        <SelectTrigger className="bg-slate-700/50 border-purple-800/30 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-purple-800/30">
                          <SelectItem value="fade">Плавное появление</SelectItem>
                          <SelectItem value="slide">Слайд</SelectItem>
                          <SelectItem value="bounce">Отскок</SelectItem>
                          <SelectItem value="zoom">Увеличение</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-purple-300">Длительность (сек): {settings.duration}</Label>
                      <Slider
                        min={3}
                        max={15}
                        step={1}
                        value={[settings.duration]}
                        onValueChange={([value]) => updateSetting("duration", value)}
                        className="py-4"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-purple-300">Цвет фона</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={settings.backgroundColor}
                            onChange={(e) => updateSetting("backgroundColor", e.target.value)}
                            className="h-10 w-20 bg-slate-700/50 border-purple-800/30"
                            disabled={settings.transparentBackground}
                          />
                          <Input
                            value={settings.backgroundColor}
                            onChange={(e) => updateSetting("backgroundColor", e.target.value)}
                            className="flex-1 bg-slate-700/50 border-purple-800/30 text-white"
                            disabled={settings.transparentBackground}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-purple-300">Цвет текста</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={settings.textColor}
                            onChange={(e) => updateSetting("textColor", e.target.value)}
                            className="h-10 w-20 bg-slate-700/50 border-purple-800/30"
                          />
                          <Input
                            value={settings.textColor}
                            onChange={(e) => updateSetting("textColor", e.target.value)}
                            className="flex-1 bg-slate-700/50 border-purple-800/30 text-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 rounded-lg border border-purple-800/30 p-4 bg-slate-700/30">
                      <h4 className="font-semibold text-white">Настройки шапки (шаблон)</h4>
                      <div className="space-y-2">
                        <Label className="text-purple-300">Размер шрифта: {settings.headerFontSize}px</Label>
                        <Slider
                          min={16}
                          max={48}
                          step={2}
                          value={[settings.headerFontSize]}
                          onValueChange={([value]) => updateSetting("headerFontSize", value)}
                          className="py-4"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-purple-300">Шрифт</Label>
                        <Select
                          value={settings.headerFontFamily}
                          onValueChange={(value) => updateSetting("headerFontFamily", value)}
                        >
                          <SelectTrigger className="bg-slate-700/50 border-purple-800/30 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-purple-800/30">
                            <SelectItem value="sans-serif">Sans Serif</SelectItem>
                            <SelectItem value="serif">Serif</SelectItem>
                            <SelectItem value="monospace">Monospace</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4 rounded-lg border border-purple-800/30 p-4 bg-slate-700/30">
                      <h4 className="font-semibold text-white">Настройки сообщения</h4>
                      <div className="space-y-2">
                        <Label className="text-purple-300">Размер шрифта: {settings.messageFontSize}px</Label>
                        <Slider
                          min={12}
                          max={36}
                          step={2}
                          value={[settings.messageFontSize]}
                          onValueChange={([value]) => updateSetting("messageFontSize", value)}
                          className="py-4"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-purple-300">Шрифт</Label>
                        <Select
                          value={settings.messageFontFamily}
                          onValueChange={(value) => updateSetting("messageFontFamily", value)}
                        >
                          <SelectTrigger className="bg-slate-700/50 border-purple-800/30 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-purple-800/30">
                            <SelectItem value="sans-serif">Sans Serif</SelectItem>
                            <SelectItem value="serif">Serif</SelectItem>
                            <SelectItem value="monospace">Monospace</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-purple-800/30 bg-slate-700/30 p-4">
                      <div className="space-y-0.5">
                        <Label className="text-base text-white">Показывать имя донатера</Label>
                      </div>
                      <Switch
                        checked={settings.showDonorName}
                        onCheckedChange={(checked) => updateSetting("showDonorName", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-purple-800/30 bg-slate-700/30 p-4">
                      <div className="space-y-0.5">
                        <Label className="text-base text-white">Прозрачный фон</Label>
                        <p className="text-sm text-purple-400">Убрать фон для наложения на трансляцию</p>
                      </div>
                      <Switch
                        checked={settings.transparentBackground}
                        onCheckedChange={(checked) => updateSetting("transparentBackground", checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sound" className="space-y-4 mt-4">
                <Card className="bg-slate-800/50 border-purple-800/30">
                  <CardHeader>
                    <CardTitle className="text-white">Настройки звука</CardTitle>
                    <CardDescription className="text-purple-300">Настройте звуковое оповещение</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <Label className="text-white">Включить звук</Label>
                      <Switch
                        checked={settings.enableSound}
                        onCheckedChange={(checked) => updateSetting("enableSound", checked)}
                      />
                    </div>

                    {settings.enableSound && (
                      <>
                        <div className="space-y-2">
                          <Label className="text-purple-300">Загрузить звук</Label>
                          <input
                            type="file"
                            id="sound-upload"
                            accept="audio/*"
                            onChange={handleSoundUpload}
                            className="hidden"
                            disabled={isUploadingSound}
                          />
                          <Button
                            onClick={() => document.getElementById("sound-upload")?.click()}
                            disabled={isUploadingSound}
                            variant="outline"
                            className="w-full border-purple-800/30 text-purple-300 hover:text-white"
                          >
                            {isUploadingSound ? (
                              <>
                                <Upload className="h-4 w-4 mr-2 animate-spin" />
                                Загрузка...
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4 mr-2" />
                                Выбрать файл
                              </>
                            )}
                          </Button>
                          {settings.soundUrl && (
                            <p className="text-xs text-green-400">✓ Звук загружен</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="text-purple-300">Громкость звука: {settings.soundVolume}%</Label>
                          <Slider
                            min={0}
                            max={100}
                            step={5}
                            value={[settings.soundVolume]}
                            onValueChange={([value]) => updateSetting("soundVolume", value)}
                            className="py-4"
                          />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tts" className="space-y-4 mt-4">
                <Card className="bg-slate-800/50 border-purple-800/30">
                  <CardHeader>
                    <CardTitle className="text-white">Настройки TTS</CardTitle>
                    <CardDescription className="text-purple-300">Настройте озвучивание текста</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <Label className="text-white">Включить TTS</Label>
                      <Switch
                        checked={settings.enableTTS}
                        onCheckedChange={(checked) => updateSetting("enableTTS", checked)}
                      />
                    </div>

                    {settings.enableTTS && (
                      <>
                        <div className="space-y-2">
                          <Label className="text-purple-300">Голос</Label>
                          <Select
                            value={settings.ttsVoice}
                            onValueChange={(value: any) => updateSetting("ttsVoice", value)}
                          >
                            <SelectTrigger className="bg-slate-700/50 border-purple-800/30 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-purple-800/30">
                              <SelectItem value="male">Мужской</SelectItem>
                              <SelectItem value="female">Женский</SelectItem>
                              <SelectItem value="robot">Робот</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-purple-300">Скорость речи: {settings.ttsSpeed}x</Label>
                          <Slider
                            min={0.5}
                            max={2}
                            step={0.1}
                            value={[settings.ttsSpeed]}
                            onValueChange={([value]) => updateSetting("ttsSpeed", value)}
                            className="py-4"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-purple-300">Громкость TTS: {settings.ttsVolume}%</Label>
                          <Slider
                            min={0}
                            max={100}
                            step={5}
                            value={[settings.ttsVolume]}
                            onValueChange={([value]) => updateSetting("ttsVolume", value)}
                            className="py-4"
                          />
                        </div>

                        <div className="space-y-3 rounded-lg border border-purple-800/30 bg-slate-700/30 p-4">
                          <Label className="text-white">Что озвучивать:</Label>
                          <div className="flex items-center justify-between">
                            <Label className="font-normal text-purple-300">Имя донатера</Label>
                            <Switch
                              checked={settings.readDonorName}
                              onCheckedChange={(checked) => updateSetting("readDonorName", checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="font-normal text-purple-300">Сумма доната</Label>
                            <Switch
                              checked={settings.readAmount}
                              onCheckedChange={(checked) => updateSetting("readAmount", checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="font-normal text-purple-300">Сообщение</Label>
                            <Switch
                              checked={settings.readMessage}
                              onCheckedChange={(checked) => updateSetting("readMessage", checked)}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="image" className="space-y-4 mt-4">
                <Card className="bg-slate-800/50 border-purple-800/30">
                  <CardHeader>
                    <CardTitle className="text-white">Настройки изображения</CardTitle>
                    <CardDescription className="text-purple-300">Добавьте изображение к алерту</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between rounded-lg border border-purple-800/30 bg-slate-700/30 p-4">
                      <div className="space-y-0.5">
                        <Label className="text-base text-white">Включить изображение</Label>
                        <p className="text-sm text-purple-400">Показывать изображение в алерте</p>
                      </div>
                      <Switch
                        checked={settings.enableImage}
                        onCheckedChange={(checked) => updateSetting("enableImage", checked)}
                      />
                    </div>

                    {settings.enableImage && (
                      <>
                        <div className="space-y-2">
                          <Label className="text-purple-300">Загрузить изображение (PNG, JPG, GIF)</Label>
                          <input
                            type="file"
                            id="image-upload"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            disabled={isUploadingImage}
                          />
                          <Button
                            onClick={() => document.getElementById("image-upload")?.click()}
                            disabled={isUploadingImage}
                            variant="outline"
                            className="w-full border-purple-800/30 text-purple-300 hover:text-white"
                          >
                            {isUploadingImage ? (
                              <>
                                <Upload className="h-4 w-4 mr-2 animate-spin" />
                                Загрузка...
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4 mr-2" />
                                Выбрать файл
                              </>
                            )}
                          </Button>
                          {settings.imageUrl && (
                            <p className="text-xs text-green-400">✓ Изображение загружено</p>
                          )}
                          <p className="text-xs text-purple-400">Поддерживаются анимированные GIF</p>
                        </div>

                        <div className="flex items-center justify-between rounded-lg border border-purple-800/30 bg-slate-700/30 p-4">
                          <div className="space-y-0.5">
                            <Label className="text-base text-white">Использовать как фон</Label>
                            <p className="text-sm text-purple-400">Изображение будет растянуто на весь алерт</p>
                          </div>
                          <Switch
                            checked={settings.imageAsBackground}
                            onCheckedChange={(checked) => updateSetting("imageAsBackground", checked)}
                          />
                        </div>

                        {!settings.imageAsBackground && (
                          <div className="rounded-lg bg-blue-500/10 border border-blue-500/30 p-4 text-sm text-blue-400">
                            <p className="font-medium">💡 Совет</p>
                            <p className="mt-1">
                              Перетащите и измените размер элементов в окне предпросмотра, потянув за углы
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <Card className="bg-slate-800/50 border-purple-800/30">
              <CardHeader>
                <CardTitle className="text-white">Тестовый донат</CardTitle>
                <CardDescription className="text-purple-300">Отправьте тестовый донат для предпросмотра</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-purple-300">Имя донатера</Label>
                  <Input
                    value={testDonation.name}
                    onChange={(e) => setTestDonation((prev) => ({ ...prev, name: e.target.value }))}
                    className="bg-slate-700/50 border-purple-800/30 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-purple-300">Сумма (₽)</Label>
                  <Input
                    type="number"
                    value={testDonation.amount}
                    onChange={(e) => setTestDonation((prev) => ({ ...prev, amount: Number(e.target.value) }))}
                    className="bg-slate-700/50 border-purple-800/30 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-purple-300">Сообщение</Label>
                  <Textarea
                    value={testDonation.message}
                    onChange={(e) => setTestDonation((prev) => ({ ...prev, message: e.target.value }))}
                    rows={3}
                    className="bg-slate-700/50 border-purple-800/30 text-white"
                  />
                </div>

                <Button onClick={handleTestDonation} className="w-full bg-gradient-to-r from-purple-600 to-pink-600" size="lg">
                  <Send className="mr-2 h-4 w-4" />
                  Отправить тестовый донат
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="space-y-6 lg:sticky lg:top-8 lg:h-fit">
            <Card className="bg-slate-800/50 border-purple-800/30">
              <CardHeader>
                <CardTitle className="text-white">Конструктор</CardTitle>
                <CardDescription className="text-purple-300">Перетаскивайте и изменяйте размер элементов</CardDescription>
              </CardHeader>
              <CardContent>
                <AlertPreview
                  settings={settings}
                  donation={testDonation}
                  onHeaderPositionChange={(pos) => updateSetting("headerPosition", pos)}
                  onHeaderSizeChange={(size) => updateSetting("headerSize", size)}
                  onMessagePositionChange={(pos) => updateSetting("messagePosition", pos)}
                  onMessageSizeChange={(size) => updateSetting("messageSize", size)}
                  onImagePositionChange={(pos) => updateSetting("imagePosition", pos)}
                  onImageSizeChange={(size) => updateSetting("imageSize", size)}
                />
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-purple-800/30">
              <CardHeader>
                <CardTitle className="text-white">Финальный предпросмотр</CardTitle>
                <CardDescription className="text-purple-300">
                  Алерт с анимацией появится здесь после отправки теста
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertFinalPreview settings={settings} donation={testDonation} show={showFinalPreview} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
