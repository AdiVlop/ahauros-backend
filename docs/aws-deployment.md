# 🚀 AWS Deployment Guide - Ahauros Backend

Ghid complet pentru deployment-ul infrastructurii Ahauros Backend pe AWS.

## 📋 Prerequisituri

### 1. **AWS Account Setup**
- Cont AWS cu permisiuni pentru IAM, VPC, RDS, ElastiCache, Lambda, API Gateway
- AWS CLI configurat cu credentials
- Terraform instalat (versiunea 1.6.0+)

### 2. **Domain Configuration**
- Domeniul `ahauros.ai` înregistrat în Squarespace
- Acces la panoul de control DNS pentru configurarea CNAME records

### 3. **GitHub Repository**
- Repository cu codul sursă
- GitHub Secrets configurate pentru AWS credentials

---

## 🏗️ **Infrastructura AWS**

### **Resurse Create de Terraform:**

1. **VPC & Networking**
   - VPC cu subnets publice, private și pentru baze de date
   - Internet Gateway și NAT Gateways
   - Security Groups pentru toate serviciile

2. **Baze de Date**
   - **RDS PostgreSQL**: Instanță `db.t3.micro` cu backup automat
   - **ElastiCache Redis**: Cluster cu 2 noduri pentru cache

3. **Compute & API**
   - **Lambda Function**: Node.js 18.x pentru API logic
   - **API Gateway**: REST API cu custom domain `api.ahauros.ai`

4. **Storage & Security**
   - **S3 Bucket**: Pentru logs și stocare
   - **ACM Certificate**: SSL pentru `api.ahauros.ai`
   - **IAM Roles**: Permisiuni pentru Lambda și RDS

---

## 🚀 **Deployment Steps**

### **Step 1: Configurează AWS Credentials**

```bash
# Configurează AWS CLI
aws configure

# Sau folosește environment variables
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_DEFAULT_REGION="us-east-1"
```

### **Step 2: Configurează Terraform**

```bash
# Navighează la directorul terraform
cd terraform

# Copiază fișierul de variabile
cp terraform.tfvars.example terraform.tfvars

# Editează variabilele
nano terraform.tfvars
```

**terraform.tfvars:**
```hcl
aws_region  = "us-east-1"
environment = "prod"
domain_name = "ahauros.io"
api_domain  = "api.ahauros.io"
db_password = "your-secure-password-here"
```

### **Step 3: Inițializează și Deploy**

```bash
# Inițializează Terraform
terraform init

# Planifică infrastructura
terraform plan

# Deploy infrastructura
terraform apply
```

### **Step 4: Configurează DNS în Squarespace**

**Pentru a păstra Google Workspace intact, folosește Squarespace DNS:**

Vezi ghidul complet: **[📖 Squarespace DNS Setup Guide](squarespace-dns-setup.md)**

**Quick Start Squarespace DNS:**
```bash
# Deploy infrastructura
terraform apply

# Obține DNS records pentru Squarespace
terraform output dns_records_for_squarespace

# Adaugă CNAME records în Squarespace:
# Settings → Domains → ahauros.ai → DNS Settings
```

### **Step 5: Validează SSL Certificates**

**SSL certificates folosesc validare prin email:**

```bash
# Vezi email-urile pentru validare
terraform output ssl_validation_emails
```

**Email-uri care vor primi cererea de validare:**
- `contact@ahauros.io` ⭐ **PRINCIPAL**
- `admin@ahauros.io`
- `administrator@ahauros.io`
- `hostmaster@ahauros.io`
- `postmaster@ahauros.io`
- `webmaster@ahauros.io`

**Procesul de validare:**
1. Verifică inbox-ul pentru email-uri de la AWS Certificate Manager
2. Click pe link-ul din email pentru validare
3. Confirmă validarea în AWS Console
4. Așteaptă validarea (1-5 minute)

---

## 🔧 **GitHub Actions CI/CD**

### **Secrets Configurate în GitHub:**

1. **AWS_ACCESS_KEY_ID** - Access key pentru AWS
2. **AWS_SECRET_ACCESS_KEY** - Secret key pentru AWS  
3. **DB_PASSWORD** - Parola pentru baza de date

