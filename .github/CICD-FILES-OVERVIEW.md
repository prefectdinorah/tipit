# 📦 Что было создано для CI/CD

## ✅ Созданные файлы

### 1. GitHub Actions Workflows

#### `.github/workflows/deploy-production.yml`
**Назначение:** Автоматический деплой на Production при пуше в `main`

**Что делает:**
1. Подключается к серверу через SSH
2. Переходит в `/var/www/tipit-prod`
3. Делает `git pull origin main`
4. Устанавливает зависимости
5. Генерирует Prisma Client
6. Запускает миграции БД
7. Собирает Next.js приложение
8. Перезапускает PM2 процесс `tipit-prod`

**Триггер:** Push в ветку `main`

---

#### `.github/workflows/deploy-staging.yml`
**Назначение:** Автоматический деплой на Staging при пуше в `dev`

**Что делает:** То же самое, но для staging окружения
- Директория: `/var/www/tipit-staging`
- Ветка: `dev`
- PM2 процесс: `tipit-staging`

**Триггер:** Push в ветку `dev`

---

### 2. Конфигурации

#### `ecosystem.config.js`
**Обновлено:** Добавлены конфигурации для двух окружений

```javascript
tipit-prod:  port 3000, /var/www/tipit-prod
tipit-staging: port 3001, /var/www/tipit-staging
```

---

#### `nginx/tipit-prod.conf`
**Назначение:** Nginx конфигурация для Production

**Особенности:**
- Слушает на порту 80
- Проксирует на localhost:3000
- Кэширование статики (_next/static)
- Поддержка WebSocket
- Лимит загрузки файлов: 10MB
- Логи: `/var/log/nginx/tipit-prod-*.log`

---

#### `nginx/tipit-staging.conf`
**Назначение:** Nginx конфигурация для Staging

**Особенности:**
- Слушает на порту 8080
- Проксирует на localhost:3001
- Меньший кэш (для тестирования)
- Header: X-Environment: Staging
- Логи: `/var/log/nginx/tipit-staging-*.log`

---

### 3. Скрипты

#### `scripts/setup-cicd.sh`
**Назначение:** Одноразовая настройка сервера для CI/CD

**Что делает:**
1. Создает директории `/var/www/tipit-prod` и `/var/www/tipit-staging`
2. Клонирует репозиторий (main в prod, dev в staging)
3. Устанавливает зависимости
4. Генерирует Prisma Client
5. Копирует Nginx конфиги
6. Настраивает firewall
7. Запускает PM2 процессы

**Использование:**
```bash
ssh user@45.144.52.219
bash scripts/setup-cicd.sh
```

---

### 4. Документация

#### `CICD-README.md`
**Назначение:** Краткий старт для CI/CD

**Содержит:**
- Быстрый старт (3 шага)
- Архитектура
- Команды мониторинга

---

#### `CICD-SETUP.md`
**Назначение:** Полная инструкция по настройке CI/CD

**Содержит:**
- Подробная настройка сервера
- Создание .env файлов
- Настройка Nginx
- Миграции БД
- Мониторинг
- Troubleshooting
- Чеклист готовности

---

#### `.github/SECRETS-SETUP.md`
**Назначение:** Инструкция по настройке GitHub Secrets

**Содержит:**
- Генерация SSH ключей
- Пошаговое добавление Secrets в GitHub
- Проверка подключения
- Troubleshooting для SSH
- Рекомендации по безопасности

---

## 🎯 Workflow работы

### Для разработчика:

```bash
# 1. Работа над фичей
git checkout dev
# ... код ...
git add .
git commit -m "feat: новая функция"
git push origin dev
# ✅ Автоматически деплоится на staging (http://45.144.52.219:8080)

# 2. Тестирование на staging
# Проверяете что всё работает

# 3. Релиз в продакшен
git checkout main
git merge dev
git push origin main
# ✅ Автоматически деплоится на production (http://45.144.52.219)
```

### Для DevOps:

