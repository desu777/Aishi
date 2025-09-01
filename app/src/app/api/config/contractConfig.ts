/**
 * @fileoverview Contract configuration for API routes
 * @description Provides centralized contract configuration and storage settings for API endpoints
 */

import { aishiAgentAbi, aishiAgentAddress } from '../../../generated';

/**
 * @returns Contract configuration with type-safe ABI for API operations
 */
export const getContractConfig = () => ({
  address: aishiAgentAddress[16601],
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