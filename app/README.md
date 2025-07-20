# 0G Dreamscape - Frontend Application

This is the frontend application for the 0G Dreamscape platform, built with Next.js 15, React 19, and TypeScript.

## Application Structure

```
app/
├── src/
│   ├── agent_dashboard/        # Terminal interface & command system
│   │   ├── commands/          # Command implementations (mint, info, stats, etc.)
│   │   └── components/        # Terminal UI components and workflows
│   │       ├── terminal/      # CleanTerminal and modular workflow components
│   │       └── ui/            # UI-specific components
│   │
│   ├── app/                   # Next.js 15 App Router pages
│   │   ├── agent-dashboard/   # Agent terminal interface page
│   │   ├── agent-test/        # Development testing interface
│   │   │   └── components/    # Test interface & dream analysis modules
│   │   │       ├── DreamAnalysisSection.tsx      # Main orchestrator (332 lines)
│   │   │       ├── DreamAnalysisTypes.ts         # Shared types & interfaces
│   │   │       ├── DreamAIAnalysis.tsx           # AI analysis & response display
│   │   │       ├── DreamContextBuilder.tsx       # Context preparation
│   │   │       ├── DreamPromptBuilder.tsx        # AI prompt generation
│   │   │       ├── DreamStorageManager.tsx       # Storage & contract processing
│   │   │       ├── DreamTextInput.tsx            # Dream input handling
│   │   │       ├── MemoryFileManager.tsx         # 0G Storage file operations
│   │   │       └── [other test components...]    # Additional test interface components
│   │   ├── api/               # API routes
│   │   ├── compute/           # 0G Compute interface page
│   │   ├── upload/            # File upload interface page
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Homepage
│   │
│   ├── components/            # Shared UI components
│   │   ├── layout/            # Application layout components
│   │   ├── ui/                # Reusable UI components
│   │   └── wallet/            # Wallet connection components
│   │
│   ├── hooks/                 # Custom React hooks
│   │   ├── agentHooks/        # Agent-specific hooks
│   │   │   ├── config/        # Configuration files
│   │   │   ├── services/      # Business logic services
│   │   │   │   ├── agentChatService.ts           # Chat workflow management
│   │   │   │   ├── agentConsolidationService.ts  # Legacy consolidation
│   │   │   │   ├── agentMemoryCoreService.ts     # Memory core operations
│   │   │   │   ├── conversationContextBuilder.ts # Chat context building
│   │   │   │   ├── dreamContextBuilder.ts        # Dream context building
│   │   │   │   └── monthLearnService.ts          # Month-learn consolidation
│   │   │   ├── types/         # TypeScript types
│   │   │   └── utils/         # Utility functions
│   │   └── storage/           # 0G Storage hooks
│   │
│   ├── lib/                   # Third-party integrations
│   │   └── 0g/                # 0G Network integration
│   │
│   ├── prompts/               # AI prompt builders and parsers
│   │   ├── conversationPrompts.ts            # Chat prompt templates
│   │   ├── dreamAnalysisPrompt.ts            # Dream analysis prompts
│   │   ├── monthLearnConsolidationPrompt.ts  # Month-learn unified prompts
│   │   └── monthLearnResponseParser.ts       # AI response parsing
│   │
│   ├── providers/             # React context providers
│   ├── contexts/              # React contexts
│   ├── config/                # Application configuration
│   ├── styles/                # CSS styles
│   └── types/                 # Global TypeScript types
│
├── public/                    # Static assets
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── next.config.js            # Next.js configuration
├── .env                      # Environment variables (not in repo)
└── .env.example              # Environment variables template
```

## Key Components

### Agent Dashboard (`src/agent_dashboard/`)
Terminal-style interface for interacting with AI agents:

#### Commands (`src/agent_dashboard/commands/`)
- **mint**: Create new agent NFTs with personality generation
- **info**: Display agent personality traits and profile information
- **stats**: Show agent statistics, intelligence level, and metrics
- **status**: System health and network connectivity status
- **memory**: Memory system information and consolidation status
- **dream**: Interactive dream analysis workflow
- **chat**: Conversation mode with agent personality
- **month-learn**: Monthly consolidation workflow for dreams and conversations
- **help**: Command documentation and usage information
- **CommandProcessor**: Central command routing and validation

#### Terminal Components (`src/agent_dashboard/components/`)
- **CleanTerminal**: Main terminal interface (1,069 lines - modularized)
- **TerminalUtils**: Utility functions for terminal operations
- **TerminalCommandHandler**: Command execution and workflow management
- **TerminalDreamWorkflow**: Specialized dream analysis workflow
- **TerminalChatWorkflow**: Chat session management and conversation flow
- **useTerminalState**: Centralized terminal state management hook

