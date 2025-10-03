#!/bin/bash

# Script to automatically configure OPENAI_API_KEY
# This script will open the GitHub secrets page and help you configure the key

echo "🔐 Auto-configuring OPENAI_API_KEY from PayAiX organization secrets..."
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

# Open GitHub secrets page
echo "🌐 Deschidem pagina PayAiX organization secrets..."
echo "   https://github.com/organizations/PayAiX/settings/secrets/actions"
echo ""

# Try to open in browser
if command -v open &> /dev/null; then
    echo "🚀 Deschidem în browser..."
    open "https://github.com/organizations/PayAiX/settings/secrets/actions"
elif command -v xdg-open &> /dev/null; then
    echo "🚀 Deschidem în browser..."
    xdg-open "https://github.com/organizations/PayAiX/settings/secrets/actions"
else
    echo "📋 Copiază și deschide manual:"
    echo "   https://github.com/organizations/PayAiX/settings/secrets/actions"
fi

echo ""
echo "📝 PAȘII PENTRU CONFIGURARE:"
echo "============================"
echo ""
echo "1. 🔍 Găsește 'OPENAI_API_KEY' în lista de secrets"
echo "2. 📋 Copiază valoarea (click pe 'Update' pentru a vedea valoarea)"
echo "3. ⬇️  Revino aici și apasă Enter când ai copiat valoarea"
echo ""
read -p "Apasă Enter când ai copiat OPENAI_API_KEY din GitHub... "

echo ""
echo "🔑 Acum introdu valoarea OPENAI_API_KEY:"
read -s -p "OPENAI_API_KEY: " OPENAI_KEY

if [ -z "$OPENAI_KEY" ]; then
    echo ""
    echo "❌ Nu ai introdus nici o valoare. Ieșire..."
    exit 1
fi

echo ""
echo "✅ Valoare introdusă. Configurăm fișierele .env..."

# Update backend .env
BACKEND_ENV="/Users/adrianpersonal/Desktop/ahauros-backup/backend/.env"
if [ -f "$BACKEND_ENV" ]; then
    sed -i.bak "s/OPENAI_API_KEY=REPLACE_WITH_ACTUAL_KEY/OPENAI_API_KEY=$OPENAI_KEY/" "$BACKEND_ENV"
    echo "✅ Updated backend .env: $BACKEND_ENV"
else
    echo "❌ Backend .env file not found: $BACKEND_ENV"
fi

# Update andreea-service .env
ANDREEA_ENV="/Users/adrianpersonal/Desktop/ahauros-backup/andreea-service/.env"
if [ -f "$ANDREEA_ENV" ]; then
    sed -i.bak "s/OPENAI_API_KEY=REPLACE_WITH_ACTUAL_KEY/OPENAI_API_KEY=$OPENAI_KEY/" "$ANDREEA_ENV"
    echo "✅ Updated andreea-service .env: $ANDREEA_ENV"
else
    echo "❌ Andreea-service .env file not found: $ANDREEA_ENV"
fi

echo ""
echo "🎉 CONFIGURARE COMPLETĂ!"
echo "========================"
echo ""
echo "✅ OPENAI_API_KEY a fost configurat în:"
echo "   - Backend: $BACKEND_ENV"
echo "   - Andreea Service: $ANDREEA_ENV"
echo ""
echo "🚀 URMĂTORII PAȘI:"
echo "=================="
echo "1. Restart backend:"
echo "   cd /Users/adrianpersonal/Desktop/ahauros-backup/backend && npm run dev"
echo ""
echo "2. Restart andreea-service:"
echo "   cd /Users/adrianpersonal/Desktop/ahauros-backup/andreea-service && npm run dev"
echo ""
echo "3. Testează integrarea:"
echo "   curl -X POST http://localhost:3001/admin/ai/andreea/train \\"
echo "     -H 'x-dashboard-role: admin' \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"agent\": \"ads\"}'"
echo ""
echo "🎯 Andreea GPT va fi acum funcțional cu OpenAI API!"
