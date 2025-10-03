#!/bin/bash

# Script to configure OPENAI_API_KEY from PayAiX organization secrets
# This script will help you get the key and configure it locally

echo "🔐 Configuring OPENAI_API_KEY from PayAiX organization secrets..."
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

# Check if OPENAI_API_KEY exists in PayAiX organization
echo "🔍 Checking if OPENAI_API_KEY exists in PayAiX organization..."
if gh secret list --org PayAiX | grep -q "OPENAI_API_KEY"; then
    echo "✅ OPENAI_API_KEY found in PayAiX organization secrets"
else
    echo "❌ OPENAI_API_KEY not found in PayAiX organization secrets"
    echo "   Please add it first: https://github.com/organizations/PayAiX/settings/secrets/actions"
    exit 1
fi

echo ""
echo "📋 INSTRUCȚIUNI PENTRU CONFIGURARE:"
echo "=================================="
echo ""
echo "1. 🌐 Accesează PayAiX organization secrets:"
echo "   https://github.com/organizations/PayAiX/settings/secrets/actions"
echo ""
echo "2. 🔑 Copiază valoarea OPENAI_API_KEY"
echo ""
echo "3. 📝 Actualizează fișierele .env:"
echo "   - Backend: /Users/adrianpersonal/Desktop/ahauros-backup/backend/.env"
echo "   - Andreea Service: /Users/adrianpersonal/Desktop/ahauros-backup/andreea-service/.env"
echo ""
echo "4. 🔄 Înlocuiește 'REPLACE_WITH_ACTUAL_KEY' cu valoarea reală"
echo ""
echo "5. 🚀 Restart serviciile:"
echo "   - Backend: cd backend && npm run dev"
echo "   - Andreea Service: cd andreea-service && npm run dev"
echo ""
echo "6. 🧪 Testează integrarea:"
echo "   curl -X POST http://localhost:3001/admin/ai/andreea/train \\"
echo "     -H 'x-dashboard-role: admin' \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"agent\": \"ads\"}'"
echo ""
echo "💡 ALTERNATIVĂ - Configurare automată:"
echo "====================================="
echo "Dacă vrei să configurezi automat, rulează:"
echo "  ./scripts/auto-configure-openai.sh"
echo ""
echo "⚠️  NOTĂ: GitHub CLI nu permite citirea valorilor secretelor"
echo "   din motive de securitate, deci trebuie să copiezi manual"
echo "   valoarea din interfața web GitHub."
