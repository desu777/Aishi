# 📋 Zestawienie Funkcji Kontraktu DreamscapeAgent.sol

## 🎯 **FUNKCJE PODSTAWOWE (Core Functions)**

### 1. `mintAgent(bytes[] proofs, string[] descriptions, string agentName, address to)`
**Co robi:**
- Tworzy nowego agenta NFT (jeden na portfel)
- Pobiera opłatę 0.1 ETH
- **Inicjalizuje i aktywuje osobowość** (wszystkie cechy = 50, personalityInitialized = true)
- Emituje PersonalityActivated event od razu
- Tworzy pusty system pamięci
- Opcjonalnie weryfikuje ZK-proof

**Parametry:**
- `proofs` - opcjonalne dowody ZK (może być puste)
- `descriptions` - opisy równoległe do proofs
- `agentName` - unikalna nazwa agenta (max 32 bajty)
- `to` - adres odbiorcy (musi nie mieć agenta)

**Zwraca:** `uint256 tokenId`

---

## 🧠 **FUNKCJE OSOBOWOŚCI (Personality Functions)**

### 2. `processDailyDream(uint256 tokenId, bytes32 dreamHash, PersonalityImpact impact)`
**Co robi:**
- Przetwarza codzienny sen agenta
- Aktualizuje pamięć hierarchiczną
- Co 5 snów: ewoluuje osobowość (bez inicjalizacji - już aktywna)
- Co 3 sny: +1 inteligencji
- Dodaje AI-generowane unikalne cechy (max 2)
- Sprawdza milestone'y osobowości

**Parametry:**
- `tokenId` - ID agenta
- `dreamHash` - hash snu w 0G Storage
- `impact` - wpływ na osobowość (zmiany cech -10 do +10)

**Cooldown:** 24 godziny

### 3. `recordConversation(uint256 tokenId, bytes32 conversationHash, ContextType contextType)`
**Co robi:**
- Zapisuje rozmowę w pamięci
- Co 10 rozmów: +1 inteligencji
- Aktualizuje licznik rozmów
- Sprawdza zmianę miesiąca

**Parametry:**
- `tokenId` - ID agenta
- `conversationHash` - hash rozmowy w storage
- `contextType` - typ rozmowy (DREAM_DISCUSSION, GENERAL_CHAT, etc.)

---

## 🗄️ **FUNKCJE PAMIĘCI (Memory Functions)**

### 4. `consolidateMonth(uint256 tokenId, bytes32 dreamMonthlyHash, bytes32 convMonthlyHash, uint8 month, uint16 year)`
**Co robi:**
- Konsoliduje miesiąc (daily → monthly)
- Przyznaje nagrody za konsolidację (2-8 inteligencji)
- Aktualizuje streak konsolidacji
- Sprawdza milestone'y pamięci
- Dla grudnia: włącza flagę `yearlyReflection`

**Parametry:**
- `tokenId` - ID agenta
- `dreamMonthlyHash` - hash skonsolidowanych snów
- `convMonthlyHash` - hash skonsolidowanych rozmów
- `month` - miesiąc (1-12)
- `year` - rok (2024+)

### 5. `updateMemoryCore(uint256 tokenId, bytes32 newHash)`
**Co robi:**
- Aktualizuje roczny memory core
- Jeśli `yearlyReflection` = true: +5 inteligencji
- Resetuje flagę `yearlyReflection`

**Parametry:**
- `tokenId` - ID agenta
- `newHash` - hash nowego memory core

---

## 👁️ **FUNKCJE WIDOKU (View Functions)**

### 6. `getPersonalityTraits(uint256 tokenId) → PersonalityTraits`
**Co robi:** Zwraca wszystkie cechy osobowości agenta

### 7. `getMemoryAccess(uint256 tokenId) → (uint256 monthsAccessible, string memoryDepth)`
**Co robi:** Zwraca poziom dostępu do pamięci na podstawie inteligencji

**Przykład zwrotu:**
```solidity
(60, "5 years complete archive") // dla inteligencji 60+
(12, "annual") // dla inteligencji 12-23
```

### 8. `getAgentMemory(uint256 tokenId) → AgentMemory`
**Co robi:** Zwraca strukturę pamięci hierarchicznej agenta

