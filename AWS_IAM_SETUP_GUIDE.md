# AWS IAM Permissions Setup Guide for Beginners

This guide will help you get the proper permissions to deploy your Message Wall application on AWS.

## Understanding AWS IAM

**IAM (Identity and Access Management)** controls who can do what in your AWS account:

- **Users**: Individual people (like you)
- **Groups**: Collections of users with similar permissions
- **Policies**: Documents that define what actions are allowed
- **Roles**: Temporary permissions for AWS services

## Method 1: Using AWS Console (Recommended for Beginners)

### Step 1: Sign in to AWS Console

1. Go to [aws.amazon.com](https://aws.amazon.com)
2. Click **"Sign In to the Console"**
3. Sign in with your AWS account credentials

### Step 2: Navigate to IAM

1. In the AWS Console search bar, type **"IAM"**
2. Click on **"IAM"** service
3. You'll see the IAM dashboard

### Step 3: Check Your Current User

1. In the left sidebar, click **"Users"**
2. Find your username (in your case: **present42**)
3. Click on your username
4. Click on the **"Permissions"** tab

### Step 4: Add the Required Policy

**Option A: Attach AWS Managed Policy (Easiest)**

1. Click **"Add permissions"** button
2. Select **"Attach existing policies directly"**
3. In the search box, type **"EC2FullAccess"**
4. Check the box next to **"AmazonEC2FullAccess"**
5. Search for and also select:
   - **"AmazonS3FullAccess"**
   - **"IAMFullAccess"** (needed for creating roles)
6. Click **"Next: Review"**
7. Click **"Add permissions"**

**Option B: Create Custom Policy (More Secure)**

1. Click **"Add permissions"** → **"Create policy"**
2. Click the **"JSON"** tab
3. Replace the content with this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:CreateKeyPair",
        "ec2:DescribeKeyPairs",
        "ec2:RunInstances",
        "ec2:DescribeInstances",
        "ec2:DescribeImages",
        "ec2:DescribeVpcs",
        "ec2:DescribeSubnets",
        "ec2:DescribeSecurityGroups",
        "ec2:CreateSecurityGroup",
        "ec2:AuthorizeSecurityGroupIngress",
        "ec2:CreateTags",
        "ec2:AllocateAddress",
        "ec2:AssociateAddress",
        "ec2:DescribeAddresses",
        "ec2:TerminateInstances",
        "ec2:StopInstances",
        "ec2:StartInstances",
        "s3:CreateBucket",
        "s3:DeleteBucket",
        "s3:PutBucketPolicy",
        "s3:PutBucketPublicAccessBlock",
        "s3:PutBucketVersioning",
        "s3:GetBucketLocation",
        "s3:ListBucket",
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "iam:CreateRole",
        "iam:CreateInstanceProfile",
        "iam:AttachRolePolicy",
        "iam:PutRolePolicy",
        "iam:PassRole",
        "iam:AddRoleToInstanceProfile",
        "iam:GetRole",
        "iam:GetInstanceProfile",
        "iam:DeleteRole",
        "iam:DeleteInstanceProfile",
        "iam:DetachRolePolicy",
        "iam:DeleteRolePolicy",
        "iam:RemoveRoleFromInstanceProfile"
      ],
      "Resource": "*"
    }
  ]
}
```

4. Click **"Next: Tags"** (skip this)
5. Click **"Next: Review"**
6. Policy name: **"MessageWallDeploymentPolicy"**
7. Description: **"Permissions for deploying Message Wall application"**
8. Click **"Create policy"**
9. Go back to your user and attach this new policy

### Step 5: Verify Permissions

1. Go back to your user page
2. Click **"Permissions"** tab
3. You should see the new policies listed

## Method 2: If You Don't Have Console Access

If you can't access the IAM console, you might need to:

### Contact Your AWS Account Administrator

If this is a company/organization account:

1. Find who manages your AWS account
2. Ask them to add these permissions to your user
3. Share this guide with them

### If You're the Account Owner

If this is your personal AWS account but you're still getting permission errors:

1. **Check if you're using the root user:**

   - Root user has all permissions automatically
   - Only use root user for initial setup, then create IAM users

2. **Create a new admin user:**
   - Sign in as root user
   - Create a new IAM user with admin permissions
   - Use that user for development

## Method 3: Using AWS CLI (Advanced)

If you prefer command line and have admin access:

```powershell
# Create the policy document
$policyDocument = @"
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ec2:*",
                "s3:*",
                "iam:CreateRole",
                "iam:CreateInstanceProfile",
                "iam:AttachRolePolicy",
                "iam:PutRolePolicy",
                "iam:PassRole",
                "iam:AddRoleToInstanceProfile",
                "iam:GetRole",
                "iam:GetInstanceProfile"
            ],
            "Resource": "*"
        }
    ]
}
"@

