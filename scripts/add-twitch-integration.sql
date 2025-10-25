-- Add Twitch integration columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS twitch_id VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS twitch_username VARCHAR(255),
ADD COLUMN IF NOT EXISTS twitch_access_token TEXT,
ADD COLUMN IF NOT EXISTS twitch_refresh_token TEXT,
ADD COLUMN IF NOT EXISTS twitch_token_expires_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS is_live BOOLEAN DEFAULT FALSE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_twitch_id ON users(twitch_id);
CREATE INDEX IF NOT EXISTS idx_users_is_live ON users(is_live);

-- Comment
COMMENT ON COLUMN users.twitch_id IS 'Twitch user ID from OAuth';
COMMENT ON COLUMN users.twitch_username IS 'Twitch username/login';
COMMENT ON COLUMN users.is_live IS 'Whether the streamer is currently live on Twitch';
