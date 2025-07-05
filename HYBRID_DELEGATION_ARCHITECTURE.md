# 🔐 Hybrid Delegation Architecture - User-Owned Brokers

## 📋 Przegląd

Implementacja **hybrydowej architektury** gdzie każdy user ma swojego własnego brokera w 0G Network, finansowanego z własnego walleta (tak jak w `test-compute.ts`), ale zarządzanego przez backend proxy.

## 🎯 Kluczowe Cechy

1. **User-Owned Brokers** - każdy user ma swojego brokera
2. **Self-Funded** - user finansuje swojego brokera z własnego walleta (1.8 OG)
3. **Signature Delegation** - backend używa RemoteSigner który deleguje podpisy do frontend
4. **Bezpieczeństwo** - private keys pozostają w przeglądarce

## 🔄 Architektura

```
Frontend (Wallet)          Backend (Proxy)           0G Network
    |                          |                          |
    |-- Init Broker ---------> |                          |
    |                          |-- Create RemoteSigner -->|
    |                          |-- Create Broker -------->|
    |                          |<- Needs Signature -------|
    |<- Sign Request --------- |                          |
    |-- Provide Signature ---> |                          |
    |                          |-- Continue Init -------->|
    |                          |<- Broker Created --------|
    |<- Broker Ready --------- |                          |
```

## 🛠️ Komponenty

### **1. RemoteSigner (`remote-signer.service.ts`)**
```typescript
// Implementuje signer interface ale deleguje podpisy do frontend
class RemoteSigner {
  async signMessage(message: string): Promise<string> {
    // Create signature request
    await this.createSignatureRequest(operationId, { type: 'signMessage', message });
    // Wait for signature from frontend
    return await this.waitForSignature(operationId);
  }
}
```

### **2. Signature Routes (`signature.routes.ts`)**
```typescript
// POST /api/signature/request - backend tworzy request
// GET /api/signature/pending/:address - frontend sprawdza pending
// POST /api/signature/provide - frontend dostarcza podpis
// GET /api/signature/wait/:operationId - backend czeka (long polling)
```

### **3. Updated Broker Service**
```typescript
// Używa RemoteSigner zamiast random wallet
const remoteSigner = createRemoteSigner(address, this.provider);
const broker = await createZGComputeNetworkBroker(remoteSigner);
```

### **4. Frontend Hook (`useCompute.ts`)**
```typescript
// Auto-polling dla signature requests
useEffect(() => {
  if (isInitializing) {
    pollingInterval = setInterval(checkPendingSignatures, 1000);
  }
}, [isInitializing]);

// Auto-process signatures
useEffect(() => {
  if (pendingSignatures.length > 0) {
    processSignatureRequest(pendingSignatures[0]);
  }
}, [pendingSignatures]);
```

## 🚀 Jak to działa

### **Krok 1: User inicjalizuje brokera**
```typescript
// Frontend
const result = await initializeBroker();
// To rozpoczyna proces...
```

### **Krok 2: Backend tworzy RemoteSigner**
```typescript
// Backend
const remoteSigner = createRemoteSigner(userAddress, provider);
const broker = await createZGComputeNetworkBroker(remoteSigner);
```

### **Krok 3: 0G SDK wymaga podpisu (np. addLedger)**
```typescript
// RemoteSigner
await broker.ledger.addLedger(0.1); // To wywoła signTransaction
```

### **Krok 4: Frontend otrzymuje request i podpisuje**
```typescript
// Frontend automatycznie:
1. Sprawdza pending signatures (polling)
2. Pokazuje UI "Signature Required"
3. Wywołuje wallet.signTransaction()
4. Odsyła podpis do backend
```

### **Krok 5: Backend kontynuuje z podpisem**
```typescript
// RemoteSigner otrzymuje podpis i kontynuuje operację
// Broker zostaje utworzony z user funds!
```

## 💰 **Finansowanie**

- **Initial funding**: User płaci 0.1 OG ze swojego walleta
- **Każde zapytanie**: ~0.001-0.003 OG z konta brokera
- **Doładowanie**: User może doładować przez `fundAccount()`

## 🔒 **Bezpieczeństwo**

1. **Private keys** - nigdy nie opuszczają przeglądarki
2. **Signature verification** - każda operacja weryfikowana
3. **Timeout** - 60 sekund na podpis
4. **Rate limiting** - ochrona przed nadużyciami

## 📊 **Porównanie z test-compute.ts**

| Feature | test-compute.ts | Hybrid Delegation |
|---------|----------------|-------------------|
| Wallet | Private key w .env | Browser wallet |
| Broker | Direct creation | RemoteSigner proxy |
| Signing | Instant (local) | Delegated (UI) |
| Security | Private key exposed | Private key safe |
| UX | CLI only | Full dApp |

## 🎯 **Korzyści**

1. **Identyczne jak test-compute** - ten sam flow, ale bezpieczny
2. **User ownership** - każdy user ma swojego brokera
3. **Self-funded** - user płaci za swoje operacje
4. **Decentralized** - backend tylko proxy, nie custody
5. **Scalable** - każdy user niezależny

## 🐛 **Troubleshooting**

### **"Insufficient funds"**
- User musi mieć OG na walletcie (nie tylko ETH)
- Sprawdź saldo: 1.8 OG powinno wystarczyć

### **"Signature timeout"**
- User nie podpisał w 60 sekund
- Sprawdź czy MetaMask popup się pokazał

### **"Broker not initialized"**
- Proces inicjalizacji nie dokończony
- Sprawdź pending signatures w UI

## 🚦 **Status Implementacji**

✅ RemoteSigner - gotowy
✅ Signature routes - gotowe  
✅ Updated broker service - gotowy
✅ Frontend hook z polling - gotowy
✅ UI dla pending signatures - gotowe

## 🎉 **Podsumowanie**

Udało się zaimplementować **dokładnie to co chciałeś** - każdy user ma swojego brokera finansowanego z własnego walleta (jak w test-compute.ts), ale zarządzanego bezpiecznie przez dApp z browser wallet!

Backend jest tylko **proxy mostem** który:
- Nie przechowuje private keys
- Nie zarządza funduszami
- Tylko pośredniczy w komunikacji
- Deleguje podpisy do frontend

To rozwiązanie łączy **bezpieczeństwo browser wallet** z **pełną funkcjonalnością 0G SDK**! 