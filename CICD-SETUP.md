# 🚀 CI/CD Setup Guide

## 📋 Обзор

Автоматический CI/CD pipeline для деплоя приложения Tipit через GitHub Actions.

**Архитектура:**
```
GitHub Repository
├── main branch → Production (port 3000)
└── dev branch → Staging (port 3001)

Server: 45.144.52.219
├── /var/www/tipit-prod (Production)
└── /var/www/tipit-staging (Staging)

Nginx
├── http://domain.com:80 → :3000 (Production)
└── http://domain.com:8080 → :3001 (Staging)
```

---

## 🎯 Часть 1: Настройка сервера (Одноразово)

### Шаг 1: Запустите setup скрипт на сервере

```bash
# 1. SSH на сервер
ssh user@45.144.52.219

# 2. Клонируйте репозиторий (временно, для скрипта)
cd ~
git clone https://github.com/YOUR_USERNAME/tipit.git
cd tipit

# 3. Отредактируйте REPO_URL в скрипте
nano scripts/setup-cicd.sh
# Замените YOUR_USERNAME на ваш GitHub username

# 4. Сделайте скрипт исполняемым
chmod +x scripts/setup-cicd.sh

# 5. Запустите установку
bash scripts/setup-cicd.sh
```

### Шаг 2: Создайте .env файлы

**Production (.env):**
```bash
sudo nano /var/www/tipit-prod/.env
```

```env
# Database
DATABASE_URL="postgresql://user:password@45.144.52.58:5432/tipit_prod"
MONGODB_URI="mongodb://user:password@45.144.52.58:27017/tipit_prod"

# Security
SESSION_SECRET="your-super-secret-production-key-here"

# App
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_APP_URL=http://45.144.52.219
```

**Staging (.env):**
```bash
sudo nano /var/www/tipit-staging/.env
```

```env
# Database
DATABASE_URL="postgresql://user:password@45.144.52.58:5432/tipit_staging"
MONGODB_URI="mongodb://user:password@45.144.52.58:27017/tipit_staging"

# Security
SESSION_SECRET="your-staging-secret-key-here"

# App
NODE_ENV=development
PORT=3001
NEXT_PUBLIC_APP_URL=http://45.144.52.219:8080
```

### Шаг 3: Запустите миграции БД

```bash
# Production
cd /var/www/tipit-prod
npm run prisma:migrate

# Staging
cd /var/www/tipit-staging
npm run prisma:migrate
```

### Шаг 4: Проверьте Nginx

```bash
# Проверка конфигурации
sudo nginx -t

# Перезагрузка
sudo systemctl reload nginx

# Статус
sudo systemctl status nginx
```

### Шаг 5: Настройте firewall

```bash
# Разрешаем порты (если еще не разрешены)
sudo ufw allow 80/tcp
sudo ufw allow 8080/tcp
sudo ufw allow 3000/tcp
sudo ufw allow 3001/tcp

# Проверка
sudo ufw status
```

---

## 🔑 Часть 2: Настройка GitHub Secrets

### Шаг 1: Сгенерируйте SSH ключ (если нет)

```bash
# На вашем сервере
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_deploy

# Добавьте публичный ключ в authorized_keys
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys

# Скопируйте приватный ключ (для GitHub Secrets)
cat ~/.ssh/github_deploy
```

### Шаг 2: Добавьте Secrets в GitHub

Перейдите: `GitHub Repository → Settings → Secrets and variables → Actions → New repository secret`

Добавьте следующие секреты:

| Name | Value | Description |
|------|-------|-------------|
| `PROD_HOST` | `45.144.52.219` | IP сервера |
| `PROD_USER` | `your_username` | SSH пользователь |
| `PROD_SSH_KEY` | `содержимое ~/.ssh/github_deploy` | Приватный SSH ключ |
| `STAGING_HOST` | `45.144.52.219` | IP сервера (тот же) |
| `STAGING_USER` | `your_username` | SSH пользователь |
| `STAGING_SSH_KEY` | `содержимое ~/.ssh/github_deploy` | Приватный SSH ключ |

---

## 🌿 Часть 3: Создание dev ветки

```bash
# Локально
git checkout -b dev
git push origin dev
```

---

## 🚀 Часть 4: Использование CI/CD

### Автоматический деплой

