# 🎁 TIPIT - Donation Platform для Стримеров

Платформа для приёма донатов с интеграцией музыкальных треков.

## 🚀 Быстрый старт

1. **Локальная разработка:**
   ```bash
   npm install --legacy-peer-deps
   npm run dev
   ```

2. **Деплой на DEV:**
   ```bash
   git push origin dev
   # → http://45.144.52.219:3001
   ```

3. **Первый запуск на сервере:**
   - См. [CICD-QUICKSTART.md](CICD-QUICKSTART.md)

## 📚 Документация

- 🚀 [CICD-QUICKSTART.md](CICD-QUICKSTART.md) - Быстрый старт DEV
- ⚡ [QUICK-COMMANDS.md](QUICK-COMMANDS.md) - Шпаргалка команд
- 🔧 [FIX-INSTRUCTIONS.md](FIX-INSTRUCTIONS.md) - Исправление ошибок

## 🛠 Технологии

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **БД:** PostgreSQL (Prisma) + MongoDB (Mongoose)
- **Deployment:** PM2, Nginx
- **CI/CD:** GitHub (ручной деплой)

## 📊 Архитектура БД

**PostgreSQL (Prisma):**
- Users, StreamerSettings, Sessions
- PaymentMethods, DonationGoals, Statistics

**MongoDB (Mongoose):**
- Donations (с сообщениями и треками)

## 🌐 Окружения

- **DEV:** http://45.144.52.219:3001 (порт 3001)
- **IFT:** http://45.144.52.219:3000 (пока не настроено)

## 🔑 Основные команды

```bash
# Установка зависимостей
npm install --legacy-peer-deps

# Генерация Prisma Client
npm run prisma:generate

# Применение миграций
npm run prisma:migrate

# Сборка
npm run build

# Запуск (production)
npm start

# Запуск (dev)
npm run dev
```

## 🚨 Troubleshooting

См. [FIX-INSTRUCTIONS.md](FIX-INSTRUCTIONS.md)

---

**Репозиторий:** `git@github.com:prefectdinorah/tipit.git`
