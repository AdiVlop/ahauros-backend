#!/bin/bash

# Ahauros.io EC2 Deployment Script
# Replace <EC2_INSTANCE_ID> with your actual EC2 instance ID

set -e

# Configuration - UPDATE THIS VALUE
EC2_INSTANCE_ID="<EC2_INSTANCE_ID>"  # Replace with your EC2 instance ID

echo "🚀 Starting Ahauros.io deployment to EC2..."

# Step 4: Prepare EC2 target directory
echo "Step 4: Preparing EC2 target directory..."
aws ssm send-command \
  --targets "Key=instanceIds,Values=$EC2_INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --comment "Prepare Ahauros.io directory" \
  --parameters 'commands=[
    "sudo mkdir -p /var/www/ahauros.io",
    "sudo chown -R www-data:www-data /var/www/ahauros.io",
    "sudo chmod -R 755 /var/www/ahauros.io"
  ]' \
  --output text --query 'Command.CommandId'

echo "⏳ Waiting for directory preparation..."
sleep 10

# Step 5: Sync files from S3 to EC2
echo "Step 5: Syncing files from S3 to EC2..."
aws ssm send-command \
  --targets "Key=instanceIds,Values=$EC2_INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --comment "Sync Ahauros.io files" \
  --parameters 'commands=[
    "aws s3 sync s3://ahauros-landing-deploy/ /var/www/ahauros.io/ --delete",
    "sudo chown -R www-data:www-data /var/www/ahauros.io",
    "sudo chmod -R 755 /var/www/ahauros.io"
  ]' \
  --output text --query 'Command.CommandId'

echo "⏳ Waiting for file sync..."
sleep 15

# Step 6: Configure Nginx
echo "Step 6: Configuring Nginx..."
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

    # Handle SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control \"public, immutable\";
    }

    # Security headers
    add_header X-Frame-Options \"SAMEORIGIN\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header Referrer-Policy \"no-referrer-when-downgrade\" always;
    add_header Content-Security-Policy \"default-src '\''self'\'' http: https: data: blob: '\''unsafe-inline'\''\" always;

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
echo "Step 7: Reloading Nginx..."
aws ssm send-command \
  --targets "Key=instanceIds,Values=$EC2_INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --comment "Reload Nginx" \
  --parameters 'commands=[
    "sudo systemctl reload nginx",
    "sudo systemctl status nginx --no-pager"
  ]' \
  --output text --query 'Command.CommandId'

echo "⏳ Waiting for Nginx reload..."
sleep 5

# Step 8: Install SSL certificate with Certbot
echo "Step 8: Installing SSL certificate with Certbot..."
aws ssm send-command \
  --targets "Key=instanceIds,Values=$EC2_INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --comment "Install SSL with Certbot" \
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
echo "Step 9: Verifying deployment..."
aws ssm send-command \
  --targets "Key=instanceIds,Values=$EC2_INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --comment "Verify Ahauros.io" \
  --parameters 'commands=[
    "curl -I http://ahauros.io",
    "curl -I https://ahauros.io",
    "sudo certbot certificates",
    "ls -la /var/www/ahauros.io/"
  ]' \
  --output text --query 'Command.CommandId'

echo "🎉 Deployment commands sent!"
echo "🌐 Your site should be available at: https://ahauros.io"
echo "📊 Monitor deployment status in AWS Systems Manager console"
echo "🔍 Check command status with: aws ssm list-commands --instance-id $EC2_INSTANCE_ID"

