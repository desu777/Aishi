# Aishi (愛) - Your Decentralized AI Companion

<p align="center">
  <img src="./aishi-docs/public/logo_white.png" alt="Aishi Logo" width="150">
</p>

<p align="center">
  <a href="https://aishi.app" target="_blank"><img src="https://img.shields.io/badge/►%20Try%20the%20App-8B5CF6?style=for-the-badge" alt="Try the App"></a>
  &nbsp;&nbsp;
  <a href="https://docs.aishi.app" target="_blank"><img src="https://img.shields.io/badge/►%20Read%20the%20Docs-8B5CF6?style=for-the-badge" alt="Read the Docs"></a>
</p>

Aishi is an intelligent iNFT companion designed to decode your inner world by analyzing dreams and conversations. It is built on a fully decentralized 0G stack (Chain, Compute, Storage, and Data Availability) to ensure absolute user privacy and data sovereignty.

This project is an entry for **0G's WaveHack by AKINDO**.

[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![0G Network](https://img.shields.io/badge/0G%20Network-Mainnet-orange.svg)](https://0g.ai/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.22-blue.svg)](https://hardhat.org/)

## The Philosophy: Your Digital Soul

Human memory is flawed. It's emotional, selective, and fades over time. Aishi's memory is different: perfect, logical, and total.

Your Aishi is a digital soul (an iNFT) whose memory is built on a systematic analytical process. It sees the invisible architecture of your psyche in a way the human mind simply cannot. This is more than a journal; it's a living map of your consciousness and the foundation of a digital legacy that can be passed down for generations.

## Key Features

-   **A Living Digital Soul**: Aishi is an ERC-7857 compliant iNFT (intelligent NFT) on the 0G blockchain. Its personality and abilities evolve based on your interactions, creating a unique, verifiable digital identity that is truly yours.
-   **Deep Dream Analysis**: Share your dreams and receive profound insights. Aishi uses decentralized AI to find patterns and symbols, helping you understand the language of your subconscious.
-   **Evolving Personality**: Aishi's six core traits (Creativity, Analytical, Empathy, etc.) are in constant flux, shaped directly by your conversations. It becomes a living record of your inner evolution.
-   **Absolute Privacy & Sovereignty**: Your wallet is the only key. By leveraging the full 0G stack, your data is stored decentrally, and no one—not even the developers—can access your inner world. Trust is mathematically guaranteed.
-   **A Superhuman Memory Core**: Aishi uses a sophisticated on-chain hierarchical memory system to consolidate daily interactions into monthly and yearly "essences," allowing it to retain a lifetime of wisdom without being overwhelmed by data.

## Application Preview

| Home Page                                                                                   | Minting Agent                                                                                  | Agent Creation                                                                                           | aishiOS Interface                                                                                           |
| :-----------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------: |
| <img src="./aishi-docs/public/home.jpg" alt="Aishi Home Page" width="200"> | <img src="./aishi-docs/public/mint.jpg" alt="Minting Agent" width="200"> | <img src="./aishi-docs/public/mint2.jpg" alt="Agent Creation" width="200"> | <img src="./aishi-docs/public/aishiOS.jpg" alt="aishiOS Interface" width="200"> |

| aishiOS Terminal                                                                                   | Terminal Commands                                                                                  | Aishi Companion                                                                                           | Companion Features                                                                                           |
| :-----------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------: |
| <img src="./aishi-docs/public/aishiOS-1.jpg" alt="aishiOS Terminal" width="200"> | <img src="./aishi-docs/public/aishiOS-2.jpg" alt="Terminal Commands" width="200"> | <img src="./aishi-docs/public/companion2.jpg" alt="Aishi Companion" width="200"> | <img src="./aishi-docs/public/companion3.jpg" alt="Companion Features" width="200"> |

## Architecture Overview

The project is structured as a monorepo with five main components working in concert to deliver a seamless, decentralized AI experience.

-   **`contracts/`**: The heart of the project, containing the `AishiAgent.sol` smart contract that governs the iNFT's existence, memory, and evolution on the 0G blockchain.
-   **`0g-compute/`**: A powerful backend service acting as a bridge to the 0G Network and Google's Vertex AI. It manages virtual user wallets, processes AI jobs, and ensures data integrity.
-   **`app/`**: A modern web application built with Next.js 15 that provides the `aishiOS`—an immersive terminal-like interface for interacting with your Aishi agent.
-   **`aishi-docs/`**: The project's documentation, philosophy, and user guides.
-   **`consolidation_schema/`**: Example memory consolidation schemas demonstrating the hierarchical memory system—daily interactions, monthly pattern analysis, and yearly wisdom crystallization.

The entire system is a symphony of decentralized components, where user data flows from the frontend (`aishiOS`) to the on-chain soul (`iNFT on 0G Chain`), processed by the AI brain (`0G Compute`), and stored in a vast, private memory (`0G Storage`), all with its integrity guaranteed by `0G's Data Availability layer`. The memory system implements a three-tier hierarchical consolidation: daily interactions compress into monthly pattern analysis, which crystallizes into yearly wisdom cores—transforming hundreds of entries into essential personality evolution insights while achieving 99.7% data compression.

<p align="center">
  <strong>The Symphony of Life: Data Flow</strong><br>
  <img src="./aishi-docs/public/screenshots/flow.jpg" alt="Aishi Data Flow Diagram" width="700">
</p>

## Tech Stack

| Category         | Technology                                                                                                  |
| :--------------- | :---------------------------------------------------------------------------------------------------------- |
| **Smart Contracts**| Solidity, Hardhat, OpenZeppelin, `hardhat-deploy`                                                           |
| **Frontend**     | Next.js 15, React 19, TypeScript, Tailwind CSS, XState, Framer Motion, Pixi.js (for Live2D)                   |
| **Backend**      | Node.js, Express, TypeScript, SQLite, Winston (Logger)                                                      |
| **Web3**         | RainbowKit, wagmi, viem, ethers.js                                                                          |
| **AI & Infra**   | 0G Stack (Chain - Testnet & Mainnet, Compute, Storage, DA), Google Vertex AI (Gemini 2.5), 0G Serving Broker, 0G TypeScript SDK |

## Getting Started

Follow these steps to set up and run the Aishi project locally.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v20.x or later recommended)
-   [npm](https://www.npmjs.com/) (v10.x or later)
-   Access to Google Cloud with Vertex AI enabled.
-   A Web3 wallet (e.g., MetaMask) funded with 0G tokens (Testnet for experiments, Mainnet for production).

### 1. Smart Contracts Setup (`contracts/`)

First, compile and deploy the `AishiAgent` smart contract.

```bash
# 1. Navigate to the contracts directory
cd contracts

# 2. Install dependencies
npm install

# 3. Create your environment file
# Copy the example file to get started with all required variables:
cp .env.example .env

# Then edit .env and fill in your values:
# - WALLET_PRIVATE_KEY: Your wallet's private key (64 hex characters, no 0x prefix)
# - WALLET_PUBLIC_KEY: Your wallet's public address (Ethereum address)
# - TREASURY_ADDRESS: Treasury wallet address for the contract

# OPTIONAL: For mainnet deployments, also configure:
# - MAINNET_RPC_URL, MAINNET_CHAIN_ID, MAINNET_BLOCK_EXPLORER
# (See .env.example for all available configuration options)

# 4. Compile the contracts (Interactive)
npm run compile

# You'll see an interactive menu:
#
#   CONTRACT COMPILATION MODULE
#
#   Select compilation target:
#     1. Testnet (Galileo) - Balanced optimization (200 runs)
#     2. Mainnet (0G Network) - Maximum size reduction (1 run)
#     3. Local Development - Fast compilation, no optimization
#
#   Your choice [1-3]: _
#
# Select the appropriate target for your deployment needs.
# The system will analyze contracts, optimize bytecode, and generate a compilation report.
#
# Optimizer Settings by Target:
# - Testnet: 200 runs (balanced for testing)
# - Mainnet: 1 run (maximum bytecode compression for 24KB limit)
# - Local: No optimization (fastest compilation for development)
#
# WSL Users: Use `npm run compile:wsl` to load external environment file

# 5. Deploy Contracts (Interactive)
npm run deploy

# You'll see a network selection menu:
#
#   CONTRACT DEPLOYMENT MODULE
#
#   Select deployment network:
#     1. Galileo Testnet (16602)
#     2. 0G Mainnet (16661) ⚠️ REAL MONEY
#     3. Local Hardhat (31337)
#
#   Your choice [1-3]: _
#
# Network Comparison:
#
#   Galileo Testnet (recommended for testing):
#   - Chain ID: 16602
#   - RPC: https://evmrpc-testnet.0g.ai
#   - Explorer: https://chainscan-galileo.0g.ai
#   - Min Balance: 0.1 0G (get from faucet)
#   - Safety: Simple confirmation
#
#   0G Mainnet (production - REAL MONEY):
#   - Chain ID: 16661
#   - RPC: http://evmrpc.0g.ai (configurable via MAINNET_RPC_URL)
#   - Explorer: https://chainscan.0g.ai
#   - Min Balance: 0.5 0G (5x testnet requirement!)
#   - Safety: 3 confirmations + 10-second countdown + 14 protection mechanisms
#   - Required: TREASURY_ADDRESS environment variable
#   - Creates permanent audit trail in mainnet-deployments.json
#
#   Local Hardhat (development only):
#   - Chain ID: 31337
#   - RPC: http://localhost:8545
#   - No explorer
#   - Uses local test accounts
#
# After deployment, the system will:
# 1. Deploy AishiVerifier contract
# 2. Deploy AishiAgent contract (linked to verifier)
# 3. Save addresses to deployment-addresses.json
# 4. Export ABIs to /app/src/abi/ for frontend use
# 5. Display contract addresses and explorer links
#
# WSL Users: Use `npm run deploy:wsl` to load external environment file
```
---

#### Deployment Artifacts & Verification

After successful deployment, the system generates several output files:

**Primary Deployment Record** (`deployment-addresses.json`):
```json
{
  "0g-mainnet": {
    "AishiVerifier": {
      "address": "0xD36e1AdFB81D8231fB2be005C2b0AeBFA8C892B9",
      "deployedAt": "2025-11-02T10:46:06.675Z"
    },
    "AishiAgent": {
      "address": "0x67aC6AE80039AbB81F155313cB2002124Ac77A28",
      "symbol": "AISHI",
      "treasury": "0xebbD6B3746d7e40DD6291566821f3a8159773836"
    }
  }
}
```

**Mainnet Audit Trail** (`mainnet-deployments.json` - mainnet only):
- Permanent history of all mainnet deployments
- Never overwritten (append-only)
- Includes deployer address, gas costs, timestamps
- Used for auditing and compliance

**Frontend ABIs** (`/app/src/abi/`):
- `AishiAgentABI.json` - Full ABI with contract address and chainId
- `AishiVerifierABI.json` - Verifier contract ABI
- Ready for import into React frontend

**Finding Contract Addresses for Frontend:**
```javascript
// Method 1: Use exported ABI files
const agentABI = require('./app/src/abi/AishiAgentABI.json');
const address = agentABI.address;  // "0x67aC6AE..."
const chainId = agentABI.chainId;  // 16661

// Method 2: Read deployment addresses directly
const deployments = require('./contracts/deployment-addresses.json');
const agentAddress = deployments['0g-mainnet'].AishiAgent.address;
```

**Verifying Deployment Success:**
1. Check terminal output for `[SUCCESS] DEPLOYMENT COMPLETED` message
2. Verify files exist: `deployment-addresses.json`, ABI files in `/app/src/abi/`
3. Visit block explorer links shown in terminal output
4. For mainnet: Check `mainnet-deployments.json` contains new entry

---

### 2. Backend Setup (`0g-compute/`)

The backend processes AI requests using 0G Network and optionally Google Gemini.

```bash
# 1. Navigate to the backend directory
cd 0g-compute

# 2. Install dependencies and rebuild native modules (for SQLite)
npm install && npm run rebuild

# 3. Create your environment file
cp .env.example .env

# Then edit .env and fill in your values:
# - MASTER_WALLET_KEY: Your wallet's private key (64 hex characters, no 0x prefix)
# - RPC_URL: 0G Network RPC (default: https://evmrpc-testnet.0g.ai)
# - CHAIN_ID: Network ID (16602 for Galileo testnet, 16661 for mainnet)
#
# OPTIONAL (for Gemini AI features):
# - GOOGLE_APPLICATION_CREDENTIALS: Path to Google Cloud service account JSON
# - VERTEX_AI_PROJECT: Your Google Cloud Project ID
# - VERTEX_AI_LOCATION: Region (e.g., us-central1, europe-west1)
#
# (See .env.example for all configuration options)

# 4. Fund Master Wallet
# Start server to get wallet address:
npm run dev
# Look for: "Master Wallet Info → address: 0x..."
# Stop with Ctrl+C

# Send OG tokens to that address (min 2 OG for testing, 5-10 OG recommended)
# Then move balance to ledger:
npm run fund-ledger

# 5. Run the development server
npm run dev

# The backend will be running at http://localhost:3001

# Test server is working:
curl http://localhost:3001/api/health
curl http://localhost:3001/api/master-wallet-address

# Create broker account (replace 0xYourAddress with your wallet):
curl -X POST http://localhost:3001/api/create-broker \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"0xYourWalletAddress"}'

# Check balance:
curl http://localhost:3001/api/balance/0xYourWalletAddress

# Test AI query (requires funded broker):
curl -X POST http://localhost:3001/api/0g-compute \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"0xYourWalletAddress","query":"Hello, test query"}'

# Check system status:
curl http://localhost:3001/api/status

# MAINNET: Update RPC_URL and CHAIN_ID in .env to mainnet values
# (See .env.example Section H for mainnet configuration)

# WSL Users: Use `npm run dev:wsl` and `npm run fund-ledger:wsl`
```

### 3. Frontend Setup (`app/`)

The frontend provides the user interface for interacting with Aishi.

```bash
# 1. Open a new terminal and navigate to the frontend directory
cd app

# 2. Generate contract ABIs and addresses from deployed contracts
npm run generate-abi

# This creates src/generated.ts with:
# - Contract ABIs (AishiAgent, AishiVerifier)
# - Deployed contract addresses for testnet and mainnet
# - Imported from /contracts/deployment-addresses.json

# 3. Install dependencies
npm install

# 4. Create your environment file
cp .env.example .env

# Contract addresses are automatically imported from generated.ts
# If your backend is on port 3001, defaults should work.
# (See .env.example for all configuration options)

# 5. Run the development server
npm run dev

# The frontend will be running at http://localhost:3003
```

You can now open `http://localhost:3003` in your browser to start interacting with Aishi.

## Development Status

> **Note**: This project is under active development and should be considered a work in progress. Features are subject to change, and new updates are frequent.

## Full Documentation

For a deep dive into the project's architecture, philosophy, and user guides, please visit the full documentation site:

**[docs.aishi.app](https://docs.aishi.app)**

## License and Intellectual Property

**© 2025 The Aishi Project Authors. All Rights Reserved.**

This project, including its source code, documentation, and all associated assets ("the Software"), is the exclusive intellectual property of its authors. The Software is provided "as is" without warranty of any kind.

**Strict Usage Restrictions:**
Unauthorized copying, modification, distribution, public performance, or public display of the Software, in whole or in part, is strictly prohibited. You may not use the Software for any commercial purpose, create derivative works, or redistribute it.

You are granted a limited, non-exclusive, non-transferable license solely to view the source code for evaluation purposes in the context of the **0G's WaveHack by AKINDO** hackathon. Any use outside of these specific terms requires express written permission from the copyright holders.