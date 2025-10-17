# 🚀 CI/CD Documentation для TIPIT

Добро пожаловать в документацию автоматического деплоя!

**Репозиторий:** `git@github.com:prefectdinorah/tipit.git`

---

## 📚 Начало работы

### 🔑 **Шаг 0: Первый push в GitHub**

**→ Читайте:** [`GIT-FIRST-PUSH.md`](../GIT-FIRST-PUSH.md)

Если ваш код ещё не на GitHub:
- Настройка SSH ключей для GitHub
- Инициализация репозитория
- Первый push в `git@github.com:prefectdinorah/tipit.git`
- Создание ветки `dev`

### ⚡ **Шаг 1: Быстрая настройка CI/CD (20 минут)**

**→ Читайте:** [`CICD-QUICKSTART.md`](../CICD-QUICKSTART.md)

Минимальная настройка для запуска автодеплоя:
- Подготовка сервера
- GitHub Secrets
- Первый деплой

### 📖 **Шаг 2: Детальная инструкция (при необходимости)**

**→ Читайте:** [`CICD-README.md`](../CICD-README.md)

Полная документация:
- Архитектура системы
- Пошаговая настройка
- Troubleshooting
- Мониторинг

---

## 🎯 Быстрая навигация

| Документ | Описание |
|----------|----------|
| **[GIT-FIRST-PUSH.md](../GIT-FIRST-PUSH.md)** | 🔑 Первый push в GitHub + SSH setup |
| **[CICD-QUICKSTART.md](../CICD-QUICKSTART.md)** | ⚡ Быстрый старт за 20 минут |
| **[CICD-FINAL-CHECKLIST.md](../CICD-FINAL-CHECKLIST.md)** | ✅ Полный чеклист настройки |
| [CICD-README.md](../CICD-README.md) | 📖 Детальная инструкция |
| [CICD-FILES-OVERVIEW.md](../CICD-FILES-OVERVIEW.md) | 📋 Обзор всех файлов |
| [QUICK-COMMANDS.md](../QUICK-COMMANDS.md) | ⚡ Шпаргалка команд |
| [SECRETS-SETUP.md](./SECRETS-SETUP.md) | 🔐 Настройка GitHub Secrets |

---

## 🏗️ Архитектура

```
GitHub Repository: git@github.com:prefectdinorah/tipit.git
├── master branch → IFT окружение (port 3000)
└── dev branch    → Staging окружение (port 3001)
         ↓
   GitHub Actions
         ↓
Server: 45.144.52.219
├── /root/tipit/ift (master, 3000, tipit-ift)
└── /root/tipit/dev (dev, 3001, tipit-dev)
         ↓
Databases: 45.144.52.58
├── PostgreSQL: tipit
└── MongoDB: tipit
```

---

## 🔄 Workflows

### [deploy-staging.yml](workflows/deploy-staging.yml)
- **Триггер:** Push в ветку `dev`
- **Деплоит на:** `/root/tipit/dev` (порт 3001)
- **PM2 процесс:** `tipit-dev`

### [deploy-production.yml](workflows/deploy-production.yml)
- **Триггер:** Push в ветку `master`
- **Деплоит на:** `/root/tipit/ift` (порт 3000)
- **PM2 процесс:** `tipit-ift`

---

## 🔐 GitHub Secrets

**Обязательно настроить 3 секрета:**

| Название | Значение | Описание |
|----------|----------|----------|
| `SERVER_HOST` | `45.144.52.219` | IP адрес сервера |
| `SERVER_USER` | `root` | SSH пользователь |
| `SERVER_SSH_KEY` | (приватный ключ) | SSH ключ для деплоя |

**Инструкция:** [SECRETS-SETUP.md](./SECRETS-SETUP.md)

---

## ✅ Что настроено

✅ Автоматический деплой при push  
✅ Два окружения: dev (staging) и master (IFT)  
✅ PM2 управление процессами  
✅ Nginx проксирование  
✅ Единая БД `tipit` на 45.144.52.58  
✅ SSH аутентификация через GitHub Secrets  

---

## 🚀 Использование

### Деплой на Staging
```bash
git checkout dev
git add .
git commit -m "Your changes"
git push origin dev
# → Автоматический деплой на http://45.144.52.219:3001
```

### Деплой на IFT
```bash
git checkout master
git merge dev
git push origin master
# → Автоматический деплой на http://45.144.52.219:3000
```

---

## 📊 Мониторинг

### GitHub Actions
- Repository → **Actions** → выберите workflow
- Смотрите логи каждого шага

### На сервере
```bash
pm2 list                    # Статус процессов
pm2 logs tipit-dev          # Логи staging
pm2 logs tipit-ift          # Логи IFT
sudo systemctl status nginx # Статус Nginx
```

---

## 🔧 Troubleshooting

**Деплой не запускается:**
- Проверьте GitHub Secrets
- Убедитесь что workflows закоммичены
- Проверьте Actions включены в Settings

**SSH ошибка:**
- Проверьте `SERVER_SSH_KEY` содержит приватный ключ
- Публичный ключ добавлен на сервер: `~/.ssh/authorized_keys`

**Build падает:**
```bash
# На сервере
cd /root/tipit/dev
pm2 logs tipit-dev --lines 50
```

**Подробнее:** [CICD-README.md → Troubleshooting](../CICD-README.md#-troubleshooting)

---

## 📞 Помощь

1. 📖 Читайте [CICD-README.md](../CICD-README.md)
2. ⚡ Используйте [QUICK-COMMANDS.md](../QUICK-COMMANDS.md)
3. ✅ Проверьте [CICD-FINAL-CHECKLIST.md](../CICD-FINAL-CHECKLIST.md)

---

**Push = Deploy!** 🎉
