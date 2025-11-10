/**
 * YouTube API Integration
 * Получение метаданных видео и валидация
 */

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || ""

interface YouTubeVideoInfo {
  id: string
  title: string
  duration: number // seconds
  thumbnailUrl: string
  channelId: string
  channelTitle: string
  viewCount: number
  isEmbeddable: boolean
}

/**
 * Извлекает YouTube video ID из различных форматов URL
 */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  // Если это просто ID (11 символов)
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url
  }

  return null
}

/**
 * Проверяет валидность YouTube URL
 */
export function isValidYouTubeUrl(url: string): boolean {
  return extractYouTubeId(url) !== null
}

/**
 * Конвертирует ISO 8601 duration в секунды
 * Пример: PT4M13S -> 253 секунды
 */
function parseDuration(duration: string): number {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
  if (!match) return 0

  const hours = (match[1] ? parseInt(match[1].replace('H', '')) : 0)
  const minutes = (match[2] ? parseInt(match[2].replace('M', '')) : 0)
  const seconds = (match[3] ? parseInt(match[3].replace('S', '')) : 0)

  return hours * 3600 + minutes * 60 + seconds
}

/**
 * Получает информацию о видео через YouTube Data API
 */
export async function getYouTubeVideoInfo(videoId: string): Promise<YouTubeVideoInfo | null> {
  if (!YOUTUBE_API_KEY) {
    console.warn("YouTube API key not configured")
    // Возвращаем минимальные данные без API
    return {
      id: videoId,
      title: "YouTube Video",
      duration: 0,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      channelId: "",
      channelTitle: "",
      viewCount: 0,
      isEmbeddable: true,
    }
  }

  try {
    const url = new URL("https://www.googleapis.com/youtube/v3/videos")
    url.searchParams.append("part", "snippet,contentDetails,statistics,status")
    url.searchParams.append("id", videoId)
    url.searchParams.append("key", YOUTUBE_API_KEY)

    const response = await fetch(url.toString())
    const data = await response.json()

    if (!response.ok || !data.items || data.items.length === 0) {
      console.error("YouTube API error:", data.error || "Video not found")
      return null
    }

    const video = data.items[0]
    
    return {
      id: videoId,
      title: video.snippet.title,
      duration: parseDuration(video.contentDetails.duration),
      thumbnailUrl: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default.url,
      channelId: video.snippet.channelId,
      channelTitle: video.snippet.channelTitle,
      viewCount: parseInt(video.statistics.viewCount || "0"),
      isEmbeddable: video.status.embeddable !== false,
    }
  } catch (error) {
    console.error("Failed to fetch YouTube video info:", error)
    return null
  }
}

/**
 * Валидирует видео по правилам стримера
 */
export interface VideoValidationResult {
  isValid: boolean
  error?: string
  videoInfo?: YouTubeVideoInfo
}

export async function validateYouTubeVideo(
  videoId: string,
  options: {
    minViews?: number
    maxDuration?: number
    blacklistedChannels?: string[]
    blacklistedVideos?: string[]
  } = {}
): Promise<VideoValidationResult> {
  const {
    minViews = 5000,
    maxDuration = 600, // 10 минут по умолчанию
    blacklistedChannels = [],
    blacklistedVideos = [],
  } = options

  // Проверка черного списка видео
  if (blacklistedVideos.includes(videoId)) {
    return {
      isValid: false,
      error: "This video is blocked by the streamer",
    }
  }

  const videoInfo = await getYouTubeVideoInfo(videoId)

  if (!videoInfo) {
    return {
      isValid: false,
      error: "Failed to fetch video information",
    }
  }

  // Проверка черного списка каналов
  if (videoInfo.channelId && blacklistedChannels.includes(videoInfo.channelId)) {
    return {
      isValid: false,
      error: "Videos from this channel are blocked",
    }
  }

  // Проверка возможности встраивания
  if (!videoInfo.isEmbeddable) {
    return {
      isValid: false,
      error: "This video cannot be embedded",
    }
  }

  // Проверка просмотров (только если API ключ настроен)
  if (YOUTUBE_API_KEY && videoInfo.viewCount < minViews) {
    return {
      isValid: false,
      error: `Video must have at least ${minViews.toLocaleString()} views (has ${videoInfo.viewCount.toLocaleString()})`,
    }
  }

  // Проверка длительности
  if (videoInfo.duration > maxDuration) {
    const maxMins = Math.floor(maxDuration / 60)
    const vidMins = Math.floor(videoInfo.duration / 60)
    return {
      isValid: false,
      error: `Video is too long (${vidMins} min, max ${maxMins} min)`,
    }
  }

  return {
    isValid: true,
    videoInfo,
  }
}
