# Dreamscape Smart Contracts

Smart contracts for Dreamscape iNFT system with personality evolution on Galileo Testnet.

## Quick Start

```bash
# Install dependencies
npm install

# Set environment path (external .env for security)
export ENV_FILE_PATH=C:\Users\kubas\Desktop\env\contracts\.env

# Compile contracts
npm run compile

# Deploy to Galileo testnet
npm run deploy

# Deploy to local hardhat
npm run deploy:local
```

## Environment Setup

The project uses centralized environment loading for security:

**External .env file** (recommended):
```bash
ENV_FILE_PATH=C:\Users\kubas\Desktop\env\contracts\.env
```

**Fallback** (.env in project root):
```env
WALLET_PRIVATE_KEY=your_private_key_here
TREASURY_ADDRESS=0x...
DREAMSCAPE_TEST=true
```

## Key Commands

```bash
npm run compile          # Compile all contracts
npm run deploy           # Deploy to Galileo testnet  
npm run deploy:local     # Deploy to local hardhat
```

## Network

- **Testnet**: Galileo (Chain ID: 16601)
- **RPC**: https://evmrpc-testnet.0g.ai
- **Faucet**: https://faucet.0g.ai

## Contracts

- **DreamscapeAgent.sol** - Main iNFT with personality evolution
- **SimpleDreamVerifier.sol** - ERC-7857 ownership verifier