**На Staging:**
```bash
git checkout dev
# Внесите изменения
git add .
git commit -m "feat: новая фича"
git push origin dev
# 🎉 Автоматически задеплоится на staging!
```

**На Production:**
```bash
git checkout main
git merge dev  # Или через Pull Request на GitHub
git push origin main
# 🎉 Автоматически задеплоится на production!
```

### Ручной деплой (через GitHub UI)

1. Перейдите: `Repository → Actions`
2. Выберите workflow: `Deploy to Production` или `Deploy to Staging`
3. Нажмите: `Run workflow`
4. Выберите ветку и нажмите `Run workflow`

---

## 📊 Мониторинг

### Просмотр логов PM2

```bash
# Список процессов
pm2 list

# Логи Production
pm2 logs tipit-prod

# Логи Staging
pm2 logs tipit-staging

# Мониторинг ресурсов
pm2 monit
```

### Просмотр логов Nginx

```bash
# Production access log
sudo tail -f /var/log/nginx/tipit-prod-access.log

# Production error log
sudo tail -f /var/log/nginx/tipit-prod-error.log

# Staging logs
sudo tail -f /var/log/nginx/tipit-staging-access.log
sudo tail -f /var/log/nginx/tipit-staging-error.log
```

### Просмотр логов GitHub Actions

Перейдите: `Repository → Actions → Выберите workflow run`

---

## 🔧 Troubleshooting

### ❌ Деплой не запускается

**Проверьте:**
1. GitHub Secrets настроены правильно
2. SSH ключ добавлен в `~/.ssh/authorized_keys` на сервере
3. Workflow файлы в `.github/workflows/` закоммичены

### ❌ SSH Connection Failed

```bash
# На сервере проверьте SSH
sudo systemctl status ssh

# Проверьте что ключ работает
ssh -i ~/.ssh/github_deploy user@45.144.52.219
```

### ❌ PM2 процесс не запускается

```bash
# Удалите старые процессы
pm2 delete all

# Запустите заново
cd /var/www/tipit-prod
pm2 start ecosystem.config.js

# Сохраните
pm2 save
```

### ❌ Nginx 502 Bad Gateway

```bash
# Проверьте что Next.js запущен
curl http://localhost:3000
curl http://localhost:3001

# Перезапустите PM2
pm2 restart all

# Проверьте логи
pm2 logs
```

### ❌ Database Connection Error

Проверьте:
1. `.env` файлы существуют в `/var/www/tipit-prod/` и `/var/www/tipit-staging/`
2. DATABASE_URL и MONGODB_URI правильные
3. Firewall на DB сервере (45.144.52.58) разрешает подключения с 45.144.52.219

---

## 🎨 Кастомизация

### Изменение портов

**ecosystem.config.js:**
```javascript
env: {
  PORT: 3000  // Измените на нужный
}
```

**Nginx конфиг:**
```nginx
proxy_pass http://localhost:3000;  # Обновите
```

### Добавление окружения переменных

Отредактируйте `.env` файлы и перезапустите PM2:
```bash
pm2 restart tipit-prod --update-env
```

### Изменение домена

Отредактируйте Nginx конфиги:
```bash
sudo nano /etc/nginx/sites-available/tipit-prod.conf
# Измените server_name на ваш домен
sudo nginx -t
sudo systemctl reload nginx
```

---

## ✅ Чеклист готовности

- [ ] Сервер настроен (setup-cicd.sh выполнен)
- [ ] .env файлы созданы (prod и staging)
- [ ] База данных мигрирована
- [ ] Nginx конфиги активны
- [ ] Firewall настроен
- [ ] GitHub Secrets добавлены
- [ ] Dev ветка создана
- [ ] PM2 процессы запущены
- [ ] Production доступен на :80
- [ ] Staging доступен на :8080
- [ ] Тестовый деплой успешен

---

## 🌐 URLs для доступа

| Окружение | URL | Порт | Ветка |
|-----------|-----|------|-------|
| Production | http://45.144.52.219 | 80 | main |
| Staging | http://45.144.52.219:8080 | 8080 | dev |

---

## 📞 Поддержка

При проблемах проверьте:
1. GitHub Actions logs
2. PM2 logs: `pm2 logs`
3. Nginx logs: `/var/log/nginx/`
4. Application logs: `/var/www/tipit-*/logs/`
