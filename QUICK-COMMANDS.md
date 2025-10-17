# ⚡ Шпаргалка команд TIPIT CI/CD

**Репозиторий:** `git@github.com:prefectdinorah/tipit.git`

**Окружения:**
- **DEV (Staging):** dev ветка → порт 3001 → `/root/tipit/dev`
- **IFT (Testing):** master ветка → порт 3000 → `/root/tipit/ift`

**Базы данных:** Единая `tipit` (PostgreSQL + MongoDB на 45.144.52.58)

---

## 🔑 Git и SSH

### Первый push в GitHub

```bash
# Создать SSH ключ для GitHub
ssh-keygen -t ed25519 -C "your_email@example.com" -f ~/.ssh/id_ed25519_github

# Добавить ключ на GitHub
cat ~/.ssh/id_ed25519_github.pub
# → GitHub → Settings → SSH keys → Add

# Инициализировать репозиторий
git init
git add .
git commit -m "Initial commit"
git branch -M master
git remote add origin git@github.com:prefectdinorah/tipit.git
git push -u origin master

# Создать dev ветку
git checkout -b dev
git push -u origin dev
```

### SSH ключи для деплоя

```bash
# Создать ключ для GitHub Actions
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/tipit_deploy

# Добавить на сервер
ssh-copy-id -i ~/.ssh/tipit_deploy.pub root@45.144.52.219

# Проверить
ssh -i ~/.ssh/tipit_deploy root@45.144.52.219 "whoami"

# Скопировать приватный ключ для GitHub Secrets
cat ~/.ssh/tipit_deploy
```

---

## 🔄 Деплой

### Staging (DEV)
```bash
git checkout dev
git add .
git commit -m "Your changes"
git push origin dev
# → Автодеплой на http://45.144.52.219:3001
```

### IFT (Testing)
```bash
git checkout master
git merge dev
git push origin master
# → Автодеплой на http://45.144.52.219:3000
```

---

## 🖥️ На сервере (SSH: root@45.144.52.219)

### Подключение
```bash
ssh root@45.144.52.219

# С использованием ключа
ssh -i ~/.ssh/tipit_deploy root@45.144.52.219
```

### Навигация
```bash
cd /root/tipit/dev          # Staging
cd /root/tipit/ift          # IFT

ls -la                      # Список файлов
cat .env                    # Показать .env
nano .env                   # Редактировать .env
```

---

## 📦 PM2 (Process Manager)

### Основные команды
```bash
pm2 list                    # Список процессов
pm2 logs                    # Все логи
pm2 logs tipit-dev          # Логи staging
pm2 logs tipit-ift          # Логи IFT

pm2 restart tipit-dev       # Перезапустить staging
pm2 restart tipit-ift       # Перезапустить IFT

pm2 stop tipit-dev          # Остановить
pm2 start tipit-dev         # Запустить

pm2 show tipit-dev          # Детали процесса
pm2 monit                   # Мониторинг в реальном времени
```

### Первый запуск
```bash
# Staging
pm2 start npm --name "tipit-dev" -- start -- -p 3001

# IFT
pm2 start npm --name "tipit-ift" -- start -- -p 3000

# Сохранить
pm2 save
pm2 startup
```

---

## 🌐 Nginx

### Основные команды
```bash
sudo nginx -t                       # Проверить конфиг
sudo systemctl reload nginx         # Перезагрузить
sudo systemctl restart nginx        # Перезапустить
sudo systemctl status nginx         # Статус

sudo tail -f /var/log/nginx/access.log    # Логи доступа
sudo tail -f /var/log/nginx/error.log     # Логи ошибок
```

### Конфиги
```bash
# Staging
sudo nano /etc/nginx/sites-available/tipit-staging.conf

# IFT
sudo nano /etc/nginx/sites-available/tipit-production.conf

# После изменений
sudo nginx -t && sudo systemctl reload nginx
```

---

## 🗄️ Базы данных

### PostgreSQL (45.144.52.58)
```bash
# Подключение
psql -h 45.144.52.58 -U user -d tipit

# Внутри psql:
\dt                         # Список таблиц
\d+ users                   # Структура таблицы
SELECT * FROM users;        # Запрос
\q                          # Выход

# Prisma
cd /root/tipit/dev
npm run prisma:studio       # GUI на :5555
npm run prisma:migrate      # Применить миграции
```

### MongoDB (45.144.52.58)
```bash
# Подключение
mongosh mongodb://user:pass@45.144.52.58:27017/tipit

# Внутри mongosh:
show collections            # Список коллекций
db.donations.find()         # Найти все документы
db.donations.countDocuments()  # Количество
exit                        # Выход
```

**⚠️ Обе окружения используют ОДНУ базу данных:** `tipit`

---

## 🔧 Troubleshooting

### PM2 не запускается
```bash
cd /root/tipit/dev
pm2 logs tipit-dev --lines 50      # Смотрим логи

# Пересоздать процесс
pm2 delete tipit-dev
pm2 start npm --name "tipit-dev" -- start -- -p 3001
pm2 save
```

