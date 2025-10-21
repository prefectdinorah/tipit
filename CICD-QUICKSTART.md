# 🚀 CI/CD Setup Guide для TIPIT# 🚀 CI/CD Setup Guide для TIPIT



## ✅ Что уже сделано## ✅ Что уже сделано



- ✅ Репозиторий создан: `git@github.com:prefectdinorah/tipit.git`- ✅ Репозиторий создан: `git@github.com:prefectdinorah/tipit.git`

- ✅ Ветки `master` и `dev` созданы и запушены- ✅ Ветки `master` и `dev` созданы и запушены

- ✅ Nginx конфиги скопированы и активированы  - ✅ Nginx конфиги скопированы и активированы

- ✅ SSH ключ для GitHub настроен и прокинут- ✅ SSH ключ для GitHub настроен и прокинут



------



## 📋 Что нужно сделать## 📋 Что получится в результате



1. ✅ Исправить зависимости (vaul для React 19)После выполнения оставшихся шагов:

2. Настроить .env файлы на сервере- ✅ Автоматический деплой при push в dev → staging (порт 3001)

3. Установить зависимости с `--legacy-peer-deps`- ✅ Автоматический деплой при push в master → IFT (порт 3000)

4. Собрать приложения- ✅ PM2 управление процессами

5. Запустить через PM2- ✅ Единая база данных для обоих окружений

6. Настроить GitHub Secrets

7. Протестировать автодеплой---



---## � Шаг 1: Исправление зависимостей (3 минуты)



## 🔧 Шаг 1: Обновление кода (2 минуты)### 1.1 На локальной машине обновите package.json



### На локальной машине:Я уже обновил `vaul` до версии 1.1.1 (совместима с React 19).



```bash**Закоммитьте изменения:**

cd c:\dev\tipit\tipit```bash

cd c:\dev\tipit\tipit

# Закоммитьте обновления (vaul 1.1.1 + .gitignore)git add package.json .gitignore

git add package.json .gitignoregit commit -m "fix: update vaul to 1.1.1 for React 19 compatibility, update .gitignore"

git commit -m "fix: update vaul to 1.1.1 for React 19, update .gitignore"git push origin dev

git push origin master

# Запушьте в обе ветки```

git checkout dev

git push origin dev### 1.2 На сервере обновите код



git checkout master  ```bash

git merge devssh root@45.144.52.219

git push origin master

```# DEV окружение

cd /root/tipit/dev

### На сервере обновите код:git pull origin dev



```bash# IFT окружение

ssh root@45.144.52.219cd /root/tipit/ift

git pull origin master

# DEV```

cd /root/tipit/dev

git pull origin dev---



# IFT## 🎯 Шаг 2: Установка и настройка на сервере (10 минут)

cd /root/tipit/ift```bash

git pull origin mastercd /root/tipit/dev

```nano .env

```

---

Вставьте (замените данные на свои):

## 🎯 Шаг 2: Настройка .env файлов (5 минут)```env

# Общая БД для обоих окружений (пока)

### 2.1 DEV окружениеDATABASE_URL="postgresql://tipit_user:password@45.144.52.58:5432/tipit?schema=public"

MONGODB_URI="mongodb://tipit_user:password@45.144.52.58:27017/tipit"

```bash

cd /root/tipit/dev# Уникальный секрет для dev

nano .envSESSION_SECRET="dev-secret-change-me-use-openssl-rand"

```

# Настройки окружения

**Вставьте (замените на свои данные):**NODE_ENV=development

PORT=3001

```envNEXT_PUBLIC_APP_URL="http://45.144.52.219:3001"

# База данных PostgreSQL (общая для dev и ift)```

DATABASE_URL="postgresql://tipit_user:your_password@45.144.52.58:5432/tipit?schema=public"

### 1.7 Настройте .env для IFT (тестовое окружение)

# MongoDB (общая для dev и ift)```bash

MONGODB_URI="mongodb://tipit_user:your_password@45.144.52.58:27017/tipit"cd /root/tipit/ift

nano .env

# NextAuth (уникальный секрет для DEV!)```

NEXTAUTH_URL="http://45.144.52.219:3001"

NEXTAUTH_SECRET="dev_secret_change_me_use_openssl_rand_base64_32"Вставьте (замените данные на свои):

