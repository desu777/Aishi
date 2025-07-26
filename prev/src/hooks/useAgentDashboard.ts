'use client';

import { useWallet } from './useWallet';
import { useAgentRead } from './agentHooks/useAgentRead';
import { useAgentStats } from './agentHooks/useAgentStats';
import { useAgentConsolidation } from './agentHooks/useAgentConsolidation';
import { useAgentMemoryCore } from './agentHooks/useAgentMemoryCore';

interface AgentDashboardData {
  // Agent info data
  agent: {
    data: any;
    tokenId: number | undefined;
    hasAgent: boolean;
    isLoading: boolean;
    error: any;
  };
  
  // Stats data  
  stats: {
    evolutionStats: any;
    uniqueFeatures: any[];
    milestones: any[];
    consolidationStreak: number;
    pendingRewards: any;
    responseStyle: string;
    isLoading: boolean;
    error: string | null;
  };
  
  // System status
  system: {
    wallet: {
      address: string;
      isConnected: boolean;
      isCorrectNetwork: boolean;
      shortAddress: string;
    };
    network: {
      name: string;
      chainId: number;
      isConnected: boolean;
    };
    services: {
      storage: boolean;
      aiProcessing: boolean;
      memorySystem: boolean;
      dreamProcessing: boolean;
    };
  };
  
  // Memory data
  memory: {
    consolidation: any;
    core: any;
    access: any;
    isLoading: boolean;
    error: any;
  };
  
  // Overall loading state
  isLoading: boolean;
  
  // Overall error state
  error: string | null;
}

// Helper function to normalize different error types to string | null
const normalizeError = (error: any): string | null => {
  if (!error) return null;
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  return String(error);
};

export function useAgentDashboard(tokenId?: number): AgentDashboardData {
  // Get wallet status
  const wallet = useWallet();
  
  // Get agent data
  const agentRead = useAgentRead(tokenId);
  const effectiveTokenId = tokenId || agentRead.effectiveTokenId;
  
  // Get agent stats
  const agentStats = useAgentStats(effectiveTokenId);
  
  // Get consolidation status
  const consolidation = useAgentConsolidation(effectiveTokenId);
  
  // Get memory core
  const memoryCore = useAgentMemoryCore(effectiveTokenId);
  
  // Debug logging
  const debugLog = (message: string, data?: any) => {
    if (process.env.NEXT_PUBLIC_DREAM_TEST === 'true') {
      console.log(`[useAgentDashboard] ${message}`, data || '');
    }
  };

  debugLog('useAgentDashboard initialized', {
    tokenId,
    effectiveTokenId,
    hasAgent: agentRead.hasAgent,
    isWalletConnected: wallet.isConnected
  });

  return {
    // Agent info data
    agent: {
      data: agentRead.agentData,
      tokenId: effectiveTokenId,
      hasAgent: agentRead.hasAgent,
      isLoading: agentRead.isLoading,
      error: normalizeError(agentRead.error)
    },
    
    // Stats data
    stats: {
      evolutionStats: agentStats.evolutionStats,
      uniqueFeatures: agentStats.uniqueFeatures,
      milestones: agentStats.milestones,
      consolidationStreak: agentStats.consolidationStreak,
      pendingRewards: agentStats.pendingRewards,
      responseStyle: agentStats.responseStyle,
      isLoading: agentStats.isLoading,
      error: normalizeError(agentStats.error)
    },
    
    // System status
    system: {
      wallet: {
        address: wallet.address || '',
        isConnected: wallet.isConnected,
        isCorrectNetwork: wallet.isCorrectNetwork,
        shortAddress: wallet.shortAddress
      },
      network: {
        name: '0G Galileo Testnet',
        chainId: 16601,
        isConnected: wallet.isCorrectNetwork
      },
      services: {
        storage: wallet.isConnected && wallet.isCorrectNetwork,
        aiProcessing: wallet.isConnected && wallet.isCorrectNetwork,
        memorySystem: wallet.isConnected && agentRead.hasAgent,
        dreamProcessing: wallet.isConnected && agentRead.hasAgent && (agentRead.canProcessDreamToday || false)
      }
    },
    
    // Memory data
    memory: {
      consolidation: consolidation,
      core: memoryCore,
      access: agentRead.memoryAccess,
      isLoading: consolidation.consolidationState.isCheckingNeed || 
                memoryCore.memoryCoreState.isCheckingYearlyReflection ||
                memoryCore.memoryCoreState.isLoadingMonthlyData ||
                memoryCore.isProcessing,
      error: normalizeError(consolidation.consolidationState.error) || 
             normalizeError(memoryCore.memoryCoreState.error)
    },
    
    // Overall loading state
    isLoading: agentRead.isLoading || agentStats.isLoading || consolidation.consolidationState.isCheckingNeed || 
              memoryCore.memoryCoreState.isCheckingYearlyReflection ||
              memoryCore.memoryCoreState.isLoadingMonthlyData ||
              memoryCore.isProcessing,
    
    // Overall error state
    error: normalizeError(agentRead.error) || 
           normalizeError(agentStats.error) || 
           normalizeError(consolidation.consolidationState.error) || 
           normalizeError(memoryCore.memoryCoreState.error)
  };
}