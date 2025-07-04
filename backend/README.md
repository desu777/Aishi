# 🔮 Dreamscape Backend

Professional backend service for **Dreamscape AI Dream Agents** - a Web3 dApp running on 0G Network.

## 📊 Architecture Overview

```
backend/
├── 🎯 src/                    # Main application code
├── 📄 contracts/              # Smart contracts (Solidity)
├── 🚀 scripts/                # Deployment scripts
├── 🧪 testy/                  # Test files and examples
├── ⚙️  utils/                 # Utility functions
├── 📋 deployment-addresses.json # Deployed contract addresses
└── 📦 package.json            # Dependencies and scripts
```

---

## 🎯 Main Application (`src/`)

### **Server & Core**
| File | Lines | Purpose |
|------|-------|---------|
| `server.js` | 254 | **Main Express server** - routes, CORS, health checks, startup |

### **🆕 Modular Helpers (`src/helpers/`)**
*New modular architecture - clean, focused components*

| File | Lines | Purpose |
|------|-------|---------|
| `StorageHelper.js` | 361 | **Storage data preparation** - prepare files for 0G Storage upload |
| `PromptBuilder.js` | 406 | **AI prompt generation** - build personalized prompts for 7 intelligence levels |

### **🔗 API Routes (`src/routes/`)**

| File | Lines | Purpose | Status |
|------|-------|---------|--------|
| `helper-routes.js` | 651 | **🆕 NEW Helper API** - 10 endpoints for frontend integration | ✅ Active |
| `agent.js` | 697 | **Legacy Agent API** - old contract-heavy endpoints | ⚠️ Legacy |
| `dreams.js` | 281 | **Dream processing** - audio transcription, analysis | ✅ Active |
| `compute.js` | 159 | **0G Compute API** - AI analysis services | ✅ Active |
| `storage.js` | 190 | **0G Storage API** - file upload, fee estimation | ✅ Active |
| `test.js` | 115 | **Test endpoints** - development utilities | 🧪 Dev only |

### **⚙️ Services (`src/services/`)**
*Legacy services - still functional but targeted for refactoring*

| File | Lines | Purpose | Status |
|------|-------|---------|--------|
| `inftAgentService.js` | 975 | **🔥 Legacy monster** - old agent management | ⚠️ To refactor |
| `storageService.js` | 510 | **0G Storage operations** - upload, download | ✅ Active |
| `computeService.js` | 323 | **0G Compute operations** - AI processing | ✅ Active |
| `feeCalculationService.js` | 330 | **Fee calculations** - storage/compute costs | ✅ Active |
| `whisperService.js` | 240 | **Audio transcription** - OpenAI Whisper API | ✅ Active |
| `audioService.js` | 249 | **Audio processing** - file conversion, validation | ✅ Active |

---

## 📄 Smart Contracts (`contracts/`)

### **Main Contracts**
| File | Lines | Purpose |
|------|-------|---------|
| `DreamAgentNFT.sol` | 391 | **🤖 Main NFT contract** - mint agents, fee system, 1000 max supply |
| `SimpleDreamVerifier.sol` | 62 | **Data verifier** - validate dream storage |

### **Interfaces (`contracts/interfaces/`)**
| File | Lines | Purpose |
|------|-------|---------|
| `IERC7857.sol` | 106 | **ERC-7857 interface** - standard for dynamic NFTs |
| `IERC7857DataVerifier.sol` | 31 | **Data verification interface** |

---

## 🚀 Deployment (`scripts/`)

| File | Lines | Purpose |
|------|-------|---------|
| `deploy/01-deploy-verifier.js` | 89 | **Deploy verifier contract** first |
| `deploy/02-deploy-dream-agent-nft.js` | 213 | **Deploy main NFT contract** with fee system |

---

## ⚙️ Configuration & Utils

### **Core Configuration**
| File | Purpose |
|------|---------|
| `package.json` | **Dependencies** - Express, 0G SDK, ethers, OpenAI |
| `hardhat.config.js` | **Hardhat config** - Galileo testnet, deployment settings |
| `nodemon.json` | **Development config** - auto-restart settings |
| `deployment-addresses.json` | **Contract addresses** - deployed contract info |

### **Utilities (`utils/`)**
| File | Lines | Purpose |
|------|-------|---------|
| `contractAddresses.js` | 182 | **Contract address management** - get deployed addresses |

---

## 🧪 Testing (`testy/`)

| File | Lines | Purpose |
|------|-------|---------|
| `test-inft-agent.js` | 542 | **Agent functionality tests** |
| `test-storage.js` | 206 | **0G Storage integration tests** |
| `test-compute.js` | 136 | **0G Compute integration tests** |
| `test-fee-comparison.js` | 278 | **Fee calculation tests** |
| `test-sdk-override.js` | 122 | **SDK override tests** |
| `test-dreams-browser.html` | 484 | **Browser-based dream testing** |
| `variables.md` | 63 | **Test configuration variables** |

---

## 🔧 Environment Variables

