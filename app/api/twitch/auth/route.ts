import { NextRequest, NextResponse } from "next/server"

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET
const TWITCH_REDIRECT_URI = process.env.TWITCH_REDIRECT_URI || "http://localhost:3001/api/twitch/callback"

export async function GET(request: NextRequest) {
  try {
    const scopes = [
      "user:read:email",
      "channel:read:stream_key",
      "channel:read:subscriptions",
    ].join(" ")

    const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${TWITCH_CLIENT_ID}&redirect_uri=${encodeURIComponent(TWITCH_REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(scopes)}`

    return NextResponse.json({ url: authUrl })
  } catch (error) {
    console.error("❌ Twitch auth error:", error)
    return NextResponse.json({ error: "Failed to generate auth URL" }, { status: 500 })
  }
}
