# Squarespace DNS Setup Guide pentru Ahauros AI

## 🎯 Obiectiv
Configurează DNS-ul în Squarespace pentru a face domeniul `ahauros.io` să funcționeze cu landing page-ul și aplicația.

## 📋 Record-uri DNS de Adăugat

### 1. **Root Domain (ahauros.io) - Landing Page**
**⚠️ IMPORTANT**: Squarespace nu acceptă CNAME pe root domain. Folosește A records:

```
Type: A
Name: @
Value: 3.160.246.121
TTL: 3600 (sau default)
```

**Sau folosește toate IP-urile CloudFront pentru redundanță:**
```
Type: A
Name: @
Value: 3.160.246.121

Type: A
Name: @
Value: 3.160.246.41

Type: A
Name: @
Value: 3.160.246.55

Type: A
Name: @
Value: 3.160.246.82
```

### 2. **API Subdomain (api.ahauros.io)**
```
Type: CNAME
Name: api
Value: d-hjvaf6uiz8.execute-api.us-east-1.amazonaws.com
TTL: 3600 (sau default)
```

### 3. **App Subdomain (app.ahauros.io)**
```
Type: CNAME
Name: app
Value: dt9dafbtd6qiv.cloudfront.net
TTL: 3600 (sau default)
```

## 🔧 Pași pentru Configurarea în Squarespace

### Pasul 1: Accesează DNS Settings
1. Loghează-te în contul Squarespace
2. Mergi la **Settings** → **Domains**
3. Selectează domeniul `ahauros.io`
4. Click pe **DNS Settings**

### Pasul 2: Adaugă Record-urile CNAME

#### Record 1: Root Domain
- **Type**: A
- **Host**: @ (sau lasă gol pentru root domain)
- **Points to**: `3.160.246.121`
- **TTL**: 3600

**Nota**: CloudFront are multiple IP-uri. Poți adăuga toate pentru redundanță:
- `3.160.246.121`
- `3.160.246.41`
- `3.160.246.55`
- `3.160.246.82`

#### Record 2: API Subdomain
- **Type**: CNAME
- **Host**: api
- **Points to**: `d-hjvaf6uiz8.execute-api.us-east-1.amazonaws.com`
- **TTL**: 3600

#### Record 3: App Subdomain
- **Type**: CNAME
- **Host**: app
- **Points to**: `dt9dafbtd6qiv.cloudfront.net`
- **TTL**: 3600

### Pasul 3: Salvează Configurația
1. Click **Save** pentru fiecare record
2. Verifică că toate record-urile sunt active
3. Așteaptă propagarea DNS (5-30 minute)

## 🌐 URL-uri Finale

După configurarea DNS-ului, următoarele URL-uri vor funcționa:

- **Landing Page**: `https://ahauros.io`
- **API**: `https://api.ahauros.io`
- **App**: `https://app.ahauros.io`

## ⏱️ Timp de Propagare

- **Propagare Locală**: 5-15 minute
- **Propagare Globală**: 24-48 ore
- **Testare**: Folosește `nslookup` sau `dig` pentru verificare

## 🔍 Verificare DNS

### Comandă pentru verificare:
```bash
nslookup ahauros.io
nslookup api.ahauros.io
nslookup app.ahauros.io
```

### Rezultat așteptat:
```
ahauros.io → d3hd8m3agre20c.cloudfront.net
api.ahauros.io → d-hjvaf6uiz8.execute-api.us-east-1.amazonaws.com
app.ahauros.io → dt9dafbtd6qiv.cloudfront.net
```

## 🚨 Probleme Comune

### 1. **Root Domain nu funcționează**
- Squarespace nu acceptă CNAME pe root domain (`@`)
- **Soluție**: Folosește A record cu IP-ul CloudFront: `3.160.246.121`
- Pentru redundanță, adaugă toate IP-urile CloudFront

### 2. **SSL Certificate Errors**
- Certificatul ACM este deja validat pentru `ahauros.io`
- CloudFront va folosi automat certificatul
- Așteaptă 5-10 minute după propagarea DNS

### 3. **Propagare Lentă**
- DNS-ul poate lua până la 48 ore pentru propagare completă
- Folosește DNS-uri publice (8.8.8.8, 1.1.1.1) pentru testare
- Clear cache-ul browser-ului

## 📊 Status Actual

### ✅ **Infrastructure Ready**
- S3 bucket: `ahauros-landing-13b0adc0`
- CloudFront: `d3hd8m3agre20c.cloudfront.net`
- SSL Certificate: Validat pentru `ahauros.io`
- Landing Page: Deployed și funcțional

### ⏳ **Pending DNS Configuration**
- Record-urile DNS trebuie adăugate în Squarespace
- După configurare, `https://ahauros.io` va fi accesibil

## 🎉 Rezultat Final

După configurarea DNS-ului:
- **Landing Page**: `https://ahauros.io` → Pagina de prezentare Ahauros AI
- **Registration**: `https://app.ahauros.io/register` → Înregistrare utilizatori
- **API**: `https://api.ahauros.io` → Backend API endpoints

---

**Data**: 17 Septembrie 2025  
**Status**: Infrastructure Ready, DNS Configuration Pending  
**Next Step**: Configure DNS records in Squarespace