```env

# App# Общая БД для обоих окружений (пока)

NODE_ENV=developmentDATABASE_URL="postgresql://tipit_user:password@45.144.52.58:5432/tipit?schema=public"

PORT=3001MONGODB_URI="mongodb://tipit_user:password@45.144.52.58:27017/tipit"

NEXT_PUBLIC_APP_URL="http://45.144.52.219:3001"

```# Уникальный секрет для IFT

SESSION_SECRET="ift-secret-change-me-use-openssl-rand"

**💡 Сгенерируйте безопасный секрет:**

```bash# Настройки окружения

openssl rand -base64 32NODE_ENV=production

```PORT=3000

NEXT_PUBLIC_APP_URL="http://45.144.52.219"

### 2.2 IFT окружение```



```bash**💡 Совет:** Сгенерируйте безопасные секреты:

cd /root/tipit/ift```bash

nano .envopenssl rand -base64 32

``````



**Вставьте (замените на свои данные):**### 1.8 Установите и соберите DEV

```bash

```envcd /root/tipit/dev

# База данных PostgreSQL (общая для dev и ift)npm install

DATABASE_URL="postgresql://tipit_user:your_password@45.144.52.58:5432/tipit?schema=public"npm run prisma:generate

npm run prisma:migrate

# MongoDB (общая для dev и ift)npm run build

MONGODB_URI="mongodb://tipit_user:your_password@45.144.52.58:27017/tipit"```



# NextAuth (уникальный секрет для IFT!)### 1.9 Установите и соберите IFT

NEXTAUTH_URL="http://45.144.52.219:3000"```bash

NEXTAUTH_SECRET="ift_secret_different_from_dev_openssl_rand"cd /root/tipit/ift

npm install

# Appnpm run prisma:generate

NODE_ENV=production# НЕ запускаем migrate здесь - БД уже мигрирована в DEV

PORT=3000npm run build

NEXT_PUBLIC_APP_URL="http://45.144.52.219:3000"```

```

### 1.10 Настройте Nginx

---

**Скопируйте конфиги:**

## 📦 Шаг 3: Установка и сборка (10 минут)```bash

sudo cp /root/tipit/dev/nginx/tipit-staging.conf /etc/nginx/sites-available/

### 3.1 DEV окружениеsudo cp /root/tipit/ift/nginx/tipit-production.conf /etc/nginx/sites-available/

```

```bash

cd /root/tipit/dev**Активируйте конфиги:**

```bash

# Установка с --legacy-peer-deps (из-за React 19)sudo ln -s /etc/nginx/sites-available/tipit-staging.conf /etc/nginx/sites-enabled/

npm install --legacy-peer-depssudo ln -s /etc/nginx/sites-available/tipit-production.conf /etc/nginx/sites-enabled/

```

# Генерация Prisma Client

npm run prisma:generate**Проверьте и перезапустите:**

```bash

# Применение миграций БДsudo nginx -t

npm run prisma:migratesudo systemctl reload nginx

```

# Сборка приложения

npm run build### 1.11 Запустите через PM2

``````bash

# DEV окружение

### 3.2 IFT окружениеcd /root/tipit/dev

pm2 start npm --name "tipit-dev" -- start -- -p 3001

```bash

cd /root/tipit/ift# IFT окружение (тестовое)

cd /root/tipit/ift

# Установкаpm2 start npm --name "tipit-ift" -- start -- -p 3000

npm install --legacy-peer-deps

# Сохраните конфигурацию PM2

# Генерация Prisma Clientpm2 save

npm run prisma:generate

# Настройте автозапуск при перезагрузке сервера

# НЕ запускаем migrate (БД уже мигрирована в DEV!)pm2 startup

# Выполните команду, которую выдаст PM2 (скопируйте и запустите)

# Сборка приложения```

npm run build

```---



---## 🔐 Шаг 2: Настройка GitHub Secrets (5 минут)



## 🚀 Шаг 4: Запуск через PM2 (3 минуты)### 2.1 Сгенерируйте SSH ключ (на локальном компьютере)



```bash**Windows PowerShell:**

# DEV окружение (порт 3001)```powershell

cd /root/tipit/devssh-keygen -t ed25519 -C "github-actions-tipit" -f ~/.ssh/tipit_deploy

pm2 start npm --name "tipit-dev" -- start -- -p 3001

# Скопируйте приватный ключ

# IFT окружение (порт 3000)Get-Content ~/.ssh/tipit_deploy | clip

cd /root/tipit/ift

pm2 start npm --name "tipit-ift" -- start -- -p 3000# Покажите публичный ключ

Get-Content ~/.ssh/tipit_deploy.pub

# Сохранить конфигурацию```

