# Ahauros.io Deployment Guide

## 🚀 Deploy Landing Page to AWS EC2 with Nginx + SSL

### Prerequisites
- AWS EC2 instance running Ubuntu/Amazon Linux
- Domain name (ahauros.io) pointing to EC2 public IP
- SSH access to EC2 instance
- Nginx installed on EC2

### Quick Deployment (Automated)

1. **Update configuration in deploy script:**
   ```bash
   # Edit deploy-ahauros.sh
   EC2_PUBLIC_IP="YOUR_EC2_PUBLIC_IP"
   SSH_KEY_PATH="~/.ssh/your-key.pem"
   ```

2. **Run deployment script:**
   ```bash
   ./deploy-ahauros.sh
   ```

### Manual Deployment Steps

#### 1. Build Production Bundle
```bash
cd landing-react
npm install
npm run build
# Output: dist/ directory with production files
```

#### 2. Connect to EC2
```bash
ssh -i ~/.ssh/your-key.pem ec2-user@YOUR_EC2_PUBLIC_IP
```

#### 3. Create Project Directory
```bash
sudo mkdir -p /var/www/ahauros.io
sudo chown -R $USER:$USER /var/www/ahauros.io
```

#### 4. Upload Build Files
From your local machine:
```bash
# Create archive
tar -czf ahauros-deploy.tar.gz -C landing-react/dist .

# Upload to EC2
scp -i ~/.ssh/your-key.pem ahauros-deploy.tar.gz ec2-user@YOUR_EC2_PUBLIC_IP:/tmp/

# On EC2, extract files
cd /var/www/ahauros.io
tar -xzf /tmp/ahauros-deploy.tar.gz
rm /tmp/ahauros-deploy.tar.gz

# Set permissions
sudo chown -R www-data:www-data /var/www/ahauros.io
sudo chmod -R 755 /var/www/ahauros.io
```

#### 5. Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/ahauros.io
```

Paste this configuration:
```nginx
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
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Handle SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security - deny access to hidden files
    location ~ /\. {
        deny all;
    }
}
```

#### 6. Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/ahauros.io /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 7. Install SSL Certificate
```bash
# Install certbot
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d ahauros.io -d www.ahauros.io

# Restart Nginx
sudo systemctl restart nginx
```

### Verification

1. **Test HTTP (should redirect to HTTPS):**
   ```bash
   curl -I http://ahauros.io
   ```

2. **Test HTTPS:**
   ```bash
   curl -I https://ahauros.io
   ```

3. **Check SSL certificate:**
   ```bash
   openssl s_client -connect ahauros.io:443 -servername ahauros.io
   ```

### File Structure on Server
```
/var/www/ahauros.io/
├── index.html
├── favicon.ico
├── apple-touch-icon.png
├── vite.svg
└── assets/
    ├── index-D1mCqAdo.css
    ├── index-zHtn8_JP.js
    ├── hero-enterprise-DNMFYVcP.png
    ├── logo-full-BGs3-lCV.png
    ├── logo-icon-46vP-fiv.png
    └── logo-white-CAwFBea2.png
```

### Troubleshooting

#### Nginx Issues
```bash
# Check Nginx status
sudo systemctl status nginx

# Check Nginx configuration
sudo nginx -t

# View Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

#### SSL Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate manually
sudo certbot renew --dry-run
```

#### File Permissions
```bash
# Fix permissions if needed
sudo chown -R www-data:www-data /var/www/ahauros.io
sudo chmod -R 755 /var/www/ahauros.io
```

### Performance Optimization

The Nginx configuration includes:
- ✅ Gzip compression
- ✅ Static asset caching (1 year)
- ✅ Security headers
- ✅ SPA routing support
- ✅ Hidden file protection

### Security Features

- ✅ SSL/TLS encryption
- ✅ Security headers (XSS, CSRF, etc.)
- ✅ Hidden file access denied
- ✅ Content Security Policy

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

