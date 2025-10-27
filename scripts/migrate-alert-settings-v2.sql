-- =====================================================
-- Migration: Alert Settings v2 (Advanced Editor)
-- Date: 2025-10-27
-- Description: Drop old alert_settings and create new schema with advanced positioning
-- =====================================================

-- Drop old table (THIS WILL DELETE ALL ALERT SETTINGS!)
DROP TABLE IF EXISTS alert_settings CASCADE;

-- Create new advanced alert_settings table
CREATE TABLE alert_settings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL,
  
  -- General settings
  min_amount DECIMAL(10, 2) DEFAULT 1.00 NOT NULL,
  message_template TEXT DEFAULT '{name} задонатил {amount}!' NOT NULL,
  show_donor_name BOOLEAN DEFAULT true NOT NULL,
  
  -- Visual settings
  animation_type VARCHAR(50) DEFAULT 'slide' NOT NULL,
  duration INTEGER DEFAULT 5 NOT NULL,
  background_color VARCHAR(7) DEFAULT '#6366f1' NOT NULL,
  text_color VARCHAR(7) DEFAULT '#ffffff' NOT NULL,
  transparent_background BOOLEAN DEFAULT false NOT NULL,
  
  -- Header (template) settings
  header_font_size INTEGER DEFAULT 24 NOT NULL,
  header_font_family VARCHAR(100) DEFAULT 'sans-serif' NOT NULL,
  header_position_x INTEGER DEFAULT 50 NOT NULL,
  header_position_y INTEGER DEFAULT 30 NOT NULL,
  header_width INTEGER DEFAULT 400 NOT NULL,
  header_height INTEGER DEFAULT 60 NOT NULL,
  
  -- Message settings
  message_font_size INTEGER DEFAULT 18 NOT NULL,
  message_font_family VARCHAR(100) DEFAULT 'sans-serif' NOT NULL,
  message_position_x INTEGER DEFAULT 50 NOT NULL,
  message_position_y INTEGER DEFAULT 70 NOT NULL,
  message_width INTEGER DEFAULT 400 NOT NULL,
  message_height INTEGER DEFAULT 80 NOT NULL,
  
  -- Image settings
  enable_image BOOLEAN DEFAULT true NOT NULL,
  image_url TEXT,
  image_width INTEGER DEFAULT 80 NOT NULL,
  image_height INTEGER DEFAULT 80 NOT NULL,
  image_position_x INTEGER DEFAULT 20 NOT NULL,
  image_position_y INTEGER DEFAULT 50 NOT NULL,
  image_as_background BOOLEAN DEFAULT false NOT NULL,
  
  -- Sound settings
  enable_sound BOOLEAN DEFAULT true NOT NULL,
  sound_url TEXT,
  sound_volume INTEGER DEFAULT 70 NOT NULL,
  
  -- TTS settings
  enable_tts BOOLEAN DEFAULT false NOT NULL,
  tts_voice VARCHAR(50) DEFAULT 'female' NOT NULL,
  tts_speed REAL DEFAULT 1.0 NOT NULL,
  tts_volume INTEGER DEFAULT 80 NOT NULL,
  read_donor_name BOOLEAN DEFAULT true NOT NULL,
  read_amount BOOLEAN DEFAULT true NOT NULL,
  read_message BOOLEAN DEFAULT true NOT NULL,
  
  -- Security
  alert_token UUID UNIQUE DEFAULT gen_random_uuid() NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes
CREATE INDEX idx_alert_settings_user_id ON alert_settings(user_id);
CREATE UNIQUE INDEX idx_alert_settings_alert_token ON alert_settings(alert_token);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_alert_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_alert_settings_updated_at
BEFORE UPDATE ON alert_settings
FOR EACH ROW
EXECUTE FUNCTION update_alert_settings_updated_at();

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Alert Settings v2 migration completed successfully!';
  RAISE NOTICE '⚠️  All previous alert settings have been deleted.';
  RAISE NOTICE '📝 Users will need to reconfigure their alerts.';
END $$;
