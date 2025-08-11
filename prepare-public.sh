#!/bin/bash

# SSC Hub Message Wall - Public Repository Preparation Script
# This script helps prepare the repository for public release

echo "🚀 SSC Hub Message Wall - Public Repository Preparation"
echo "======================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if file exists and prompt for deletion
check_and_remove() {
    local file=$1
    local description=$2
    
    if [ -e "$file" ]; then
        echo -e "${RED}⚠️  FOUND: $file ${NC}- $description"
        read -p "Do you want to remove $file? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rm -rf "$file"
            echo -e "${GREEN}✅ Removed: $file${NC}"
        else
            echo -e "${YELLOW}⚠️  SKIPPED: $file - Please review manually${NC}"
        fi
    else
        echo -e "${GREEN}✅ Not found: $file (OK)${NC}"
    fi
}

echo -e "\n${YELLOW}Checking for sensitive files...${NC}"

# Environment files
check_and_remove ".env" "Real environment variables"
check_and_remove ".env.local" "Local environment variables"
check_and_remove ".env.production" "Production environment variables"

# AWS and Infrastructure
check_and_remove "terraform-freetier/" "Terraform infrastructure with AWS keys"
check_and_remove "*.pem" "SSH private keys"
check_and_remove "*-key.pem" "AWS key pairs"

# Database files
check_and_remove "database_dump.sql" "Real database data"
check_and_remove "dev.db" "SQLite database file"
check_and_remove "*.db" "Database files"

# Development utilities
check_and_remove "generate-hash.js" "Password hash generator utility"
check_and_remove "healthcheck.py" "Server health check script"
check_and_remove "install-tools.ps1" "Personal setup script"

# Upload directory (may contain user data)
check_and_remove "uploads/" "User uploaded files directory"

echo -e "\n${YELLOW}Checking git configuration...${NC}"

# Check if .env.example exists
if [ -f ".env.example" ]; then
    echo -e "${GREEN}✅ .env.example exists${NC}"
else
    echo -e "${RED}❌ .env.example missing - Create this file!${NC}"
fi

# Check if sensitive files are in .gitignore
if grep -q ".env" .gitignore && grep -q "*.pem" .gitignore; then
    echo -e "${GREEN}✅ .gitignore updated${NC}"
else
    echo -e "${YELLOW}⚠️  Check .gitignore for sensitive file patterns${NC}"
fi

echo -e "\n${YELLOW}Documentation checklist:${NC}"
echo "- [ ] README.md updated with setup instructions"
echo "- [ ] CONTRIBUTING.md created"
echo "- [ ] LICENSE file added"
echo "- [ ] DEPLOYMENT.md created with generic instructions"
echo "- [ ] GitHub issue templates created"

echo -e "\n${YELLOW}Final steps:${NC}"
echo "1. Test the complete setup on a fresh machine"
echo "2. Review all documentation for personal/specific information"
echo "3. Consider cleaning git history if it contains sensitive data"
echo "4. Add repository description and topics on GitHub"
echo "5. Test the build and deployment process"

echo -e "\n${GREEN}🎉 Cleanup check completed!${NC}"
echo -e "${YELLOW}Please review the CLEANUP_CHECKLIST.md file for detailed instructions.${NC}"

# Check for git history issues
echo -e "\n${YELLOW}Git history check (optional):${NC}"
echo "To check if your git history contains sensitive files:"
echo "git log --name-only --oneline | grep -E '\.env|\.pem|database_dump\.sql'"
echo ""
echo "If found, consider using BFG Repo-Cleaner or git filter-branch to clean history"
