# 🔧 Исправление аватаров и logout

## Что изменилось в коде:

1. **Аватары:** Изменён путь с `/avatars/` на `/uploads/avatars/`
2. **Middleware:** Теперь перенаправляет залогиненных пользователей с `/auth/login` на `/`
3. **Logout:** Cookie удаляется и middleware блокирует доступ

---

## 🔧 Что нужно сделать на сервере

### После деплоя GitHub Actions:

```bash
ssh root@45.144.52.219
cd /root/tipit/dev

# 1. Создайте новую структуру папок
mkdir -p public/uploads/avatars
chmod 755 public/uploads/avatars

# 2. Переместите старые аватары (если есть)
if [ -d "public/avatars" ]; then
  echo "Moving old avatars..."
  mv public/avatars/* public/uploads/avatars/ 2>/dev/null || true
  echo "✅ Avatars moved"
fi

# 3. Проверьте структуру
ls -la public/uploads/
# Должна быть папка avatars/

ls -la public/uploads/avatars/
# Должны быть файлы аватаров (если загружали)

# 4. Обновите права
chmod 755 public/uploads
chmod 755 public/uploads/avatars
chmod 644 public/uploads/avatars/* 2>/dev/null || true

echo "✅ Avatar migration complete!"
```

---

## ✅ Проверка после деплоя

### 1. Тест аватаров

```bash
# Проверьте что файлы доступны
curl -I http://localhost:3001/uploads/avatars/test.jpg 2>&1 | head -1
# Должно быть 404 (файла нет) или 200 (файл есть), но НЕ 500
```

### 2. Тест logout

1. **Залогиньтесь:** http://45.144.52.219:3001/auth/login
2. **Нажмите Logout**
3. **Должен быть редирект на `/auth/login`**
4. **Попробуйте открыть:** http://45.144.52.219:3001
5. **Должен снова редиректить на login** ✅

### 3. Тест загрузки аватара

1. **Откройте:** http://45.144.52.219:3001/settings
2. **Загрузите аватар**
3. **Проверьте логи:**
   ```bash
   pm2 logs tipit-dev --lines 20 | grep avatarUrl
   ```
   Должно быть: `/uploads/avatars/xxx.jpg`
4. **Аватар должен отобразиться!** ✅

---

## 🐛 Если аватары всё равно не грузятся

```bash
# На сервере проверьте:
cd /root/tipit/dev

# 1. Существует ли файл?
ls -la public/uploads/avatars/

# 2. Какие права?
ls -la public/uploads/avatars/*

# 3. Проверьте nginx
curl -I http://localhost:3001/placeholder.svg
# Должно быть 200 (Next.js раздаёт статику)

# 4. Проверьте конкретный аватар
AVATAR_FILE=$(ls public/uploads/avatars/ | head -1)
echo "Testing: /uploads/avatars/$AVATAR_FILE"
curl -I http://localhost:3001/uploads/avatars/$AVATAR_FILE
```

---

## 📋 Быстрая команда (всё в одном)

```bash
ssh root@45.144.52.219 << 'EOF'
cd /root/tipit/dev

# Создать структуру
mkdir -p public/uploads/avatars
chmod 755 public/uploads public/uploads/avatars

# Переместить старые аватары
if [ -d "public/avatars" ]; then
  mv public/avatars/* public/uploads/avatars/ 2>/dev/null || true
fi

# Установить права
chmod 644 public/uploads/avatars/* 2>/dev/null || true

# Проверка
echo "📁 Folder structure:"
ls -la public/uploads/
echo ""
echo "🖼️ Avatar files:"
ls -la public/uploads/avatars/ 2>/dev/null || echo "No avatars yet"
EOF
```

---

**GitHub Actions деплоит исправления! Ждём ~2-3 минуты.**

Следите: https://github.com/prefectdinorah/tipit/actions
