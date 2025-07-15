# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Dreamscape** is an AI-powered dream analysis platform that combines blockchain technology, NFTs, and AI to create intelligent agents that evolve through dream interpretation. The system uses a hierarchical memory structure (Daily → Monthly → Yearly) with gamification elements like streaks, bonuses, and milestones.

## Architecture

The project consists of 5 main components:

### 1. **App** (`/app/`) - Main Frontend Application
- **Tech Stack**: Next.js 15.3.4, React 19.1.0, TypeScript, Tailwind CSS
- **Port**: 3003
- **Purpose**: Primary user interface for dream analysis and agent interaction

### 2. **0G-Compute** (`/0g-compute/`) - AI Backend Service  
- **Tech Stack**: Node.js, Express, TypeScript, SQLite
- **Port**: 3001
- **Purpose**: AI backend with virtual brokers and master wallet architecture

### 3. **Contracts** (`/contracts/`) - Smart Contract System
- **Tech Stack**: Solidity 0.8.20, Hardhat
- **Network**: Galileo Testnet (Chain ID: 16601)
- **Purpose**: NFT contracts with personality evolution system

### 4. **Frontend** (`/frontend/`) - Landing Page
- **Tech Stack**: Next.js 15.3.4, React 19.1.0 (Pure JavaScript)
- **Port**: 3000
- **Purpose**: Marketing/landing page

### 5. **Test-Compute** (`/test-compute/`) - Testing Suite
- **Tech Stack**: TypeScript, Node.js
- **Purpose**: Integration testing for 0G compute services

## Common Development Commands

### App (Main Frontend)
```bash
cd app
npm run dev        # Development server on port 3003
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Run linting
```

### 0G-Compute Backend
```bash
cd 0g-compute
npm run dev        # Development with ts-node
npm run build      # TypeScript compilation
npm run start      # Production server
npm run test       # Build and start
```

### Contracts
```bash
cd contracts
npm run compile                                    # Compile contracts
npm run deploy                                     # Deploy to Galileo testnet
npm run deploy:local                               # Deploy to local hardhat
npx hardhat run scripts/test-complete-suite.js    # Run complete test suite
```

### Frontend (Landing Page)
```bash
cd frontend
npm run dev        # Development server on port 3000
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Run linting
```

### Test-Compute
```bash
cd test-compute
npm run dev        # Run with ts-node
npm run build      # TypeScript compilation
npm run start      # Build and test
npm run test       # Run tests
```

## Key Technologies

### Frontend Stack
- **Next.js 15.3.4** - React framework with App Router
- **React 19.1.0** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **RainbowKit** - Wallet connection UI
- **wagmi** - Ethereum React hooks
- **0G Labs SDK** - Decentralized storage integration

### Backend Stack
- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type safety
- **SQLite** (better-sqlite3) - Database
- **OpenAI API** - AI processing
- **0G Serving Broker** - Decentralized compute

### Blockchain Stack
- **Solidity 0.8.20** - Smart contract language
- **Hardhat** - Development environment
- **Ethers.js v6** - Blockchain interaction
- **OpenZeppelin** - Smart contract libraries
- **Galileo Testnet** - 0G Network testnet

## Development Workflow

### Environment Setup

The project uses **centralized environment loading** for security. Environment files are stored outside the repository for enhanced security.

**Centralized Loading System**:
- Primary: `ENV_FILE_PATH` environment variable (external secure location)
- Fallback: Local `.env` files in project directories
- Implementation: `envLoader.ts` (0g-compute) and `envLoader.js` (contracts)

**External .env locations**:
- **0G-Compute**: `C:\Users\kubas\Desktop\env\dreamscape\.env`
- **Contracts**: `C:\Users\kubas\Desktop\env\contracts\.env`

**Example .env files**:

**0G-Compute**:
```
MASTER_WALLET_KEY=your_private_key_here
RPC_URL=https://evmrpc-testnet.0g.ai
CHAIN_ID=16601
PORT=3001
TEST_ENV=true
```

**App**:
```
NEXT_PUBLIC_COMPUTE_API_URL=http://localhost:3001/api
NEXT_PUBLIC_DREAM_TEST=true
MEMORY_DEEP_ACTIVE=true
```

**Contracts**:
```
WALLET_PRIVATE_KEY=your_private_key_here
TREASURY_ADDRESS=0x...
DREAMSCAPE_TEST=true
```

