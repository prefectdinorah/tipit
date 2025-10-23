-- Скрипт для обновления путей аватаров в базе данных
-- Меняем /uploads/avatars/ на /api/uploads/avatars/

-- Сначала проверим текущие данные
SELECT id, username, avatar_url
FROM users
WHERE avatar_url IS NOT NULL;

-- Обновление путей
UPDATE users
SET avatar_url = REPLACE(avatar_url, '/uploads/avatars/', '/api/uploads/avatars/')
WHERE avatar_url LIKE '/uploads/avatars/%';

-- Проверка результата
SELECT id, username, avatar_url
FROM users
WHERE avatar_url IS NOT NULL;
