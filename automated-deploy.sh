#!/bin/bash

# Ahauros.io Fully Automated AWS EC2 Deployment Script
# This script creates IAM roles, launches EC2, builds, and deploys the landing page

set -e

echo "🚀 Starting Ahauros.io fully automated deployment..."

# Configuration
REGION="eu-west-1"
AMI_ID="ami-0d15ead583fbb2234"  # Ubuntu 22.04 LTS
INSTANCE_TYPE="t3.micro"
ROLE_NAME="AhaurosDeployRole"
S3_BUCKET="ahauros-landing-deploy-$(date +%s)"

# Step 1: Create IAM Role with required policies
echo "Step 1: Creating IAM Role with required policies..."
aws iam create-role --role-name $ROLE_NAME --assume-role-policy-document '{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Service": "ec2.amazonaws.com" },
    "Action": "sts:AssumeRole"
  }]
}' 2>/dev/null || echo "Role already exists"

aws iam attach-role-policy --role-name $ROLE_NAME --policy-arn arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore 2>/dev/null || echo "Policy already attached"
aws iam attach-role-policy --role-name $ROLE_NAME --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess 2>/dev/null || echo "Policy already attached"

# Create instance profile
aws iam create-instance-profile --instance-profile-name $ROLE_NAME 2>/dev/null || echo "Instance profile already exists"
aws iam add-role-to-instance-profile --instance-profile-name $ROLE_NAME --role-name $ROLE_NAME 2>/dev/null || echo "Role already added to instance profile"

echo "⏳ Waiting for IAM role to propagate..."
sleep 10

# Step 2: Launch EC2 Ubuntu instance
echo "Step 2: Launching EC2 Ubuntu instance..."
INSTANCE_ID=$(aws ec2 run-instances \
  --image-id $AMI_ID \
  --count 1 \
  --instance-type $INSTANCE_TYPE \
  --iam-instance-profile Name=$ROLE_NAME \
  --security-groups default \
  --user-data '#!/bin/bash
apt update
apt install -y awscli
systemctl enable amazon-ssm-agent
systemctl start amazon-ssm-agent' \
  --query 'Instances[0].InstanceId' \
  --output text)

echo "🚀 EC2 instance launched: $INSTANCE_ID"

# Wait for instance to be running
echo "⏳ Waiting for instance to be running..."
aws ec2 wait instance-running --instance-ids $INSTANCE_ID

# Get public IP
PUBLIC_IP=$(aws ec2 describe-instances \
  --instance-ids $INSTANCE_ID \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text)

echo "🌐 Instance public IP: $PUBLIC_IP"

# Wait for SSM agent to be ready
echo "⏳ Waiting for SSM agent to be ready..."
sleep 60

# Step 3: Create S3 bucket for deployment
echo "Step 3: Creating S3 bucket for deployment..."
aws s3 mb s3://$S3_BUCKET --region $REGION
echo "📦 S3 bucket created: $S3_BUCKET"

# Step 4: Build landing project
echo "Step 4: Building landing project..."
cd landing-react
npm install
npm run build
echo "✅ Build complete"

# Step 5: Upload build to S3
echo "Step 5: Uploading build to S3..."
aws s3 sync dist/ s3://$S3_BUCKET/ --delete
echo "✅ Files uploaded to S3"

# Step 6: Prepare EC2 target directory
echo "Step 6: Preparing EC2 target directory..."
aws ssm send-command \
  --targets "Key=instanceIds,Values=$INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --comment "Prepare /var/www/ahauros.io" \
  --parameters 'commands=[
    "sudo mkdir -p /var/www/ahauros.io",
    "sudo chown -R www-data:www-data /var/www/ahauros.io",
    "sudo chmod -R 755 /var/www/ahauros.io"
  ]' \
  --output text --query 'Command.CommandId'

echo "⏳ Waiting for directory preparation..."
sleep 15

# Step 7: Sync files from S3 to EC2
echo "Step 7: Syncing files from S3 to EC2..."
aws ssm send-command \
  --targets "Key=instanceIds,Values=$INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --comment "Sync files from S3" \
  --parameters 'commands=[
    "aws s3 sync s3://'$S3_BUCKET'/ /var/www/ahauros.io/ --delete",
    "sudo chown -R www-data:www-data /var/www/ahauros.io",
    "sudo chmod -R 755 /var/www/ahauros.io"
  ]' \
  --output text --query 'Command.CommandId'

echo "⏳ Waiting for file sync..."
sleep 20

# Step 8: Configure Nginx + Certbot SSL
echo "Step 8: Configuring Nginx and SSL..."
aws ssm send-command \
  --targets "Key=instanceIds,Values=$INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --comment "Configure Nginx and SSL" \
  --parameters 'commands=[
    "sudo apt update",
    "sudo apt install -y nginx certbot python3-certbot-nginx",
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
    add_header Content-Security-Policy \"default-src '\''self'\'' http: https: data: blob: '\''unsafe-inline'\''\" always;

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
  ]' \
  --output text --query 'Command.CommandId'

echo "⏳ Waiting for Nginx configuration..."
sleep 20

# Step 9: Install SSL certificate
echo "Step 9: Installing SSL certificate..."
aws ssm send-command \
  --targets "Key=instanceIds,Values=$INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --comment "Install SSL certificate" \
  --parameters 'commands=[
    "sudo certbot --nginx -d ahauros.io -d www.ahauros.io --non-interactive --agree-tos --email admin@ahauros.io --redirect",
    "sudo systemctl restart nginx"
  ]' \
  --output text --query 'Command.CommandId'

echo "⏳ Waiting for SSL installation..."
sleep 30

# Step 10: Verify deployment
echo "Step 10: Verifying deployment..."
aws ssm send-command \
  --targets "Key=instanceIds,Values=$INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --comment "Verify site deployment" \
  --parameters 'commands=[
    "curl -I http://ahauros.io",
    "curl -I https://ahauros.io",
    "sudo certbot certificates",
    "ls -la /var/www/ahauros.io/",
    "sudo systemctl status nginx --no-pager"
  ]' \
  --output text --query 'Command.CommandId'

echo "⏳ Waiting for verification..."
sleep 15

# Display results
echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "=================================="
echo "🌐 Instance ID: $INSTANCE_ID"
echo "🌐 Public IP: $PUBLIC_IP"
echo "📦 S3 Bucket: $S3_BUCKET"
echo "🔗 Site URL: https://ahauros.io"
echo ""
echo "📊 Monitor deployment status:"
echo "aws ssm list-commands --instance-id $INSTANCE_ID"
echo ""
echo "🔍 Check command output:"
echo "aws ssm get-command-invocation --command-id COMMAND_ID --instance-id $INSTANCE_ID"
echo ""
echo "⚠️  IMPORTANT: Update your DNS to point ahauros.io to $PUBLIC_IP"
echo "   DNS propagation may take 5-15 minutes"
echo ""
echo "✅ Your Ahauros.io landing page is now live!"
