# 📋 LISTA COMPLETĂ PENTRU COPIEREA MANUALĂ A SECRETS ÎN PAYAIX

## ⚠️ IMPORTANT
GitHub CLI nu permite citirea valorilor secrets din motive de securitate. Trebuie să introduci manual valorile pentru fiecare secret.

## 🔐 LISTA COMPLETĂ DE SECRETS (24 total)

### 1. AWS & Infrastructure (6 secrets)
```bash
# 1. AWS_ACCESS_KEY_ID
gh secret set AWS_ACCESS_KEY_ID --org PayAiX --body "VALOAREA_REALA_AICI"

# 2. AWS_REGION
gh secret set AWS_REGION --org PayAiX --body "VALOAREA_REALA_AICI"

# 3. AWS_SECRET_ACCESS_KEY
gh secret set AWS_SECRET_ACCESS_KEY --org PayAiX --body "VALOAREA_REALA_AICI"

# 4. AWS_SES_EMAIL
gh secret set AWS_SES_EMAIL --org PayAiX --body "VALOAREA_REALA_AICI"

# 5. AWS_SES_PASSWORD
gh secret set AWS_SES_PASSWORD --org PayAiX --body "VALOAREA_REALA_AICI"

# 6. S3_BUCKET
gh secret set S3_BUCKET --org PayAiX --body "VALOAREA_REALA_AICI"
```

### 2. CloudFront & CDN (1 secret)
```bash
# 7. CLOUDFRONT_DISTRIBUTION_ID
gh secret set CLOUDFRONT_DISTRIBUTION_ID --org PayAiX --body "VALOAREA_REALA_AICI"
```

### 3. Authentication & Security (2 secrets)
```bash
# 8. JWT_SECRET
gh secret set JWT_SECRET --org PayAiX --body "VALOAREA_REALA_AICI"

# 9. SUPABASE_JWT_SECRET
gh secret set SUPABASE_JWT_SECRET --org PayAiX --body "VALOAREA_REALA_AICI"
```

### 4. AI & OpenAI (1 secret)
```bash
# 10. OPENAI_API_KEY
gh secret set OPENAI_API_KEY --org PayAiX --body "VALOAREA_REALA_AICI"
```

### 5. Stripe Billing (6 secrets)
```bash
# 11. STRIPE_ENTERPRISE_PRICE_ID
gh secret set STRIPE_ENTERPRISE_PRICE_ID --org PayAiX --body "VALOAREA_REALA_AICI"

# 12. STRIPE_GROWTH_PRICE_ID
gh secret set STRIPE_GROWTH_PRICE_ID --org PayAiX --body "VALOAREA_REALA_AICI"

# 13. STRIPE_PUBLISHABLE_KEY
gh secret set STRIPE_PUBLISHABLE_KEY --org PayAiX --body "VALOAREA_REALA_AICI"

# 14. STRIPE_SECRET_KEY
gh secret set STRIPE_SECRET_KEY --org PayAiX --body "VALOAREA_REALA_AICI"

# 15. STRIPE_STARTER_PRICE_ID
gh secret set STRIPE_STARTER_PRICE_ID --org PayAiX --body "VALOAREA_REALA_AICI"

# 16. STRIPE_WEBHOOK_SECRET
gh secret set STRIPE_WEBHOOK_SECRET --org PayAiX --body "VALOAREA_REALA_AICI"
```

### 6. Supabase Database (4 secrets)
```bash
# 17. SUPABASE_PUBLISHABLE_KEY
gh secret set SUPABASE_PUBLISHABLE_KEY --org PayAiX --body "VALOAREA_REALA_AICI"

# 18. SUPABASE_SERVICE_KEY
gh secret set SUPABASE_SERVICE_KEY --org PayAiX --body "VALOAREA_REALA_AICI"

# 19. SUPABASE_URL
gh secret set SUPABASE_URL --org PayAiX --body "VALOAREA_REALA_AICI"

# 20. SUPABASE_WEB_LOGIN
gh secret set SUPABASE_WEB_LOGIN --org PayAiX --body "VALOAREA_REALA_AICI"
```

### 7. Frontend Environment Variables (4 secrets)
```bash
# 21. VITE_PROFIT_AI_URL
gh secret set VITE_PROFIT_AI_URL --org PayAiX --body "VALOAREA_REALA_AICI"

# 22. VITE_SUPABASE_ANON_KEY
gh secret set VITE_SUPABASE_ANON_KEY --org PayAiX --body "VALOAREA_REALA_AICI"

# 23. VITE_SUPABASE_URL
gh secret set VITE_SUPABASE_URL --org PayAiX --body "VALOAREA_REALA_AICI"

# 24. VITE_SUPPLIER_OPTIMIZER_URL
gh secret set VITE_SUPPLIER_OPTIMIZER_URL --org PayAiX --body "VALOAREA_REALA_AICI"
```

## 📝 INSTRUCȚIUNI PENTRU COPIEREA MANUALĂ

### Pasul 1: Accesează repository-ul sursă
1. Intră în GitHub → `AdiVlop/ahauros-dashboard`
2. Navighează la **Settings** → **Secrets and variables** → **Actions**
3. Vei vedea lista cu toate secrets

### Pasul 2: Copiază valorile
Pentru fiecare secret din lista de mai sus:
1. **Click pe numele secretului** în repository-ul sursă
2. **Copiază valoarea** (nu poți vedea valoarea, dar poți să o editezi)
3. **Înlocuiește "VALOAREA_REALA_AICI"** cu valoarea copiată în comanda de mai sus
4. **Rulează comanda** în terminal

### Pasul 3: Verificare
După ce ai copiat toate secrets:
```bash
gh secret list --org PayAiX
```

## 🎯 EXEMPLU DE UTILIZARE

```bash
# Înlocuiește "VALOAREA_REALA_AICI" cu valoarea reală
gh secret set OPENAI_API_KEY --org PayAiX --body "sk-1234567890abcdef..."

# Verifică că a fost setat
gh secret list --org PayAiX
```

## ⚠️ CONSIDERAȚII IMPORTANTE

1. **Securitate**: Nu partaja niciodată valorile secrets în chat sau fișiere publice
2. **Acces**: Asigură-te că ai permisiuni de admin în organizația PayAiX
3. **Verificare**: După fiecare secret setat, verifică că apare în lista organizației
4. **Backup**: Păstrează valorile într-un loc sigur înainte de a le șterge din repository-ul sursă

## 📞 AJUTOR

Dacă întâmpini probleme:
1. Verifică că ești autentificat: `gh auth status`
2. Verifică permisiunile: `gh org list`
3. Verifică organizația: `gh secret list --org PayAiX`

---

**Total secrets de copiat: 24**  
**Timp estimat: 15-20 minute**  
**Dificultate: Medie (necesită acces la valorile reale)**