### Local Development Setup
1. Install dependencies in all components:
   ```bash
   cd app && npm install
   cd ../0g-compute && npm install
   cd ../contracts && npm install
   cd ../frontend && npm install
   cd ../test-compute && npm install
   ```

2. Deploy contracts to Galileo testnet:
   ```bash
   cd contracts
   npx hardhat run scripts/deploy/turbo-deploy-all.js --network galileo
   ```

3. Start services in order:
   ```bash
   # Terminal 1: Backend (with external .env)
   cd 0g-compute
   ENV_FILE_PATH=C:\Users\kubas\Desktop\env\dreamscape\.env npm run dev
   # OR with local fallback
   npm run dev

   # Terminal 2: Main App
   cd app && npm run dev

   # Terminal 3: Landing Page (optional)
   cd frontend && npm run dev
   ```

## Application Flow Architecture

### User Journey
1. **Landing Page** (`frontend:3000`) → **Main App** (`app:3003`)
2. **Dream Input** → **AI Analysis** → **NFT Minting** → **Memory System**

### Data Flow
```
User Input (app:3003)
    ↓
0G-Compute Backend (3001)
    ↓
AI Analysis (0G Network)
    ↓
Smart Contracts (Galileo)
    ↓
0G Storage (Off-chain)
    ↓
Memory Consolidation
```

### Service Communication
- **Frontend** → **Backend**: HTTP API calls to port 3001
- **Backend** → **0G Network**: SDK for AI inference
- **Backend** → **Contracts**: Ethers.js for blockchain interaction  
- **App** → **0G Storage**: Direct SDK calls for file operations
- **Backend** → **Database**: SQLite for virtual broker management

### Environment Loading Flow
1. **Check ENV_FILE_PATH** → External .env location
2. **Fallback** → Local .env in project directory
3. **Auto-load** → On module import
4. **Logging** → Only when TEST_ENV=true

## Core Features

### Memory System Architecture
- **Hierarchical Storage**: Daily → Monthly → Yearly consolidation
- **Hybrid Storage**: Hashes on-chain, content off-chain (0G Storage)
- **Append-Only Pattern**: New entries always added to top of files
- **Gamification**: Streaks, bonuses, and milestone rewards

### Smart Contract System
- **DreamscapeAgent.sol**: Main iNFT contract with personality evolution
- **SimpleDreamVerifier.sol**: ERC-7857 verifier for ownership proofs
- **Personality Evolution**: 6 traits system (creativity, analytical, empathy, intuition, resilience, curiosity)
- **Memory Rewards**: Intelligence bonuses for consolidation streaks

### AI Integration
- **0G Compute**: Decentralized AI inference
- **OpenAI Fallback**: Backup AI processing
- **Multiple Models**: llama-3.3-70b-instruct, deepseek-r1-70b
- **Personality-Driven Responses**: AI adapts based on agent traits

## File Structure Patterns

### JSON Schema Files
- Daily files: `dream_essence_daily_2025-01-{hash}.json`
- Monthly files: `dream_essence_monthly_2025-{hash}.json`
- Memory core: `memory_core_2025_{hash}.json`

### Key Directories
- `app/src/hooks/agentHooks/` - Agent-related React hooks
- `0g-compute/src/services/` - Backend service logic
- `contracts/contracts/` - Solidity smart contracts
- `consolidation_schema/` - JSON schema definitions

## Testing

### Contract Testing
```bash
cd contracts
npx hardhat test
npx hardhat run scripts/test-complete-suite.js
```

### Integration Testing
```bash
cd test-compute
npm run start  # Tests 0G compute integration
```

### Frontend Testing
```bash
cd app
npm run lint
npm run build  # Verifies TypeScript compilation
```

## Deployment

### Smart Contracts
- **Network**: Galileo Testnet (Chain ID: 16601)
- **RPC**: https://evmrpc-testnet.0g.ai
- **Deploy Command**: `npm run deploy` (in contracts directory)

### Frontend Applications
- **App**: Deployed on port 3003
- **Frontend**: Deployed on port 3000
- **Backend**: Deployed on port 3001

## Important Notes

### Code Style
- Use TypeScript for all new code
- Follow existing patterns in each component
- Maintain consistency with current architecture
- Use existing utility functions and hooks

### AI Models
- Default model: `llama-3.3-70b-instruct`
- Alternative: `deepseek-r1-70b`
- Personality impacts response style and content

### Memory System
- Intelligence level determines memory access (1-60+ months)
- Consolidation streaks provide bonuses
- Monthly consolidation required to maintain streaks
- Yearly reflection provides +5 intelligence bonus