## 🎯 Obiectiv
Configurează DNS-ul în Squarespace pentru a face domeniul `ahauros.io` să funcționeze cu landing page-ul și aplicația.

## 📋 Record-uri DNS de Adăugat

### 1. **Root Domain (ahauros.io) - Landing Page**
**⚠️ IMPORTANT**: Squarespace nu acceptă CNAME pe root domain. Folosește A records:

```
Type: A
Name: @
Value: 3.160.246.121
TTL: 3600 (sau default)
```

**Sau folosește toate IP-urile CloudFront pentru redundanță:**
```
Type: A
Name: @
Value: 3.160.246.121

Type: A
Name: @
Value: 3.160.246.41

Type: A
Name: @
Value: 3.160.246.55

Type: A
Name: @
Value: 3.160.246.82
```

### 2. **API Subdomain (api.ahauros.io)**
```
Type: CNAME
Name: api
Value: d-hjvaf6uiz8.execute-api.us-east-1.amazonaws.com
TTL: 3600 (sau default)
```

### 3. **App Subdomain (app.ahauros.io)**
```
Type: CNAME
Name: app
Value: dt9dafbtd6qiv.cloudfront.net
TTL: 3600 (sau default)
```

## 🔧 Pași pentru Configurarea în Squarespace

### Pasul 1: Accesează DNS Settings
1. Loghează-te în contul Squarespace
2. Mergi la **Settings** → **Domains**
3. Selectează domeniul `ahauros.io`
4. Click pe **DNS Settings**

### Pasul 2: Adaugă Record-urile CNAME

#### Record 1: Root Domain
- **Type**: A
- **Host**: @ (sau lasă gol pentru root domain)
- **Points to**: `3.160.246.121`
- **TTL**: 3600

**Nota**: CloudFront are multiple IP-uri. Poți adăuga toate pentru redundanță:
- `3.160.246.121`
- `3.160.246.41`
- `3.160.246.55`
- `3.160.246.82`

#### Record 2: API Subdomain
- **Type**: CNAME
- **Host**: api
- **Points to**: `d-hjvaf6uiz8.execute-api.us-east-1.amazonaws.com`
- **TTL**: 3600

#### Record 3: App Subdomain
- **Type**: CNAME
- **Host**: app
- **Points to**: `dt9dafbtd6qiv.cloudfront.net`
- **TTL**: 3600

### Pasul 3: Salvează Configurația
1. Click **Save** pentru fiecare record
2. Verifică că toate record-urile sunt active
3. Așteaptă propagarea DNS (5-30 minute)

## 🌐 URL-uri Finale

După configurarea DNS-ului, următoarele URL-uri vor funcționa:

- **Landing Page**: `https://ahauros.io`
- **API**: `https://api.ahauros.io`
- **App**: `https://app.ahauros.io`

## ⏱️ Timp de Propagare

- **Propagare Locală**: 5-15 minute
- **Propagare Globală**: 24-48 ore
- **Testare**: Folosește `nslookup` sau `dig` pentru verificare

## 🔍 Verificare DNS

### Comandă pentru verificare:
```bash
nslookup ahauros.io
nslookup api.ahauros.io
nslookup app.ahauros.io
```

### Rezultat așteptat:
```
ahauros.io → d3hd8m3agre20c.cloudfront.net
api.ahauros.io → d-hjvaf6uiz8.execute-api.us-east-1.amazonaws.com
app.ahauros.io → dt9dafbtd6qiv.cloudfront.net
```

## 🚨 Probleme Comune

### 1. **Root Domain nu funcționează**
- Squarespace nu acceptă CNAME pe root domain (`@`)
- **Soluție**: Folosește A record cu IP-ul CloudFront: `3.160.246.121`
- Pentru redundanță, adaugă toate IP-urile CloudFront

### 2. **SSL Certificate Errors**
- Certificatul ACM este deja validat pentru `ahauros.io`
- CloudFront va folosi automat certificatul
- Așteaptă 5-10 minute după propagarea DNS

### 3. **Propagare Lentă**
- DNS-ul poate lua până la 48 ore pentru propagare completă
- Folosește DNS-uri publice (8.8.8.8, 1.1.1.1) pentru testare
- Clear cache-ul browser-ului

## 📊 Status Actual

### ✅ **Infrastructure Ready**
- S3 bucket: `ahauros-landing-13b0adc0`
- CloudFront: `d3hd8m3agre20c.cloudfront.net`
- SSL Certificate: Validat pentru `ahauros.io`
- Landing Page: Deployed și funcțional

### ⏳ **Pending DNS Configuration**
- Record-urile DNS trebuie adăugate în Squarespace
- După configurare, `https://ahauros.io` va fi accesibil

## 🎉 Rezultat Final

După configurarea DNS-ului:
- **Landing Page**: `https://ahauros.io` → Pagina de prezentare Ahauros AI
- **Registration**: `https://app.ahauros.io/register` → Înregistrare utilizatori
- **API**: `https://api.ahauros.io` → Backend API endpoints

---

**Data**: 17 Septembrie 2025  
**Status**: Infrastructure Ready, DNS Configuration Pending  
**Next Step**: Configure DNS records in Squarespace