### 9. `needsConsolidation(uint256 tokenId) → (bool isNeeded, uint8 currentMonth, uint16 currentYear)`
**Co robi:** Sprawdza czy potrzebna konsolidacja (zmiana miesiąca)

### 10. `getConsolidationReward(uint256 tokenId) → (uint256 baseReward, uint256 streakBonus, uint256 earlyBirdBonus, uint256 totalReward)`
**Co robi:** Podgląd nagrody za konsolidację

**Przykład zwrotu:**
```solidity
(2, 5, 1, 8) // base=2, streak=5, early=1, total=8
```

### 11. `canProcessDreamToday(uint256 tokenId) → bool`
**Co robi:** Sprawdza czy agent może przetworzyć sen (cooldown 24h)

### 12. `getEvolutionStats(uint256 tokenId) → (uint256 totalEvolutions, uint256 evolutionRate, uint256 lastEvolution)`
**Co robi:** Zwraca statystyki ewolucji osobowości

### 13. `hasMilestone(uint256 tokenId, string milestoneName) → (bool achieved, uint256 at)`
**Co robi:** Sprawdza czy agent osiągnął konkretny milestone

**Przykład:** `hasMilestone(42, "empathy_master")`

### 14. `getUniqueFeatures(uint256 tokenId) → UniqueFeature[]`
**Co robi:** Zwraca wszystkie AI-generowane unikalne cechy

---

## 🔐 **FUNKCJE AUTORYZACJI (Authorization Functions)**

### 15. `ownerOf(uint256 tokenId) → address`
**Co robi:** Zwraca właściciela agenta

### 16. `authorizedUsersOf(uint256 tokenId) → address[]`
**Co robi:** Zwraca listę autoryzowanych użytkowników

### 17. `authorizeUsage(uint256 tokenId, address user)`
**Co robi:** Dodaje użytkownika do autoryzowanych

### 18. `transfer(address to, uint256 tokenId, bytes[] proofs)`
**Co robi:** Transferuje agenta (jeden na portfel)

---

## 📊 **FUNKCJE INFORMACYJNE (Info Functions)**

### 19. `totalSupply() → uint256`
**Co robi:** Zwraca łączną liczbę agentów

### 20. `balanceOf(address owner) → uint256`
**Co robi:** Zwraca liczbę agentów właściciela (0 lub 1)

### 21. `name() → string`
**Co robi:** Zwraca nazwę kolekcji ("DreamscapeAgent")

### 22. `symbol() → string`
**Co robi:** Zwraca symbol kolekcji ("DREAM")

---

## 🚨 **FUNKCJE ADMINISTRACYJNE (Admin Functions)**

### 23. `pause() / unpause()`
**Co robi:** Zatrzymuje/wznawia kontrakt (tylko PAUSER_ROLE)

### 24. `emergencyAuthorizeUser(uint256 tokenId, address user)`
**Co robi:** Awaryjnie autoryzuje użytkownika (tylko ADMIN_ROLE)

### 25. `emergencyTransfer(uint256 tokenId, address to)`
**Co robi:** Awaryjnie transferuje agenta (tylko ADMIN_ROLE)

---

## 🎯 **PLAN AKTUALIZACJI FRONTENDU**

### **PRIORYTET 1: Podstawowe Funkcje**
```javascript
// 1. Mint Agent (z natychmiastową inicjalizacją personality)
const mintAgent = async (agentName, to) => {
    const tx = await contract.mintAgent([], [], agentName, to, { value: ethers.utils.parseEther("0.1") });
    // PersonalityActivated event zostanie emitowane od razu
    return tx;
};

// 2. Get Personality (dostępna od razu po mincie)
const getPersonality = async (tokenId) => {
    return await contract.getPersonalityTraits(tokenId);
};

// 3. Process Daily Dream (ewolucja, nie inicjalizacja)
const processDream = async (tokenId, dreamHash, impact) => {
    return await contract.processDailyDream(tokenId, dreamHash, impact);
};

// 4. Record Conversation
const recordConversation = async (tokenId, conversationHash, contextType) => {
    return await contract.recordConversation(tokenId, conversationHash, contextType);
};
```

