# ⚡ Шпаргалка команд TIPIT# ⚡ Шпаргалка команд TIPIT CI/CD



**Репозиторий:** `git@github.com:prefectdinorah/tipit.git`**Репозиторий:** `git@github.com:prefectdinorah/tipit.git`



**Окружения:****Окружения:**

- **DEV:** порт 3001 → `/root/tipit/dev`- **DEV (Staging):** dev ветка → порт 3001 → `/root/tipit/dev`

- **IFT:** порт 3000 → `/root/tipit/ift` (пока не настроено)- **IFT (Testing):** master ветка → порт 3000 → `/root/tipit/ift`



**Базы данных:****Базы данных:** Единая `tipit` (PostgreSQL + MongoDB на 45.144.52.58)

- PostgreSQL: `streamdonate_db` на 45.144.52.58:5432

- MongoDB: `tipit` на 45.144.52.58:27017---



---## 🔑 Git и SSH



## 🔄 Деплой### Первый push в GitHub



### DEV окружение```bash

# Создать SSH ключ для GitHub

```bashssh-keygen -t ed25519 -C "your_email@example.com" -f ~/.ssh/id_ed25519_github

git checkout dev

git add .# Добавить ключ на GitHub

git commit -m "Your changes"cat ~/.ssh/id_ed25519_github.pub

git push origin dev# → GitHub → Settings → SSH keys → Add

# → http://45.144.52.219:3001

```# Инициализировать репозиторий

git init

---git add .

git commit -m "Initial commit"

## 📦 PM2 (Process Manager)git branch -M master

git remote add origin git@github.com:prefectdinorah/tipit.git

```bashgit push -u origin master

# Статус

pm2 status# Создать dev ветку

git checkout -b dev

# Логиgit push -u origin dev

pm2 logs tipit-dev```

pm2 logs tipit-dev --lines 50

pm2 logs tipit-dev --err### SSH ключи для деплоя



# Перезапуск```bash

pm2 restart tipit-dev# Создать ключ для GitHub Actions

ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/tipit_deploy

# Остановка

pm2 stop tipit-dev# Добавить на сервер

ssh-copy-id -i ~/.ssh/tipit_deploy.pub root@45.144.52.219

# Удаление

pm2 delete tipit-dev# Проверить

ssh -i ~/.ssh/tipit_deploy root@45.144.52.219 "whoami"

# Запуск заново

cd /root/tipit/dev# Скопировать приватный ключ для GitHub Secrets

pm2 start npm --name "tipit-dev" -- start -- -p 3001cat ~/.ssh/tipit_deploy

pm2 save```

```

---

---

## 🔄 Деплой

## 🖥️ На сервере

### Staging (DEV)

### Подключение```bash

git checkout dev

```bashgit add .

ssh root@45.144.52.219git commit -m "Your changes"

```git push origin dev

# → Автодеплой на http://45.144.52.219:3001

### Обновление кода```



```bash### IFT (Testing)

cd /root/tipit/dev```bash

git pull origin devgit checkout master

npm install --legacy-peer-deps  # Если package.json изменилсяgit merge dev

npm run buildgit push origin master

pm2 restart tipit-dev# → Автодеплой на http://45.144.52.219:3000

``````



### Редактирование .env---



```bash## 🖥️ На сервере (SSH: root@45.144.52.219)

cd /root/tipit/dev

nano .env### Подключение

# После изменений:```bash

pm2 restart tipit-devssh root@45.144.52.219

```

# С использованием ключа

---ssh -i ~/.ssh/tipit_deploy root@45.144.52.219

```

## 🗄️ Базы данных

### Навигация

### PostgreSQL```bash

cd /root/tipit/dev          # Staging

```bashcd /root/tipit/ift          # IFT

# Подключение

psql -h 45.144.52.58 -U streamdonate_user -d streamdonate_dbls -la                      # Список файлов

# Пароль: B5oFzj1O0DyAhNzWlfMWqW71cat .env                    # Показать .env

nano .env                   # Редактировать .env

# Команды внутри psql:```

\dt                         # Список таблиц

\d+ users                   # Структура таблицы---

SELECT * FROM users;        # Запрос

\q                          # Выход## 📦 PM2 (Process Manager)

```

### Основные команды

### MongoDB```bash

pm2 list                    # Список процессов

```bashpm2 logs                    # Все логи

# Подключениеpm2 logs tipit-dev          # Логи staging

mongosh mongodb://streamdonate_mongo_user:d57b9iF62KFVRi8v1Nmx8Tv8@45.144.52.58:27017/tipitpm2 logs tipit-ift          # Логи IFT



# Команды внутри mongosh:pm2 restart tipit-dev       # Перезапустить staging

show collections            # Список коллекцийpm2 restart tipit-ift       # Перезапустить IFT

db.donations.find()         # Найти все

db.donations.countDocuments()  # Количествоpm2 stop tipit-dev          # Остановить

exit                        # Выходpm2 start tipit-dev         # Запустить

```

pm2 show tipit-dev          # Детали процесса

---pm2 monit                   # Мониторинг в реальном времени

```

## 🌐 Nginx

### Первый запуск

```bash```bash

# Проверка конфига# Staging

sudo nginx -tpm2 start npm --name "tipit-dev" -- start -- -p 3001



# Перезагрузка# IFT

sudo systemctl reload nginxpm2 start npm --name "tipit-ift" -- start -- -p 3000



# Статус# Сохранить

sudo systemctl status nginxpm2 save

pm2 startup

# Логи```

sudo tail -f /var/log/nginx/tipit-staging-access.log

sudo tail -f /var/log/nginx/error.log---

