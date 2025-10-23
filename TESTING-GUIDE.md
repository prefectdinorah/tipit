# 🧪 Testing Guide

## Последние фиксы (commit: ac6b8e2)

### ✅ Что исправили:

1. **Logout теперь вызывает API** (`app/page.tsx`)
   - Было: только localStorage.removeItem + редирект
   - Стало: `fetch("/api/auth/logout")` → удаляет cookie → редирект

2. **Аватары теперь отдаются** (`middleware.ts`)
   - Добавлено: `pathname.startsWith("/uploads")` в список пропуска
   - Middleware больше не блокирует `/uploads/avatars/*`

3. **Убрали 404 на forgot-password** (`app/auth/login/page.tsx`)
   - Закомментировали `<Link href="/auth/forgot-password">`

---

## 🧹 Очистка кэша браузера

### Chrome / Edge:
```
Ctrl + Shift + Delete
→ "All time" / "Всё время"
→ ✅ Cookies
→ ✅ Cached images and files
→ Clear data
```

### Firefox:
```
Ctrl + Shift + Delete
→ "Everything" / "Всё"
→ ✅ Cookies
→ ✅ Cache
→ Clear Now
```

### Быстрый способ (Hard Refresh):
```
Ctrl + Shift + R  или  Ctrl + F5
```

---

## 🎯 План тестирования (после деплоя)

### 1. Проверь деплой
```
https://github.com/prefectdinorah/tipit/actions
```
Дождись зеленого чекбокса ✅

### 2. Очисти кэш
```
Ctrl + Shift + R
```

### 3. Тест авторизации
1. Открой: `http://45.144.52.219:3001/auth/login`
2. Логин: `test4` / пароль
3. **Ожидается:**
   - ✅ Toast "Login Successful"
   - ✅ Через 1 секунду → редирект на `/` (главная)
   - ✅ Видишь дашборд стримера
   - ❌ Нет ошибок в консоли браузера

### 4. Тест аватара
1. Перейди: Settings (кнопка в хедере)
2. Загрузи новый аватар
3. **Ожидается:**
   - ✅ Аватар загружается
   - ✅ Аватар отображается на странице Settings
   - ✅ Аватар отображается в хедере главной страницы
   - ✅ URL аватара: `http://45.144.52.219:3001/uploads/avatars/[uuid]-[timestamp].png`
   - ❌ Нет 404 в консоли браузера

### 5. Тест logout
1. Кликни "Log out" (кнопка в хедере)
2. **Ожидается:**
   - ✅ Редирект на `/auth/login`
   - ✅ Если попробовать зайти на `/` → редирект на login
   - ✅ Cookie `session_token` удалена (DevTools → Application → Cookies)

### 6. Попытка доступа к защищенным страницам
1. После logout попробуй:
   - `http://45.144.52.219:3001/` → должен редиректить на `/auth/login`
   - `http://45.144.52.219:3001/settings` → должен редиректить на `/auth/login`
   - `http://45.144.52.219:3001/donations` → должен редиректить на `/auth/login`

---

## 📋 Checklist

- [ ] GitHub Actions завершился успешно
- [ ] Очистил кэш браузера
- [ ] Login работает и редиректит на `/`
- [ ] Аватар загружается и отображается (нет 404)
- [ ] Logout работает и редиректит на `/auth/login`
- [ ] Cookie удаляется после logout
- [ ] Middleware блокирует защищенные страницы для неавторизованных

---

## 🐛 Если что-то не работает

### Logout не работает (не редиректит)
```bash
# На сервере проверь логи:
pm2 logs tipit-dev --lines 50 | grep -i logout

# Должно быть:
# User logged out
# Session deactivated
```

### Аватар 404
```bash
# На сервере проверь файл:
ls -la /root/tipit/dev/public/uploads/avatars/

# Должны быть файлы вида:
# 159f489d-4a6c-4c7c-bbe7-d7dff40036e1-1761253154620.png
```

### Middleware не пускает / редиректит неправильно
```bash
# На сервере проверь логи middleware:
pm2 logs tipit-dev --lines 100 | grep "Middleware"

# Должно быть:
# 🔒 Middleware check for /: { hasToken: true, ... }
# ✅ Session token found, allowing access to /
```

### Последний способ - принудительный перезапуск
```bash
ssh root@45.144.52.219
cd /root/tipit/dev
git pull origin dev
npm run build
pm2 restart tipit-dev
pm2 logs tipit-dev
```

---

## 🔍 Useful Commands

### Проверить версию кода на сервере
```bash
ssh root@45.144.52.219
cd /root/tipit/dev
git log --oneline -5
```

### Проверить PM2 статус
```bash
ssh root@45.144.52.219
pm2 status tipit-dev
pm2 logs tipit-dev --lines 30
```

### Проверить файлы аватаров
```bash
ssh root@45.144.52.219
ls -lah /root/tipit/dev/public/uploads/avatars/
```

### Принудительная очистка логов
```bash
ssh root@45.144.52.219
pm2 flush
pm2 logs tipit-dev
```
