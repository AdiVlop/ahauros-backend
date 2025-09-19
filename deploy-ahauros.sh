#!/bin/bash

# Ahauros.io Deployment Script for AWS EC2
# This script deploys the Ahauros landing page to EC2 with Nginx and SSL

set -e

# Configuration - UPDATE THESE VALUES
EC2_PUBLIC_IP="YOUR_EC2_PUBLIC_IP"
SSH_KEY_PATH="~/.ssh/your-key.pem"
DOMAIN="ahauros.io"

echo "🚀 Starting Ahauros.io deployment..."

# Step 1: Build production bundle (if not already built)
echo "📦 Building production bundle..."
cd landing-react
npm install
npm run build
echo "✅ Build complete"

# Step 2: Create deployment package
echo "📁 Creating deployment package..."
cd ..
tar -czf ahauros-deploy.tar.gz -C landing-react/dist .

# Step 3: Upload to EC2
echo "⬆️  Uploading files to EC2..."
scp -i $SSH_KEY_PATH ahauros-deploy.tar.gz ec2-user@$EC2_PUBLIC_IP:/tmp/

# Step 4: Deploy on server
echo "🔧 Deploying on server..."
ssh -i $SSH_KEY_PATH ec2-user@$EC2_PUBLIC_IP << 'EOF'
    # Create project directory
    sudo mkdir -p /var/www/ahauros.io
    sudo chown -R $USER:$USER /var/www/ahauros.io
    
    # Extract files
    cd /var/www/ahauros.io
    tar -xzf /tmp/ahauros-deploy.tar.gz
    rm /tmp/ahauros-deploy.tar.gz
    
    # Set proper permissions
    sudo chown -R www-data:www-data /var/www/ahauros.io
    sudo chmod -R 755 /var/www/ahauros.io
    
    echo "✅ Files deployed to /var/www/ahauros.io"
EOF

# Step 5: Configure Nginx
echo "⚙️  Configuring Nginx..."
ssh -i $SSH_KEY_PATH ec2-user@$EC2_PUBLIC_IP << 'EOF'
    # Create Nginx configuration
    sudo tee /etc/nginx/sites-available/ahauros.io > /dev/null << 'NGINX_CONFIG'
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
NGINX_CONFIG

    # Enable site
    sudo ln -sf /etc/nginx/sites-available/ahauros.io /etc/nginx/sites-enabled/
    
    # Test configuration
    sudo nginx -t
    
    # Reload Nginx
    sudo systemctl reload nginx
    
    echo "✅ Nginx configured and reloaded"
EOF

# Step 6: Install SSL certificate
echo "🔒 Installing SSL certificate..."
ssh -i $SSH_KEY_PATH ec2-user@$EC2_PUBLIC_IP << 'EOF'
    # Install certbot if not already installed
    sudo apt update
    sudo apt install -y certbot python3-certbot-nginx
    
    # Get SSL certificate
    sudo certbot --nginx -d ahauros.io -d www.ahauros.io --non-interactive --agree-tos --email admin@ahauros.io
    
    # Restart Nginx
    sudo systemctl restart nginx
    
    echo "✅ SSL certificate installed"
EOF

# Cleanup
rm ahauros-deploy.tar.gz

echo "🎉 Deployment complete!"
echo "🌐 Your site should be available at: https://ahauros.io"
echo "📊 Check status with: curl -I https://ahauros.io"

