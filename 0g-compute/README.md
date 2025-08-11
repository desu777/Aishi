# Dreamscape 0G Compute Backend

AI backend service with virtual brokers and Master Wallet architecture for 0G Network.

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Production build
npm run build && npm start
```

## Terminal Commands

```bash
# Method 1: Use external .env (recommended)
ENV_FILE_PATH=C:\Users\kubas\Desktop\env\dreamscape\.env npm run dev

# Method 2: Linux/WSL format
ENV_FILE_PATH=/mnt/c/Users/kubas/Desktop/env/dreamscape/.env npm run dev

# Method 3: Use local .env fallback
npm run dev

# Multiple terminals for full system:
# Terminal 1: Backend
cd 0g-compute && npm run dev

# Terminal 2: Main app
cd app && npm run dev

# Terminal 3: Frontend (optional)
cd frontend && npm run dev
```

## Environment Setup

The project uses centralized environment loading for security:

**External .env file** (recommended):
```bash
ENV_FILE_PATH=C:\Users\kubas\Desktop\env\dreamscape\.env
```

**Fallback** (.env in project root):
```env
# Core Configuration
MASTER_WALLET_KEY=your_private_key_here
RPC_URL=https://evmrpc-testnet.0g.ai
CHAIN_ID=16601
PORT=3001

# AI Model Selection
MODEL_PICKED=deepseek-r1-70b  # Options: llama-3.3-70b-instruct, deepseek-r1-70b

# Google Vertex AI / Gemini Configuration
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
VERTEX_AI_PROJECT=your-project-id
VERTEX_AI_LOCATION=us-central1
GEMINI_MODEL=gemini-2.5-flash
GEMINI_TEMPERATURE=0.8
GEMINI_ENABLE_THINKING=false  # Set to true for better quality (slower)
GEMINI_THINKING_BUDGET=8192   # Token budget for thinking (0-24576)
GEMINI_INCLUDE_THOUGHTS=false # Include thinking process in response
```

## Key Commands

```bash
npm run dev              # Development server (port 3001)
npm run build           # TypeScript compilation
npm run start           # Production server
npm run test            # Build and start
```

## Architecture

- **Master Wallet**: Central wallet for all AI queries
- **Virtual Brokers**: User balances in SQLite database
- **Auto-funding**: Automatic broker funding from transactions
- **AI Models**: 
  - **0G Network**: llama-3.3-70b-instruct, deepseek-r1-70b
  - **Google Vertex AI**: gemini-2.5-flash (via proxy)
- **Query Manager**: Request queuing with max 5 concurrent queries
- **Consolidation Checker**: Automatic memory consolidation monitoring

## API Endpoints

### Core Operations
```bash
GET  /                                 # Service info and endpoints list
GET  /api/health                      # Health check
GET  /api/status                      # Detailed service status
```

### Broker Management
```bash
POST /api/create-broker               # Create virtual broker
POST /api/fund                        # Fund broker manually
GET  /api/balance/:address            # Check broker balance
GET  /api/transactions/:address       # Transaction history
```

### AI Services
```bash
POST /api/0g-compute                 # 0G Network AI processing
POST /api/gemini                     # Gemini AI proxy (Vertex AI)
GET  /api/gemini/status              # Gemini service status
GET  /api/models                      # Available AI models
POST /api/estimate-cost              # Estimate query cost
```

### System Management
```bash
GET  /api/master-wallet-address      # Get master wallet for funding
GET  /api/queue-status               # Query processing queue status
```

### Consolidation Services
```bash
GET  /api/consolidation/:address     # Check consolidation status
POST /api/consolidation/check        # Manual consolidation check
GET  /api/consolidation/status       # Consolidation checker status
POST /api/consolidation/start        # Start consolidation checker
POST /api/consolidation/stop         # Stop consolidation checker
```

## Network

- **Testnet**: Galileo (Chain ID: 16601)
- **RPC**: https://evmrpc-testnet.0g.ai
- **Faucet**: https://faucet.0g.ai

## Debug Mode

Enable detailed logging:
```env
TEST_ENV=true
```