# 🖼️ Avatar Fix Instructions

## Проблема
- Аватары сохраняются в `/root/tipit/dev/public/uploads/avatars/` ✅
- Но Next.js не отдает статические файлы из `/uploads/` в production ❌
- URL аватаров: `/uploads/avatars/[filename]` → 404

## Решение
Создан API route `/api/uploads/avatars/[filename]` который:
- Читает файлы из `/public/uploads/avatars/`
- Отдает с правильными MIME types
- Добавляет кэширование

## 🚀 Деплой (автоматический)

1. **GitHub Actions уже запущен**
   - Проверь: https://github.com/prefectdinorah/tipit/actions
   - Дождись завершения

2. **После деплоя - обнови пути в базе**

```bash
# Подключись к серверу
ssh root@45.144.52.219

# Выполни SQL скрипт
cd /root/tipit/dev
psql "postgresql://streamdonate_user:B5oFzj1O0DyAhNzWlfMWqW71@45.144.52.58:5432/streamdonate_db" <<EOF
UPDATE "User"
SET "avatarUrl" = REPLACE("avatarUrl", '/uploads/avatars/', '/api/uploads/avatars/')
WHERE "avatarUrl" LIKE '/uploads/avatars/%';

SELECT username, "avatarUrl" FROM "User" WHERE "avatarUrl" IS NOT NULL;
EOF
```

**Ожидаемый результат:**
```
UPDATE 1
 username |                              avatarUrl
----------+----------------------------------------------------------------------
 test4    | /api/uploads/avatars/159f489d-4a6c-4c7c-bbe7-d7dff40036e1-[timestamp].jpg
```

## 🧪 Тест после деплоя

### 1. Проверь API endpoint
```bash
# Проверь что файл существует
ssh root@45.144.52.219
ls -la /root/tipit/dev/public/uploads/avatars/

# Должны быть файлы:
# 159f489d-4a6c-4c7c-bbe7-d7dff40036e1-1761253737682.png
# 159f489d-4a6c-4c7c-bbe7-d7dff40036e1-1761253836859.jpg
```

### 2. Проверь в браузере
```
http://45.144.52.219:3001/api/uploads/avatars/159f489d-4a6c-4c7c-bbe7-d7dff40036e1-1761253836859.jpg
```
- Должна открыться картинка (не 404)

### 3. Проверь на странице
1. Login → `http://45.144.52.219:3001/auth/login`
2. Зайди на главную → аватар в хедере должен отображаться
3. Settings → аватар должен отображаться
4. Загрузи новый → должен сразу показаться (не 404)

### 4. Проверь логи
```bash
ssh root@45.144.52.219
pm2 logs tipit-dev | grep "Serving avatar"

# Должно быть:
# 📸 Serving avatar: { filename: '...', path: '...', exists: true }
# ✅ Serving avatar successfully: { filename: '...', contentType: 'image/jpeg', size: ... }
```

## 📋 Что изменилось

### 1. API Route для отдачи аватаров
```typescript
// app/api/uploads/avatars/[filename]/route.ts
export async function GET(request, { params }) {
  const avatarPath = path.join(process.cwd(), "public", "uploads", "avatars", params.filename)
  const fileBuffer = await readFile(avatarPath)
  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}
```

### 2. Обновлен путь в upload API
```typescript
// app/api/user/avatar/route.ts
- const avatarUrl = `/uploads/avatars/${filename}`
+ const avatarUrl = `/api/uploads/avatars/${filename}`
```

### 3. Фикс кнопки копирования для HTTP
```typescript
// app/page.tsx
// Добавлен fallback для HTTP (без HTTPS clipboard API не работает)
if (navigator.clipboard && navigator.clipboard.writeText) {
  await navigator.clipboard.writeText(donationUrl)
} else {
  // Fallback через textarea + document.execCommand('copy')
}
```

## 🐛 Troubleshooting

### Аватар все еще 404
```bash
# Проверь что файл существует
ssh root@45.144.52.219
ls -la /root/tipit/dev/public/uploads/avatars/[filename]

# Проверь логи API
pm2 logs tipit-dev --lines 50 | grep -i avatar

# Принудительный перезапуск
cd /root/tipit/dev
git pull origin dev
npm run build
pm2 restart tipit-dev
```

### SQL скрипт не выполнился
```bash
# Вручную в psql
ssh root@45.144.52.219
psql "postgresql://streamdonate_user:B5oFzj1O0DyAhNzWlfMWqW71@45.144.52.58:5432/streamdonate_db"

# В psql:
UPDATE "User"
SET "avatarUrl" = REPLACE("avatarUrl", '/uploads/avatars/', '/api/uploads/avatars/')
WHERE "avatarUrl" LIKE '/uploads/avatars/%';

\q
```

### Кнопка копирования не работает
- Это нормально на HTTP (только HTTPS/localhost)
- Fallback через textarea должен работать
- Если не работает - используй manual copy (Ctrl+C)

## ✅ Checklist

- [ ] GitHub Actions завершился успешно
- [ ] SQL скрипт выполнен (пути обновлены на `/api/uploads/avatars/`)
- [ ] Аватар открывается в браузере по прямой ссылке
- [ ] Аватар отображается в хедере главной страницы
- [ ] Аватар отображается на странице Settings
- [ ] Новый аватар загружается и сразу показывается (не 404)
- [ ] Кнопка копирования работает (или показывает ссылку для manual copy)
