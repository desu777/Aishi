# 🚀 CORS Fix Deployment Guide - 0G Storage Upload Issue

## 📋 Problem Summary

**Issue:** Na produkcji upload do 0G storage pada z błędem `Network Error (AxiosError ERR_NETWORK)`

**Root Cause:**
- Browser próbuje bezpośrednio połączyć się z `https://indexer-storage-testnet-turbo.0g.ai`
- 0G endpoint blokuje requesty przez CORS (origin `https://aishi.app` nie jest w whitelist)
- Na dev działa bo localhost ma inne CORS policies

**Solution:** Nginx reverse proxy dla 0G storage endpoints

---

## 🔧 Zmiany w Kodzie

### 1. **app/src/lib/0g/network.ts**
Zmieniono fallback URLs na proxy paths:
```typescript
// BEFORE
storageRpc: 'https://indexer-storage-testnet-turbo.0g.ai'

// AFTER
storageRpc: '/0g-storage/turbo'  // używa nginx proxy
```

### 2. **app/.env.example**
Dodano nowe zmienne środowiskowe:
```bash
NEXT_PUBLIC_TURBO_STORAGE_RPC=/0g-storage/turbo
NEXT_PUBLIC_STANDARD_STORAGE_RPC=/0g-storage/standard
```

### 3. **DEPLOYMENT_GUIDE.md**
- Dodano nginx proxy config w sekcji 5.1
- Dodano nową sekcję "Krok 11: Wdrożenie Fix'a dla CORS/Network Error"
- Dodano troubleshooting steps

---

## 🚢 Production Deployment Steps

### KROK 1: Aktualizacja Kodu

```bash
cd /var/www/aishi
git pull origin main
```

### KROK 2: Aktualizacja .env

```bash
cd /var/www/aishi/app
nano .env
```

**Dodaj/zaktualizuj:**
```bash
NEXT_PUBLIC_TURBO_STORAGE_RPC=/0g-storage/turbo
NEXT_PUBLIC_STANDARD_STORAGE_RPC=/0g-storage/standard
```

### KROK 3: Rebuild Aplikacji

```bash
cd /var/www/aishi/app
npm install
npm run build
```

### KROK 4: Aktualizacja Nginx Config

```bash
sudo nano /etc/nginx/sites-available/aishi
```

**Dodaj w sekcji `server { ... }` dla `aishi.app` PRZED `location /`:**

```nginx
# Proxy dla 0G Storage - Turbo endpoint
location /0g-storage/turbo/ {
    proxy_pass https://indexer-storage-testnet-turbo.0g.ai/;
    proxy_ssl_server_name on;
    proxy_set_header Host indexer-storage-testnet-turbo.0g.ai;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    client_max_body_size 10M;
    proxy_connect_timeout 120s;
    proxy_send_timeout 120s;
    proxy_read_timeout 120s;

    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;

    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' '*';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, OPTIONS';
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
        add_header 'Access-Control-Max-Age' 1728000;
        add_header 'Content-Type' 'text/plain; charset=utf-8';
        add_header 'Content-Length' 0;
        return 204;
    }
}

# Proxy dla 0G Storage - Standard endpoint
location /0g-storage/standard/ {
    proxy_pass https://indexer-storage-testnet-standard.0g.ai/;
    proxy_ssl_server_name on;
    proxy_set_header Host indexer-storage-testnet-standard.0g.ai;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    client_max_body_size 10M;
    proxy_connect_timeout 120s;
    proxy_send_timeout 120s;
    proxy_read_timeout 120s;

    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;

    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' '*';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, OPTIONS';
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
        add_header 'Access-Control-Max-Age' 1728000;
        add_header 'Content-Type' 'text/plain; charset=utf-8';
        add_header 'Content-Length' 0;
        return 204;
    }
}
```

### KROK 5: Test i Reload Nginx

```bash
# Test konfiguracji
sudo nginx -t

# Reload (zero downtime)
sudo systemctl reload nginx
```

### KROK 6: Restart Aplikacji

```bash
pm2 restart aishi-app
```

### KROK 7: Weryfikacja

```bash
# Test proxy endpoint
curl -I https://aishi.app/0g-storage/turbo/

# Powinno zwrócić:
# HTTP/2 200
# access-control-allow-origin: *
# ...

# Sprawdź logi
pm2 logs aishi-app --lines 50

# Sprawdź logi nginx
sudo tail -f /var/log/nginx/access.log
```

### KROK 8: Test Funkcjonalny

1. Otwórz https://aishi.app w przeglądarce
2. Otwórz Chrome DevTools → Network tab
3. Spróbuj zapisać sen agenta lub konwersację
4. Sprawdź request do `/0g-storage/turbo/` - powinien być 200 OK

---

## 🔍 Troubleshooting

### Problem: 404 Not Found na /0g-storage/turbo/

```bash
# Sprawdź czy location block jest w configu
cat /etc/nginx/sites-available/aishi | grep -A 5 "0g-storage"

# Sprawdź czy config jest załadowany
sudo nginx -t
```

### Problem: Nadal CORS Error

```bash
# Sprawdź CORS headers
curl -I https://aishi.app/0g-storage/turbo/

# Powinno zawierać:
# access-control-allow-origin: *
```

### Problem: 502 Bad Gateway

```bash
# Sprawdź czy 0G endpoint jest dostępny
curl -I https://indexer-storage-testnet-turbo.0g.ai/

# Sprawdź logi nginx
sudo tail -f /var/log/nginx/error.log
```

### Problem: Timeout

```bash
# Zwiększ timeout w nginx
sudo nano /etc/nginx/sites-available/aishi
# Zmień proxy_*_timeout na 180s
sudo systemctl reload nginx
```

---

## ✅ Success Criteria

Po wdrożeniu:
- ✅ Upload do storage działa bez Network Error
- ✅ Logi pokazują request do `/0g-storage/turbo/` zamiast external URL
- ✅ Chrome DevTools nie pokazuje CORS errors
- ✅ Dreams i conversations zapisują się poprawnie

---

## 📝 Rollback Plan

Jeśli coś pójdzie nie tak:

```bash
# 1. Przywróć poprzednią wersję .env
cd /var/www/aishi/app
# Usuń nowe zmienne albo zmień na absolute URLs:
# NEXT_PUBLIC_TURBO_STORAGE_RPC=https://indexer-storage-testnet-turbo.0g.ai

# 2. Rebuild
npm run build

# 3. Restart
pm2 restart aishi-app

# 4. (Opcjonalnie) Usuń nginx proxy config
sudo nano /etc/nginx/sites-available/aishi
# Usuń location blocks dla /0g-storage/*
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🎯 Technical Notes

**Why This Works:**
- Nginx proxy'uje requesty server-side, gdzie nie ma CORS restrictions
- Browser widzi request do same-origin (`aishi.app/0g-storage/turbo`)
- Nginx przekazuje request do external endpoint (`indexer-storage-testnet-turbo.0g.ai`)
- Response wraca przez nginx z dodanymi CORS headers

**Architecture Flow:**
```
Browser → https://aishi.app/0g-storage/turbo/upload
         ↓
      Nginx (aishi.app)
         ↓
      https://indexer-storage-testnet-turbo.0g.ai/upload
         ↓
      Response + CORS headers
         ↓
      Browser ✅
```

**ROI:**
- Deployment time: ~10 minut
- Zero code complexity added
- Zero external dependencies
- Instant fix dla production issue