### **Workflow Pipeline:**

1. **Test** - Rulează teste și linting
2. **Build** - Construiește Lambda function
3. **Terraform Plan** - Planifică schimbările
4. **Deploy** - Aplică schimbările în AWS
5. **Health Check** - Verifică că API-ul funcționează

### **Trigger-uri:**
- **Push pe main** → Deploy automat în producție
- **Push pe develop** → Deploy în staging
- **Pull Request** → Doar teste și planificare

---

## 📊 **API Endpoints Disponibile**

După deployment, API-ul va fi disponibil la `https://api.ahauros.io`:

### **Health Check**
```bash
curl https://api.ahauros.io/health
# Response: {"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

### **Users API**
```bash
# Lista utilizatori
curl https://api.ahauros.io/api/v1/users

# Creează utilizator
curl -X POST https://api.ahauros.io/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}'
```

### **Products API**
```bash
# Lista produse
curl https://api.ahauros.io/api/v1/products
```

### **Orders API**
```bash
# Creează comandă
curl -X POST https://api.ahauros.io/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{"user_id":1,"product_id":1,"quantity":2}'
```

---

## 🔍 **Monitoring și Debugging**

### **CloudWatch Logs:**
- **Lambda Logs**: `/aws/lambda/ahauros-api`
- **API Gateway Logs**: Configurate automat
- **RDS Logs**: Disponibile în RDS Console

### **Health Monitoring:**
```bash
# Verifică statusul serviciilor
curl https://api.ahauros.io/health

# Verifică Lambda function
aws lambda get-function --function-name ahauros-api

# Verifică RDS status
aws rds describe-db-instances --db-instance-identifier ahauros-postgres
```

---

## 🛠️ **Maintenance Commands**

### **Update Lambda Function:**
```bash
cd aws-lambda
npm install --production
zip -r function.zip index.js package.json node_modules/
aws lambda update-function-code --function-name ahauros-api --zip-file fileb://function.zip
```

### **Database Migrations:**
```bash
# Conectează-te la RDS
psql -h [RDS_ENDPOINT] -U admin -d ahauros

# Rulează migrări
\i data-layer/postgres/init.sql
```

### **Terraform Updates:**
```bash
cd terraform
terraform plan
terraform apply
```

---

## 🚨 **Troubleshooting**

### **Probleme Comune:**

1. **API nu răspunde:**
   - Verifică că Lambda function este deployed
   - Verifică API Gateway configuration
   - Verifică DNS configuration

2. **Database connection errors:**
   - Verifică Security Groups
   - Verifică RDS endpoint
   - Verifică credentials

3. **SSL Certificate issues:**
   - Verifică că DNS validation records sunt configurate
   - Așteaptă validarea certificatei (poate dura până la 30 min)

### **Debug Commands:**
```bash
# Verifică Terraform state
terraform show

# Verifică AWS resources
aws lambda list-functions
aws apigateway get-rest-apis
aws rds describe-db-instances

# Testează conectivitatea
curl -v https://api.ahauros.io/health
```

---

## 📈 **Costuri Estimate**

**Infrastructura de bază (us-east-1):**
- **RDS PostgreSQL** (db.t3.micro): ~$15/lună
- **ElastiCache Redis** (cache.t3.micro): ~$15/lună  
- **Lambda** (512MB, 1M requests): ~$1/lună
- **API Gateway** (1M requests): ~$3.50/lună
- **S3 Storage** (10GB): ~$0.25/lună
- **Data Transfer**: ~$1/lună

**Total estimat: ~$35-40/lună**

---

## ✅ **Checklist Deployment**

- [ ] AWS credentials configurate
- [ ] Terraform variables setate
- [ ] `terraform init` rulat cu succes
- [ ] `terraform apply` rulat cu succes
- [ ] DNS records configurate în Squarespace
- [ ] SSL certificate validat
- [ ] API endpoint testat
- [ ] GitHub Actions configurate
- [ ] Monitoring setup

**🎉 După completarea checklist-ului, API-ul Ahauros va fi live la `https://api.ahauros.io`!**



