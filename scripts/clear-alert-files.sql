-- Скрипт для очистки старых image_url и sound_url перед переходом на GridFS
-- Запустить на сервере перед деплоем новой версии

-- Очищаем все image_url и sound_url в alert_settings
UPDATE alert_settings 
SET 
  image_url = NULL,
  sound_url = NULL
WHERE 
  image_url IS NOT NULL 
  OR sound_url IS NOT NULL;

-- Проверяем результат
SELECT 
  COUNT(*) as total_records,
  COUNT(image_url) as with_image,
  COUNT(sound_url) as with_sound
FROM alert_settings;
