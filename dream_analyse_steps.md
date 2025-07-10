# 🌙 Dream Analysis Steps - Implementation Documentation

## Przegląd Implementacji

System analizy snów składa się z dwóch głównych kroków: wprowadzania snu przez usera oraz budowania kompletnego kontekstu do analizy na podstawie danych z blockchain'a i hierarchicznej pamięci agenta.

---

## 🎯 STEP 1: Dream Input

### Implementacja
- **Plik:** `app/src/app/agent-test/components/DreamAnalysisSection.tsx`
- **Hook:** `app/src/hooks/agentHooks/useAgentDream.ts`

### Funkcjonalności
```typescript
// Pole tekstowe do wprowadzania snu
<textarea
  value={dreamText}
  onChange={handleDreamInputChange}
  placeholder="Tell me about your dream..."
/>

// Debug logging z NEXT_PUBLIC_DREAM_TEST=true
const debugLog = (message: string, data?: any) => {
  if (process.env.NEXT_PUBLIC_DREAM_TEST === 'true') {
    console.log(`[DreamAnalysis] ${message}`, data || '');
  }
};
```

### Features
- ✅ **Textarea z placeholder** zachęcającym do opisania snu
- ✅ **Licznik znaków** w prawym dolnym rogu
- ✅ **Debug logi** tylko przy `NEXT_PUBLIC_DREAM_TEST=true`
- ✅ **Walidacja** - wymaga agenta do działania
- ✅ **Responsive design** zgodny z stylem projektu
- ✅ **Real-time state management** przez useAgentDream hook

---

## 🧠 STEP 2: Context Building

### Architektura
```
User Dream Input
      ↓
DreamContextBuilder
      ↓
┌─────────────────┬─────────────────┬─────────────────┐
│   Contract      │  Memory Access  │   Storage       │
│   Data Fetch    │  Level Check    │   Download      │
└─────────────────┴─────────────────┴─────────────────┘
      ↓
Unified Dream Context
```

### Główne Komponenty

#### 1. DreamContextBuilder Service
**Plik:** `app/src/hooks/agentHooks/services/dreamContextBuilder.ts`

```typescript
export class DreamContextBuilder {
  async buildContext(
    tokenId: number,
    userDream: string,
    downloadFile: (hash: string) => Promise<DownloadResult>
  ): Promise<DreamContext>
}
```

#### 2. useAgentDream Hook
**Plik:** `app/src/hooks/agentHooks/useAgentDream.ts`

```typescript
export function useAgentDream() {
  return {
    dreamText,
    isLoadingContext,
    contextStatus,
    builtContext,
    buildDreamContext
  };
}
```

### Contract ABI Functions Used

#### Parallel Data Fetching
```typescript
const [agentData, personalityTraits, memoryAccess, uniqueFeatures, responseStyle, memoryStructure] = 
  await Promise.all([
    contract.agents(tokenId),                    // Podstawowe dane agenta
    contract.getPersonalityTraits(tokenId),     // 6 cech osobowości + mood
    contract.getMemoryAccess(tokenId),          // Głębokość dostępu do pamięci
    contract.getUniqueFeatures(tokenId),        // AI-generated unique traits
    contract.responseStyles(tokenId),           // Styl odpowiedzi agenta
    contract.getAgentMemory(tokenId)            // Struktura hierarchicznej pamięci
  ]);
```

### Memory Access Levels

Oparte na `intelligenceLevel` agenta:

| Intelligence Level | Months Accessible | Memory Depth | Access Description |
|-------------------|-------------------|--------------|-------------------|
| **1-2** | 1 | "current month only" | Tylko bieżący miesiąc |
| **3-5** | 3 | "quarterly" | Kwartalne wspomnienia |
| **6-11** | 6 | "half-year" | Półroczne wspomnienia |
| **12-23** | 12 | "annual" | Roczne wspomnienia |
| **24-35** | 24 | "2 years" | 2 lata historii |
| **36-47** | 36 | "3 years" | 3 lata historii |
| **48-59** | 48 | "4 years" | 4 lata historii |
| **60+** | 60 | "5 years complete archive" | Pełne archiwum |

### Historical Data Structure