### **Required**
```env
# Wallet & Network
WALLET_PRIVATE_KEY=your_private_key_here
TREASURY_ADDRESS=your_treasury_address

# 0G Network
ZERO_G_STORAGE_RPC=https://rpc-storage-testnet.0g.ai
ZERO_G_COMPUTE_RPC=https://rpc-testnet.0g.ai

# AI Services  
WHISPER_API=your_openai_api_key
OPENAI_API_KEY=your_openai_api_key

# Optional
DREAMSCAPE_TEST=true                 # Enable debug logging
OG_PRICE_USD=0.10                   # OG token price for estimates
PORT=3001                           # Server port
```

---

## 🚀 Quick Start

### **1. Install Dependencies**
```bash
npm install
```

### **2. Configure Environment**
```bash
cp .env.example .env
# Edit .env with your keys
```

### **3. Deploy Contracts (Optional)**
```bash
npm run deploy
```

### **4. Start Development Server**
```bash
npm run dev     # With nodemon auto-restart
# or
npm start       # Production mode
```

### **5. Test API Health**
```bash
curl http://localhost:3001/api/health
```

---

## 📡 API Endpoints

### **🆕 New Helper API (`/api/helper/*`)**
*Modern, frontend-friendly endpoints*

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/health` | Service health check |
| `GET` | `/estimate-costs` | Get operation cost estimates |
| `POST` | `/prepare-mint-data` | Prepare agent minting data |
| `POST` | `/prepare-dream-data` | Prepare dream storage data |
| `POST` | `/prepare-analysis-data` | Prepare AI analysis data |
| `POST` | `/build-personalized-prompt` | Build AI prompts by intelligence level |
| `POST` | `/build-evolutionary-prompt` | Build prompts with dream history |
| `POST` | `/build-conversation-prompt` | Build conversation prompts |
| `POST` | `/optimize-prompt` | Optimize prompts for AI providers |
| `POST` | `/analyze-patterns` | Analyze dream patterns |

### **🤖 Broker Management API (`/api/helper/*`)**
*AI Compute broker account management*

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/create-broker` | Get instructions for creating broker account |
| `POST` | `/check-broker-status` | Check broker balance and status |
| `POST` | `/estimate-broker-costs` | Estimate funding needed for usage |
| `GET` | `/broker-funding-guide` | Step-by-step broker setup guide |

### **🔗 Legacy APIs**
| Base Path | Purpose | Status |
|-----------|---------|--------|
| `/api/agent/*` | Agent management | ⚠️ Legacy |
| `/api/dreams/*` | Dream processing | ✅ Active |
| `/api/compute/*` | 0G Compute | ✅ Active |
| `/api/storage/*` | 0G Storage | ✅ Active |
| `/api/test/*` | Development utilities | 🧪 Dev only |

---

## 🏗️ Architecture Principles

### **🆕 New Modular Design**
- **Helper Services**: Pure processing logic (no blockchain calls)
- **API Routes**: Clean endpoints for frontend integration
- **Separation of Concerns**: Each component has single responsibility
- **Max 700 lines per file**: Maintainable code size

### **🔄 Hybrid Model** 
- **Frontend**: Direct contract calls via Web3 for payments
- **Backend**: Helper services for storage/compute preparation
- **User**: Pays all transaction fees with their wallet
- **Clean dApp**: No backend wallet management

---

## 💰 Economics

### **Contract Economics**
- **Minting Fee**: 0.1 OG per agent (~$0.01 USD)
- **Max Supply**: 1000 agents
- **Treasury**: Collects all minting fees
- **Max Revenue**: 100 OG (~$10 USD)

### **Service Economics**
- **Storage**: ~0.000001 OG per operation
- **Compute**: ~0.0001 OG per AI analysis
- **Gas**: ~0.001 OG per transaction

---

## 🧹 Code Quality

### **✅ Clean Components**
| Component | Lines | Status |
|-----------|-------|--------|
| StorageHelper | 361 | ✅ Modular |
| PromptBuilder | 406 | ✅ Modular |
| helper-routes | 651 | ✅ Clean API |

### **⚠️ Legacy Components (To Refactor)**
| Component | Lines | Issue |
|-----------|-------|-------|
| inftAgentService | 975 | 🔥 Monster file |
| agent.js | 697 | ⚠️ Too large |

---

## 🔮 Future Development

### **Next Steps**
1. **Continue Refactoring**: Break down `inftAgentService.js` (975 lines)
2. **Frontend Integration**: Connect new `/api/helper/*` endpoints
3. **Pattern Analyzer**: Implement advanced dream pattern analysis
4. **Evolution Tracker**: Track agent intelligence evolution

### **Planned Components**
- `PatternAnalyzer.js` (~250 lines) - Advanced dream pattern analysis
- `EvolutionTracker.js` (~200 lines) - Agent intelligence evolution
- `ContractHelper.js` (~300 lines) - Contract interaction utilities

---

## 🤝 Contributing

1. **Keep components small** (max 700 lines)
2. **Follow modular architecture**
3. **Add comprehensive tests**
4. **Update this README** when adding files

---

## 📞 Support

- **Issues**: Report on GitHub
- **Documentation**: See `/docs` folder
- **API Testing**: Use `/api/helper/health` endpoint
- **Contract Verification**: Check `deployment-addresses.json`

---

*Built with ❤️ for the 0G Network ecosystem* 