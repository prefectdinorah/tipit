"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"

interface Track {
  id: number
  youtubeId: string
  title: string
  donorName: string
  donationAmount: number
}

export default function MusicPlayerPage() {
  const params = useParams()
  const username = params.username as string
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const playerRef = useRef<any>(null)
  const wsRef = useRef<WebSocket | null>(null)

  // Загрузка YouTube IFrame API
  useEffect(() => {
    const tag = document.createElement("script")
    tag.src = "https://www.youtube.com/iframe_api"
    const firstScriptTag = document.getElementsByTagName("script")[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

    // @ts-ignore
    window.onYouTubeIframeAPIReady = () => {
      console.log("YouTube IFrame API ready")
      initializePlayer()
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy()
      }
    }
  }, [])

  // WebSocket подключение для real-time обновлений
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
    const wsUrl = `${protocol}//${window.location.host}/api/music/ws?username=${username}`

    const connectWebSocket = () => {
      const ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        console.log("WebSocket connected")
      }

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        
        if (data.type === "PLAY_NEXT") {
          playTrack(data.track)
        } else if (data.type === "SKIP") {
          skipTrack()
        } else if (data.type === "CLEAR_QUEUE") {
          stopPlayback()
        }
      }

      ws.onerror = (error) => {
        console.error("WebSocket error:", error)
      }

      ws.onclose = () => {
        console.log("WebSocket disconnected, reconnecting...")
        setTimeout(connectWebSocket, 3000)
      }

      wsRef.current = ws
    }

    connectWebSocket()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [username])

  const initializePlayer = () => {
    // @ts-ignore
    playerRef.current = new window.YT.Player("youtube-player", {
      height: "720",
      width: "1280",
      playerVars: {
        autoplay: 1,
        controls: 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        fs: 0,
        playsinline: 1,
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
      },
    })
  }

  const onPlayerReady = () => {
    console.log("Player ready")
    fetchNextTrack()
  }

  const onPlayerStateChange = (event: any) => {
    // @ts-ignore
    if (event.data === window.YT.PlayerState.ENDED) {
      console.log("Track ended, playing next")
      markTrackAsPlayed()
      fetchNextTrack()
    } else if (event.data === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true)
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      setIsPlaying(false)
    }
  }

  const fetchNextTrack = async () => {
    try {
      const response = await fetch(`/api/music/next-track?username=${username}`)
      const data = await response.json()

      if (data.track) {
        playTrack(data.track)
      } else {
        stopPlayback()
      }
    } catch (error) {
      console.error("Failed to fetch next track:", error)
    }
  }

  const playTrack = (track: Track) => {
    setCurrentTrack(track)
    if (playerRef.current && playerRef.current.loadVideoById) {
      playerRef.current.loadVideoById(track.youtubeId)
      
      // Получаем громкость из настроек стримера
      fetch(`/api/music/get-volume?username=${username}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.volume && playerRef.current.setVolume) {
            playerRef.current.setVolume(data.volume)
          }
        })
        .catch(console.error)
    }
  }

  const skipTrack = () => {
    if (playerRef.current && playerRef.current.stopVideo) {
      playerRef.current.stopVideo()
    }
    markTrackAsSkipped()
    fetchNextTrack()
  }

  const stopPlayback = () => {
    setCurrentTrack(null)
    setIsPlaying(false)
    if (playerRef.current && playerRef.current.stopVideo) {
      playerRef.current.stopVideo()
    }
  }

  const markTrackAsPlayed = async () => {
    if (!currentTrack) return

    try {
      await fetch("/api/music/mark-played", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackId: currentTrack.id,
          username,
        }),
      })
    } catch (error) {
      console.error("Failed to mark track as played:", error)
    }
  }

  const markTrackAsSkipped = async () => {
    if (!currentTrack) return

    try {
      await fetch("/api/music/mark-skipped", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackId: currentTrack.id,
          username,
        }),
      })
    } catch (error) {
      console.error("Failed to mark track as skipped:", error)
    }
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-transparent">
      {/* YouTube Player - прозрачный фон когда нет видео */}
      <div
        id="youtube-player"
        className={`w-full h-full ${!currentTrack ? "opacity-0" : "opacity-100"}`}
      />
    </div>
  )
}
