# 🚀 Быстрый старт: Настройка CI/CD для TIPIT

## 📋 Что получится в результате

После выполнения всех шагов у вас будет:
- ✅ Автоматический деплой при push в dev → staging (порт 3001)
- ✅ Автоматический деплой при push в master → IFT (порт 3000)
- ✅ Nginx проксирование для обоих окружений
- ✅ PM2 управление процессами
- ✅ Единая база данных для обоих окружений

---

## 🔑 Шаг 0: Инициализация Git репозитория (5 минут)

### 0.1 Настройте SSH ключ для GitHub (если ещё нет)

**Windows PowerShell:**
```powershell
# Сгенерируйте SSH ключ для GitHub
ssh-keygen -t ed25519 -C "your_email@example.com" -f ~/.ssh/id_ed25519_github

# Запустите ssh-agent
Start-Service ssh-agent

# Добавьте ключ в ssh-agent
ssh-add ~/.ssh/id_ed25519_github

# Скопируйте публичный ключ
Get-Content ~/.ssh/id_ed25519_github.pub | clip
```

**Linux/Mac:**
```bash
# Сгенерируйте SSH ключ для GitHub
ssh-keygen -t ed25519 -C "your_email@example.com" -f ~/.ssh/id_ed25519_github

# Запустите ssh-agent
eval "$(ssh-agent -s)"

# Добавьте ключ в ssh-agent
ssh-add ~/.ssh/id_ed25519_github

# Скопируйте публичный ключ
cat ~/.ssh/id_ed25519_github.pub
```

### 0.2 Добавьте SSH ключ в GitHub

1. Перейдите: https://github.com/settings/keys
2. Нажмите **"New SSH key"**
3. Title: `Tipit Development`
4. Key: *Вставьте скопированный публичный ключ*
5. Нажмите **"Add SSH key"**

### 0.3 Проверьте подключение к GitHub

```bash
ssh -T git@github.com
# Должно вывести: Hi prefectdinorah! You've successfully authenticated...
```

### 0.4 Инициализируйте Git репозиторий

```bash
cd c:\dev\tipit\tipit

# Инициализируйте Git (если ещё не инициализирован)
git init

# Настройте пользователя
git config user.name "Your Name"
git config user.email "your_email@example.com"

# Добавьте все файлы
git add .

# Первый коммит
git commit -m "Initial commit: TIPIT donation platform with CI/CD"

# Переименуйте ветку в master (если нужно)
git branch -M master

# Добавьте удалённый репозиторий
git remote add origin git@github.com:prefectdinorah/tipit.git

# Запушьте master ветку
git push -u origin master
```

### 0.5 Создайте dev ветку

```bash
# Создайте и переключитесь на dev ветку
git checkout -b dev

# Запушьте dev ветку
git push -u origin dev

# Вернитесь на master
git checkout master
```

**✅ Готово!** Теперь у вас есть две ветки: `master` и `dev` в GitHub

---

## 🎯 Шаг 1: Подготовка сервера (10 минут)

### 1.1 Подключитесь к серверу
```bash
ssh root@45.144.52.219
```

### 1.2 Создайте структуру папок
```bash
mkdir -p /root/tipit/dev
mkdir -p /root/tipit/ift
```

### 1.3 Настройте SSH для GitHub на сервере

```bash
# Сгенерируйте SSH ключ на сервере
ssh-keygen -t ed25519 -C "server-github" -f ~/.ssh/id_ed25519_github_server

# Покажите публичный ключ
cat ~/.ssh/id_ed25519_github_server.pub

# Скопируйте его и добавьте в GitHub:
# https://github.com/settings/keys → New SSH key
```

**Добавьте ключ в ssh-agent:**
```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519_github_server

# Проверьте подключение
ssh -T git@github.com
# Должно вывести: Hi prefectdinorah! You've successfully authenticated...
```

### 1.4 Клонируйте репозиторий для DEV
```bash
cd /root/tipit/dev
git clone -b dev git@github.com:prefectdinorah/tipit.git .
```

### 1.5 Клонируйте репозиторий для IFT (тестовое окружение)
```bash
cd /root/tipit/ift
git clone -b master git@github.com:prefectdinorah/tipit.git .
```

### 1.6 Настройте .env для DEV
```bash
cd /root/tipit/dev
nano .env
```

