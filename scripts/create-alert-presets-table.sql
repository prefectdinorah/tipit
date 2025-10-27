-- Миграция: Добавление таблицы alert_presets для настройки алертов по диапазонам сумм
-- Дата: 2025-10-27
-- Описание: Позволяет настраивать разные алерты для разных сумм донатов

BEGIN;

-- Создаём таблицу пресетов алертов
CREATE TABLE IF NOT EXISTS alert_presets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Диапазон суммы
  min_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  max_amount DECIMAL(10, 2) DEFAULT NULL, -- NULL = без ограничения
  
  -- Приоритет (чем выше число, тем выше приоритет при совпадении диапазонов)
  priority INTEGER NOT NULL DEFAULT 0,
  
  -- Название пресета (для UI)
  name VARCHAR(100) NOT NULL DEFAULT 'Default',
  
  -- Включён ли пресет
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- Общие настройки
  message_template TEXT DEFAULT '{name} задонатил {amount}!',
  show_donor_name BOOLEAN DEFAULT TRUE,
  
  -- Визуальные настройки
  animation_type VARCHAR(20) DEFAULT 'slide' CHECK (animation_type IN ('fade', 'slide', 'bounce', 'zoom')),
  duration INTEGER DEFAULT 5 CHECK (duration >= 3 AND duration <= 30),
  background_color VARCHAR(7) DEFAULT '#6366f1',
  text_color VARCHAR(7) DEFAULT '#ffffff',
  transparent_background BOOLEAN DEFAULT FALSE,
  
  -- Настройки заголовка
  header_font_size INTEGER DEFAULT 24 CHECK (header_font_size >= 12 AND header_font_size <= 72),
  header_font_family VARCHAR(50) DEFAULT 'sans-serif',
  header_position_x DECIMAL(5, 2) DEFAULT 50 CHECK (header_position_x >= 0 AND header_position_x <= 100),
  header_position_y DECIMAL(5, 2) DEFAULT 30 CHECK (header_position_y >= 0 AND header_position_y <= 100),
  header_width INTEGER DEFAULT 400,
  header_height INTEGER DEFAULT 60,
  
  -- Настройки сообщения
  message_font_size INTEGER DEFAULT 18 CHECK (message_font_size >= 12 AND message_font_size <= 72),
  message_font_family VARCHAR(50) DEFAULT 'sans-serif',
  message_position_x DECIMAL(5, 2) DEFAULT 50 CHECK (message_position_x >= 0 AND message_position_x <= 100),
  message_position_y DECIMAL(5, 2) DEFAULT 70 CHECK (message_position_y >= 0 AND message_position_y <= 100),
  message_width INTEGER DEFAULT 400,
  message_height INTEGER DEFAULT 80,
  
  -- Настройки изображения
  enable_image BOOLEAN DEFAULT TRUE,
  image_url TEXT DEFAULT NULL,
  image_width INTEGER DEFAULT 80,
  image_height INTEGER DEFAULT 80,
  image_position_x DECIMAL(5, 2) DEFAULT 20 CHECK (image_position_x >= 0 AND image_position_x <= 100),
  image_position_y DECIMAL(5, 2) DEFAULT 50 CHECK (image_position_y >= 0 AND image_position_y <= 100),
  image_as_background BOOLEAN DEFAULT FALSE,
  
  -- Настройки звука
  enable_sound BOOLEAN DEFAULT TRUE,
  sound_url TEXT DEFAULT NULL,
  sound_volume INTEGER DEFAULT 70 CHECK (sound_volume >= 0 AND sound_volume <= 100),
  
  -- Настройки TTS
  enable_tts BOOLEAN DEFAULT FALSE,
  tts_voice VARCHAR(20) DEFAULT 'female' CHECK (tts_voice IN ('male', 'female', 'robot')),
  tts_speed DECIMAL(3, 1) DEFAULT 1.0 CHECK (tts_speed >= 0.5 AND tts_speed <= 2.0),
  tts_volume INTEGER DEFAULT 80 CHECK (tts_volume >= 0 AND tts_volume <= 100),
  read_donor_name BOOLEAN DEFAULT TRUE,
  read_amount BOOLEAN DEFAULT TRUE,
  read_message BOOLEAN DEFAULT TRUE,
  
  -- Метаданные
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT unique_user_preset_name UNIQUE (user_id, name)
);

-- Индексы для быстрого поиска
CREATE INDEX idx_alert_presets_user_id ON alert_presets(user_id);
CREATE INDEX idx_alert_presets_amount_range ON alert_presets(user_id, min_amount, max_amount) WHERE is_active = TRUE;
CREATE INDEX idx_alert_presets_priority ON alert_presets(user_id, priority DESC) WHERE is_active = TRUE;

-- Триггер для обновления updated_at
CREATE OR REPLACE FUNCTION update_alert_presets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_alert_presets_updated_at
  BEFORE UPDATE ON alert_presets
  FOR EACH ROW
  EXECUTE FUNCTION update_alert_presets_updated_at();

-- Комментарии для документации
COMMENT ON TABLE alert_presets IS 'Пресеты алертов для разных диапазонов сумм донатов';
COMMENT ON COLUMN alert_presets.min_amount IS 'Минимальная сумма доната для применения этого пресета';
COMMENT ON COLUMN alert_presets.max_amount IS 'Максимальная сумма (NULL = без ограничения)';
COMMENT ON COLUMN alert_presets.priority IS 'Приоритет при совпадении диапазонов (выше = приоритетнее)';

COMMIT;

-- Пример использования:
-- INSERT INTO alert_presets (user_id, name, min_amount, max_amount, priority, message_template, background_color, image_url, sound_url)
-- VALUES 
--   (1, 'Маленькие донаты', 1, 99, 1, '{name} задонатил {amount}₽', '#6366f1', '/alerts/images/small.gif', '/alerts/sounds/coin.mp3'),
--   (1, 'Средние донаты', 100, 999, 2, '💰 {name} задонатил {amount}₽!', '#ec4899', '/alerts/images/medium.gif', '/alerts/sounds/cash.mp3'),
--   (1, 'Большие донаты', 1000, NULL, 3, '🎉 ВАУ! {name} задонатил {amount}₽!!! 🎉', '#fbbf24', '/alerts/images/epic.gif', '/alerts/sounds/epic.mp3');
