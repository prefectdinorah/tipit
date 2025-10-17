# 🔐 GitHub Secrets Setup Guide

## Что такое GitHub Secrets?

GitHub Secrets - это зашифрованные переменные окружения, которые используются в GitHub Actions. Они никогда не отображаются в логах и доступны только в workflow runs.

---

## 📋 Список необходимых Secrets

| Secret Name | Описание | Где взять |
|-------------|----------|-----------|
| `PROD_HOST` | IP адрес production сервера | `45.144.52.219` |
| `PROD_USER` | SSH пользователь на сервере | Ваш username на сервере |
| `PROD_SSH_KEY` | SSH приватный ключ | Генерируется ниже |
| `STAGING_HOST` | IP адрес staging сервера | `45.144.52.219` (тот же) |
| `STAGING_USER` | SSH пользователь | Тот же что и PROD_USER |
| `STAGING_SSH_KEY` | SSH приватный ключ | Тот же что и PROD_SSH_KEY |

---

## 🔑 Шаг 1: Генерация SSH ключа

### На сервере (45.144.52.219):

```bash
# 1. Подключитесь к серверу
ssh your_username@45.144.52.219

# 2. Создайте новый SSH ключ для GitHub Actions
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy

# Нажмите Enter для пустого passphrase (важно!)
# Enter passphrase (empty for no passphrase): [просто нажмите Enter]
# Enter same passphrase again: [просто нажмите Enter]

# 3. Добавьте публичный ключ в authorized_keys
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys

# 4. Установите правильные права доступа
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh

# 5. Выведите приватный ключ (для копирования)
cat ~/.ssh/github_deploy
```

### Скопируйте ВЕСЬ вывод последней команды

Пример вывода:
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
...
[много строк]
...
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx==
-----END OPENSSH PRIVATE KEY-----
```

⚠️ **ВАЖНО:** Скопируйте ключ ПОЛНОСТЬЮ, включая строки `-----BEGIN` и `-----END`

---

## 🌐 Шаг 2: Добавление Secrets в GitHub

### 1. Откройте настройки репозитория

Перейдите на GitHub:
```
https://github.com/YOUR_USERNAME/tipit
```

### 2. Перейдите в Secrets

Навигация:
```
Settings (вверху справа) 
  → Secrets and variables (слева) 
    → Actions 
      → New repository secret (зеленая кнопка)
```

### 3. Добавьте каждый Secret

#### Secret #1: PROD_HOST
- **Name:** `PROD_HOST`
- **Value:** `45.144.52.219`
- Нажмите "Add secret"

#### Secret #2: PROD_USER
- **Name:** `PROD_USER`
- **Value:** `ваш_username` (тот, которым логинитесь на сервер)
- Нажмите "Add secret"

#### Secret #3: PROD_SSH_KEY
- **Name:** `PROD_SSH_KEY`
- **Value:** Вставьте ВЕСЬ приватный ключ из `cat ~/.ssh/github_deploy`
- **ВАЖНО:** Включая `-----BEGIN` и `-----END`
- Нажмите "Add secret"

#### Secret #4: STAGING_HOST
- **Name:** `STAGING_HOST`
- **Value:** `45.144.52.219` (тот же IP)
- Нажмите "Add secret"

#### Secret #5: STAGING_USER
- **Name:** `STAGING_USER`
- **Value:** `ваш_username` (тот же)
- Нажмите "Add secret"

#### Secret #6: STAGING_SSH_KEY
- **Name:** `STAGING_SSH_KEY`
- **Value:** Тот же приватный ключ
- Нажмите "Add secret"

---

## ✅ Шаг 3: Проверка

### Проверьте список Secrets

После добавления вы должны увидеть 6 secrets:
- ✅ PROD_HOST
- ✅ PROD_USER
- ✅ PROD_SSH_KEY
- ✅ STAGING_HOST
- ✅ STAGING_USER
- ✅ STAGING_SSH_KEY

### Тестовый SSH с нового ключа

На вашем **локальном компьютере**:

```bash
# Скопируйте ключ с сервера на локальный компьютер (для теста)
scp your_username@45.144.52.219:~/.ssh/github_deploy ~/test_key

# Установите права
chmod 600 ~/test_key

# Проверьте подключение
ssh -i ~/test_key your_username@45.144.52.219

# Если подключение успешно - всё ОК!
# Удалите тестовый ключ
rm ~/test_key
```

---

## 🚀 Шаг 4: Первый деплой

### 1. Создайте dev ветку (если еще нет)

```bash
# Локально в VS Code терминале
git checkout -b dev
git push origin dev
```

### 2. Закоммитьте workflow файлы

```bash
# Проверьте что файлы есть
ls .github/workflows/