Вставьте (замените данные на свои):
```env
# Общая БД для обоих окружений (пока)
DATABASE_URL="postgresql://tipit_user:password@45.144.52.58:5432/tipit?schema=public"
MONGODB_URI="mongodb://tipit_user:password@45.144.52.58:27017/tipit"

# Уникальный секрет для dev
SESSION_SECRET="dev-secret-change-me-use-openssl-rand"

# Настройки окружения
NODE_ENV=development
PORT=3001
NEXT_PUBLIC_APP_URL="http://45.144.52.219:3001"
```

### 1.7 Настройте .env для IFT (тестовое окружение)
```bash
cd /root/tipit/ift
nano .env
```

Вставьте (замените данные на свои):
```env
# Общая БД для обоих окружений (пока)
DATABASE_URL="postgresql://tipit_user:password@45.144.52.58:5432/tipit?schema=public"
MONGODB_URI="mongodb://tipit_user:password@45.144.52.58:27017/tipit"

# Уникальный секрет для IFT
SESSION_SECRET="ift-secret-change-me-use-openssl-rand"

# Настройки окружения
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_APP_URL="http://45.144.52.219"
```

**💡 Совет:** Сгенерируйте безопасные секреты:
```bash
openssl rand -base64 32
```

### 1.8 Установите и соберите DEV
```bash
cd /root/tipit/dev
npm install
npm run prisma:generate
npm run prisma:migrate
npm run build
```

### 1.9 Установите и соберите IFT
```bash
cd /root/tipit/ift
npm install
npm run prisma:generate
# НЕ запускаем migrate здесь - БД уже мигрирована в DEV
npm run build
```

### 1.10 Настройте Nginx

**Скопируйте конфиги:**
```bash
sudo cp /root/tipit/dev/nginx/tipit-staging.conf /etc/nginx/sites-available/
sudo cp /root/tipit/ift/nginx/tipit-production.conf /etc/nginx/sites-available/
```

**Активируйте конфиги:**
```bash
sudo ln -s /etc/nginx/sites-available/tipit-staging.conf /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/tipit-production.conf /etc/nginx/sites-enabled/
```

**Проверьте и перезапустите:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 1.11 Запустите через PM2
```bash
# DEV окружение
cd /root/tipit/dev
pm2 start npm --name "tipit-dev" -- start -- -p 3001

# IFT окружение (тестовое)
cd /root/tipit/ift
pm2 start npm --name "tipit-ift" -- start -- -p 3000

# Сохраните конфигурацию PM2
pm2 save

# Настройте автозапуск при перезагрузке сервера
pm2 startup
# Выполните команду, которую выдаст PM2 (скопируйте и запустите)
```

---

## 🔐 Шаг 2: Настройка GitHub Secrets (5 минут)

### 2.1 Сгенерируйте SSH ключ (на локальном компьютере)

**Windows PowerShell:**
```powershell
ssh-keygen -t ed25519 -C "github-actions-tipit" -f ~/.ssh/tipit_deploy

# Скопируйте приватный ключ
Get-Content ~/.ssh/tipit_deploy | clip

# Покажите публичный ключ
Get-Content ~/.ssh/tipit_deploy.pub
```

**Linux/Mac:**
```bash
ssh-keygen -t ed25519 -C "github-actions-tipit" -f ~/.ssh/tipit_deploy

# Скопируйте приватный ключ
cat ~/.ssh/tipit_deploy

# Покажите публичный ключ
cat ~/.ssh/tipit_deploy.pub
```

### 2.2 Добавьте публичный ключ на сервер
```bash
# На сервере 45.144.52.219
echo "ssh-ed25519 AAAA... github-actions-tipit" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### 2.3 Проверьте SSH подключение
```bash
# С локального компьютера
ssh -i ~/.ssh/tipit_deploy root@45.144.52.219
# Должно подключиться без пароля!
```

### 2.4 Добавьте Secrets в GitHub

Перейдите: `https://github.com/prefectdinorah/tipit/settings/secrets/actions`

Нажмите **"New repository secret"** и добавьте:

| Name | Value |
|------|-------|
| `SERVER_HOST` | `45.144.52.219` |
| `SERVER_USER` | `root` |
| `SERVER_SSH_KEY` | *Весь приватный ключ из ~/.ssh/tipit_deploy* |

**⚠️ Важно:** `SERVER_SSH_KEY` должен включать строки:
```
-----BEGIN OPENSSH PRIVATE KEY-----
...весь ключ...
-----END OPENSSH PRIVATE KEY-----
```

---

## 🚀 Шаг 3: Первый деплой (3 минуты)

### Тест staging (DEV):
```bash
git checkout dev

# Сделайте тестовое изменение
echo "# CI/CD Test - Staging" >> README.md
git add .
git commit -m "test: staging deploy"
git push origin dev
```

