# >ê Nginx HTTP Test Configuration - Mixed Content Verification

##   WARNING - TEMPORARY TEST ONLY!

**Ten config jest TYLKO do quick verification test (<1h)!**
**NIE u|ywaj dBugoterminowo - to security risk!**

---

## <¯ Cel Testu

Zweryfikowa czy usunicie HTTPS rozwizuje upload problem ’ potwierdza |e Mixed Content jest root cause.

**Expected Result:**
-  Upload dziaBa na `http://aishi.app`
-  Brak Mixed Content errors
-  Potwierdza |e 0G HTTP storage nodes s problemem

---

## =Ë Pre-Test Checklist

```bash
# 1. Backup obecnego configa
sudo cp /etc/nginx/sites-available/aishi /etc/nginx/sites-available/aishi.https.backup

# 2. Backup .env files
cp /var/www/aishi/app/.env /var/www/aishi/app/.env.backup
cp /var/www/aishi/0g-compute/.env /var/www/aishi/0g-compute/.env.backup

# 3. Notify users (opcjonalnie)
# "Maintenance window - testing in progress"
```

---

## =' Nginx HTTP Test Config

**Copy-paste do `/etc/nginx/sites-available/aishi`:**

```nginx
# ========================================
# TEMPORARY HTTP TEST - aishi.app
# ========================================
# WARNING: This disables HTTPS! Test only!
# ========================================

# HTTP only server - aishi.app (Port 3301)
server {
    listen 80;
    listen [::]:80;
    server_name aishi.app www.aishi.app;

    # ========================================
    # GAÓWNA APLIKACJA
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

        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}

# ========================================
# POZOSTAAE DOMENY - KEEP HTTPS
# ========================================

# Dokumentacja - docs.aishi.app (Port 3302) - HTTPS
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

    listen [::]:443 ssl;
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/aishi.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/aishi.app/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

# Backend API - compute.aishi.app (Port 3303) - HTTPS
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

        # Wiksze limity dla API
        client_max_body_size 10M;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    listen [::]:443 ssl;
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/aishi.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/aishi.app/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

# Storage API - storage.aishi.app (Port 3304) - HTTPS
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

        # Wiksze limity dla storage
        client_max_body_size 10M;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    listen [::]:443 ssl;
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/storage.aishi.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/storage.aishi.app/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

# ========================================
# HTTP to HTTPS REDIRECTS
# ========================================
# NOTE: aishi.app HTTP redirect DISABLED for test!
# Other domains keep HTTPS redirects

server {
    if ($host = docs.aishi.app) {
        return 301 https://$host$request_uri;
    }

    listen 80;
    listen [::]:80;
    server_name docs.aishi.app;
    return 404;
}

server {
    if ($host = compute.aishi.app) {
        return 301 https://$host$request_uri;
    }

    listen 80;
    listen [::]:80;
    server_name compute.aishi.app;
    return 404;
}

server {
    if ($host = storage.aishi.app) {
        return 301 https://$host$request_uri;
    }

    listen 80;
    listen [::]:80;
    server_name storage.aishi.app;
    return 301 https://$host$request_uri;
}
```

---

## =€ Quick Deployment Commands

```bash
# BACKUP
sudo cp /etc/nginx/sites-available/aishi /etc/nginx/sites-available/aishi.https.backup
cp /var/www/aishi/app/.env /var/www/aishi/app/.env.backup
cp /var/www/aishi/0g-compute/.env /var/www/aishi/0g-compute/.env.backup

# APPLY HTTP CONFIG
# (copy-paste nginx config z tego pliku)
sudo nano /etc/nginx/sites-available/aishi

# UPDATE BACKEND CORS
cd /var/www/aishi/0g-compute
nano .env
# Dodaj: CORS_ORIGIN=http://aishi.app,https://aishi.app,https://docs.aishi.app

# RELOAD
sudo nginx -t && sudo systemctl reload nginx
pm2 restart aishi-compute

# TEST
# Open: http://aishi.app
# Try upload
# Check console logs

# ROLLBACK (IMPORTANT!)
sudo cp /etc/nginx/sites-available/aishi.https.backup /etc/nginx/sites-available/aishi
sudo systemctl reload nginx
cp /var/www/aishi/0g-compute/.env.backup /var/www/aishi/0g-compute/.env
pm2 restart aishi-compute
```

---

## =Ê Test Results Template

```markdown
## HTTP Test Results - [DATE]

### Configuration:
- Frontend: http://aishi.app
- Backend: https://compute.aishi.app (HTTPS kept)
- Test duration: [X minutes]

### Upload Test:
- [ ] Started upload attempt
- [ ] Browser console logs: [paste]
- [ ] Network tab: [screenshot/paste]
- [ ] Upload result:  SUCCESS / L FAILED

### Observations:
- Mixed Content errors: YES / NO
- Storage node connection: [http://IP:5678]
- Final status: [describe]

### Conclusion:
- Root cause confirmed: [YES/NO]
- Next steps: [action plan]
```

---

## ¡ CRITICAL REMINDER

**= ALWAYS RESTORE HTTPS AFTER TEST! =**

Set timer/alarm for 1 hour max!

```bash
# Automatic rollback after 1h (safety):
(sleep 3600 && sudo cp /etc/nginx/sites-available/aishi.https.backup /etc/nginx/sites-available/aishi && sudo systemctl reload nginx) &
```
