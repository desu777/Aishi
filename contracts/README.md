# Aishi Smart Contracts (formerly Dreamscape)

Smart contracts for Aishi iNFT system with personality evolution on Galileo Testnet.

## Quick Start

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Deploy AISHI contracts to Galileo testnet
npm run deploy:aishi

# Deploy AISHI contracts to local hardhat
npm run deploy:aishi:local

# Legacy Dreamscape deployment (still available)
npm run deploy
```

## Deployment Commands for AISHI

### Windows Command Prompt
```bash
# Deploy Aishi contracts with external .env
npm run deploy:aishi:windows
```

### WSL/Linux
```bash
# Deploy Aishi contracts with external .env
npm run deploy:aishi:wsl
```

### Standard (auto-detect environment)
```bash
# Deploy to Galileo testnet
npm run deploy:aishi

# Deploy to local hardhat network
npm run deploy:aishi:local
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

### Aishi (New)
- **AishiAgent.sol** - Main iNFT with personality evolution (rebrand of DreamscapeAgent)
- **AishiVerifier.sol** - ERC-7857 ownership verifier for Aishi

### Dreamscape (Legacy)
- **DreamscapeAgent.sol** - Original iNFT contract
- **SimpleDreamVerifier.sol** - Original verifier contract

## Deployment Script

The unified deployment script `deploy-aishi.js` handles:
1. **Automatic compilation** - Compiles all contracts before deployment
2. **Sequential deployment** - Deploys verifier first, then agent contract
3. **ABI export** - Automatically exports ABIs to `app/src/contracts/`
4. **Deployment summary** - Generates DEPLOYMENT_SUMMARY.md with all addresses
5. **Colored output** - Easy to read deployment progress

### What the script does:
```
1. Compiles contracts (hardhat compile)
2. Deploys AishiVerifier contract
3. Deploys AishiAgent contract with verifier address
4. Exports ABIs to frontend (AishiVerifierABI.json, AishiAgentABI.json)
5. Saves deployment addresses to deployment-addresses.json
6. Generates DEPLOYMENT_SUMMARY.md with all contract info
```