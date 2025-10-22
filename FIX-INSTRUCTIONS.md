# 🔧 Исправление ошибок MongoDB и страницы стримера

## 🔴 Проблема 1: MongoDB ошибка "Invalid scheme"

**Ошибка в логах:**
```
MongoParseError: Invalid scheme, expected connection string to start with "mongodb://" or "mongodb+srv://"
```

**Причина:** В `.env` указан неправильный формат URI:
```env
❌ MONGODB_URI="mongosh streamdonate://..."
```

**Решение:**

1. Подключитесь к серверу:
```bash
ssh root@45.144.52.219
```

2. Откройте `.env`:
```bash
cd /root/tipit/dev
nano .env
```

3. Найдите строку `MONGODB_URI` и исправьте:
```env
# ❌ Было (неправильно):
MONGODB_URI="mongosh streamdonate://streamdonate_mongo_user:d57b9iF62KFVRi8v1Nmx8Tv8@45.144.52.58:27017/tipit"

# ✅ Должно быть:
MONGODB_URI="mongodb://streamdonate_mongo_user:d57b9iF62KFVRi8v1Nmx8Tv8@45.144.52.58:27017/tipit"
```

4. Сохраните (Ctrl+O, Enter, Ctrl+X)

5. Перезапустите приложение:
```bash
pm2 restart tipit-dev
```

6. Проверьте логи:
```bash
pm2 logs tipit-dev
```

Ошибки MongoDB должны исчезнуть!

---

## 🔴 Проблема 2: Страница стримера не найдена

**Ошибка:** При переходе на `/donate/test4` получаете "Streamer not found"

**Возможные причины:**
1. У пользователя `test4` нет записи в таблице `StreamerSettings`
2. Пользователь неактивен (`isActive = false`)

**Решение:**

### Проверка 1: Проверьте пользователя в PostgreSQL

```bash
# На сервере
psql -h 45.144.52.58 -U streamdonate_user -d streamdonate_db

# Внутри psql:
SELECT id, uuid, username, display_name, is_active 
FROM users 
WHERE username = 'test4';
```

Вы должны увидеть что-то вроде:
```
 id | uuid | username | display_name | is_active
----+------+----------+--------------+-----------
  1 | abc  | test4    | Test4        | t
```

Если `is_active = f` (false), активируйте:
```sql
UPDATE users SET is_active = true WHERE username = 'test4';
```

### Проверка 2: Проверьте настройки стримера

```sql
-- В psql:
SELECT * FROM streamer_settings WHERE user_id = (
  SELECT id FROM users WHERE username = 'test4'
);
```

Если запись не найдена, создайте её:
```sql
INSERT INTO streamer_settings (user_id) 
SELECT id FROM users WHERE username = 'test4';
```

Выйдите из psql:
```sql
\q
```

### Проверка 3: Протестируйте

Откройте в браузере:
```
http://45.144.52.219:3001/donate/test4
```

Страница должна открыться!

---

## 🔴 Проблема 3: Главная страница доступна без логина

**Текущее поведение:** После сборки сразу попадаете на главную

**Желаемое:** Редирект на `/auth/login` если не авторизован

**Решение:**

Я уже исправил `middleware.ts` в коде. Чтобы применить изменения:

1. Закоммитьте изменения (на локальной машине):
```bash
cd c:\dev\tipit\tipit
git add middleware.ts
git commit -m "fix: add auth protection for homepage"
git push origin dev
```

2. Обновите код на сервере:
```bash
ssh root@45.144.52.219
cd /root/tipit/dev
git pull origin dev
npm run build
pm2 restart tipit-dev
```

3. Очистите cookies браузера и откройте:
```
http://45.144.52.219:3001
```

Должен быть редирект на `/auth/login`!

---

## ✅ Итоговая проверка

После всех исправлений:

1. **MongoDB работает:**
   ```bash
   pm2 logs tipit-dev
   # Не должно быть ошибок "Invalid scheme"
   ```

2. **Страница стримера работает:**
   ```
   http://45.144.52.219:3001/donate/test4
   ```

3. **Защита главной страницы:**
   - Откройте в инкогнито: http://45.144.52.219:3001
   - Должен быть редирект на `/auth/login`

---

## 📋 Полный чеклист действий

### На сервере (SSH: root@45.144.52.219)

```bash
# 1. Исправить MONGODB_URI в .env
cd /root/tipit/dev
nano .env
# Изменить: mongosh streamdonate:// → mongodb://
# Сохранить: Ctrl+O, Enter, Ctrl+X

# 2. Перезапустить PM2
pm2 restart tipit-dev

# 3. Проверить пользователя в PostgreSQL
psql -h 45.144.52.58 -U streamdonate_user -d streamdonate_db
# SELECT * FROM users WHERE username = 'test4';
# SELECT * FROM streamer_settings WHERE user_id = (SELECT id FROM users WHERE username = 'test4');
# Если нужно, создать streamer_settings:
# INSERT INTO streamer_settings (user_id) SELECT id FROM users WHERE username = 'test4';
# \q

# 4. Обновить код (после git push с локальной машины)
git pull origin dev
npm run build
pm2 restart tipit-dev

# 5. Проверить логи
pm2 logs tipit-dev
```

### На локальной машине

```bash
cd c:\dev\tipit\tipit

# Закоммитить изменения middleware.ts
git add middleware.ts .env.dev.example CICD-QUICKSTART.md QUICK-COMMANDS.md .gitignore
git commit -m "fix: MongoDB URI format, add auth middleware, cleanup docs"
git push origin dev
```

---

**После выполнения всех шагов проблемы будут решены!** ✅
