#!/bin/bash

set -e

echo "🚀 Starting Message Wall deployment..."

# Color codes for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Make sure you're in the project directory."
    exit 1
fi

# Create logs directory if it doesn't exist
mkdir -p logs

print_status "Pulling latest code from repository..."
git pull origin main

print_status "Installing dependencies..."
npm ci --production

print_status "Generating Prisma client..."
npm run db:generate

print_status "Running database migrations..."
npm run db:migrate

print_status "Building Next.js application..."
npm run build

print_status "Restarting PM2 processes..."
pm2 reload ecosystem.config.js --update-env

print_status "Reloading Nginx configuration..."
sudo systemctl reload nginx

# Check if services are running
print_status "Checking service status..."

if pm2 list | grep -q "message-wall.*online"; then
    print_status "✅ PM2 process is running"
else
    print_error "❌ PM2 process is not running"
    exit 1
fi

if systemctl is-active --quiet nginx; then
    print_status "✅ Nginx is running"
else
    print_error "❌ Nginx is not running"
    exit 1
fi

# Display status
print_status "Deployment Status:"
pm2 list
pm2 logs --lines 10

print_status "🎉 Deployment completed successfully!"
print_warning "Check the logs above for any potential issues."

echo ""
echo "Useful commands:"
echo "  pm2 logs message-wall    # View application logs"
echo "  pm2 restart message-wall # Restart application"
echo "  pm2 monit               # Monitor processes"
echo "  sudo nginx -t           # Test nginx configuration"
