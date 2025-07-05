# Dreamscape 0G Compute Test Script

Test script do weryfikacji integracji z 0G Compute Network przed implementacją w głównej aplikacji Dreamscape.

## 🎯 Cel

Przetestowanie kompletnego przepływu 0G Compute:
- Inicjalizacja wallet i broker
- Zarządzanie ledger (konto + fundusze)
- Odkrywanie AI services
- Potwierdzanie providerów
- Wykonywanie zapytań AI
- Weryfikacja TEE i płatności
- Analiza kosztów

## 🚀 Instalacja

```bash
# Zainstaluj dependencies
npm install

# Skopiuj i edytuj zmienne środowiskowe
cp .env.example .env
```

## ⚙️ Konfiguracja

Utwórz plik `.env` z następującymi zmiennymi:

```env
# Klucz prywatny (64 znaki, BEZ prefiksu 0x)
COMPUTE_PRIVATE_KEY=your_private_key_here

# RPC endpoint (opcjonalnie, domyślnie 0G testnet)
COMPUTE_RPC_URL=https://evmrpc-testnet.0g.ai

# Tryb testowy (opcjonalnie)
NODE_ENV=development
```

## 🔧 Uruchomienie

### Metoda 1: Development (TypeScript)
```bash
npm run dev
```

### Metoda 2: Production (JavaScript)
```bash
npm run build
npm start
```

### Metoda 3: Pojedyncza komenda
```bash
npm run start
```

## 📊 Oczekiwane wyniki

### Sukces
```
🔷 DREAMSCAPE 0G COMPUTE TEST
====================================

📋 Step 1: Environment Validation
✅ Environment variables validated
ℹ️  RPC URL: https://evmrpc-testnet.0g.ai

📋 Step 2: Wallet Initialization
✅ Wallet Address: 0x1234...
ℹ️  Wallet ETH Balance: 0.1 ETH

📋 Step 3: 0G Compute Broker Initialization
✅ Broker created successfully

📋 Step 4: Ledger Account Management
✅ Ledger account exists
ℹ️  Current Ledger Balance: 0.1 OG

📋 Step 5: AI Service Discovery
✅ Found 2 available AI services

🤖 Service 1:
   Model: llama-3.3-70b-instruct
   Provider: 0xf07240Efa67755B5311bc75784a061eDB47165Dd
   Verification: TeeML
   Official: ✅

📋 Step 6: Provider Selection and Acknowledgment
✅ Provider acknowledged successfully

📋 Step 7: Service Metadata Retrieval
✅ Service Endpoint: https://...
✅ Model Name: llama-3.3-70b-instruct

📋 Step 8: AI Query Testing
🔍 Test Query 1: "What is the capital of France?"
✅ AI query completed in 1250ms
🤖 AI Response: "The capital of France is Paris."
✅ Verification Status: Valid ✅

📋 Step 9: Final Balance and Cost Analysis
ℹ️  Initial Balance: 0.1 OG
ℹ️  Final Balance: 0.097 OG
ℹ️  Total Cost: 0.003 OG
ℹ️  Average Cost per Query: 0.001 OG

📋 Step 10: Test Summary
📊 Test Results Summary:
✅ Successful Queries: 3/3
⏱️  Average Response Time: 1200ms
💰 Total Cost: 0.003 OG
🤖 Model Used: llama-3.3-70b-instruct
🔒 TEE Verification: Enabled

✅ 🎉 All tests passed! 0G Compute integration is working perfectly.
```

## 🔍 Co testuje skrypt

### 1. **Walidacja środowiska**
- Sprawdzenie zmiennych środowiskowych
- Walidacja klucza prywatnego
- Połączenie z RPC

### 2. **Inicjalizacja wallet**
- Tworzenie instancji wallet
- Sprawdzenie salda ETH
- Ostrzeżenie o niskim saldzie

### 3. **Broker 0G Compute**
- Inicjalizacja SDK
- Połączenie z kontraktami
- Weryfikacja konfiguracji

### 4. **Zarządzanie ledger**
- Sprawdzenie/tworzenie konta
- Doładowanie funduszy
- Monitoring salda

### 5. **Odkrywanie usług**
- Lista dostępnych AI services
- Identyfikacja oficjalnych providerów
- Wyświetlenie cen i weryfikacji

