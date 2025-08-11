#!/usr/bin/env node

/**
 * Repository Health Check for Message Wall
 * Checks if the repository is ready for public release
 */

const fs = require('fs');

console.log('🔍 Message Wall Repository Health Check\n');

const issues = [];
const warnings = [];
const success = [];

// Check for sensitive files that should not be in public repo
const sensitiveFiles = [
  '.env',
  '.env.local', 
  '.env.production',
  'database_dump.sql',
  'terraform-freetier/',
  '*.pem',
  'generate-hash.js',
  'healthcheck.py'
];

console.log('📁 Checking for sensitive files...');
sensitiveFiles.forEach(pattern => {
  const filePath = pattern.replace('*', '');
  if (fs.existsSync(filePath)) {
    if (pattern.includes('.env') && !pattern.includes('.example')) {
      issues.push(`❌ CRITICAL: ${pattern} contains real secrets - should be in .gitignore`);
    } else {
      warnings.push(`⚠️  ${pattern} exists - ensure it's in .gitignore`);
    }
  } else {
    success.push(`✅ ${pattern} not found (good)`);
  }
});

// Check for required files
const requiredFiles = [
  '.env.example',
  'README.md',
  'CONTRIBUTING.md', 
  'LICENSE',
  'DEPLOYMENT.md',
  '.gitignore',
  'terraform/README.md',
  'terraform/terraform.tfvars.example'
];

console.log('\n📋 Checking for required files...');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    success.push(`✅ ${file} exists`);
  } else {
    issues.push(`❌ Missing required file: ${file}`);
  }
});

// Check .gitignore content
console.log('\n🚫 Checking .gitignore...');
if (fs.existsSync('.gitignore')) {
  const gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
  const requiredPatterns = ['.env*', '*.pem', 'terraform-freetier/', '*.tfstate'];
  
  requiredPatterns.forEach(pattern => {
    if (gitignoreContent.includes(pattern) || gitignoreContent.includes(pattern.replace('*', ''))) {
      success.push(`✅ .gitignore includes ${pattern}`);
    } else {
      issues.push(`❌ .gitignore missing pattern: ${pattern}`);
    }
  });
} else {
  issues.push('❌ .gitignore file missing');
}

// Check package.json
console.log('\n📦 Checking package.json...');
if (fs.existsSync('package.json')) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  if (packageJson.private) {
    warnings.push('⚠️  package.json is marked as private - consider making it public');
  }
  
  if (packageJson.scripts && packageJson.scripts.setup) {
    success.push('✅ Setup script available');
  } else {
    warnings.push('⚠️  No setup script found in package.json');
  }
}

// Check for git history issues (basic check)
console.log('\n📜 Checking git status...');
try {
  const { execSync } = require('child_process');
  
  // Check for staged sensitive files
  try {
    const staged = execSync('git diff --cached --name-only', { encoding: 'utf8' });
    const stagedFiles = staged.split('\n').filter(f => f.trim());
    
    stagedFiles.forEach(file => {
      if (file.includes('.env') && !file.includes('.example')) {
        issues.push(`❌ CRITICAL: ${file} is staged for commit - contains secrets!`);
      }
    });
  } catch {
    warnings.push('⚠️  Could not check git staged files');
  }
  
} catch {
  warnings.push('⚠️  Could not run git commands');
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 SUMMARY');
console.log('='.repeat(50));

if (success.length > 0) {
  console.log(`\n✅ SUCCESS (${success.length})`);
  success.forEach(msg => console.log(`  ${msg}`));
}

if (warnings.length > 0) {
  console.log(`\n⚠️  WARNINGS (${warnings.length})`);
  warnings.forEach(msg => console.log(`  ${msg}`));
}

if (issues.length > 0) {
  console.log(`\n❌ CRITICAL ISSUES (${issues.length})`);
  issues.forEach(msg => console.log(`  ${msg}`));
}

console.log('\n' + '='.repeat(50));

if (issues.length === 0) {
  console.log('🎉 Repository appears ready for public release!');
  console.log('📝 Review CLEANUP_CHECKLIST.md for final verification');
} else {
  console.log('🚨 Critical issues found - fix before going public!');
  console.log('📝 See CLEANUP_CHECKLIST.md for detailed instructions');
}

console.log('\n💡 Next steps:');
console.log('1. Review and fix any issues above');
console.log('2. Test the complete setup on a fresh machine');
console.log('3. Update repository description and topics on GitHub');
console.log('4. Consider cleaning git history if it contains sensitive commits');

process.exit(issues.length > 0 ? 1 : 0);