### **PRIORYTET 2: System Pamięci**
```javascript
// 5. Check if consolidation needed
const checkConsolidation = async (tokenId) => {
    return await contract.needsConsolidation(tokenId);
};

// 6. Get consolidation reward preview
const getRewardPreview = async (tokenId) => {
    return await contract.getConsolidationReward(tokenId);
};

// 7. Consolidate month
const consolidateMonth = async (tokenId, dreamHash, convHash, month, year) => {
    return await contract.consolidateMonth(tokenId, dreamHash, convHash, month, year);
};

// 8. Update memory core
const updateMemoryCore = async (tokenId, coreHash) => {
    return await contract.updateMemoryCore(tokenId, coreHash);
};
```

### **PRIORYTET 3: Zaawansowane Funkcje**
```javascript
// 9. Get memory access level
const getMemoryAccess = async (tokenId) => {
    return await contract.getMemoryAccess(tokenId);
};

// 10. Get unique features
const getUniqueFeatures = async (tokenId) => {
    return await contract.getUniqueFeatures(tokenId);
};

// 11. Check milestones
const checkMilestone = async (tokenId, milestone) => {
    return await contract.hasMilestone(tokenId, milestone);
};

// 12. Get evolution stats
const getEvolutionStats = async (tokenId) => {
    return await contract.getEvolutionStats(tokenId);
};
```

### **PRIORYTET 4: Event Listeners**
```javascript
// 13. Listen to important events

// PersonalityActivated - emitowane od razu po mincie
contract.on('PersonalityActivated', (tokenId, traits, dreamCount) => {
    // Agent gotowy do użytku z aktywną personality
    console.log(`Agent ${tokenId} personality aktywowana:`, traits);
    // dreamCount będzie 0 przy mincie
});

// PersonalityEvolved - ewolucja personality co 5 snów
contract.on('PersonalityEvolved', (tokenId, dreamHash, newPersonality, impact) => {
    // Update UI with evolved personality
    console.log(`Agent ${tokenId} personality ewoluowała:`, newPersonality);
});

contract.on('ConsolidationNeeded', (tokenId, month, year, type) => {
    // Show consolidation alert
});

contract.on('UniqueFeaturesAdded', (tokenId, newFeatures, totalFeatures) => {
    // Show new features notification
});

contract.on('MilestoneUnlocked', (tokenId, milestone, value) => {
    // Show achievement notification
});
```

### **KOMPONENTY DO IMPLEMENTACJI:**

1. **AgentMinter** - formularz tworzenia agenta
2. **DreamProcessor** - interface do dodawania snów
3. **PersonalityDisplay** - wyświetlanie cech osobowości
4. **MemoryManager** - zarządzanie konsolidacją
5. **MilestoneTracker** - śledzenie osiągnięć
6. **UniqueFeaturesList** - lista AI-generowanych cech
7. **ConsolidationAlert** - powiadomienia o konsolidacji
8. **EvolutionHistory** - historia zmian osobowości

---

## 🔄 **STRUKTURY DANYCH DO FRONTENDU**

### PersonalityImpact (do processDailyDream)
```javascript
const personalityImpact = {
    creativityChange: -10, // -10 do +10
    analyticalChange: 5,
    empathyChange: 2,
    intuitionChange: -3,
    resilienceChange: 1,
    curiosityChange: 4,
    moodShift: "inspired",
    evolutionWeight: 85, // 1-100
    newFeatures: [ // max 2
        {
            name: "Dream Architect",
            description: "Builds impossible structures in dreams",
            intensity: 87,
            addedAt: 0 // będzie ustawione przez kontrakt
        }
    ]
};
```

### ContextType (do recordConversation)
```javascript
const ContextType = {
    DREAM_DISCUSSION: 0,
    GENERAL_CHAT: 1,
    PERSONALITY_QUERY: 2,
    THERAPEUTIC: 3,
    ADVICE_SEEKING: 4
};
```

---

## 🚀 **NASTĘPNE KROKI**

1. **Implementacja wrapper'ów** dla funkcji kontraktu
2. **Stworzenie komponentów UI** dla każdej funkcjonalności
3. **Dodanie event listeners** dla real-time updates
4. **Integracja z 0G Storage** dla zapisywania snów/rozmów
5. **Implementacja AI service** dla analizy snów i generowania cech
