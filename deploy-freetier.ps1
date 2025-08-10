# PowerShell AWS Free Tier Deployment Script
# Deploy Message Wall using only AWS Free Tier resources

param(
    [string]$KeyName,
    [string]$MyIP,
    [string]$Region = "us-east-1",
    [switch]$CreateKeyPair,
    [switch]$GetMyIP,
    [switch]$Help
)

if ($Help) {
    Write-Host @"
AWS Free Tier Deployment for Message Wall

This script deploys the application using only AWS Free Tier eligible resources:
- EC2 t2.micro instance (750 hours/month free)
- SQLite database (no RDS costs)
- S3 bucket (5GB storage free)
- Elastic IP (free when attached)

Usage: .\deploy-freetier.ps1 [parameters]

Parameters:
  -KeyName <string>      Name of EC2 Key Pair for SSH access
  -MyIP <string>         Your public IP for SSH access
  -Region <string>       AWS region (default: us-east-1)
  -CreateKeyPair         Create a new EC2 key pair
  -GetMyIP              Show your current public IP
  -Help                 Show this help message

Examples:
  # Get your IP address first
  .\deploy-freetier.ps1 -GetMyIP

  # Create a key pair
  .\deploy-freetier.ps1 -CreateKeyPair -KeyName "my-messagewall-key"

  # Deploy the application
  .\deploy-freetier.ps1 -KeyName "my-messagewall-key" -MyIP "123.456.789.0"

Estimated monthly cost: 
- First 12 months: $0 (Free Tier)
- After free tier: ~$8-12/month
"@
    exit 0
}

# Color functions
function Write-Info { param($Message) Write-Host "[INFO] $Message" -ForegroundColor Blue }
function Write-Success { param($Message) Write-Host "[SUCCESS] $Message" -ForegroundColor Green }
function Write-Warning { param($Message) Write-Host "[WARNING] $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "[ERROR] $Message" -ForegroundColor Red }

# Get current public IP
if ($GetMyIP) {
    try {
        $myIP = (Invoke-RestMethod -Uri "https://api.ipify.org").Trim()
        Write-Success "Your current public IP address is: $myIP"
        Write-Info "Use this IP with the -MyIP parameter: .\deploy-freetier.ps1 -MyIP '$myIP'"
        exit 0
    }
    catch {
        Write-Error "Failed to get public IP address: $_"
        Write-Info "You can manually get your IP from: https://whatismyipaddress.com/"
        exit 1
    }
}

# Create EC2 Key Pair
if ($CreateKeyPair) {
    if (-not $KeyName) {
        Write-Error "KeyName is required when creating a key pair"
        exit 1
    }
    
    Write-Info "Creating EC2 Key Pair: $KeyName"
    
    try {
        $keyOutput = aws ec2 create-key-pair --key-name $KeyName --query 'KeyMaterial' --output text
        
        if ($LASTEXITCODE -eq 0) {
            $keyPath = "$env:USERPROFILE\.ssh\$KeyName.pem"
            New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.ssh" | Out-Null
            $keyOutput | Out-File -FilePath $keyPath -Encoding ascii
            
            Write-Success "Key pair created successfully!"
            Write-Info "Private key saved to: $keyPath"
            Write-Warning "Keep this private key file safe - you cannot download it again!"
        }
        else {
            Write-Error "Failed to create key pair. It might already exist."
        }
    }
    catch {
        Write-Error "Error creating key pair: $_"
    }
    
    exit 0
}

# Check requirements
function Test-Requirements {
    Write-Info "Checking requirements..."
    
    $missing = @()
    
    if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
        $missing += "AWS CLI"
    }
    
    if (-not (Get-Command terraform -ErrorAction SilentlyContinue)) {
        $missing += "Terraform"
    }
    
    # Check for pnpm or npm
    $hasPackageManager = $false
    if (Get-Command pnpm -ErrorAction SilentlyContinue) {
        $hasPackageManager = $true
        Write-Info "Found pnpm package manager"
    } elseif (Get-Command npm -ErrorAction SilentlyContinue) {
        $hasPackageManager = $true  
        Write-Info "Found npm package manager"
    }
    
    if (-not $hasPackageManager) {
        $missing += "pnpm or npm"
    }
    
    if ($missing.Count -gt 0) {
        Write-Error "Missing required tools: $($missing -join ', ')"
        Write-Info @"
Please install the missing tools:
- AWS CLI: https://aws.amazon.com/cli/
- Terraform: https://terraform.io/downloads
- pnpm: https://pnpm.io/installation (or npm with Node.js)

Then run: aws configure
"@
        exit 1
    }
    
    # Test AWS credentials
    try {
        $identity = aws sts get-caller-identity --output json | ConvertFrom-Json
        Write-Success "AWS credentials configured for: $($identity.Arn)"
    }
    catch {
        Write-Error "AWS credentials not configured. Run: aws configure"
        exit 1
    }
    
    Write-Success "All requirements met!"
}