#### Memory Hashes from Contract
```typescript
interface MemoryStructure {
  memoryCoreHash: string;           // Yearly core memories
  currentDreamDailyHash: string;    // Current month's dreams
  currentConvDailyHash: string;     // Current month's conversations
  lastDreamMonthlyHash: string;     // Last consolidated monthly dreams
  lastConvMonthlyHash: string;      // Last consolidated monthly conversations
  lastConsolidation: number;        // Timestamp of last consolidation
  currentMonth: number;             // Current month (1-12)
  currentYear: number;              // Current year (2024+)
}
```

#### Download Logic
```typescript
// 1. Check if hash is not empty (0x000...)
const emptyHash = '0x0000000000000000000000000000000000000000000000000000000000000000';

// 2. Download daily dreams (always if available)
if (memory.currentDreamDailyHash && memory.currentDreamDailyHash !== emptyHash) {
  const dailyResult = await downloadFile(memory.currentDreamDailyHash);
  // Parse JSON and add to result.dailyDreams
}

// 3. Download monthly consolidations (if months access > 1)
if (memory.lastDreamMonthlyHash && memory.lastDreamMonthlyHash !== emptyHash && monthsAccessible > 1) {
  const monthlyResult = await downloadFile(memory.lastDreamMonthlyHash);
  // Filter by accessible months and sort by newest first
}

// 4. Download yearly core (if months access >= 12)
if (memory.memoryCoreHash && memory.memoryCoreHash !== emptyHash && monthsAccessible >= 12) {
  const coreResult = await downloadFile(memory.memoryCoreHash);
  // Add to result.yearlyCore
}
```

### Storage Integration

#### useStorageDownload Hook
**Plik:** `app/src/hooks/storage/useStorageDownload.ts`

```typescript
const { downloadFile } = useStorageDownload();

// Usage in context builder
const downloadResult = await downloadFile(rootHash);
// Returns: { success: boolean; data?: ArrayBuffer; error?: string }
```

#### Download Configuration
- **Network:** 0G Storage (Turbo/Standard based on env)
- **Method:** API-first, fallback to SDK
- **Format:** JSON files with UTF-8 encoding
- **Error Handling:** Graceful degradation - continue with partial data

### JSON File Structures

#### Daily Dreams Format
```json
[
  {
    "id": 15,
    "timestamp": 1736908800,
    "content": "Today I dreamt of flying through a city made of crystal...",
    "emotions": ["wonder", "freedom", "joy"],
    "symbols": ["flying", "crystal_city", "rainbow"],
    "intensity": 8,
    "lucidity_level": 3,
    "dream_type": "adventure"
  }
]
```

#### Monthly Consolidations Format
```json
[
  {
    "month": 1,
    "year": 2025,
    "consolidation_date": 1738540800,
    "total_dreams": 31,
    "intelligence_gained": 8,
    "summary": "January was characterized by themes of freedom...",
    "dominant_themes": ["freedom and flight", "spiritual connection"],
    "personality_insights": {
      "creativity_boost": "high imaginative content"
    }
  }
]
```

### Unified Context Schema

```typescript
interface DreamContext {
  userDream: string;                    // User's current dream input
  agentProfile: {                       // Basic agent information
    name: string;
    intelligenceLevel: number;
    dreamCount: number;
    conversationCount: number;
  };
  personality: {                        // Current personality state
    creativity: number;                 // 0-100
    analytical: number;                 // 0-100
    empathy: number;                    // 0-100
    intuition: number;                  // 0-100
    resilience: number;                 // 0-100
    curiosity: number;                  // 0-100
    dominantMood: string;              // Current mood
    responseStyle: string;             // Communication style
  };
  uniqueFeatures: Array<{              // AI-generated traits
    name: string;
    description: string;
    intensity: number;                  // 1-100
    addedAt: number;                   // Timestamp
  }>;
  memoryAccess: {                      // Memory system info
    monthsAccessible: number;
    memoryDepth: string;
  };
  historicalData: {                    // Downloaded historical data
    dailyDreams: any[];                // Current month dreams
    monthlyConsolidations: any[];      // Past month summaries
    yearlyCore: any;                   // Yearly reflection
  };
}
```

