# AWS IAM Policy for Message Wall Free Tier Deployment

The deployment requires specific IAM permissions. Here are the solutions:

## Option 1: Request Admin to Add Permissions (Recommended)

Ask your AWS administrator to attach this policy to your user:

```json
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
        "iam:ListInstanceProfiles",
        "iam:GetRole",
        "iam:GetInstanceProfile"
      ],
      "Resource": "*"
    }
  ]
}
```

## Option 2: Use AWS Console to Create Key Pair

1. Go to AWS Console → EC2 → Key Pairs
2. Click "Create key pair"
3. Name: `messagewall-key`
4. Key pair type: RSA
5. Private key format: .pem
6. Download and save to: `%USERPROFILE%\.ssh\messagewall-key.pem`

## Option 3: Use Existing Key Pair

If you already have a key pair:

```powershell
.\deploy-freetier.ps1 -KeyName "your-existing-key-name" -MyIP "YOUR.IP.ADDRESS"
```

## Minimum Required Permissions

If full EC2 permissions are too broad, here are the minimum required permissions:

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
        "s3:CreateBucket",
        "s3:PutBucketPolicy",
        "s3:PutBucketPublicAccessBlock",
        "s3:PutBucketVersioning",
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
```