# Validate parameters
function Test-Parameters {
    if (-not $KeyName) {
        Write-Error "KeyName is required. Use -CreateKeyPair to create one first."
        exit 1
    }
    
    if (-not $MyIP) {
        Write-Error "MyIP is required for SSH access. Use -GetMyIP to find your IP."
        exit 1
    }
    
    # Validate IP format
    if ($MyIP -notmatch '^(\d{1,3}\.){3}\d{1,3}$') {
        Write-Error "Invalid IP address format: $MyIP"
        exit 1
    }
    
    # Check if key pair exists
    try {
        aws ec2 describe-key-pairs --key-names $KeyName | Out-Null
        Write-Success "Key pair '$KeyName' found in AWS"
    }
    catch {
        Write-Error "Key pair '$KeyName' not found in AWS. Create it first with -CreateKeyPair"
        exit 1
    }
}

# Prepare application
function Build-Application {
    Write-Info "Preparing application for deployment..."
    
    if (-not (Test-Path "package.json")) {
        Write-Error "package.json not found. Please run from the project root directory."
        exit 1
    }
    
    try {
        # Update Prisma schema to use SQLite
        if (Test-Path "prisma\schema.prisma") {
            $schemaContent = Get-Content "prisma\schema.prisma" -Raw
            if ($schemaContent -notmatch 'provider = "sqlite"') {
                Write-Info "Updating Prisma schema to use SQLite..."
                $schemaContent = $schemaContent -replace 'provider = "postgresql"', 'provider = "sqlite"'
                $schemaContent = $schemaContent -replace 'url\s*=\s*env\("DATABASE_URL"\)', 'url = env("DATABASE_URL")'
                $schemaContent | Set-Content "prisma\schema.prisma"
            }
        }
        
        # Install dependencies
        Write-Info "Installing dependencies..."
        if (Test-Path "pnpm-lock.yaml") {
            Write-Info "Using pnpm with existing pnpm-lock.yaml..."
            pnpm install
            if ($LASTEXITCODE -ne 0) { throw "pnpm install failed" }
        } elseif (Test-Path "package-lock.json") {
            Write-Info "Using npm with existing package-lock.json..."
            npm ci
            if ($LASTEXITCODE -ne 0) { throw "npm ci failed" }
        } else {
            Write-Info "No lock file found. Using pnpm install..."
            pnpm install
            if ($LASTEXITCODE -ne 0) { throw "pnpm install failed" }
            Write-Success "Generated pnpm-lock.yaml"
        }
        
        # Generate Prisma client
        Write-Info "Generating Prisma client..."
        pnpm run db:generate
        if ($LASTEXITCODE -ne 0) { throw "Prisma generate failed" }
        
        # Build Next.js application
        Write-Info "Building Next.js application..."
        pnpm run build
        if ($LASTEXITCODE -ne 0) { throw "Next.js build failed" }
        
        Write-Success "Application prepared successfully!"
    }
    catch {
        Write-Error "Failed to prepare application: $_"
        exit 1
    }
}

# Deploy infrastructure
function Deploy-Infrastructure {
    Write-Info "Deploying free tier infrastructure..."
    
    if (-not (Test-Path "terraform-freetier")) {
        Write-Error "terraform-freetier directory not found"
        exit 1
    }
    
    Push-Location "terraform-freetier"
    
    try {
        # Initialize Terraform
        Write-Info "Initializing Terraform..."
        terraform init
        if ($LASTEXITCODE -ne 0) { throw "Terraform init failed" }
        
        # Plan deployment
        Write-Info "Planning deployment..."
        terraform plan -var="key_name=$KeyName" -var="my_ip=$MyIP" -var="aws_region=$Region"
        if ($LASTEXITCODE -ne 0) { throw "Terraform plan failed" }
        
        # Confirm deployment
        $response = Read-Host "Deploy infrastructure? This will create AWS resources (y/N)"
        if ($response -notmatch '^[Yy]$') {
            Write-Warning "Deployment cancelled"
            return
        }
        
        # Apply infrastructure
        Write-Info "Creating AWS resources..."
        terraform apply -var="key_name=$KeyName" -var="my_ip=$MyIP" -var="aws_region=$Region" -auto-approve
        if ($LASTEXITCODE -ne 0) { throw "Terraform apply failed" }
        
        # Get outputs
        $publicIP = terraform output -raw instance_public_ip
        $publicDNS = terraform output -raw instance_public_dns
        $s3Bucket = terraform output -raw s3_bucket_name
        
        Write-Success "Infrastructure deployed successfully!"
        
        # Store outputs for later use
        $script:PublicIP = $publicIP
        $script:PublicDNS = $publicDNS
        $script:S3Bucket = $s3Bucket
        
    }
    catch {
        Write-Error "Infrastructure deployment failed: $_"
        exit 1
    }
    finally {
        Pop-Location
    }
}