# Должны быть:
# - deploy-production.yml
# - deploy-staging.yml

# Добавьте все изменения
git add .
git commit -m "ci: add GitHub Actions workflows"
git push origin dev
```

### 3. Запустите тестовый деплой на Staging

Перейдите на GitHub:
```
Actions → Deploy to Staging → Run workflow → Run workflow
```

### 4. Смотрите логи

В процессе деплоя вы увидите:
- ✅ Checkout code
- ✅ Deploy to Staging
- ✅ Deployment Success

Если появились ошибки - смотрите раздел Troubleshooting ниже.

---

## 🐛 Troubleshooting

### ❌ Error: Permission denied (publickey)

**Причина:** SSH ключ не добавлен или неправильный формат

**Решение:**
```bash
# На сервере проверьте
cat ~/.ssh/authorized_keys | grep github-actions

# Должна быть строка с комментарием "github-actions-deploy"
# Если нет - добавьте снова:
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys
```

### ❌ Error: Invalid format

**Причина:** Приватный ключ скопирован не полностью

**Решение:**
1. Удалите Secret в GitHub
2. На сервере выполните: `cat ~/.ssh/github_deploy`
3. Скопируйте **ВСЕ** от `-----BEGIN` до `-----END` включительно
4. Создайте Secret снова

### ❌ Error: Host key verification failed

**Причина:** Сервер не в known_hosts

**Решение:**
Добавьте в `.github/workflows/deploy-*.yml` перед ssh-action:

```yaml
- name: Add server to known hosts
  run: |
    mkdir -p ~/.ssh
    ssh-keyscan -H 45.144.52.219 >> ~/.ssh/known_hosts
```

### ❌ Error: Directory not found

**Причина:** Директории на сервере не созданы

**Решение:**
```bash
# На сервере
sudo mkdir -p /var/www/tipit-prod
sudo mkdir -p /var/www/tipit-staging
sudo chown -R $USER:$USER /var/www/tipit-*
```

---

## 🔒 Безопасность

### ✅ Что МОЖНО делать

- Использовать один SSH ключ для prod и staging (если это один сервер)
- Хранить secrets в GitHub (они зашифрованы)
- Показывать логи деплоя (secrets автоматически маскируются)

### ❌ Что НЕЛЬЗЯ делать

- ❌ Коммитить приватные ключи в Git
- ❌ Использовать passphrase для SSH ключа (GitHub Actions не интерактивен)
- ❌ Давать права root для деплой пользователя
- ❌ Хранить пароли в открытом виде

### 🔐 Рекомендации

1. **Используйте отдельного пользователя для деплоя:**
   ```bash
   sudo adduser deploy
   sudo usermod -aG www-data deploy
   ```

2. **Ограничьте доступ:**
   ```bash
   # В ~/.ssh/authorized_keys добавьте ограничения
   command="/usr/bin/deploy.sh",no-port-forwarding,no-X11-forwarding ssh-ed25519 AAAA...
   ```

3. **Ротация ключей:**
   - Меняйте SSH ключи каждые 3-6 месяцев
   - При уходе сотрудника - сразу удаляйте его ключи

---

## 📊 Мониторинг деплоев

### GitHub Actions Dashboard

```
Repository → Actions
```

Здесь вы увидите:
- История всех деплоев
- Статус (Success/Failed)
- Время выполнения
- Логи каждого шага

### Email уведомления

GitHub автоматически отправляет email при:
- ❌ Фейле workflow
- ✅ Успешном деплое (опционально)

Настройка:
```
Settings → Notifications → Actions
```

---

## 📝 Чеклист

Перед первым деплоем убедитесь:

- [ ] SSH ключ сгенерирован на сервере
- [ ] Публичный ключ добавлен в authorized_keys
- [ ] Приватный ключ скопирован полностью (с BEGIN/END)
- [ ] Все 6 Secrets добавлены в GitHub
- [ ] Workflow файлы закоммичены в репозиторий
- [ ] Dev ветка создана и запушена
- [ ] Директории на сервере созданы
- [ ] Тестовое SSH подключение успешно

---

## 🎉 Готово!

После настройки:
1. Push в `dev` → автодеплой на staging
2. Push в `main` → автодеплой на production
3. Мониторинг в GitHub Actions

**Следующий шаг:** Запустите `bash setup-cicd.sh` на сервере (см. CICD-SETUP.md)