### 6. **Potwierdzanie providerów**
- Acknowledge provider (jednorazowe)
- Weryfikacja TEE quote
- Zapisanie w kontrakcie

### 7. **Metadata usług**
- Pobieranie endpoint i model
- Weryfikacja dostępności
- Przygotowanie do zapytań

### 8. **Testy AI**
- Wielokrotne zapytania testowe
- Generowanie auth headers
- Wywołania OpenAI API
- Pomiar czasu odpowiedzi
- Weryfikacja TEE

### 9. **Analiza kosztów**
- Porównanie sald przed/po
- Kalkulacja kosztów
- Średni koszt per zapytanie

### 10. **Podsumowanie**
- Statystyki sukcesu
- Średni czas odpowiedzi
- Całkowite koszty
- Status weryfikacji

## 🐛 Rozwiązywanie problemów

### Błąd: "COMPUTE_PRIVATE_KEY is required"
- Sprawdź czy plik `.env` istnieje
- Upewnij się, że zmienna jest ustawiona
- Klucz musi mieć 64 znaki (bez 0x)

### Błąd: "Insufficient balance"
- Potrzebujesz testnet ETH na wallet
- Pobierz z faucet: https://faucet.0g.ai
- Minimum ~0.01 ETH na transakcje

### Błąd: "Provider not acknowledged"
- Pierwszy raz używania providera
- Skrypt automatycznie acknowledguje
- Sprawdź czy transakcja się udała

### Błąd: "Quote verification failed"
- Problem z weryfikacją TEE
- Sprawdź połączenie sieciowe
- Spróbuj ponownie później

### Błąd: "Network error"
- Sprawdź połączenie internetowe
- Weryfikuj dostępność RPC
- Spróbuj innego RPC endpoint

## 📈 Interpretacja wyników

### Sukces (idealny)
- Wszystkie queries: ✅
- Czas odpowiedzi: 1000-2000ms
- Koszt per query: 0.001-0.003 OG
- Weryfikacja: Valid ✅

### Częściowy sukces
- 1-2 queries failed: Prawdopodobnie network issues
- Długi czas odpowiedzi: >3000ms - overloaded service
- Wysoki koszt: >0.005 OG - sprawdź ceny

### Niepowodzenie
- 0 successful queries: Problem z integracją
- Błędy autoryzacji: Sprawdź wallet/ledger
- Błędy sieci: Sprawdź connectivity

## 🎯 Następne kroki

Po udanym teście:
1. Zaimplementuj w głównej aplikacji Dreamscape
2. Stwórz service layer w `app/src/lib/0g-compute/`
3. Dodaj hooks w `app/src/hooks/compute/`
4. Zintegruj z UI w dream-agent page
5. Dodaj error handling i user feedback

## 🔧 Konfiguracja zaawansowana

### Zmiana testowanych queries
Edytuj `TEST_QUERIES` w `test-compute.ts`:

```typescript
const TEST_QUERIES = [
  "Your custom query here",
  "Another test query",
  "Dream analysis test: What does water in dreams mean?"
];
```

### Zmiana providera
Edytuj `OFFICIAL_PROVIDERS` lub wybierz inny:

```typescript
const selectedProvider = OFFICIAL_PROVIDERS["deepseek-r1-70b"];
```

### Dostosowanie budżetu
Edytuj zmienne budżetowe:

```typescript
const INITIAL_FUND_AMOUNT = 0.2; // Więcej funduszy
const MIN_BALANCE_THRESHOLD = 0.02; // Wyższy próg
```

## 🌟 Funkcje

- **Kolorowe logowanie** - łatwe śledzenie postępu
- **Szczegółowe błędy** - dokładne diagnosis problemów
- **Automatyczne funding** - auto-doładowanie ledger
- **Wielokrotne testy** - 3 różne zapytania
- **Analiza kosztów** - dokładne koszty per query
- **TEE verification** - weryfikacja bezpieczeństwa
- **Troubleshooting** - podpowiedzi przy błędach

## 🎉 Gotowe do integracji

Po udanym teście skrypt pokazuje, że:
- 0G Compute SDK działa poprawnie
- Wallet i ledger są skonfigurowane
- AI services są dostępne
- Płatności działają automatycznie
- TEE verification funkcjonuje

**Możesz śmiało przejść do implementacji w głównej aplikacji Dreamscape!** 