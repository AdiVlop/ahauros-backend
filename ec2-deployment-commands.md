# Ahauros.io EC2 Deployment Commands

## Prerequisites Completed ✅
- ✅ Production bundle built (1.8MB)
- ✅ S3 bucket created: `ahauros-landing-deploy`
- ✅ Files uploaded to S3

## Next Steps (Run when EC2 instance is ready)

### 1. Get your EC2 Instance ID
```bash
aws ec2 describe-instances --query 'Reservations[*].Instances[*].[InstanceId,State.Name,PublicIpAddress,Tags[?Key==`Name`].Value|[0]]' --output table
```

### 2. Prepare EC2 target directory
```bash
# Replace <EC2_INSTANCE_ID> with your actual instance ID
aws ssm send-command \
  --targets "Key=instanceIds,Values=<EC2_INSTANCE_ID>" \
  --document-name "AWS-RunShellScript" \
  --comment "Prepare Ahauros.io directory" \
  --parameters 'commands=[
    "sudo mkdir -p /var/www/ahauros.io",
    "sudo chown -R www-data:www-data /var/www/ahauros.io",
    "sudo chmod -R 755 /var/www/ahauros.io"
  ]'
```

### 3. Sync files from S3 to EC2
```bash
aws ssm send-command \
  --targets "Key=instanceIds,Values=<EC2_INSTANCE_ID>" \
  --document-name "AWS-RunShellScript" \
  --comment "Sync Ahauros.io files" \
  --parameters 'commands=[
    "aws s3 sync s3://ahauros-landing-deploy/ /var/www/ahauros.io/ --delete",
    "sudo chown -R www-data:www-data /var/www/ahauros.io",
    "sudo chmod -R 755 /var/www/ahauros.io"
  ]'
```

### 4. Configure Nginx
```bash
aws ssm send-command \
  --targets "Key=instanceIds,Values=<EC2_INSTANCE_ID>" \
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
  ]'
```

### 5. Reload Nginx
```bash
aws ssm send-command \
  --targets "Key=instanceIds,Values=<EC2_INSTANCE_ID>" \
  --document-name "AWS-RunShellScript" \
  --comment "Reload Nginx" \
  --parameters 'commands=[
    "sudo systemctl reload nginx",
    "sudo systemctl status nginx --no-pager"
  ]'
```

### 6. Install SSL certificate with Certbot
```bash
aws ssm send-command \
  --targets "Key=instanceIds,Values=<EC2_INSTANCE_ID>" \
  --document-name "AWS-RunShellScript" \
  --comment "Install SSL with Certbot" \
  --parameters 'commands=[
    "sudo apt update",
    "sudo apt install -y certbot python3-certbot-nginx",
    "sudo certbot --nginx -d ahauros.io -d www.ahauros.io --non-interactive --agree-tos --email admin@ahauros.io --redirect",
    "sudo systemctl restart nginx"
  ]'
```

### 7. Verify deployment
```bash
aws ssm send-command \
  --targets "Key=instanceIds,Values=<EC2_INSTANCE_ID>" \
  --document-name "AWS-RunShellScript" \
  --comment "Verify Ahauros.io" \
  --parameters 'commands=[
    "curl -I http://ahauros.io",
    "curl -I https://ahauros.io",
    "sudo certbot certificates",
    "ls -la /var/www/ahauros.io/"
  ]'
```

## Monitoring Commands

### Check command status
```bash
aws ssm get-command-invocation \
  --command-id "COMMAND_ID" \
  --instance-id "<EC2_INSTANCE_ID>"
```

### List recent commands
```bash
aws ssm list-commands \
  --instance-id "<EC2_INSTANCE_ID>" \
  --max-items 10
```

### View command output
```bash
aws ssm get-command-invocation \
  --command-id "COMMAND_ID" \
  --instance-id "<EC2_INSTANCE_ID>" \
  --query 'StandardOutputContent'
```

## Quick Deployment Script

Or use the automated script:
```bash
# Edit deploy-to-ec2.sh and replace <EC2_INSTANCE_ID> with your instance ID
./deploy-to-ec2.sh
```

## Expected Result

After deployment:
- ✅ Landing files in `/var/www/ahauros.io`
- ✅ Nginx configured with SPA routing + caching + security headers
- ✅ Certbot SSL enabled
- ✅ Site available at https://ahauros.io
- ✅ Multi-language support (EN/RO/FR/ES/PT)
- ✅ Responsive design with hero image
- ✅ Professional branding and styling

