#!/bin/bash
# =====================================================
# Apply Migrations Script
# Run on server: bash scripts/apply-migrations.sh
# =====================================================

set -e  # Exit on error

echo "🚀 Starting migration process..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Pull latest code
echo -e "${BLUE}📥 Pulling latest code from GitHub...${NC}"
cd /root/tipit/dev
git pull origin dev
echo ""

# Step 2: Install dependencies (if needed)
echo -e "${BLUE}📦 Installing dependencies...${NC}"
pnpm install
echo ""

# Step 3: Apply alert_settings v2 migration
echo -e "${YELLOW}⚠️  WARNING: This will DROP the alert_settings table!${NC}"
echo -e "${YELLOW}All existing alert configurations will be deleted.${NC}"
read -p "Continue? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
  echo "❌ Migration cancelled."
  exit 1
fi

echo -e "${BLUE}🔄 Applying alert_settings v2 migration...${NC}"
sudo -u postgres psql -d tipit_dev -f scripts/migrate-alert-settings-v2.sql
echo ""

# Step 4: Reset test environment (optional)
echo -e "${BLUE}🧹 Reset test environment?${NC}"
echo "This will DELETE ALL DATA and create a test streamer."
read -p "Reset? (yes/no): " reset_confirm
if [ "$reset_confirm" = "yes" ]; then
  echo -e "${BLUE}🗑️  Resetting test environment...${NC}"
  sudo -u postgres psql -d tipit_dev -f scripts/reset-test-environment.sql
  echo ""
fi

# Step 5: Regenerate Prisma Client
echo -e "${BLUE}🔧 Regenerating Prisma Client...${NC}"
npx prisma generate
echo ""

# Step 6: Rebuild Next.js
echo -e "${BLUE}🏗️  Building Next.js application...${NC}"
pnpm build
echo ""

# Step 7: Restart PM2
echo -e "${BLUE}♻️  Restarting PM2 process...${NC}"
pm2 restart tipit-dev
echo ""

# Step 8: Show status
echo -e "${GREEN}✅ Migration completed successfully!${NC}"
echo ""
echo -e "${BLUE}📊 PM2 Status:${NC}"
pm2 status
echo ""
echo -e "${BLUE}📝 Recent logs:${NC}"
pm2 logs tipit-dev --lines 20 --nostream
echo ""
echo -e "${GREEN}🎉 All done! Check the logs above for any errors.${NC}"
