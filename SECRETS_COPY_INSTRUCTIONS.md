# 📋 INSTRUCȚIUNI PENTRU COPIEREA SECRETS ÎN PAYAIX

## Opțiunea 1: Copiere Manuală
Pentru fiecare secret din lista de mai sus, rulează:
```bash
gh secret set SECRET_NAME --org PayAiX --body "VALOAREA_REALA"
```

## Opțiunea 2: Script Bash (macOS/Linux)
```bash
chmod +x copy-secrets.sh
./copy-secrets.sh
```

## Opțiunea 3: Script PowerShell (Windows)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
./copy-secrets.ps1
```

## Verificare
După copiere, verifică cu:
```bash
gh secret list --org PayAiX
```

## Secrets de copiat (24 total):
1. AWS_ACCESS_KEY_ID
2. AWS_REGION
3. AWS_SECRET_ACCESS_KEY
4. AWS_SES_EMAIL
5. AWS_SES_PASSWORD
6. CLOUDFRONT_DISTRIBUTION_ID
7. JWT_SECRET
8. OPENAI_API_KEY
9. S3_BUCKET
10. STRIPE_ENTERPRISE_PRICE_ID
11. STRIPE_GROWTH_PRICE_ID
12. STRIPE_PUBLISHABLE_KEY
13. STRIPE_SECRET_KEY
14. STRIPE_STARTER_PRICE_ID
15. STRIPE_WEBHOOK_SECRET
16. SUPABASE_JWT_SECRET
17. SUPABASE_PUBLISHABLE_KEY
18. SUPABASE_SERVICE_KEY
19. SUPABASE_URL
20. SUPABASE_WEB_LOGIN
21. VITE_PROFIT_AI_URL
22. VITE_SUPABASE_ANON_KEY
23. VITE_SUPABASE_URL
24. VITE_SUPPLIER_OPTIMIZER_URL
