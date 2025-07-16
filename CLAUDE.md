# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Frontend App (Next.js)
```bash
cd app
npm run dev          # Development server on port 3003
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint checks
```

### Smart Contracts (Hardhat)
```bash
cd contracts
npm run compile      # Compile Solidity contracts
npm run compile:wsl  # Compile with WSL environment
npm run deploy       # Deploy to Galileo testnet
npm run deploy:local # Deploy to local hardhat network
npm run test:complete # Run complete test suite
```

### 0G Compute Backend
```bash
cd 0g-compute
npm run dev          # Development server with ts-node
npm run dev:wsl      # Development with WSL environment
npm run build        # Compile TypeScript
npm run start        # Start compiled server
```

## Project Architecture

### High-Level Structure
This is a full-stack Web3 application built around AI agent NFTs with personality evolution and memory systems. The project consists of three main components:

1. **Smart Contracts** (`contracts/`) - Solidity contracts implementing ERC7857 iNFT standard with personality evolution
2. **Frontend App** (`app/`) - Next.js React application with agent dashboard and interaction UI
3. **0G Compute Backend** (`0g-compute/`) - TypeScript service for AI processing using 0G Network infrastructure

### Smart Contract System
- **DreamscapeAgent.sol** - Main NFT contract with personality traits and evolution mechanics
- **SimpleDreamVerifier.sol** - Data verification for dream and conversation content
- Implements personality evolution through daily dream processing and conversation recording
- Memory system with hierarchical storage (daily → monthly → yearly consolidation)
- Gamification with intelligence rewards, streaks, and milestones

### Frontend Architecture
- **Agent Dashboard** (`app/src/agent_dashboard/`) - Terminal-style command interface for agent interaction
- **Commands System** - Modular command processor with mint, info, stats, status, memory commands
- **Hooks Architecture** (`app/src/hooks/agentHooks/`) - Custom React hooks for agent interactions:
  - `useAgentDream.ts` - Dream processing and analysis
  - `useAgentConsolidation.ts` - Memory consolidation workflows
  - `useAgentMemoryCore.ts` - Long-term memory management
  - `useAgentChat.ts` - Agent conversation handling
- **0G Storage Integration** (`app/src/lib/0g/`) - File upload/download for off-chain memory storage

### Memory System Architecture
The system implements a hierarchical memory structure:
- **Daily Files** - Individual dreams and conversations stored as JSON
- **Monthly Consolidation** - AI-processed summaries with personality insights
- **Yearly Memory Core** - Long-term personality evolution and relationship analysis
- Storage uses hybrid approach: content hashes on-chain, actual data in 0G Network

### Key Technologies
- **Blockchain**: Ethereum-compatible (0G Network Galileo testnet)
- **Storage**: 0G Network decentralized storage
- **AI Processing**: 0G Compute Network for personality analysis
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Wallet**: RainbowKit + Wagmi for Web3 connectivity

## Important Implementation Details

### Environment Setup
All components use dual environment configurations for Windows/WSL development:
- Environment files located outside repository in `/mnt/c/Users/kubas/Desktop/env/`
- Scripts automatically detect environment and use appropriate configurations

### Agent Dashboard Commands
The terminal interface supports:
- `mint <name>` - Create new agent NFT with random personality
- `info [id]` - Display agent personality traits and response style
- `stats [id]` - Show intelligence level, dreams, conversations
- `status [id]` - Current memory state and consolidation alerts
- `memory [id]` - Access to memory hierarchy and consolidation tools

### Testing Strategy
Comprehensive test suite in `contracts/docs/TESTING_GUIDE.md` covers:
- Personality-based agent minting
- Daily dream evolution with 24h cooldowns
- Conversation recording and context awareness
- Memory consolidation workflows
- Milestone achievement and analytics

### File Naming Conventions
Memory files follow specific patterns:
- Daily dreams: `dream_essence_daily_YYYY-MM-{hash}.json`
- Daily conversations: `conversation_essence_daily_YYYY-MM-{hash}.json`
- Monthly summaries: `dream_essence_monthly_YYYY-{hash}.json`
- Memory cores: `memory_core_YYYY_{hash}.json`

## Development Workflow

1. **Smart Contract Changes**: Test with `npm run test:complete` before deployment
2. **Frontend Development**: Use agent dashboard commands to test agent interactions
3. **Memory System**: Follow append-only pattern for daily files, newest entries first
4. **0G Integration**: Verify storage uploads/downloads through dashboard interface
5. **Personality Evolution**: Test dream processing maintains trait bounds (0-100)

This system creates meaningful, evolving relationships between users and AI agents while maintaining technical efficiency and blockchain economics.


###INSTRUKCJE 

##MAKSYMALNY ROZMIAR PLIKU: 500-550 linii – bezwzględny limit; jeżeli plik przekracza tę liczbę, podziel na mniejsze moduły.

##PRACA NAD WERSJĄ PRODUKCYJNĄ: implementuj bezpośrednio w środowisku produkcyjnym, bez mocków i placeholderów.

##TYLKO ZWIĄZANE ZMIANY: wprowadzaj wyłącznie modyfikacje bezpośrednio związane z zadanym zadaniem.

##NIE HARDCODUJ API ani zmiennych które można wsadzić do .env: zawsze używaj zmiennych środowiskowych, plików konfiguracyjnych lub stałych. Typu adres sieci kryptowalutowej, rpc itp

##ZMIENNE ŚRODOWISKOWE: przyjmij, że plik .env zawsze istnieje, ale nie masz do niego bezpośredniego dostępu. Plik .env.example stanowi bramę między tobą a mną. Jeśli w tym pliku znajduje się pusta zmienna, to znaczy że to wrażliwe API które dodałem do pliku .env ale tutaj nie udostępniłem. Jeśli tworzysz kod i zawiera odczyt z .env dodawaj do pliku .env.example. CLAUDE.md zawsze dodawaj do .gitignore!

##BEZPIECZEŃSTWO PLIKÓW .ENV: Z powodów bezpieczeństwa preferujemy przechowywanie wszystkich wrażliwych plików .env w osobnym folderze poza repozytorium. Projekt używa env_loader.py lub innego centralnego punktu ładowania zmiennych w zależności od używanego języka który automatycznie ładuje .env z zewnętrznej lokalizacji (poprzez zmienną ENV_FILE_PATH) lub z lokalnego fallback. Choć można używać .env lokalnie, zawsze preferujemy external path ze względów bezpieczeństwa. Ta zasada obowiązuje we wszystkich projektach - nigdy nie przechowuj wrażliwych danych w repozytorium, używaj zewnętrznych ścieżek konfigurowanych przez zmienne środowiskowe.

##LOGI DEVELOPERSKIE: używaj sprawdzenia process.env.TEST_ENV === 'true' dla wyświetlania logów debugowych dla projektów które nie mają zdefiniowanej tej zmiennej. Jeśli mają odczytaj z .env.example i zawsze stosuj tą zmienną do logów.

##RESEARCH PRZED DZIAŁANIEM – jeśli nie jesteś pewny implementacji, twoja wiedza nie wystarcza żebyś stwierdził czy rozwiązanie jest dobre. Skorzystaj z sieci, przeszukaj.

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

###NIE UŻYWAJ EMOTEK TYLKO IKONY REACT MA BYĆ ELEGANCJA ZACHOWANA

