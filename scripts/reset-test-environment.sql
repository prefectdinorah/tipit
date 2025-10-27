-- =====================================================
-- Reset Test Environment
-- Date: 2025-10-27
-- Description: Clean database and create fresh test streamer
-- ⚠️ WARNING: THIS WILL DELETE ALL DATA!
-- =====================================================

BEGIN;

-- Step 1: Drop all data (preserve schema)
DO $$
BEGIN
  RAISE NOTICE '🗑️  Cleaning all tables...';
END $$;

TRUNCATE TABLE 
  user_statistics,
  social_links,
  banned_content,
  donation_goals,
  payment_methods,
  sessions,
  alert_settings,
  streamer_settings,
  users
RESTART IDENTITY CASCADE;

-- Step 2: Create test streamer
DO $$
BEGIN
  RAISE NOTICE '👤 Creating test streamer...';
END $$;

INSERT INTO users (
  uuid,
  username,
  email,
  password_hash,
  display_name,
  avatar_url,
  bio,
  timezone,
  is_active,
  is_verified,
  is_premium
) VALUES (
  gen_random_uuid(),
  'teststreamer',
  'test@tipit.dev',
  -- Password: Test1234! (bcrypt hash)
  '$2b$10$rKJ5LqN.mH5j5sQZYxWLxeK4rH3p7qF5jN.mH5j5sQZYxWLxeK4rH3',
  'Test Streamer',
  NULL,
  'Test streamer account for development',
  'UTC',
  true,
  true,
  true
) RETURNING id;

-- Step 3: Create default settings for test streamer
INSERT INTO streamer_settings (
  user_id,
  donation_goal,
  min_donation_amount,
  track_request_minimum,
  alert_volume,
  alert_duration,
  sound_alert_enabled,
  visual_alert_enabled,
  tts_enabled,
  theme,
  primary_color,
  accent_color,
  currency,
  language
) VALUES (
  (SELECT id FROM users WHERE username = 'teststreamer'),
  1000,
  1.00,
  20.00,
  75,
  5,
  true,
  true,
  false,
  'purple',
  '#7c3aed',
  '#ec4899',
  'RUB',
  'ru'
);

-- Step 4: Create default alert settings for test streamer
INSERT INTO alert_settings (
  user_id,
  min_amount,
  message_template,
  show_donor_name,
  animation_type,
  duration,
  background_color,
  text_color,
  transparent_background,
  header_font_size,
  header_font_family,
  header_position_x,
  header_position_y,
  header_width,
  header_height,
  message_font_size,
  message_font_family,
  message_position_x,
  message_position_y,
  message_width,
  message_height,
  enable_image,
  image_width,
  image_height,
  image_position_x,
  image_position_y,
  image_as_background,
  enable_sound,
  sound_volume,
  enable_tts,
  tts_voice,
  tts_speed,
  tts_volume,
  read_donor_name,
  read_amount,
  read_message
) VALUES (
  (SELECT id FROM users WHERE username = 'teststreamer'),
  1.00,
  '{name} задонатил {amount}!',
  true,
  'slide',
  5,
  '#6366f1',
  '#ffffff',
  false,
  24,
  'sans-serif',
  50,
  30,
  400,
  60,
  18,
  'sans-serif',
  50,
  70,
  400,
  80,
  true,
  80,
  80,
  20,
  50,
  false,
  true,
  70,
  false,
  'female',
  1.0,
  80,
  true,
  true,
  true
);

COMMIT;

-- Display test account info
DO $$
DECLARE
  test_user_id INTEGER;
  test_uuid UUID;
  test_token UUID;
BEGIN
  SELECT id, uuid INTO test_user_id, test_uuid FROM users WHERE username = 'teststreamer';
  SELECT alert_token INTO test_token FROM alert_settings WHERE user_id = test_user_id;
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ Test environment reset complete!';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Test Streamer Credentials:';
  RAISE NOTICE '   Username: teststreamer';
  RAISE NOTICE '   Email: test@tipit.dev';
  RAISE NOTICE '   Password: Test1234!';
  RAISE NOTICE '   UUID: %', test_uuid;
  RAISE NOTICE '   Alert Token: %', test_token;
  RAISE NOTICE '';
  RAISE NOTICE '🔗 URLs:';
  RAISE NOTICE '   Login: http://45.144.52.219:3001/auth/login';
  RAISE NOTICE '   Settings: http://45.144.52.219:3001/settings';
  RAISE NOTICE '   Donate: http://45.144.52.219:3001/donate/teststreamer';
  RAISE NOTICE '   Alert Widget: http://45.144.52.219:3001/alerts/teststreamer';
  RAISE NOTICE '';
END $$;
