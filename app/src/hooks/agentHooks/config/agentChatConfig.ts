/**
 * Configuration for Agent Chat functionality
 */

import { getContractConfig } from './contractConfig';
import { StorageConfig, ComputeConfig } from '../types/agentChatTypes';

// Contract configuration
export const contractConfig = getContractConfig();

// 0G Storage configuration - używamy te same URL co useAgentDream
export const STORAGE_CONFIG: StorageConfig = {
  storageRpc: process.env.NEXT_PUBLIC_TURBO_STORAGE_RPC || 'https://indexer-storage-testnet-turbo.0g.ai',
  l1Rpc: process.env.NEXT_PUBLIC_L1_RPC || 'https://evmrpc-testnet.0g.ai'
};

// 0G Compute configuration
export const COMPUTE_CONFIG: ComputeConfig = {
  backendUrl: process.env.NEXT_PUBLIC_COMPUTE_API_URL || 'http://localhost:3001/api'
};

// Network configuration
export const NETWORK_CONFIG = {
  chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '16601')
}; 