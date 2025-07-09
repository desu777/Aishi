'use client';

import { useAgentRead } from '../../hooks/agentHooks/useAgentRead';
import { useWallet } from '../../hooks/useWallet';
import { useTheme } from '../../contexts/ThemeContext';
import { FC, useEffect, useState } from 'react';

interface AgentInfoProps {
  tokenId?: number;
}

export const AgentInfo: FC<AgentInfoProps> = ({ tokenId }) => {
  const { debugLog } = useTheme();
  const { address } = useWallet();
  const [personalityAverage, setPersonalityAverage] = useState<number>(0);
  
  const { agentData, isLoading, error, userTokenId, hasAgent, effectiveTokenId, isLoadingTokenId } = useAgentRead(tokenId);

  // Oblicz średnią osobowości
  useEffect(() => {
    if (agentData?.personality) {
      const traits = [
        agentData.personality.creativity,
        agentData.personality.analytical,
        agentData.personality.empathy,
        agentData.personality.intuition,
        agentData.personality.resilience,
        agentData.personality.curiosity,
      ];
      const average = traits.reduce((sum, trait) => sum + trait, 0) / traits.length;
      setPersonalityAverage(Math.round(average));
    }
  }, [agentData]);

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    debugLog('AgentInfo state', {
      tokenId,
      hasAgent,
      userTokenId,
      effectiveTokenId,
      isLoading,
      isLoadingTokenId,
      agentData: agentData ? {
        agentName: agentData.agentName,
        intelligenceLevel: agentData.intelligenceLevel?.toString(),
        dreamCount: agentData.dreamCount?.toString(),
        conversationCount: agentData.conversationCount?.toString(),
        personalityInitialized: agentData.personalityInitialized,
        dominantMood: agentData.personality?.dominantMood,
      } : null,
      error: error?.message || 'No error'
    });
  }

  // Pokaż loading tylko gdy ładujemy tokenId lub dane agenta
  if (isLoadingTokenId || (hasAgent && isLoading)) {
    return (
      <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-6">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-400">Loading agent information...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-400">
        <p className="font-medium">Error loading agent information:</p>
        <p className="text-sm mt-1">{error.message}</p>
        <p className="text-xs mt-2 text-red-300">
          Debug: tokenId={tokenId}, userTokenId={userTokenId}, effectiveTokenId={effectiveTokenId}
        </p>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4 text-yellow-400">
        Please connect your wallet to view agent information.
      </div>
    );
  }

  if (!hasAgent) {
    return (
      <div className="bg-gray-900/20 border border-gray-500/50 rounded-lg p-4 text-gray-400">
        You don't have an agent yet. Create one to get started!
      </div>
    );
  }

  if (!agentData) {
    return (
      <div className="bg-gray-900/20 border border-gray-500/50 rounded-lg p-4 text-gray-400">
        {effectiveTokenId ? `Agent with ID ${effectiveTokenId} not found or data not loaded yet.` : 'Agent data not available.'}
      </div>
    );
  }

  // Formatuj daty
  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString();
  };

  const formatTime = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  return (
    <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-6 space-y-6">
      
      {/* Agent Profile */}
      <div className="border-b border-gray-700/50 pb-4">
        <h3 className="text-xl font-bold text-white mb-4">Agent Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-sm">Agent Name</p>
            <p className="text-white font-medium">{agentData.agentName}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Token ID</p>
            <p className="text-white font-medium">{effectiveTokenId}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Created</p>
            <p className="text-white font-medium">{formatDate(agentData.createdAt)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Last Updated</p>
            <p className="text-white font-medium">{formatTime(agentData.lastUpdated)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Intelligence Level</p>
            <p className="text-white font-medium">{agentData.intelligenceLevel.toString()}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Personality Initialized</p>
            <p className={`font-medium ${agentData.personalityInitialized ? 'text-green-400' : 'text-red-400'}`}>
              {agentData.personalityInitialized ? 'Yes' : 'No'}
            </p>
          </div>
        </div>
      </div>

      {/* Agent Statistics */}
      <div className="border-b border-gray-700/50 pb-4">
        <h3 className="text-xl font-bold text-white mb-4">Agent Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">{agentData.dreamCount.toString()}</p>
            <p className="text-gray-400 text-sm">Dreams</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">{agentData.conversationCount.toString()}</p>
            <p className="text-gray-400 text-sm">Conversations</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-400">{agentData.totalEvolutions.toString()}</p>
            <p className="text-gray-400 text-sm">Evolutions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-400">{personalityAverage}</p>
            <p className="text-gray-400 text-sm">Personality Avg</p>
          </div>
        </div>
      </div>

      {/* Personality Traits */}
      {agentData.personality && (
        <div className="border-b border-gray-700/50 pb-4">
          <h3 className="text-xl font-bold text-white mb-4">Personality Traits</h3>
          <div className="space-y-3">
            {[
              { name: 'Creativity', value: agentData.personality.creativity, color: 'bg-purple-500' },
              { name: 'Analytical', value: agentData.personality.analytical, color: 'bg-blue-500' },
              { name: 'Empathy', value: agentData.personality.empathy, color: 'bg-green-500' },
              { name: 'Intuition', value: agentData.personality.intuition, color: 'bg-yellow-500' },
              { name: 'Resilience', value: agentData.personality.resilience, color: 'bg-red-500' },
              { name: 'Curiosity', value: agentData.personality.curiosity, color: 'bg-pink-500' },
            ].map((trait) => (
              <div key={trait.name} className="flex items-center space-x-3">
                <div className="w-20 text-sm text-gray-400">{trait.name}</div>
                <div className="flex-1 bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${trait.color}`}
                    style={{ width: `${trait.value}%` }}
                  />
                </div>
                <div className="w-8 text-sm text-white">{trait.value}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
            <p className="text-gray-400 text-sm">Dominant Mood</p>
            <p className="text-white font-medium">{agentData.personality.dominantMood}</p>
          </div>
        </div>
      )}

      {/* Memory System */}
      {agentData.memory && (
        <div className="border-b border-gray-700/50 pb-4">
          <h3 className="text-xl font-bold text-white mb-4">Memory System</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Current Month</p>
              <p className="text-white font-medium">{agentData.memory.currentMonth}/{agentData.memory.currentYear}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Last Consolidation</p>
              <p className="text-white font-medium">
                {agentData.memory.lastConsolidation > 0 ? formatTime(agentData.memory.lastConsolidation) : 'Never'}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Memory Core Hash</p>
              <p className="text-white font-mono text-xs">{agentData.memory.memoryCoreHash}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Current Dream Hash</p>
              <p className="text-white font-mono text-xs">{agentData.memory.currentDreamDailyHash}</p>
            </div>
          </div>
        </div>
      )}

      {/* Network Information */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Network Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-sm">Owner</p>
            <p className="text-white font-mono text-xs">{agentData.owner}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Network</p>
            <p className="text-white font-medium">Galileo Testnet</p>
          </div>
        </div>
      </div>
    </div>
  );
}; 