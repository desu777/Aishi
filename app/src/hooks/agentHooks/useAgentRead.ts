'use client';

import { useReadContract, useAccount } from 'wagmi';
import { Address } from 'viem';
import { useTheme } from '../../contexts/ThemeContext';
import { galileoTestnet } from '../../config/chains';
import contractData from '../../abi/frontend-contracts.json';

// Contract configuration
const contractConfig = {
  address: contractData.galileo.DreamscapeAgent.address as Address,
  abi: contractData.galileo.DreamscapeAgent.abi,
  chainId: galileoTestnet.id,
} as const;

// TypeScript interfaces from ABI
interface AgentInfo {
  tokenId: bigint;
  owner: Address;
  agentName: string;
  createdAt: bigint;
  lastUpdated: bigint;
  intelligenceLevel: bigint;
  dreamCount: bigint;
  conversationCount: bigint;
  personalityInitialized: boolean;
  totalEvolutions: bigint;
  lastEvolutionDate: bigint;
  personality: PersonalityTraits;
}

interface PersonalityTraits {
  creativity: number;
  analytical: number;
  empathy: number;
  intuition: number;
  resilience: number;
  curiosity: number;
  dominantMood: string;
  lastDreamDate: bigint;
}

interface EvolutionStats {
  totalEvolutions: bigint;
  evolutionRate: bigint;
  lastEvolution: bigint;
}

/**
 * Hook for reading Dream Agent data from contract
 * Provides read-only access to agent information, personality traits, and statistics
 */
