# Dreamscape Compute Backend 🚀

Backend service dla aplikacji Dreamscape, który implementuje hybrydową architekturę: **Frontend (Wallet) + Backend (0G Compute)**. 

## 🎯 Architektura

### Hybrid Solution
```
Frontend (React/Next.js)    Backend (Node.js/Express)    0G Network
├── Wallet Connection   →   ├── Signature Verification  → ├── Ledger
├── Message Signing     →   ├── Broker Management       → ├── Inference  
├── UI/UX              →   ├── AI Analysis             → └── TEE Verification
└── Dream Management        └── Response Processing
```

### Dlaczego Hybrid?
- **0G Serving Broker** działa tylko w Node.js środowisku
- **Bezpieczeństwo**: Private keys zostają w przeglądarce
- **Skalowalność**: Backend może obsłużyć wielu użytkowników
- **Kompatybilność**: Zero problemów z dependencies

## 📁 Struktura

```
compute-backend/
├── src/
│   ├── config/           # Konfiguracja środowiska
│   ├── middleware/       # Autentykacja, CORS, limity
│   ├── services/         # Broker + AI services
│   ├── routes/          # API endpoints
│   ├── types/           # TypeScript typy
│   └── utils/           # Logging, cache
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## 🚀 Szybki Start

### 1. Instalacja
```bash
cd compute-backend
npm install
```

### 2. Konfiguracja Environment
```bash
cp .env.example .env
# Edytuj .env według potrzeb
```

### 3. Uruchomienie
```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

### 4. Testowanie
```bash
# Health check
curl http://localhost:3001/api/health

# Detailed info
curl http://localhost:3001/api/health/detailed
```

## 📡 API Endpoints

### Broker Management
```http
POST   /api/broker/init           # Inicjalizacja brokera
GET    /api/broker/balance/:addr  # Sprawdzenie salda
POST   /api/broker/fund           # Doładowanie konta
GET    /api/broker/models         # Lista modeli AI
```

### AI Analysis  
```http
POST   /api/ai/analyze            # Analiza snów przez AI
GET    /api/ai/models             # Informacje o modelach
POST   /api/ai/quick-test         # Szybki test AI
```

### Health Checks
```http
GET    /api/health                # Podstawowy health check
GET    /api/health/detailed       # Szczegółowe info
GET    /api/health/network        # Test połączenia z 0G
```

## 🔐 Autentykacja

### Podpisywanie Wiadomości
Frontend podpisuje standardowe wiadomości:

```typescript
// Inicjalizacja brokera
const message = `Initialize 0G Broker for ${address} at ${timestamp}`;
const signature = await signer.signMessage(message);

// Analiza AI
const message = `Analyze dream for ${address} at ${timestamp}`;
const signature = await signer.signMessage(message);
```

### Weryfikacja Podpisów
Backend weryfikuje każdy request:
- Sprawdza podpis przez `ethers.verifyMessage()`
- Validuje timestamp (max 5 min różnicy)
- Zarządza sesjami użytkowników

## 🤖 AI Models

### LLAMA-3.3-70B-Instruct
- **Szybkość**: 3-7 sekund
- **Cechy**: Konwersacyjny, ogólnego użytku
- **Najlepsze dla**: Szybkie interpretacje snów

### DeepSeek-R1-70B  
- **Szybkość**: 15-25 sekund
- **Cechy**: Szczegółowa analiza, reasoning
- **Najlepsze dla**: Głęboka analiza symboliczna

## 🛡️ Bezpieczeństwo

### Rate Limiting
- **Global**: 10 req/min per IP
- **AI Queries**: 100/dzień per user  
- **Fund Operations**: 5/godzina per user

### Validation
- Długość tekstu snów: 10-5000 znaków
- Kwoty doładowań: 0.001-10 OG
- Timestamp tolerance: 5 minut

### Error Handling
- Strukturalne kody błędów
- Detailed logging
- Graceful degradation

## 🎛️ Konfiguracja (.env)

```env
# Server
PORT=3001
NODE_ENV=development

# 0G Network
COMPUTE_RPC_URL=https://evmrpc-testnet.0g.ai
DEFAULT_MODEL=llama-3.3-70b-instruct

# Security
CORS_ORIGINS=http://localhost:3003
MAX_REQUESTS_PER_MINUTE=10

# Rate Limits  
MAX_AI_QUERIES_PER_DAY=100
MAX_FUND_OPERATIONS_PER_HOUR=5

# Logging
LOG_LEVEL=debug
```

## 📊 Monitoring

### Health Checks
```bash
# Podstawowy
curl http://localhost:3001/api/health

# Szczegółowy (system info)
curl http://localhost:3001/api/health/detailed

# Test sieci 0G
curl http://localhost:3001/api/health/network

# Status cache
curl http://localhost:3001/api/health/cache
```

### Logging
- **Console**: Kolorowe logi w development
- **Files**: W production (logs/combined.log)
- **Structured**: JSON format z context

## 🔄 Cache System

### User Sessions
- **TTL**: 30 minut
- **Tracking**: Request count, AI queries, fund ops
- **Cleanup**: Automatyczny co 5 minut

### Broker Sessions
- **TTL**: 60 minut  
- **Zawiera**: Broker instance, wallet, metadata
- **Memory**: In-memory storage (można rozszerzyć o Redis)

## 🐛 Development

### Debug Endpoints
```http
GET    /api/broker/info/:address     # Info o brokerze
DELETE /api/broker/cleanup/:address  # Cleanup sesji
POST   /api/ai/quick-test            # Test AI bez pełnej auth
```

### Scripts
```bash
npm run dev      # Development z hot reload
npm run build    # TypeScript build
npm run start    # Production start
npm run watch    # Nodemon watch mode
```

## 🚀 Production Deploy

### Docker (opcjonalnie)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["node", "dist/server.js"]
```

### PM2 (zalecane)
```bash
npm install -g pm2
npm run build
pm2 start dist/server.js --name dreamscape-compute
```

## 🎯 Next Steps

1. **Integracja z Frontend**: Połączenie z Dreamscape UI
2. **Database**: Opcjonalne dodanie PostgreSQL dla analytics
3. **Redis**: Cache layer dla lepszej skalowalności  
4. **Monitoring**: Prometheus + Grafana metrics
5. **Load Balancer**: Nginx dla multiple instances

## 🆘 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   lsof -ti:3001 | xargs kill -9
   ```

2. **0G Network connection failed**
   - Sprawdź `COMPUTE_RPC_URL` w .env
   - Test: `curl https://evmrpc-testnet.0g.ai`

3. **Signature verification failed**
   - Sprawdź timestamp (max 5 min różnicy)
   - Sprawdź format wiadomości na frontend

4. **Broker initialization failed**
   - Sprawdź połączenie z 0G network
   - Sprawdź contract addresses

## 📞 Support

- **Issues**: GitHub Issues
- **Docs**: `/api/health/detailed` endpoint
- **Network**: 0G Galileo Testnet (FREE)
- **Models**: LLAMA + DeepSeek available 24/7 