pm2 save

**Linux/Mac:**

# Настроить автозапуск```bash

pm2 startupssh-keygen -t ed25519 -C "github-actions-tipit" -f ~/.ssh/tipit_deploy

# Выполните команду, которую выдаст PM2

```# Скопируйте приватный ключ

cat ~/.ssh/tipit_deploy

### Проверка:

# Покажите публичный ключ

```bashcat ~/.ssh/tipit_deploy.pub

pm2 status```



# Должно показать:### 2.2 Добавьте публичный ключ на сервер

# ┌─────┬──────────┬─────────┬─────────┐```bash

# │ id  │ name     │ status  │ cpu     │# На сервере 45.144.52.219

# ├─────┼──────────┼─────────┼─────────┤echo "ssh-ed25519 AAAA... github-actions-tipit" >> ~/.ssh/authorized_keys

# │ 0   │ tipit-dev│ online  │ 0%      │chmod 600 ~/.ssh/authorized_keys

# │ 1   │ tipit-ift│ online  │ 0%      │```

# └─────┴──────────┴─────────┴─────────┘

### 2.3 Проверьте SSH подключение

# Проверьте логи```bash

pm2 logs tipit-dev --lines 20# С локального компьютера

pm2 logs tipit-ift --lines 20ssh -i ~/.ssh/tipit_deploy root@45.144.52.219

```# Должно подключиться без пароля!

```

### Тест в браузере:

### 2.4 Добавьте Secrets в GitHub

- **DEV:** http://45.144.52.219:3001

- **IFT:** http://45.144.52.219:3000Перейдите: `https://github.com/prefectdinorah/tipit/settings/secrets/actions`



---Нажмите **"New repository secret"** и добавьте:



## 🔐 Шаг 5: Настройка GitHub Secrets (5 минут)| Name | Value |

|------|-------|

### 5.1 Создайте SSH ключ для деплоя (на локальной машине)| `SERVER_HOST` | `45.144.52.219` |

| `SERVER_USER` | `root` |

**Windows PowerShell:**| `SERVER_SSH_KEY` | *Весь приватный ключ из ~/.ssh/tipit_deploy* |

```powershell

ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/tipit_deploy**⚠️ Важно:** `SERVER_SSH_KEY` должен включать строки:

```

# Покажите публичный ключ-----BEGIN OPENSSH PRIVATE KEY-----

Get-Content ~/.ssh/tipit_deploy.pub...весь ключ...

-----END OPENSSH PRIVATE KEY-----

# Скопируйте приватный ключ```

Get-Content ~/.ssh/tipit_deploy | clip

```---



**Linux/Mac:**## 🚀 Шаг 3: Первый деплой (3 минуты)

```bash

ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/tipit_deploy### Тест staging (DEV):

```bash

# Покажите публичный ключgit checkout dev

cat ~/.ssh/tipit_deploy.pub

# Сделайте тестовое изменение

# Скопируйте приватный ключecho "# CI/CD Test - Staging" >> README.md

cat ~/.ssh/tipit_deploygit add .

```git commit -m "test: staging deploy"

git push origin dev

### 5.2 Добавьте публичный ключ на сервер```



```bash**Следите за деплоем:**

# На сервере 45.144.52.219- Перейдите: `https://github.com/prefectdinorah/tipit/actions`

echo "ssh-ed25519 AAAA... github-actions" >> ~/.ssh/authorized_keys- Откройте workflow: `Deploy to Staging`

chmod 600 ~/.ssh/authorized_keys- Наблюдайте за логами выполнения

```

### Тест IFT (тестовое окружение):

### 5.3 Проверьте SSH подключение```bash

git checkout master

```bash

# С локальной машины# Смержите изменения из dev

ssh -i ~/.ssh/tipit_deploy root@45.144.52.219git merge dev

# Должно подключиться без пароля!

```# Сделайте тестовое изменение для IFT

echo "# CI/CD Test - IFT" >> README.md

### 5.4 Добавьте Secrets в GitHubgit add .

git commit -m "test: IFT deploy"

**Идите на:** https://github.com/prefectdinorah/tipit/settings/secrets/actionsgit push origin master

```

Нажмите **"New repository secret"** и добавьте:

**Следите за деплоем:**

| Name | Value |- Откройте workflow: `Deploy to IFT`

|------|-------|- Проверьте что деплой прошёл успешно

| `SERVER_HOST` | `45.144.52.219` |

| `SERVER_USER` | `root` |---

| `SERVER_SSH_KEY` | *Весь приватный ключ из ~/.ssh/tipit_deploy* |

## ✅ Шаг 4: Проверка работы (2 минуты)

**⚠️ Важно:** `SERVER_SSH_KEY` должен содержать полный ключ:

```### На сервере:

