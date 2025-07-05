# Dreamscape 0G Compute Backend

Simplified 0G Compute backend with virtual brokers and Master Wallet architecture.

## 🎯 Koncepcja

Nowy backend zastępuje skomplikowany system delegowanych podpisów prostszym rozwiązaniem z jednym centralnym portfelem (Master Wallet) i wirtualnymi brokerami w bazie SQLite.

### Architektura

```
Frontend (app) → 0g-compute Backend → 0G Network
                      ↓
                SQLite Database
                (Virtual Brokers)
```

**Kluczowe Komponenty:**
- **Master Wallet**: Jeden centralny portfel dla wszystkich zapytań AI
- **Virtual Brokers**: Wirtualne salda użytkowników w SQLite
- **Auto-refill**: Automatyczne zasilanie Master Wallet przy spadku poniżej progu
- **Transaction Monitor**: Nasłuchiwanie wpłat na Master Wallet

## 🚀 Instalacja

### 1. Sklonuj i zainstaluj

```bash
cd 0g-compute
npm install
```

### 2. Skonfiguruj zmienne środowiskowe

Utwórz plik `.env` na podstawie `doors.md`:

```env
# Master Wallet Private Key (64 characters, no 0x prefix)
MASTER_WALLET_KEY=your_private_key_here

# 0G Network Configuration
RPC_URL=https://evmrpc-testnet.0g.ai
CHAIN_ID=16601

# Server Configuration
PORT=3001
NODE_ENV=production
FRONTEND_URL=http://localhost:3000

# Database Configuration
DATABASE_PATH=./data/brokers.db

# Logging Configuration
LOG_LEVEL=info
TEST_ENV=false

# Auto-refill Configuration
AUTO_REFILL_THRESHOLD=0.1
AUTO_REFILL_AMOUNT=0.5
```

### 3. Uruchom

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

## 🔧 API Endpointy

### Podstawowe

- `GET /` - Informacje o serwisie
- `GET /api/health` - Health check
- `GET /api/status` - Status serwisu i Master Wallet

### Virtual Brokers

- `POST /api/create-broker` - Tworzenie wirtualnego brokera
- `POST /api/fund` - Zasilanie brokera
- `GET /api/balance/:walletAddress` - Sprawdzanie salda
- `GET /api/transactions/:walletAddress` - Historia transakcji

### AI Services

- `POST /api/analyze-dream` - Główny endpoint analizy snów
- `GET /api/models` - Dostępne modele AI
- `POST /api/estimate-cost` - Szacowanie kosztów

### Utility

- `GET /api/master-wallet-address` - Adres Master Wallet do wpłat

## 📊 Przepływ Użytkownika

### 1. Tworzenie Virtual Brokera

```bash
curl -X POST http://localhost:3001/api/create-broker \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "0x1234..."}'
```

### 2. Zasilanie Brokera

**Opcja A: Automatyczne (zalecane)**
```bash
# Pobierz adres Master Wallet
curl http://localhost:3001/api/master-wallet-address

# Wyślij transakcję na ten adres z MetaMask
# System automatycznie zaliczy środki na broker
```

**Opcja B: Manualne**
```bash
curl -X POST http://localhost:3001/api/fund \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x1234...",
    "amount": 0.1,
    "txHash": "0xabc..."
  }'
```

### 3. Sprawdzanie Salda

```bash
curl http://localhost:3001/api/balance/0x1234...
```

### 4. Analiza Snów

```bash
curl -X POST http://localhost:3001/api/analyze-dream \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x1234...",
    "query": "What does flying in a dream mean?",
    "model": "llama-3.3-70b-instruct"
  }'
```

## 🤖 Dostępne Modele AI

- `llama-3.3-70b-instruct` (domyślny)
- `deepseek-r1-70b`

## 🔍 Monitorowanie

### Status Serwisu

```bash
curl http://localhost:3001/api/status
```

Zwraca:
- Status AI service
- Stan Master Wallet
- Statystyki virtual brokers
- Informacje o systemie

### Logi

Włącz tryb debug:
```env
TEST_ENV=true
```

