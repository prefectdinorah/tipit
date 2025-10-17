# 🎯 CI/CD Commands Cheatsheet

## 🚀 Развертывание

### Первоначальная настройка (один раз)

```bash
# 1. На сервере - запустить setup
ssh user@45.144.52.219
git clone https://github.com/YOUR_USERNAME/tipit.git ~/setup
cd ~/setup
nano scripts/setup-cicd.sh  # Исправить REPO_URL
chmod +x scripts/setup-cicd.sh
bash scripts/setup-cicd.sh

# 2. Создать .env файлы
nano /var/www/tipit-prod/.env
nano /var/www/tipit-staging/.env

# 3. Миграции БД
cd /var/www/tipit-prod && npm run prisma:migrate
cd /var/www/tipit-staging && npm run prisma:migrate
```

### Каждодневная работа

```bash
# Деплой на staging
git checkout dev
git add .
git commit -m "feat: новая фича"
git push origin dev
# ✅ Автоматом деплоится на http://45.144.52.219:8080

# Деплой на production
git checkout main
git merge dev
git push origin main
# ✅ Автоматом деплоится на http://45.144.52.219
```

---

## 📊 Мониторинг

### PM2

```bash
# Список процессов
pm2 list

# Логи
pm2 logs tipit-prod
pm2 logs tipit-staging
pm2 logs tipit-prod --lines 100  # последние 100 строк
pm2 logs --err  # только ошибки

# Мониторинг в реальном времени
pm2 monit

# Информация о процессе
pm2 show tipit-prod

# Перезапуск
pm2 restart tipit-prod
pm2 restart tipit-staging
pm2 restart all
```

### Nginx

```bash
# Статус
sudo systemctl status nginx

# Проверка конфига
sudo nginx -t

# Перезагрузка
sudo systemctl reload nginx
sudo systemctl restart nginx

# Логи
sudo tail -f /var/log/nginx/tipit-prod-access.log
sudo tail -f /var/log/nginx/tipit-prod-error.log
sudo tail -f /var/log/nginx/tipit-staging-access.log
sudo tail -f /var/log/nginx/tipit-staging-error.log

# Очистка логов
sudo truncate -s 0 /var/log/nginx/tipit-prod-access.log
```

### Git

```bash
# На сервере - проверить текущую ветку
cd /var/www/tipit-prod
git branch
git log --oneline -5

cd /var/www/tipit-staging
git branch
git log --oneline -5
```

---

## 🔧 Управление

### PM2 управление

```bash
# Остановить
pm2 stop tipit-prod
pm2 stop tipit-staging

# Запустить
pm2 start tipit-prod
pm2 start ecosystem.config.js

# Удалить из списка
pm2 delete tipit-prod

# Сохранить список процессов
pm2 save

# Настроить автозапуск
pm2 startup
```

### Ручной деплой (если нужно)

```bash
# Production
cd /var/www/tipit-prod
git pull origin main
npm install
npm run prisma:generate
npm run prisma:migrate
npm run build
pm2 restart tipit-prod

# Staging
cd /var/www/tipit-staging
git pull origin dev
npm install
npm run prisma:generate
npm run prisma:migrate
npm run build
pm2 restart tipit-staging
```

### Откат к предыдущей версии

```bash
# Локально
git checkout main
git log --oneline -10  # найти commit hash
git revert <commit-hash>
git push origin main
# ✅ Автоматом откатится

# Или на сервере вручную
cd /var/www/tipit-prod
git reset --hard HEAD~1  # откат на 1 коммит назад
npm run build
pm2 restart tipit-prod
```

---

## 🔍 Диагностика

### Проверка что всё работает

```bash
# Приложение запущено?
curl http://localhost:3000
curl http://localhost:3001

# Порты слушаются?
sudo netstat -tlnp | grep 3000
sudo netstat -tlnp | grep 3001
sudo netstat -tlnp | grep 80
sudo netstat -tlnp | grep 8080

# Процессы PM2
pm2 list
ps aux | grep node

# Nginx работает?
sudo systemctl status nginx
curl http://45.144.52.219
curl http://45.144.52.219:8080
```

### База данных

```bash
# Проверка подключения к PostgreSQL
PGPASSWORD=password psql -h 45.144.52.58 -U user -d tipit_prod -c "SELECT version();"

# Проверка подключения к MongoDB
mongosh "mongodb://user:password@45.144.52.58:27017/tipit_prod" --eval "db.runCommand({ping:1})"

# Список миграций
cd /var/www/tipit-prod
npx prisma migrate status
```

### Логи приложения

