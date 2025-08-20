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
  GET_MEMORY_ACCESS: 'getMemoryAccess',
  GET_UNIQUE_FEATURES: 'getUniqueFeatures',
  CAN_PROCESS_DREAM_TODAY: 'canProcessDreamToday',
  PROCESS_DAILY_DREAM: 'processDailyDream',
  MINT_AGENT: 'mintAgent',
  // Additional view functions
  GET_CONSOLIDATION_REWARD: 'getConsolidationReward',
  GET_EVOLUTION_STATS: 'getEvolutionStats',
  CONSOLIDATION_STREAK: 'consolidationStreak',
  RESPONSE_STYLES: 'responseStyles',
  PENDING_REWARDS: 'pendingRewards',
  HAS_MILESTONE: 'hasMilestone'
} as const;

/**
 * Helper type for memory structure returned from contract
 */
export interface AgentMemoryStructure {
  memoryCoreHash: string;
  currentDreamDailyHash: string;
  currentConvDailyHash: string;
  lastDreamMonthlyHash: string;
  lastConvMonthlyHash: string;
  lastConsolidation: bigint;
  currentMonth: number;
  currentYear: number;
}

/**
 * Helper type for personality traits from contract
 */
export interface PersonalityTraits {
  creativity: bigint;
  analytical: bigint;
  empathy: bigint;
  intuition: bigint;
  resilience: bigint;
  curiosity: bigint;
  dominantMood: string;
}

/**
 * Check if a hash is empty (all zeros)
 */
export const isEmptyHash = (hash: string): boolean => {
  const emptyHash = '0x0000000000000000000000000000000000000000000000000000000000000000';
  return !hash || hash === emptyHash || hash === '0x0';
};