```

## 🌐 Nginx

---

### Основные команды

## 🔧 Troubleshooting```bash

sudo nginx -t                       # Проверить конфиг

### MongoDB ошибка "Invalid scheme"sudo systemctl reload nginx         # Перезагрузить

sudo systemctl restart nginx        # Перезапустить

```bashsudo systemctl status nginx         # Статус

# Проверьте .env

cat /root/tipit/dev/.env | grep MONGODBsudo tail -f /var/log/nginx/access.log    # Логи доступа

sudo tail -f /var/log/nginx/error.log     # Логи ошибок

# Должно быть:```

MONGODB_URI="mongodb://streamdonate_mongo_user:..."

### Конфиги

# НЕ должно быть:```bash

MONGODB_URI="mongosh streamdonate://..."# Staging

sudo nano /etc/nginx/sites-available/tipit-staging.conf

# После исправления:

pm2 restart tipit-dev# IFT

```sudo nano /etc/nginx/sites-available/tipit-production.conf



### PM2 процесс падает# После изменений

sudo nginx -t && sudo systemctl reload nginx

```bash```

# Смотрим ошибки

pm2 logs tipit-dev --err --lines 50---



# Пересоздаём## 🗄️ Базы данных

pm2 delete tipit-dev

cd /root/tipit/dev### PostgreSQL (45.144.52.58)

pm2 start npm --name "tipit-dev" -- start -- -p 3001```bash

pm2 save# Подключение

```psql -h 45.144.52.58 -U user -d tipit



### Nginx 502 Bad Gateway# Внутри psql:

\dt                         # Список таблиц

```bash\d+ users                   # Структура таблицы

# Проверяем PM2SELECT * FROM users;        # Запрос

pm2 status  # Должен быть online\q                          # Выход



# Проверяем порт# Prisma

netstat -tulpn | grep :3001cd /root/tipit/dev

npm run prisma:studio       # GUI на :5555

# Логиnpm run prisma:migrate      # Применить миграции

pm2 logs tipit-dev```

sudo tail -f /var/log/nginx/error.log

```### MongoDB (45.144.52.58)

```bash

### Prisma версии не совпадают# Подключение

mongosh mongodb://user:pass@45.144.52.58:27017/tipit

```bash

cd /root/tipit/dev# Внутри mongosh:

npm install --save-dev prisma@latestshow collections            # Список коллекций

npm install @prisma/client@latestdb.donations.find()         # Найти все документы

npm run prisma:generatedb.donations.countDocuments()  # Количество

npm run buildexit                        # Выход

pm2 restart tipit-dev```

```

**⚠️ Обе окружения используют ОДНУ базу данных:** `tipit`

---

---

## 💡 Полезные команды

## 🔧 Troubleshooting

```bash

# Мониторинг PM2### PM2 не запускается

pm2 monit```bash

cd /root/tipit/dev

# Детальная информацияpm2 logs tipit-dev --lines 50      # Смотрим логи

pm2 show tipit-dev

# Пересоздать процесс

# Проверка портовpm2 delete tipit-dev

netstat -tulpn | grep :3001pm2 start npm --name "tipit-dev" -- start -- -p 3001

pm2 save

# Процессы Node.js```

ps aux | grep node

### Nginx 502 Bad Gateway

# Использование диска```bash

df -hpm2 list                            # Проверить процессы (должны быть online)

netstat -tulpn | grep :3001         # Проверить порт staging

# Использование памятиnetstat -tulpn | grep :3000         # Проверить порт IFT

free -hsudo tail -f /var/log/nginx/error.log   # Смотреть логи

``````



---### База данных не подключается

```bash

## 📝 NPM команды# Проверить .env

cat /root/tipit/dev/.env | grep DATABASE

```bash

cd /root/tipit/dev# Проверить доступ

psql -h 45.144.52.58 -U user -d tipit

# Установка зависимостейmongosh mongodb://user:pass@45.144.52.58:27017/tipit

npm install --legacy-peer-deps```



# Генерация Prisma Client### Build падает

npm run prisma:generate```bash

cd /root/tipit/dev

# Применение миграцийrm -rf node_modules .next

npm run prisma:migratenpm install

npm run build

# Сборка приложения```

npm run build

### Очистка места

# Запуск в production```bash

npm start# Очистить старые логи

```pm2 flush



---# Очистить node_modules (будьте осторожны!)

cd /root/tipit/dev

## 🚨 Экстренное восстановлениеrm -rf node_modules

npm install

```bash

# 1. Проверка PM2# Очистить кэш npm

pm2 statusnpm cache clean --force

pm2 restart tipit-dev```



# 2. Проверка логов---

pm2 logs tipit-dev --err --lines 100

## 📊 Мониторинг

# 3. Полная перезагрузка PM2

pm2 delete tipit-dev### Проверка статуса

cd /root/tipit/dev```bash

pm2 start npm --name "tipit-dev" -- start -- -p 3001# PM2

pm2 savepm2 list



# 4. Проверка Nginx# Nginx

sudo nginx -tsudo systemctl status nginx

sudo systemctl status nginx

sudo systemctl restart nginx# Порты

netstat -tulpn | grep :3001         # Staging

# 5. Проверка баз данныхnetstat -tulpn | grep :3000         # IFT

psql -h 45.144.52.58 -U streamdonate_user -d streamdonate_db

mongosh mongodb://streamdonate_mongo_user:d57b9iF62KFVRi8v1Nmx8Tv8@45.144.52.58:27017/tipit# Диск

```df -h



---# Память

free -h

**Push в dev = автодеплой на порт 3001!** 🚀

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
