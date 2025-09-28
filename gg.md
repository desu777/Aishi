# Kompletna konfiguracja nginx dla aishi.app z storage

```nginx
# Główna aplikacja - aishi.app (Port 3301)
server {
    server_name aishi.app www.aishi.app;

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

# Storage API - storage.aishi.app (Port 3304) - NOWY BLOK
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
    ssl_certificate /etc/letsencrypt/live/aishi.app/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/aishi.app/privkey.pem; # managed by Certbot
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

# HTTP to HTTPS redirect dla storage.aishi.app - NOWY BLOK
server {
    listen 80;
    listen [::]:80;
    server_name storage.aishi.app;
    return 301 https://$host$request_uri;
}
```

## Instrukcje wdrożenia:

### 1. Skopiuj konfigurację na serwer:
```bash
# Backup obecnej konfiguracji
sudo cp /etc/nginx/sites-available/aishi /etc/nginx/sites-available/aishi.backup

# Skopiuj nową konfigurację
sudo nano /etc/nginx/sites-available/aishi
# (wklej całą konfigurację nginx z powyższego bloku)
```

### 2. Test i restart nginx:
```bash
# Test konfiguracji
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

### 3. Dodaj certyfikat SSL dla storage.aishi.app:
```bash
sudo certbot --nginx -d storage.aishi.app \
  --non-interactive \
  --agree-tos \
  --email kuba.sromek10@gmail.com \
  --redirect
```

### 4. Weryfikacja:
```bash
# Sprawdź status
curl -I https://storage.aishi.app/health

# Sprawdź wszystkie domeny
curl -I https://aishi.app
curl -I https://docs.aishi.app
curl -I https://compute.aishi.app
curl -I https://storage.aishi.app
```

**Uwaga:** Po uruchomieniu certbot, automatycznie doda odpowiednie certyfikaty SSL dla storage.aishi.app w konfiguracji.