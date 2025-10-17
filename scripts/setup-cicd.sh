# 🚀 Скрипт инициализации CI/CD на сервере
# Файл: setup-cicd.sh
# Использование: bash setup-cicd.sh

#!/bin/bash

set -e  # Останавливаемся при ошибке

echo "🎯 Starting CI/CD Setup for Tipit Application"
echo "=============================================="

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Переменные
REPO_URL="https://github.com/YOUR_USERNAME/tipit.git"  # ⚠️ ЗАМЕНИТЕ НА ВАШ РЕПОЗИТОРИЙ
PROD_DIR="/var/www/tipit-prod"
STAGING_DIR="/var/www/tipit-staging"

echo ""
echo "📋 Configuration:"
echo "  Repository: $REPO_URL"
echo "  Production: $PROD_DIR (port 3000)"
echo "  Staging: $STAGING_DIR (port 3001)"
echo ""

# 1. Создание директорий
echo -e "${YELLOW}📂 Creating directories...${NC}"
sudo mkdir -p $PROD_DIR
sudo mkdir -p $STAGING_DIR
sudo mkdir -p $PROD_DIR/logs
sudo mkdir -p $STAGING_DIR/logs
sudo chown -R $USER:$USER /var/www/tipit-*

# 2. Клонирование репозитория (Production - main ветка)
echo -e "${YELLOW}📥 Cloning production repository (main branch)...${NC}"
if [ -d "$PROD_DIR/.git" ]; then
    echo "  Production repository already exists, pulling latest..."
    cd $PROD_DIR && git pull origin main
else
    git clone -b main $REPO_URL $PROD_DIR
fi

# 3. Клонирование репозитория (Staging - dev ветка)
echo -e "${YELLOW}📥 Cloning staging repository (dev branch)...${NC}"
if [ -d "$STAGING_DIR/.git" ]; then
    echo "  Staging repository already exists, pulling latest..."
    cd $STAGING_DIR && git pull origin dev
else
    git clone -b dev $REPO_URL $STAGING_DIR
fi

# 4. Установка зависимостей для Production
echo -e "${YELLOW}📦 Installing production dependencies...${NC}"
cd $PROD_DIR
npm install --production

# 5. Установка зависимостей для Staging
echo -e "${YELLOW}📦 Installing staging dependencies...${NC}"
cd $STAGING_DIR
npm install

# 6. Настройка .env файлов
echo -e "${YELLOW}⚙️  Setting up environment files...${NC}"
echo -e "${RED}⚠️  IMPORTANT: You need to create .env files manually!${NC}"
echo ""
echo "  1. Create $PROD_DIR/.env with production settings"
echo "  2. Create $STAGING_DIR/.env with staging settings"
echo ""
echo "  Example .env content:"
echo "    DATABASE_URL=postgresql://user:pass@45.144.52.58:5432/tipit_prod"
echo "    MONGODB_URI=mongodb://user:pass@45.144.52.58:27017/tipit_prod"
echo "    SESSION_SECRET=your-secret-here"
echo ""

# 7. Генерация Prisma Client
echo -e "${YELLOW}🔨 Generating Prisma Client for Production...${NC}"
cd $PROD_DIR
npm run prisma:generate

echo -e "${YELLOW}🔨 Generating Prisma Client for Staging...${NC}"
cd $STAGING_DIR
npm run prisma:generate

# 8. Копирование конфигов Nginx
echo -e "${YELLOW}🌐 Setting up Nginx configs...${NC}"
sudo cp $PROD_DIR/nginx/tipit-prod.conf /etc/nginx/sites-available/
sudo cp $STAGING_DIR/nginx/tipit-staging.conf /etc/nginx/sites-available/

# Создание символических ссылок
sudo ln -sf /etc/nginx/sites-available/tipit-prod.conf /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/tipit-staging.conf /etc/nginx/sites-enabled/

# Проверка конфигурации Nginx
echo -e "${YELLOW}🔍 Testing Nginx configuration...${NC}"
sudo nginx -t

# 9. Открытие портов в firewall
echo -e "${YELLOW}🔥 Configuring firewall...${NC}"
sudo ufw allow 80/tcp comment 'Nginx Production'
sudo ufw allow 8080/tcp comment 'Nginx Staging'
sudo ufw allow 3000/tcp comment 'Next.js Production'
sudo ufw allow 3001/tcp comment 'Next.js Staging'

# 10. Перезагрузка Nginx
echo -e "${YELLOW}♻️  Reloading Nginx...${NC}"
sudo systemctl reload nginx

# 11. Сборка приложений
echo -e "${YELLOW}🏗️  Building Production application...${NC}"
cd $PROD_DIR
npm run build

echo -e "${YELLOW}🏗️  Building Staging application...${NC}"
cd $STAGING_DIR
npm run build

# 12. Запуск PM2
echo -e "${YELLOW}🚀 Starting PM2 processes...${NC}"
cd $PROD_DIR
pm2 start ecosystem.config.js

# Сохранение PM2 для автозапуска
pm2 save
pm2 startup

echo ""
echo -e "${GREEN}✅ CI/CD Setup Complete!${NC}"
echo ""
echo "📝 Next Steps:"
echo "  1. Create .env files in both directories"
echo "  2. Run database migrations: npm run prisma:migrate"
echo "  3. Configure GitHub Secrets:"
echo "     - PROD_HOST=45.144.52.219"
echo "     - PROD_USER=your_username"
echo "     - PROD_SSH_KEY=your_private_key"
echo "     - STAGING_HOST=45.144.52.219"
echo "     - STAGING_USER=your_username"
echo "     - STAGING_SSH_KEY=your_private_key"
echo ""
echo "🌐 Access:"
echo "  Production: http://45.144.52.219"
echo "  Staging: http://45.144.52.219:8080"
echo ""
echo "📊 Monitor:"
echo "  pm2 list"
echo "  pm2 logs tipit-prod"
echo "  pm2 logs tipit-staging"
