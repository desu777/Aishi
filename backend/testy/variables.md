# Environment Variables

## Backend Server Variables

```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# 0G Storage Configuration
INDEXER_RPC=https://indexer-storage-testnet-turbo.0g.ai

# Storage Network Selection & Progressive Fee Optimization
STORAGE_NETWORK=turbo                    # 'standard' or 'turbo' 
STORAGE_WAIT_FINALITY=true              # Wait for finality (recommended: true)
OG_PRICE_USD=0.10                       # 0G token price for USD estimates

# Progressive Fee Escalation with SDK Override (NEW FEATURE)
# Auto-increases fees on transaction failures:
# - Attempt 1: 1.2x base gas price (20% higher)
# - Attempt 2: 1.5x base gas price (50% higher) 
# - Attempt 3: 2.0x base gas price (100% higher)
# - Max 3 retries with exponential backoff (1s, 2s, 4s)
# - Handles: transaction reverted, gas too low, underpriced errors
# - FORCES 0G SDK to use our calculated fees via custom signer override
# - Prevents SDK's built-in retry mechanism from interfering
# Note: STORAGE_GAS_MULTIPLIER is now deprecated - using dynamic escalation

# Network Endpoints (Optional - uses defaults if not set)
STANDARD_FLOW_ADDRESS=0xbD75117F80b4E22698D0Cd7612d92BDb8eaff628
TURBO_FLOW_ADDRESS=0xbD75117F80b4E22698D0Cd7612d92BDb8eaff628
STANDARD_STORAGE_RPC=https://indexer-storage-testnet-standard.0g.ai
TURBO_STORAGE_RPC=https://indexer-storage-testnet-turbo.0g.ai

# Debug Configuration
DREAMSCAPE_TEST=true
```

## AI & Blockchain Services

```bash
# OpenAI Whisper API
WHISPER_API=

# 0G Network Configuration
WALLET_PRIVATE_KEY=
WALLET_PUBLIC_KEY= 
NETWORK_NAME=0G-Galileo-Testnet
CHAIN_ID=16601
TOKEN_SYMBOL=OG
RPC=https://evmrpc-testnet.0g.ai
BLOCK_EXPLORER=https://chainscan-galileo.0g.ai
FAUCET=https://faucet.0g.ai

# iNFT Smart Contracts (deployed addresses)
DREAM_VERIFIER_ADDRESS=0x5BeD3AAFb930128ed20Beed927733b796C33C8BA
DREAM_AGENT_NFT_ADDRESS=0xDcE93Cc4e8a32d8fC3d5c2Db56944Fa9d19d2a04
```



TREASURY=0x0f13e85B575964B8b4b77E37d43A6aE9E354e94C
