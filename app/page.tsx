"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, Music, Users, DollarSign, TrendingUp, Copy, ExternalLink, Play, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/toast"

interface Donation {
  id: string
  donorName: string
  amount: number
  currency: string
  message?: string
  trackRequest?: {
    title: string
    artist: string
  }
  createdAt: string
  played: boolean
}

function DonationLinkSection({ username }: { username: string }) {
  const [copied, setCopied] = useState(false)
  const [donationUrl, setDonationUrl] = useState(`/donate/${username}`)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDonationUrl(`${window.location.origin}/donate/${username}`)
    }
  }, [username])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(donationUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }

  return (
    <div className="flex items-center justify-center space-x-4 flex-wrap gap-2">
      <code className="bg-slate-900/50 text-purple-300 px-4 py-2 rounded-lg border border-purple-800/30 text-sm">
        {donationUrl}
      </code>
      <Button onClick={copyToClipboard} className="bg-purple-600 hover:bg-purple-700">
        <Copy className="h-4 w-4 mr-2" />
        {copied ? "Copied!" : "Copy Link"}
      </Button>
      <Link href={`/donate/${username}`}>
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          <ExternalLink className="h-4 w-4 mr-2" />
          Make a Donation
        </Button>
      </Link>
    </div>
  )
}

export default function StreamerDashboard() {
  const [username, setUsername] = useState("StreamerName")
  const [displayName, setDisplayName] = useState("StreamerName")
  const [currency, setCurrency] = useState("USD")
  const [donations, setDonations] = useState<Donation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalAmount: 0,
    todayAmount: 0,
    totalDonors: 0,
    totalDonations: 0,
  })
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  const { toast, ToastContainer } = useToast()

  useEffect(() => {
    const storedUsername = localStorage.getItem("username")
    if (storedUsername) {
      setUsername(storedUsername)
    }
    loadUserProfile()
    loadDonations()

    // Слушаем событие обновления аватарки
    const handleAvatarUpdate = (event: CustomEvent) => {
      console.log("Avatar updated, reloading...")
      setAvatarUrl(event.detail.avatarUrl)
    }

    window.addEventListener("avatarUpdated" as any, handleAvatarUpdate)

    return () => {
      window.removeEventListener("avatarUpdated" as any, handleAvatarUpdate)
    }
  }, [])

  const loadUserProfile = async () => {
    try {
      const response = await fetch("/api/auth/session", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        if (data.user) {
          setDisplayName(data.user.displayName || data.user.username)
          setUsername(data.user.username)
          if (data.user.avatarUrl) {
            setAvatarUrl(`${data.user.avatarUrl}?t=${Date.now()}`)
          }
        }
      }
    } catch (error) {
      console.error("Failed to load user profile:", error)
    }
  }

  const loadDonations = async () => {
    try {
      setIsLoading(true)

      const donationsResponse = await fetch("/api/donations?limit=10", {
        credentials: "include",
      })

      if (donationsResponse.ok) {
        const data = await donationsResponse.json()
        setDonations(data.donations || [])
      }

      const statsResponse = await fetch("/api/donations/stats?period=all", {
        credentials: "include",
      })

      if (statsResponse.ok) {
        const data = await statsResponse.json()
        if (data.stats) {
          setStats({
            totalAmount: data.stats.totalAmount || 0,
            todayAmount: 0,
            totalDonors: data.stats.totalDonors || 0,
            totalDonations: data.stats.totalDonations || 0,
          })
        }
      }
    } catch (error) {
      console.error("Failed to load donations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("username")
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`
    return `${Math.floor(diffMins / 1440)} days ago`
  }

  const requestedTracks = donations.filter((d) => d.trackRequest)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <ToastContainer />

      <header className="border-b border-purple-800/30 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12 border-2 border-purple-500">
                <AvatarImage src={avatarUrl || "/placeholder.svg?height=48&width=48"} />
                <AvatarFallback className="bg-purple-600 text-white">
                  {username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-white">{displayName}</h1>
                <p className="text-purple-300">Live • 1,234 viewers</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-slate-800/50 border border-purple-800/30 rounded-lg px-3 py-2">
                <span className="text-purple-300 text-sm">Currency:</span>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="w-[100px] h-8 bg-slate-700/50 border-purple-800/30 text-white">
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
              <Link href="/donations">
                <Button
                  variant="outline"
                  className="border-purple-500 text-purple-300 hover:bg-purple-500 hover:text-white bg-transparent"
                >
                  View All Donations
                </Button>
              </Link>
              <Link href="/settings">
                <Button className="bg-purple-600 hover:bg-purple-700">Settings</Button>
              </Link>
              <Link href="/auth/login" onClick={handleLogout}>
                <Button
                  variant="outline"
                  className="border-purple-500 text-purple-300 hover:bg-purple-500 hover:text-white bg-transparent"
                >
                  Log out
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-purple-800/30 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-300">Total Donations</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${stats.totalAmount.toFixed(2)}</div>
              <p className="text-xs text-purple-300">{stats.totalDonations} total donations</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-800/30 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-300">This Stream</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${stats.todayAmount.toFixed(2)}</div>
              <p className="text-xs text-purple-300">Recent activity</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-800/30 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-300">Supporters</CardTitle>
              <Users className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalDonors}</div>
              <p className="text-xs text-purple-300">Unique donors</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-800/30 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-300">Track Requests</CardTitle>
              <Music className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{requestedTracks.length}</div>
              <p className="text-xs text-purple-300">Pending requests</p>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-slate-800/50 border-purple-800/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Heart className="mr-2 h-5 w-5 text-purple-400" />
                  Recent Donations
                </CardTitle>
                <CardDescription className="text-purple-300">Latest support from your community</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  {donations.length === 0 ? (
                    <p className="text-purple-300 text-center py-8">No donations yet</p>
                  ) : (
                    <div className="space-y-4">
                      {donations.map((donation) => (
                        <div key={donation.id} className="p-4 rounded-lg bg-slate-700/30 border border-purple-800/20">
                          <div className="flex items-start space-x-4">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-purple-600 text-white text-sm">
                                {donation.donorName.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-white">{donation.donorName}</p>
                                  {donation.message && (
                                    <p className="text-sm text-purple-200 mt-1">{donation.message}</p>
                                  )}
                                  {donation.trackRequest && (
                                    <div className="flex items-center mt-2 text-xs text-purple-300">
                                      <Music className="h-3 w-3 mr-1" />
                                      {donation.trackRequest.title} - {donation.trackRequest.artist}
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-col items-center justify-center space-y-2 ml-4">
                                  <span className="text-xs text-purple-300 whitespace-nowrap">
                                    {formatTimeAgo(donation.createdAt)}
                                  </span>
                                  <div className="flex items-center space-x-2">
                                    <Badge variant="secondary" className="bg-purple-600 text-white text-xs px-2 py-1">
                                      ${donation.amount}
                                    </Badge>
                                    {!donation.played && (
                                      <Button
                                        size="sm"
                                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-xs px-2 py-1 h-6"
                                      >
                                        <Play className="h-2 w-2 mr-1" />
                                        Play
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-purple-800/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Music className="mr-2 h-5 w-5 text-purple-400" />
                  Requested Tracks
                </CardTitle>
                <CardDescription className="text-purple-300">Music requests from donations</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  {requestedTracks.length === 0 ? (
                    <p className="text-purple-300 text-center py-8">No track requests yet</p>
                  ) : (
                    <div className="space-y-4">
                      {requestedTracks.map((donation) => (
                        <div
                          key={donation.id}
                          className="flex items-center justify-between p-4 rounded-lg bg-slate-700/30 border border-purple-800/20"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {donation.trackRequest!.title} - {donation.trackRequest!.artist}
                            </p>
                            <p className="text-xs text-purple-300">Requested by {donation.donorName}</p>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <Badge variant="outline" className="border-purple-500 text-purple-300">
                              ${donation.amount}
                            </Badge>
                            {!donation.played && (
                              <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                                Play
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="mt-8 bg-gradient-to-r from-purple-800/50 to-pink-800/50 border-purple-600/30 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">Support the Stream</h3>
              <p className="text-purple-200 mb-4">Share your donation link with viewers</p>
              <DonationLinkSection username={username} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
