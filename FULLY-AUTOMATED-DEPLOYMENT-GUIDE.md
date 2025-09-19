# Ahauros.io Fully Automated AWS EC2 Deployment Guide

## 🚀 Complete Automated Deployment Solution

This guide provides three deployment options for the Ahauros.io landing page on AWS EC2 with Nginx and SSL.

## 📋 Prerequisites

- AWS CLI configured with appropriate permissions
- Domain name (ahauros.io) ready for DNS configuration
- AWS account with EC2, S3, IAM, and SSM permissions

## 🎯 Deployment Options

### Option 1: Fully Automated (Recommended)
```bash
./automated-deploy.sh
```
**What it does:**
- Creates IAM roles and policies
- Launches EC2 Ubuntu instance
- Creates S3 bucket
- Builds and uploads landing page
- Configures Nginx with SSL
- Verifies deployment

### Option 2: Step-by-Step (For Debugging)
```bash
./step-by-step-deploy.sh
```
**What it does:**
- Same as automated but with manual confirmation at each step
- Better for debugging and understanding the process
- Allows you to inspect each step before proceeding

### Option 3: Manual Commands
Follow the individual commands in the sections below.

## 🔧 Required AWS Permissions

Your AWS user/role needs these permissions:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:*",
        "s3:*",
        "iam:*",
        "ssm:*"
      ],
      "Resource": "*"
    }
  ]
}
```

## 📝 Step-by-Step Manual Deployment

### Step 1: Create IAM Role
```bash
aws iam create-role --role-name AhaurosDeployRole --assume-role-policy-document '{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Service": "ec2.amazonaws.com" },
    "Action": "sts:AssumeRole"
  }]
}'

aws iam attach-role-policy --role-name AhaurosDeployRole --policy-arn arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore
aws iam attach-role-policy --role-name AhaurosDeployRole --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

aws iam create-instance-profile --instance-profile-name AhaurosDeployRole
aws iam add-role-to-instance-profile --instance-profile-name AhaurosDeployRole --role-name AhaurosDeployRole
```

### Step 2: Launch EC2 Instance
```bash
INSTANCE_ID=$(aws ec2 run-instances \
  --image-id ami-08c40ec9ead489470 \
  --count 1 \
  --instance-type t3.micro \
  --iam-instance-profile Name=AhaurosDeployRole \
  --security-groups default \
  --user-data '#!/bin/bash
apt update
apt install -y awscli
systemctl enable amazon-ssm-agent
systemctl start amazon-ssm-agent' \
  --query 'Instances[0].InstanceId' \
  --output text)

echo "Instance ID: $INSTANCE_ID"
```

### Step 3: Create S3 Bucket
```bash
S3_BUCKET="ahauros-landing-deploy-$(date +%s)"
aws s3 mb s3://$S3_BUCKET --region us-east-1
echo "S3 Bucket: $S3_BUCKET"
```

### Step 4: Build and Upload
```bash
cd landing-react
npm install
npm run build
aws s3 sync dist/ s3://$S3_BUCKET/ --delete
```

### Step 5: Prepare EC2 Directory
```bash
aws ssm send-command \
  --targets "Key=instanceIds,Values=$INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --comment "Prepare /var/www/ahauros.io" \
  --parameters 'commands=[
    "sudo mkdir -p /var/www/ahauros.io",
    "sudo chown -R www-data:www-data /var/www/ahauros.io",
    "sudo chmod -R 755 /var/www/ahauros.io"
  ]'
```

### Step 6: Sync Files
```bash
aws ssm send-command \
  --targets "Key=instanceIds,Values=$INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --comment "Sync files from S3" \
  --parameters 'commands=[
    "aws s3 sync s3://'$S3_BUCKET'/ /var/www/ahauros.io/ --delete",
    "sudo chown -R www-data:www-data /var/www/ahauros.io",
    "sudo chmod -R 755 /var/www/ahauros.io"
  ]'
```

### Step 7: Configure Nginx
```bash
aws ssm send-command \
  --targets "Key=instanceIds,Values=$INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --comment "Configure Nginx" \
  --parameters 'commands=[
    "sudo apt update",
    "sudo apt install -y nginx",
    "sudo tee /etc/nginx/sites-available/ahauros.io > /dev/null << '\''EOF'\''
