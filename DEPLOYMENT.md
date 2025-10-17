# 🚀 Deployment Guide

## Prerequisites

- Node.js 20+ installed on 45.144.52.219
- PostgreSQL running on 45.144.52.58
- MongoDB running on 45.144.52.58
- Firewall configured to allow connections from 45.144.52.219

## Step 1: Prepare the Server

\`\`\`bash
# On 45.144.52.219
ssh user@45.144.52.219

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should be v20.x
npm --version

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx (optional, for reverse proxy)
sudo apt install -y nginx

# Configure firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 3000/tcp
sudo ufw enable
\`\`\`

## Step 2: Upload Project Files

\`\`\`bash
# Create project directory
sudo mkdir -p /var/www/streamdonate
sudo chown $USER:$USER /var/www/streamdonate
cd /var/www/streamdonate

# Upload your files here (via git, scp, or other method)
# For example, using scp:
# scp -r ./donation-platform/* user@45.144.52.219:/var/www/streamdonate/
\`\`\`

## Step 3: Install Dependencies

\`\`\`bash
cd /var/www/streamdonate

# Install dependencies
npm install

# Generate Prisma Client
npm run prisma:generate
\`\`\`

## Step 4: Test Database Connections

\`\`\`bash
# Test connections
npm run test:connection

# Expected output:
# ✅ PostgreSQL connected successfully
# ✅ MongoDB connected successfully
\`\`\`

If you see any errors, check:
- Firewall rules on 45.144.52.58
- Database credentials in .env
- Network connectivity between servers

## Step 5: Run Database Migrations

\`\`\`bash
# Apply PostgreSQL migrations
npm run prisma:migrate

# This will create all necessary tables
\`\`\`

## Step 6: Seed Test Data (Optional)

\`\`\`bash
# Add test streamers and donations
npm run seed

# This creates:
# - test4 / 1234
# - gaming_pro / password123
# Each with 4 test donations
\`\`\`

## Step 7: Build the Application

\`\`\`bash
# Build for production
npm run build

# This will:
# 1. Generate Prisma Client
# 2. Build Next.js application
\`\`\`

## Step 8: Start with PM2

\`\`\`bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'streamdonate',
    script: 'npm',
    args: 'start',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Start application
pm2 start ecosystem.config.js

# Setup auto-start on boot
pm2 startup
pm2 save

# Check status
pm2 status
pm2 logs streamdonate --lines 50
\`\`\`

## Step 9: Configure Nginx (Optional)

\`\`\`bash
# Create Nginx config
sudo tee /etc/nginx/sites-available/streamdonate << 'EOF'
server {
    listen 80;
    server_name 45.144.52.219;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/streamdonate /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
\`\`\`

## Step 10: Verify Deployment

\`\`\`bash
# Check if app is running
curl http://localhost:3000

# Or from your local machine
curl http://45.144.52.219:3000
\`\`\`

## Useful Commands

\`\`\`bash
# View logs
pm2 logs streamdonate

# Restart app
pm2 restart streamdonate

# Stop app
pm2 stop streamdonate

# Monitor resources
pm2 monit

# View database stats
npm run prisma:studio
\`\`\`

## Troubleshooting

### App won't start
\`\`\`bash
# Check logs
pm2 logs streamdonate --lines 100

# Check port is available
sudo netstat -tlnp | grep 3000

# Restart
pm2 restart streamdonate
\`\`\`

### Database connection errors
\`\`\`bash
# Test connections
npm run test:connection

# Check firewall on DB server (45.144.52.58)
ssh user@45.144.52.58
sudo ufw status

# Verify ports are open
telnet 45.144.52.58 5432
telnet 45.144.52.58 27017
\`\`\`

### Can't access from browser
\`\`\`bash
# Check firewall on app server
sudo ufw status

# Check if Nginx is running (if using)
sudo systemctl status nginx

# Check app is listening
sudo netstat -tlnp | grep 3000
\`\`\`

## Security Checklist

- [ ] Change SESSION_SECRET in .env to a strong random value
- [ ] Configure SSL/TLS (use Certbot for Let's Encrypt)
- [ ] Set up proper firewall rules
- [ ] Enable fail2ban for SSH protection
- [ ] Regular security updates: `sudo apt update && sudo apt upgrade`
- [ ] Monitor logs regularly: `pm2 logs`
- [ ] Set up automated backups

## Next Steps

1. Add a domain name and SSL certificate
2. Set up monitoring (e.g., PM2 Plus, DataDog)
3. Configure automated backups
4. Set up CI/CD pipeline
5. Add error tracking (e.g., Sentry)
