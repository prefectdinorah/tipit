"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Heart, Music, DollarSign, CreditCard, Wallet, ArrowLeft, Volume2, Star, Info, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/toast"

interface StreamerData {
  username: string
  displayName: string
  avatarUrl: string | null
  bio: string | null
  settings: {
    donationGoal: number
    donationGoalDescription: string | null
    minDonationAmount: number
    trackRequestMinimum: number
    currency: string
  }
  stats: {
    totalDonations: number
    donationGoal: number
    progress: number
  }
}

export default function DonatePage() {
  const params = useParams()
  const streamerUsername = params.streamer as string

  const [streamer, setStreamer] = useState<StreamerData | null>(null)
  const [isLoadingStreamer, setIsLoadingStreamer] = useState(true)

  const [amount, setAmount] = useState("")
  const [customAmount, setCustomAmount] = useState("")
  const [currency, setCurrency] = useState("USD")
  const [message, setMessage] = useState("")
  const [trackRequest, setTrackRequest] = useState("")
  const [trackUrl, setTrackUrl] = useState("")
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [senderName, setSenderName] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("")
  const [showTrackRequest, setShowTrackRequest] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isValidatingYoutube, setIsValidatingYoutube] = useState(false)
  const [youtubeValidation, setYoutubeValidation] = useState<{
    isValid: boolean
    videoInfo?: any
    error?: string
  } | null>(null)

  const { toast, ToastContainer } = useToast()

  const quickAmounts = [5, 10, 25, 50, 100, 200]

  // Загружаем данные стримера
  useEffect(() => {
    loadStreamerData()
  }, [streamerUsername])

  useEffect(() => {
    if (!streamer) return
    const currentAmount = Number.parseFloat(amount || customAmount || "0")
    const trackMinimum = streamer.settings.trackRequestMinimum
    setShowTrackRequest(currentAmount >= trackMinimum)

    if (currentAmount < trackMinimum) {
      setTrackRequest("")
      setTrackUrl("")
      setYoutubeUrl("")
      setYoutubeValidation(null)
    }
  }, [amount, customAmount, streamer])

  // Валидация YouTube URL при изменении
  useEffect(() => {
    if (!youtubeUrl || !streamer) {
      setYoutubeValidation(null)
      return
    }

    const validateYoutube = async () => {
      setIsValidatingYoutube(true)
      try {
        const response = await fetch("/api/music/validate-youtube", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ youtubeUrl }),
        })

        const data = await response.json()

        if (data.success) {
          setYoutubeValidation({
            isValid: true,
            videoInfo: data.videoInfo,
          })
        } else {
          setYoutubeValidation({
            isValid: false,
            error: data.error || "Invalid YouTube video",
          })
        }
      } catch (error) {
        setYoutubeValidation({
          isValid: false,
          error: "Failed to validate YouTube URL",
        })
      } finally {
        setIsValidatingYoutube(false)
      }
    }

    const debounceTimer = setTimeout(validateYoutube, 800)
    return () => clearTimeout(debounceTimer)
  }, [youtubeUrl, streamer])

  const loadStreamerData = async () => {
    try {
      setIsLoadingStreamer(true)
      const response = await fetch(`/api/streamer/${streamerUsername}`)

      if (!response.ok) {
        throw new Error("Streamer not found")
      }

      const data = await response.json()
      setStreamer(data.streamer)
      setCurrency(data.streamer.settings.currency)
    } catch (error) {
      toast({
        type: "error",
        title: "Error",
        description: "Streamer not found or unavailable",
      })
    } finally {
      setIsLoadingStreamer(false)
    }
  }

  const getCurrentAmount = () => {
    return Number.parseFloat(amount || customAmount || "0")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!streamer) return

    const currentAmount = getCurrentAmount()

    if (currentAmount === 0) {
      toast({
        type: "error",
        title: "Invalid Amount",
        description: "Please select or enter a donation amount.",
      })
      return
    }

    if (currentAmount < streamer.settings.minDonationAmount) {
      toast({
        type: "error",
        title: "Amount Too Low",
        description: `Minimum donation is $${streamer.settings.minDonationAmount}`,
      })
      return
    }

    if (!paymentMethod) {
      toast({
        type: "error",
        title: "Payment Method Required",
        description: "Please select a payment method.",
      })
      return
    }

    if (!isAnonymous && !senderName.trim()) {
      toast({
        type: "error",
        title: "Name Required",
        description: "Please enter your name or choose to donate anonymously.",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const donationData = {
        streamerUsername: streamer.username,
        donorName: isAnonymous ? "Anonymous" : senderName,
        amount: currentAmount,
        currency,
        message: message || undefined,
        youtubeUrl: youtubeUrl || undefined,
        isAnonymous,
      }

      const response = await fetch("/api/donations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(donationData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to process donation")
      }

      toast({
        type: "success",
        title: "Donation Successful!",
        description: `Thank you for donating $${currentAmount} ${currency}!`,
      })

      // Перезагружаем данные стримера для обновления прогресса
      loadStreamerData()

      // Очищаем форму
      setAmount("")
      setCustomAmount("")
      setMessage("")
      setTrackRequest("")
      setTrackUrl("")
      setYoutubeUrl("")
      setYoutubeValidation(null)
      setSenderName("")
      setPaymentMethod("")
    } catch (error) {
      toast({
        type: "error",
        title: "Donation Failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingStreamer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    )
  }

  if (!streamer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-slate-800/50 border-purple-800/30">
          <CardContent className="p-12 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Streamer Not Found</h1>
            <p className="text-purple-300 mb-6">The streamer you're looking for doesn't exist or is unavailable.</p>
            <Link href="/">
              <Button className="bg-purple-600 hover:bg-purple-700">Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <ToastContainer />

      <header className="border-b border-purple-800/30 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center text-purple-300 hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to stream
            </Link>
            <div className="flex items-center space-x-4">
              <Avatar className="h-10 w-10 border-2 border-purple-500">
                <AvatarImage src={streamer.avatarUrl || undefined} />
                <AvatarFallback className="bg-purple-600 text-white">
                  {streamer.displayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-lg font-bold text-white">{streamer.displayName}</h1>
                <div className="flex items-center text-sm text-purple-300">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                  Live • Streaming
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 border-purple-800/30 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center text-2xl">
                  <Heart className="mr-3 h-7 w-7 text-purple-400" />
                  Support {streamer.displayName}
                </CardTitle>
                <CardDescription className="text-purple-300 text-base">
                  Show your support and send a message to the streamer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                  {!isAnonymous && (
                    <div>
                      <Label htmlFor="senderName" className="text-purple-300 text-base font-medium">
                        Your Name
                      </Label>
                      <Input
                        id="senderName"
                        placeholder="Enter your name"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        className="mt-2 bg-slate-700/50 border-purple-800/30 text-white placeholder:text-purple-400"
                        disabled={isSubmitting}
                      />
                    </div>
                  )}

                  <div>
                    <Label className="text-purple-300 text-base font-medium">Donation Amount</Label>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-3">
                      {quickAmounts.map((quickAmount) => (
                        <Button
                          key={quickAmount}
                          type="button"
                          variant={amount === quickAmount.toString() ? "default" : "outline"}
                          className={`relative ${
                            amount === quickAmount.toString()
                              ? "bg-purple-600 hover:bg-purple-700 text-white border-purple-500"
                              : "border-purple-800/30 bg-slate-700/30 text-purple-300 hover:bg-purple-600/20"
                          }`}
                          onClick={() => {
                            setAmount(quickAmount.toString())
                            setCustomAmount("")
                          }}
                          disabled={isSubmitting}
                        >
                          ${quickAmount}
                          {quickAmount >= streamer.settings.trackRequestMinimum && (
                            <Music className="absolute -top-1 -right-1 h-3 w-3 text-purple-400" />
                          )}
                        </Button>
                      ))}
                    </div>
                    <div className="flex items-center space-x-2 mt-4">
                      <div className="flex-1">
                        <Input
                          placeholder="Custom amount"
                          value={customAmount}
                          onChange={(e) => {
                            setCustomAmount(e.target.value)
                            setAmount("")
                          }}
                          className="bg-slate-700/50 border-purple-800/30 text-white placeholder:text-purple-400"
                          disabled={isSubmitting}
                        />
                      </div>
                      <Select value={currency} onValueChange={setCurrency} disabled={isSubmitting}>
                        <SelectTrigger className="w-24 bg-slate-700/50 border-purple-800/30 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-purple-800/30">
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="RUB">RUB</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Alert className="mt-4 bg-purple-900/30 border-purple-700/50">
                      <Info className="h-4 w-4 text-purple-400" />
                      <AlertDescription className="text-purple-200">
                        {getCurrentAmount() >= streamer.settings.trackRequestMinimum
                          ? "Track requests are available! You can request a song."
                          : `Track requests available from $${streamer.settings.trackRequestMinimum}. Current: $${getCurrentAmount()}`}
                      </AlertDescription>
                    </Alert>
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-purple-300 text-base font-medium">
                      Message (Optional)
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Leave a message for the streamer..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      maxLength={500}
                      className="mt-2 bg-slate-700/50 border-purple-800/30 text-white placeholder:text-purple-400 min-h-[120px]"
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-purple-400 mt-1">{message.length}/500 characters</p>
                  </div>

                  {showTrackRequest && (
                    <div className="space-y-4 p-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg border border-purple-700/30">
                      <div className="flex items-center space-x-2">
                        <Music className="h-5 w-5 text-purple-400" />
                        <Label className="text-purple-300 text-base font-medium">Request a YouTube Track</Label>
                        <Badge className="bg-purple-600 text-white text-xs">Available</Badge>
                      </div>

                      <div>
                        <Label htmlFor="youtubeUrl" className="text-purple-300 text-sm">
                          YouTube URL
                        </Label>
                        <Input
                          id="youtubeUrl"
                          placeholder="https://youtube.com/watch?v=..."
                          value={youtubeUrl}
                          onChange={(e) => setYoutubeUrl(e.target.value)}
                          className="mt-1 bg-slate-700/50 border-purple-800/30 text-white placeholder:text-purple-400"
                          disabled={isSubmitting}
                        />
                        {isValidatingYoutube && (
                          <p className="text-xs text-purple-400 mt-1 flex items-center">
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Validating video...
                          </p>
                        )}
                        {youtubeValidation && !isValidatingYoutube && (
                          <div className="mt-2">
                            {youtubeValidation.isValid && youtubeValidation.videoInfo ? (
                              <div className="flex items-start space-x-3 p-3 bg-green-900/20 border border-green-700/50 rounded-lg">
                                {youtubeValidation.videoInfo.thumbnailUrl && (
                                  <img
                                    src={youtubeValidation.videoInfo.thumbnailUrl}
                                    alt="Video thumbnail"
                                    className="w-20 h-auto rounded"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-green-300 truncate">
                                    {youtubeValidation.videoInfo.title}
                                  </p>
                                  <p className="text-xs text-green-400 mt-1">
                                    Duration: {Math.floor(youtubeValidation.videoInfo.duration / 60)}:
                                    {(youtubeValidation.videoInfo.duration % 60).toString().padStart(2, "0")}
                                  </p>
                                  <p className="text-xs text-green-400">
                                    {youtubeValidation.videoInfo.views.toLocaleString()} views
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <Alert className="bg-red-900/20 border-red-700/50">
                                <AlertDescription className="text-red-300 text-sm">
                                  {youtubeValidation.error}
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="anonymous"
                      checked={isAnonymous}
                      onCheckedChange={(checked) => {
                        setIsAnonymous(checked as boolean)
                        if (checked) setSenderName("")
                      }}
                      className="border-purple-500 data-[state=checked]:bg-purple-600"
                      disabled={isSubmitting}
                    />
                    <Label htmlFor="anonymous" className="text-purple-300">
                      Send anonymously
                    </Label>
                  </div>

                  <div>
                    <Label className="text-purple-300 text-base font-medium">Payment Method</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                      <Button
                        type="button"
                        variant={paymentMethod === "card" ? "default" : "outline"}
                        className={paymentMethod === "card" ? "bg-purple-600" : "border-purple-800/30 bg-slate-700/30"}
                        onClick={() => setPaymentMethod("card")}
                        disabled={isSubmitting}
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        Credit Card
                      </Button>
                      <Button
                        type="button"
                        variant={paymentMethod === "paypal" ? "default" : "outline"}
                        className={
                          paymentMethod === "paypal" ? "bg-purple-600" : "border-purple-800/30 bg-slate-700/30"
                        }
                        onClick={() => setPaymentMethod("paypal")}
                        disabled={isSubmitting}
                      >
                        <Wallet className="mr-2 h-4 w-4" />
                        PayPal
                      </Button>
                      <Button
                        type="button"
                        variant={paymentMethod === "crypto" ? "default" : "outline"}
                        className={
                          paymentMethod === "crypto" ? "bg-purple-600" : "border-purple-800/30 bg-slate-700/30"
                        }
                        onClick={() => setPaymentMethod("crypto")}
                        disabled={isSubmitting}
                      >
                        <DollarSign className="mr-2 h-4 w-4" />
                        Crypto
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    disabled={isSubmitting || (!amount && !customAmount) || !paymentMethod}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Heart className="mr-2 h-5 w-5" />
                        Donate ${amount || customAmount || "0"} {currency}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-purple-800/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Volume2 className="mr-2 h-5 w-5 text-purple-400" />
                  Now Streaming
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="aspect-video bg-slate-700/50 rounded-lg flex items-center justify-center border border-purple-800/30">
                    <Volume2 className="h-8 w-8 text-purple-300" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{streamer.displayName}'s Stream</h3>
                    {streamer.bio && <p className="text-purple-300 text-sm mt-1">{streamer.bio}</p>}
                  </div>
                  <Badge variant="secondary" className="bg-red-600 text-white">
                    LIVE
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-800/50 to-pink-800/50 border-purple-600/30">
              <CardHeader>
                <CardTitle className="text-white text-center flex items-center justify-center">
                  <Star className="mr-2 h-5 w-5 text-yellow-400" />
                  Stream Goal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div>
                    <div className="text-2xl font-bold text-white">
                      ${streamer.stats.totalDonations.toFixed(2)} / ${streamer.stats.donationGoal}
                    </div>
                    <p className="text-purple-200 text-sm">
                      {streamer.settings.donationGoalDescription || "Support the stream"}
                    </p>
                  </div>
                  <div className="w-full bg-slate-700/50 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(streamer.stats.progress, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-purple-200 text-sm">{streamer.stats.progress.toFixed(1)}% Complete</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
