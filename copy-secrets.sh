#!/bin/bash

echo "🔐 Copying secrets to PayAiX organization..."
echo "⚠️  You will be prompted for each secret value."
echo ""

# Array cu numele secretelor
secrets=("AWS_ACCESS_KEY_ID" "AWS_REGION" "AWS_SECRET_ACCESS_KEY" "AWS_SES_EMAIL" "AWS_SES_PASSWORD" "CLOUDFRONT_DISTRIBUTION_ID" "JWT_SECRET" "OPENAI_API_KEY" "S3_BUCKET" "STRIPE_ENTERPRISE_PRICE_ID" "STRIPE_GROWTH_PRICE_ID" "STRIPE_PUBLISHABLE_KEY" "STRIPE_SECRET_KEY" "STRIPE_STARTER_PRICE_ID" "STRIPE_WEBHOOK_SECRET" "SUPABASE_JWT_SECRET" "SUPABASE_PUBLISHABLE_KEY" "SUPABASE_SERVICE_KEY" "SUPABASE_URL" "SUPABASE_WEB_LOGIN" "VITE_PROFIT_AI_URL" "VITE_SUPABASE_ANON_KEY" "VITE_SUPABASE_URL" "VITE_SUPPLIER_OPTIMIZER_URL")

for secret in "${secrets[@]}"; do
    echo "📝 Enter value for: $secret"
    read -s -p "Value: " secret_value
    echo ""
    
    if [ -n "$secret_value" ]; then
        echo "🔄 Setting $secret..."
        gh secret set "$secret" --org PayAiX --body "$secret_value"
        if [ $? -eq 0 ]; then
            echo "✅ $secret set successfully"
        else
            echo "❌ Failed to set $secret"
        fi
    else
        echo "⏭️  Skipping $secret (empty value)"
    fi
    echo ""
done

echo "🎉 Secrets copy completed!"
echo "🔍 Verify with: gh secret list --org PayAiX"
