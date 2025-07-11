'use client';

import { useReadContract } from 'wagmi'
import contractData from '../../abi/frontend-contracts.json'
import { useWallet } from '../useWallet'
import { Address } from 'viem'

// Debug function
const debugLog = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[useAgentRead] ${message}`, data ? data : '');
  }
};

export function useAgentRead(tokenId?: number) {
  const { address } = useWallet()
  const contractAddress = contractData.galileo.DreamscapeAgent.address as Address
  const contractAbi = contractData.galileo.DreamscapeAgent.abi

  // Pobierz tokenId dla zalogowanego użytkownika
  const { data: userTokenId, isLoading: tokenIdLoading, error: tokenIdError } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'ownerToTokenId',
    args: address ? [address] : undefined,
  })

  // Użyj tokenId lub userTokenId jako efectiveTokenId
  const effectiveTokenId = tokenId || (userTokenId ? Number(userTokenId) : undefined)
  const shouldLoadData = effectiveTokenId && effectiveTokenId > 0

  debugLog('useAgentRead initialized', {
    tokenId,
    userTokenId: userTokenId ? Number(userTokenId) : undefined,
    effectiveTokenId,
    shouldLoadData,
    address
  });

  // Pobierz dane agenta (zastępuje getAgentInfo)
  const { data: agentData, isLoading: agentLoading, error: agentError } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'agents',
    args: shouldLoadData ? [BigInt(effectiveTokenId)] : undefined,
    query: {
      enabled: shouldLoadData,
    },
  })

  // Pobierz cechy osobowości agenta - NOWA FUNKCJA getPersonalityTraits()
  const { data: personalityTraits, isLoading: personalityTraitsLoading, error: personalityTraitsError } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'getPersonalityTraits',
    args: shouldLoadData ? [BigInt(effectiveTokenId)] : undefined,
    query: {
      enabled: shouldLoadData,
    },
  })

  // Pobierz pamięć agenta
  const { data: memoryData, isLoading: memoryLoading, error: memoryError } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'getAgentMemory',
    args: shouldLoadData ? [BigInt(effectiveTokenId)] : undefined,
    query: {
      enabled: shouldLoadData,
    },
  })

  debugLog('Raw contract data', {
    agentData: agentData ? 'loaded' : 'null',
    personalityTraits: personalityTraits ? 'loaded' : 'null',
    memoryData: memoryData ? 'loaded' : 'null',
    memoryError: memoryError ? memoryError.message : 'no error',
    effectiveTokenId
  });

  if (memoryData) {
    debugLog('Memory data details', {
      memoryCoreHash: (memoryData as any).memoryCoreHash,
      currentDreamDailyHash: (memoryData as any).currentDreamDailyHash,
      currentConvDailyHash: (memoryData as any).currentConvDailyHash,
      lastDreamMonthlyHash: (memoryData as any).lastDreamMonthlyHash,
      lastConvMonthlyHash: (memoryData as any).lastConvMonthlyHash,
      lastConsolidation: (memoryData as any).lastConsolidation,
      currentMonth: (memoryData as any).currentMonth,
      currentYear: (memoryData as any).currentYear
    });
  } else {
    debugLog('Memory data is null/undefined', { memoryData });
  }

  // NOWA FUNKCJA: Sprawdź czy można przetwarzać sen dzisiaj
  const { data: canProcessDreamToday, isLoading: canProcessLoading, error: canProcessError } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'canProcessDreamToday',
    args: shouldLoadData ? [BigInt(effectiveTokenId)] : undefined,
    query: {
      enabled: shouldLoadData,
    },
  })

  // NOWA FUNKCJA: Pobierz dostęp do pamięci
  const { data: memoryAccess, isLoading: memoryAccessLoading, error: memoryAccessError } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'getMemoryAccess',
    args: shouldLoadData ? [BigInt(effectiveTokenId)] : undefined,
    query: {
      enabled: shouldLoadData,
    },
  })

  // Kombinuj dane agenta z danymi osobowości
  const combinedAgentData = agentData && personalityTraits ? {
    // Dane podstawowe z agents()
    owner: agentData[0] as Address,
    agentName: agentData[1] as string,
    createdAt: agentData[2] as bigint,
    lastUpdated: agentData[3] as bigint,
    intelligenceLevel: agentData[4] as bigint,
    dreamCount: agentData[5] as bigint,
    conversationCount: agentData[6] as bigint,
    personalityInitialized: agentData[7] as boolean,
    totalEvolutions: agentData[8] as bigint,
    lastEvolutionDate: agentData[9] as bigint,
    
    // Dane osobowości z getPersonalityTraits() - ZAKTUALIZOWANE
    personality: {
      creativity: personalityTraits[0] as number,
      analytical: personalityTraits[1] as number,
      empathy: personalityTraits[2] as number,
      intuition: personalityTraits[3] as number,
      resilience: personalityTraits[4] as number,
      curiosity: personalityTraits[5] as number,
      dominantMood: personalityTraits[6] as string,
      lastDreamDate: personalityTraits[7] as bigint,
      // Dodaj unikalne features z getPersonalityTraits()
      uniqueFeatures: personalityTraits[8] as Array<{
        name: string;
        description: string;
        intensity: number;
        addedAt: bigint;
      }>,
    },
    
    // Dane pamięci z getAgentMemory()
    memory: memoryData ? {
      memoryCoreHash: (memoryData as any).memoryCoreHash as `0x${string}`,
      currentDreamDailyHash: (memoryData as any).currentDreamDailyHash as `0x${string}`,
      currentConvDailyHash: (memoryData as any).currentConvDailyHash as `0x${string}`,
      lastDreamMonthlyHash: (memoryData as any).lastDreamMonthlyHash as `0x${string}`,
      lastConvMonthlyHash: (memoryData as any).lastConvMonthlyHash as `0x${string}`,
      lastConsolidation: (memoryData as any).lastConsolidation as bigint,
      currentMonth: (memoryData as any).currentMonth as number,
      currentYear: (memoryData as any).currentYear as number,
    } : undefined
  } : undefined

  debugLog('Combined agent data', {
    hasAgentData: !!agentData,
    hasPersonalityTraits: !!personalityTraits,
    hasMemoryData: !!memoryData,
    hasCombinedData: !!combinedAgentData,
    hasMemoryInCombined: !!combinedAgentData?.memory,
    currentDreamDailyHash: combinedAgentData?.memory?.currentDreamDailyHash || 'missing'
  });

  return {
    // Dane agenta
    agentData: combinedAgentData,
    isLoading: agentLoading || personalityTraitsLoading || memoryLoading || canProcessLoading || memoryAccessLoading,
    error: agentError || personalityTraitsError || memoryError || canProcessError || memoryAccessError,
    
    // TokenId użytkownika
    userTokenId: userTokenId ? Number(userTokenId) : undefined,
    isLoadingTokenId: tokenIdLoading,
    tokenIdError,
    
    // Sprawdź czy użytkownik ma agenta
    hasAgent: userTokenId ? Number(userTokenId) > 0 : false,
    
    // Aktualnie używane tokenId
    effectiveTokenId,

    // NOWE FUNKCJE - wyeksportowane z hook'a
    canProcessDreamToday: canProcessDreamToday as boolean,
    isLoadingCanProcess: canProcessLoading,
    canProcessError,

    memoryAccess: memoryAccess ? {
      monthsAccessible: memoryAccess[0] as number,
      memoryDepth: memoryAccess[1] as string,
    } : undefined,
    isLoadingMemoryAccess: memoryAccessLoading,
    memoryAccessError,

    // Osobowość z nowymi danymi
    personalityTraits: personalityTraits ? {
      creativity: personalityTraits[0] as number,
      analytical: personalityTraits[1] as number,
      empathy: personalityTraits[2] as number,
      intuition: personalityTraits[3] as number,
      resilience: personalityTraits[4] as number,
      curiosity: personalityTraits[5] as number,
      dominantMood: personalityTraits[6] as string,
      lastDreamDate: personalityTraits[7] as bigint,
      uniqueFeatures: personalityTraits[8] as Array<{
        name: string;
        description: string;
        intensity: number;
        addedAt: bigint;
      }>,
    } : undefined,
    isLoadingPersonalityTraits: personalityTraitsLoading,
    personalityTraitsError,
  }
} 