---

## 🚀 STEP 3: Prompt Building & Language Detection

### Architektura
```
Unified Dream Context
      ↓
┌─────────────────────┬───────────────────┐
│ Language Detection  │  Prompt Builder   │
│ (ELD Library)       │  (useAgentPrompt) │
└─────────────────────┴───────────────────┘
      ↓
Dual-Format AI Prompt
(Full Analysis + 2x JSON)
```

### 1. Language Detection
**Plik:** `app/src/hooks/agentHooks/utils/languageDetection.ts`

Wprowadziliśmy zaawansowany system detekcji języka oparty na bibliotece **ELD (Efficient Language Detector)**, która jest szybka, dokładna i działa po stronie klienta.

**Funkcjonalności:**
- ✅ **Detekcja języka** ze snu użytkownika (60 języków, w tym polski).
- ✅ **Instrukcje dla AI** generowane w wykrytym języku (np. "Odpowiadaj w języku polskim").
- ✅ **Fallback do angielskiego** przy niepewnej detekcji, aby zapewnić stabilność.

```typescript
// app/src/hooks/agentHooks/utils/languageDetection.ts
import { eld } from 'eld';

export function detectAndGetInstructions(text: string): {
  language: string;
  instructions: string;
  detection: LanguageDetectionResult;
}
```

### 2. Updated DreamContext Schema
Kontekst został wzbogacony o wyniki detekcji języka, które są przekazywane do promptu.

```typescript
// app/src/hooks/agentHooks/services/dreamContextBuilder.ts
interface DreamContext {
  // ... (poprzednie pola)
  languageDetection: {
    detectedLanguage: string;
    languageName: string;
    confidence: number;
    isReliable: boolean;
    promptInstructions: string;
  };
  historicalData: { //...
};
```

### 3. Advanced Prompt Engineering
**Hook:** `app/src/hooks/agentHooks/useAgentPrompt.ts`

Prompt dla AI został gruntownie przebudowany, aby zapewnić bardziej strukturalne i przewidywalne odpowiedzi, kluczowe dla modeli takich jak Llama 3.1.

#### Kluczowe instrukcje w prompcie:

**a) Instrukcje Językowe i ID Snu:**
AI otrzymuje precyzyjne wytyczne dotyczące języka odpowiedzi i ID snu.
```
LANGUAGE DETECTION: Polish
IMPORTANT: Odpowiadaj w języku polskim

DREAM ID: This will be dream #16 (use exactly this number in the response)
```

**b) Struktura Odpowiedzi (Dwie Części):**
AI jest instruowane, aby najpierw wygenerować pełną, swobodną analizę, a następnie dostarczyć dwa bloki JSON.

```
RESPONSE STRUCTURE:
1. First provide a FULL PERSONALIZED ANALYSIS as my dream agent.
2. Then provide two JSON blocks:
```

**c) Dwa Formaty JSON:**
Wprowadzono dwa oddzielne bloki JSON, aby rozdzielić dane do wyświetlania w UI od danych do zapisu w storage.

**1. JSON do Wyświetlania w UI:**
```json
{
  "full_analysis": "<your entire detailed analysis here>"
}
```

**2. JSON do Zapisu w Storage (Esencja):**
```json
RESPONSE FORMAT (JSON):
{
  "analysis": "Brief essence of your analysis in maximum 2 sentences",
  "dreamData": {
    "id": 16,
    "timestamp": 1752173794,
    "content": "Brief summary of the dream",
    "emotions": ["emotion1", "emotion2"],
    // ...
  }
}
```
Jeśli `dreamCount % 5 == 0`, dodawany jest również obiekt `personalityImpact`.

### 4. UI Integration
**Plik:** `app/src/app/agent-test/components/DreamAnalysisSection.tsx`

Interfejs użytkownika teraz wyświetla wykryty język i poziom pewności detekcji, co ułatwia debugowanie.

```jsx
// Wyświetlanie wyniku detekcji w UI
<div style={{...}}>
  ✅ Language Detected: Polish (87%)
</div>
```

---

## 🤖 STEP 4: AI Analysis (NEW!)

