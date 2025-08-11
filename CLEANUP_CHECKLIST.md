# Files to Remove Before Going Public

This document lists all files that should be removed or cleaned up before making the repository public.

## 🔒 Security & Sensitive Files

### Environment Files (CRITICAL)
- [ ] `.env` - Contains actual secrets and database URLs
- [ ] `.env.local` - Local development secrets  
- [ ] `.env.production` - Production environment secrets
- [ ] Any other `.env.*` files with real values

### AWS & Infrastructure Files (CRITICAL)
- [ ] `terraform-freetier/` - Contains AWS keys, IPs, and infrastructure code with secrets
- [ ] `terraform-freetier/.terraform/` - Terraform state and cached providers
- [ ] `terraform-freetier/*.tfstate*` - Infrastructure state files with resource IDs
- [ ] `terraform-freetier/iam-permissions.json` - May contain account-specific information
- [ ] `*.pem` files - SSH private keys
- [ ] `*-key.pem` - AWS key pairs
- [ ] `deploy-*.sh` - May contain hardcoded credentials
- [ ] `deploy-*.ps1` - May contain hardcoded credentials
- [ ] `aws-*.json` - AWS configuration files

**Note**: The clean `terraform/` directory should be kept - it contains generic Infrastructure as Code templates for public use.

### Database Files (CRITICAL)
- [ ] `database_dump.sql` - Contains actual user data and potentially sensitive info
- [ ] `dev.db*` - SQLite database files with real data
- [ ] Any `*.db` files in root or prisma directory

## 🧹 Development & Build Files

### Development Utilities
- [ ] `generate-hash.js` - Development utility, not needed in public repo
- [ ] `healthcheck.py` - Server-specific health check script
- [ ] `install-tools.ps1` - Personal development setup script

### Build & Cache Files  
- [ ] `.next/` - Next.js build directory
- [ ] `node_modules/` - Dependencies (already in .gitignore)
- [ ] `*.tsbuildinfo` - TypeScript build info
- [ ] `uploads/` - User uploaded files (may contain personal data)

### IDE & Personal Settings
- [ ] `.vscode/` - Personal VS Code settings
- [ ] `.idea/` - JetBrains IDE files
- [ ] Personal workspace configurations

## 📚 Documentation Files to Update

### Current Documentation Needing Updates
- [ ] `AUTH_SETUP.md` - Remove or update with generic instructions
- [ ] `AWS_DEPLOYMENT.md` - Remove specific AWS account details
- [ ] `AWS_IAM_SETUP_GUIDE.md` - Remove specific account info
- [ ] `AWS_PERMISSIONS.md` - Remove specific configuration
- [ ] `AWS_README.md` - Update with generic instructions
- [ ] `FREE_TIER_GUIDE.md` - Update with generic instructions

### Docker & Deployment Files to Review
- [ ] `docker-compose.freetier.yml` - May contain specific configurations
- [ ] `Dockerfile.freetier` - May contain specific settings
- [ ] `nginx-freetier.conf` - May contain specific domains/IPs
- [ ] `ecosystem.config.js` - May contain specific paths

## ✅ Files to Keep and Update

### Configuration Templates
- [x] `.env.example` - ✅ Created with placeholder values
- [x] `terraform/terraform.tfvars.example` - ✅ Created with example AWS configuration
- [ ] `docker-compose.yml` - Update with example values
- [ ] `Dockerfile` - Keep generic version

### Terraform & Infrastructure
- [x] `terraform/` - ✅ Keep this directory (contains generic/public templates)
- [x] `terraform/README.md` - ✅ Created comprehensive AWS deployment guide
- [x] `terraform/terraform.tfvars.example` - ✅ Created
- [ ] `terraform-freetier/` - ❌ REMOVE (contains actual secrets/keys)

### Documentation
- [x] `README.md` - ✅ Updated with comprehensive guide
- [x] `CONTRIBUTING.md` - ✅ Created
- [x] `LICENSE` - ✅ Created  
- [x] `DEPLOYMENT.md` - ✅ Updated with Terraform documentation
- [ ] Update existing docs to remove personal/specific info

### GitHub Templates
- [x] `.github/ISSUE_TEMPLATE/` - ✅ Created
- [x] `.github/pull_request_template.md` - ✅ Created
- [x] `.github/workflows/ci.yml` - ✅ Created

## 🔄 Git History Cleanup (Optional but Recommended)

Consider cleaning git history if it contains:
- [ ] Commits with sensitive data (secrets, keys, etc.)
- [ ] Large binary files that were accidentally committed
- [ ] Personal information in commit messages

### Tools for Git History Cleanup:
```bash
# Remove specific files from all history
git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch .env' --prune-empty --tag-name-filter cat -- --all

# Or use BFG Repo-Cleaner (recommended)
bfg --delete-files .env
bfg --strip-blobs-bigger-than 10M
```

## 📋 Final Checklist Before Going Public

- [ ] All sensitive files removed
- [ ] `.gitignore` updated to prevent future sensitive file commits
- [ ] Environment variables documented in `.env.example`
- [ ] README updated with complete setup instructions
- [ ] All documentation reviewed and cleaned
- [ ] Test the complete setup process on a fresh machine
- [ ] Git history reviewed for sensitive content
- [ ] Repository description and topics added on GitHub
- [ ] License file added and appropriate
- [ ] Contributing guidelines in place
- [ ] Issue and PR templates configured

## ⚠️ Important Notes

1. **Database Data**: The current `database_dump.sql` contains real user messages and admin credentials. This MUST be removed or replaced with sample data.

2. **AWS Infrastructure**: All terraform and deployment files contain specific AWS account information, IP addresses, and keys. These must be removed.

3. **Environment Variables**: Any file containing real secrets, API keys, or database URLs must be removed from both the current state AND git history.

4. **Testing**: After cleanup, test the entire setup process following your README to ensure new users can successfully set up the project.

---

**Remember**: Once a repository is public, assume that all content (including git history) may be indexed by search engines and accessed by anyone. Be thorough in your cleanup!