# Wait for instance to be ready
function Wait-ForInstance {
    Write-Info "Waiting for EC2 instance to be fully ready..."
    Write-Info "This may take 5-10 minutes for initial setup..."
    
    $timeout = 600  # 10 minutes
    $elapsed = 0
    $interval = 30
    
    while ($elapsed -lt $timeout) {
        try {
            $response = Invoke-WebRequest -Uri "http://$($script:PublicIP)/health" -TimeoutSec 10 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                Write-Success "Instance is ready!"
                return
            }
        }
        catch {
            # Instance not ready yet
        }
        
        Write-Info "Still setting up... ($($elapsed + $interval)s elapsed)"
        Start-Sleep $interval
        $elapsed += $interval
    }
    
    Write-Warning "Instance setup is taking longer than expected."
    Write-Info "You can check the setup progress by SSHing into the instance:"
    Write-Info "ssh -i $env:USERPROFILE\.ssh\$KeyName.pem ec2-user@$($script:PublicIP)"
    Write-Info "Then run: sudo tail -f /var/log/user-data.log"
}

# Deploy application code
function Deploy-Application {
    Write-Info "The application files need to be uploaded to your EC2 instance."
    Write-Info "You have two options:"
    Write-Info ""
    Write-Info "Option 1: Push to GitHub and clone on the server"
    Write-Info "1. Push your code to GitHub"
    Write-Info "2. SSH into the instance: ssh -i $env:USERPROFILE\.ssh\$KeyName.pem ec2-user@$($script:PublicIP)"
    Write-Info "3. Run: cd /var/www && sudo rm -rf message-wall && git clone YOUR_REPO_URL message-wall"
    Write-Info "4. Run: /home/ec2-user/deploy.sh"
    Write-Info ""
    Write-Info "Option 2: Upload files directly (for private repos)"
    Write-Info "1. Use SCP to upload files to the server"
    Write-Info "2. SSH and run the deployment script"
    
    Write-Warning "Remember to update the git clone URL in the user data script!"
}

# Show final information
function Show-Results {
    Write-Success "🎉 Free Tier deployment completed!"
    
    Write-Host ""
    Write-Host "=== Deployment Information ===" -ForegroundColor Cyan
    Write-Host "Instance IP: $($script:PublicIP)"
    Write-Host "Instance DNS: $($script:PublicDNS)"
    Write-Host "Application URL: http://$($script:PublicIP):3000"
    Write-Host "S3 Bucket: $($script:S3Bucket)"
    Write-Host ""
    
    Write-Host "=== SSH Access ===" -ForegroundColor Cyan
    Write-Host "ssh -i $env:USERPROFILE\.ssh\$KeyName.pem ec2-user@$($script:PublicIP)"
    Write-Host ""
    
    Write-Host "=== Useful Commands on Server ===" -ForegroundColor Cyan
    Write-Host "./status.sh          # Check application status"
    Write-Host "./deploy.sh          # Update application"
    Write-Host "sudo tail -f /var/log/user-data.log  # View setup logs"
    Write-Host ""
    
    Write-Host "=== Next Steps ===" -ForegroundColor Yellow
    Write-Host "1. Wait 5-10 minutes for initial setup to complete"
    Write-Host "2. Upload your application code (see instructions above)"
    Write-Host "3. Access your application at: http://$($script:PublicIP):3000"
    Write-Host "4. Login with: admin / admin123"
    Write-Host ""
    
    Write-Host "=== Monthly Costs ===" -ForegroundColor Green
    Write-Host "First 12 months (Free Tier): $0/month"
    Write-Host "After free tier expires: ~$8-12/month"
    Write-Host ""
    
    Write-Host "=== Free Tier Limits ===" -ForegroundColor Yellow
    Write-Host "- EC2: 750 hours/month (t2.micro)"
    Write-Host "- Storage: 30GB EBS"
    Write-Host "- Data Transfer: 15GB/month"
    Write-Host "- S3: 5GB storage, 20K GET, 2K PUT requests"
}

# Main function
function Main {
    Write-Info "🚀 AWS Free Tier Deployment for Message Wall"
    Write-Info "This deployment uses only free tier eligible resources"
    Write-Info ""
    
    Test-Requirements
    Test-Parameters
    Build-Application
    Deploy-Infrastructure
    Wait-ForInstance
    Deploy-Application
    Show-Results
}

# Run main function
try {
    Main
}
catch {
    Write-Error "Deployment failed: $_"
    exit 1
}
