#!/bin/bash

# User data script for EC2 instances
# This script runs when the instance starts up

set -e

# Log everything
exec > >(tee /var/log/user-data.log)
exec 2>&1

echo "Starting user data script..."

# Update system
yum update -y

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# Install PM2
npm install -g pm2

# Install nginx
yum install -y nginx

# Install git
yum install -y git

# Create application user
useradd -m -s /bin/bash messagewall

# Create application directory
mkdir -p /var/www/message-wall
chown messagewall:messagewall /var/www/message-wall

# Create uploads directory
mkdir -p /var/www/uploads
chown messagewall:messagewall /var/www/uploads

# Create logs directory
mkdir -p /var/www/message-wall/logs
chown messagewall:messagewall /var/www/message-wall/logs

# Clone repository (you'll need to update this with your actual repo)
cd /var/www
git clone https://github.com/your-username/message-wall.git
chown -R messagewall:messagewall message-wall

# Switch to application user
cd /var/www/message-wall

# Create environment file
cat > .env << EOF
NODE_ENV=production
PORT=3000
SOCKET_PORT=3001
DATABASE_URL="postgresql://messagewall:${db_password}@${db_endpoint}/messagewall"
NEXTAUTH_URL="https://${domain_name}"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
UPLOAD_DIR="/var/www/uploads"
MAX_FILE_SIZE=5242880
EOF

# Install dependencies
sudo -u messagewall npm ci

# Generate Prisma client
sudo -u messagewall npm run db:generate

# Run database migrations
sudo -u messagewall npm run db:migrate

# Seed database with admin user
sudo -u messagewall npm run db:seed

# Build application
sudo -u messagewall npm run build

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
    instances: 1,
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
}
EOF

# Start application with PM2
sudo -u messagewall pm2 start ecosystem.config.js

# Save PM2 configuration
sudo -u messagewall pm2 save

# Setup PM2 startup
pm2 startup systemd -u messagewall --hp /home/messagewall

# Configure Nginx
cat > /etc/nginx/conf.d/messagewall.conf << 'EOF'
upstream nextjs_upstream {
  server 127.0.0.1:3000;
}

upstream socket_upstream {
  server 127.0.0.1:3001;
}

server {
    listen 80;
    server_name _;

    # Health check endpoint for ALB
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

    # Static files
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

# Start and enable nginx
systemctl start nginx
systemctl enable nginx

# Install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
rpm -U ./amazon-cloudwatch-agent.rpm

echo "User data script completed successfully!"
