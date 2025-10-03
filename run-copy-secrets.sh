#!/bin/bash

echo "🚀 Starting secrets migration to PayAiX organization..."
echo "📋 This will copy all secrets from ahauros-dashboard to PayAiX"
echo ""

# Verifică dacă GitHub CLI este instalat
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) nu este instalat. Instalează-l cu: brew install gh"
    exit 1
fi

# Verifică autentificarea
if ! gh auth status &> /dev/null; then
    echo "❌ Nu ești autentificat cu GitHub CLI. Rulează: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI verificat"
echo "🔄 Rulează scriptul de copiere..."
echo ""

# Rulează scriptul Node.js
node scripts/copy-all-secrets.js

echo ""
echo "🎯 Scriptul a fost executat!"
echo "🔍 Verifică rezultatele de mai sus."
