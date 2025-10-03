# PowerShell script pentru copierea secrets
Write-Host "🔐 Copying secrets to PayAiX organization..." -ForegroundColor Green
Write-Host "⚠️  You will be prompted for each secret value." -ForegroundColor Yellow
Write-Host ""

# Array cu numele secretelor
$secrets = @("AWS_ACCESS_KEY_ID", "AWS_REGION", "AWS_SECRET_ACCESS_KEY", "AWS_SES_EMAIL", "AWS_SES_PASSWORD", "CLOUDFRONT_DISTRIBUTION_ID", "JWT_SECRET", "OPENAI_API_KEY", "S3_BUCKET", "STRIPE_ENTERPRISE_PRICE_ID", "STRIPE_GROWTH_PRICE_ID", "STRIPE_PUBLISHABLE_KEY", "STRIPE_SECRET_KEY", "STRIPE_STARTER_PRICE_ID", "STRIPE_WEBHOOK_SECRET", "SUPABASE_JWT_SECRET", "SUPABASE_PUBLISHABLE_KEY", "SUPABASE_SERVICE_KEY", "SUPABASE_URL", "SUPABASE_WEB_LOGIN", "VITE_PROFIT_AI_URL", "VITE_SUPABASE_ANON_KEY", "VITE_SUPABASE_URL", "VITE_SUPPLIER_OPTIMIZER_URL")

foreach ($secret in $secrets) {
    Write-Host "📝 Enter value for: $secret" -ForegroundColor Cyan
    $secretValue = Read-Host "Value" -AsSecureString
    $plainSecretValue = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($secretValue))
    
    if ($plainSecretValue) {
        Write-Host "🔄 Setting $secret..." -ForegroundColor Yellow
        $result = gh secret set $secret --org PayAiX --body $plainSecretValue
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $secret set successfully" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to set $secret" -ForegroundColor Red
        }
    } else {
        Write-Host "⏭️  Skipping $secret (empty value)" -ForegroundColor Gray
    }
    Write-Host ""
}

Write-Host "🎉 Secrets copy completed!" -ForegroundColor Green
Write-Host "🔍 Verify with: gh secret list --org PayAiX" -ForegroundColor Cyan
