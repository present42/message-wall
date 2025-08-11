# SSC Hub Message Wall - Public Repository Preparation Script
# PowerShell version for Windows users

Write-Host "🚀 SSC Hub Message Wall - Public Repository Preparation" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan

# Function to check if file exists and prompt for deletion
function Check-And-Remove {
    param(
        [string]$FilePath,
        [string]$Description
    )
    
    if (Test-Path $FilePath) {
        Write-Host "⚠️  FOUND: $FilePath" -ForegroundColor Red -NoNewline
        Write-Host " - $Description"
        $choice = Read-Host "Do you want to remove $FilePath? (y/N)"
        if ($choice -eq 'y' -or $choice -eq 'Y') {
            Remove-Item -Path $FilePath -Recurse -Force
            Write-Host "✅ Removed: $FilePath" -ForegroundColor Green
        } else {
            Write-Host "⚠️  SKIPPED: $FilePath - Please review manually" -ForegroundColor Yellow
        }
    } else {
        Write-Host "✅ Not found: $FilePath (OK)" -ForegroundColor Green
    }
}

Write-Host "`nChecking for sensitive files..." -ForegroundColor Yellow

# Environment files
Check-And-Remove ".env" "Real environment variables"
Check-And-Remove ".env.local" "Local environment variables"
Check-And-Remove ".env.production" "Production environment variables"

# AWS and Infrastructure
Check-And-Remove "terraform-freetier" "Terraform infrastructure with AWS keys"
Check-And-Remove "*.pem" "SSH private keys"

# Database files
Check-And-Remove "database_dump.sql" "Real database data"
Check-And-Remove "dev.db" "SQLite database file"

# Development utilities
Check-And-Remove "generate-hash.js" "Password hash generator utility"
Check-And-Remove "healthcheck.py" "Server health check script"
Check-And-Remove "install-tools.ps1" "Personal setup script"

# Upload directory
Check-And-Remove "uploads" "User uploaded files directory"

Write-Host "`nChecking git configuration..." -ForegroundColor Yellow

# Check if .env.example exists
if (Test-Path ".env.example") {
    Write-Host "✅ .env.example exists" -ForegroundColor Green
} else {
    Write-Host "❌ .env.example missing - Create this file!" -ForegroundColor Red
}

# Check if .gitignore exists and has basic patterns
if (Test-Path ".gitignore") {
    $gitignoreContent = Get-Content ".gitignore" -Raw
    if ($gitignoreContent -match "\.env" -and $gitignoreContent -match "\*\.pem") {
        Write-Host "✅ .gitignore updated" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Check .gitignore for sensitive file patterns" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ .gitignore missing!" -ForegroundColor Red
}

Write-Host "`nDocumentation checklist:" -ForegroundColor Yellow
Write-Host "- [ ] README.md updated with setup instructions"
Write-Host "- [ ] CONTRIBUTING.md created"
Write-Host "- [ ] LICENSE file added"
Write-Host "- [ ] DEPLOYMENT.md created with generic instructions"
Write-Host "- [ ] GitHub issue templates created"

Write-Host "`nFinal steps:" -ForegroundColor Yellow
Write-Host "1. Test the complete setup on a fresh machine"
Write-Host "2. Review all documentation for personal/specific information"
Write-Host "3. Consider cleaning git history if it contains sensitive data"
Write-Host "4. Add repository description and topics on GitHub"
Write-Host "5. Test the build and deployment process"

Write-Host "`n🎉 Cleanup check completed!" -ForegroundColor Green
Write-Host "Please review the CLEANUP_CHECKLIST.md file for detailed instructions." -ForegroundColor Yellow

Write-Host "`nGit history check (optional):" -ForegroundColor Yellow
Write-Host "To check if your git history contains sensitive files:"
Write-Host "git log --name-only --oneline | Select-String -Pattern '\.env|\.pem|database_dump\.sql'"
Write-Host ""
Write-Host "If found, consider using BFG Repo-Cleaner or git filter-branch to clean history"
