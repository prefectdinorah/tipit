# 🚀 Quick Fix: Apply Alert Settings Migration

## Problem
```
The table `public.alert_settings` does not exist in the current database.
```

## Solution - Run this on the server:

### Option 1: Using psql (Recommended)
```bash
# SSH to server
ssh root@45.144.52.219

# Run SQL migration
psql "postgresql://streamdonate_user:B5oFzj1O0DyAhNzWlfMWqW71@45.144.52.58:5432/streamdonate_db" \
  -f /root/tipit/dev/scripts/create-alert-settings-table.sql

# Restart app
pm2 restart tipit-dev

# Check logs
pm2 logs tipit-dev --lines 50
```

### Option 2: Using script
```bash
ssh root@45.144.52.219
cd /root/tipit/dev
chmod +x scripts/apply-alert-migration.sh
./scripts/apply-alert-migration.sh
```

### Option 3: Manual SQL
```bash
ssh root@45.144.52.219

psql "postgresql://streamdonate_user:B5oFzj1O0DyAhNzWlfMWqW71@45.144.52.58:5432/streamdonate_db"
```

Then paste the SQL from `scripts/create-alert-settings-table.sql`

## Verify

After migration, test in browser:
1. Go to http://45.144.52.219:3001/settings
2. Click "Alerts" tab
3. Should see Widget URL with generated token
4. All settings should load without errors
5. Preview should show test alert

## If still not working

Check Prisma client regeneration:
```bash
ssh root@45.144.52.219
cd /root/tipit/dev
npx prisma generate
pm2 restart tipit-dev
```
