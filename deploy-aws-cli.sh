#!/bin/bash

# Ahauros.io AWS CLI Deployment Script
# Deploys landing page to EC2 using AWS CLI with S3 and SSM

set -e

# Configuration - UPDATE THESE VALUES
EC2_INSTANCE_ID="i-1234567890abcdef0"  # Replace with your EC2 instance ID
S3_BUCKET="ahauros-landing-deploy"     # Replace with your S3 bucket name
DOMAIN="ahauros.io"

echo "🚀 Starting Ahauros.io AWS CLI deployment..."

# Step 1: Build production bundle
echo "📦 Building production bundle..."
cd landing-react
npm install
npm run build
echo "✅ Build complete"

# Step 2: Create S3 bucket if it doesn't exist
echo "🪣 Setting up S3 bucket..."
aws s3 mb s3://$S3_BUCKET --region us-east-1 2>/dev/null || echo "Bucket already exists or creation failed"

# Step 3: Upload build files to S3
echo "⬆️  Uploading files to S3..."
aws s3 cp dist/ s3://$S3_BUCKET/ --recursive --delete
echo "✅ Files uploaded to S3"

# Step 4: Prepare EC2 instance directory
echo "🔧 Preparing EC2 instance..."
aws ssm send-command \
  --targets "Key=instanceIds,Values=$EC2_INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --comment "Prepare Ahauros.io deployment directory" \
  --parameters 'commands=[
    "sudo mkdir -p /var/www/ahauros.io",
    "sudo chown -R www-data:www-data /var/www/ahauros.io",
    "sudo chmod -R 755 /var/www/ahauros.io"
  ]' \
  --output text --query 'Command.CommandId'

echo "⏳ Waiting for directory preparation..."
sleep 10

# Step 5: Sync files from S3 to EC2
echo "📥 Syncing files to EC2..."
aws ssm send-command \
  --targets "Key=instanceIds,Values=$EC2_INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --comment "Sync Ahauros.io files from S3" \
  --parameters 'commands=[
    "aws s3 sync s3://'$S3_BUCKET'/ /var/www/ahauros.io/ --delete",
    "sudo chown -R www-data:www-data /var/www/ahauros.io",
    "sudo chmod -R 755 /var/www/ahauros.io"
  ]' \
  --output text --query 'Command.CommandId'

echo "⏳ Waiting for file sync..."
sleep 15

# Step 6: Configure Nginx
echo "⚙️  Configuring Nginx..."
aws ssm send-command \
  --targets "Key=instanceIds,Values=$EC2_INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --comment "Configure Nginx for Ahauros.io" \
  --parameters 'commands=[
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
    "sudo nginx -t"
  ]' \
  --output text --query 'Command.CommandId'

echo "⏳ Waiting for Nginx configuration..."
sleep 10

# Step 7: Reload Nginx
echo "🔄 Reloading Nginx..."
aws ssm send-command \
  --targets "Key=instanceIds,Values=$EC2_INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --comment "Reload Nginx service" \
  --parameters 'commands=[
    "sudo systemctl reload nginx",
    "sudo systemctl status nginx --no-pager"
  ]' \
  --output text --query 'Command.CommandId'

echo "⏳ Waiting for Nginx reload..."
sleep 5

# Step 8: Install/Update SSL certificate
echo "🔒 Installing SSL certificate..."
aws ssm send-command \
  --targets "Key=instanceIds,Values=$EC2_INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --comment "Install SSL certificate with Certbot" \
  --parameters 'commands=[
    "sudo apt update",
    "sudo apt install -y certbot python3-certbot-nginx",
    "sudo certbot --nginx -d ahauros.io -d www.ahauros.io --non-interactive --agree-tos --email admin@ahauros.io --redirect",
    "sudo systemctl restart nginx"
  ]' \
  --output text --query 'Command.CommandId'

echo "⏳ Waiting for SSL installation..."
sleep 30

# Step 9: Verify deployment
echo "✅ Verifying deployment..."
aws ssm send-command \
  --targets "Key=instanceIds,Values=$EC2_INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --comment "Verify Ahauros.io deployment" \
  --parameters 'commands=[
    "curl -I http://ahauros.io",
    "curl -I https://ahauros.io",
    "sudo certbot certificates",
    "ls -la /var/www/ahauros.io/"
  ]' \
  --output text --query 'Command.CommandId'

echo "🎉 Deployment complete!"
echo "🌐 Your site should be available at: https://ahauros.io"
echo "📊 Check deployment status in AWS Systems Manager console"
echo "🔍 Monitor logs with: aws logs describe-log-groups --log-group-name-prefix /aws/ssm"

