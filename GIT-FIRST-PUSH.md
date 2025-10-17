# 🚀 Первый push в GitHub - Инструкция

Пошаговая инструкция для инициализации Git репозитория и первого push в GitHub.

---

## 📋 Предварительные требования

- Git установлен на вашем компьютере
- Аккаунт GitHub: `prefectdinorah`
- Репозиторий: `git@github.com:prefectdinorah/tipit.git`

---

## 🔑 Шаг 1: Настройка SSH ключа для GitHub

### Windows (PowerShell):

```powershell
# 1. Сгенерируйте SSH ключ
ssh-keygen -t ed25519 -C "your_email@example.com" -f ~/.ssh/id_ed25519_github

# 2. Запустите ssh-agent
Start-Service ssh-agent

# 3. Добавьте ключ в ssh-agent
ssh-add ~/.ssh/id_ed25519_github

# 4. Скопируйте публичный ключ в буфер обмена
Get-Content ~/.ssh/id_ed25519_github.pub | clip
```

### Linux/Mac:

```bash
# 1. Сгенерируйте SSH ключ
ssh-keygen -t ed25519 -C "your_email@example.com" -f ~/.ssh/id_ed25519_github

# 2. Запустите ssh-agent
eval "$(ssh-agent -s)"

# 3. Добавьте ключ в ssh-agent
ssh-add ~/.ssh/id_ed25519_github

# 4. Скопируйте публичный ключ
# Mac:
pbcopy < ~/.ssh/id_ed25519_github.pub

# Linux:
cat ~/.ssh/id_ed25519_github.pub
# Скопируйте вручную
```

### Добавьте SSH ключ в GitHub:

1. Откройте: https://github.com/settings/keys
2. Нажмите: **"New SSH key"**
3. **Title:** `Tipit Development PC`
4. **Key:** Вставьте скопированный публичный ключ
5. Нажмите: **"Add SSH key"**

### Проверьте подключение:

```bash
ssh -T git@github.com
```

Должно вывести:
```
Hi prefectdinorah! You've successfully authenticated, but GitHub does not provide shell access.
```

---

## 📁 Шаг 2: Инициализация Git репозитория

```bash
# Перейдите в папку проекта
cd c:\dev\tipit\tipit

# Инициализируйте Git (если ещё не сделано)
git init

# Настройте пользователя Git
git config user.name "Your Name"
git config user.email "your_email@example.com"

# Проверьте настройки
git config --list
```

---

## 📝 Шаг 3: Создание .gitignore (если нужно)

Убедитесь что файл `.gitignore` содержит:

```gitignore
# dependencies
/node_modules

# next.js
/.next/
/out/

# env files
.env*
!.env.example

# logs
*.log

# uploads
public/uploads/*
!public/uploads/.gitkeep

# pm2
.pm2/

# OS
.DS_Store

# IDE
.vscode/
.idea/
```

---

## 🔨 Шаг 4: Первый коммит

```bash
# Добавьте все файлы
git add .

# Проверьте что будет закоммичено
git status

# Создайте первый коммит
git commit -m "Initial commit: TIPIT donation platform with CI/CD setup"
```

---

## 🌿 Шаг 5: Создание веток

```bash
# Переименуйте текущую ветку в master (если называется main)
git branch -M master

# Проверьте текущую ветку
git branch
# Должно показать: * master
```

---

## 🔗 Шаг 6: Подключение к GitHub

```bash
# Добавьте удалённый репозиторий
git remote add origin git@github.com:prefectdinorah/tipit.git

# Проверьте что remote добавлен
git remote -v
# Должно показать:
# origin  git@github.com:prefectdinorah/tipit.git (fetch)
# origin  git@github.com:prefectdinorah/tipit.git (push)
```

---

## 🚀 Шаг 7: Push в GitHub

```bash
# Запушьте master ветку
git push -u origin master

# Если возникла ошибка "remote contains work that you do not have"
# Используйте force push (ОСТОРОЖНО! Только для первого раза):
# git push -u origin master --force
```

---

## 🌱 Шаг 8: Создание dev ветки

```bash
# Создайте и переключитесь на dev ветку
git checkout -b dev

# Запушьте dev ветку в GitHub
git push -u origin dev

# Вернитесь на master
git checkout master

# Проверьте что обе ветки существуют
git branch -a
# Должно показать:
# * master
#   dev
#   remotes/origin/master
#   remotes/origin/dev
```

---

## ✅ Проверка

### В терминале:

```bash
# Проверьте ветки
git branch -a

# Должно показать:
#   dev
# * master
#   remotes/origin/dev
#   remotes/origin/master
```

### На GitHub:

1. Откройте: https://github.com/prefectdinorah/tipit
2. Убедитесь что репозиторий создан
3. Проверьте что есть 2 ветки: `master` и `dev`
4. Все файлы должны быть на месте

---

## 🔄 Следующие шаги

После успешного push:

1. ✅ Настройте GitHub Secrets (см. `CICD-QUICKSTART.md`)
2. ✅ Настройте сервер (см. `CICD-QUICKSTART.md`)
3. ✅ Сделайте тестовый деплой

---

## 🐛 Troubleshooting

### Ошибка: "Permission denied (publickey)"

**Решение:**
```bash
# Проверьте что SSH ключ добавлен
ssh-add -l

# Если ключа нет, добавьте его
ssh-add ~/.ssh/id_ed25519_github

# Проверьте подключение
ssh -T git@github.com
```

### Ошибка: "remote: Repository not found"

**Решение:**
1. Убедитесь что репозиторий создан на GitHub
2. Проверьте URL:
   ```bash
   git remote -v
   ```
3. Если URL неправильный, исправьте:
   ```bash
   git remote set-url origin git@github.com:prefectdinorah/tipit.git
   ```

### Ошибка: "failed to push some refs"

**Решение:**
```bash
# Если это первый push и на GitHub есть README.md или другие файлы:
git pull origin master --rebase

# Затем запушьте
git push -u origin master
```

### Ошибка: "src refspec master does not match any"

**Решение:**
```bash
# Убедитесь что есть коммиты
git log

# Если коммитов нет, создайте первый
git add .
git commit -m "Initial commit"

# Затем запушьте
git push -u origin master
```

---

## 📚 Полезные команды Git

```bash
# Посмотреть статус
git status

# Посмотреть историю коммитов
git log --oneline --graph --all

# Посмотреть удалённые репозитории
git remote -v

# Посмотреть все ветки
git branch -a

# Переключиться между ветками
git checkout master
git checkout dev

# Создать новую ветку
git checkout -b feature-branch

# Удалить ветку
git branch -d branch-name
```

---

## ✅ Финальный чеклист

- [ ] SSH ключ создан и добавлен в GitHub
- [ ] SSH подключение к GitHub работает
- [ ] Git настроен (user.name, user.email)
- [ ] .gitignore содержит необходимые паттерны
- [ ] Первый коммит создан
- [ ] Ветка master запушена в GitHub
- [ ] Ветка dev создана и запушена
- [ ] Репозиторий виден на GitHub
- [ ] Все файлы присутствуют в репозитории

**🎉 Готово! Репозиторий настроен и готов к CI/CD!**

**Следующий шаг:** Настройте CI/CD по инструкции в `CICD-QUICKSTART.md`
