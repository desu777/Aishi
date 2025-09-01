/**
 * @fileoverview Contract configuration for Aishi mint module
 * @description Provides centralized contract configuration and constants for agent minting
 */

import { parseEther } from 'viem';
import { aishiAgentAbi, aishiAgentAddress } from '../../../generated';

/**
 * @returns Contract configuration with type-safe ABI for minting operations
 */
export const getContractConfig = () => ({
  address: aishiAgentAddress[16601],
  abi: aishiAgentAbi,
  chainId: 16601,
  contractName: 'AishiAgent',
  network: 'galileo'
} as const);

// Minting-specific constants
export const MINTING_FEE = parseEther('0.1'); // 0.1 OG
export const MAX_NAME_LENGTH = 32;
export const MAX_AGENTS = Number(process.env.NEXT_PUBLIC_AGENTS) || 50;