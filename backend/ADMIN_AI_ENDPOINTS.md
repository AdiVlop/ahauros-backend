# 🤖 Admin AI Endpoints Documentation

## 📋 Overview
Backend endpoints for Admin Dashboard to orchestrate AI agents through Andreea.

**Base URL**: `http://localhost:3001/admin`

## 🔐 Authentication
All admin endpoints require the header:
```
x-dashboard-role: admin
```

## 🎯 Available Endpoints

### 1. **POST /admin/ai/andreea/train**
Train an AI agent through Andreea orchestration.

**Request:**
```bash
curl -X POST http://localhost:3001/admin/ai/andreea/train \
  -H "Content-Type: application/json" \
  -H "x-dashboard-role: admin" \
  -d '{"agent":"pricing"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Training started for pricing agent",
  "andreeaMessage": "Am început antrenamentul pentru Pricing AI...",
  "report": {
    "id": 1696342349123.456,
    "timestamp": "2025-10-03T14:25:49.123Z",
    "agent": "pricing",
    "text": "Am început antrenamentul pentru Pricing AI...",
    "status": "started"
  }
}
```

### 2. **GET /admin/ai/andreea/reports**
Get Andreea training reports.

**Request:**
```bash
curl http://localhost:3001/admin/ai/andreea/reports \
  -H "x-dashboard-role: admin"
```

**Query Parameters:**
- `agent` (optional): Filter by specific agent
- `limit` (optional): Number of reports (default: 20)

**Response:**
```json
{
  "success": true,
  "reports": [
    {
      "id": 1696342349123.456,
      "timestamp": "2025-10-03T14:25:49.123Z",
      "agent": "pricing",
      "text": "Am început antrenamentul pentru Pricing AI...",
      "status": "started"
    }
  ],
  "count": 1
}
```

### 3. **GET /admin/ai/:agent/health**
Get agent health status.

**Request:**
```bash
curl http://localhost:3001/admin/ai/pricing/health \
  -H "x-dashboard-role: admin"
```

**Response:**
```json
{
  "agent": "pricing",
  "status": "online",
  "timestamp": "2025-10-03T14:25:49.676Z",
  "message": "Agentul pricing este activ.",
  "uptime": 25796,
  "lastCheck": "2025-10-03T14:25:49.676Z"
}
```

### 4. **GET /admin/ai/:agent/metrics**
Get agent performance metrics.

**Request:**
```bash
curl http://localhost:3001/admin/ai/fraud/metrics \
  -H "x-dashboard-role: admin"
```

**Response:**
```json
{
  "success": true,
  "metrics": {
    "agent": "fraud",
    "accuracy": 94.67,
    "efficiency": 91.23,
    "lastTraining": "2025-09-28T10:15:30.000Z",
    "totalPredictions": 8543,
    "successRate": 96.45,
    "responseTime": 234.56,
    "memoryUsage": 35.78,
    "cpuUsage": 28.91,
    "timestamp": "2025-10-03T14:25:49.676Z"
  }
}
```

### 5. **GET /admin/ai/agents**
Get list of all available agents.

**Request:**
```bash
curl http://localhost:3001/admin/ai/agents \
  -H "x-dashboard-role: admin"
```

**Response:**
```json
{
  "success": true,
  "agents": [
    {
      "name": "ads",
      "description": "Ads AI - optimizes advertising campaigns and budget allocation",
      "status": "online",
      "lastActivity": "2025-10-03T12:40:28.515Z"
    },
    {
      "name": "fraud",
      "description": "Fraud Detection AI - identifies and prevents fraudulent transactions",
      "status": "online",
      "lastActivity": "2025-10-02T19:16:53.655Z"
    }
  ],
  "count": 8
}
```

### 6. **GET /admin/info**
Get information about admin endpoints (no auth required).

**Request:**
```bash
curl http://localhost:3001/admin/info
```

