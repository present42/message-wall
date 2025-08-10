# Message Wall - AWS Deployment

This directory contains all the necessary files and configurations to deploy your Message Wall application on AWS infrastructure.

## 🏗️ Architecture

The AWS deployment creates:

- **Application Load Balancer (ALB)** - Routes traffic and handles SSL termination
- **Auto Scaling Group** - Manages EC2 instances for high availability
- **EC2 Instances** - Hosts the Next.js application with PM2
- **RDS PostgreSQL** - Managed database service
- **S3 Bucket** - File uploads and static assets storage
- **VPC & Networking** - Secure network infrastructure
- **CloudWatch** - Monitoring and logging

## 📋 Prerequisites

### Required Tools

- **AWS CLI** - [Install Guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- **Terraform** - [Install Guide](https://developer.hashicorp.com/terraform/downloads)
- **Node.js 18+** - [Install Guide](https://nodejs.org/)

### AWS Setup

1. Create an AWS account
2. Configure AWS CLI with appropriate credentials:
   ```powershell
   aws configure
   ```
3. Ensure your IAM user has permissions for:
   - EC2 (instances, security groups, load balancers)
   - RDS (database creation and management)
   - S3 (bucket creation and management)
   - VPC (networking resources)
   - IAM (for EC2 instance roles)

## 🚀 Quick Start

### Option 1: Automated Deployment (Recommended)

Run the PowerShell deployment script:

```powershell
# Basic deployment
.\deploy-aws.ps1 -DbPassword "YourSecurePassword123"

# With custom domain
.\deploy-aws.ps1 -DbPassword "YourSecurePassword123" -DomainName "yourdomain.com"

# Skip local build (if already built)
.\deploy-aws.ps1 -DbPassword "YourSecurePassword123" -SkipBuild
```

### Option 2: Manual Deployment

1. **Build the application:**

   ```powershell
   npm ci
   npm run db:generate
   npm run build
   ```

2. **Deploy infrastructure:**

   ```powershell
   cd terraform
   terraform init
   terraform plan -var="db_password=YourSecurePassword123"
   terraform apply -var="db_password=YourSecurePassword123"
   ```

3. **Get deployment info:**
   ```powershell
   terraform output
   ```

## 🌐 Local Testing with Docker

Before deploying to AWS, you can test locally using Docker:

```powershell
# Build and start all services
.\run-docker.ps1 -Build

# View logs
.\run-docker.ps1 -Logs

# Stop services
.\run-docker.ps1 -Stop

# Clean up everything
.\run-docker.ps1 -Clean
```

## 🔧 Configuration

### Environment Variables

The deployment automatically creates these environment variables on EC2:

```env
NODE_ENV=production
PORT=3000
SOCKET_PORT=3001
DATABASE_URL=postgresql://username:password@rds-endpoint/messagewall
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=auto-generated-secret
UPLOAD_DIR=/var/www/uploads
MAX_FILE_SIZE=5242880
```

### Database Migration

The deployment automatically:

1. Creates PostgreSQL database on RDS
2. Runs Prisma migrations
3. Seeds the database with default admin user
4. Configures connection pooling

**Default Admin Credentials:**

- Username: `admin`
- Password: `admin123`

⚠️ **Change the default password immediately after first login!**

## 📊 Monitoring & Maintenance

### Accessing Your Application

After deployment, your application will be available at:

- **Load Balancer URL:** `http://your-alb-dns-name.amazonaws.com`
- **Custom Domain:** `https://your-domain.com` (after DNS setup)

### Health Checks

The deployment includes health check endpoints:

- Application health: `/api/health`
- Load balancer health: `/health`

### Logs and Monitoring

1. **Application Logs:**

   ```bash
   # SSH into EC2 instance
   sudo -u messagewall pm2 logs
   ```

2. **System Logs:**

   ```bash
   sudo tail -f /var/log/user-data.log
   sudo tail -f /var/log/nginx/access.log
   ```

3. **CloudWatch Logs:**
   - Check AWS CloudWatch console for centralized logging
   - Metrics for EC2, RDS, and ALB are automatically collected

### Updating the Application

To update your deployed application:

1. **Using the deployment script:**

   ```powershell
   .\deploy-aws.ps1 -DbPassword "YourPassword" -SkipBuild
   ```

2. **Manual update on EC2:**
   ```bash
   cd /var/www/message-wall
   git pull origin main
   npm ci
   npm run build
   pm2 reload ecosystem.config.js
   ```

## 🔒 Security Best Practices

### Implemented Security Features

- **Network Isolation:** VPC with public/private subnets
- **Database Security:** RDS in private subnet with encryption
- **Application Security:** Security groups restrict access to necessary ports
- **SSL/TLS:** ALB handles SSL termination (configure ACM certificate)
- **IAM Roles:** EC2 instances use IAM roles instead of access keys

### Additional Security Steps

1. **SSL Certificate:**

   ```powershell
   # Request certificate in AWS Certificate Manager
   aws acm request-certificate --domain-name yourdomain.com --validation-method DNS
   ```

2. **Update Security Groups:**

   - Restrict SSH access to your IP only
   - Review and limit database access

3. **Regular Updates:**
   - Keep EC2 instances updated
   - Monitor for security advisories
   - Update application dependencies regularly

## 💰 Cost Optimization

### Current Infrastructure Costs (estimated monthly):

- **EC2 t3.small:** ~$15-20
- **RDS db.t3.micro:** ~$15-20
- **ALB:** ~$16-20
- **Data transfer:** Variable based on usage
- **S3 storage:** ~$1-5 depending on uploads

**Total estimated cost:** ~$50-70/month

### Cost Reduction Options:

1. **Use smaller instances** (t3.micro for testing)
2. **Reserved instances** for production (up to 60% savings)
3. **Spot instances** for development environments
4. **S3 lifecycle policies** for old uploads

## 🆘 Troubleshooting

### Common Issues

**1. Deployment fails during Terraform apply:**

```powershell
# Check AWS credentials
aws sts get-caller-identity

# Verify region settings
aws configure list
```

**2. Application not accessible:**

```bash
# Check EC2 instance status
aws ec2 describe-instances --query 'Reservations[].Instances[?State.Name==`running`]'

# Check ALB health
aws elbv2 describe-target-health --target-group-arn your-target-group-arn
```

**3. Database connection issues:**

```bash
# Check RDS status
aws rds describe-db-instances --db-instance-identifier messagewall-db

# Test connection from EC2
psql -h your-rds-endpoint -U messagewall -d messagewall
```

### Getting Support

1. **Check CloudWatch Logs** for detailed error messages
2. **Review user-data logs** on EC2 instances: `/var/log/user-data.log`
3. **Verify security group rules** allow necessary traffic
4. **Check Route 53/DNS settings** if using custom domain

## 🧹 Cleanup

To completely remove all AWS resources:

```powershell
cd terraform
terraform destroy -var="db_password=YourPassword"
```

⚠️ **Warning:** This will permanently delete all data including the database!

## 📚 Additional Resources

- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Prisma Production Checklist](https://www.prisma.io/docs/guides/performance-and-optimization/production-checklist)
- [PM2 Production Guide](https://pm2.keymetrics.io/docs/usage/production/)

---

**Need help?** Check the troubleshooting section above or review the AWS CloudWatch logs for detailed error information.
