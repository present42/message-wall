# AWS Free Tier Deployment Guide

Deploy your Message Wall application using **only AWS Free Tier resources** - completely free for the first 12 months!

## 💰 Cost Breakdown

### Free Tier (First 12 months)

- **EC2 t2.micro**: 750 hours/month ✅ **FREE**
- **EBS Storage**: 30 GB ✅ **FREE** (we use 20GB)
- **Elastic IP**: ✅ **FREE** (when attached)
- **S3 Storage**: 5GB ✅ **FREE**
- **Data Transfer**: 15GB/month ✅ **FREE**
- **Total Cost**: **$0/month**

### After Free Tier (13+ months)

- **EC2 t2.micro**: ~$8.50/month
- **EBS 20GB**: ~$2.00/month
- **Elastic IP**: ~$0.00/month (attached)
- **S3 Storage**: ~$0.12/month (5GB)
- **Data Transfer**: ~$1.00/month (average)
- **Total Cost**: **~$11.62/month**

## 🏗️ What Gets Deployed

- **Single EC2 t2.micro** instance (1 vCPU, 1GB RAM)
- **SQLite database** (file-based, no RDS costs)
- **Nginx reverse proxy** (handles web traffic)
- **PM2 process manager** (keeps app running)
- **S3 bucket** for file uploads
- **Elastic IP** for consistent access

## 🚀 Quick Start

### 1. Prerequisites Setup

```powershell
# Install AWS CLI
# Download from: https://aws.amazon.com/cli/

# Install Terraform
# Download from: https://terraform.io/downloads

# Configure AWS credentials
aws configure
```

### 2. Get Your Public IP

```powershell
.\deploy-freetier.ps1 -GetMyIP
```

### 3. Create SSH Key Pair

```powershell
.\deploy-freetier.ps1 -CreateKeyPair -KeyName "messagewall-key"
```

### 4. Deploy to AWS

```powershell
.\deploy-freetier.ps1 -KeyName "messagewall-key" -MyIP "YOUR.IP.ADDRESS.HERE"
```

## 📋 Detailed Steps

### Step 1: Environment Setup

