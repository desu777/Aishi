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
│   │   │   ├── types/         # TypeScript types
│   │   │   └── utils/         # Utility functions
│   │   └── storage/           # 0G Storage hooks
│   │
│   ├── lib/                   # Third-party integrations
│   │   └── 0g/                # 0G Network integration
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
- **Commands**: Modular command system (mint, info, stats, status, memory, dream, chat)
- **CleanTerminal**: Main terminal component (refactored into smaller modules)
- **Workflows**: Specialized workflows for dreams and chat interactions

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
Custom React hooks for:
- **Agent Operations**: Dream processing, chat, memory consolidation, minting
- **Storage**: 0G Network file upload/download operations
- **Wallet**: Web3 wallet integration and transactions

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

### Enabling Debug Logs
Set in your `.env` file:
```env
NEXT_PUBLIC_DREAM_TEST=true
```

This will enable console logging across the entire application for development purposes.

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
3. Set `NEXT_PUBLIC_DREAM_TEST=true` for development debugging

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
- **Dependency Injection**: Functions passed as props for better testability
- **Shared Types**: Centralized TypeScript interfaces for consistency
- **Hook-Based Logic**: Business logic separated into custom hooks
- **Consistent Patterns**: Standardized debug logging and error handling
- **Type Safety**: Full TypeScript coverage with strict types
- **Component Isolation**: Clear separation of concerns between UI and logic

## Related Documentation

- Main project documentation: `../CLAUDE.md`
- Smart contracts: `../contracts/`
- 0G Compute backend: `../0g-compute/`