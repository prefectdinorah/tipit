# 🔑 Настройка SSH ключа GitHub на сервере

## Проблема

GitHub Actions падает с ошибкой:
```
git@github.com: Permission denied (publickey).
```

Это происходит потому что на сервере при `git fetch origin` используется SSH, но нет ключа для доступа к GitHub.

---

## 🔧 Решение 1: Deploy Key (рекомендуется)

### На сервере (SSH: root@45.144.52.219)

```bash
# 1. Подключаемся к серверу
ssh root@45.144.52.219

# 2. Генерируем SSH ключ для GitHub
ssh-keygen -t ed25519 -C "tipit-server-deploy" -f ~/.ssh/github_tipit_deploy

# Нажмите Enter 3 раза (без пароля)

# 3. Показываем публичный ключ
cat ~/.ssh/github_tipit_deploy.pub
```

Скопируйте вывод (начинается с `ssh-ed25519 ...`)

### В GitHub (на сайте)

1. Откройте: https://github.com/prefectdinorah/tipit/settings/keys

2. Нажмите **"Add deploy key"**

3. Заполните:
   - **Title:** `tipit-server-deploy-key`
   - **Key:** Вставьте публичный ключ из шага выше
   - **Allow write access:** ✅ Включите (чтобы можно было пушить)

4. Нажмите **"Add key"**

### На сервере (продолжение)

```bash
# 4. Настраиваем SSH для использования этого ключа (ПОСТОЯННО)
cat >> ~/.ssh/config << 'EOF'

# GitHub for tipit project
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/github_tipit_deploy
  IdentitiesOnly yes
EOF

# 5. Устанавливаем права
chmod 600 ~/.ssh/config
chmod 600 ~/.ssh/github_tipit_deploy

# 6. Тестируем подключение
ssh -T git@github.com
```

**⚠️ ВАЖНО:** НЕ используйте `ssh-add`! Ключ должен быть прописан в `~/.ssh/config` чтобы работать постоянно, а не только в рамках сессии.

Должно вывести:
```
Hi prefectdinorah! You've successfully authenticated, but GitHub does not provide shell access.
```

### Проверка в DEV директории

```bash
cd /root/tipit/dev
git fetch origin
```

Должно работать без ошибок!

---

## 🔧 Решение 2: Изменить remote на HTTPS (альтернатива)

Если не хотите настраивать SSH ключ, можно переключиться на HTTPS:

```bash
# На сервере
ssh root@45.144.52.219

# DEV
cd /root/tipit/dev
git remote set-url origin https://github.com/prefectdinorah/tipit.git

# Проверка
git remote -v
git fetch origin
```

**⚠️ Минус:** При приватном репозитории потребуется Personal Access Token.

---

## ✅ После настройки

Запустите GitHub Actions заново:

1. Откройте: https://github.com/prefectdinorah/tipit/actions
2. Выберите последний упавший workflow
3. Нажмите **"Re-run all jobs"**

Или сделайте новый push:

```bash
cd c:\dev\tipit\tipit
git commit --allow-empty -m "test: retry GitHub Actions after SSH setup"
git push origin dev
```

---

## 🐛 Troubleshooting

### SSH всё равно не работает

```bash
# Проверьте что ключ правильно настроен в config
cat ~/.ssh/config | grep -A 5 "github.com"

# Должно показать:
# Host github.com
#   HostName github.com
#   User git
#   IdentityFile ~/.ssh/github_tipit_deploy
#   IdentitiesOnly yes

# Проверьте права
ls -la ~/.ssh/github_tipit_deploy*
# Должно быть: -rw------- (600)

# Проверьте verbose
ssh -Tv git@github.com

# ⚠️ НЕ используйте ssh-add! Это работает только в сессии!
# Ключ должен быть в ~/.ssh/config
```

### GitHub Actions всё равно падает

Проверьте что на сервере:
```bash
cd /root/tipit/dev
git remote -v
```

Должно быть:
```
origin  git@github.com:prefectdinorah/tipit.git (fetch)
origin  git@github.com:prefectdinorah/tipit.git (push)
```

Если показывает HTTPS, измените:
```bash
git remote set-url origin git@github.com:prefectdinorah/tipit.git
```

---

**После настройки SSH ключа GitHub Actions заработает!** ✅
