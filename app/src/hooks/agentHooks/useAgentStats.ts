'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '../useWallet';
import { getContractConfig } from './config/contractConfig';
import { getViemProvider } from '../../lib/0g/fees';
import type { PublicClient } from 'viem';

// Types for agent statistics
interface EvolutionStats {
  totalEvolutions: number;
  evolutionRate: number;
  lastEvolution: number;
}

interface UniqueFeature {
  name: string;
  description: string;
  intensity: number;
  addedAt: number;
}

interface MilestoneCheck {
  milestoneName: string;
  achieved: boolean;
  achievedAt: number;
}

interface AgentStatsState {
  evolutionStats: EvolutionStats | null;
  uniqueFeatures: UniqueFeature[];
  milestones: MilestoneCheck[];
  consolidationStreak: number;
  pendingRewards: {
    intelligenceBonus: number;
    specialMilestone: string;
    yearlyReflection: boolean;
  } | null;
  responseStyle: string;
  
  // Loading states
  isLoadingStats: boolean;
  isLoadingFeatures: boolean;
  isLoadingMilestones: boolean;
  isLoadingRewards: boolean;
  
  // Error states
  error: string | null;
}

// Common milestone names to check
const MILESTONE_NAMES = [
  'empathy_master',
  'creativity_boost',
  'analytical_genius',
  'intuitive_wisdom',
  'resilient_spirit',
  'curious_explorer',
  'dream_architect',
  'memory_keeper',
  'conversation_master',
  'intelligence_peak'
];

