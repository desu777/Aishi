/**
 * @fileoverview Contract configuration for API routes
 * @description Provides centralized contract configuration and storage settings for API endpoints
 */

import { aishiAgentAbi } from '../../../generated';

/**
 * @returns Contract configuration with type-safe ABI for API operations
 */
export const getContractConfig = () => ({
  address: process.env.NEXT_PUBLIC_AISHI_AGENT_ADDRESS as `0x${string}` || '0x5Bc063f0eeFa5D90831FD2b4AF33D1529c993bFe',
  abi: aishiAgentAbi,
  chainId: 16601,
  contractName: 'AishiAgent',
  network: 'galileo'
} as const);

/**
 * 0G Storage configuration for API routes
 */
export const STORAGE_CONFIG = {
  storageRpc: process.env.NEXT_PUBLIC_TURBO_STORAGE_RPC || 'https://indexer-storage-testnet-turbo.0g.ai',
  l1Rpc: process.env.NEXT_PUBLIC_L1_RPC || 'https://evmrpc-testnet.0g.ai'
};