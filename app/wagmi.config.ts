/**
 * @fileoverview Wagmi CLI configuration for TypeScript ABI generation
 * @description Automatically generates type-safe contract interfaces from existing ABI files
 */

import { defineConfig } from '@wagmi/cli'
import { react } from '@wagmi/cli/plugins'

// Import existing ABI files
import AishiAgentABI from './src/abi/AishiAgentABI.json'
import AishiVerifierABI from './src/abi/AishiVerifierABI.json'

export default defineConfig({
  out: 'src/generated.ts',
  contracts: [
    {
      name: 'AishiAgent',
      abi: AishiAgentABI.abi as any,
      address: {
        16601: AishiAgentABI.address as `0x${string}`, // Galileo testnet
      },
    },
    {
      name: 'AishiVerifier', 
      abi: AishiVerifierABI.abi as any,
      address: {
        16601: AishiVerifierABI.address as `0x${string}`, // Galileo testnet
      },
    },
  ],
  plugins: [
    react()
  ],
})