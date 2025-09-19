# 🌐 Squarespace DNS Setup - Ahauros AI

Ghid pentru configurarea DNS în Squarespace pentru subdomeniile Ahauros AI, fără a afecta Google Workspace.

## 🎯 **Obiectivul**

Configurează subdomeniile `api.ahauros.ai` și `app.ahauros.ai` în Squarespace DNS, păstrând Google Workspace intact.

---

## 🚀 **Step 1: Deploy Infrastructura AWS**

### **Configurează și Deploy Terraform:**

```bash
# Navighează la directorul terraform
cd terraform

# Copiază și editează variabilele
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars
```

**terraform.tfvars:**
```hcl
aws_region  = "us-east-1"
environment = "prod"
domain_name = "ahauros.io"
api_domain  = "api.ahauros.io"
db_password = "your-secure-password"
enable_app_subdomain = true
```

### **Deploy Infrastructura:**

```bash
# Inițializează Terraform
terraform init

# Planifică resursele
terraform plan

# Deploy infrastructura
terraform apply
```

### **Obține DNS Records:**

```bash
# Vezi DNS records pentru Squarespace
terraform output dns_records_for_squarespace
```

**Output exemplu:**
```json
{
  "api_cname" = {
    "name" = "api"
    "type" = "CNAME"
    "value" = "d1234567890.execute-api.us-east-1.amazonaws.com"
  }
  "app_cname" = {
    "name" = "app"
    "type" = "CNAME"
    "value" = "abc123def456.cloudfront.net"
  }
}
```

---

## 🔧 **Step 2: Configurează DNS în Squarespace**

### **Accesează Squarespace Domain Settings:**

1. **Loghează-te în Squarespace**
2. **Navighează la**: Settings → Domains
3. **Selectează**: `ahauros.ai`
4. **Click**: "DNS Settings" sau "Advanced Settings"

### **Adaugă CNAME Records:**

#### **1. API Subdomain:**
- **Type**: CNAME
- **Name**: `api`
- **Value**: `d1234567890.execute-api.us-east-1.amazonaws.com` (din terraform output)
- **TTL**: 3600 (sau default)

#### **2. App Subdomain:**
- **Type**: CNAME
- **Name**: `app`
- **Value**: `abc123def456.cloudfront.net` (din terraform output)
- **TTL**: 3600 (sau default)

### **Salvează Schimbările:**

1. **Click**: "Save" sau "Add Record"
2. **Confirmă**: Adăugarea record-urilor
3. **Așteaptă**: Propagarea DNS (5-30 minute)

---

## 📧 **Step 3: Validează SSL Certificates**

### **Verifică Email-urile pentru Validare:**

După `terraform apply`, ACM va trimite email-uri de validare la:

- ✅ **contact@ahauros.io** ⭐ **PRINCIPAL**
- ✅ **admin@ahauros.io**
- ✅ **administrator@ahauros.io**
- ✅ **hostmaster@ahauros.io**
- ✅ **postmaster@ahauros.io**
- ✅ **webmaster@ahauros.io**

### **Procesul de Validare:**

1. **Verifică inbox-ul** pentru email-uri de la AWS Certificate Manager
2. **Click pe link-ul** din email pentru validare
3. **Confirmă validarea** în AWS Console
4. **Așteaptă** validarea (1-5 minute)

### **Verifică Statusul Certificatei:**

```bash
# Verifică statusul certificatei wildcard
aws acm describe-certificate --certificate-arn [WILDCARD_CERT_ARN]

# Verifică statusul certificatei root
aws acm describe-certificate --certificate-arn [ROOT_CERT_ARN]
```

---

## ⏱️ **Step 4: Așteaptă Propagarea DNS**

### **Verifică Propagarea:**

```bash
# Verifică API subdomain
dig api.ahauros.io

# Verifică app subdomain
dig app.ahauros.io

# Verifică cu diferite DNS servers
dig @8.8.8.8 api.ahauros.io
dig @1.1.1.1 app.ahauros.io
```

### **Timp de Propagare:**
- **Local**: 5-15 minute
- **Global**: 1-24 ore (de obicei 1-2 ore)