### Pages (`src/app/`)
- **agent-dashboard**: Production terminal interface
- **agent-test**: Development testing interface with component-specific controls
- **compute**: 0G Compute Network interface
- **upload**: File upload to 0G Storage

### Dream Analysis System (`src/app/agent-test/components/`)
Modular dream analysis interface refactored from a single 1,569-line component into focused modules:

- **DreamAnalysisSection**: Main orchestrator with hooks and state management (332 lines)
- **MemoryFileManager**: Download memory files from 0G Storage (535 lines)
- **DreamTextInput**: Simple dream input with character count (103 lines)  
- **DreamContextBuilder**: Agent context preparation with personality data (253 lines)
- **DreamPromptBuilder**: AI prompt generation and display (173 lines)
- **DreamAIAnalysis**: AI response handling and analysis display (364 lines)
- **DreamStorageManager**: Storage upload and blockchain processing (159 lines)
- **DreamAnalysisTypes**: Shared TypeScript interfaces (89 lines)

**Key Benefits:**
- **79% size reduction** of main component (1,569 → 332 lines)
- **Single Responsibility Principle** - each component has one clear purpose
- **Reusable Architecture** - components can be used independently
- **Better Testability** - smaller, focused components easier to test
- **Improved Maintainability** - easier navigation and development

### Hooks (`src/hooks/`)
Custom React hooks organized by functionality:

#### Agent Hooks (`src/hooks/agentHooks/`)
- **useAgentRead**: Core agent data fetching and contract interaction
- **useAgentMint**: Agent creation and NFT minting
- **useAgentDream**: Dream analysis workflow and personality evolution
- **useAgentChat/useAgentChatTerminal**: Conversation management and chat workflows
- **useAgentConsolidation**: Legacy consolidation system
- **useMonthLearn**: Monthly data consolidation with 3-phase workflow:
  1. **Load Phase**: Fetch monthly dreams/conversations from 0G Storage
  2. **Generate Phase**: AI consolidation using unified prompt system
  3. **Save Phase**: Storage upload and smart contract updates
- **useAgentMemoryCore**: Long-term memory core management
- **useAgentStats**: Agent statistics and analytics
- **useAgentPrompt**: AI prompt building and management
- **useAgentAI**: AI service integration and response handling

#### Storage Hooks (`src/hooks/storage/`)
- **useStorageUpload**: 0G Network file upload operations
- **useStorageDownload**: 0G Network file download operations
- **useStorageList**: File listing and management

#### Utility Hooks
- **useWallet**: Web3 wallet integration and transactions
- **useAgentDashboard**: Dashboard state management
- **useBrokerBalance**: 0G Compute broker balance tracking

## Month-Learn Consolidation System

### Overview
The Month-Learn system provides comprehensive monthly consolidation of agent dreams and conversations, using AI to generate insights and personality evolution tracking. It follows a 3-phase workflow pattern similar to other agent operations.

### Architecture Components

#### Core Hook (`src/hooks/agentHooks/useMonthLearn.ts`)
**839-line comprehensive hook** managing the complete monthly consolidation workflow:

**Phase 1: Data Loading**
- Fetches monthly dreams from `currentDreamDailyHash` stored in agent memory
- Downloads conversation data from `currentConvDailyHash` 
- Handles empty/missing data gracefully with 30-second timeout protection

**Phase 2: AI Consolidation**
- Uses unified prompt system with personality context integration
- Sends single API request to `/analyze-dream` endpoint (same as dream workflow)
- Supports both test mode (fixed January 2024) and production dates
- Parses structured AI response with section markers

**Phase 3: Storage & Contract Updates**
- Downloads existing monthly consolidations from `lastDreamMonthlyHash`/`lastConvMonthlyHash`
- Appends new consolidations (newest first) to existing arrays
- Uploads updated consolidation files to 0G Storage
- Calls `consolidateMonth()` contract function to clear daily hashes

#### Command Integration (`src/agent_dashboard/commands/monthLearn.ts`)
- **Terminal command**: `month-learn`
- Triggers `MONTH_LEARN_MODE` in terminal workflow
- Integrated into `CleanTerminal.tsx` state management

#### AI Prompt System
**monthLearnConsolidationPrompt.ts** (185 lines):
- Unified prompt builder for both dreams and conversations
- Structured section markers for reliable AI response parsing
- Personality context integration from `useAgentRead`
- Support for empty data scenarios

