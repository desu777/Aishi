/**
 * @fileoverview Local contract configuration for agent hooks
 * @description Provides centralized contract configuration specifically for agentHooks module
 */

import { aishiAgentAbi } from '../../../generated';

export interface ContractConfig {
  address: `0x${string}`;
  abi: readonly any[];
  chainId: number;
  contractName: string;
  network: string;
}

/**
 * @returns Contract configuration with type-safe ABI for agent hooks
 */
export const getContractConfig = (): ContractConfig => ({
  address: process.env.NEXT_PUBLIC_AISHI_AGENT_ADDRESS as `0x${string}` || '0x5Bc063f0eeFa5D90831FD2b4AF33D1529c993bFe',
  abi: aishiAgentAbi,
  chainId: 16601,
  contractName: 'AishiAgent',
  network: 'galileo'
} as const);