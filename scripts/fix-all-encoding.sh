#!/bin/bash

echo "Fixing encoding issues in all problematic files..."

cd /var/www/streamdonate

# Remove files with encoding issues
echo "Removing problematic files..."
rm -f app/auth/login/page.tsx
rm -f app/auth/register/page.tsx
rm -f app/donate/[streamer]/page.tsx
rm -f app/settings/page.tsx

echo "✅ Files removed. Please recreate them from the v0 interface."
echo ""
echo "After recreating files, run:"
echo "  npm run build"
echo "  pm2 restart streamdonate"