---

## 🔍 **Step 5: Testează Endpoint-urile**

### **API Endpoint:**
```bash
# Testează health check
curl https://api.ahauros.io/health

# Răspuns așteptat:
# {"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

### **App Endpoint:**
```bash
# Testează app subdomain
curl -I https://app.ahauros.io

# Răspuns așteptat: 200 OK
```

### **Verifică SSL:**
```bash
# Verifică certificatul pentru API
openssl s_client -connect api.ahauros.io:443 -servername api.ahauros.io

# Verifică certificatul pentru App
openssl s_client -connect app.ahauros.io:443 -servername app.ahauros.io
```

---

## 📊 **Infrastructura Creată**

### **AWS Resources:**
- ✅ **API Gateway**: `api.ahauros.io`
- ✅ **CloudFront**: `app.ahauros.io`
- ✅ **Lambda Function**: Backend logic
- ✅ **RDS PostgreSQL**: Database
- ✅ **ElastiCache Redis**: Cache
- ✅ **S3 Bucket**: App hosting

### **SSL Certificates:**
- ✅ **Wildcard Certificate**: `*.ahauros.io`
- ✅ **Root Certificate**: `ahauros.io`
- ✅ **Email Validation**: Manual approval required

### **DNS Records (în Squarespace):**
- ✅ **CNAME**: `api` → API Gateway
- ✅ **CNAME**: `app` → CloudFront

---

## 🚨 **Troubleshooting**

### **Probleme Comune:**

#### **1. DNS nu se propagă:**
```bash
# Verifică cu diferite DNS servers
dig @8.8.8.8 api.ahauros.io
dig @1.1.1.1 app.ahauros.io

# Verifică în Squarespace că records sunt corecte
```

#### **2. SSL Certificate nu se validează:**
```bash
# Verifică email-urile pentru validare
# Check: admin@ahauros.ai, webmaster@ahauros.ai, etc.

# Verifică statusul în AWS Console
aws acm list-certificates --region us-east-1
```

#### **3. Subdomain-urile nu funcționează:**
```bash
# Verifică că CNAME records sunt corecte în Squarespace
# Verifică că AWS resources sunt deployed
terraform output dns_records_for_squarespace
```

### **Debug Commands:**

```bash
# Verifică toate output-urile Terraform
terraform output

# Verifică statusul ACM certificates
aws acm list-certificates --region us-east-1

# Verifică CloudFront distributions
aws cloudfront list-distributions

# Verifică API Gateway
aws apigateway get-rest-apis
```

---

## 📈 **Costuri**

### **AWS Resources:**
- **API Gateway**: ~$3.50/lună (1M requests)
- **Lambda**: ~$1/lună (512MB, 1M requests)
- **RDS PostgreSQL**: ~$15/lună (db.t3.micro)
- **ElastiCache Redis**: ~$15/lună (cache.t3.micro)
- **CloudFront**: ~$1/lună (1GB transfer)
- **S3**: ~$0.25/lună (10GB storage)

**Total estimat: ~$35-40/lună**

### **Squarespace DNS:**
- **Gratuit** - inclus în planul Squarespace

---

## ✅ **Checklist Final**

- [ ] Terraform deployed cu succes
- [ ] DNS records obținuți din `terraform output`
- [ ] CNAME records adăugate în Squarespace
- [ ] DNS propagat (verificat cu `dig`)
- [ ] SSL certificates validate prin email
- [ ] `https://api.ahauros.io/health` funcționează
- [ ] `https://app.ahauros.io` funcționează
- [ ] Google Workspace rămâne intact

---

## 🎉 **Rezultat Final**

După completarea setup-ului, vei avea:

- ✅ **`https://api.ahauros.io/health`** - API Backend live
- ✅ **`https://app.ahauros.io`** - Frontend App live
- ✅ **SSL securizat** cu wildcard certificate
- ✅ **DNS gestionat** în Squarespace (fără afectarea Google Workspace)
- ✅ **Infrastructură scalabilă** pe AWS

