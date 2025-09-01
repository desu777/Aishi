/**
 * @fileoverview Local contract configuration for agent hooks
 * @description Provides centralized contract configuration specifically for agentHooks module
 */

import { aishiAgentAbi, aishiAgentAddress } from '../../../generated';

export interface ContractConfig {
  address: `0x${string}`;
  abi: typeof aishiAgentAbi;
  chainId: number;
  contractName: string;
  network: string;
}

/**
 * @returns Contract configuration with type-safe ABI for agent hooks
 */
export const getContractConfig = (): ContractConfig => ({
  address: aishiAgentAddress[16601],
  abi: aishiAgentAbi,
  chainId: 16601,
  contractName: 'AishiAgent',
  network: 'galileo'
} as const);