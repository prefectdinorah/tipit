# ✅ Финальный чеклист настройки CI/CD для TIPIT

## 📋 Обзор изменений

Все файлы обновлены в соответствии с вашими требованиями:

✅ **Ветка:** `master` вместо `main`  
✅ **Окружение:** IFT (testing) вместо production  
✅ **Репозиторий:** `git@github.com:prefectdinorah/tipit.git` (SSH)  
✅ **SSH ключи:** Инструкции добавлены  
✅ **База данных:** Единая БД `tipit` для обоих окружений  

---

## 📂 Обновлённые файлы

### Workflows (GitHub Actions)
- ✅ `.github/workflows/deploy-staging.yml` → использует `dev` ветку, деплоит на порт 3001
- ✅ `.github/workflows/deploy-production.yml` → использует `master` ветку, деплоит на порт 3000, процесс `tipit-ift`

### Документация
- ✅ `CICD-QUICKSTART.md` → добавлен **Step 0** с SSH setup, обновлены все ссылки на master/IFT, единая БД
- ✅ `CICD-README.md` → полная переписанная инструкция с master ветка, IFT, SSH keys, единая БД
- ✅ `CICD-FILES-OVERVIEW.md` → обновлены все описания, добавлен GIT-FIRST-PUSH.md
- ✅ `QUICK-COMMANDS.md` → полностью обновлённая шпаргалка команд
- ✅ `GIT-FIRST-PUSH.md` → **НОВЫЙ** гид по первому push в GitHub с SSH setup

### Конфигурация
- ✅ `.env.example` → обновлён для единой БД `tipit` с комментариями

---

## 🚀 Порядок действий (начните отсюда!)

### 1. Первый push в GitHub (если ещё не сделан)

📖 **Читайте:** [`GIT-FIRST-PUSH.md`](./GIT-FIRST-PUSH.md)

```bash
# Быстро:
ssh-keygen -t ed25519 -C "your_email@example.com" -f ~/.ssh/id_ed25519_github
# Добавьте ключ на GitHub: https://github.com/settings/keys

git init
git add .
git commit -m "Initial commit with CI/CD setup"
git branch -M master
git remote add origin git@github.com:prefectdinorah/tipit.git
git push -u origin master

git checkout -b dev
git push -u origin dev
```

### 2. Настройка CI/CD за 20 минут

📖 **Читайте:** [`CICD-QUICKSTART.md`](./CICD-QUICKSTART.md)

**Основные шаги:**
1. Настроить сервер (папки, клонирование, .env, PM2, Nginx)
2. Создать SSH ключи для деплоя
3. Добавить GitHub Secrets
4. Тестовый деплой

### 3. Детальная инструкция (если нужны подробности)

📖 **Читайте:** [`CICD-README.md`](./CICD-README.md)

- Полная архитектура
- Пошаговая настройка
- Troubleshooting
- Мониторинг

---

## 🔑 Критически важное

### SSH ключи

**Для GitHub (на локальной машине И на сервере):**
```bash
ssh-keygen -t ed25519 -C "github@tipit" -f ~/.ssh/id_ed25519_github
cat ~/.ssh/id_ed25519_github.pub
# → Добавить на https://github.com/settings/keys
```

**Для GitHub Actions деплоя (на локальной машине):**
```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/tipit_deploy
ssh-copy-id -i ~/.ssh/tipit_deploy.pub root@45.144.52.219
cat ~/.ssh/tipit_deploy  # → GitHub Secret: SERVER_SSH_KEY
```

### GitHub Secrets (обязательно!)

| Название | Значение | Где взять |
|----------|----------|-----------|
| `SERVER_HOST` | `45.144.52.219` | IP сервера |
| `SERVER_USER` | `root` | SSH пользователь |
| `SERVER_SSH_KEY` | (приватный ключ) | `cat ~/.ssh/tipit_deploy` |

**Добавить здесь:**  
GitHub → Repository → Settings → Secrets and variables → Actions → New repository secret

### .env файлы на сервере

**⚠️ ВАЖНО:** Используется **ОДНА база данных** `tipit` для обоих окружений

`/root/tipit/dev/.env`:
```env
DATABASE_URL="postgresql://user:pass@45.144.52.58:5432/tipit?schema=public"
MONGODB_URI="mongodb://user:pass@45.144.52.58:27017/tipit"
NODE_ENV=development
PORT=3001
NEXTAUTH_SECRET=dev_secret_min_32_characters_long_12345678
```

`/root/tipit/ift/.env`:
```env
DATABASE_URL="postgresql://user:pass@45.144.52.58:5432/tipit?schema=public"
MONGODB_URI="mongodb://user:pass@45.144.52.58:27017/tipit"
NODE_ENV=production
PORT=3000
NEXTAUTH_SECRET=ift_secret_min_32_characters_long_87654321
```

---

## 📊 Архитектура

```
Local Development
    ↓
git push origin dev → GitHub Actions → 45.144.52.219:/root/tipit/dev (port 3001) → tipit-dev
    ↓
Testing on Staging
    ↓
git push origin master → GitHub Actions → 45.144.52.219:/root/tipit/ift (port 3000) → tipit-ift
```

**Базы данных:**
- PostgreSQL: `45.144.52.58:5432/tipit`
- MongoDB: `45.144.52.58:27017/tipit`

**Процессы PM2:**
- `tipit-dev` → порт 3001 (staging)
- `tipit-ift` → порт 3000 (IFT/testing)

