-- Скрипт для обновления путей аватаров в базе данных
-- Меняем /uploads/avatars/ на /api/uploads/avatars/

UPDATE "User"
SET "avatarUrl" = REPLACE("avatarUrl", '/uploads/avatars/', '/api/uploads/avatars/')
WHERE "avatarUrl" LIKE '/uploads/avatars/%';

-- Проверка результата
SELECT id, username, "avatarUrl"
FROM "User"
WHERE "avatarUrl" IS NOT NULL;