## 🛠️ Konfiguracja

### Auto-refill Master Wallet

```env
AUTO_REFILL_THRESHOLD=0.1  # Próg poniżej którego następuje doładowanie
AUTO_REFILL_AMOUNT=0.5     # Kwota doładowania
```

### Baza Danych

```env
DATABASE_PATH=./data/brokers.db  # Ścieżka do bazy SQLite
```

## 📋 Struktura Bazy

### Tabela `user_brokers`

```sql
CREATE TABLE user_brokers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  walletAddress TEXT UNIQUE NOT NULL,
  balance REAL NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);
```

### Tabela `transactions`

```sql
CREATE TABLE transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  walletAddress TEXT NOT NULL,
  type TEXT NOT NULL, -- 'deposit', 'withdrawal', 'ai_query'
  amount REAL NOT NULL,
  description TEXT NOT NULL,
  txHash TEXT,
  createdAt TEXT NOT NULL
);
```

## 🔐 Bezpieczeństwo

- **Master Wallet**: Klucz prywatny w `.env` (nigdy nie commituj)
- **CORS**: Skonfigurowane dla frontendu
- **Rate Limiting**: Implementowane w middleware
- **Input Validation**: Walidacja wszystkich danych wejściowych

## 📊 Przykładowe Odpowiedzi

### Analiza Snu

```json
{
  "success": true,
  "data": {
    "response": "Flying in dreams often represents freedom, liberation, and the desire to transcend limitations...",
    "model": "llama-3.3-70b-instruct",
    "cost": 0.001,
    "chatId": "chatcmpl-123456",
    "responseTime": 1250,
    "isValid": true
  },
  "message": "Dream analysis completed successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Status Brokera

```json
{
  "success": true,
  "data": {
    "walletAddress": "0x1234...",
    "balance": 0.095,
    "masterWalletAddress": "0x5678...",
    "transactions": [
      {
        "type": "deposit",
        "amount": 0.1,
        "description": "Deposit 0.1 OG to virtual broker",
        "txHash": "0xabc...",
        "createdAt": "2024-01-15T10:00:00.000Z"
      }
    ]
  }
}
```

## 🐛 Rozwiązywanie Problemów

### Błąd: "MASTER_WALLET_KEY is required"

Sprawdź plik `.env` i upewnij się, że klucz prywatny jest prawidłowy (64 znaki, bez 0x).

### Błąd: "Insufficient balance"

Użytkownik nie ma wystarczających środków na virtual brokerze. Zasil konto.

### Błąd: "Provider not acknowledged"

Pierwszy raz używania providera. System automatycznie acknowledguje przy inicjalizacji.

### Błąd: "Failed to initialize services"

Sprawdź:
- Połączenie z RPC (0G testnet)
- Saldo ETH na Master Wallet
- Poprawność klucza prywatnego

## 🚀 Deployment

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

### PM2 (zalecane)

```bash
pm2 start dist/server.js --name "0g-compute"
pm2 startup
pm2 save
```

## 📈 Skalowanie

- **Horizontal**: Uruchom wiele instancji za load balancerem
- **Database**: Rozważ PostgreSQL dla większych obciążeń
- **Caching**: Dodaj Redis dla cachowania odpowiedzi AI

## 🔄 Migracja z Obecnego Systemu

1. Wdroż nowy 0g-compute backend
2. Zaktualizuj frontend do używania nowych endpointów
3. Usuń stary compute-backend
4. Przekieruj użytkowników do tworzenia virtual brokers

## 📚 Linki

- [0G Testnet Faucet](https://faucet.0g.ai)
- [0G Documentation](https://docs.0g.ai)
- [0G SDK](https://github.com/0glabs/0g-serving-broker)

## 🏗️ Rozwój

Kod jest modularny i łatwy do rozbudowy:
- `src/database/` - Zarządzanie bazą danych
- `src/services/` - Logika biznesowa
- `src/routes/` - API endpoints
- `src/server.ts` - Główny serwer

---

**Dreamscape 0G Compute Backend** - Simplified AI dreams analysis with virtual brokers 🚀 