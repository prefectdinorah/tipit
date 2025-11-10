-- Music Queue System Tables
-- Хранит очередь треков заказанных через донаты

-- Таблица очереди музыки
CREATE TABLE IF NOT EXISTS music_queue (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  donor_name VARCHAR(255) NOT NULL,
  youtube_url TEXT NOT NULL,
  youtube_id VARCHAR(50) NOT NULL,
  title VARCHAR(500),
  duration INTEGER, -- длительность в секундах
  thumbnail_url TEXT,
  donation_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'playing', 'played', 'skipped', 'removed'
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  played_at TIMESTAMP,
  CONSTRAINT valid_status CHECK (status IN ('pending', 'playing', 'played', 'skipped', 'removed'))
);

-- Таблица черного списка YouTube
CREATE TABLE IF NOT EXISTS music_blacklist (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  youtube_id VARCHAR(50), -- ID конкретного видео
  channel_id VARCHAR(50), -- ID канала (блокирует все видео канала)
  reason VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT blacklist_check CHECK (youtube_id IS NOT NULL OR channel_id IS NOT NULL)
);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_music_queue_user_status ON music_queue(user_id, status);
CREATE INDEX IF NOT EXISTS idx_music_queue_order ON music_queue(user_id, order_index) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_music_blacklist_user ON music_blacklist(user_id);
CREATE INDEX IF NOT EXISTS idx_music_blacklist_youtube ON music_blacklist(youtube_id);
CREATE INDEX IF NOT EXISTS idx_music_blacklist_channel ON music_blacklist(channel_id);

-- Комментарии
COMMENT ON TABLE music_queue IS 'Очередь музыкальных треков заказанных через донаты';
COMMENT ON TABLE music_blacklist IS 'Черный список YouTube видео и каналов';
COMMENT ON COLUMN music_queue.donor_name IS 'Имя донатера или "Ручное добавление"';
COMMENT ON COLUMN music_queue.status IS 'pending - в очереди, playing - проигрывается, played - проиграно, skipped - пропущено, removed - удалено';
COMMENT ON COLUMN music_queue.order_index IS 'Порядок в очереди (для drag & drop)';
