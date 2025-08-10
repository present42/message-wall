#!/bin/bash

# Free Tier User Data Script for EC2 instances
# This script sets up the Message Wall app with SQLite (no RDS needed)

set -e

# Log everything
exec > >(tee /var/log/user-data.log)
exec 2>&1

echo "Starting free tier user data script..."

# Update system
yum update -y

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# Install PM2 globally
npm install -g pm2

# Install nginx
yum install -y nginx

# Install git
yum install -y git

# Install SQLite (for local database)
yum install -y sqlite

# Create application user
useradd -m -s /bin/bash messagewall

# Create directories
mkdir -p /var/www/message-wall
mkdir -p /var/www/uploads
mkdir -p /var/www/message-wall/logs
mkdir -p /var/www/message-wall/database

# Set ownership
chown -R messagewall:messagewall /var/www/message-wall
chown -R messagewall:messagewall /var/www/uploads

# Clone repository (replace with your actual repo)
cd /var/www
# For now, we'll create a placeholder - you'll need to replace this with your actual repo
git clone https://github.com/your-username/message-wall.git || {
    echo "Repository not found. Creating placeholder structure..."
    mkdir -p message-wall
    cd message-wall
    echo "Please upload your application files here" > README.txt
}

cd /var/www/message-wall
chown -R messagewall:messagewall .

# Create environment file for SQLite
cat > .env << EOF
NODE_ENV=production
PORT=3000
SOCKET_PORT=3001
DATABASE_URL="file:./database/messagewall.db"
NEXTAUTH_URL="http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3000"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
UPLOAD_DIR="/var/www/uploads"
MAX_FILE_SIZE=5242880
AWS_REGION="us-east-1"
S3_BUCKET_NAME="${project_name}-uploads"
EOF

# Create database directory and set permissions
mkdir -p database
chown messagewall:messagewall database
chmod 755 database

# If application files exist, set them up
if [ -f "package.json" ]; then
    echo "Setting up application..."
    
    # Install dependencies as messagewall user
    sudo -u messagewall npm ci
    
    # Generate Prisma client (will use SQLite)
    sudo -u messagewall npx prisma generate
    
    # Run database migrations
    sudo -u messagewall npx prisma migrate deploy
    
    # Seed database
    sudo -u messagewall npm run db:seed || echo "Seeding skipped (script may not exist)"
    
    # Build application
    sudo -u messagewall npm run build
else
    echo "No package.json found. Application setup skipped."
fi

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'message-wall',
    script: 'server.js',
    cwd: '/var/www/message-wall',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      SOCKET_PORT: 3001
    },
    instances: 1,  // Single instance for t2.micro
    exec_mode: 'fork',  // Fork mode uses less memory than cluster
    watch: false,
    max_memory_restart: '400M',  # Conservative limit for t2.micro
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    autorestart: true,
    max_restarts: 5,
    min_uptime: '10s'
  }]
}
EOF

# Set up log rotation to prevent disk space issues
cat > /etc/logrotate.d/messagewall << EOF
/var/www/message-wall/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 messagewall messagewall
    postrotate
        sudo -u messagewall pm2 reloadLogs
    endscript
}
EOF

# Configure Nginx for simple proxy
cat > /etc/nginx/conf.d/messagewall.conf << 'EOF'
upstream nextjs_upstream {
  server 127.0.0.1:3000;
}

upstream socket_upstream {
  server 127.0.0.1:3001;
}

server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Main application
    location / {
        proxy_pass http://nextjs_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }

    # WebSocket for real-time updates
    location /socket.io/ {
        proxy_pass http://socket_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files (if they exist)
    location /_next/static {
        alias /var/www/message-wall/.next/static;
        expires 365d;
        access_log off;
    }

    # Upload files
    location /uploads {
        alias /var/www/uploads;
        expires 30d;
        access_log off;
    }
}
EOF

# Remove default nginx config
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
rm -f /etc/nginx/conf.d/default.conf 2>/dev/null || true

# Start services
systemctl start nginx
systemctl enable nginx

# Start PM2 as messagewall user if application exists
if [ -f "package.json" ]; then
    sudo -u messagewall pm2 start ecosystem.config.js
    sudo -u messagewall pm2 save
    
    # Set up PM2 to start on boot
    pm2 startup systemd -u messagewall --hp /home/messagewall
fi

# Create a simple status script
cat > /home/ec2-user/status.sh << 'EOF'
#!/bin/bash
echo "=== Message Wall Status ==="
echo "Nginx status:"
systemctl status nginx --no-pager -l

echo -e "\nPM2 status:"
sudo -u messagewall pm2 status

echo -e "\nDisk usage:"
df -h

echo -e "\nMemory usage:"
free -h

echo -e "\nRecent logs:"
sudo -u messagewall pm2 logs --lines 5
EOF

chmod +x /home/ec2-user/status.sh

# Create deployment helper script
cat > /home/ec2-user/deploy.sh << 'EOF'
#!/bin/bash
echo "Updating Message Wall application..."
cd /var/www/message-wall
sudo -u messagewall git pull origin main
sudo -u messagewall npm ci
sudo -u messagewall npx prisma generate
sudo -u messagewall npx prisma migrate deploy
sudo -u messagewall npm run build
sudo -u messagewall pm2 reload ecosystem.config.js
systemctl reload nginx
echo "Deployment complete!"
EOF

chmod +x /home/ec2-user/deploy.sh

echo "Free tier user data script completed successfully!"
echo "Application will be available at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3000"
echo "Use './status.sh' to check application status"
echo "Use './deploy.sh' to update the application"