### Architektura
```
Built Prompt
     ↓
0g-compute API (/analyze-dream)
     ↓
AI Model (Llama 3.3-70B)
     ↓
Parsed Response (Full Analysis + JSON)
```

### Implementacja
- **Hook:** `app/src/hooks/agentHooks/useAgentAI.ts`
- **API:** `0g-compute` backend na `http://localhost:3001/api/analyze-dream`
- **UI:** `app/src/app/agent-test/components/DreamAnalysisSection.tsx`

### Funkcjonalności

#### 1. useAgentAI Hook
```typescript
export function useAgentAI() {
  return {
    isLoading: boolean;
    error: string | null;
    aiResponse: AIResponse | null;
    parsedResponse: ParsedAIResponse | null;
    sendDreamAnalysis: (promptData, model) => Promise<ParsedAIResponse>;
    resetAI: () => void;
  };
}
```

#### 2. API Communication
- **Endpoint:** `POST /api/analyze-dream`
- **Payload:** `{ walletAddress, query, model }`
- **Response:** `{ success, data: { response, model, cost, responseTime, isValid } }`

#### 3. Response Parsing
- **Dual JSON Detection:** Automatyczne wyodrębnianie dwóch bloków JSON
- **Full Analysis:** Kompletna analiza do wyświetlenia w UI
- **Storage Data:** Strukturalne dane do zapisu w kontrakcie

#### 4. UI Features
- ✅ **Send to AI Button** - wysyłanie prompta do modelu
- ✅ **Loading State** - spinner podczas analizy
- ✅ **Error Handling** - wyświetlanie błędów API
- ✅ **Response Display** - pełna analiza + strukturalne dane
- ✅ **Evolution Detection** - różne wyświetlanie dla snów %5==0
- ✅ **Debug Logging** - szczegółowe logi z `NEXT_PUBLIC_DREAM_TEST=true`

### Przykładowa Odpowiedź AI

#### Dla Snu Regularnego (nie %5==0):
```json
{
  "full_analysis": "Your dream about flying represents...",
  "dreamData": {
    "id": 3,
    "timestamp": 1736908800,
    "content": "Dream about flying over city",
    "emotions": ["freedom", "joy"],
    "symbols": ["flying", "city"],
    "intensity": 7,
    "lucidity_level": 3,
    "dream_type": "adventure"
  },
  "analysis": "Brief 2-sentence summary"
}
```

#### Dla Snu Ewolucyjnego (%5==0):
```json
{
  "full_analysis": "Your 5th dream shows significant growth...",
  "dreamData": { /*...*/ },
  "personalityImpact": {
    "evolutionWeight": 75,
    "creativityChange": 5,
    "analyticalChange": -2,
    "empathyChange": 3,
    "intuitionChange": 7,
    "resilienceChange": 1,
    "curiosityChange": 4,
    "moodShift": "inspired",
    "newFeatures": [
      {
        "name": "Visionary Dreamer",
        "description": "Shows exceptional ability to envision future possibilities",
        "intensity": 85
      }
    ]
  },
  "analysis": "Brief 2-sentence summary"
}
```

### Environment Variables
```bash
# Required for API communication
NEXT_PUBLIC_COMPUTE_API_URL=http://localhost:3001/api

# Debug logging
NEXT_PUBLIC_DREAM_TEST=true
```

---

## 📝 Next Steps (Future)
- [ ] STEP 5: Contract write operations (processDailyDream)
- [ ] STEP 6: Historical data upload for testing
- [ ] Advanced error recovery mechanisms
- [ ] Model selection UI (Llama 3.3 vs DeepSeek R1)

---

## 🔧 Technical Dependencies

### Used Libraries & Hooks
```typescript
// Blockchain
import { Contract, ethers } from 'ethers';
import { getProvider, getSigner } from '../../lib/0g/fees';

// Storage
import { useStorageDownload } from '../storage/useStorageDownload';

// Wallet
import { useWallet } from '../useWallet';

// Contract ABI
import frontendContracts from '../../abi/frontend-contracts.json';
```

### Contract Address
```typescript
const contractAddress = frontendContracts.galileo.DreamscapeAgent.address;
// Current: 0xc8433d78E6a9BceFA384c6090C53e57FB6b84191
```