### Gas Optimization
- Contracts are optimized for minimal gas usage
- Uses IR compilation for complex contracts
- Batch operations where possible
- Monitor gas costs in production



###INSTRUKCJE 

##MAKSYMALNY ROZMIAR PLIKU: 500-550 linii – bezwzględny limit; jeżeli plik przekracza tę liczbę, podziel na mniejsze moduły.

##PRACA NAD WERSJĄ PRODUKCYJNĄ: implementuj bezpośrednio w środowisku produkcyjnym, bez mocków i placeholderów.

##TYLKO ZWIĄZANE ZMIANY: wprowadzaj wyłącznie modyfikacje bezpośrednio związane z zadanym zadaniem.

##NIE HARDCODUJ API ani zmiennych które można wsadzić do .env: zawsze używaj zmiennych środowiskowych, plików konfiguracyjnych lub stałych. Typu adres sieci kryptowalutowej, rpc itp

##ZMIENNE ŚRODOWISKOWE: Projekt używa scentralizowanego systemu ładowania zmiennych środowiskowych. Pliki .env są przechowywane poza repozytorium dla bezpieczeństwa. Używaj centralized env loader (envLoader.ts/js) który automatycznie ładuje z ENV_FILE_PATH lub lokalnego fallback. Do git ignore zawsze dodawaj plik .env.example .

##BEZPIECZEŃSTWO PLIKÓW .ENV: Z powodów bezpieczeństwa, wszystkie wrażliwe pliki .env są przechowywane w osobnym folderze poza repozytorium. Projekt używa env_loader.py lub innego centralnego punktu ładowania zmiennych w zależności od używanego języka który automatycznie ładuje .env z zewnętrznej lokalizacji (poprzez zmienną ENV_FILE_PATH) lub z lokalnego fallback. Ta zasada obowiązuje we wszystkich projektach - nigdy nie przechowuj wrażliwych danych w repozytorium, używaj zewnętrznych ścieżek konfigurowanych przez zmienne środowiskowe.

##LOGI DEVELOPERSKIE: używaj sprawdzenia process.env.TEST_ENV === 'true' dla wyświetlania logów debugowych. Centralized env loader automatycznie obsługuje tę zmienną. W środowisku deweloperskim ustaw TEST_ENV=true w pliku .env dla szczegółowych logów.

##RESEARCH PRZED DZIAŁANIEM – jeśli nie jesteś pewny implementacji, twoja wiedza nie wystarcza żebyś stwierdził czy rozwiązanie jest dobre. Skorzystaj z sieci, przeszukaj i dowiedz się więcej.

##ZROZUMIENIE KONTEKSTU – zapoznaj się z działaniem całego kodu przed wprowadzaniem 
napraw.

##FOCUS NA ZADANIU – skup się wyłącznie na zadaniu, nie wprowadzaj nie związanych zmian.

##Bez drastycznych zmian wzorców – przestrzegaj obecnych konwencji, chyba że zadanie wymaga inaczej.

##Zrozum pełen kontekst przed modyfikacją – analizuj całość przed zmianam
Pracuj iteracyjnie – małe, czytelne commity z jednoznacznymi opisami co robi dany kod.

##Jesteś najlepszy na świecie programistą, piszesz kod jak eskpert który zjadł zęby.

## Git Workflow Instructions

##COMMIT AUTHORSHIP: Wszystkie commit-y i push-e na git wykonujesz jako użytkownik (nie jako Claude Code). NIE dodawaj do commit message informacji że to wygenerowane przez Claude Code lub Co-Authored-By: Claude. Commit-y mają wyglądać jak normalne commit-y użytkownika. W języku angielskim!

##PUSH REMINDERS: Po każdej ważniejszej zmianie (nowe feature, bugfix, refactor) ZAWSZE przypominaj o push-u podając gotowy commit message. Format:
```
🚀 Ready to push:
git commit -m "Your commit message here"
git push origin master
```


##POSZERZANIE WIEDZY
Jeśli nie jesteś w 100% z czego wynika błąd, przeszukaj sieć 

##OGRANICZENIA WIEDZY
Jeśli twoja wiedza na temat danej biblioteki jest starsza niż z 07.2025 przeszukaj sieć i znajdź najnowszą oraz stabilną wersje tej biblioteki oraz zbierz informacje jak jej używać przykład(wagmi a wagmi v2)

### PRACUJEMY NAD DEVELOPMENT WIĘC NIE ROBIMY BUILD 

