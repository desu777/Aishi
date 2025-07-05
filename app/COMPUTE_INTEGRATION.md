# 🧠 Compute Backend Integration

## 📋 Przegląd

Integracja **Dreamscape** z **0G Compute Network** przez hybrydową architekturę:
- **Frontend**: React/Next.js z podłączonym walletem (klucze prywatne bezpieczne)
- **Backend**: Node.js/Express jako proxy/bridge do 0G Network
- **0G Network**: Galileo Testnet - darmowe środowisko AI compute

## 🚀 Uruchomienie Systemu

### 1. **Uruchom Compute Backend**
```bash
cd compute-backend

# Zainstaluj dependencies
npm install

# Skopiuj konfigurację
cp .env.example .env

# Edytuj .env (opcjonalnie)
# PORT=3001
# COMPUTE_RPC_URL=https://evmrpc-testnet.0g.ai
# DEFAULT_MODEL=llama-3.3-70b-instruct

# Uruchom backend
npm run dev
```

Backend będzie dostępny na `http://localhost:3001`

### 2. **Uruchom Frontend Aplikację**
```bash
cd app

# Zainstaluj dependencies
npm install

# Utwórz .env.local (opcjonalnie)
echo "NEXT_PUBLIC_COMPUTE_API_URL=http://localhost:3001/api" > .env.local
echo "NEXT_PUBLIC_DREAM_TEST=true" >> .env.local

# Uruchom aplikację
npm run dev
```

Aplikacja będzie dostępna na `http://localhost:3003`

### 3. **Otwórz Stronę Testową**
Przejdź do: `http://localhost:3003/test-compute`

## 🔧 Konfiguracja Środowiska

### **Backend (.env)**
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
```

### **Frontend (.env.local)**
```env
# Development mode
NEXT_PUBLIC_DREAM_TEST=true

# Compute Backend
NEXT_PUBLIC_COMPUTE_API_URL=http://localhost:3001/api

# 0G Network (już skonfigurowane)
NEXT_PUBLIC_CHAIN_ID=16601
NEXT_PUBLIC_RPC_URL=https://evmrpc-testnet.0g.ai
```

## 🎯 Testowanie Integracji

### **Krok 1: Podłącz Wallet**
1. Otwórz `http://localhost:3003/test-compute`
2. Kliknij "Connect Wallet"
3. Połącz z MetaMask/WalletConnect
4. Upewnij się, że jesteś na **0G Galileo Testnet**

### **Krok 2: Zainicjalizuj Broker**
1. Przejdź na tab "Broker Management"
2. Kliknij "Initialize Broker" 
3. Potwierdź podpis w walletcie
4. Broker zostanie utworzony z 0.1 OG initial funding

### **Krok 3: Sprawdź Saldo**
1. Kliknij "Check Balance"
2. Potwierdź podpis w walletcie  
3. Zobaczysz saldo w OG tokenach

### **Krok 4: Testuj AI**
1. Przejdź na tab "AI Testing"
2. Wybierz model (LLAMA lub DeepSeek)
3. Kliknij "Quick Test" dla prostego testu
4. Lub wpisz własny tekst snu i kliknij "Analyze Dream"

### **Krok 5: Sprawdź Health**
1. Przejdź na tab "Health Check"
2. Zobacz status backend i 0G Network
3. Sprawdź dostępne modele AI

## 🛠️ Hook `useCompute`

### **Podstawowe Użycie**
```typescript
import { useCompute } from '@/hooks/useCompute';

function MyComponent() {
  const {
    isLoading,
    error,
    brokerInfo,
    models,
    initializeBroker,
    checkBalance,
    analyzeDream,
    clearError
  } = useCompute();
  
  // Inicjalizacja brokera
  const handleInit = async () => {
    const result = await initializeBroker();
    if (result.success) {
      console.log('Broker initialized!');
    }
  };
  
  // Analiza snu
  const handleAnalyze = async (dreamText: string) => {
    const result = await analyzeDream(dreamText, 'llama');
    if (result) {
      console.log('Analysis:', result.analysis);
    }
  };
  
  return (
    <div>
      {error && <div className="error">{error}</div>}
      
      <button onClick={handleInit} disabled={isLoading}>
        {isLoading ? 'Initializing...' : 'Initialize Broker'}
      </button>
      
      <button onClick={() => handleAnalyze('Flying dream')} disabled={isLoading}>
        Analyze Dream
      </button>
    </div>
  );
}
```

