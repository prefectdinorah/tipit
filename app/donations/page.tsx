"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Search, Filter, Music, MessageSquare, Clock, Play, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"

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

export default function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [filteredDonations, setFilteredDonations] = useState<Donation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalAmount, setTotalAmount] = useState(0)

  // Фильтры
  const [searchQuery, setSearchQuery] = useState("")
  const [amountFilter, setAmountFilter] = useState("all")
  const [timeFilter, setTimeFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  useEffect(() => {
    loadDonations()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [donations, searchQuery, amountFilter, timeFilter, typeFilter])

  const loadDonations = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/donations?limit=100", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setDonations(data.donations || [])

        // Считаем общую сумму
        const total = (data.donations || []).reduce((sum: number, d: Donation) => sum + d.amount, 0)
        setTotalAmount(total)
      }
    } catch (error) {
      console.error("Failed to load donations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...donations]

    // Поиск по имени
    if (searchQuery) {
      filtered = filtered.filter((d) => d.donorName.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    // Фильтр по сумме
    if (amountFilter !== "all") {
      const [min, max] = amountFilter.split("-").map(Number)
      if (max) {
        filtered = filtered.filter((d) => d.amount >= min && d.amount <= max)
      } else {
        filtered = filtered.filter((d) => d.amount >= min)
      }
    }

    // Фильтр по времени
    if (timeFilter !== "all") {
      const now = new Date()
      const filterDate = new Date()

      switch (timeFilter) {
        case "today":
          filterDate.setHours(0, 0, 0, 0)
          break
        case "week":
          filterDate.setDate(now.getDate() - 7)
          break
        case "month":
          filterDate.setDate(now.getDate() - 30)
          break
      }

      filtered = filtered.filter((d) => new Date(d.createdAt) >= filterDate)
    }

    // Фильтр по типу
    if (typeFilter === "with-track") {
      filtered = filtered.filter((d) => d.trackRequest)
    } else if (typeFilter === "message-only") {
      filtered = filtered.filter((d) => !d.trackRequest)
    }

    setFilteredDonations(filtered)
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    return `${diffDays} days ago`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
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
              <h1 className="text-2xl font-bold text-white">All Donations</h1>
            </div>
            <div className="text-purple-300">
              Total: <span className="text-white font-bold">${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-8 bg-slate-800/50 border-purple-800/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Filter className="mr-2 h-5 w-5 text-purple-400" />
              Filter Donations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-purple-400" />
                <Input
                  placeholder="Search by sender..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-700/50 border-purple-800/30 text-white placeholder:text-purple-400"
                />
              </div>
              <Select value={amountFilter} onValueChange={setAmountFilter}>
                <SelectTrigger className="bg-slate-700/50 border-purple-800/30 text-white">
                  <SelectValue placeholder="Amount range" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-purple-800/30">
                  <SelectItem value="all">All amounts</SelectItem>
                  <SelectItem value="1-10">$1 - $10</SelectItem>
                  <SelectItem value="11-50">$11 - $50</SelectItem>
                  <SelectItem value="51-100">$51 - $100</SelectItem>
                  <SelectItem value="100-999999">$100+</SelectItem>
                </SelectContent>
              </Select>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="bg-slate-700/50 border-purple-800/30 text-white">
                  <SelectValue placeholder="Time period" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-purple-800/30">
                  <SelectItem value="all">All time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This week</SelectItem>
                  <SelectItem value="month">This month</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="bg-slate-700/50 border-purple-800/30 text-white">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-purple-800/30">
                  <SelectItem value="all">All donations</SelectItem>
                  <SelectItem value="with-track">With track request</SelectItem>
                  <SelectItem value="message-only">Message only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results count */}
        <div className="mb-4 text-purple-300">
          Showing {filteredDonations.length} of {donations.length} donations
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          </div>
        ) : filteredDonations.length === 0 ? (
          <Card className="bg-slate-800/50 border-purple-800/30">
            <CardContent className="p-12 text-center">
              <p className="text-purple-300 text-lg">No donations found matching your filters</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Donations Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredDonations.map((donation) => (
                <Card
                  key={donation.id}
                  className="bg-slate-800/50 border-purple-800/30 backdrop-blur-sm hover:bg-slate-800/70 transition-colors"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-12 w-12 border-2 border-purple-500">
                        <AvatarFallback className="bg-purple-600 text-white font-semibold">
                          {donation.donorName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-white">{donation.donorName}</h3>
                          <div className="flex flex-col items-end space-y-2">
                            <Badge className="bg-purple-600 text-white font-bold min-w-[80px] h-8 flex items-center justify-center">
                              ${donation.amount} {donation.currency}
                            </Badge>
                            {!donation.played && (
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-xs min-w-[80px] h-8 flex items-center justify-center"
                              >
                                <Play className="h-3 w-3 mr-1" />
                                Play
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center text-sm text-purple-300 mb-3">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatTimeAgo(donation.createdAt)}
                        </div>

                        {donation.message && (
                          <div className="bg-slate-700/30 rounded-lg p-4 mb-3 border border-purple-800/20">
                            <div className="flex items-start">
                              <MessageSquare className="h-4 w-4 text-purple-400 mr-2 mt-0.5 flex-shrink-0" />
                              <p className="text-purple-100 text-sm leading-relaxed">{donation.message}</p>
                            </div>
                          </div>
                        )}

                        {donation.trackRequest && (
                          <div className="bg-gradient-to-r from-purple-800/30 to-pink-800/30 rounded-lg p-3 border border-purple-600/30">
                            <div className="flex items-center">
                              <Music className="h-4 w-4 text-purple-400 mr-2" />
                              <span className="text-purple-200 text-sm font-medium">Track Request:</span>
                            </div>
                            <p className="text-white text-sm mt-1 font-medium">
                              {donation.trackRequest.title} - {donation.trackRequest.artist}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
