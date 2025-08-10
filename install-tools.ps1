# Quick Install Script for Deployment Tools
# Run this script as Administrator if using winget

Write-Host "🔧 Installing deployment tools..." -ForegroundColor Green

# Check if winget is available
try {
    winget --version | Out-Null
    $wingetAvailable = $true
    Write-Host "✓ Found winget package manager" -ForegroundColor Green
} catch {
    $wingetAvailable = $false
    Write-Host "⚠ winget not available, will provide manual instructions" -ForegroundColor Yellow
}

if ($wingetAvailable) {
    Write-Host "Installing AWS CLI..." -ForegroundColor Blue
    winget install Amazon.AWSCLI --accept-package-agreements --accept-source-agreements
    
    Write-Host "Installing Terraform..." -ForegroundColor Blue
    winget install HashiCorp.Terraform --accept-package-agreements --accept-source-agreements
    
    Write-Host "✅ Installation completed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Close and reopen PowerShell"
    Write-Host "2. Run: aws configure"
    Write-Host "3. Enter your AWS credentials"
    Write-Host "4. Run the deployment script again"
} else {
    Write-Host "Manual installation required:" -ForegroundColor Yellow
    Write-Host "1. AWS CLI: https://aws.amazon.com/cli/"
    Write-Host "2. Terraform: https://terraform.io/downloads"
    Write-Host "3. Add both to your PATH environment variable"
    Write-Host "4. Restart PowerShell"
    Write-Host "5. Run: aws configure"
}

# Check if tools are already installed
Write-Host ""
Write-Host "Checking current installation status:" -ForegroundColor Blue

try {
    $awsVersion = aws --version 2>$null
    Write-Host "✓ AWS CLI: $awsVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ AWS CLI not found" -ForegroundColor Red
}

try {
    $terraformVersion = terraform --version 2>$null | Select-Object -First 1
    Write-Host "✓ Terraform: $terraformVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Terraform not found" -ForegroundColor Red
}
