# AWS Free Tier Terraform Deployment Guide

This guide walks you through deploying the Message Wall application on AWS using Terraform, designed to use only AWS Free Tier resources.

## 📋 Prerequisites

### Required
- AWS Account with Free Tier eligibility (first 12 months)
- [AWS CLI](https://aws.amazon.com/cli/) installed and configured
- [Terraform](https://www.terraform.io/downloads.html) installed (>= 1.0)
- SSH key pair created in AWS EC2 Console

### Optional
- Domain name (for custom URL)
- SSL certificate in AWS Certificate Manager (for HTTPS)

## 💰 Cost Estimate

**Month 1-12**: ~$0/month (Free Tier)
- EC2 t2.micro: 750 hours/month (Free)
- EBS storage: 20GB (30GB free)
- S3 storage: 5GB (5GB free)
- Data transfer: 15GB out (15GB free)
- Elastic IP: Free while attached to running instance

**After Free Tier expires**:
- EC2 t2.micro: ~$8.50/month
- EBS 20GB: ~$2/month
- S3 & data transfer: ~$1-2/month
- **Total**: ~$12-13/month

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone https://github.com/your-username/message-wall.git
cd message-wall/terraform
```

### 2. Configure AWS CLI

```bash
aws configure
# Enter your AWS Access Key ID, Secret Access Key, Region, and Output format
```

### 3. Create SSH Key Pair

In AWS Console:
1. Go to EC2 → Key Pairs
2. Click "Create key pair"
3. Name it (e.g., "messagewall-key")
4. Download the .pem file
5. Set permissions: `chmod 400 messagewall-key.pem`

### 4. Configure Variables

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars`:
```hcl
aws_region = "us-east-1"
project_name = "messagewall"
key_name = "messagewall-key"  # Your key pair name
my_ip = "123.45.67.89/32"     # Your public IP from whatismyipaddress.com
```

### 5. Deploy

```bash
# Initialize Terraform
terraform init

# Preview changes
terraform plan

# Deploy infrastructure
terraform apply
```

Type `yes` when prompted. Deployment takes 5-10 minutes.

### 6. Access Your Application

After deployment completes, you'll see outputs like:
```
Outputs:
application_url = "http://12.34.56.78:3000"
admin_url = "http://12.34.56.78:3000/admin"
public_ip = "12.34.56.78"
ssh_command = "ssh -i ~/.ssh/messagewall-key.pem ec2-user@12.34.56.78"
```

## 📁 What Gets Created

### AWS Resources
- **EC2 Instance** (t2.micro): Application server
- **Security Groups**: Network firewall rules  
- **Elastic IP**: Static public IP address
- **S3 Bucket**: File upload storage
- **IAM Role & Policies**: Secure access permissions

### Application Setup
- Node.js 18 runtime
- SQLite database (file-based, no RDS needed)
- PM2 process manager
- Nginx web server (optional reverse proxy)
- SSL/HTTPS ready (with certificate)

## 🔧 Customization

### Environment Variables

The application automatically configures these environment variables:

```bash
NODE_ENV=production
DATABASE_URL="file:./database/messagewall.db"
NEXTAUTH_URL="http://YOUR_IP:3000"
NEXTAUTH_SECRET="auto-generated-secure-secret"
S3_BUCKET_NAME="messagewall-uploads-randomstring"
AWS_REGION="us-east-1"
```

### Custom Domain (Optional)

1. Add to `terraform.tfvars`:
   ```hcl
   domain_name = "messagewall.yourdomain.com"
   ```

2. Update DNS records after deployment:
   - Point your domain to the Elastic IP
   - Or create a CNAME to the public DNS name

### HTTPS/SSL (Optional)

1. Request SSL certificate in AWS Certificate Manager
2. Add to `terraform.tfvars`:
   ```hcl
   ssl_certificate_arn = "arn:aws:acm:us-east-1:123456789012:certificate/..."
   ```

## 🔍 Monitoring & Management

### Check Application Status

```bash
# SSH into server
ssh -i ~/.ssh/your-key.pem ec2-user@YOUR_IP

# Check PM2 status
pm2 status

# View application logs
pm2 logs message-wall

# Restart application
pm2 restart message-wall
```

### Database Management

```bash
# SSH into server
ssh -i ~/.ssh/your-key.pem ec2-user@YOUR_IP

# Access database
cd /var/www/message-wall
npx prisma studio  # Web-based database viewer

# Or use SQLite CLI
sqlite3 database/messagewall.db
```

### File Uploads

Files are stored in S3 bucket. View in AWS Console → S3 → your-bucket-name

## 🛠️ Troubleshooting

### Common Issues

1. **"terraform apply" fails**:
   - Check AWS credentials: `aws sts get-caller-identity`
   - Verify region and key pair name in terraform.tfvars

2. **Can't SSH to instance**:
   - Check security group allows your IP
   - Verify key pair permissions: `chmod 400 your-key.pem`
   - Update `my_ip` in terraform.tfvars if your IP changed

3. **Application not loading**:
   - SSH to server and check: `pm2 status`
   - View logs: `pm2 logs message-wall`
   - Check if port 3000 is accessible in security group

4. **File uploads failing**:
   - Check S3 bucket exists and has proper IAM permissions
   - Verify EC2 instance has IAM role attached

### Get Help

- Check application logs: `pm2 logs message-wall`
- System logs: `sudo tail -f /var/log/cloud-init-output.log`
- AWS support or community forums

## 🧹 Cleanup

To remove all AWS resources and stop billing:

```bash
terraform destroy
```

Type `yes` when prompted. This removes:
- EC2 instance
- Security groups  
- Elastic IP
- S3 bucket (after emptying it)
- IAM roles and policies

**Note**: S3 bucket must be empty before destruction. Delete files manually if needed.

## 📈 Scaling Beyond Free Tier

When you outgrow free tier or need more performance:

1. **Larger Instance**: Change `instance_type` to `t3.small` or `t3.medium`
2. **Database**: Switch to RDS PostgreSQL for better performance
3. **Load Balancer**: Add ALB for high availability
4. **CDN**: Add CloudFront for global content delivery
5. **Auto Scaling**: Add auto-scaling group for traffic spikes

## 🔐 Security Best Practices

- Change default admin password after first login
- Regularly update the application and system packages
- Monitor AWS CloudTrail for access logs
- Consider VPC with private subnets for production
- Enable AWS GuardDuty for threat detection
- Regular security group audits

---

For more deployment options, see the main [DEPLOYMENT.md](../DEPLOYMENT.md) guide.
