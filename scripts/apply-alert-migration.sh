#!/bin/bash

# Apply alert_settings migration to database
# Usage: ./apply-alert-migration.sh

set -e

echo "🔧 Applying alert_settings table migration..."

# Database connection string
DB_URL="postgresql://streamdonate_user:B5oFzj1O0DyAhNzWlfMWqW71@45.144.52.58:5432/streamdonate_db"

# Apply migration
psql "$DB_URL" -f /root/tipit/dev/scripts/create-alert-settings-table.sql

echo "✅ Migration applied successfully!"

# Restart PM2 to reload Prisma client
echo "🔄 Restarting PM2..."
pm2 restart tipit-dev

echo "✅ All done! Alert settings table is ready."
