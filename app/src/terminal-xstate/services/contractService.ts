/**
 * @fileoverview Contract service for dynamic ABI imports and configuration
 * @description Provides centralized contract configuration for terminal integration
 */

import AishiAgentABI from '../../abi/AishiAgentABI.json';

export interface ContractConfig {
  address: `0x${string}`;
  abi: any[];
  chainId: number;
  contractName: string;
  network: string;
}

/**
 * Get the AishiAgent contract configuration
 * Dynamically imports contract address and ABI from JSON file
 */
export const getContractConfig = (): ContractConfig => ({
  address: AishiAgentABI.address as `0x${string}`,
  abi: AishiAgentABI.abi,
  chainId: AishiAgentABI.chainId,
  contractName: AishiAgentABI.contractName,
  network: AishiAgentABI.network
});

/**
 * Get specific contract function names for type safety
 */
export const ContractFunctions = {
  AGENTS: 'agents',
  OWNER_TO_TOKEN_ID: 'ownerToTokenId',
  GET_PERSONALITY_TRAITS: 'getPersonalityTraits',
  GET_AGENT_MEMORY: 'getAgentMemory',
  MINT_AGENT: 'mintAgent'
} as const;