**🌐 Subdomeniile Ahauros AI sunt live și securizate!**



Ghid pentru configurarea DNS în Squarespace pentru subdomeniile Ahauros AI, fără a afecta Google Workspace.

## 🎯 **Obiectivul**

Configurează subdomeniile `api.ahauros.ai` și `app.ahauros.ai` în Squarespace DNS, păstrând Google Workspace intact.

---

## 🚀 **Step 1: Deploy Infrastructura AWS**

### **Configurează și Deploy Terraform:**

```bash
# Navighează la directorul terraform
cd terraform

# Copiază și editează variabilele
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars
```

**terraform.tfvars:**
```hcl
aws_region  = "us-east-1"
environment = "prod"
domain_name = "ahauros.io"
api_domain  = "api.ahauros.io"
db_password = "your-secure-password"
enable_app_subdomain = true
```

### **Deploy Infrastructura:**

```bash
# Inițializează Terraform
terraform init

# Planifică resursele
terraform plan

# Deploy infrastructura
terraform apply
```

### **Obține DNS Records:**

```bash
# Vezi DNS records pentru Squarespace
terraform output dns_records_for_squarespace
```

**Output exemplu:**
```json
{
  "api_cname" = {
    "name" = "api"
    "type" = "CNAME"
    "value" = "d1234567890.execute-api.us-east-1.amazonaws.com"
  }
  "app_cname" = {
    "name" = "app"
    "type" = "CNAME"
    "value" = "abc123def456.cloudfront.net"
  }
}
```

---

## 🔧 **Step 2: Configurează DNS în Squarespace**

### **Accesează Squarespace Domain Settings:**

1. **Loghează-te în Squarespace**
2. **Navighează la**: Settings → Domains
3. **Selectează**: `ahauros.ai`
4. **Click**: "DNS Settings" sau "Advanced Settings"

### **Adaugă CNAME Records:**

#### **1. API Subdomain:**
- **Type**: CNAME
- **Name**: `api`
- **Value**: `d1234567890.execute-api.us-east-1.amazonaws.com` (din terraform output)
- **TTL**: 3600 (sau default)

#### **2. App Subdomain:**
- **Type**: CNAME
- **Name**: `app`
- **Value**: `abc123def456.cloudfront.net` (din terraform output)
- **TTL**: 3600 (sau default)

### **Salvează Schimbările:**

1. **Click**: "Save" sau "Add Record"
2. **Confirmă**: Adăugarea record-urilor
3. **Așteaptă**: Propagarea DNS (5-30 minute)

---

## 📧 **Step 3: Validează SSL Certificates**

### **Verifică Email-urile pentru Validare:**

După `terraform apply`, ACM va trimite email-uri de validare la:

- ✅ **contact@ahauros.io** ⭐ **PRINCIPAL**
- ✅ **admin@ahauros.io**
- ✅ **administrator@ahauros.io**
- ✅ **hostmaster@ahauros.io**
- ✅ **postmaster@ahauros.io**
- ✅ **webmaster@ahauros.io**

### **Procesul de Validare:**

1. **Verifică inbox-ul** pentru email-uri de la AWS Certificate Manager
2. **Click pe link-ul** din email pentru validare
3. **Confirmă validarea** în AWS Console
4. **Așteaptă** validarea (1-5 minute)

### **Verifică Statusul Certificatei:**

```bash
# Verifică statusul certificatei wildcard
aws acm describe-certificate --certificate-arn [WILDCARD_CERT_ARN]

# Verifică statusul certificatei root
aws acm describe-certificate --certificate-arn [ROOT_CERT_ARN]
```

---

## ⏱️ **Step 4: Așteaptă Propagarea DNS**

### **Verifică Propagarea:**

```bash
# Verifică API subdomain
dig api.ahauros.io

# Verifică app subdomain
dig app.ahauros.io

# Verifică cu diferite DNS servers
dig @8.8.8.8 api.ahauros.io
dig @1.1.1.1 app.ahauros.io
```

### **Timp de Propagare:**
- **Local**: 5-15 minute
- **Global**: 1-24 ore (de obicei 1-2 ore)