**Следите за деплоем:**
- Перейдите: `https://github.com/prefectdinorah/tipit/actions`
- Откройте workflow: `Deploy to Staging`
- Наблюдайте за логами выполнения

### Тест IFT (тестовое окружение):
```bash
git checkout master

# Смержите изменения из dev
git merge dev

# Сделайте тестовое изменение для IFT
echo "# CI/CD Test - IFT" >> README.md
git add .
git commit -m "test: IFT deploy"
git push origin master
```

**Следите за деплоем:**
- Откройте workflow: `Deploy to IFT`
- Проверьте что деплой прошёл успешно

---

## ✅ Шаг 4: Проверка работы (2 минуты)

### На сервере:
```bash
ssh root@45.144.52.219
pm2 status

# Должно показать:
# ┌─────┬──────────┬─────────┬─────────┬──────────┐
# │ id  │ name     │ status  │ cpu     │ memory   │
# ├─────┼──────────┼─────────┼─────────┼──────────┤
# │ 0   │ tipit-dev│ online  │ 0%      │ 150MB    │
# │ 1   │ tipit-ift│ online  │ 0%      │ 150MB    │
# └─────┴──────────┴─────────┴─────────┴──────────┘
```

### В браузере:
- **DEV (Staging):** http://45.144.52.219:3001
- **IFT (Testing):** http://45.144.52.219:3000

### Проверьте логи:
```bash
# Логи DEV окружения
pm2 logs tipit-dev --lines 20

# Логи IFT окружения
pm2 logs tipit-ift --lines 20

# Nginx логи
sudo tail -f /var/log/nginx/tipit-staging-access.log
sudo tail -f /var/log/nginx/tipit-production-access.log
```

---

## 🔄 Ежедневная работа

### Типичный workflow разработки:

```bash
# 1. Работаете в dev ветке
git checkout dev

# 2. Пишете код, делаете изменения
# ...

# 3. Коммитите и пушите
git add .
git commit -m "feat: добавил новую фичу"
git push origin dev
# 🎉 Автоматический деплой на DEV (staging) - порт 3001!

# 4. Тестируете на staging окружении
# Откройте: http://45.144.52.219:3001
# Проверьте что всё работает правильно

# 5. Всё работает отлично? Деплоим в IFT
git checkout master
git merge dev
git push origin master
# 🎉 Автоматический деплой на IFT (testing) - порт 3000!

# 6. Финальное тестирование на IFT
# Откройте: http://45.144.52.219:3000
# Проверьте в боевом окружении
```

### Откат изменений (если что-то пошло не так):

```bash
# Откатить последний коммит (локально)
git revert HEAD
git push origin dev

# Или принудительно откатить на предыдущую версию
git reset --hard HEAD~1
git push origin dev --force  # Осторожно!
```

---

## 🐛 Быстрое решение проблем

### Деплой не запустился?
1. Проверьте GitHub Secrets
2. Проверьте что SSH ключ работает
3. Посмотрите логи в GitHub Actions

### PM2 процесс упал?
```bash
# Перезапустить конкретное окружение
pm2 restart tipit-dev
pm2 restart tipit-ift

# Посмотреть ошибки
pm2 logs tipit-dev --err
pm2 logs tipit-ift --err
```

### Nginx 502?
```bash
pm2 status
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

---

## 📚 Полезные ссылки

- 📖 Полная инструкция: `CICD-README.md`
- 🔐 Настройка Secrets: `.github/SECRETS-SETUP.md`
- ⚡ Шпаргалка команд: `QUICK-COMMANDS.md`
- 🚀 Детальный гайд: `CICD-SETUP.md`

---

## ✅ Финальный чеклист

### Локально:
- [ ] SSH ключ для GitHub создан и добавлен
- [ ] Git репозиторий инициализирован
- [ ] Ветка master запушена в GitHub
- [ ] Ветка dev создана и запушена
- [ ] Все CI/CD файлы закоммичены

### На сервере:
- [ ] Папки созданы (`/root/tipit/dev`, `/root/tipit/ift`)
- [ ] SSH ключ для GitHub настроен на сервере
- [ ] Репозитории склонированы из GitHub
- [ ] `.env` файлы настроены (с общей БД)
- [ ] Зависимости установлены (`npm install`)
- [ ] Приложения собраны (`npm run build`)
- [ ] Nginx конфиги скопированы и активированы
- [ ] Nginx перезапущен без ошибок
- [ ] PM2 процессы запущены (`tipit-dev`, `tipit-ift`)
- [ ] PM2 автозапуск настроен (`pm2 startup`)

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
