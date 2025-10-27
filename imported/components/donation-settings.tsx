"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import DonationPreview from "@/components/donation-preview"
import DonationFinalPreview from "@/components/donation-final-preview"
import { Volume2, ImageIcon, Type, Sparkles, Send } from "lucide-react"

export type DonationSettings = {
  minAmount: number
  messageTemplate: string
  showDonorName: boolean

  // Visual settings
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

  // Sound settings
  enableSound: boolean
  soundUrl: string
  soundVolume: number

  // TTS settings
  enableTTS: boolean
  ttsVoice: "male" | "female" | "robot"
  ttsSpeed: number
  ttsVolume: number
  readDonorName: boolean
  readAmount: boolean
  readMessage: boolean
}

export default function DonationSettings() {
  const [settings, setSettings] = useState<DonationSettings>({
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
    imageUrl: "/donation-icon.jpg",
    imageSize: { width: 80, height: 80 },
    imagePosition: { x: 20, y: 50 },
    imageAsBackground: false,
    enableSound: true,
    soundUrl: "/notification.mp3",
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

  const [showPreview, setShowPreview] = useState(false)
  const [showFinalPreview, setShowFinalPreview] = useState(false)

  const updateSetting = <K extends keyof DonationSettings>(key: K, value: DonationSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleTestDonation = () => {
    setShowFinalPreview(true)
    setTimeout(() => setShowFinalPreview(false), settings.duration * 1000)
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-balance">Настройки донатов</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Настройте внешний вид и поведение донат-алертов для вашего стрима
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Settings Panel */}
          <div className="space-y-6">
            <Tabs defaultValue="visual" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="visual">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Визуал
                </TabsTrigger>
                <TabsTrigger value="sound">
                  <Volume2 className="mr-2 h-4 w-4" />
                  Звук
                </TabsTrigger>
                <TabsTrigger value="tts">
                  <Type className="mr-2 h-4 w-4" />
                  TTS
                </TabsTrigger>
                <TabsTrigger value="image">
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Картинка
                </TabsTrigger>
              </TabsList>

              <TabsContent value="visual" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Визуальные настройки</CardTitle>
                    <CardDescription>Настройте внешний вид донат-алерта</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="minAmount">Минимальная сумма (₽)</Label>
                      <Input
                        id="minAmount"
                        type="number"
                        value={settings.minAmount}
                        onChange={(e) => updateSetting("minAmount", Number(e.target.value))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="messageTemplate">Шаблон сообщения</Label>
                      <Input
                        id="messageTemplate"
                        value={settings.messageTemplate}
                        onChange={(e) => updateSetting("messageTemplate", e.target.value)}
                        placeholder="{name} задонатил {amount}!"
                      />
                      <p className="text-xs text-muted-foreground">
                        Используйте {"{name}"}, {"{amount}"}, {"{message}"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="animation">Тип анимации</Label>
                      <Select
                        value={settings.animationType}
                        onValueChange={(value: any) => updateSetting("animationType", value)}
                      >
                        <SelectTrigger id="animation">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fade">Плавное появление</SelectItem>
                          <SelectItem value="slide">Слайд</SelectItem>
                          <SelectItem value="bounce">Отскок</SelectItem>
                          <SelectItem value="zoom">Увеличение</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Длительность (сек): {settings.duration}</Label>
                      <Slider
                        id="duration"
                        min={3}
                        max={15}
                        step={1}
                        value={[settings.duration]}
                        onValueChange={([value]) => updateSetting("duration", value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bgColor">Цвет фона</Label>
                        <div className="flex gap-2">
                          <Input
                            id="bgColor"
                            type="color"
                            value={settings.backgroundColor}
                            onChange={(e) => updateSetting("backgroundColor", e.target.value)}
                            className="h-10 w-20"
                            disabled={settings.transparentBackground}
                          />
                          <Input
                            value={settings.backgroundColor}
                            onChange={(e) => updateSetting("backgroundColor", e.target.value)}
                            className="flex-1"
                            disabled={settings.transparentBackground}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="textColor">Цвет текста</Label>
                        <div className="flex gap-2">
                          <Input
                            id="textColor"
                            type="color"
                            value={settings.textColor}
                            onChange={(e) => updateSetting("textColor", e.target.value)}
                            className="h-10 w-20"
                          />
                          <Input
                            value={settings.textColor}
                            onChange={(e) => updateSetting("textColor", e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 rounded-lg border border-border p-4">
                      <h4 className="font-semibold">Настройки шапки (шаблон)</h4>
                      <div className="space-y-2">
                        <Label htmlFor="headerFontSize">Размер шрифта: {settings.headerFontSize}px</Label>
                        <Slider
                          id="headerFontSize"
                          min={16}
                          max={48}
                          step={2}
                          value={[settings.headerFontSize]}
                          onValueChange={([value]) => updateSetting("headerFontSize", value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="headerFontFamily">Шрифт</Label>
                        <Select
                          value={settings.headerFontFamily}
                          onValueChange={(value) => updateSetting("headerFontFamily", value)}
                        >
                          <SelectTrigger id="headerFontFamily">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sans-serif">Sans Serif</SelectItem>
                            <SelectItem value="serif">Serif</SelectItem>
                            <SelectItem value="monospace">Monospace</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4 rounded-lg border border-border p-4">
                      <h4 className="font-semibold">Настройки сообщения</h4>
                      <div className="space-y-2">
                        <Label htmlFor="messageFontSize">Размер шрифта: {settings.messageFontSize}px</Label>
                        <Slider
                          id="messageFontSize"
                          min={12}
                          max={36}
                          step={2}
                          value={[settings.messageFontSize]}
                          onValueChange={([value]) => updateSetting("messageFontSize", value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="messageFontFamily">Шрифт</Label>
                        <Select
                          value={settings.messageFontFamily}
                          onValueChange={(value) => updateSetting("messageFontFamily", value)}
                        >
                          <SelectTrigger id="messageFontFamily">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sans-serif">Sans Serif</SelectItem>
                            <SelectItem value="serif">Serif</SelectItem>
                            <SelectItem value="monospace">Monospace</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="showName">Показывать имя донатера</Label>
                      <Switch
                        id="showName"
                        checked={settings.showDonorName}
                        onCheckedChange={(checked) => updateSetting("showDonorName", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-4">
                      <div className="space-y-0.5">
                        <Label htmlFor="transparentBg" className="text-base">
                          Прозрачный фон
                        </Label>
                        <p className="text-sm text-muted-foreground">Убрать фон для наложения на трансляцию</p>
                      </div>
                      <Switch
                        id="transparentBg"
                        checked={settings.transparentBackground}
                        onCheckedChange={(checked) => updateSetting("transparentBackground", checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sound" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Настройки звука</CardTitle>
                    <CardDescription>Настройте звуковое оповещение</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enableSound">Включить звук</Label>
                      <Switch
                        id="enableSound"
                        checked={settings.enableSound}
                        onCheckedChange={(checked) => updateSetting("enableSound", checked)}
                      />
                    </div>

                    {settings.enableSound && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="soundUrl">URL звукового файла</Label>
                          <Input
                            id="soundUrl"
                            value={settings.soundUrl}
                            onChange={(e) => updateSetting("soundUrl", e.target.value)}
                            placeholder="https://example.com/sound.mp3"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="soundVolume">Громкость звука: {settings.soundVolume}%</Label>
                          <Slider
                            id="soundVolume"
                            min={0}
                            max={100}
                            step={5}
                            value={[settings.soundVolume]}
                            onValueChange={([value]) => updateSetting("soundVolume", value)}
                          />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tts" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Настройки TTS</CardTitle>
                    <CardDescription>Настройте озвучивание текста</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enableTTS">Включить TTS</Label>
                      <Switch
                        id="enableTTS"
                        checked={settings.enableTTS}
                        onCheckedChange={(checked) => updateSetting("enableTTS", checked)}
                      />
                    </div>

                    {settings.enableTTS && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="ttsVoice">Голос</Label>
                          <Select
                            value={settings.ttsVoice}
                            onValueChange={(value: any) => updateSetting("ttsVoice", value)}
                          >
                            <SelectTrigger id="ttsVoice">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Мужской</SelectItem>
                              <SelectItem value="female">Женский</SelectItem>
                              <SelectItem value="robot">Робот</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="ttsSpeed">Скорость речи: {settings.ttsSpeed}x</Label>
                          <Slider
                            id="ttsSpeed"
                            min={0.5}
                            max={2}
                            step={0.1}
                            value={[settings.ttsSpeed]}
                            onValueChange={([value]) => updateSetting("ttsSpeed", value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="ttsVolume">Громкость TTS: {settings.ttsVolume}%</Label>
                          <Slider
                            id="ttsVolume"
                            min={0}
                            max={100}
                            step={5}
                            value={[settings.ttsVolume]}
                            onValueChange={([value]) => updateSetting("ttsVolume", value)}
                          />
                        </div>

                        <div className="space-y-3">
                          <Label>Что озвучивать:</Label>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="readName" className="font-normal">
                              Имя донатера
                            </Label>
                            <Switch
                              id="readName"
                              checked={settings.readDonorName}
                              onCheckedChange={(checked) => updateSetting("readDonorName", checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="readAmount" className="font-normal">
                              Сумма доната
                            </Label>
                            <Switch
                              id="readAmount"
                              checked={settings.readAmount}
                              onCheckedChange={(checked) => updateSetting("readAmount", checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="readMessage" className="font-normal">
                              Сообщение
                            </Label>
                            <Switch
                              id="readMessage"
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

              <TabsContent value="image" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Настройки изображения</CardTitle>
                    <CardDescription>Добавьте изображение к алерту</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-4">
                      <div className="space-y-0.5">
                        <Label htmlFor="enableImage" className="text-base">
                          Включить изображение
                        </Label>
                        <p className="text-sm text-muted-foreground">Показывать изображение в алерте</p>
                      </div>
                      <Switch
                        id="enableImage"
                        checked={settings.enableImage}
                        onCheckedChange={(checked) => updateSetting("enableImage", checked)}
                      />
                    </div>

                    {settings.enableImage && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="imageUrl">URL изображения (PNG, JPG, GIF)</Label>
                          <Input
                            id="imageUrl"
                            value={settings.imageUrl}
                            onChange={(e) => updateSetting("imageUrl", e.target.value)}
                            placeholder="https://example.com/image.gif"
                          />
                          <p className="text-xs text-muted-foreground">Поддерживаются анимированные GIF</p>
                        </div>

                        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-4">
                          <div className="space-y-0.5">
                            <Label htmlFor="imageAsBg" className="text-base">
                              Использовать как фон
                            </Label>
                            <p className="text-sm text-muted-foreground">Изображение будет растянуто на весь алерт</p>
                          </div>
                          <Switch
                            id="imageAsBg"
                            checked={settings.imageAsBackground}
                            onCheckedChange={(checked) => updateSetting("imageAsBackground", checked)}
                          />
                        </div>

                        {!settings.imageAsBackground && (
                          <div className="rounded-lg bg-blue-500/10 p-4 text-sm text-blue-600 dark:text-blue-400">
                            <p className="font-medium">Совет</p>
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

            <Card>
              <CardHeader>
                <CardTitle>Тестовый донат</CardTitle>
                <CardDescription>Отправьте тестовый донат для предпросмотра</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="testName">Имя донатера</Label>
                  <Input
                    id="testName"
                    value={testDonation.name}
                    onChange={(e) => setTestDonation((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="testAmount">Сумма (₽)</Label>
                  <Input
                    id="testAmount"
                    type="number"
                    value={testDonation.amount}
                    onChange={(e) => setTestDonation((prev) => ({ ...prev, amount: Number(e.target.value) }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="testMessage">Сообщение</Label>
                  <Textarea
                    id="testMessage"
                    value={testDonation.message}
                    onChange={(e) => setTestDonation((prev) => ({ ...prev, message: e.target.value }))}
                    rows={3}
                  />
                </div>

                <Button onClick={handleTestDonation} className="w-full" size="lg">
                  <Send className="mr-2 h-4 w-4" />
                  Отправить тестовый донат
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="space-y-6 lg:sticky lg:top-8 lg:h-fit">
            <Card>
              <CardHeader>
                <CardTitle>Конструктор</CardTitle>
                <CardDescription>Перетаскивайте и изменяйте размер элементов</CardDescription>
              </CardHeader>
              <CardContent>
                <DonationPreview
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

            <Card>
              <CardHeader>
                <CardTitle>Финальный предпросмотр</CardTitle>
                <CardDescription>Алерт с анимацией появится здесь после отправки теста</CardDescription>
              </CardHeader>
              <CardContent>
                <DonationFinalPreview settings={settings} donation={testDonation} show={showFinalPreview} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