Ghid complet pentru deployment-ul infrastructurii Ahauros Backend pe AWS.

## 📋 Prerequisituri

### 1. **AWS Account Setup**
- Cont AWS cu permisiuni pentru IAM, VPC, RDS, ElastiCache, Lambda, API Gateway
- AWS CLI configurat cu credentials
- Terraform instalat (versiunea 1.6.0+)

### 2. **Domain Configuration**
- Domeniul `ahauros.ai` înregistrat în Squarespace
- Acces la panoul de control DNS pentru configurarea CNAME records

### 3. **GitHub Repository**
- Repository cu codul sursă
- GitHub Secrets configurate pentru AWS credentials

---

## 🏗️ **Infrastructura AWS**

### **Resurse Create de Terraform:**

1. **VPC & Networking**
   - VPC cu subnets publice, private și pentru baze de date
   - Internet Gateway și NAT Gateways
   - Security Groups pentru toate serviciile

2. **Baze de Date**
   - **RDS PostgreSQL**: Instanță `db.t3.micro` cu backup automat
   - **ElastiCache Redis**: Cluster cu 2 noduri pentru cache

3. **Compute & API**
   - **Lambda Function**: Node.js 18.x pentru API logic
   - **API Gateway**: REST API cu custom domain `api.ahauros.ai`

4. **Storage & Security**
   - **S3 Bucket**: Pentru logs și stocare
   - **ACM Certificate**: SSL pentru `api.ahauros.ai`
   - **IAM Roles**: Permisiuni pentru Lambda și RDS

---

## 🚀 **Deployment Steps**

### **Step 1: Configurează AWS Credentials**

```bash
# Configurează AWS CLI
aws configure

# Sau folosește environment variables
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_DEFAULT_REGION="us-east-1"
```

### **Step 2: Configurează Terraform**

```bash
# Navighează la directorul terraform
cd terraform

# Copiază fișierul de variabile
cp terraform.tfvars.example terraform.tfvars

# Editează variabilele
nano terraform.tfvars
```

**terraform.tfvars:**
```hcl
aws_region  = "us-east-1"
environment = "prod"
domain_name = "ahauros.io"
api_domain  = "api.ahauros.io"
db_password = "your-secure-password-here"
```

### **Step 3: Inițializează și Deploy**

```bash
# Inițializează Terraform
terraform init

# Planifică infrastructura
terraform plan

# Deploy infrastructura
terraform apply
```

### **Step 4: Configurează DNS în Squarespace**

**Pentru a păstra Google Workspace intact, folosește Squarespace DNS:**

Vezi ghidul complet: **[📖 Squarespace DNS Setup Guide](squarespace-dns-setup.md)**

**Quick Start Squarespace DNS:**
```bash
# Deploy infrastructura
terraform apply

# Obține DNS records pentru Squarespace
terraform output dns_records_for_squarespace

# Adaugă CNAME records în Squarespace:
# Settings → Domains → ahauros.ai → DNS Settings
```

### **Step 5: Validează SSL Certificates**

**SSL certificates folosesc validare prin email:**

```bash
# Vezi email-urile pentru validare
terraform output ssl_validation_emails
```

**Email-uri care vor primi cererea de validare:**
- `contact@ahauros.io` ⭐ **PRINCIPAL**
- `admin@ahauros.io`
- `administrator@ahauros.io`
- `hostmaster@ahauros.io`
- `postmaster@ahauros.io`
- `webmaster@ahauros.io`

**Procesul de validare:**
1. Verifică inbox-ul pentru email-uri de la AWS Certificate Manager
2. Click pe link-ul din email pentru validare
3. Confirmă validarea în AWS Console
4. Așteaptă validarea (1-5 minute)

---

## 🔧 **GitHub Actions CI/CD**

### **Secrets Configurate în GitHub:**

1. **AWS_ACCESS_KEY_ID** - Access key pentru AWS
2. **AWS_SECRET_ACCESS_KEY** - Secret key pentru AWS  
3. **DB_PASSWORD** - Parola pentru baza de date

