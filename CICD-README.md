# 🚀 Автоматический CI/CD Deployment для TIPIT

## 📋 Оглавление

- [Быстрый старт](#-быстрый-старт)
- [Архитектура](#-архитектура)
- [Детальная инструкция](#-детальная-инструкция)
- [Настройка GitHub](#-настройка-github)
- [Первый деплой](#-первый-деплой)
- [Мониторинг](#-мониторинг)
- [Troubleshooting](#-troubleshooting)

---

## 🚀 Быстрый старт

**Хотите всё сделать за 20 минут?**

→ Читайте **[CICD-QUICKSTART.md](./CICD-QUICKSTART.md)** ⚡

Этот файл содержит **полную инструкцию** со всеми деталями.

---

## 🏗️ Архитектура

### Обзор системы

```
┌──────────────────────────────────────────┐
│      GitHub Repository                    │
│  git@github.com:prefectdinorah/tipit.git │
├──────────────────────────────────────────┤
│  master → IFT (testing)                   │
│  dev    → Staging                        │
└────────────┬─────────────────────────────┘
             │
        GitHub Actions
             │
             ↓
┌──────────────────────────────────────────┐
│   Server: 45.144.52.219                  │
├──────────────────────────────────────────┤
│  /root/tipit/dev → Port 3001 (staging)   │
│  /root/tipit/ift → Port 3000 (IFT)       │
│                                          │
│  PM2: tipit-dev, tipit-ift               │
│  Nginx: dev.tipit.local, tipit.local     │
└──────────────────────────────────────────┘
             │
      Database Server: 45.144.52.58
             │
    ┌────────┴────────┐
    ↓                 ↓
PostgreSQL         MongoDB
 (tipit)           (tipit)
```

### Окружения

| Окружение | Ветка  | Папка              | Порт | PM2 Process | Nginx              |
|-----------|--------|--------------------|------|-------------|--------------------|
| Staging   | `dev`  | `/root/tipit/dev`  | 3001 | `tipit-dev` | `dev.tipit.local`  |
| IFT       | `master` | `/root/tipit/ift`| 3000 | `tipit-ift` | `tipit.local`      |

### Workflow

```
Разработка → dev branch → push → GitHub Actions → Staging (3001)
                ↓
             Тестирование
                ↓
         merge dev → master → push → GitHub Actions → IFT (3000)
```

---

## 📖 Детальная инструкция

### Шаг 0: Первый push в GitHub

**Если репозиторий ещё не на GitHub:**

📌 **Читайте:** [GIT-FIRST-PUSH.md](./GIT-FIRST-PUSH.md)

Краткая версия:

```bash
# 1. Создайте SSH ключ для GitHub
ssh-keygen -t ed25519 -C "your_email@example.com" -f ~/.ssh/id_ed25519_github

# 2. Добавьте ключ на GitHub
# https://github.com/settings/keys
cat ~/.ssh/id_ed25519_github.pub

# 3. Настройте Git
git init
git add .
git commit -m "Initial commit"
git branch -M master
git remote add origin git@github.com:prefectdinorah/tipit.git
git push -u origin master

# 4. Создайте dev ветку
git checkout -b dev
git push -u origin dev
```

### Шаг 1: Подготовка сервера

**На сервере 45.144.52.219:**

```bash
# 1. Создайте структуру папок
mkdir -p /root/tipit/dev
mkdir -p /root/tipit/ift

# 2. Настройте SSH для GitHub (на сервере)
ssh-keygen -t ed25519 -C "server@45.144.52.219" -f ~/.ssh/id_ed25519_github

# Добавьте публичный ключ на GitHub
cat ~/.ssh/id_ed25519_github.pub
# → GitHub → Settings → SSH keys → Add new

# Тестируйте подключение
ssh -T git@github.com

# 3. Клонируйте репозитории
cd /root/tipit/dev
git clone -b dev git@github.com:prefectdinorah/tipit.git .

cd /root/tipit/ift
git clone -b master git@github.com:prefectdinorah/tipit.git .

# 4. Создайте .env файлы
nano /root/tipit/dev/.env
```

**Содержимое `/root/tipit/dev/.env`:**

```env
# Database (PostgreSQL) - ЕДИНАЯ БАЗА
DATABASE_URL="postgresql://user:pass@45.144.52.58:5432/tipit?schema=public"

# MongoDB - ЕДИНАЯ БАЗА
MONGODB_URI="mongodb://user:pass@45.144.52.58:27017/tipit"

# App
NODE_ENV=development
PORT=3001
NEXT_PUBLIC_API_URL=http://45.144.52.219:3001

# NextAuth
NEXTAUTH_URL=http://45.144.52.219:3001
NEXTAUTH_SECRET=dev_secret_min_32_characters_long_12345678

# Other settings...
```

**Содержимое `/root/tipit/ift/.env`:**

```env
# Database (PostgreSQL) - ЕДИНАЯ БАЗА
DATABASE_URL="postgresql://user:pass@45.144.52.58:5432/tipit?schema=public"

# MongoDB - ЕДИНАЯ БАЗА  
MONGODB_URI="mongodb://user:pass@45.144.52.58:27017/tipit"

# App
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_API_URL=http://45.144.52.219:3000

# NextAuth
NEXTAUTH_URL=http://45.144.52.219:3000
NEXTAUTH_SECRET=ift_secret_min_32_characters_long_87654321

# Other settings...
```

**⚠️ Важно:** Сейчас используется **ОДНА база данных** (`tipit`) для обоих окружений.

```bash
# 5. Установите зависимости и соберите
cd /root/tipit/dev
npm install
npm run build

cd /root/tipit/ift
npm install
npm run build

# 6. Настройте Nginx
sudo cp /root/tipit/dev/nginx/tipit-staging.conf /etc/nginx/sites-available/
sudo cp /root/tipit/ift/nginx/tipit-production.conf /etc/nginx/sites-available/

sudo ln -s /etc/nginx/sites-available/tipit-staging.conf /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/tipit-production.conf /etc/nginx/sites-enabled/

sudo nginx -t
sudo systemctl reload nginx

# 7. Запустите PM2
pm2 start npm --name "tipit-dev" -- start -- -p 3001
pm2 start npm --name "tipit-ift" -- start -- -p 3000

pm2 save
pm2 startup

# 8. Проверьте
pm2 list
curl http://localhost:3001
curl http://localhost:3000
```

### Шаг 2: SSH ключи для GitHub Actions

**На локальной машине:**

```bash
# 1. Создайте SSH ключ для деплоя
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/tipit_deploy

# 2. Добавьте публичный ключ на сервер
ssh-copy-id -i ~/.ssh/tipit_deploy.pub root@45.144.52.219

# 3. Тестируйте
ssh -i ~/.ssh/tipit_deploy root@45.144.52.219 "whoami"
# Должно вывести: root

# 4. Скопируйте приватный ключ
cat ~/.ssh/tipit_deploy
```

### Шаг 3: Настройка GitHub Secrets

📌 **Читайте:** [.github/SECRETS-SETUP.md](.github/SECRETS-SETUP.md)

**Идите на GitHub:**

1. Repository → **Settings**
2. **Security** → **Secrets and variables** → **Actions**
3. **New repository secret**

**Добавьте 3 секрета:**

| Название        | Значение                            |
|----------------|-------------------------------------|
| `SERVER_HOST`  | `45.144.52.219`                     |
| `SERVER_USER`  | `root`                              |
| `SERVER_SSH_KEY` | Содержимое `~/.ssh/tipit_deploy` |

**Проверьте:**
- Секреты сохранены
- Нет лишних пробелов в значениях
- `SERVER_SSH_KEY` содержит весь ключ (`-----BEGIN...-----END`)

---

## 🚀 Первый деплой

### Тестовый деплой на Staging

```bash
# 1. Перейдите в dev ветку
git checkout dev

# 2. Сделайте изменение (для теста)
echo "# CI/CD Test" >> README.md
git add .
git commit -m "Test staging deployment"

# 3. Запуште
git push origin dev
```

**Что происходит:**
1. GitHub Actions запускает workflow `deploy-staging.yml`
2. Подключается по SSH к серверу
3. Делает `git pull` в `/root/tipit/dev`
4. Запускает `npm install && npm run build`
5. Перезапускает `pm2 restart tipit-dev`

**Проверьте:**
- GitHub → Actions → Статус workflow ✅
- http://45.144.52.219:3001 → изменения видны

### Деплой на IFT

```bash
# 1. Перейдите в master ветку
git checkout master

# 2. Смержите изменения из dev
git merge dev

# 3. Запуште
git push origin master
```

**Что происходит:**
1. GitHub Actions запускает workflow `deploy-production.yml`
2. Подключается по SSH к серверу
3. Делает `git pull` в `/root/tipit/ift`
4. Запускает `npm install && npm run build`
5. Перезапускает `pm2 restart tipit-ift`

**Проверьте:**
- GitHub → Actions → Статус workflow ✅
- http://45.144.52.219:3000 → изменения видны

---

## 📊 Мониторинг

### PM2

```bash
# Список процессов
pm2 list

# Логи
pm2 logs tipit-dev
pm2 logs tipit-ift

# Детальная информация
pm2 show tipit-dev
pm2 show tipit-ift

# Перезапуск
pm2 restart tipit-dev
pm2 restart tipit-ift

# Остановка
pm2 stop tipit-dev
pm2 delete tipit-dev
```

### Nginx

```bash
# Проверка конфигурации
sudo nginx -t

# Перезагрузка
sudo systemctl reload nginx

# Логи
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Статус
sudo systemctl status nginx
```

### GitHub Actions

1. Repository → **Actions**
2. Выберите workflow (Staging / IFT)
3. Смотрите логи каждого шага

### Базы данных

```bash
# PostgreSQL
psql -h 45.144.52.58 -U user -d tipit

# MongoDB
mongo --host 45.144.52.58 --port 27017 -u user -p pass tipit
```

---

## 🔧 Troubleshooting

### Деплой не запускается

**Проверьте:**

```bash
# 1. Файлы workflows существуют
ls -la .github/workflows/

# 2. Файлы закоммичены
git status

# 3. Запушены на GitHub
git log --oneline origin/dev
git log --oneline origin/master
```

**На GitHub:**
- Repository → Actions → включен ли Actions?
- Settings → Actions → General → Allow all actions

### SSH ошибка: Permission denied

**Проверьте:**

```bash
# Публичный ключ на сервере
ssh root@45.144.52.219 "cat ~/.ssh/authorized_keys"

# Права на файлы
ssh root@45.144.52.219 "chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys"

# Подключение работает
ssh -i ~/.ssh/tipit_deploy root@45.144.52.219 "whoami"
```

**GitHub Secrets:**
- `SERVER_SSH_KEY` содержит ПРИВАТНЫЙ ключ
- Весь ключ от `-----BEGIN` до `-----END` включительно
- Нет лишних пробелов/переносов строк

### Build падает с ошибкой

**Проверьте логи:**

```bash
# На сервере
cd /root/tipit/dev
npm run build

# Если ошибка:
rm -rf node_modules .next
npm install
npm run build
```

**Распространённые проблемы:**
- Нехватка памяти → увеличьте swap
- Отсутствуют зависимости → проверьте `package.json`
- Ошибки TypeScript → исправьте код

### PM2 процесс не запускается

```bash
# Проверьте логи
pm2 logs tipit-dev --lines 50

# Проверьте .env
cat /root/tipit/dev/.env

# Запустите вручную
cd /root/tipit/dev
npm start
# Если работает, то проблема в PM2

# Пересоздайте процесс
pm2 delete tipit-dev
pm2 start npm --name "tipit-dev" -- start -- -p 3001
pm2 save
```

### Nginx 502 Bad Gateway

```bash
# Проверьте PM2
pm2 list
# Процессы должны быть online

# Проверьте порты
netstat -tulpn | grep :3001
netstat -tulpn | grep :3000

# Проверьте логи Nginx
sudo tail -f /var/log/nginx/error.log

# Проверьте конфиг
sudo nginx -t
```

### База данных не подключается

```bash
# Проверьте .env
cat /root/tipit/dev/.env | grep DATABASE

# Проверьте доступ к PostgreSQL
psql -h 45.144.52.58 -U user -d tipit
# Должно подключиться

# Проверьте доступ к MongoDB
mongosh mongodb://user:pass@45.144.52.58:27017/tipit
# Должно подключиться

# Если не подключается:
# - Проверьте firewall на 45.144.52.58
# - Проверьте настройки PostgreSQL (listen_addresses)
# - Проверьте настройки MongoDB (bindIp)
```

### GitHub Actions: Host key verification failed

```bash
# На локальной машине добавьте сервер в known_hosts
ssh-keyscan -H 45.144.52.219 >> ~/.ssh/known_hosts

# Или игнорируйте проверку (менее безопасно)
# В workflow добавьте:
# - name: Disable host key checking
#   run: echo "StrictHostKeyChecking no" >> ~/.ssh/config
```

---

## 📚 Дополнительная документация

- ⚡ [CICD-QUICKSTART.md](./CICD-QUICKSTART.md) - Быстрый старт (20 минут)
- 🔑 [GIT-FIRST-PUSH.md](./GIT-FIRST-PUSH.md) - Первый push в GitHub
- 📋 [CICD-FILES-OVERVIEW.md](./CICD-FILES-OVERVIEW.md) - Обзор файлов
- ⚡ [QUICK-COMMANDS.md](./QUICK-COMMANDS.md) - Шпаргалка команд
- 🔐 [.github/SECRETS-SETUP.md](./.github/SECRETS-SETUP.md) - Настройка Secrets

---

## ✅ Чеклист готовности

### Подготовка
- [ ] SSH ключи для GitHub настроены (локально)
- [ ] SSH ключи для GitHub настроены (на сервере)
- [ ] SSH ключи для деплоя созданы
- [ ] Репозиторий запушен в GitHub
- [ ] Ветки `master` и `dev` созданы

### Сервер
- [ ] Папки `/root/tipit/dev` и `/root/tipit/ift` созданы
- [ ] Репозитории склонированы
- [ ] `.env` файлы настроены (единая БД)
- [ ] Зависимости установлены
- [ ] Build успешно выполнен
- [ ] Nginx конфиги активированы
- [ ] PM2 процессы запущены и online

### GitHub
- [ ] GitHub Secrets добавлены (3 шт)
- [ ] Workflows файлы закоммичены
- [ ] Actions включены в настройках

### Проверка
- [ ] Staging доступен: http://45.144.52.219:3001
- [ ] IFT доступен: http://45.144.52.219:3000
- [ ] Тестовый деплой на staging прошёл ✅
- [ ] Тестовый деплой на IFT прошёл ✅
- [ ] Логи не содержат ошибок

---

## 🎉 Готово!

**Теперь каждый push автоматически деплоит приложение:**

- `git push origin dev` → Staging (3001)
- `git push origin master` → IFT (3000)

**Никаких ручных действий на сервере!** 🚀

---

## 📞 Поддержка

При проблемах:
1. Читайте этот Troubleshooting раздел
2. Проверьте логи: PM2, Nginx, GitHub Actions
3. Используйте [QUICK-COMMANDS.md](./QUICK-COMMANDS.md)

**Удачи в разработке!** �
