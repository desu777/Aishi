require('@nomicfoundation/hardhat-ethers');
require('hardhat-deploy');
require('hardhat-deploy-ethers');
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  paths: {
    artifacts: "build/artifacts",
    cache: "build/cache", 
    sources: "contracts",
    deploy: "scripts/deploy",
  },
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1 // Aggressive optimization for smaller contract size
      },
      viaIR: true // Fixes "Stack too deep" errors
    }
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      allowBlocksWithSameTimestamp: true,
      blockGasLimit: 100000000,
      gas: 100000000,
      accounts: [
        {
          privateKey: process.env.WALLET_PRIVATE_KEY || "0x" + "1".repeat(64),
          balance: "1000000000000000000000",
        }
      ],
      live: false,
      saveDeployments: true,
      tags: ["test", "local"]
    },
    galileo: {
      url: "https://evmrpc-testnet.0g.ai",
      accounts: [process.env.WALLET_PRIVATE_KEY || ""],
      chainId: 16601, // Updated to correct Galileo chain ID
      live: true,
      saveDeployments: true,
      tags: ["testnet"]
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  namedAccounts: {
    deployer: {
      default: 0,
      hardhat: 0,
      galileo: 0,
    },
  },
  external: {
    contracts: [
      {
        artifacts: "build/artifacts",
      },
    ],
    deployments: {
      hardhat: ["deployments/hardhat"],
      galileo: ["deployments/galileo"],
    },
  }
}; 