### **Workflow Pipeline:**

1. **Test** - Rulează teste și linting
2. **Build** - Construiește Lambda function
3. **Terraform Plan** - Planifică schimbările
4. **Deploy** - Aplică schimbările în AWS
5. **Health Check** - Verifică că API-ul funcționează

### **Trigger-uri:**
- **Push pe main** → Deploy automat în producție
- **Push pe develop** → Deploy în staging
- **Pull Request** → Doar teste și planificare

---

## 📊 **API Endpoints Disponibile**

După deployment, API-ul va fi disponibil la `https://api.ahauros.io`:

### **Health Check**
```bash
curl https://api.ahauros.io/health
# Response: {"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

### **Users API**
```bash
# Lista utilizatori
curl https://api.ahauros.io/api/v1/users

# Creează utilizator
curl -X POST https://api.ahauros.io/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}'
```

### **Products API**
```bash
# Lista produse
curl https://api.ahauros.io/api/v1/products
```

### **Orders API**
```bash
# Creează comandă
curl -X POST https://api.ahauros.io/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{"user_id":1,"product_id":1,"quantity":2}'
```

---

## 🔍 **Monitoring și Debugging**

### **CloudWatch Logs:**
- **Lambda Logs**: `/aws/lambda/ahauros-api`
- **API Gateway Logs**: Configurate automat
- **RDS Logs**: Disponibile în RDS Console

### **Health Monitoring:**
```bash
# Verifică statusul serviciilor
curl https://api.ahauros.io/health

# Verifică Lambda function
aws lambda get-function --function-name ahauros-api

# Verifică RDS status
aws rds describe-db-instances --db-instance-identifier ahauros-postgres
```

---

## 🛠️ **Maintenance Commands**

### **Update Lambda Function:**
```bash
cd aws-lambda
npm install --production
zip -r function.zip index.js package.json node_modules/
aws lambda update-function-code --function-name ahauros-api --zip-file fileb://function.zip
```

### **Database Migrations:**
```bash
# Conectează-te la RDS
psql -h [RDS_ENDPOINT] -U admin -d ahauros

# Rulează migrări
\i data-layer/postgres/init.sql
```

### **Terraform Updates:**
```bash
cd terraform
terraform plan
terraform apply
```

---

## 🚨 **Troubleshooting**

### **Probleme Comune:**

1. **API nu răspunde:**
   - Verifică că Lambda function este deployed
   - Verifică API Gateway configuration
   - Verifică DNS configuration

2. **Database connection errors:**
   - Verifică Security Groups
   - Verifică RDS endpoint
   - Verifică credentials

3. **SSL Certificate issues:**
   - Verifică că DNS validation records sunt configurate
   - Așteaptă validarea certificatei (poate dura până la 30 min)

### **Debug Commands:**
```bash
# Verifică Terraform state
terraform show

# Verifică AWS resources
aws lambda list-functions
aws apigateway get-rest-apis
aws rds describe-db-instances

# Testează conectivitatea
curl -v https://api.ahauros.io/health
```

---

## 📈 **Costuri Estimate**

**Infrastructura de bază (us-east-1):**
- **RDS PostgreSQL** (db.t3.micro): ~$15/lună
- **ElastiCache Redis** (cache.t3.micro): ~$15/lună  
- **Lambda** (512MB, 1M requests): ~$1/lună
- **API Gateway** (1M requests): ~$3.50/lună
- **S3 Storage** (10GB): ~$0.25/lună
- **Data Transfer**: ~$1/lună

**Total estimat: ~$35-40/lună**

---

## ✅ **Checklist Deployment**

- [ ] AWS credentials configurate
- [ ] Terraform variables setate
- [ ] `terraform init` rulat cu succes
- [ ] `terraform apply` rulat cu succes
- [ ] DNS records configurate în Squarespace
- [ ] SSL certificate validat
- [ ] API endpoint testat
- [ ] GitHub Actions configurate
- [ ] Monitoring setup

**🎉 După completarea checklist-ului, API-ul Ahauros va fi live la `https://api.ahauros.io`!**










