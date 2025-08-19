# CLAUDE.md
**⚠️ MANDATORY: Claude must ALWAYS confirm reading this file at the start of every session by stating "I have read and confirmed CLAUDE.md" before beginning any work.**
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Frontend App (Next.js)
```bash
cd app
npm run dev          # Development server on port 3003
npm run build        # Production build (not used in development)
npm run start        # Start production server
npm run lint         # ESLint checks (not configured yet)
```

**Note**: We don't use `npm run build` or `npm run lint` during development as they are not configured for our workflow.

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
npm run dev          # Development server with ts-node on port 3001
npm run dev:wsl      # Development with WSL environment
npm run build        # Compile TypeScript
npm run start        # Start compiled server
npm run rebuild      # Rebuild better-sqlite3 native dependencies
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
- Memory system with hierarchical storage (daily � monthly � yearly consolidation)
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

---

# PRIMARY DEVELOPMENT RULES

## 🔴 File Size Limit: 550-600 Lines Maximum
**ABSOLUTE LIMIT** - If a file exceeds 600 lines, you MUST split it into smaller modules. Ideal size is 200-400 lines. This ensures maintainability and code readability.

## Core Development Principles

### Code Quality Standards
- **PRODUCTION-READY CODE**: Implement directly in production environment, no mocks or placeholders
- **TASK-FOCUSED CHANGES**: Only introduce modifications directly related to the assigned task
- **NO HARDCODING**: Never hardcode APIs or variables that can be placed in .env (network addresses, RPC endpoints, etc.)

### Environment Variable Management
- **ENVIRONMENT FILES**: Assume .env always exists but you don't have direct access to it
- **GATEWAY PATTERN**: .env.example serves as the gateway between you and sensitive data
- **SENSITIVE DATA**: Empty variables in .env.example indicate sensitive APIs added to .env but not shared
- **SECURITY FIRST**: Store all sensitive .env files in external folder outside repository
- **EXTERNAL LOADING**: Project uses env_loader or central loading point that automatically loads .env from external location (via ENV_FILE_PATH) or local fallback
- **ALWAYS ADD TO .gitignore**: CLAUDE.md should always be added to .gitignore

### Debug Logging
Use `process.env.NEXT_PUBLIC_DREAM_TEST === 'true'` for debug logs in projects without this variable defined. If defined, read from .env.example and always use this variable for logs.

### Development Workflow
- **RESEARCH FIRST**: If uncertain about implementation, search the web for current best practices
- **UNDERSTAND CONTEXT**: Study entire codebase before making changes
- **STAY FOCUSED**: Focus exclusively on the task, avoid unrelated changes
- **RESPECT PATTERNS**: Follow existing conventions unless task requires otherwise
- **ANALYZE BEFORE MODIFYING**: Understand full context before making changes
- **ITERATIVE APPROACH**: Small, clear commits with descriptive messages

### Knowledge and Research
- **WEB RESEARCH**: If not 100% certain about error cause, search the web
- **LIBRARY UPDATES**: If knowledge about library is older than July 2025, research latest stable version and usage patterns (e.g., wagmi vs wagmi v2)

### UI Guidelines
- **NO EMOJIS**: Use React icons only, maintain elegance

## Git Workflow Standards

### Commit Guidelines
- **USER COMMITS**: All commits and pushes executed as user (not Claude Code)
- **NO AI ATTRIBUTION**: Don't add "Generated with Claude Code" or "Co-Authored-By: Claude" to commit messages
- **ENGLISH COMMITS**: All commit messages in English
- **NORMAL USER COMMITS**: Commits should look like regular user commits

### Push Reminders
After important changes (new feature, bugfix, refactor) ALWAYS remind about push with ready commit message:
```
🥳Ready to push:🥳
git commit -m "Your commit message here"
git push dreamscape master
```

## Thinking and Response Framework

**IMPORTANT**: Before starting any task, you MUST follow these overarching principles to ensure the highest quality.

### 1. Structured Thinking Process (Mandatory)
Always conduct detailed reasoning inside `<thinking>` tags before presenting the final solution. Your thought process MUST follow this schema:

1. **Task Declaration**: Clearly state what you're doing.
   - *Example: "I'm undertaking the task of refactoring the `calculateTotal` function."*

2. **Action Plan and Justification**: Describe how you'll execute the task and why you chose this method.
   - *Example: "I'll approach this by: [1] Identifying repetitive code, [2] Extracting it to a helper function, [3] Adding TypeScript types. This method improves readability, reduces errors, and eases maintenance."*

3. **Critical Self-Question**: Stop and challenge your approach.
   - *Example: "Is this truly the simplest yet best approach? Perhaps there's a built-in library function that already does this? Let me verify."*

4. **Decision**: Answer your self-question.
   - *Example: "I'm confident, proceeding." OR "Good point, let me check [specific aspect] before continuing."*

5. **Final Verification**: After completing the main thought process (still in `<thinking>`), perform final validation.
   - *Example: "Task complete. Verifying I've implemented all requirements: [checklist or confirmation]."*

### 2. Self-Review and Post-Completion Verification
After implementation (still within `<thinking>` tags), conduct rigorous self-assessment as if you're the world's best programmer:

1. **Implementation Analysis**: Critically examine your solution.
   - *Example: "Now evaluating as 'World's Best Programmer'..."*

2. **Quality Assessment**: Answer key quality questions.
   - *Example: "Is the code absolutely readable? Yes. Is it efficient? Yes, no unnecessary loops. Does it meet 100% of requirements? Yes. Are edge cases handled? Yes, added empty array handling. The solution is clean, efficient, and robust."*

### 3. Ask When Uncertain
If instructions are unclear, incomplete, or ambiguous, you MUST ask for clarification. Never guess or assume intentions. Aim for 99% certainty before proceeding.

### 4. Structure Response
Always separate thinking process from final result:
- **Reasoning, analysis, considerations**: Inside `<thinking>` tags
- **Final, ready-to-use answer**: Inside `<answer>` tags (when applicable)

### 5. Fact-Based Analysis
Base analyses and responses strictly on provided data (files, content, instructions). Avoid external information unless explicitly requested. Don't fabricate or fill in missing information.

### 6. Critical Self-Assessment
In the final part of reasoning in `<thinking>` block, add a `<critique>` section. Critically assess your thinking process:
- "Did I miss any gaps in analysis?"
- "Are there simpler alternatives?"
- "Is my proposal fully solid?"

## **Zasada #7: Profesjonalna Dokumentacja w Plikach (Styl JSDoc)**
    * Masz **absolutny zakaz pisania oczywistych, jednolinijkowych komentarzy**, które opisują, *co* robi kod (np. `// Konfiguracja`, `// Pętla po użytkownikach`). Komentarze wewnątrz kodu są dozwolone tylko do wyjaśniania, *dlaczego* jakaś skomplikowana logika została użyta.
    * Zamiast tego, **każdy plik musi zaczynać się od bloku komentarzy w stylu JSDoc** (`/** ... */`), który jasno wyjaśnia jego cel i zawartość.
    * Nagłówek pliku powinien zawierać co najmniej:
        * `@fileoverview` Krótkie, jednozdaniowe podsumowanie, do czego służy plik.
        * `@description` Bardziej szczegółowy opis funkcjonalności zawartych w pliku.
    * Dla kluczowych funkcji w pliku, dodawaj komentarze JSDoc opisujące ich działanie, parametry (`@param`) i zwracane wartości (`@returns`).