1. **Create AWS Account** (if you don't have one)

   - Sign up at [aws.amazon.com](https://aws.amazon.com)
   - Verify email and add payment method (won't be charged with free tier)

2. **Install Required Tools**

   ```powershell
   # Check if tools are installed
   aws --version
   terraform --version
   ```

3. **Configure AWS CLI**
   ```powershell
   aws configure
   # Enter your Access Key ID
   # Enter your Secret Access Key
   # Region: us-east-1 (recommended for free tier)
   # Output format: json
   ```

### Step 2: Prepare Application

1. **Test Locally First** (Optional but recommended)

   ```powershell
   # Test with free tier configuration
   .\run-docker.ps1 -Build -FreeTier

   # Access at http://localhost:3000
   # Login: admin / admin123

   # Stop when done testing
   .\run-docker.ps1 -Stop
   ```

### Step 3: Deploy Infrastructure

1. **Get Your IP Address**

   ```powershell
   .\deploy-freetier.ps1 -GetMyIP
   # Note the IP address shown
   ```

2. **Create SSH Key Pair**

   ```powershell
   .\deploy-freetier.ps1 -CreateKeyPair -KeyName "my-messagewall-key"
   # Key will be saved to: %USERPROFILE%\.ssh\my-messagewall-key.pem
   ```

3. **Deploy to AWS**

   ```powershell
   .\deploy-freetier.ps1 -KeyName "my-messagewall-key" -MyIP "123.456.789.0"
   ```

4. **Wait for Setup** (5-10 minutes)
   The script will:
   - Create EC2 instance
   - Install Node.js, PM2, Nginx
   - Set up SQLite database
   - Configure reverse proxy
   - Start the application

### Step 4: Upload Your Application

Since this is a public GitHub repo, you'll need to upload your code to the server:

1. **SSH into your instance:**

   ```powershell
   ssh -i %USERPROFILE%\.ssh\my-messagewall-key.pem ec2-user@YOUR.IP.ADDRESS
   ```

2. **Upload your code** (choose one method):

   **Method A: GitHub (if public repo)**

   ```bash
   cd /var/www
   sudo rm -rf message-wall
   sudo git clone https://github.com/your-username/message-wall.git
   sudo chown -R messagewall:messagewall message-wall
   /home/ec2-user/deploy.sh
   ```

   **Method B: SCP Upload (for private code)**

   ```powershell
   # From your local machine
   scp -i %USERPROFILE%\.ssh\my-messagewall-key.pem -r . ec2-user@YOUR.IP.ADDRESS:/tmp/messagewall

   # Then on the server:
   sudo rm -rf /var/www/message-wall
   sudo mv /tmp/messagewall /var/www/message-wall
   sudo chown -R messagewall:messagewall /var/www/message-wall
   /home/ec2-user/deploy.sh
   ```

### Step 5: Access Your Application

1. **Check Status:**

   ```bash
   ./status.sh
   ```

2. **Access Application:**

   - URL: `http://YOUR.IP.ADDRESS:3000`
   - Admin Login: `admin` / `admin123`

3. **Change Default Password:**
   - Go to User Management
   - Create new admin user
   - Delete default admin (recommended)

## 🔧 Management Commands

### On the EC2 Instance:

```bash
# Check application status
./status.sh

# Update application (after uploading new code)
./deploy.sh

# View setup logs
sudo tail -f /var/log/user-data.log

# View application logs
sudo -u messagewall pm2 logs

# Restart application
sudo -u messagewall pm2 restart message-wall

# View nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### From Your Local Machine:

```powershell
# SSH into instance
ssh -i %USERPROFILE%\.ssh\my-messagewall-key.pem ec2-user@YOUR.IP.ADDRESS

# Check Terraform status
cd terraform-freetier
terraform show

# Update infrastructure
terraform apply -var="key_name=my-messagewall-key" -var="my_ip=YOUR.IP"

# Destroy everything (careful!)
terraform destroy -var="key_name=my-messagewall-key" -var="my_ip=YOUR.IP"
```

## 🔒 Security Best Practices

### Implemented Security:

- SSH access restricted to your IP only
- Application runs as non-root user
- Security groups limit network access
- Nginx handles reverse proxy with security headers

### Recommended Additional Steps:

1. **Change Default Passwords:**

   - Change admin password immediately
   - Use strong passwords

2. **Regular Updates:**

   ```bash
   # Update system packages
   sudo yum update -y

   # Update Node.js dependencies
   cd /var/www/message-wall
   sudo -u messagewall npm audit fix
   ```

3. **Backup Database:**

   ```bash
   # Backup SQLite database
   sudo cp /var/www/message-wall/database/messagewall.db /home/ec2-user/backup-$(date +%Y%m%d).db
   ```

4. **Monitor Disk Usage:**
   ```bash
   df -h  # Check disk space
   du -sh /var/www/uploads  # Check upload folder size
   ```

## 📊 Free Tier Limits & Monitoring

### Monthly Limits:

- **EC2 Hours**: 750 hours (31 days × 24 hours = 744 hours) ✅
- **EBS Storage**: 30GB (we use 20GB) ✅
- **Data Transfer Out**: 15GB ✅
- **S3 Requests**: 20,000 GET, 2,000 PUT ✅

### Monitor Usage:

1. **AWS Console** → Billing & Cost Management
2. **CloudWatch** → Metrics
3. **EC2** → Instances (check running time)

### Optimization Tips:

- **Stop instance when not needed** (saves compute hours)
- **Use compression** for uploads to save S3 storage
- **Monitor data transfer** to stay under 15GB/month
- **Clean old logs** to save disk space

## 🆘 Troubleshooting

### Common Issues:

**1. Application not accessible:**

```bash
# Check if services are running
./status.sh

# Check nginx status
sudo systemctl status nginx

# Check PM2 status
sudo -u messagewall pm2 list
```

**2. Out of memory errors:**

```bash
# Check memory usage
free -h

# Restart PM2 with memory limit
sudo -u messagewall pm2 restart message-wall
```

**3. Database issues:**

```bash
# Check database file
ls -la /var/www/message-wall/database/

# Reset database (CAUTION: This deletes all data!)
sudo -u messagewall npm run db:migrate -- --reset
```

**4. Disk space full:**

```bash
# Check disk usage
df -h

# Clean logs
sudo find /var/log -name "*.log" -type f -size +100M -delete
sudo -u messagewall pm2 flush
```

### Getting Help:

1. **Check logs first:**

   ```bash
   # Setup logs
   sudo tail -f /var/log/user-data.log

   # Application logs
   sudo -u messagewall pm2 logs --lines 50

   # System logs
   sudo journalctl -u nginx -n 50
   ```

2. **Verify AWS resources:**

   ```powershell
   # Check instance status
   aws ec2 describe-instances

   # Check security groups
   aws ec2 describe-security-groups
   ```

## 🧹 Cleanup

To completely remove all AWS resources:

```powershell
cd terraform-freetier
terraform destroy -var="key_name=my-messagewall-key" -var="my_ip=YOUR.IP"
```

⚠️ **Warning**: This will permanently delete everything including your database!

## 📚 What You Get

### Free Tier Deployment Includes:

- ✅ Production-ready Next.js application
- ✅ SQLite database with admin authentication
- ✅ File upload capability with S3 integration
- ✅ Real-time WebSocket messaging
- ✅ Nginx reverse proxy with security headers
- ✅ PM2 process management with auto-restart
- ✅ Automatic SSL-ready setup (manual cert setup required)
- ✅ Monitoring and logging infrastructure
- ✅ Easy deployment and update scripts

### Perfect For:

- **Personal projects**
- **Small team collaboration**
- **Learning and experimentation**
- **MVP and prototypes**
- **Low-traffic production apps**

---

**Start your free deployment now!** The entire setup takes less than 15 minutes and costs nothing for the first year.