# Save to file
$policyDocument | Out-File -FilePath "messagewall-policy.json" -Encoding utf8

# Create the policy
aws iam create-policy --policy-name MessageWallDeploymentPolicy --policy-document file://messagewall-policy.json

# Attach to your user
aws iam attach-user-policy --user-name present42 --policy-arn arn:aws:iam::391755178834:policy/MessageWallDeploymentPolicy
```

## Alternative: Create Key Pair Manually

If you can't get permissions immediately, you can create the key pair manually:

### Step 1: Create Key Pair in Console

1. Go to AWS Console → EC2
2. In left sidebar, click **"Key Pairs"**
3. Click **"Create key pair"**
4. Name: **"messagewall-key"**
5. Key pair type: **RSA**
6. Private key file format: **.pem**
7. Click **"Create key pair"**
8. Save the downloaded file to: `%USERPROFILE%\.ssh\messagewall-key.pem`

### Step 2: Use Existing Key in Deployment

```powershell
# Skip the key creation and use existing key
.\deploy-freetier.ps1 -KeyName "messagewall-key" -MyIP "YOUR.IP.ADDRESS"
```

## Common Permission Issues and Solutions

### Issue 1: "Access Denied" for EC2

**Solution:** Add `AmazonEC2FullAccess` managed policy

### Issue 2: "Access Denied" for S3

**Solution:** Add `AmazonS3FullAccess` managed policy

### Issue 3: "Access Denied" for IAM roles

**Solution:** Add IAM permissions for creating roles and instance profiles

### Issue 4: "Cannot pass role"

**Solution:** Add `iam:PassRole` permission

## Security Best Practices

### For Learning/Development:

- Use managed policies like `EC2FullAccess` for simplicity
- Create a separate IAM user for development (don't use root)

### For Production:

- Use least-privilege principle
- Create custom policies with only required permissions
- Use IAM roles instead of user credentials when possible

## Testing Your Permissions

After adding permissions, test with:

```powershell
# Test EC2 permissions
aws ec2 describe-instances

# Test key pair creation
aws ec2 create-key-pair --key-name test-key --dry-run

# Test S3 permissions
aws s3 ls
```

## Next Steps

Once you have the proper permissions:

1. **Get your IP:**

   ```powershell
   .\deploy-freetier.ps1 -GetMyIP
   ```

2. **Create key pair:**

   ```powershell
   .\deploy-freetier.ps1 -CreateKeyPair -KeyName "messagewall-key"
   ```

3. **Deploy:**
   ```powershell
   .\deploy-freetier.ps1 -KeyName "messagewall-key" -MyIP "YOUR.IP"
   ```

## Need Help?

If you're still having issues:

1. Check the AWS CloudTrail logs for detailed error messages
2. Try the AWS IAM Policy Simulator to test permissions
3. Contact AWS Support if you have a support plan

Remember: AWS permissions can be complex, but for learning purposes, using managed policies like `EC2FullAccess` is perfectly fine!
