# 🔍 Диагностика проблем

## Команды для проверки на сервере

```bash
ssh root@45.144.52.219

cd /root/tipit/dev

# 1. Проверить что код обновился
git log --oneline -5
# Должен быть коммит "fix: avatars and logout issues"

# 2. Проверить файл avatar route
grep -A 3 "avatarUrl =" app/api/user/avatar/route.ts
# Должно быть: /uploads/avatars/

# 3. Проверить middleware
grep -A 5 "publicRoutes.includes" middleware.ts
# Должна быть проверка token

# 4. Проверить структуру папок
ls -la public/uploads/avatars/
# Должны быть аватары

# 5. Проверить что файлы доступны
AVATAR=$(ls public/uploads/avatars/ | head -1)
echo "Testing: /uploads/avatars/$AVATAR"
curl -I http://localhost:3001/uploads/avatars/$AVATAR 2>&1 | head -5

# 6. Перезапустить PM2 (ВАЖНО!)
pm2 restart tipit-dev

# 7. Проверить логи middleware
pm2 logs tipit-dev --lines 50 | grep "Middleware check"
```

---

## Быстрая диагностика

```bash
ssh root@45.144.52.219 << 'EOF'
echo "=== 1. Checking git version ==="
cd /root/tipit/dev
git log --oneline -3

echo ""
echo "=== 2. Checking avatar route ==="
grep "avatarUrl =" app/api/user/avatar/route.ts | head -1

echo ""
echo "=== 3. Checking avatars folder ==="
ls -la public/uploads/avatars/ 2>/dev/null || echo "Folder not found!"

echo ""
echo "=== 4. Restarting PM2 ==="
pm2 restart tipit-dev
sleep 2

echo ""
echo "=== 5. Checking PM2 status ==="
pm2 status tipit-dev
EOF
```

---

## Если код НЕ обновился

```bash
ssh root@45.144.52.219

cd /root/tipit/dev

# Принудительное обновление
git fetch origin
git reset --hard origin/dev

# Проверка
git log --oneline -1

# Пересборка и перезапуск
npm run build
pm2 restart tipit-dev
```

---

## Проверка редиректов

```bash
# Тест 1: Без авторизации на главную
curl -I http://localhost:3001/ 2>&1 | grep -E "HTTP|Location"
# Должно быть: 307 redirect → /auth/login

# Тест 2: С cookie на login
curl -I -H "Cookie: session_token=test123" http://localhost:3001/auth/login 2>&1 | grep -E "HTTP|Location"
# Должно быть: 307 redirect → /

# Тест 3: Без cookie на login
curl -I http://localhost:3001/auth/login 2>&1 | grep -E "HTTP|Location"
# Должно быть: 200 OK (страница логина)
```

---

## Логи для понимания редиректов

```bash
# Очистить старые логи
pm2 flush

# Открыть в браузере любую страницу
# Потом смотрим middleware логи:

pm2 logs tipit-dev --lines 100 | grep -E "Middleware|redirect|Session"
```

---

## Если аватары всё равно не грузятся

```bash
cd /root/tipit/dev

# 1. Убедитесь что папка создана
mkdir -p public/uploads/avatars
chmod 755 public/uploads/avatars

# 2. Переместите старые аватары
if [ -d "public/avatars" ]; then
  cp -r public/avatars/* public/uploads/avatars/ 2>/dev/null || true
fi

# 3. Установите права
chmod 644 public/uploads/avatars/* 2>/dev/null || true

# 4. Проверьте что Next.js видит файлы
ls -la .next/static/ | head -10
ls -la public/ | head -10

# 5. ВАЖНО: Перезапустите PM2
pm2 restart tipit-dev
pm2 logs tipit-dev
```

---

## Экстренная перезагрузка

Если ничего не помогает:

```bash
ssh root@45.144.52.219

cd /root/tipit/dev

# 1. Остановить PM2
pm2 stop tipit-dev

# 2. Обновить код
git fetch origin
git reset --hard origin/dev

# 3. Очистить кэш
rm -rf .next
rm -rf node_modules/.cache

# 4. Пересобрать
npm run build

# 5. Запустить заново
pm2 start npm --name "tipit-dev" -- start -- -p 3001
pm2 save

# 6. Проверить
pm2 logs tipit-dev
```
