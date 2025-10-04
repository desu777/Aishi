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
Dodano environment-based storage mode selection:
```typescript
// Storage mode kontroluje jak są ładowane endpoints
const storageMode = process.env.NEXT_PUBLIC_0G_STORAGE_MODE || 'development';

// Development mode (default)
storageRpc: 'https://indexer-storage-testnet-turbo.0g.ai'

// Production mode
storageRpc: '/0g-storage/turbo'  // używa nginx proxy
```

### 2. **app/.env.example**
Dodano nową zmienną kontrolną:
```bash
# Controls storage endpoint selection
NEXT_PUBLIC_0G_STORAGE_MODE=development

# Optional overrides (leave empty for auto-selection)
# NEXT_PUBLIC_TURBO_STORAGE_RPC=
# NEXT_PUBLIC_STANDARD_STORAGE_RPC=
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
# Enable production mode (nginx proxy)
NEXT_PUBLIC_0G_STORAGE_MODE=production
# Optional: można też użyć direct overrides
# NEXT_PUBLIC_TURBO_STORAGE_RPC=/0g-storage/turbo
# NEXT_PUBLIC_STANDARD_STORAGE_RPC=/0g-storage/standard
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

**PEŁNY CONFIG DO COPY-PASTE (zastąp cały plik):**

```nginx
# Główna aplikacja - aishi.app (Port 3301)
server {
    server_name aishi.app www.aishi.app;

    # ========================================
    # 0G STORAGE PROXY - FIX CORS ISSUES
    # ========================================

    # Proxy dla 0G Storage - Turbo endpoint
    location /0g-storage/turbo/ {
        proxy_pass https://indexer-storage-testnet-turbo.0g.ai/;
        proxy_ssl_server_name on;
        proxy_set_header Host indexer-storage-testnet-turbo.0g.ai;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Większe limity dla storage uploads
        client_max_body_size 10M;
        proxy_connect_timeout 120s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;

        # CORS headers - pozwala na cross-origin requests
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;

        # Handle preflight requests
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

        # Większe limity dla storage uploads
        client_max_body_size 10M;
        proxy_connect_timeout 120s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;

        # CORS headers - pozwala na cross-origin requests
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;

        # Handle preflight requests
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

    # ========================================
    # GŁÓWNA APLIKACJA
    # ========================================

    location / {
        proxy_pass http://localhost:3301;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeout settings for large requests
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    listen [::]:443 ssl; # managed by Certbot
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/aishi.app/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/aishi.app/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

# Dokumentacja - docs.aishi.app (Port 3302)
server {
    server_name docs.aishi.app;

    location / {
        proxy_pass http://localhost:3302;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    listen [::]:443 ssl; # managed by Certbot
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/aishi.app/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/aishi.app/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

# Backend API - compute.aishi.app (Port 3303)
server {
    server_name compute.aishi.app;

    location / {
        proxy_pass http://localhost:3303;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Większe limity dla API
        client_max_body_size 10M;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    listen [::]:443 ssl; # managed by Certbot
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/aishi.app/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/aishi.app/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

# Storage API - storage.aishi.app (Port 3304)
server {
    server_name storage.aishi.app;

    location / {
        proxy_pass http://localhost:3304;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Większe limity dla storage
        client_max_body_size 10M;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    listen [::]:443 ssl; # managed by Certbot
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/storage.aishi.app/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/storage.aishi.app/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

# HTTP to HTTPS redirects (managed by Certbot)
server {
    if ($host = www.aishi.app) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    if ($host = aishi.app) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    listen [::]:80;
    server_name aishi.app www.aishi.app;
    return 404; # managed by Certbot
}

server {
    if ($host = docs.aishi.app) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    listen [::]:80;
    server_name docs.aishi.app;
    return 404; # managed by Certbot
}

server {
    if ($host = compute.aishi.app) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    listen [::]:80;
    server_name compute.aishi.app;
    return 404; # managed by Certbot
}

server {
    if ($host = storage.aishi.app) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    listen [::]:80;
    server_name storage.aishi.app;
    return 301 https://$host$request_uri;
}
```

**LUB dodaj tylko te 2 location blocks PRZED `location /` w pierwszym server block:**

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

---

## 🔄 Development vs Production Modes

### Development Mode (Default)
```bash
# .env
NEXT_PUBLIC_0G_STORAGE_MODE=development
# lub zostaw puste (auto-default)
```
**Behavior:**
- Używa direct external URLs: `https://indexer-storage-testnet-turbo.0g.ai`
- Działa out-of-box bez nginx
- Idealne dla localhost development

### Production Mode
```bash
# .env
NEXT_PUBLIC_0G_STORAGE_MODE=production
```
**Behavior:**
- Używa nginx proxy paths: `/0g-storage/turbo`
- Wymaga nginx konfiguracji
- Eliminuje CORS issues na produkcji

### Manual Override (Advanced)
```bash
# .env
NEXT_PUBLIC_TURBO_STORAGE_RPC=https://custom-endpoint.example.com
```
**Behavior:**
- Ignoruje mode selection
- Używa custom URL
- Przydatne dla testing/staging