-----BEGIN OPENSSH PRIVATE KEY-----```bash

...весь ключ...ssh root@45.144.52.219

-----END OPENSSH PRIVATE KEY-----pm2 status

```

# Должно показать:

---# ┌─────┬──────────┬─────────┬─────────┬──────────┐

# │ id  │ name     │ status  │ cpu     │ memory   │

## 🧪 Шаг 6: Тестирование автодеплоя (5 минут)# ├─────┼──────────┼─────────┼─────────┼──────────┤

# │ 0   │ tipit-dev│ online  │ 0%      │ 150MB    │

### Тест DEV (staging):# │ 1   │ tipit-ift│ online  │ 0%      │ 150MB    │

# └─────┴──────────┴─────────┴─────────┴──────────┘

```bash```

git checkout dev

### В браузере:

# Тестовое изменение- **DEV (Staging):** http://45.144.52.219:3001

echo "# CI/CD Test - DEV" >> README.md- **IFT (Testing):** http://45.144.52.219:3000

git add README.md

git commit -m "test: DEV deployment"### Проверьте логи:

git push origin dev```bash

```# Логи DEV окружения

pm2 logs tipit-dev --lines 20

**Следите за деплоем:**

- https://github.com/prefectdinorah/tipit/actions# Логи IFT окружения

- Откройте workflow: "Deploy to Staging"pm2 logs tipit-ift --lines 20

- Проверьте логи выполнения

# Nginx логи

### Тест IFT:sudo tail -f /var/log/nginx/tipit-staging-access.log

sudo tail -f /var/log/nginx/tipit-production-access.log

```bash```

git checkout master

git merge dev---

git push origin master

```## 🔄 Ежедневная работа



**Проверьте:**### Типичный workflow разработки:

- https://github.com/prefectdinorah/tipit/actions

- Workflow: "Deploy to IFT"```bash

# 1. Работаете в dev ветке

---git checkout dev



## ✅ Финальная проверка# 2. Пишете код, делаете изменения

# ...

### На сервере:

# 3. Коммитите и пушите

```bashgit add .

# Статус PM2git commit -m "feat: добавил новую фичу"

pm2 statusgit push origin dev

# 🎉 Автоматический деплой на DEV (staging) - порт 3001!

# Логи

pm2 logs tipit-dev --lines 20# 4. Тестируете на staging окружении

pm2 logs tipit-ift --lines 20# Откройте: http://45.144.52.219:3001

# Проверьте что всё работает правильно

# Nginx

sudo systemctl status nginx# 5. Всё работает отлично? Деплоим в IFT

```git checkout master

git merge dev

### В браузере:git push origin master

# 🎉 Автоматический деплой на IFT (testing) - порт 3000!

- ✅ DEV: http://45.144.52.219:3001

- ✅ IFT: http://45.144.52.219:3000# 6. Финальное тестирование на IFT

# Откройте: http://45.144.52.219:3000

---# Проверьте в боевом окружении

```

## 🔄 Ежедневная работа

### Откат изменений (если что-то пошло не так):

```bash

# 1. Работаете в dev ветке```bash

git checkout dev# Откатить последний коммит (локально)

git revert HEAD

# 2. Делаете изменения, коммититеgit push origin dev

git add .

git commit -m "feat: новая фича"# Или принудительно откатить на предыдущую версию

git push origin devgit reset --hard HEAD~1

# → Автодеплой на DEV (3001)!git push origin dev --force  # Осторожно!

```

# 3. Тестируете на staging

# http://45.144.52.219:3001---



# 4. Всё ОК? Деплоим в IFT## 🐛 Быстрое решение проблем

git checkout master

git merge dev### Деплой не запустился?

git push origin master1. Проверьте GitHub Secrets

# → Автодеплой на IFT (3000)!2. Проверьте что SSH ключ работает

```3. Посмотрите логи в GitHub Actions



---### PM2 процесс упал?

```bash

## 🐛 Troubleshooting# Перезапустить конкретное окружение

pm2 restart tipit-dev

### npm install падает с ошибкой зависимостей?pm2 restart tipit-ift



```bash# Посмотреть ошибки

# Используйте --legacy-peer-depspm2 logs tipit-dev --err