**monthLearnResponseParser.ts** (99 lines):
- Extracts separate dream and conversation consolidations from single AI response
- Uses regex patterns to find `### DREAMS CONSOLIDATION ###` and `### CONVERSATIONS CONSOLIDATION ###` markers
- Validates JSON structure with error handling

#### Service Integration (`src/hooks/agentHooks/services/monthLearnService.ts`)
- TypeScript interfaces for consolidation data structures
- `MonthlyDreamConsolidation` and `MonthlyConversationConsolidation` types
- API response handling and error management

### Debug Configuration
Month-Learn uses dedicated debug environment variable:
```env
NEXT_PUBLIC_CONSOLIDATION_TEST=true  # Enable month-learn debug logging
```

### Usage Patterns
1. **Terminal Command**: User types `month-learn` in agent dashboard
2. **Automatic Execution**: Terminal switches to month-learn mode and executes workflow
3. **Status Updates**: Real-time progress updates with dots animation
4. **Completion**: Success/error messages with transaction hashes

### Key Features
- **Data Validation**: 30-second timeout protection for missing agent data
- **Test Mode Support**: Fixed dates for development/testing to avoid contract errors
- **Unified Workflow**: Same pattern as dream/chat workflows for consistency
- **Append-Only Storage**: Preserves existing consolidations while adding new data
- **Contract Integration**: Automatic daily hash clearing after successful consolidation

## Debug Logging System

The application uses a consistent debug logging pattern controlled by the `NEXT_PUBLIC_DREAM_TEST` environment variable.

### Debug Log Pattern
```typescript
// Debug logging helper
const debugLog = (message: string, data?: any) => {
  if (process.env.NEXT_PUBLIC_DREAM_TEST === 'true') {
    console.log(`[ComponentName] ${message}`, data || '');
  }
};

// Usage
debugLog('Operation completed', { result: data });
```

### Components with Debug Logging
- **Agent Hooks**: All hooks in `src/hooks/agentHooks/`
- **Storage Hooks**: All hooks in `src/hooks/storage/`
- **Commands**: Terminal command implementations
- **Components**: UI components with business logic
- **Contexts**: React context providers

### Debug Environment Variables
Set in your `.env` file:
```env
# General application debug logging
NEXT_PUBLIC_DREAM_TEST=true

# Month-learn consolidation debug logging
NEXT_PUBLIC_CONSOLIDATION_TEST=true
```

**NEXT_PUBLIC_DREAM_TEST**: Enables console logging across hooks, components, and terminal commands
**NEXT_PUBLIC_CONSOLIDATION_TEST**: Specific to useMonthLearn hook for detailed consolidation workflow logging

## Development Commands

```bash
# Development server
npm run dev          # Starts on port 3003

# Production build (not used in development)
npm run build        

# Start production server
npm run start        

# Linting (not configured yet)
npm run lint         
```

## Environment Setup

1. Copy `.env.example` to `.env`
2. Fill in required environment variables
3. Set debug variables for development:
   ```env
   NEXT_PUBLIC_DREAM_TEST=true          # General debug logging
   NEXT_PUBLIC_CONSOLIDATION_TEST=true  # Month-learn debug logging
   ```

## Key Technologies

- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Web3**: RainbowKit + Wagmi for wallet connectivity
- **Blockchain**: 0G Network (Galileo Testnet)
- **Storage**: 0G Network decentralized storage
- **AI Processing**: 0G Compute Network integration

## Architecture Principles

- **Modular Design**: Large components broken into focused modules (500-550 line limit)
- **Component Composition**: Complex UI built from smaller, reusable components
- **3-Phase Workflow Pattern**: Load → Process → Save pattern used across dream, chat, and month-learn systems
- **Unified AI Integration**: Consistent API endpoint usage (`/analyze-dream`) with structured prompt/response patterns
- **Dependency Injection**: Functions passed as props for better testability
- **Shared Types**: Centralized TypeScript interfaces for consistency
- **Hook-Based Logic**: Business logic separated into custom hooks
- **Consistent Patterns**: Standardized debug logging and error handling
- **Append-Only Storage**: Preserve existing data while adding new entries (newest first)
- **Type Safety**: Full TypeScript coverage with strict types
- **Component Isolation**: Clear separation of concerns between UI and logic
- **Graceful Degradation**: Timeout protection and fallback handling for missing data

## Related Documentation

- Main project documentation: `../CLAUDE.md`
- Smart contracts: `../contracts/`
- 0G Compute backend: `../0g-compute/`