```bash
# Мониторинг процессов
pm2 list
pm2 logs tipit-prod --lines 100
pm2 logs tipit-staging --lines 100

# Просмотр логов Nginx
sudo tail -f /var/log/nginx/tipit-prod-access.log
sudo tail -f /var/log/nginx/tipit-staging-error.log

# Ручной перезапуск
pm2 restart tipit-prod
pm2 restart tipit-staging

# Проверка Nginx
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔐 Необходимые GitHub Secrets

Для работы CI/CD нужны эти Secrets в GitHub:

| Secret | Значение | Пример |
|--------|----------|--------|
| `PROD_HOST` | IP сервера | `45.144.52.219` |
| `PROD_USER` | SSH пользователь | `ubuntu` |
| `PROD_SSH_KEY` | SSH приватный ключ | `-----BEGIN OPENSSH...` |
| `STAGING_HOST` | IP сервера | `45.144.52.219` |
| `STAGING_USER` | SSH пользователь | `ubuntu` |
| `STAGING_SSH_KEY` | SSH приватный ключ | `-----BEGIN OPENSSH...` |

**Инструкция:** См. `.github/SECRETS-SETUP.md`

---

## 📂 Структура на сервере

```
/var/www/
├── tipit-prod/              # Production окружение
│   ├── .git/
│   ├── .env                 # Production env vars
│   ├── node_modules/
│   ├── .next/
│   ├── logs/
│   │   ├── out.log
│   │   └── error.log
│   └── ... (остальные файлы проекта)
│
└── tipit-staging/           # Staging окружение
    ├── .git/
    ├── .env                 # Staging env vars
    ├── node_modules/
    ├── .next/
    ├── logs/
    │   ├── out.log
    │   └── error.log
    └── ... (остальные файлы проекта)
```

---

## 🚦 Порты

| Окружение | Внешний порт | Внутренний порт | URL |
|-----------|--------------|-----------------|-----|
| Production | 80 | 3000 | http://45.144.52.219 |
| Staging | 8080 | 3001 | http://45.144.52.219:8080 |

---

## ⚙️ Переменные окружения

### Production (.env)
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@45.144.52.58:5432/tipit_prod
MONGODB_URI=mongodb://user:pass@45.144.52.58:27017/tipit_prod
SESSION_SECRET=prod-secret-key
NEXT_PUBLIC_APP_URL=http://45.144.52.219
```

### Staging (.env)
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:pass@45.144.52.58:5432/tipit_staging
MONGODB_URI=mongodb://user:pass@45.144.52.58:27017/tipit_staging
SESSION_SECRET=staging-secret-key
NEXT_PUBLIC_APP_URL=http://45.144.52.219:8080
```

---

## 📝 Следующие шаги

1. **На сервере:**
   ```bash
   # Отредактируйте REPO_URL в setup-cicd.sh
   nano scripts/setup-cicd.sh
   
   # Запустите установку
   bash scripts/setup-cicd.sh
   
   # Создайте .env файлы
   nano /var/www/tipit-prod/.env
   nano /var/www/tipit-staging/.env
   ```

2. **На GitHub:**
   - Добавьте 6 Secrets (см. `.github/SECRETS-SETUP.md`)

3. **Локально:**
   ```bash
   # Создайте dev ветку
   git checkout -b dev
   git push origin dev
   
   # Закоммитьте все файлы
   git add .
   git commit -m "ci: setup CI/CD with GitHub Actions"
   git push origin dev
   ```

4. **Тест:**
   - GitHub → Actions → Deploy to Staging → Run workflow
   - Проверьте: http://45.144.52.219:8080

---

## ✅ Преимущества

1. **Автоматизация:** Push → автодеплой (без ручных действий)
2. **Два окружения:** Тестирование на staging перед production
3. **Быстрый откат:** `git revert` и пуш
4. **Логи:** Все деплои видны в GitHub Actions
5. **Безопасность:** SSH ключи, зашифрованные Secrets
6. **Масштабируемость:** Легко добавить новые окружения

---

## 🆚 Сравнение: До и После

### До (ручной деплой):
```bash
ssh user@server
cd /var/www/app
git pull
npm install
npm run build
pm2 restart app
# 😓 Повторять каждый раз
```

### После (автодеплой):
```bash
git push origin main
# 🎉 Готово!
```

---

## 📞 Поддержка

При проблемах:
1. Проверьте GitHub Actions logs
2. Проверьте PM2 logs: `pm2 logs`
3. Проверьте Nginx logs: `/var/log/nginx/`
4. См. Troubleshooting в `CICD-SETUP.md`

---

**Создано:** GitHub Copilot
**Дата:** 2025-10-17
