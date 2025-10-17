#!/bin/bash

# Скрипт для исправления кодировки файлов

echo "🔧 Fixing file encoding issues..."

# Удаляем проблемные файлы
rm -f app/auth/login/page.tsx
rm -f app/auth/register/page.tsx
rm -f app/donate/[streamer]/page.tsx
rm -f app/settings/page.tsx

echo "✅ Removed files with encoding issues"
echo "📝 Please recreate the files using the code editor"
