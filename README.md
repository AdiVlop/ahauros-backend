# Ahauros Landing

![Deploy Status](https://github.com/AdiVlop/ahauros-backend/actions/workflows/deploy.yml/badge.svg)


# 🚀 Ahauros Backend

Backend infrastructure pentru sistemul AI Ahauros, construit cu microservicii și tehnologii moderne.

## 📋 Cerințe

- Docker & Docker Compose
- Git

## 💳 Stripe Billing Integration

Ahauros AI include integrarea completă Stripe pentru gestionarea subscription-urilor.

### 🔑 Configurare Stripe

#### 1. Setup Stripe Dashboard
```bash
# 1. Creează cont Stripe la https://stripe.com
# 2. Obține cheile din Dashboard > Developers > API keys
# 3. Creează produse și prețuri pentru planurile:
#    - Starter: €199/lună
#    - Growth: €699/lună  
#    - Enterprise: €1499/lună
```

#### 2. Configurare Environment Variables
```bash
# Actualizează .env cu cheile Stripe reale
STRIPE_SECRET_KEY=sk_live_your-real-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_live_your-real-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-real-stripe-webhook-secret
STRIPE_PRICE_STARTER=price_your-real-starter-price-id
STRIPE_PRICE_GROWTH=price_your-real-growth-price-id
STRIPE_PRICE_ENTERPRISE=price_your-real-enterprise-price-id
```

#### 3. Configurare Webhook în Stripe
```bash
# URL Webhook: https://api.ahauros.io/billing/webhook
# Evenimente de monitorizat:
# - checkout.session.completed
# - invoice.paid
# - customer.subscription.deleted
# - customer.subscription.updated
```

### 🧪 Testare Stripe

#### Test cu Carduri Stripe
```bash
# Carduri de test Stripe:
# 4242 4242 4242 4242 - Success
# 4000 0000 0000 0002 - Declined
# 4000 0000 0000 9995 - Insufficient funds

# Testează flow-ul complet:
# 1. Accesează https://app.ahauros.io
# 2. Navighează la tab-ul "Billing"
# 3. Alege un plan și apasă "Subscribe Now"
# 4. Completează cu cardul de test
# 5. Verifică webhook-urile în Stripe Dashboard
```

#### Test cu Stripe CLI
```bash
# Instalează Stripe CLI
# https://stripe.com/docs/stripe-cli

# Simulează evenimente webhook
stripe trigger checkout.session.completed
stripe trigger invoice.paid
stripe trigger customer.subscription.deleted
```

### 📊 Endpoint-uri Billing

```bash
# Subscribe endpoint
POST https://api.ahauros.io/billing/subscribe
{
  "plan_id": "starter|growth|enterprise",
  "email": "user@example.com",
  "user_id": "optional-user-id"
}

# Webhook endpoint (automat)
POST https://api.ahauros.io/billing/webhook
# Stripe webhook events
```

### 🎯 Planuri Disponibile

| Plan | Preț | Features |
|------|------|----------|
| **Starter** | €199/lună | Basic AI, 10K requests, Email support |
| **Growth** | €699/lună | Advanced AI, 100K requests, Priority support |
| **Enterprise** | €1499/lună | All features, Unlimited, 24/7 support |

---

## 🚀 Instalare și Configurare

### 1. Quick Start

```bash
# Clonează repository-ul
git clone <repository-url>
cd ahauros-backend

# Setup complet automat
make setup

# Sau manual:
cp env.example .env
npm install
docker-compose up -d
npm run db:migrate
npm run db:seed
```

### 2. Pornirea Serviciilor

```bash
# Pornește toate serviciile
docker-compose up -d

# Sau folosește Makefile
make docker-up
```

### 3. Verificarea Statusului

```bash
# Verifică statusul containerelor
docker-compose ps

# Verifică logurile
docker-compose logs -f
```

## 🗄️ Baze de Date

### PostgreSQL (Port: 5432)
- **Database**: ahauros
- **User**: admin
- **Password**: secret123
- **Port**: 5432

#### Conectare la PostgreSQL:
```bash
# Prin Docker
docker exec -it ahauros-postgres psql -U admin -d ahauros

# Prin client extern
psql -h localhost -p 5432 -U admin -d ahauros
```

#### Aplicarea Script-ului de Inițializare:
Script-ul `data-layer/postgres/init.sql` se aplică automat la prima pornire a containerului PostgreSQL.

Pentru a aplica manual:
```bash
docker exec -i ahauros-postgres psql -U admin -d ahauros < data-layer/postgres/init.sql
```

### Redis (Port: 6379)
- **Port**: 6379
- **Persistență**: Activă (AOF)

#### Conectare la Redis:
```bash
# Prin Docker
docker exec -it ahauros-redis redis-cli

# Prin client extern
redis-cli -h localhost -p 6379
```

### ClickHouse (Port: 8123, 9000)
- **HTTP Interface**: Port 8123
- **Native Interface**: Port 9000
- **Database**: ahauros_analytics
- **User**: admin
- **Password**: secret123

#### Conectare la ClickHouse:
```bash
# Prin Docker (HTTP)
docker exec -it ahauros-clickhouse clickhouse-client

# Prin client extern
clickhouse-client --host localhost --port 9000 --user admin --password secret123
```

## 📁 Structura Proiectului

```
ahauros-backend/
├── services/                 # Microservicii
│   ├── data-ingestion/      # Serviciu de ingerare date
│   ├── decision-engine/     # Motor de decizii AI
│   └── ai-core/            # Nucleul AI
├── data-layer/             # Stratul de date
│   ├── postgres/           # Configurații PostgreSQL
│   ├── redis/              # Configurații Redis
│   └── clickhouse/         # Configurații ClickHouse
├── infra/                  # Infrastructură
│   ├── aws-lambda/         # Funcții AWS Lambda
│   ├── aws-sagemaker/      # Modele AWS SageMaker
│   ├── monitoring/         # Monitorizare și alerting
│   └── ci-cd/             # Pipeline CI/CD
├── docs/                   # Documentație
├── docker-compose.yml      # Configurație Docker
└── README.md              # Acest fișier
```

## 🔌 API Endpoints

### Health Check
- `GET /health` - Verifică statusul serviciilor

### Users API
- `GET /api/v1/users` - Lista utilizatori
- `GET /api/v1/users/:id` - Detalii utilizator
- `POST /api/v1/users` - Creează utilizator nou
- `PUT /api/v1/users/:id` - Actualizează utilizator
- `DELETE /api/v1/users/:id` - Șterge utilizator

### Products API
- `GET /api/v1/products` - Lista produse
- `GET /api/v1/products/:id` - Detalii produs
- `POST /api/v1/products` - Creează produs nou
- `PUT /api/v1/products/:id` - Actualizează produs
- `DELETE /api/v1/products/:id` - Șterge produs

### Orders API
- `GET /api/v1/orders` - Lista comenzi
- `GET /api/v1/orders/:id` - Detalii comandă
- `POST /api/v1/orders` - Creează comandă nouă
- `DELETE /api/v1/orders/:id` - Anulează comandă

### Analytics API
- `GET /api/v1/analytics/overview` - Overview analytics
- `GET /api/v1/analytics/revenue` - Analiză venituri
- `GET /api/v1/analytics/users` - Analiză utilizatori
- `GET /api/v1/analytics/products` - Analiză produse

## 🛠️ Comenzi Utile

### Managementul Containerelor
```bash
# Oprește serviciile
docker-compose down

# Oprește și șterge volumele
docker-compose down -v

# Restart servicii
docker-compose restart

# Rebuild și restart
docker-compose up -d --build
```

### Backup și Restore
```bash
# Backup PostgreSQL
docker exec ahauros-postgres pg_dump -U admin ahauros > backup.sql

# Restore PostgreSQL
docker exec -i ahauros-postgres psql -U admin ahauros < backup.sql
```

## 🔧 Configurare pentru Dezvoltare

### Variabile de Mediu
Creează un fișier `.env` în directorul root:
```env
POSTGRES_DB=ahauros
POSTGRES_USER=admin
POSTGRES_PASSWORD=secret123
REDIS_PASSWORD=
CLICKHOUSE_DB=ahauros_analytics
CLICKHOUSE_USER=admin
CLICKHOUSE_PASSWORD=secret123
```

## 📊 Monitorizare

### Health Checks
```bash
# Verifică statusul serviciilor
curl http://localhost:8123/ping  # ClickHouse
redis-cli -h localhost -p 6379 ping  # Redis
```

## 🤝 Contribuție

1. Fork repository-ul
2. Creează o branch pentru feature (`git checkout -b feature/AmazingFeature`)
3. Commit modificările (`git commit -m 'Add some AmazingFeature'`)
4. Push la branch (`git push origin feature/AmazingFeature`)
5. Deschide un Pull Request

## 📝 Licență

Acest proiect este licențiat sub licența MIT - vezi fișierul [LICENSE](LICENSE) pentru detalii.

## 🚀 AWS Deployment

Pentru deployment pe AWS cu Lambda + API Gateway, vezi ghidurile complete:

**[📖 AWS Deployment Guide](docs/aws-deployment.md)**  
**[🌐 Squarespace DNS Setup Guide](docs/squarespace-dns-setup.md)**

### Quick Start AWS:
```bash
# Configurează AWS credentials
aws configure

# Deploy infrastructura
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Editează terraform.tfvars cu valorile tale
terraform init
terraform apply

# Obține DNS records pentru Squarespace
terraform output dns_records_for_squarespace

# Adaugă CNAME records în Squarespace
# Settings → Domains → ahauros.io → DNS Settings
```

**Endpoint-uri finale**: 
- `https://api.ahauros.io/health` - API Backend
- `https://app.ahauros.io` - Frontend App

**SSL Validation**: Prin email la `contact@ahauros.io` ⭐ **PRINCIPAL**

## 🆘 Suport

Pentru întrebări sau probleme, deschide un issue în repository-ul GitHub.# Trigger deployment
