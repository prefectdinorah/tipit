-- Create alert_settings table
CREATE TABLE IF NOT EXISTS "alert_settings" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "font_size" INTEGER NOT NULL DEFAULT 40,
    "font_family" TEXT NOT NULL DEFAULT 'Roboto',
    "text_color" TEXT NOT NULL DEFAULT '#ffffff',
    "text_animation" TEXT NOT NULL DEFAULT 'slide',
    "duration" INTEGER NOT NULL DEFAULT 5,
    "position" TEXT NOT NULL DEFAULT 'center',
    "min_amount" DECIMAL(10,2) NOT NULL DEFAULT 1.00,
    "image_enabled" BOOLEAN NOT NULL DEFAULT true,
    "image_url" TEXT,
    "image_size" INTEGER NOT NULL DEFAULT 200,
    "sound_enabled" BOOLEAN NOT NULL DEFAULT true,
    "sound_url" TEXT,
    "sound_volume" INTEGER NOT NULL DEFAULT 75,
    "tts_enabled" BOOLEAN NOT NULL DEFAULT false,
    "tts_voice" TEXT NOT NULL DEFAULT 'en-US',
    "tts_speed" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "tts_volume" INTEGER NOT NULL DEFAULT 80,
    "alert_token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alert_settings_pkey" PRIMARY KEY ("id")
);

-- Create unique index on user_id
CREATE UNIQUE INDEX IF NOT EXISTS "alert_settings_user_id_key" ON "alert_settings"("user_id");

-- Create unique index on alert_token
CREATE UNIQUE INDEX IF NOT EXISTS "alert_settings_alert_token_key" ON "alert_settings"("alert_token");

-- Add foreign key constraint
ALTER TABLE "alert_settings" 
ADD CONSTRAINT "alert_settings_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Verify table was created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'alert_settings';