server {
    listen 80;
    server_name ahauros.io www.ahauros.io;

    root /var/www/ahauros.io;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options \"SAMEORIGIN\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header Referrer-Policy \"no-referrer-when-downgrade\" always;

    # Handle SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control \"public, immutable\";
    }

    # Security - deny access to hidden files
    location ~ /\\. {
        deny all;
    }
}
EOF",
    "sudo ln -sf /etc/nginx/sites-available/ahauros.io /etc/nginx/sites-enabled/",
    "sudo rm -f /etc/nginx/sites-enabled/default",
    "sudo nginx -t",
    "sudo systemctl restart nginx",
    "sudo systemctl enable nginx"
  ]'
```

### Step 8: Install SSL Certificate
```bash
aws ssm send-command \
  --targets "Key=instanceIds,Values=$INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --comment "Install SSL certificate" \
  --parameters 'commands=[
    "sudo apt install -y certbot python3-certbot-nginx",
    "sudo certbot --nginx -d ahauros.io -d www.ahauros.io --non-interactive --agree-tos --email admin@ahauros.io --redirect",
    "sudo systemctl restart nginx"
  ]'
```

### Step 9: Verify Deployment
```bash
aws ssm send-command \
  --targets "Key=instanceIds,Values=$INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --comment "Verify site" \
  --parameters 'commands=[
    "curl -I http://ahauros.io",
    "curl -I https://ahauros.io",
    "sudo certbot certificates",
    "ls -la /var/www/ahauros.io/",
    "sudo systemctl status nginx --no-pager"
  ]'
```

## 🔍 Monitoring and Troubleshooting

### Monitor Deployment Status
```bash
./monitor-deployment.sh <INSTANCE_ID>
```

### Check SSM Commands
```bash
aws ssm list-commands --instance-id <INSTANCE_ID>
```

### Get Command Output
```bash
aws ssm get-command-invocation --command-id <COMMAND_ID> --instance-id <INSTANCE_ID>
```

### Check Instance Status
```bash
aws ec2 describe-instances --instance-ids <INSTANCE_ID>
```

## 🌐 DNS Configuration

After deployment, update your DNS records:
- **A Record**: `ahauros.io` → `<EC2_PUBLIC_IP>`
- **CNAME Record**: `www.ahauros.io` → `ahauros.io`

DNS propagation typically takes 5-15 minutes.

## 📊 Expected Results

After successful deployment:
- ✅ Site available at https://ahauros.io
- ✅ HTTP redirects to HTTPS
- ✅ SSL certificate from Let's Encrypt
- ✅ Multi-language support (EN/RO/FR/ES/PT)
- ✅ Responsive design with hero image
- ✅ Professional branding and styling
- ✅ SPA routing support
- ✅ Static asset caching
- ✅ Gzip compression
- ✅ Security headers

## 🛠️ File Structure on Server

```
/var/www/ahauros.io/
├── index.html
├── favicon.ico
├── apple-touch-icon.png
├── vite.svg
└── assets/
    ├── index-qb-JUCWa.css
    ├── index-CXnFT3g9.js
    ├── hero-enterprise-DNMFYVcP.png
    ├── logo-full-BGs3-lCV.png
    └── logo-white-CAwFBea2.png
```

## 🔧 Nginx Configuration Features

- **SPA Routing**: All routes redirect to index.html
- **Static Asset Caching**: 1 year cache for assets
- **Gzip Compression**: Reduces file sizes
- **Security Headers**: XSS, CSRF, and content type protection
- **SSL Redirect**: HTTP automatically redirects to HTTPS

## 💰 Cost Estimation

- **EC2 t3.micro**: ~$8.50/month
- **S3 Storage**: ~$0.023/GB/month
- **Data Transfer**: First 1GB free, then $0.09/GB
- **Total Estimated Cost**: ~$10-15/month

## 🚨 Important Notes

1. **Security Groups**: Ensure ports 80 and 443 are open
2. **Domain**: Must point to EC2 public IP for SSL to work
3. **Email**: Update admin email in Certbot commands
4. **Backup**: Consider setting up automated backups
5. **Monitoring**: Set up CloudWatch alarms for uptime

## 🎉 Success!

Your Ahauros.io landing page is now live with:
- Professional multi-language interface
- Secure HTTPS with automatic SSL renewal
- Optimized performance with caching and compression
- Responsive design for all devices
- Enterprise-grade security headers

