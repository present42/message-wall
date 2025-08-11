# Deployment Guide

This guide covers different deployment options for the SSC Hub Message Wall application.

## Table of Contents

- [Environment Setup](#environment-setup)
- [Database Configuration](#database-configuration)
- [Deployment Options](#deployment-options)
  - [Vercel (Recommended)](#vercel-recommended)
  - [Railway](#railway)
  - [Docker](#docker)
  - [AWS EC2](#aws-ec2)
  - [Self-Hosted](#self-hosted)

## Environment Setup

Before deploying, ensure you have all required environment variables set up:

### Required Variables

```env
DATABASE_URL="your-database-connection-string"
NEXTAUTH_SECRET="your-secure-32-character-secret"
NEXTAUTH_URL="https://yourdomain.com"
```

### Optional Variables

```env
UPLOAD_MAX_SIZE="5242880"  # 5MB in bytes
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/gif,image/webp"
WEBSOCKET_PORT="3001"
```

Generate a secure `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

## Database Configuration

### Production Database Setup

#### PostgreSQL (Recommended)

1. Create a PostgreSQL database
2. Update your `DATABASE_URL`:
   ```env
   DATABASE_URL="postgresql://username:password@host:port/database"
   ```

#### SQLite (Not recommended for production)

For small deployments, you can use SQLite:
```env
DATABASE_URL="file:./production.db"
```

### Run Migrations

After setting up your database:

```bash
npx prisma migrate deploy
npx prisma generate
```

## Deployment Options

### Vercel (Recommended)

Vercel provides the easiest deployment for Next.js applications.

#### Steps:

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables
   - Deploy!

3. **Environment Variables in Vercel**:
   - Add all variables from your `.env` file
   - Set `NEXTAUTH_URL` to your Vercel domain

4. **Database Setup**:
   - Use Vercel Postgres or external PostgreSQL
   - Run migrations in Vercel's function environment

### Railway

Railway offers simple deployment with built-in PostgreSQL.

#### Steps:

1. **Connect Repository**:
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub repository

2. **Add PostgreSQL**:
   - Add PostgreSQL service to your project
   - Railway will provide `DATABASE_URL`

3. **Environment Variables**:
   - Add your environment variables in Railway dashboard

4. **Deploy**:
   - Railway automatically deploys on git push

### Docker

Deploy using Docker containers.

#### Build and Run:

```bash
# Build the image
docker build -t message-wall .

# Run with environment file
docker run -p 3000:3000 --env-file .env message-wall
```

#### Docker Compose:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/messagewall
      - NEXTAUTH_SECRET=your-secret-here
      - NEXTAUTH_URL=http://localhost:3000
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: messagewall
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### AWS with Terraform (Infrastructure as Code) ⭐

**Cost**: ~$0/month (Free Tier eligible for first 12 months)

The project includes a complete Terraform configuration for deploying to AWS using only free-tier resources. This is the most comprehensive deployment option with full infrastructure automation.

#### What's Included:
- EC2 t2.micro instance (750 hours/month free)
- 20GB EBS storage (30GB free tier)
- S3 bucket for file uploads (5GB free)
- Security groups with proper access controls
- Elastic IP (1 free per account)
- SSL/HTTPS support ready
- Automated application setup via user data script
- Complete Infrastructure as Code

#### Prerequisites:
- AWS Account with Free Tier eligibility
- AWS CLI installed and configured
- Terraform installed (>= 1.0)
- SSH key pair created in AWS

#### Quick Start:

```bash
# 1. Clone repository
git clone <your-repo-url>
cd message-wall/terraform

# 2. Configure variables
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your AWS key pair and IP

# 3. Deploy infrastructure
terraform init
terraform apply
```

#### 📖 Complete Setup Guide:
For detailed step-by-step instructions, see: **[terraform/README.md](./terraform/README.md)**

#### Benefits:
- ✅ Complete infrastructure automation
- ✅ AWS Free Tier optimized (~$0/month first year)
- ✅ Production-ready setup with security best practices
- ✅ Easy scaling path beyond free tier
- ✅ Infrastructure as Code (version controlled)
- ✅ One-command deployment and cleanup

#### Post-Deployment:
- Application automatically installs and starts
- Uses SQLite database (no RDS needed for free tier)
- PM2 manages the application process
- Nginx can be configured for reverse proxy (optional)

#### Cleanup:
```bash
terraform destroy  # Remove all AWS resources
```

**Note**: The included Terraform configuration is production-ready but uses SQLite for database to stay within free tier limits.

### Self-Hosted

Deploy on your own server.

#### Requirements:

- Linux server with Node.js 18+
- PostgreSQL database
- Nginx (recommended)

#### Steps:

1. **Server Setup**:
   ```bash
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PostgreSQL
   sudo apt-get install -y postgresql postgresql-contrib
   ```

2. **Application Deployment**:
   ```bash
   # Clone and setup
   git clone https://github.com/your-username/message-wall.git
   cd message-wall
   npm install
   npm run build
   
   # Start application
   npm start
   ```

3. **Process Management**:
   Use PM2 for production:
   ```bash
   npm install -g pm2
   pm2 start npm --name "message-wall" -- start
   pm2 save
   pm2 startup
   ```

## Post-Deployment Steps

### 1. Database Setup

Run migrations and create admin user:

```bash
npx prisma migrate deploy
npx prisma db seed  # If you have seed data
```

### 2. Health Check

Verify your deployment:
- Visit your application URL
- Test message submission
- Access admin panel
- Check WebSocket connectivity

### 3. Monitoring

Set up monitoring for:
- Application uptime
- Database connections
- File uploads
- Error logging

## Troubleshooting

### Common Issues:

1. **Database Connection Errors**:
   - Verify `DATABASE_URL` format
   - Check database server status
   - Ensure network connectivity

2. **NextAuth Issues**:
   - Verify `NEXTAUTH_SECRET` is set
   - Check `NEXTAUTH_URL` matches your domain
   - Ensure cookies are working

3. **File Upload Issues**:
   - Check file permissions on uploads directory
   - Verify file size limits
   - Ensure disk space availability

4. **WebSocket Connection Issues**:
   - Check proxy configuration
   - Verify WebSocket port accessibility
   - Review firewall settings

### Getting Help:

- Check application logs: `pm2 logs message-wall`
- Review database logs
- Check server error logs: `tail -f /var/log/nginx/error.log`
- Create an issue on GitHub with detailed error information

---

For additional help, please refer to our [main documentation](../README.md) or create an issue on GitHub.
