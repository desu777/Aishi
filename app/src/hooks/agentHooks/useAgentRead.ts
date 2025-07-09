'use client';

import { useReadContract } from 'wagmi'
import contractData from '../../abi/frontend-contracts.json'
import { useWallet } from '../useWallet'
import { Address } from 'viem'

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

  // Pobierz cechy osobowości agenta
  const { data: personalityData, isLoading: personalityLoading, error: personalityError } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'agentPersonalities',
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

  // Kombinuj dane agenta z danymi osobowości
  const combinedAgentData = agentData && personalityData ? {
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
    
    // Dane osobowości z agentPersonalities()
    personality: {
      creativity: personalityData[0] as number,
      analytical: personalityData[1] as number,
      empathy: personalityData[2] as number,
      intuition: personalityData[3] as number,
      resilience: personalityData[4] as number,
      curiosity: personalityData[5] as number,
      dominantMood: personalityData[6] as string,
      lastDreamDate: personalityData[7] as bigint,
    },
    
    // Dane pamięci z getAgentMemory()
    memory: memoryData ? {
      memoryCoreHash: memoryData[0] as `0x${string}`,
      currentDreamDailyHash: memoryData[1] as `0x${string}`,
      currentConvDailyHash: memoryData[2] as `0x${string}`,
      lastDreamMonthlyHash: memoryData[3] as `0x${string}`,
      lastConvMonthlyHash: memoryData[4] as `0x${string}`,
      lastConsolidation: memoryData[5] as bigint,
      currentMonth: memoryData[6] as number,
      currentYear: memoryData[7] as number,
    } : undefined
  } : undefined

  return {
    // Dane agenta
    agentData: combinedAgentData,
    isLoading: agentLoading || personalityLoading || memoryLoading,
    error: agentError || personalityError || memoryError,
    
    // TokenId użytkownika
    userTokenId: userTokenId ? Number(userTokenId) : undefined,
    isLoadingTokenId: tokenIdLoading,
    tokenIdError,
    
    // Sprawdź czy użytkownik ma agenta
    hasAgent: userTokenId ? Number(userTokenId) > 0 : false,
    
    // Aktualnie używane tokenId
    effectiveTokenId,
  }
} 