---

## 🔍 **Step 5: Testează Endpoint-urile**

### **API Endpoint:**
```bash
# Testează health check
curl https://api.ahauros.io/health

# Răspuns așteptat:
# {"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

### **App Endpoint:**
```bash
# Testează app subdomain
curl -I https://app.ahauros.io

# Răspuns așteptat: 200 OK
```

### **Verifică SSL:**
```bash
# Verifică certificatul pentru API
openssl s_client -connect api.ahauros.io:443 -servername api.ahauros.io

# Verifică certificatul pentru App
openssl s_client -connect app.ahauros.io:443 -servername app.ahauros.io
```

---

## 📊 **Infrastructura Creată**

### **AWS Resources:**
- ✅ **API Gateway**: `api.ahauros.io`
- ✅ **CloudFront**: `app.ahauros.io`
- ✅ **Lambda Function**: Backend logic
- ✅ **RDS PostgreSQL**: Database
- ✅ **ElastiCache Redis**: Cache
- ✅ **S3 Bucket**: App hosting

### **SSL Certificates:**
- ✅ **Wildcard Certificate**: `*.ahauros.io`
- ✅ **Root Certificate**: `ahauros.io`
- ✅ **Email Validation**: Manual approval required

### **DNS Records (în Squarespace):**
- ✅ **CNAME**: `api` → API Gateway
- ✅ **CNAME**: `app` → CloudFront

---

## 🚨 **Troubleshooting**

### **Probleme Comune:**

#### **1. DNS nu se propagă:**
```bash
# Verifică cu diferite DNS servers
dig @8.8.8.8 api.ahauros.io
dig @1.1.1.1 app.ahauros.io

# Verifică în Squarespace că records sunt corecte
```

#### **2. SSL Certificate nu se validează:**
```bash
# Verifică email-urile pentru validare
# Check: admin@ahauros.ai, webmaster@ahauros.ai, etc.

# Verifică statusul în AWS Console
aws acm list-certificates --region us-east-1
```

#### **3. Subdomain-urile nu funcționează:**
```bash
# Verifică că CNAME records sunt corecte în Squarespace
# Verifică că AWS resources sunt deployed
terraform output dns_records_for_squarespace
```

### **Debug Commands:**

```bash
# Verifică toate output-urile Terraform
terraform output

# Verifică statusul ACM certificates
aws acm list-certificates --region us-east-1

# Verifică CloudFront distributions
aws cloudfront list-distributions

# Verifică API Gateway
aws apigateway get-rest-apis
```

---

## 📈 **Costuri**

### **AWS Resources:**
- **API Gateway**: ~$3.50/lună (1M requests)
- **Lambda**: ~$1/lună (512MB, 1M requests)
- **RDS PostgreSQL**: ~$15/lună (db.t3.micro)
- **ElastiCache Redis**: ~$15/lună (cache.t3.micro)
- **CloudFront**: ~$1/lună (1GB transfer)
- **S3**: ~$0.25/lună (10GB storage)

**Total estimat: ~$35-40/lună**

### **Squarespace DNS:**
- **Gratuit** - inclus în planul Squarespace

---

## ✅ **Checklist Final**

- [ ] Terraform deployed cu succes
- [ ] DNS records obținuți din `terraform output`
- [ ] CNAME records adăugate în Squarespace
- [ ] DNS propagat (verificat cu `dig`)
- [ ] SSL certificates validate prin email
- [ ] `https://api.ahauros.io/health` funcționează
- [ ] `https://app.ahauros.io` funcționează
- [ ] Google Workspace rămâne intact

---

## 🎉 **Rezultat Final**

După completarea setup-ului, vei avea:

- ✅ **`https://api.ahauros.io/health`** - API Backend live
- ✅ **`https://app.ahauros.io`** - Frontend App live
- ✅ **SSL securizat** cu wildcard certificate
- ✅ **DNS gestionat** în Squarespace (fără afectarea Google Workspace)
- ✅ **Infrastructură scalabilă** pe AWS

**🌐 Subdomeniile Ahauros AI sunt live și securizate!**