export function useAgentRead() {
  const { debugLog } = useTheme();
  const { address } = useAccount();

  // Get user's agent info via ownerToTokenId + getAgentInfo
  const { data: userTokenIdFromMapping } = useReadContract({
    ...contractConfig,
    functionName: 'ownerToTokenId',
    args: [address as Address],
    query: {
      enabled: !!address,
    },
  });

  const { data: userAgent, isLoading: userAgentLoading, error: userAgentError } = useReadContract({
    ...contractConfig,
    functionName: 'getAgentInfo',
    args: [userTokenIdFromMapping as bigint],
    query: {
      enabled: !!address && !!userTokenIdFromMapping && (userTokenIdFromMapping as bigint) > BigInt(0),
    },
  });

  // Get user's token ID
  const { data: userTokenId, isLoading: userTokenIdLoading } = useReadContract({
    ...contractConfig,
    functionName: 'getUserTokenId',
    query: {
      enabled: !!address,
    },
  });

  // Get total agents count
  const { data: totalAgents, isLoading: totalAgentsLoading } = useReadContract({
    ...contractConfig,
    functionName: 'totalAgents',
  });

  // Get total supply
  const { data: totalSupply, isLoading: totalSupplyLoading } = useReadContract({
    ...contractConfig,
    functionName: 'totalSupply',
  });

  // Get total fees collected
  const { data: totalFeesCollected, isLoading: totalFeesLoading } = useReadContract({
    ...contractConfig,
    functionName: 'totalFeesCollected',
  });

  // Get next token ID
  const { data: nextTokenId, isLoading: nextTokenIdLoading } = useReadContract({
    ...contractConfig,
    functionName: 'nextTokenId',
  });

  // Get max agents limit
  const { data: maxAgents, isLoading: maxAgentsLoading } = useReadContract({
    ...contractConfig,
    functionName: 'MAX_AGENTS',
  });

  // Get contract info
  const { data: contractName, isLoading: contractNameLoading } = useReadContract({
    ...contractConfig,
    functionName: 'name',
  });

  const { data: contractSymbol, isLoading: contractSymbolLoading } = useReadContract({
    ...contractConfig,
    functionName: 'symbol',
  });

  // Get user's balance (number of agents owned)
  const { data: userBalance, isLoading: userBalanceLoading } = useReadContract({
    ...contractConfig,
    functionName: 'balanceOf',
    args: [address as Address],
    query: {
      enabled: !!address,
    },
  });

  // Helper function to get agent info by tokenId
  const getAgentInfo = (tokenId: bigint) => {
    const { data, isLoading, error } = useReadContract({
      ...contractConfig,
      functionName: 'getAgentInfo',
      args: [tokenId],
      query: {
        enabled: !!tokenId,
      },
    });

    return { data, isLoading, error };
  };

  // Helper function to get personality traits by tokenId
  const getPersonalityTraits = (tokenId: bigint) => {
    const { data, isLoading, error } = useReadContract({
      ...contractConfig,
      functionName: 'getPersonalityTraits',
      args: [tokenId],
      query: {
        enabled: !!tokenId,
      },
    });

    return { data, isLoading, error };
  };

  // Helper function to get evolution stats by tokenId
  const getEvolutionStats = (tokenId: bigint) => {
    const { data, isLoading, error } = useReadContract({
      ...contractConfig,
      functionName: 'getEvolutionStats',
      args: [tokenId],
      query: {
        enabled: !!tokenId,
      },
    });

    return { data, isLoading, error };
  };

  // Helper function to get dream history by tokenId
  const getDreamHistory = (tokenId: bigint, limit: bigint = BigInt(10)) => {
    const { data, isLoading, error } = useReadContract({
      ...contractConfig,
      functionName: 'getDreamHistory',
      args: [tokenId, limit],
      query: {
        enabled: !!tokenId,
      },
    });

    return { data, isLoading, error };
  };

  // Helper function to get conversation history by tokenId
  const getConversationHistory = (tokenId: bigint, limit: bigint = BigInt(10)) => {
    const { data, isLoading, error } = useReadContract({
      ...contractConfig,
      functionName: 'getConversationHistory',
      args: [tokenId, limit],
      query: {
        enabled: !!tokenId,
      },
    });

    return { data, isLoading, error };
  };

  // Helper function to get owner of token
  const getOwnerOf = (tokenId: bigint) => {
    const { data, isLoading, error } = useReadContract({
      ...contractConfig,
      functionName: 'ownerOf',
      args: [tokenId],
      query: {
        enabled: !!tokenId,
      },
    });

    return { data, isLoading, error };
  };

  // Helper function to get agent name by tokenId
  const getAgentName = (tokenId: bigint) => {
    const { data, isLoading, error } = useReadContract({
      ...contractConfig,
      functionName: 'getAgentName',
      args: [tokenId],
      query: {
        enabled: !!tokenId,
      },
    });

    return { data, isLoading, error };
  };

  // Check if user has an agent - use userBalance instead of userTokenId
  const hasAgent = !userAgentLoading && !userAgentError && userBalance && (userBalance as bigint) > BigInt(0);

  // Use the actual token ID from mapping for display
  const actualUserTokenId = userTokenIdFromMapping || userTokenId;

  // Calculate remaining agents to mint
  const leftToMint = maxAgents && totalAgents 
    ? (maxAgents as bigint) - (totalAgents as bigint)
    : undefined;

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    debugLog('useAgentRead state', {
      hasAgent,
      userTokenId: userTokenId?.toString(),
      userTokenIdFromMapping: userTokenIdFromMapping?.toString(),
      actualUserTokenId: actualUserTokenId?.toString(),
      totalAgents: totalAgents?.toString(),
      maxAgents: maxAgents?.toString(),
      leftToMint: leftToMint?.toString(),
      userBalance: userBalance?.toString(),
    });
  }

  return {
    // User's agent data
    userAgent: userAgent as AgentInfo | undefined,
    userTokenId: actualUserTokenId,
    userAgentLoading,
    userAgentError,
    hasAgent,

    // Contract statistics
    totalAgents,
    totalSupply,
    totalFeesCollected,
    nextTokenId,
    maxAgents,
    leftToMint,
    contractName,
    contractSymbol,

    // User's balance
    userBalance,

    // Loading states
    isLoading: userAgentLoading || totalAgentsLoading || totalSupplyLoading || userTokenIdLoading,
    contractLoading: contractNameLoading || contractSymbolLoading || maxAgentsLoading,

    // Helper functions for specific queries
    getAgentInfo,
    getPersonalityTraits,
    getEvolutionStats,
    getDreamHistory,
    getConversationHistory,
    getOwnerOf,
    getAgentName,

    // Contract info
    contractAddress: contractConfig.address,
    chainId: contractConfig.chainId,
  };
} 