export function useAgentStats(tokenId?: number) {
  const { isConnected, address } = useWallet();
  const [statsState, setStatsState] = useState<AgentStatsState>({
    evolutionStats: null,
    uniqueFeatures: [],
    milestones: [],
    consolidationStreak: 0,
    pendingRewards: null,
    responseStyle: '',
    isLoadingStats: false,
    isLoadingFeatures: false,
    isLoadingMilestones: false,
    isLoadingRewards: false,
    error: null
  });

  // Debug logging
  const debugLog = (message: string, data?: any) => {
    if (process.env.NEXT_PUBLIC_DREAM_TEST === 'true') {
      console.log(`[useAgentStats] ${message}`, data || '');
    }
  };

  debugLog('useAgentStats hook initialized', { tokenId });

  // Load all agent statistics
  const loadAgentStats = async () => {
    if (!isConnected || !tokenId) {
      setStatsState(prev => ({ ...prev, error: 'Wallet not connected or no tokenId' }));
      return;
    }

    setStatsState(prev => ({ 
      ...prev, 
      isLoadingStats: true,
      isLoadingFeatures: true,
      isLoadingMilestones: true,
      isLoadingRewards: true,
      error: null 
    }));

    try {
      debugLog('Loading agent statistics', { tokenId });

      const [publicClient, publicErr] = await getViemProvider();
      if (!publicClient || publicErr) {
        throw new Error(`PublicClient error: ${publicErr?.message}`);
      }

      const contractConfig = getContractConfig();

      debugLog('PublicClient connected for stats loading');

      const [
        evolutionStatsRaw,
        uniqueFeaturesRaw,
        consolidationStreakRaw,
        pendingRewardsRaw,
        responseStyleRaw
      ] = await Promise.all([
        publicClient.readContract({
          address: contractConfig.address,
          abi: contractConfig.abi,
          functionName: 'getEvolutionStats',
          args: [tokenId]
        }),
        publicClient.readContract({
          address: contractConfig.address,
          abi: contractConfig.abi,
          functionName: 'getUniqueFeatures',
          args: [tokenId]
        }),
        publicClient.readContract({
          address: contractConfig.address,
          abi: contractConfig.abi,
          functionName: 'consolidationStreak',
          args: [tokenId]
        }),
        publicClient.readContract({
          address: contractConfig.address,
          abi: contractConfig.abi,
          functionName: 'pendingRewards',
          args: [tokenId]
        }),
        publicClient.readContract({
          address: contractConfig.address,
          abi: contractConfig.abi,
          functionName: 'responseStyles',
          args: [tokenId]
        })
      ]);

      debugLog('Raw contract data loaded', {
        evolutionStatsRaw,
        uniqueFeaturesCount: uniqueFeaturesRaw?.length || 0,
        consolidationStreakRaw,
        pendingRewardsRaw,
        responseStyleRaw
      });

      // Process evolution stats
      const evolutionStats: EvolutionStats = {
        totalEvolutions: Number(evolutionStatsRaw.totalEvolutions),
        evolutionRate: Number(evolutionStatsRaw.evolutionRate),
        lastEvolution: Number(evolutionStatsRaw.lastEvolution)
      };

      // Process unique features
      const uniqueFeatures: UniqueFeature[] = uniqueFeaturesRaw.map((feature: any) => ({
        name: feature.name,
        description: feature.description,
        intensity: Number(feature.intensity),
        addedAt: Number(feature.addedAt)
      }));

      // Process pending rewards
      const pendingRewards = {
        intelligenceBonus: Number(pendingRewardsRaw.intelligenceBonus),
        specialMilestone: pendingRewardsRaw.specialMilestone,
        yearlyReflection: pendingRewardsRaw.yearlyReflection
      };

      setStatsState(prev => ({
        ...prev,
        evolutionStats,
        uniqueFeatures,
        consolidationStreak: Number(consolidationStreakRaw),
        pendingRewards,
        responseStyle: responseStyleRaw,
        isLoadingStats: false,
        isLoadingFeatures: false,
        isLoadingRewards: false
      }));

      debugLog('Agent statistics loaded successfully', {
        evolutionStats,
        uniqueFeaturesCount: uniqueFeatures.length,
        consolidationStreak: Number(consolidationStreakRaw),
        responseStyle: responseStyleRaw
      });

      // Load milestones separately (they need individual calls)
      await loadMilestones(publicClient, tokenId);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setStatsState(prev => ({
        ...prev,
        isLoadingStats: false,
        isLoadingFeatures: false,
        isLoadingMilestones: false,
        isLoadingRewards: false,
        error: errorMessage
      }));
      debugLog('Failed to load agent statistics', { error: errorMessage });
    }
  };

  // Load milestones (individual calls required)
  const loadMilestones = async (publicClient: PublicClient, tokenId: number) => {
    try {
      debugLog('Loading milestones', { tokenId, milestonesToCheck: MILESTONE_NAMES.length });

      const contractConfig = getContractConfig();
      
      const milestonePromises = MILESTONE_NAMES.map(async (milestoneName) => {
        try {
          const result = await publicClient.readContract({
            address: contractConfig.address,
            abi: contractConfig.abi,
            functionName: 'hasMilestone',
            args: [tokenId, milestoneName]
          });
          return {
            milestoneName,
            achieved: result.achieved,
            achievedAt: Number(result.at)
          };
        } catch (error) {
          debugLog(`Failed to check milestone ${milestoneName}`, { error });
          return {
            milestoneName,
            achieved: false,
            achievedAt: 0
          };
        }
      });

      const milestones = await Promise.all(milestonePromises);
      
      setStatsState(prev => ({
        ...prev,
        milestones,
        isLoadingMilestones: false
      }));

      debugLog('Milestones loaded successfully', {
        totalMilestones: milestones.length,
        achievedMilestones: milestones.filter(m => m.achieved).length
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setStatsState(prev => ({
        ...prev,
        isLoadingMilestones: false,
        error: errorMessage
      }));
      debugLog('Failed to load milestones', { error: errorMessage });
    }
  };

  // Auto-load when tokenId changes
  useEffect(() => {
    if (tokenId && isConnected) {
      loadAgentStats();
    }
  }, [tokenId, isConnected]);

  // Reset stats when disconnected
  useEffect(() => {
    if (!isConnected) {
      setStatsState({
        evolutionStats: null,
        uniqueFeatures: [],
        milestones: [],
        consolidationStreak: 0,
        pendingRewards: null,
        responseStyle: '',
        isLoadingStats: false,
        isLoadingFeatures: false,
        isLoadingMilestones: false,
        isLoadingRewards: false,
        error: null
      });
    }
  }, [isConnected]);

  return {
    // Data
    evolutionStats: statsState.evolutionStats,
    uniqueFeatures: statsState.uniqueFeatures,
    milestones: statsState.milestones,
    consolidationStreak: statsState.consolidationStreak,
    pendingRewards: statsState.pendingRewards,
    responseStyle: statsState.responseStyle,
    
    // Loading states
    isLoadingStats: statsState.isLoadingStats,
    isLoadingFeatures: statsState.isLoadingFeatures,
    isLoadingMilestones: statsState.isLoadingMilestones,
    isLoadingRewards: statsState.isLoadingRewards,
    isLoading: statsState.isLoadingStats || statsState.isLoadingFeatures || statsState.isLoadingMilestones || statsState.isLoadingRewards,
    
    // Actions
    loadAgentStats,
    
    // Error handling
    error: statsState.error,
    clearError: () => setStatsState(prev => ({ ...prev, error: null }))
  };
} 