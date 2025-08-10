# PowerShell AWS Deployment Script for Message Wall
# This script helps deploy the application to AWS from Windows

param(
    [string]$DbPassword,
    [string]$DomainName = "",
    [switch]$SkipBuild = $false,
    [switch]$Help
)

# Show help if requested
if ($Help) {
    Write-Host @"
AWS Deployment Script for Message Wall

Usage: .\deploy-aws.ps1 [parameters]

Parameters:
  -DbPassword <string>    Database password for RDS instance
  -DomainName <string>    Your domain name (optional)
  -SkipBuild             Skip local build process
  -Help                  Show this help message

Examples:
  .\deploy-aws.ps1 -DbPassword "MySecurePassword123"
  .\deploy-aws.ps1 -DbPassword "MySecurePassword123" -DomainName "myapp.com"
"@
    exit 0
}

# Color functions
function Write-Info { param($Message) Write-Host "[INFO] $Message" -ForegroundColor Blue }
function Write-Success { param($Message) Write-Host "[SUCCESS] $Message" -ForegroundColor Green }
function Write-Warning { param($Message) Write-Host "[WARNING] $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "[ERROR] $Message" -ForegroundColor Red }

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
    
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        $missing += "Node.js"
    }
    
    if ($missing.Count -gt 0) {
        Write-Error "Missing required tools: $($missing -join ', ')"
        Write-Info "Please install these tools and try again."
        exit 1
    }
    
    Write-Success "All requirements are met!"
}

# Build application
function Build-Application {
    if ($SkipBuild) {
        Write-Warning "Skipping build process as requested."
        return
    }
    
    Write-Info "Building application locally..."
    
    try {
        # Install dependencies
        npm ci
        if ($LASTEXITCODE -ne 0) { throw "npm ci failed" }
        
        # Generate Prisma client
        npm run db:generate
        if ($LASTEXITCODE -ne 0) { throw "Prisma generate failed" }
        
        # Build Next.js application
        npm run build
        if ($LASTEXITCODE -ne 0) { throw "Next.js build failed" }
        
        Write-Success "Application built successfully!"
    }
    catch {
        Write-Error "Build failed: $_"
        exit 1
    }
}

# Deploy infrastructure
function Deploy-Infrastructure {
    Write-Info "Deploying AWS infrastructure..."
    
    if (-not (Test-Path "terraform")) {
        Write-Error "Terraform directory not found. Please ensure terraform folder exists."
        exit 1
    }
    
    Push-Location terraform
    
    try {
        # Initialize Terraform
        Write-Info "Initializing Terraform..."
        terraform init
        if ($LASTEXITCODE -ne 0) { throw "Terraform init failed" }
        
        # Plan deployment
        Write-Info "Planning infrastructure deployment..."
        $planArgs = @(
            "plan"
            "-var=db_password=$DbPassword"
        )
        if ($DomainName) {
            $planArgs += "-var=domain_name=$DomainName"
        }
        
        & terraform @planArgs
        if ($LASTEXITCODE -ne 0) { throw "Terraform plan failed" }
        
        # Ask for confirmation
        $response = Read-Host "Do you want to proceed with the deployment? (y/N)"
        if ($response -notmatch '^[Yy]$') {
            Write-Warning "Deployment cancelled."
            return
        }
        
        # Apply infrastructure
        Write-Info "Applying infrastructure changes..."
        $applyArgs = @(
            "apply"
            "-var=db_password=$DbPassword"
            "-auto-approve"
        )
        if ($DomainName) {
            $applyArgs += "-var=domain_name=$DomainName"
        }
        
        & terraform @applyArgs
        if ($LASTEXITCODE -ne 0) { throw "Terraform apply failed" }
        
        # Get outputs
        $albDnsName = terraform output -raw alb_dns_name
        $rdsEndpoint = terraform output -raw rds_endpoint
        $s3Bucket = terraform output -raw s3_bucket_name
        
        Write-Success "Infrastructure deployed successfully!"
        Write-Info "Load Balancer DNS: $albDnsName"
        
        # Store outputs for later use
        $script:AlbDnsName = $albDnsName
        $script:RdsEndpoint = $rdsEndpoint
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

# Setup DNS information
function Show-DnsSetup {
    if ($DomainName -and $script:AlbDnsName) {
        Write-Info "DNS Setup Required:"
        Write-Warning "Please manually update your DNS records:"
        Write-Host "  Record Type: CNAME (or A/ALIAS if using Route 53)"
        Write-Host "  Name: $DomainName"
        Write-Host "  Value: $script:AlbDnsName"
        Write-Info "If using Route 53, you can create an alias record pointing to the ALB."
    }
}

# Main function
function Main {
    Write-Info "🚀 Starting AWS deployment for Message Wall..."
    
    # Check if we're in the correct directory
    if (-not (Test-Path "package.json")) {
        Write-Error "package.json not found. Please run this script from the project root."
        exit 1
    }
    
    # Get database password if not provided
    if (-not $DbPassword) {
        $securePassword = Read-Host "Enter database password" -AsSecureString
        $DbPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
            [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
        )
    }
    
    if ($DbPassword.Length -lt 8) {
        Write-Error "Database password must be at least 8 characters long."
        exit 1
    }
    
    Test-Requirements
    Build-Application
    Deploy-Infrastructure
    Show-DnsSetup
    
    Write-Success "🎉 Deployment completed successfully!"
    
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Wait for the EC2 instances to fully initialize (5-10 minutes)"
    Write-Host "2. Access your application at: http://$($script:AlbDnsName)"
    
    if ($DomainName) {
        Write-Host "3. Update DNS records to point $DomainName to $($script:AlbDnsName)"
        Write-Host "4. Set up SSL certificate using AWS Certificate Manager"
    }
    
    Write-Host "5. Monitor the application using AWS CloudWatch"
    Write-Host ""
    Write-Host "Useful commands:" -ForegroundColor Cyan
    Write-Host "  terraform output                 # View all outputs"
    Write-Host "  aws ec2 describe-instances       # Check EC2 status"
    Write-Host "  aws logs describe-log-groups     # View available log groups"
}

# Run main function
try {
    Main
}
catch {
    Write-Error "Deployment script failed: $_"
    exit 1
}
