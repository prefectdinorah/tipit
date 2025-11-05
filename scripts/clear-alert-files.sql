-- Скрипт для очистки старых imageUrl и soundUrl перед переходом на GridFS
-- Запустить на сервере перед деплоем новой версии

-- Очищаем все imageUrl и soundUrl в alert_settings
UPDATE alert_settings 
SET 
  "imageUrl" = NULL,
  "soundUrl" = NULL
WHERE 
  "imageUrl" IS NOT NULL 
  OR "soundUrl" IS NOT NULL;

-- Проверяем результат
SELECT 
  COUNT(*) as total_records,
  COUNT("imageUrl") as with_image,
  COUNT("soundUrl") as with_sound
FROM alert_settings;
