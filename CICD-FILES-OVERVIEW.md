# ✅ CI/CD Setup Complete - Overview

## 🎯 Что было сделано

Настроен полный CI/CD pipeline для автоматического деплоя TIPIT приложения на сервер 45.144.52.219.

**Репозиторий:** `git@github.com:prefectdinorah/tipit.git`

**Ветки:**
- `master` → IFT окружение (тестовое) - порт 3000
- `dev` → Staging окружение - порт 3001

---

## 📁 Созданные файлы

### GitHub Actions Workflows
```
.github/
├── workflows/
│   ├── deploy-staging.yml      # Деплой dev → staging (порт 3001)
│   └── deploy-production.yml   # Деплой master → IFT (порт 3000)
├── README.md                   # Обзор документации
└── SECRETS-SETUP.md           # Инструкция по настройке Secrets
```

### Nginx конфигурации
```
nginx/
├── tipit-staging.conf         # Проксирование staging (порт 3001)
└── tipit-production.conf      # Проксирование production (порт 3000)
```

### Документация
```
CICD-QUICKSTART.md            # ⚡ Быстрый старт (20 минут)
CICD-README.md                # 📖 Полная инструкция
QUICK-COMMANDS.md             # ⚡ Шпаргалка команд
GIT-FIRST-PUSH.md             # 🔑 Первый push в GitHub
.env.example                  # Шаблон переменных окружения
```

### Вспомогательные файлы
```
public/uploads/.gitkeep       # Сохраняет папку uploads в Git
```

---

## 🏗️ Архитектура

### Структура на сервере:
```
/root/tipit/
├── dev/          # DEV окружение (dev ветка)
│   ├── .env      # Переменные для dev
│   ├── ...       # Next.js приложение
│   └── PM2: tipit-dev (port 3001)
│
└── ift/          # IFT окружение (master ветка)
    ├── .env      # Переменные для IFT
    ├── ...       # Next.js приложение
    └── PM2: tipit-ift (port 3000)
```

### Nginx проксирование:
```
http://dev.tipit.local     → localhost:3001 (staging)
http://tipit.local         → localhost:3000 (IFT)
```

### Git workflow:
```
dev branch    → push → GitHub Actions → /root/tipit/dev → PM2 restart → staging
master branch → push → GitHub Actions → /root/tipit/ift → PM2 restart → IFT
```

---

## 🔧 GitHub Secrets (требуется настроить)

В GitHub репозитории добавьте следующие Secrets:

| Secret Name | Value | Описание |
|------------|-------|----------|
| `SERVER_HOST` | `45.144.52.219` | IP сервера |
| `SERVER_USER` | `root` | SSH пользователь |
| `SERVER_SSH_KEY` | `<приватный ключ>` | SSH ключ для подключения |

**Как настроить:** См. `.github/SECRETS-SETUP.md`

---

## 📋 Следующие шаги

### 0. Первый push в GitHub (если ещё не сделан)

**Читайте:** [GIT-FIRST-PUSH.md](./GIT-FIRST-PUSH.md)

Быстро:
```bash
# Настройте SSH для GitHub
ssh-keygen -t ed25519 -C "your_email@example.com" -f ~/.ssh/id_ed25519_github
# Добавьте ключ на https://github.com/settings/keys

# Инициализируйте репозиторий
git init
git add .
git commit -m "Initial commit"
git branch -M master
git remote add origin git@github.com:prefectdinorah/tipit.git
git push -u origin master

# Создайте dev ветку
git checkout -b dev
git push -u origin dev
```

### 1. Подготовка сервера (выполните на 45.144.52.219)

```bash
# Создайте структуру
mkdir -p /root/tipit/dev
mkdir -p /root/tipit/ift

# Клонируйте репозитории
cd /root/tipit/dev
git clone -b dev git@github.com:prefectdinorah/tipit.git .

cd /root/tipit/ift
git clone -b master git@github.com:prefectdinorah/tipit.git .

# Настройте .env файлы
nano /root/tipit/dev/.env
nano /root/tipit/ift/.env

# ⚠️ Используйте ОДНУ базу данных для обоих окружений:
# DATABASE_URL="postgresql://user:pass@45.144.52.58:5432/tipit?schema=public"
# MONGODB_URI="mongodb://user:pass@45.144.52.58:27017/tipit"

# Установите зависимости
cd /root/tipit/dev && npm install && npm run build
cd /root/tipit/ift && npm install && npm run build

# Настройте Nginx
sudo cp /root/tipit/dev/nginx/tipit-staging.conf /etc/nginx/sites-available/
sudo cp /root/tipit/ift/nginx/tipit-production.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/tipit-staging.conf /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/tipit-production.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Запустите PM2
pm2 start npm --name "tipit-dev" -- start -- -p 3001
pm2 start npm --name "tipit-ift" -- start -- -p 3000
pm2 save && pm2 startup
```