### **Dostępne Funkcje**
```typescript
// Stan
const {
  isLoading,          // boolean - czy trwa operacja
  error,              // string | null - błąd
  brokerInfo,         // BrokerInfo | null - info o brokerze
  models,             // AIModel[] - dostępne modele
  healthStatus,       // HealthStatus | null - status backend
  isConnected,        // boolean - czy wallet podłączony
  address             // string - adres wallet
} = useCompute();

// Operacje brokera
await initializeBroker();           // Inicjalizacja brokera
await checkBalance();               // Sprawdzenie salda  
await fundAccount('0.1');           // Doładowanie konta
await getBrokerInfo();              // Info o brokerze

// Operacje AI
await getModels();                  // Lista modeli
await analyzeDream(text, 'llama');  // Analiza snu
await quickTest('deepseek');        // Szybki test

// Utilities
await checkHealth();                // Health check
clearError();                       // Wyczyszczenie błędu
```

## 🔄 Przepływ Danych

```
Frontend                    Backend                     0G Network
   |                           |                            |
   |-- User Input ------------>|                            |
   |-- Sign Message ---------->|                            |
   |                           |-- Verify Signature ------->|
   |                           |-- Create Broker Account -->|
   |                           |-- Generate Auth Headers -->|
   |                           |-- AI Query + Headers ------>|
   |                           |<-- AI Response --------------|
   |                           |-- Process Payment --------->|
   |<-- Dream Analysis --------|                            |
```

## 🎨 UI Komponenty

### **Broker Status Card**
```typescript
{brokerInfo ? (
  <div className="broker-status">
    <div>Status: {brokerInfo.initialized ? '✅ Initialized' : '❌ Not Initialized'}</div>
    <div>Balance: {brokerInfo.balance}</div>
    <div>Last Used: {brokerInfo.lastUsed}</div>
  </div>
) : (
  <div>No broker information</div>
)}
```

### **Model Selection**
```typescript
{models.map(model => (
  <label key={model.id}>
    <input 
      type="radio" 
      value={model.id}
      checked={selectedModel === model.id}
      onChange={(e) => setSelectedModel(e.target.value)}
    />
    <div>
      <div>{model.name}</div>
      <div>{model.bestFor} • {model.averageResponseTime}</div>
    </div>
  </label>
))}
```

### **Dream Analysis Result**
```typescript
{analysisResult && (
  <div className="analysis-result">
    <h4>Analysis Result:</h4>
    <div>Interpretation: {analysisResult.analysis?.interpretation}</div>
    
    {analysisResult.analysis?.symbols?.length > 0 && (
      <div>
        Symbols: {analysisResult.analysis.symbols.map(symbol => (
          <span key={symbol} className="symbol-tag">{symbol}</span>
        ))}
      </div>
    )}
    
    <div className="metadata">
      <span>Cost: {analysisResult.cost}</span>
      <span>Balance: {analysisResult.remainingBalance}</span>
      <span>Time: {analysisResult.analysis?.responseTime}ms</span>
    </div>
  </div>
)}
```

## 🐛 Troubleshooting

### **Backend nie startuje**
```bash
# Sprawdź port
lsof -i :3001

# Sprawdź logi
npm run dev

# Sprawdź .env
cat .env
```

### **Wallet nie łączy się**
1. Sprawdź czy MetaMask jest zainstalowany
2. Dodaj 0G Galileo Testnet do MetaMask
3. Upewnij się, że masz testnet ETH (https://faucet.0g.ai)

### **Błąd CORS**
Upewnij się, że w backend `.env`:
```env
CORS_ORIGINS=http://localhost:3003
```

### **Błąd "Broker not initialized"**
1. Sprawdź czy wallet jest podłączony
2. Zainicjalizuj brokera na stronie testowej
3. Sprawdź logi w konsoli (F12)

### **AI nie odpowiada**
1. Sprawdź połączenie z 0G Network
2. Sprawdź czy broker ma fundusze
3. Sprawdź logi backend (terminal)

## 📊 Metryki i Monitoring

### **Backend Health Check**
```bash
curl http://localhost:3001/api/health
curl http://localhost:3001/api/health/detailed
```

### **Debug Mode**
W frontend ustaw:
```env
NEXT_PUBLIC_DREAM_TEST=true
```

Logi będą widoczne w konsoli przeglądarki.

## 🎯 Następne Kroki

1. **Integracja z Dream Agent**: Dodaj `useCompute` do strony `/dream-agent`
2. **Persistencja**: Dodaj zapisywanie analiz do localStorage/database
3. **UX**: Dodaj lepsze loading states i error handling
4. **Performance**: Dodaj caching dla często używanych operacji
5. **Security**: Dodaj bardziej zaawansowaną autoryzację

## 🆘 Support

- **Issues**: Sprawdź konsole frontend/backend
- **Docs**: `/api/health/detailed` endpoint
- **Network**: 0G Galileo Testnet (FREE)
- **Models**: LLAMA + DeepSeek dostępne 24/7

---

**Status**: ✅ Ready for testing  
**Last Updated**: January 2025  
**Version**: 1.0.0 