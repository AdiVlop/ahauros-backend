# Squarespace DNS Setup for Ahauros.io

## 🌐 How to Configure DNS in Squarespace

### Step 1: Access Squarespace DNS Settings

1. **Log into your Squarespace account**
2. **Go to Settings** → **Domains**
3. **Click on your domain** (ahauros.io)
4. **Click "DNS Settings"**

### Step 2: Configure DNS Records

You need to add these DNS records to point your domain to your AWS EC2 instance:

#### A Record (Primary Domain)
```
Type: A
Name: @
Value: YOUR_EC2_PUBLIC_IP
TTL: 3600 (or default)
```

#### CNAME Record (WWW Subdomain)
```
Type: CNAME
Name: www
Value: ahauros.io
TTL: 3600 (or default)
```

### Step 3: Remove Default Squarespace Records

**Remove these default records if they exist:**
- Any A records pointing to Squarespace IPs
- Any CNAME records pointing to Squarespace
- Any MX records (unless you want email through Squarespace)

### Step 4: Example Configuration

If your EC2 public IP is `54.123.45.67`, your DNS records should look like:

```
Type    Name    Value           TTL
A       @       54.123.45.67    3600
CNAME   www     ahauros.io      3600
```

### Step 5: Save and Wait

1. **Save your DNS changes**
2. **Wait for propagation** (5-15 minutes)
3. **Test your domain**: Visit https://ahauros.io

## 🔍 How to Find Your EC2 Public IP

### Method 1: From AWS Console
1. Go to **EC2 Dashboard**
2. Click **Instances**
3. Find your instance
4. Copy the **Public IPv4 address**

### Method 2: From AWS CLI
```bash
aws ec2 describe-instances \
  --instance-ids YOUR_INSTANCE_ID \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text
```

### Method 3: From Deployment Script
If you used the automated deployment script, it will show the public IP at the end.

## ⚠️ Important Notes

### SSL Certificate Requirements
- **Domain must point to EC2 IP** before SSL certificate can be issued
- **DNS propagation must complete** (5-15 minutes)
- **Both ahauros.io and www.ahauros.io** must resolve to the same IP

### Testing DNS Propagation
```bash
# Test from command line
nslookup ahauros.io
nslookup www.ahauros.io

# Test from browser
# Visit: http://ahauros.io (should redirect to HTTPS)
# Visit: https://ahauros.io (should show your landing page)
```

### Common Issues

#### Issue 1: SSL Certificate Fails
**Solution**: Wait for DNS propagation, then re-run SSL setup:
```bash
aws ssm send-command \
  --targets "Key=instanceIds,Values=YOUR_INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --comment "Retry SSL setup" \
  --parameters 'commands=[
    "sudo certbot --nginx -d ahauros.io -d www.ahauros.io --non-interactive --agree-tos --email admin@ahauros.io --redirect"
  ]'
```

#### Issue 2: Site Not Loading
**Solution**: Check if DNS is propagated:
```bash
# Check if domain resolves to your EC2 IP
dig ahauros.io
dig www.ahauros.io
```

#### Issue 3: Mixed Content Errors
**Solution**: Ensure all resources use HTTPS:
- Update any hardcoded HTTP URLs to HTTPS
- Check browser console for mixed content warnings

## 🚀 After DNS Configuration

Once DNS is properly configured:

1. **Visit https://ahauros.io** - Should show your landing page
2. **Visit http://ahauros.io** - Should redirect to HTTPS
3. **Visit https://www.ahauros.io** - Should show your landing page
4. **Test language switcher** - Should work in all languages
5. **Test all navigation links** - Should work properly

## 📱 Squarespace Mobile App

You can also configure DNS using the Squarespace mobile app:
1. **Open Squarespace app**
2. **Go to Settings** → **Domains**
3. **Select your domain**
4. **Tap "DNS Settings"**
5. **Add the A and CNAME records** as described above

## 🔧 Troubleshooting Commands

### Check DNS Resolution
```bash
# Check if domain resolves correctly
nslookup ahauros.io
nslookup www.ahauros.io

# Check with different DNS servers
nslookup ahauros.io 8.8.8.8
nslookup ahauros.io 1.1.1.1
```

### Test Website
```bash
# Test HTTP (should redirect to HTTPS)
curl -I http://ahauros.io

# Test HTTPS
curl -I https://ahauros.io

# Test with verbose output
curl -v https://ahauros.io
```

### Check SSL Certificate
```bash
# Check SSL certificate details
openssl s_client -connect ahauros.io:443 -servername ahauros.io
```

## ✅ Success Indicators

Your DNS is correctly configured when:
- ✅ `nslookup ahauros.io` returns your EC2 IP
- ✅ `nslookup www.ahauros.io` returns your EC2 IP
- ✅ `https://ahauros.io` loads your landing page
- ✅ `http://ahauros.io` redirects to HTTPS
- ✅ SSL certificate is valid and trusted
- ✅ All language switcher options work
- ✅ All navigation links work properly

## 📞 Need Help?

If you encounter issues:
1. **Check DNS propagation** using online tools like whatsmydns.net
2. **Verify EC2 instance** is running and accessible
3. **Check Nginx logs** on your EC2 instance
4. **Ensure security groups** allow traffic on ports 80 and 443
5. **Contact Squarespace support** if DNS changes aren't taking effect