### Nginx 502 Bad Gateway
```bash
pm2 list                            # Проверить процессы (должны быть online)
netstat -tulpn | grep :3001         # Проверить порт staging
netstat -tulpn | grep :3000         # Проверить порт IFT
sudo tail -f /var/log/nginx/error.log   # Смотреть логи
```

### База данных не подключается
```bash
# Проверить .env
cat /root/tipit/dev/.env | grep DATABASE

# Проверить доступ
psql -h 45.144.52.58 -U user -d tipit
mongosh mongodb://user:pass@45.144.52.58:27017/tipit
```

### Build падает
```bash
cd /root/tipit/dev
rm -rf node_modules .next
npm install
npm run build
```

### Очистка места
```bash
# Очистить старые логи
pm2 flush

# Очистить node_modules (будьте осторожны!)
cd /root/tipit/dev
rm -rf node_modules
npm install

# Очистить кэш npm
npm cache clean --force
```

---

## 📊 Мониторинг

### Проверка статуса
```bash
# PM2
pm2 list

# Nginx
sudo systemctl status nginx

# Порты
netstat -tulpn | grep :3001         # Staging
netstat -tulpn | grep :3000         # IFT

# Диск
df -h

# Память
free -h

# CPU
top
```

### Health checks
```bash
# Staging
curl http://localhost:3001
curl http://45.144.52.219:3001

# IFT
curl http://localhost:3000
curl http://45.144.52.219:3000
```

---

## 🔐 GitHub Secrets (локально)

```bash
# Смотреть текущие Secrets
# GitHub → Repository → Settings → Secrets and variables → Actions

# Список Secrets:
# SERVER_HOST       = 45.144.52.219
# SERVER_USER       = root
# SERVER_SSH_KEY    = (содержимое ~/.ssh/tipit_deploy)
```

---

## 🚨 Экстренное восстановление

### Приложение не работает
```bash
# 1. Проверка PM2
pm2 status
pm2 restart all

# 2. Проверка портов
netstat -tulpn | grep :3000

# 3. Проверка логов
pm2 logs --err --lines 100

# 4. Полная перезагрузка
pm2 delete all
cd /root/tipit/ift
pm2 start npm --name "tipit-ift" -- start -- -p 3000
cd /root/tipit/dev
pm2 start npm --name "tipit-dev" -- start -- -p 3001
pm2 save
```

### Nginx не работает
```bash
# 1. Проверка конфигурации
sudo nginx -t

# 2. Проверка статуса
sudo systemctl status nginx

# 3. Перезапуск
sudo systemctl restart nginx

# 4. Логи ошибок
sudo tail -n 100 /var/log/nginx/error.log
```

### База данных недоступна
```bash
# Проверка подключения
telnet 45.144.52.58 5432   # PostgreSQL
telnet 45.144.52.58 27017  # MongoDB

# На сервере БД (45.144.52.58)
sudo systemctl status postgresql
sudo systemctl status mongod

# Перезапуск (осторожно!)
sudo systemctl restart postgresql
sudo systemctl restart mongod
```

---

## 📝 NPM команды

```bash
# Установка зависимостей
npm install

# Сборка приложения
npm run build

# Запуск в dev режиме (локально)
npm run dev

# Запуск в production режиме
npm start

# Prisma
npm run prisma:generate    # Генерация Prisma Client
npm run prisma:migrate     # Применение миграций
npm run prisma:studio      # GUI для БД (http://localhost:5555)
```

---

## 🧹 Очистка и обслуживание

```bash
# Очистка npm кеша
npm cache clean --force

# Очистка node_modules
rm -rf node_modules
npm install

# Очистка .next (build cache)
rm -rf .next
npm run build

# Очистка PM2 логов
pm2 flush

# Очистка логов Nginx (осторожно!)
sudo truncate -s 0 /var/log/nginx/*.log
```

---

## 📚 Документация

- 🔑 **[GIT-FIRST-PUSH.md](GIT-FIRST-PUSH.md)** - Первый push в GitHub
- 🚀 **[CICD-QUICKSTART.md](CICD-QUICKSTART.md)** - Быстрый старт (20 минут)
- 📖 [CICD-README.md](CICD-README.md) - Полная инструкция
- 📋 [CICD-FILES-OVERVIEW.md](CICD-FILES-OVERVIEW.md) - Обзор файлов
- 🔐 [.github/SECRETS-SETUP.md](.github/SECRETS-SETUP.md) - Настройка Secrets

---

## 🎯 Быстрая справка

| Что нужно | Куда идти |
|-----------|-----------|
| Первый push в GitHub | [GIT-FIRST-PUSH.md](GIT-FIRST-PUSH.md) |
| Настроить CI/CD за 20 мин | [CICD-QUICKSTART.md](CICD-QUICKSTART.md) |
| Детальная инструкция | [CICD-README.md](CICD-README.md) |
| Нужна команда | Эта страница! |
| Ошибка в деплое | Troubleshooting в [CICD-README.md](CICD-README.md) |

---

**Push = Деплой!** 🚀
