# Dreamscape 0G Compute Backend

AI backend service with virtual brokers and Master Wallet architecture for 0G Network.

## Quick Start

```bash
# Install dependencies
npm install

# Set environment path (external .env for security)
export ENV_FILE_PATH=C:\Users\kubas\Desktop\env\dreamscape\.env

# Run development server
npm run dev

# Production build
npm run build && npm start
```

## Environment Setup

The project uses centralized environment loading for security:

**External .env file** (recommended):
```bash
ENV_FILE_PATH=C:\Users\kubas\Desktop\env\dreamscape\.env
```

**Fallback** (.env in project root):
```env
MASTER_WALLET_KEY=your_private_key_here
RPC_URL=https://evmrpc-testnet.0g.ai
CHAIN_ID=16601
PORT=3001
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
- **AI Models**: llama-3.3-70b-instruct, deepseek-r1-70b

## API Endpoints

```bash
GET  /api/health                      # Health check
POST /api/create-broker               # Create virtual broker
POST /api/fund                        # Fund broker
GET  /api/balance/:address            # Check balance
POST /api/analyze-dream               # AI dream analysis
GET  /api/models                      # Available models
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