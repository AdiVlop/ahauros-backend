#!/bin/bash

# Script to setup environment variables from PayAiX GitHub organization secrets
# This script helps configure the backend with secrets from PayAiX organization

echo "🔐 Setting up environment variables from PayAiX organization secrets..."
echo ""

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI nu este instalat. Instalează-l de pe https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Nu ești autentificat la GitHub CLI. Rulează 'gh auth login'"
    exit 1
fi

echo "✅ GitHub CLI verificat și autentificat"
echo ""

# Create .env file for backend
BACKEND_ENV_FILE="/Users/adrianpersonal/Desktop/ahauros-backup/backend/.env"

echo "📝 Creating .env file for backend..."
cat > "$BACKEND_ENV_FILE" << 'EOF'
# Ahauros Backend Environment Variables
# Configured from PayAiX organization secrets

# OpenAI API Key (configured from PayAiX secrets)
OPENAI_API_KEY=REPLACE_WITH_ACTUAL_KEY

# Server Configuration
PORT=3001
NODE_ENV=development

# Andreea Service URL (for reverse proxy)
ANDREEA_SERVICE_URL=http://localhost:3002

# AI Agents Service URLs (for reverse proxy)
ADS_SERVICE_URL=http://localhost:3005
FRAUD_SERVICE_URL=http://localhost:3006
COURIER_SERVICE_URL=http://localhost:3007
NEUROMARKETING_SERVICE_URL=http://localhost:3008
SUPPLIER_SERVICE_URL=http://localhost:3009

# Frontend URL
FRONTEND_URL=http://localhost:5173

# MongoDB (optional for testing)
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ahauros-ai

# Email Configuration (optional)
# EMAIL_USER=youremail@gmail.com
# EMAIL_PASS=your_app_password_here

# JWT Secret (optional)
# JWT_SECRET=your_super_secret_jwt_key_here
EOF

echo "✅ Created $BACKEND_ENV_FILE"
echo ""

# Create .env file for andreea-service
ANDREEA_ENV_FILE="/Users/adrianpersonal/Desktop/ahauros-backup/andreea-service/.env"

echo "📝 Creating .env file for andreea-service..."
cat > "$ANDREEA_ENV_FILE" << 'EOF'
# Andreea Service Environment Variables
# Configured from PayAiX organization secrets

# OpenAI API Key (configured from PayAiX secrets)
OPENAI_API_KEY=REPLACE_WITH_ACTUAL_KEY

# Server Configuration
PORT=3002
NODE_ENV=development
EOF

echo "✅ Created $ANDREEA_ENV_FILE"
echo ""

echo "🔧 NEXT STEPS:"
echo "=============="
echo "1. Get OPENAI_API_KEY from PayAiX organization secrets:"
echo "   - Go to https://github.com/organizations/PayAiX/settings/secrets/actions"
echo "   - Copy the OPENAI_API_KEY value"
echo ""
echo "2. Update both .env files:"
echo "   - Replace 'REPLACE_WITH_ACTUAL_KEY' with the actual OpenAI API key"
echo "   - In: $BACKEND_ENV_FILE"
echo "   - In: $ANDREEA_ENV_FILE"
echo ""
echo "3. Restart the services:"
echo "   - Backend: cd backend && npm run dev"
echo "   - Andreea Service: cd andreea-service && npm run dev"
echo ""
echo "4. Test the integration:"
echo "   - curl -X POST http://localhost:3001/admin/ai/andreea/train \\"
echo "     -H 'x-dashboard-role: admin' \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"agent\": \"ads\"}'"
echo ""
echo "🎯 PayAiX organization secrets available:"
gh secret list --org PayAiX | grep -E "(OPENAI|API|KEY)" || echo "   (run 'gh secret list --org PayAiX' to see all secrets)"
