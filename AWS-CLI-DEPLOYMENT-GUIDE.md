# Ahauros.io AWS CLI Deployment Guide

## 🚀 Deploy Landing Page using AWS CLI (EC2 + Nginx + SSL)

### Prerequisites
- AWS CLI configured with appropriate permissions
- EC2 instance running Ubuntu/Amazon Linux
- Domain name (ahauros.io) pointing to EC2 public IP
- S3 bucket for deployment files
- SSM agent running on EC2 instance

### Quick Deployment (Automated)

1. **Update configuration in deploy script:**
   ```bash
   # Edit deploy-aws-cli.sh
   EC2_INSTANCE_ID="i-1234567890abcdef0"  # Your EC2 instance ID
   S3_BUCKET="ahauros-landing-deploy"     # Your S3 bucket name
   ```

2. **Run deployment script:**
   ```bash
   ./deploy-aws-cli.sh
   ```

### Manual Deployment Steps

#### 1. Build Production Bundle
```bash
cd landing-react
npm install
npm run build
# Output: dist/ directory with production files
```

#### 2. Create S3 Bucket
```bash
aws s3 mb s3://ahauros-landing-deploy --region us-east-1
```

#### 3. Upload Files to S3
```bash
aws s3 cp dist/ s3://ahauros-landing-deploy/ --recursive --delete
```

#### 4. Prepare EC2 Instance Directory
```bash
aws ssm send-command \
  --targets "Key=instanceIds,Values=i-1234567890abcdef0" \
  --document-name "AWS-RunShellScript" \
  --comment "Prepare Ahauros.io deployment directory" \
  --parameters 'commands=[
    "sudo mkdir -p /var/www/ahauros.io",
    "sudo chown -R www-data:www-data /var/www/ahauros.io",
    "sudo chmod -R 755 /var/www/ahauros.io"
  ]'
```

#### 5. Sync Files from S3 to EC2
```bash
aws ssm send-command \
  --targets "Key=instanceIds,Values=i-1234567890abcdef0" \
  --document-name "AWS-RunShellScript" \
  --comment "Sync Ahauros.io files from S3" \
  --parameters 'commands=[
    "aws s3 sync s3://ahauros-landing-deploy/ /var/www/ahauros.io/ --delete",
    "sudo chown -R www-data:www-data /var/www/ahauros.io",
    "sudo chmod -R 755 /var/www/ahauros.io"
  ]'
```

#### 6. Configure Nginx
```bash
aws ssm send-command \
  --targets "Key=instanceIds,Values=i-1234567890abcdef0" \
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
  ]'
```

#### 7. Reload Nginx
```bash
aws ssm send-command \
  --targets "Key=instanceIds,Values=i-1234567890abcdef0" \
  --document-name "AWS-RunShellScript" \
  --comment "Reload Nginx service" \
  --parameters 'commands=[
    "sudo systemctl reload nginx"
  ]'
```

#### 8. Install SSL Certificate
```bash
aws ssm send-command \
  --targets "Key=instanceIds,Values=i-1234567890abcdef0" \
  --document-name "AWS-RunShellScript" \
  --comment "Install SSL certificate with Certbot" \
  --parameters 'commands=[
    "sudo apt update",
    "sudo apt install -y certbot python3-certbot-nginx",
    "sudo certbot --nginx -d ahauros.io -d www.ahauros.io --non-interactive --agree-tos --email admin@ahauros.io --redirect",
    "sudo systemctl restart nginx"
  ]'
```

#### 9. Verify Deployment
```bash
aws ssm send-command \
  --targets "Key=instanceIds,Values=i-1234567890abcdef0" \
  --document-name "AWS-RunShellScript" \
  --comment "Verify Ahauros.io deployment" \
  --parameters 'commands=[
    "curl -I http://ahauros.io",
    "curl -I https://ahauros.io",
    "sudo certbot certificates",
    "ls -la /var/www/ahauros.io/"
  ]'
```

### Monitoring Commands

#### Check Command Status
```bash
aws ssm get-command-invocation \
  --command-id "COMMAND_ID" \
  --instance-id "i-1234567890abcdef0"
```

#### List Recent Commands
```bash
aws ssm list-commands \
  --instance-id "i-1234567890abcdef0" \
  --max-items 10
```

#### View Command Output
```bash
aws ssm get-command-invocation \
  --command-id "COMMAND_ID" \
  --instance-id "i-1234567890abcdef0" \
  --query 'StandardOutputContent'
```

### Troubleshooting

#### Check EC2 Instance Status
```bash
aws ec2 describe-instances \
  --instance-ids i-1234567890abcdef0 \
  --query 'Reservations[0].Instances[0].State.Name'
```

#### Check SSM Agent Status
```bash
aws ssm describe-instance-information \
  --filters "Key=InstanceIds,Values=i-1234567890abcdef0"
```

#### View CloudWatch Logs
```bash
aws logs describe-log-groups --log-group-name-prefix /aws/ssm
```

### File Structure on Server
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

### Expected Result

After deployment, your site should be available at:
- **Primary:** https://ahauros.io
- **WWW:** https://www.ahauros.io
- **HTTP redirects:** http://ahauros.io → https://ahauros.io

The landing page will load with:
- ✅ Multi-language support (EN/RO/FR/ES/PT)
- ✅ Responsive design
- ✅ Fast loading with optimized assets
- ✅ SSL security
- ✅ Professional branding
- ✅ SPA routing support

### Security Features

- ✅ SSL/TLS encryption with Let's Encrypt
- ✅ Security headers (XSS, CSRF, etc.)
- ✅ Hidden file access denied
- ✅ Content Security Policy
- ✅ Gzip compression
- ✅ Static asset caching

### Performance Optimization

- ✅ Gzip compression enabled
- ✅ Static assets cached for 1 year
- ✅ Optimized production build
- ✅ CDN-ready file structure
- ✅ Minimal bundle size (1.6MB total)

