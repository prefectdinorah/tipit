#!/bin/bash

echo "Checking server status..."
echo ""

# Check if Next.js is running
if pm2 list | grep -q "streamdonate"; then
    echo "✅ Application is running in PM2"
    pm2 show streamdonate
else
    echo "❌ Application is not running!"
    echo "Starting application..."
    cd /var/www/streamdonate
    pm2 start npm --name streamdonate -- start
fi

echo ""
echo "Testing API endpoints..."
echo ""

# Test API health
curl -v http://localhost:3000/api/auth/session 2>&1 | grep -E "(Connected|HTTP|200|404)"

echo ""
echo "Checking ports..."
netstat -tlnp | grep :3000

echo ""
echo "Recent logs:"
pm2 logs streamdonate --lines 20 --nostream
