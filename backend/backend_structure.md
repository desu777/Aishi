backend/src/
├── helpers/                      # 🆕 Pure processing logic
│   ├── StorageHelper.js          # ~250 linii - Prepare files for upload
│   ├── PromptBuilder.js          # ~200 linii - Build AI prompts  
│   ├── PatternAnalyzer.js        # ~250 linii - Analyze dream patterns
│   └── EvolutionTracker.js       # ~200 linii - Track agent evolution
│
├── routes/
│   ├── helper-routes.js          # ~350 linii - Helper endpoints
│   ├── storage.js                # ~190 linii - Fee estimation only
│   └── compute.js                # ~159 linii - Service discovery only
│
└── services/                     # 🔄 Refactored to helpers
    ├── feeCalculationService.js  # ~330 linii - Cost estimation
    └── contractAddresses.js      # ~182 linie - Address utilities


    app/src/services/
├── userStorageService.ts         # Direct storage uploads (user pays)
├── userComputeService.ts         # Broker management (user pays)  
├── contractService.ts            # Smart contract calls (user pays gas)
└── dreamService.ts               # Orchestrates full flow


storage_helper:
✅ prepareMintData() - Przygotowanie danych do mintowania agenta
✅ prepareDreamData() - Przygotowanie snów do uploadu  
✅ prepareAnalysisData() - Przygotowanie analiz AI
✅ prepareConversationData() - Przygotowanie konwersacji
✅ generateInitial*() - Generowanie początkowych struktur danych
✅ calculateBufferHash() - Obliczanie hash'ów
✅ convertHashesToProofs() - Konwersja do formatu kontraktu
✅ estimateStorageCosts() - Estymacja kosztów

promptbuilder:
✅ buildPersonalizedPrompt() - Spersonalizowane prompty na podstawie poziomu inteligencji
✅ buildEvolutionaryPrompt() - Prompty z historią snów dla zaawansowanej analizy  
✅ buildConversationPrompt() - Prompty do rozmów z agentem
✅ getAnalysisFramework() - Ramki analizy dla 7 poziomów inteligencji
✅ analyzeHistoricalPatterns() - Analiza wzorców z historii snów
✅ optimizeForProvider() - Optymalizacja dla różnych AI (Llama, DeepSeek)
✅ estimateTokens() - Estymacja kosztów promptów

helper_routes:
✅ POST /api/helper/prepare-mint-data - Przygotowanie danych do mintowania
✅ POST /api/helper/prepare-dream-data - Przygotowanie snów do storage
✅ POST /api/helper/prepare-analysis-data - Przygotowanie analiz AI
✅ POST /api/helper/build-personalized-prompt - Budowanie promptów według poziomu
✅ POST /api/helper/build-evolutionary-prompt - Prompty z historią snów  
✅ POST /api/helper/build-conversation-prompt - Prompty do chatów
✅ POST /api/helper/optimize-prompt - Optymalizacja dla AI providers
✅ POST /api/helper/analyze-patterns - Analiza wzorców snów
✅ GET /api/helper/estimate-costs - Estymacja kosztów operacji
✅ GET /api/helper/health - Health check serwisu