### 2. Настройка GitHub (выполните локально)

```bash
# Создайте SSH ключ
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/tipit_deploy

# Добавьте публичный ключ на сервер
ssh-copy-id -i ~/.ssh/tipit_deploy.pub root@45.144.52.219

# Добавьте приватный ключ в GitHub Secrets
# GitHub → Repository → Settings → Secrets → Actions
# Создайте SECRET с именем: SERVER_SSH_KEY
# Значение: содержимое ~/.ssh/tipit_deploy
```

### 3. Первый деплой

```bash
# Staging
git checkout dev
git add .
git commit -m "Setup CI/CD"
git push origin dev
# → Автоматический деплой на staging!

# IFT
git checkout master
git merge dev
git push origin master
# → Автоматический деплой на IFT!
```

---

## 📚 Документация

### 📚 **Документация (с чего начать):**

1. 🔑 **[GIT-FIRST-PUSH.md](GIT-FIRST-PUSH.md)** - Первый push в GitHub
2. 🚀 **[CICD-QUICKSTART.md](CICD-QUICKSTART.md)** - Настройка CI/CD
3. 📖 [CICD-README.md](CICD-README.md) - Детальная инструкция
4. ⚡ [QUICK-COMMANDS.md](QUICK-COMMANDS.md) - Шпаргалка команд
5. 🔐 [.github/SECRETS-SETUP.md](.github/SECRETS-SETUP.md) - Настройка Secrets

---

## ✅ Чеклист

### На локальной машине:
- [ ] SSH ключи для GitHub настроены
- [ ] Файлы CI/CD закоммичены в Git
- [ ] Репозиторий инициализирован: `git@github.com:prefectdinorah/tipit.git`
- [ ] Ветки созданы: `master` и `dev`
- [ ] Код запушен в GitHub

### На сервере 45.144.52.219:
- [ ] Созданы папки: `/root/tipit/dev` и `/root/tipit/ift`
- [ ] Репозитории склонированы (dev и master ветки)
- [ ] .env файлы настроены (единая БД)
- [ ] Зависимости установлены (`npm install && npm run build`)
- [ ] Nginx конфиги активированы
- [ ] PM2 процессы запущены: `tipit-dev` (3001) и `tipit-ift` (3000)
- [ ] SSH ключ работает

### В GitHub:
- [ ] Repository: `git@github.com:prefectdinorah/tipit.git`
- [ ] Ветки: `master` и `dev` существуют
- [ ] GitHub Secrets добавлены (SERVER_HOST, SERVER_USER, SERVER_SSH_KEY)
- [ ] Workflows файлы в `.github/workflows/`

### Проверка работы:
- [ ] Тестовый деплой dev → staging прошёл успешно
- [ ] Тестовый деплой master → IFT прошёл успешно
- [ ] DEV доступен: http://45.144.52.219:3001
- [ ] IFT доступен: http://45.144.52.219:3000
- [ ] PM2 показывает оба процесса online
- [ ] Логи не содержат критических ошибок

**🎉 Поздравляем! CI/CD полностью настроен и работает!**

**Теперь:**
- Push в **dev** → автодеплой на staging (порт 3001)
- Push в **master** → автодеплой на IFT (порт 3000)

**Больше никаких ручных действий на сервере!** 🚀

---

## 🎉 Результат

После настройки:

✅ **Автоматический деплой:**
- Push в `dev` → деплой на staging (localhost:3001)
- Push в `master` → деплой на IFT (localhost:3000)

✅ **Изолированные окружения:**
- Разные папки: `/root/tipit/dev` и `/root/tipit/ift`
- Разные порты: 3001 и 3000
- **Единая БД:** `tipit` (пока)

✅ **Nginx проксирование:**
- `dev.tipit.local` → :3001
- `tipit.local` → :3000

✅ **PM2 управление:**
- `tipit-dev` (staging)
- `tipit-ift` (testing)

**Никаких ручных действий на сервере!** 🚀

---

## 📞 Поддержка

При проблемах:
1. Читайте Troubleshooting в [CICD-README.md](./CICD-README.md)
2. Проверьте логи: `pm2 logs`, GitHub Actions
3. Используйте [QUICK-COMMANDS.md](./QUICK-COMMANDS.md)

**Готово к использованию!** 🎊