```bash
# PM2 логи
pm2 logs tipit-prod --lines 200
pm2 logs tipit-staging --err --lines 100

# Файловые логи (если настроены)
tail -f /var/www/tipit-prod/logs/out.log
tail -f /var/www/tipit-prod/logs/error.log
```

---

## 🐛 Troubleshooting

### ❌ PM2 процесс упал

```bash
pm2 list  # проверить статус
pm2 logs tipit-prod --err --lines 50  # смотреть ошибки
pm2 restart tipit-prod
```

### ❌ Nginx 502 Bad Gateway

```bash
# Проверить что Next.js работает
curl http://localhost:3000

# Если нет - перезапустить PM2
pm2 restart tipit-prod

# Проверить Nginx
sudo nginx -t
sudo systemctl reload nginx
```

### ❌ Git pull не работает

```bash
cd /var/www/tipit-prod
git status  # есть ли изменения?
git stash  # сохранить изменения
git pull origin main
git stash pop  # вернуть изменения
```

### ❌ npm install ошибки

```bash
# Очистить кэш
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### ❌ База данных не доступна

```bash
# Проверить firewall на DB сервере
ssh user@45.144.52.58
sudo ufw status
sudo ufw allow from 45.144.52.219 to any port 5432
sudo ufw allow from 45.144.52.219 to any port 27017

# Проверить что DB запущена
sudo systemctl status postgresql
sudo systemctl status mongod
```

---

## 📁 Файлы и пути

### Конфигурации

| Файл | Путь |
|------|------|
| Nginx Production | `/etc/nginx/sites-available/tipit-prod.conf` |
| Nginx Staging | `/etc/nginx/sites-available/tipit-staging.conf` |
| PM2 Config | `/var/www/tipit-*/ecosystem.config.js` |
| Production .env | `/var/www/tipit-prod/.env` |
| Staging .env | `/var/www/tipit-staging/.env` |

### Логи

| Тип | Путь |
|-----|------|
| Nginx Production Access | `/var/log/nginx/tipit-prod-access.log` |
| Nginx Production Error | `/var/log/nginx/tipit-prod-error.log` |
| Nginx Staging Access | `/var/log/nginx/tipit-staging-access.log` |
| Nginx Staging Error | `/var/log/nginx/tipit-staging-error.log` |
| PM2 Production | `/var/www/tipit-prod/logs/` |
| PM2 Staging | `/var/www/tipit-staging/logs/` |

---

## 🔐 Безопасность

### SSH ключи

```bash
# Просмотр ключей
ls -la ~/.ssh/

# Генерация нового ключа
ssh-keygen -t ed25519 -C "your_email@example.com"

# Добавление ключа на сервер
ssh-copy-id user@45.144.52.219
```

### Firewall

```bash
# Статус
sudo ufw status verbose

# Разрешить порты
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 8080/tcp
sudo ufw allow 3000/tcp
sudo ufw allow 3001/tcp

# Разрешить с определенного IP
sudo ufw allow from 45.144.52.58 to any port 5432
```

---

## ⚙️ Переменные окружения

### Production (.env)

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@45.144.52.58:5432/tipit_prod
MONGODB_URI=mongodb://user:pass@45.144.52.58:27017/tipit_prod
SESSION_SECRET=your-production-secret
NEXT_PUBLIC_APP_URL=http://45.144.52.219
```

### Staging (.env)

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:pass@45.144.52.58:5432/tipit_staging
MONGODB_URI=mongodb://user:pass@45.144.52.58:27017/tipit_staging
SESSION_SECRET=your-staging-secret
NEXT_PUBLIC_APP_URL=http://45.144.52.219:8080
```

---

## 🌐 URLs

| Окружение | URL | Порт |
|-----------|-----|------|
| Production | http://45.144.52.219 | 80 |
| Staging | http://45.144.52.219:8080 | 8080 |
| Production Direct | http://45.144.52.219:3000 | 3000 |
| Staging Direct | http://45.144.52.219:3001 | 3001 |
| GitHub Actions | https://github.com/YOUR_USERNAME/tipit/actions | - |

---

## 📞 Быстрая помощь

```bash
# Всё сломалось - начать сначала
pm2 delete all
cd /var/www/tipit-prod
npm run build
pm2 start ecosystem.config.js
sudo systemctl reload nginx

# Посмотреть ЧТО происходит
pm2 logs --lines 100
sudo tail -f /var/log/nginx/tipit-prod-error.log

# Проверить ВСЁ
pm2 list && sudo systemctl status nginx && curl http://localhost:3000
```