---

## ✅ Чеклист перед первым деплоем

### На локальной машине
- [ ] SSH ключ для GitHub создан и добавлен на GitHub
- [ ] SSH ключ для деплоя создан
- [ ] Публичный ключ деплоя добавлен на сервер
- [ ] Репозиторий инициализирован: `git init`
- [ ] Ветка master создана: `git branch -M master`
- [ ] Remote добавлен: `git remote add origin git@github.com:prefectdinorah/tipit.git`
- [ ] Код запушен: `git push -u origin master`
- [ ] Dev ветка создана и запушена: `git checkout -b dev && git push -u origin dev`

### В GitHub
- [ ] Репозиторий `prefectdinorah/tipit` создан
- [ ] Ветки `master` и `dev` существуют
- [ ] GitHub Actions включен (Settings → Actions → General → Allow all actions)
- [ ] 3 Secrets добавлены: `SERVER_HOST`, `SERVER_USER`, `SERVER_SSH_KEY`
- [ ] Workflows файлы закоммичены в `.github/workflows/`

### На сервере 45.144.52.219
- [ ] SSH ключ для GitHub создан на сервере
- [ ] Публичный ключ сервера добавлен на GitHub
- [ ] Тест подключения: `ssh -T git@github.com` ✅
- [ ] Папки созданы: `/root/tipit/dev` и `/root/tipit/ift`
- [ ] Репозитории склонированы:
  - `cd /root/tipit/dev && git clone -b dev git@github.com:prefectdinorah/tipit.git .`
  - `cd /root/tipit/ift && git clone -b master git@github.com:prefectdinorah/tipit.git .`
- [ ] `.env` файлы созданы и настроены (единая БД!)
- [ ] Зависимости установлены: `npm install` в обеих папках
- [ ] Build выполнен: `npm run build` в обеих папках
- [ ] Nginx конфиги скопированы и активированы
- [ ] Nginx протестирован: `sudo nginx -t` ✅
- [ ] Nginx перезагружен: `sudo systemctl reload nginx`
- [ ] PM2 процессы запущены:
  - `pm2 start npm --name "tipit-dev" -- start -- -p 3001`
  - `pm2 start npm --name "tipit-ift" -- start -- -p 3000`
- [ ] PM2 конфигурация сохранена: `pm2 save && pm2 startup`

### Проверка работы
- [ ] Staging доступен: `curl http://45.144.52.219:3001` ✅
- [ ] IFT доступен: `curl http://45.144.52.219:3000` ✅
- [ ] PM2 показывает оба процесса online: `pm2 list` ✅
- [ ] Тестовый деплой на staging:
  ```bash
  git checkout dev
  echo "# CI/CD Test" >> README.md
  git add . && git commit -m "Test staging deploy"
  git push origin dev
  ```
  - [ ] GitHub Actions workflow успешно выполнен ✅
  - [ ] Изменения видны на http://45.144.52.219:3001 ✅

- [ ] Тестовый деплой на IFT:
  ```bash
  git checkout master
  git merge dev
  git push origin master
  ```
  - [ ] GitHub Actions workflow успешно выполнен ✅
  - [ ] Изменения видны на http://45.144.52.219:3000 ✅

---

## 🎉 Готово к использованию!

После выполнения всех пунктов чеклиста:

✅ **Push в dev → автодеплой на staging (3001)**  
✅ **Push в master → автодеплой на IFT (3000)**  
✅ **Никаких ручных действий на сервере!**

---

## 📚 Быстрая навигация по документации

| Документ | Когда использовать |
|----------|-------------------|
| **[GIT-FIRST-PUSH.md](GIT-FIRST-PUSH.md)** | Первый push в GitHub, SSH setup |
| **[CICD-QUICKSTART.md](CICD-QUICKSTART.md)** | Быстрая настройка за 20 минут |
| [CICD-README.md](CICD-README.md) | Детальная инструкция, troubleshooting |
| [CICD-FILES-OVERVIEW.md](CICD-FILES-OVERVIEW.md) | Обзор всех файлов CI/CD |
| [QUICK-COMMANDS.md](QUICK-COMMANDS.md) | Шпаргалка команд |
| [.github/SECRETS-SETUP.md](.github/SECRETS-SETUP.md) | Настройка GitHub Secrets |

---

## 🔧 Команды для troubleshooting

```bash
# Проверить PM2
pm2 list
pm2 logs tipit-dev --lines 50
pm2 logs tipit-ift --lines 50

# Проверить Nginx
sudo nginx -t
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log

# Проверить порты
netstat -tulpn | grep :3001
netstat -tulpn | grep :3000

# Проверить БД
psql -h 45.144.52.58 -U user -d tipit
mongosh mongodb://user:pass@45.144.52.58:27017/tipit

# Перезапустить всё
pm2 restart all
sudo systemctl reload nginx
```

---

## 🚨 Экстренная помощь

**Если что-то сломалось:**

1. Читайте **Troubleshooting** в [CICD-README.md](./CICD-README.md#-troubleshooting)
2. Проверяйте логи:
   - GitHub Actions: Repository → Actions
   - PM2: `pm2 logs`
   - Nginx: `sudo tail -f /var/log/nginx/error.log`
3. Используйте [QUICK-COMMANDS.md](./QUICK-COMMANDS.md) для быстрого доступа к командам

---

**Всё настроено! Удачи в разработке!** 🎊