**Response:**
```json
{
  "message": "Ahauros Admin AI Routes",
  "endpoints": {
    "POST /admin/ai/andreea/train": "Train an AI agent through Andreea",
    "GET /admin/ai/andreea/reports": "Get Andreea training reports",
    "GET /admin/ai/:agent/health": "Get agent health status",
    "GET /admin/ai/:agent/metrics": "Get agent performance metrics",
    "GET /admin/ai/agents": "Get list of all available agents"
  },
  "validAgents": ["ads", "fraud", "courier", "neuromarketing", "supplier", "pricing", "forecast", "profit"],
  "authentication": "Requires x-dashboard-role: admin header"
}
```

## 🤖 Valid AI Agents

| Agent | Description |
|-------|-------------|
| `ads` | Ads AI - optimizes advertising campaigns and budget allocation |
| `fraud` | Fraud Detection AI - identifies and prevents fraudulent transactions |
| `courier` | Courier AI - optimizes delivery routes and logistics |
| `neuromarketing` | Neuromarketing AI - analyzes customer behavior and preferences |
| `supplier` | Supplier AI - manages supplier relationships and procurement |
| `pricing` | Pricing AI - optimizes product pricing strategies |
| `forecast` | Forecast AI - predicts sales and demand patterns |
| `profit` | Profit AI - analyzes profitability and financial metrics |

## 🔧 Configuration

### Environment Variables
- `OPENAI_API_KEY`: Required for Andreea message generation
- `ANDREEA_SERVICE_URL`: Andreea service URL (default: http://andreea-service:3002)

### Dependencies
- Express.js
- OpenAI API (for Andreea message generation)
- In-memory storage for reports

## 🚨 Error Responses

### Authentication Error
```json
{
  "error": "Access denied. Admin role required.",
  "message": "This endpoint is only accessible from Admin Dashboard"
}
```

### Invalid Agent
```json
{
  "error": "Invalid agent name",
  "validAgents": ["ads", "fraud", "courier", "neuromarketing", "supplier", "pricing", "forecast", "profit"]
}
```

### OpenAI API Error
```json
{
  "error": "OpenAI API key not configured"
}
```

## 📝 Usage Examples

### Train Multiple Agents
```bash
# Train pricing agent
curl -X POST http://localhost:3001/admin/ai/andreea/train \
  -H "Content-Type: application/json" \
  -H "x-dashboard-role: admin" \
  -d '{"agent":"pricing"}'

# Train fraud agent
curl -X POST http://localhost:3001/admin/ai/andreea/train \
  -H "Content-Type: application/json" \
  -H "x-dashboard-role: admin" \
  -d '{"agent":"fraud"}'
```

### Monitor All Agents
```bash
# Get all agents status
curl http://localhost:3001/admin/ai/agents -H "x-dashboard-role: admin"

# Check specific agent health
curl http://localhost:3001/admin/ai/ads/health -H "x-dashboard-role: admin"

# Get specific agent metrics
curl http://localhost:3001/admin/ai/supplier/metrics -H "x-dashboard-role: admin"
```

### View Training Reports
```bash
# Get all reports
curl http://localhost:3001/admin/ai/andreea/reports -H "x-dashboard-role: admin"

# Get reports for specific agent
curl "http://localhost:3001/admin/ai/andreea/reports?agent=pricing" -H "x-dashboard-role: admin"

# Get limited reports
curl "http://localhost:3001/admin/ai/andreea/reports?limit=5" -H "x-dashboard-role: admin"
```

## 🎯 Integration with Admin Dashboard

These endpoints are designed to be consumed by the Admin Dashboard (`/admin-unified`) to:

1. **Monitor AI Agents**: Real-time health and metrics
2. **Train Agents**: Orchestrate training through Andreea
3. **View Reports**: Track training progress and results
4. **Manage Operations**: Centralized AI agent management

The endpoints are **NOT** accessible from User Dashboard and require admin authentication.
