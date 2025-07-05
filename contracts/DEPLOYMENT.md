# 🚀 Dreamscape Contracts Deployment Guide

## Overview

This guide covers deploying and using the Dreamscape iNFT contracts with personality evolution system.

## 📋 Prerequisites

1. **Environment Setup**
```bash
npm install
```

2. **Environment Variables** (create `doors.md`)
```markdown
# doors.md - Contract Environment Variables

## Required Variables

WALLET_PRIVATE_KEY=your_private_key_here
TREASURY_ADDRESS=0x...
DREAMSCAPE_TEST=true

## Optional Variables  

ETHERSCAN_API_KEY=your_etherscan_key
OPENSEA_API_KEY=your_opensea_key
```

3. **Network Configuration**
Contracts are configured for:
- **Galileo Testnet** (Chain ID: 16601)
- **Localhost** (Chain ID: 31337)

## 🏗️ Deployment Steps

### Step 1: Deploy Verifier

```bash
npx hardhat deploy --network galileo --tags SimpleDreamVerifier
```

This creates:
- `SimpleDreamVerifier` contract for proof validation
- Saves address + ABI to `deployment-addresses.json`

### Step 2: Deploy Main Contract

```bash
npx hardhat deploy --network galileo --tags DreamAgentNFTv2
```

This creates:
- `DreamAgentNFTv2` contract with personality system
- Creates `frontend-contracts.json` for frontend integration
- Updates `deployment-addresses.json` with all contract info

### Step 3: Verify Deployment

```bash
# Run comprehensive tests
npx hardhat run scripts/test-complete-suite.js --network galileo

# Or run specific tests
npx hardhat run scripts/test-personality-minting.js --network galileo
```

## 📂 Generated Files

After deployment, you'll have:

### `deployment-addresses.json`
Complete deployment information for all networks:
```json
{
  "galileo": {
    "SimpleDreamVerifier": {
      "address": "0x...",
      "abi": [...],
      "gasUsed": "123456",
      "contractType": "verifier"
    },
    "DreamAgentNFTv2": {
      "address": "0x...",
      "abi": [...],
      "name": "Dreamscape AI Agents v2",
      "symbol": "DREAMv2",
      "hasPersonalitySystem": true,
      "features": {
        "dailyDreamEvolution": true,
        "personalityTraits": true,
        "contextAwareConversations": true
      }
    }
  }
}
```

### `frontend-contracts.json`
Frontend-specific contracts with clean structure:
```json
{
  "galileo": {
    "DreamAgentNFTv2": {
      "address": "0x...",
      "abi": [...]
    },
    "SimpleDreamVerifier": {
      "address": "0x...",
      "abi": [...]
    },
    "chainId": 16601,
    "rpcUrl": "https://evmrpc-testnet.0g.ai"
  }
}
```

## 🔗 Frontend Integration

### Using Contracts in Frontend

```javascript
// Load contract configuration
import contracts from '../contracts/frontend-contracts.json';

const network = 'galileo';
const dreamAgentConfig = contracts[network].DreamAgentNFTv2;

// Initialize contract
const dreamAgentContract = new ethers.Contract(
  dreamAgentConfig.address,
  dreamAgentConfig.abi,
  signer
);

// Use personality functions
const personality = await dreamAgentContract.getPersonalityTraits(tokenId);
const [style, primaryTrait] = await dreamAgentContract.getResponseStyle(tokenId);
```

### Environment Variables for Frontend

Add to your frontend `.env`:
```bash
NEXT_PUBLIC_DREAM_AGENT_ADDRESS=0x...
NEXT_PUBLIC_VERIFIER_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=16601
NEXT_PUBLIC_RPC_URL=https://evmrpc-testnet.0g.ai
```

## 🧪 Testing Guide

### Run All Tests
```bash
npx hardhat run scripts/test-complete-suite.js --network galileo
```

### Individual Test Files
```bash
# Test personality minting
npx hardhat run scripts/test-personality-minting.js --network galileo

# Test dream evolution  
npx hardhat run scripts/test-dream-evolution.js --network galileo

# Test conversations
npx hardhat run scripts/test-conversations.js --network galileo

# Test analytics
npx hardhat run scripts/test-personality-analytics.js --network galileo
```

### Test Checklist

✅ **Core Functionality**
- [ ] Agent minting with personality
- [ ] Daily dream processing (24h cooldown)
- [ ] Conversation recording
- [ ] Personality trait bounds (0-100)

✅ **Advanced Features**  
- [ ] Personality rarity calculation
- [ ] Agent compatibility scoring
- [ ] Milestone achievements
- [ ] Response style evolution

✅ **Events & Metadata**
- [ ] PersonalityEvolved events
- [ ] Dynamic SVG generation
- [ ] JSON metadata with traits

## 🔧 Development Commands

### Compilation
```bash
npx hardhat compile
```

### Local Testing
```bash
# Start local node
npx hardhat node

# Deploy to local
npx hardhat deploy --network localhost --tags SimpleDreamVerifier,DreamAgentNFTv2

# Test locally
npx hardhat run scripts/test-complete-suite.js --network localhost
```

### Contract Verification
```bash
# Verify on Galileo (if supported)
npx hardhat verify --network galileo DEPLOYED_ADDRESS
```

## 📊 Contract Features Summary

### DreamAgentNFTv2
- **Personality Evolution**: 6 traits evolve based on dreams
- **Daily Processing**: One dream per day with 24h cooldown
- **Context Conversations**: 5 conversation types stored
- **NFT Metadata**: Dynamic SVG based on personality
- **Milestones**: Achievement system for trait mastery
- **Compatibility**: Agent-to-agent compatibility scoring
- **Rarity System**: Unique personality combinations

### SimpleDreamVerifier  
- **Proof Validation**: Validates ownership proofs
- **ERC-7857 Compliance**: Standard verifier interface
- **Test Environment**: Simplified for rapid development

## 🚨 Security Notes

1. **Private Keys**: Never commit `doors.md` or `.env` files
2. **Treasury Address**: Use secure multi-sig for production
3. **Proof Validation**: Implement robust verification for mainnet
4. **Rate Limiting**: 24h cooldown prevents abuse
5. **Trait Bounds**: All personality changes are bounded (0-100)

## 🔮 Next Steps

1. **Deploy to Galileo**: Test all functionality
2. **Frontend Integration**: Use `frontend-contracts.json`
3. **Backend Connection**: Connect AI analysis to dream processing
4. **User Testing**: Test personality evolution flows
5. **Mainnet Preparation**: Enhance security for production

---

**Ready to launch the most advanced personality evolution NFT system!** 🌟 