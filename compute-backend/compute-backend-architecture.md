# Dreamscape Compute Provider - Backend Architecture

## 🎯 Overview

Backend service that acts as a bridge between the Dreamscape frontend (wallet-based) and 0G Compute Network. Handles all compute operations while keeping private keys secure in the browser.

## 🔄 Complete Flow

### 1. **Initial Setup (One-time)**
```mermaid
Frontend                    Backend                     0G Network
   |                           |                            |
   |-- Connect Wallet -------->|                            |
   |                           |                            |
   |-- Sign "Init Broker" ---->|                            |
   |                           |-- Verify Signature ------->|
   |                           |-- Create Broker Account -->|
   |                           |<-- Account Created --------|
   |<-- Broker Initialized ----|                            |
```

### 2. **Fund Account**
```mermaid
Frontend                    Backend                     0G Network
   |                           |                            |
   |-- Sign "Fund X OG" ------>|                            |
   |                           |-- Verify Signature ------->|
   |                           |-- Check Balance ---------->|
   |                           |-- Deposit Funds ---------->|
   |                           |<-- Balance Updated --------|
   |<-- New Balance -----------|                            |
```

### 3. **AI Inference**
```mermaid
Frontend                    Backend                     0G Network
   |                           |                            |
   |-- Send Dream Text ------->|                            |
   |-- + Signature ------------>|                            |
   |                           |-- Verify User ------------>|
   |                           |-- Get Dream Context ------>|
   |                           |-- Build AI Prompt -------->|
   |                           |-- Execute Inference ------>|
   |                           |<-- AI Response -----------|
   |<-- Dream Analysis --------|                            |
```

## 🗂️ Backend Structure

```
compute-provider/
├── src/
│   ├── server.ts              # Express server setup
│   ├── config/
│   │   ├── env.ts            # Environment config
│   │   └── constants.ts      # Network constants
│   ├── middleware/
│   │   ├── auth.ts           # Signature verification
│   │   ├── cors.ts           # CORS configuration
│   │   └── error.ts          # Error handling
│   ├── services/
│   │   ├── broker.service.ts # 0G Broker management
│   │   ├── auth.service.ts   # Wallet authentication
│   │   └── ai.service.ts     # AI inference logic
│   ├── routes/
│   │   ├── broker.routes.ts  # /api/broker/*
│   │   ├── ai.routes.ts      # /api/ai/*
│   │   └── health.routes.ts  # /api/health
│   ├── types/
│   │   └── index.ts          # TypeScript types
│   └── utils/
│       ├── logger.ts         # Logging utility
│       └── cache.ts          # User session cache
├── package.json
├── tsconfig.json
└── .env.example
```

## 📡 API Endpoints

### **1. Initialize Broker Account**
```typescript
POST /api/broker/init
Body: {
  address: string,
  signature: string,  // Sign: "Initialize 0G Broker for {address} at {timestamp}"
  timestamp: number
}
Response: {
  success: boolean,
  brokerAddress: string,
  message: string
}
```

### **2. Check Balance**
```typescript
GET /api/broker/balance/:address
Headers: {
  'X-Signature': string,  // Sign: "Check balance for {address} at {timestamp}"
  'X-Timestamp': string
}
Response: {
  balance: string,
  formatted: string,
  currency: "OG"
}
```

### **3. Fund Account**
```typescript
POST /api/broker/fund
Body: {
  address: string,
  amount: string,     // In OG tokens
  signature: string,  // Sign: "Fund {amount} OG for {address} at {timestamp}"
  timestamp: number
}
Response: {
  success: boolean,
  txHash: string,
  newBalance: string
}
```

### **4. AI Inference**
```typescript
POST /api/ai/analyze
Body: {
  address: string,
  dreamText: string,
  signature: string,  // Sign: "Analyze dream for {address} at {timestamp}"
  timestamp: number,
  options?: {
    model?: "llama" | "deepseek",
    level?: number  // Agent level 1-7
  }
}
Response: {
  success: boolean,
  analysis: {
    interpretation: string,
    symbols: string[],
    emotions: string[],
    insights: string[]
  },
  cost: string,
  remainingBalance: string
}
```

### **5. List Available Models**
```typescript
GET /api/ai/models
Response: {
  models: [{
    id: string,
    name: string,
    provider: string,
    costPerQuery: string,
    features: string[]
  }]
}
```

## 🔐 Security

### **Signature Verification**
```typescript
// Frontend signs
const message = `Analyze dream for ${address} at ${timestamp}`;
const signature = await signer.signMessage(message);

// Backend verifies
function verifySignature(address: string, signature: string, message: string): boolean {
  const recoveredAddress = ethers.verifyMessage(message, signature);
  return recoveredAddress.toLowerCase() === address.toLowerCase();
}
```

### **Rate Limiting**
- Max 10 requests per minute per address
- Max 100 AI queries per day per address
- Exponential backoff for repeated failures

### **Session Management**
```typescript
// In-memory cache for active sessions
interface UserSession {
  address: string;
  brokerInitialized: boolean;
  lastActivity: Date;
  requestCount: number;
}
```

## 🛠️ Implementation Steps

### **Phase 1: Basic Infrastructure**
1. Express server with TypeScript
2. Signature verification middleware
3. Basic broker initialization
4. Health check endpoint

### **Phase 2: Broker Management**
1. Create/check broker accounts
2. Balance checking
3. Fund management
4. Error handling for insufficient funds

### **Phase 3: AI Integration**
1. Model selection logic
2. Prompt construction
3. 0G Compute inference
4. Response processing

### **Phase 4: Production Features**
1. Rate limiting
2. Caching layer
3. Monitoring/logging
4. Cost optimization

## 💾 State Management

### **No Database Required (Initially)**
- User state derived from blockchain
- Sessions stored in memory
- Broker accounts persistent on-chain

### **Future Database (Optional)**
```sql
-- For analytics and optimization
CREATE TABLE user_queries (
  id SERIAL PRIMARY KEY,
  address VARCHAR(42),
  query_type VARCHAR(50),
  model_used VARCHAR(50),
  cost_og DECIMAL(18,6),
  response_time_ms INTEGER,
  created_at TIMESTAMP
);
```

## 🚀 Deployment

### **Environment Variables**
```env
# Server
PORT=3001
NODE_ENV=production

# 0G Network
COMPUTE_RPC_URL=https://evmrpc-testnet.0g.ai
STORAGE_RPC_URL=https://indexer-storage-testnet-turbo.0g.ai

# Security
CORS_ORIGINS=https://dreamscape.app,http://localhost:3003
MAX_REQUESTS_PER_MINUTE=10

# AI Models
DEFAULT_MODEL=llama-3.3-70b-instruct
ENABLE_DEEPSEEK=true
```

### **Docker Support**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["node", "dist/server.js"]
```

## ✅ Benefits

1. **Security**: Private keys never leave browser
2. **Scalability**: Stateless backend, easy to scale
3. **Flexibility**: Easy to add new AI models
4. **Cost Control**: Per-user broker accounts
5. **Decentralization**: Users control their funds

## 🎯 Next Steps

1. **MVP Implementation**: Basic broker init + simple inference
2. **Testing**: Unit tests for signature verification
3. **Integration**: Connect with frontend wallet
4. **Monitoring**: Add logging and metrics
5. **Optimization**: Cache frequent queries