npm install --legacy-peer-depspm2 logs tipit-ift --err

``````



### PM2 процесс не запускается?### Nginx 502?

```bash

```bashpm2 status

# Проверьте логиsudo systemctl status nginx

pm2 logs tipit-dev --err --lines 50sudo tail -f /var/log/nginx/error.log

```

# Проверьте .env

cat /root/tipit/dev/.env---



# Пересоздайте процесс## 📚 Полезные ссылки

pm2 delete tipit-dev

cd /root/tipit/dev- 📖 Полная инструкция: `CICD-README.md`

pm2 start npm --name "tipit-dev" -- start -- -p 3001- 🔐 Настройка Secrets: `.github/SECRETS-SETUP.md`

pm2 save- ⚡ Шпаргалка команд: `QUICK-COMMANDS.md`

```- 🚀 Детальный гайд: `CICD-SETUP.md`



### Nginx 502 Bad Gateway?---



```bash## ✅ Финальный чеклист

# Проверьте PM2

pm2 status  # Должны быть online### Локально:

- [ ] SSH ключ для GitHub создан и добавлен

# Проверьте порты- [ ] Git репозиторий инициализирован

netstat -tulpn | grep :3001- [ ] Ветка master запушена в GitHub

netstat -tulpn | grep :3000- [ ] Ветка dev создана и запушена

- [ ] Все CI/CD файлы закоммичены

# Логи Nginx

sudo tail -f /var/log/nginx/error.log### На сервере:

```- [ ] Папки созданы (`/root/tipit/dev`, `/root/tipit/ift`)

- [ ] SSH ключ для GitHub настроен на сервере

### База данных не подключается?- [ ] Репозитории склонированы из GitHub

- [ ] `.env` файлы настроены (с общей БД)

```bash- [ ] Зависимости установлены (`npm install`)

# Проверьте .env- [ ] Приложения собраны (`npm run build`)

cat /root/tipit/dev/.env | grep DATABASE- [ ] Nginx конфиги скопированы и активированы

- [ ] Nginx перезапущен без ошибок

# Проверьте доступ с сервера app к серверу БД- [ ] PM2 процессы запущены (`tipit-dev`, `tipit-ift`)

psql -h 45.144.52.58 -U tipit_user -d tipit- [ ] PM2 автозапуск настроен (`pm2 startup`)

mongosh mongodb://tipit_user:pass@45.144.52.58:27017/tipit

```### В GitHub:

- [ ] Repository: `git@github.com:prefectdinorah/tipit.git`

---- [ ] Ветки: `master` и `dev` существуют

- [ ] GitHub Secrets добавлены (SERVER_HOST, SERVER_USER, SERVER_SSH_KEY)

## 📚 Дополнительно- [ ] Workflows файлы в `.github/workflows/`



- 📖 Детальная инструкция: [CICD-README.md](./CICD-README.md)### Проверка работы:

- ⚡ Шпаргалка команд: [QUICK-COMMANDS.md](./QUICK-COMMANDS.md)  - [ ] Тестовый деплой dev → staging прошёл успешно

- 🔑 Первый push в GitHub: [GIT-FIRST-PUSH.md](./GIT-FIRST-PUSH.md)- [ ] Тестовый деплой master → IFT прошёл успешно

- [ ] DEV доступен: http://45.144.52.219:3001

---- [ ] IFT доступен: http://45.144.52.219:3000

- [ ] PM2 показывает оба процесса online

## ✅ Чеклист- [ ] Логи не содержат критических ошибок



- [ ] package.json обновлён (vaul 1.1.1)**🎉 Поздравляем! CI/CD полностью настроен и работает!**

- [ ] Код запушен в dev и master

- [ ] .env файлы настроены на сервере**Теперь:**

- [ ] npm install --legacy-peer-deps выполнен- Push в **dev** → автодеплой на staging (порт 3001)

- [ ] npm run build выполнен- Push в **master** → автодеплой на IFT (порт 3000)

- [ ] PM2 процессы запущены и online

- [ ] GitHub Secrets добавлены (3 шт)**Больше никаких ручных действий на сервере!** 🚀

- [ ] Тестовый деплой dev успешен
- [ ] Тестовый деплой master успешен
- [ ] DEV доступен: http://45.144.52.219:3001
- [ ] IFT доступен: http://45.144.52.219:3000

---

**🎉 Готово! CI/CD работает!**

**Push в dev → автодеплой на 3001**  
**Push в master → автодеплой на 3000**

🚀
