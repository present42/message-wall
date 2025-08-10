# AWS Deployment Guide for Message Wall

This guide will help you deploy your Next.js Message Wall application to AWS using EC2, RDS, and other AWS services.

## Prerequisites

1. AWS Account with appropriate permissions
2. AWS CLI installed and configured
3. Domain name (optional but recommended)
4. SSL certificate (for HTTPS)

## Architecture Overview

- **EC2 Instance**: Host the Next.js application
- **RDS PostgreSQL**: Database (replacing SQLite)
- **S3**: File uploads and static assets
- **CloudFront**: CDN for static assets
- **Application Load Balancer**: Load balancing and SSL termination
- **Route 53**: DNS management (if using custom domain)

## Step 1: Database Migration to PostgreSQL

Since SQLite is not suitable for production, we'll migrate to PostgreSQL on RDS.

### 1.1 Update Prisma Schema

Update your `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 1.2 Environment Variables

Create `.env.production`:

```env
# Database
DATABASE_URL="postgresql://username:password@your-rds-endpoint:5432/messagewall"

# NextAuth
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-super-secret-key-here"

# File Upload
UPLOAD_DIR="/var/www/uploads"
MAX_FILE_SIZE=5242880

# WebSocket
SOCKET_PORT=3001
```

## Step 2: AWS Infrastructure Setup

### 2.1 RDS PostgreSQL Database

```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier messagewall-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password YourSecurePassword123 \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxxxxxxxx \
  --db-name messagewall \
  --backup-retention-period 7 \
  --multi-az \
  --storage-encrypted
```

### 2.2 EC2 Instance

Create an EC2 instance with the following specifications:

- Instance Type: t3.small or larger
- AMI: Amazon Linux 2023
- Security Group: Allow HTTP (80), HTTPS (443), SSH (22), and WebSocket (3001)

## Step 3: Server Configuration

### 3.1 Install Dependencies

```bash
# Update system
sudo yum update -y

# Install Node.js 18+
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install nginx for reverse proxy
sudo yum install -y nginx

# Install git
sudo yum install -y git
```

### 3.2 Application Setup

```bash
# Clone your repository
cd /var/www
sudo git clone https://github.com/your-username/message-wall.git
sudo chown -R ec2-user:ec2-user message-wall
cd message-wall

# Install dependencies
npm install

# Set up environment
cp .env.production .env

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Build application
npm run build
```

## Step 4: Nginx Configuration

Create `/etc/nginx/conf.d/messagewall.conf`:

```nginx
upstream nextjs_upstream {
  server 127.0.0.1:3000;
}

upstream socket_upstream {
  server 127.0.0.1:3001;
}

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Configuration
    ssl_certificate /etc/nginx/ssl/your-domain.crt;
    ssl_certificate_key /etc/nginx/ssl/your-domain.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

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

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
}
```

## Step 5: PM2 Configuration

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: "message-wall",
      script: "npm",
      args: "start",
      cwd: "/var/www/message-wall",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      instances: 1,
      exec_mode: "cluster",
      watch: false,
      max_memory_restart: "1G",
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_file: "./logs/combined.log",
      time: true,
    },
  ],
};
```

## Step 6: SSL Certificate

### Option A: Let's Encrypt (Free)

```bash
# Install certbot
sudo yum install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

### Option B: AWS Certificate Manager

Use ACM with Application Load Balancer for automatic SSL management.

## Step 7: Deployment Script

Create `deploy.sh`:

```bash
#!/bin/bash

set -e

echo "🚀 Deploying Message Wall..."

# Pull latest code
git pull origin main

# Install dependencies
npm ci

# Build application
npm run build

# Run database migrations
npm run db:migrate

# Restart application
pm2 reload ecosystem.config.js

# Restart nginx
sudo systemctl reload nginx

echo "✅ Deployment complete!"
```

## Step 8: Monitoring and Logging

### 8.1 CloudWatch Setup

```bash
# Install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
sudo rpm -U ./amazon-cloudwatch-agent.rpm

# Configure CloudWatch agent
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard
```

### 8.2 Log Rotation

Create `/etc/logrotate.d/messagewall`:

```
/var/www/message-wall/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 ec2-user ec2-user
    postrotate
        pm2 reloadLogs
    endscript
}
```

## Step 9: Security Considerations

1. **Security Groups**: Restrict access to necessary ports only
2. **IAM Roles**: Use EC2 instance roles instead of access keys
3. **VPC**: Deploy in private subnets with NAT Gateway
4. **Database Security**: Enable encryption at rest and in transit
5. **Backup Strategy**: Set up automated RDS backups
6. **Monitoring**: Set up CloudWatch alarms for critical metrics

## Step 10: Performance Optimization

1. **CDN**: Use CloudFront for static assets
2. **Caching**: Implement Redis for session and data caching
3. **Database**: Use connection pooling
4. **Images**: Optimize and use Next.js Image component
5. **Monitoring**: Set up APM with tools like New Relic or Datadog

## Commands Summary

```bash
# On your local machine
npm run build

# On AWS server
sudo systemctl start nginx
sudo systemctl enable nginx
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# SSL with Let's Encrypt
sudo certbot --nginx -d your-domain.com

# Check status
pm2 status
sudo systemctl status nginx
```

This setup provides a production-ready deployment of your Message Wall application on AWS with proper security, monitoring, and scalability considerations.