### Environment Variables Used
```bash
# Debug logging
NEXT_PUBLIC_DREAM_TEST=true

# 0G Network
NEXT_PUBLIC_L1_RPC=https://evmrpc-testnet.0g.ai

# Storage endpoints configured in useStorageDownload
```

---

## 🧪 Testing & Debug

### Debug Logging
Wszystkie komponenty mają debug logging z `NEXT_PUBLIC_DREAM_TEST=true`:

```typescript
const debugLog = (message: string, data?: any) => {
  if (process.env.NEXT_PUBLIC_DREAM_TEST === 'true') {
    console.log(`[useAgentDream] ${message}`, data || '');
  }
};
```

### Example Debug Output
```
[useAgentDream] Starting context building {tokenId: 1, dreamLength: 5}
[useAgentDream] Provider and signer connected 
[useAgentDream] Contract connected {address: '0xc8433d78E6a9BceFA384c6090C53e57FB6b84191'}
[useAgentDream] Contract data fetched {agentName: 'Victoria', intelligenceLevel: 1, monthsAccessible: 1}
[useAgentDream] Memory hashes from contract {memoryCoreHash: '0x000...', currentDreamDailyHash: '0x000...'}
[useAgentDream] Skipping daily dreams - hash is empty or null
[useAgentDream] Context building completed {agentName: 'Victoria', memoryDepth: 'current month only'}
```

### Error Handling
- **Wallet Connection:** Graceful error dla disconnected wallet
- **Contract Errors:** Detailed error messages z blockchain calls
- **Storage Errors:** Continue z partial data jeśli download fails
- **JSON Parsing:** Safe parsing z error catching

---

## 🎯 Current Status

### ✅ Completed Features
- [x] STEP 1: Dream input field z debug logging
- [x] STEP 2: Complete context building system
- [x] Contract integration z wszystkimi potrzebnymi ABI functions
- [x] Memory access level system based na intelligence
- [x] Historical data download z 0G Storage
- [x] Hash validation i empty hash detection
- [x] Unified context schema
- [x] Error handling i graceful degradation
- [x] Real-time UI feedback z loading states
- [x] Debug logging system
- [x] STEP 3: Prompt Building & Language Detection
- [x] STEP 4: AI Analysis z 0g-compute API integration

### 🔄 Tested Scenarios
- ✅ New agent z empty hashes (Victoria, Level 1)
- ✅ Memory access level calculation (1 month for Level 1)
- ✅ Hash validation (all 0x000... detected as empty)
- ✅ Context building z partial data
- ✅ UI feedback i error display
- ✅ Prompt building w różnych językach
- ✅ AI API communication z 0g-compute
- ✅ Dual JSON parsing (full analysis + storage data)
- ✅ Evolution detection dla snów %5==0

### 📝 Next Steps (Future)
- [ ] STEP 5: Contract write operations (processDailyDream)
- [ ] STEP 6: Historical data upload for testing
- [ ] Advanced error recovery mechanisms
- [ ] Model selection UI (Llama 3.3 vs DeepSeek R1)

---

## 🔗 File Structure

```
app/src/
├── app/agent-test/components/
│   └── DreamAnalysisSection.tsx          # Main UI component (STEP 1-4)
├── hooks/agentHooks/
│   ├── useAgentDream.ts                   # STEP 1-2: Dream input & context
│   ├── useAgentPrompt.ts                  # STEP 3: Prompt building
│   ├── useAgentAI.ts                      # STEP 4: AI API communication (NEW!)
│   ├── index.ts                           # Hook exports
│   ├── services/
│   │   └── dreamContextBuilder.ts        # Context building logic
│   └── utils/
│       └── languageDetection.ts          # Language detection
├── hooks/storage/
│   └── useStorageDownload.ts             # 0G Storage integration
├── lib/0g/
│   └── fees.ts                           # Provider/Signer utilities
└── abi/
    └── frontend-contracts.json           # Contract ABI
```

System jest w pełni funkcjonalny i gotowy do dalszego rozwoju w kierunku AI analysis i contract interactions. 