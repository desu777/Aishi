/**
 * @fileoverview Dream Machine Services
 * @description All services for fetching context, building prompts, and AI analysis
 */

import { fromPromise } from 'xstate';
import { createPublicClient, http } from 'viem';
import { galileoTestnet } from '../../config/chains';
import { getContractConfig } from '../services/contractService';
import { DreamContext, AIResponse, defaultAgentData } from '../types/contextTypes';
import { convertBigIntToString } from '../utils/jsonSerializer';
import { XStateStorageService } from '../services/xstateStorage';
import { buildMockDreamContext, sendMockDreamAnalysis } from '../mocks/dreamMocks';

// Debug logging
const debugLog = (message: string, data?: any) => {
  if (process.env.NEXT_PUBLIC_XSTATE_TERMINAL === 'true' || process.env.NEXT_PUBLIC_DREAM_TEST === 'true') {
    console.log(`[DreamMachine] ${message}`, data || '');
  }
};

// Helper function for retry logic
const fetchWithRetry = async <T>(fn: () => Promise<T>, retries = 3, name = 'data'): Promise<T | undefined> => {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await fn();
      
      // Check if data is complete (not undefined)
      if (result !== undefined && result !== null) {
        // Special handling for AgentData - check both named props and array
        if (name === 'AgentData') {
          const hasNamedProps = (result as any).agentName !== undefined;
          const hasArrayData = Array.isArray(result) && (result as any)[1] !== undefined;
          
          if (hasNamedProps || hasArrayData) {
            debugLog(`[SUCCESS] ${name} fetched successfully on attempt ${i + 1}`, {
              hasNamedProps,
              hasArrayData,
              agentName: hasNamedProps ? (result as any).agentName : (result as any)[1]
            });
            return result;
          }
        } else {
          // For other data types, just check if not undefined
          debugLog(`[SUCCESS] ${name} fetched successfully on attempt ${i + 1}`);
          return result;
        }
      }
      
      // If undefined or incomplete, retry
      if (i < retries - 1) {
        const delay = 1000 * (i + 1); // Progressive delay: 1000ms, 2000ms, 3000ms
        debugLog(`[WARNING] Attempt ${i + 1} for ${name} returned incomplete data, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (error) {
      if (i === retries - 1) {
        debugLog(`[ERROR] Failed to fetch ${name} after ${retries} attempts`, { error: String(error) });
        throw error;
      }
      const delay = 1000 * (i + 1);
      debugLog(`[WARNING] Attempt ${i + 1} for ${name} failed, retrying in ${delay}ms...`, { error: String(error) });
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  debugLog(`[WARNING] Returning undefined for ${name} after ${retries} attempts`);
  return undefined;
};

// Service: Fetch dream context from blockchain
export const fetchContextService = fromPromise(async ({ input }: { input: { dreamText: string; tokenId?: number; agentName?: string; continueWithoutMemory?: boolean } }) => {
  debugLog('=== BANDYCKA JAZDA: Fetching REAL dream context ===', { 
    dreamLength: input.dreamText.length,
    tokenId: input.tokenId || defaultAgentData.tokenId,
    agentName: input.agentName || 'Unknown',
    continueWithoutMemory: input.continueWithoutMemory || false
  });
  
  try {
    // Use provided data or fall back to defaults
    const effectiveTokenId = input.tokenId || defaultAgentData.tokenId;
    const effectiveAgentName = input.agentName || 'Unknown';
    
    // 1. Create viem public client
    const contractConfig = getContractConfig();
    const publicClient = createPublicClient({
      chain: galileoTestnet,
      transport: http()
    });
    
    debugLog('Created viem PublicClient', {
      chainId: galileoTestnet.id,
      rpcUrl: galileoTestnet.rpcUrls.default.http[0],
      contractAddress: contractConfig.address
    });
    
    // 2. Fetch agent memory from contract with retry
    const memoryData = await fetchWithRetry(
      () => publicClient.readContract({
        address: contractConfig.address,
        abi: contractConfig.abi,
        functionName: 'getAgentMemory',
        args: [BigInt(effectiveTokenId)]
      }),
      3,
      'AgentMemory'
    ) as any;
    
    // Handle undefined memory data
    if (!memoryData) {
      debugLog('[WARNING] Memory data undefined after retries, using empty hashes');
    } else {
      debugLog('[DATA] Contract memory data fetched', {
        memoryCoreHash: memoryData.memoryCoreHash,
        currentDreamDailyHash: memoryData.currentDreamDailyHash,
        currentConvDailyHash: memoryData.currentConvDailyHash,
        lastDreamMonthlyHash: memoryData.lastDreamMonthlyHash,
        lastConvMonthlyHash: memoryData.lastConvMonthlyHash
      });
    }
    
    // 3. Fetch agent data from agents mapping
    const agentData = await fetchWithRetry(
      () => publicClient.readContract({
        address: contractConfig.address,
        abi: contractConfig.abi,
        functionName: 'agents',
        args: [BigInt(effectiveTokenId)]
      }),
      3,
      'AgentData'
    ) as any;
    
    // Parse agent data (handle array format from contract)
    // agents mapping returns: owner, agentName, createdAt, lastUpdated, intelligenceLevel, dreamCount, conversationCount, personalityInitialized, totalEvolutions, lastEvolutionDate
    let parsedAgentData: any = {
      agentName: effectiveAgentName,
      intelligenceLevel: 1,
      dreamCount: 0,
      conversationCount: 0,
      totalEvolutions: 0
    };
    
    if (agentData) {
      // Wagmi v2 returns structs as objects with named properties
      if (Array.isArray(agentData)) {
        // Legacy array format (older wagmi/ethers)
        parsedAgentData = {
          owner: agentData[0],
          agentName: agentData[1] || effectiveAgentName,
          createdAt: agentData[2],
          lastUpdated: agentData[3],
          intelligenceLevel: agentData[4] || 1,
          dreamCount: agentData[5] || 0,
          conversationCount: agentData[6] || 0,
          personalityInitialized: agentData[7],
          totalEvolutions: agentData[8] || 0,
          lastEvolutionDate: agentData[9]
        };
      } else {
        // Wagmi v2 format - object with named properties
        parsedAgentData = {
          owner: agentData.owner,
          agentName: agentData.agentName || effectiveAgentName,
          createdAt: agentData.createdAt,
          lastUpdated: agentData.lastUpdated,
          intelligenceLevel: agentData.intelligenceLevel || 1,
          dreamCount: agentData.dreamCount || 0,
          conversationCount: agentData.conversationCount || 0,
          personalityInitialized: agentData.personalityInitialized,
          totalEvolutions: agentData.totalEvolutions || 0,
          lastEvolutionDate: agentData.lastEvolutionDate
        };
      }
      
      debugLog('[AGENT] Agent data parsed', {
        agentName: parsedAgentData.agentName,
        intelligenceLevel: parsedAgentData.intelligenceLevel?.toString(),
        dreamCount: parsedAgentData.dreamCount?.toString()
      });
    } else {
      debugLog('[WARNING] Agent data undefined, using defaults');
    }
    
    // 4. Fetch personality traits
    const personalityTraits = await fetchWithRetry(
      () => publicClient.readContract({
        address: contractConfig.address,
        abi: contractConfig.abi,
        functionName: 'getPersonalityTraits',
        args: [BigInt(effectiveTokenId)]
      }),
      3,
      'PersonalityTraits'
    );
    
    debugLog('[PERSONALITY] Personality traits fetched', {
      traits: convertBigIntToString(personalityTraits)
    });
    
    // 5. Fetch unique features
    const uniqueFeatures = await fetchWithRetry(
      () => publicClient.readContract({
        address: contractConfig.address,
        abi: contractConfig.abi,
        functionName: 'getUniqueFeatures',
        args: [BigInt(effectiveTokenId)]
      }),
      3,
      'UniqueFeatures'
    );
    
    debugLog('[FEATURES] Unique features fetched', {
      featuresCount: Array.isArray(uniqueFeatures) ? uniqueFeatures.length : 0
    });
    
    // 6. Download historical data from 0G Storage
    const storageService = new XStateStorageService();
    const emptyHash = '0x0000000000000000000000000000000000000000000000000000000000000000';
    
    const historicalData = {
      dailyDreams: [] as any[],
      monthlyConsolidations: [] as any[],
      yearlyCore: null as any
    };
    
    // Download current daily dreams if hash exists (unless skipping memory)
    if (input.continueWithoutMemory) {
      debugLog('[INFO] Skipping memory download (continuing without memory)');
      historicalData.dailyDreams = [];
    } else if (memoryData?.currentDreamDailyHash && memoryData.currentDreamDailyHash !== emptyHash) {
      debugLog('[DOWNLOAD] Downloading daily dreams from storage', { 
        hash: memoryData.currentDreamDailyHash 
      });
      
      try {
        const result = await storageService.downloadJson(memoryData.currentDreamDailyHash);
        if (result.success && result.data) {
          historicalData.dailyDreams = Array.isArray(result.data) ? result.data : [];
          debugLog('[SUCCESS] Daily dreams downloaded successfully', {
            count: historicalData.dailyDreams.length,
            preview: historicalData.dailyDreams.slice(0, 2).map(d => ({
              id: d.id,
              date: d.date,
              emotions: d.emotions?.slice(0, 3)
            }))
          });
        } else {
          debugLog('[WARNING] Failed to download daily dreams', { error: result.error });
          // Throw error to trigger memoryDownloadFailed state
          throw new Error(`Failed to download daily dreams: ${result.error || 'File not found'}`);
        }
      } catch (error) {
        debugLog('[ERROR] Error downloading daily dreams', { error: String(error) });
        // Re-throw to trigger the error state
        throw error;
      }
    } else {
      debugLog('[INFO] No daily dreams hash available');
    }
    
    // Download monthly consolidations if hash exists
    if (!input.continueWithoutMemory && memoryData?.lastDreamMonthlyHash && memoryData.lastDreamMonthlyHash !== emptyHash) {
      debugLog('[DOWNLOAD] Downloading monthly consolidations from storage', { 
        hash: memoryData.lastDreamMonthlyHash 
      });
      
      try {
        const result = await storageService.downloadJson(memoryData.lastDreamMonthlyHash);
        if (result.success && result.data) {
          historicalData.monthlyConsolidations = Array.isArray(result.data) ? result.data : [result.data];
          debugLog('[SUCCESS] Monthly consolidations downloaded', {
            count: historicalData.monthlyConsolidations.length
          });
        } else {
          debugLog('[WARNING] Failed to download monthly consolidations', { error: result.error });
        }
      } catch (error) {
        debugLog('[ERROR] Error downloading monthly consolidations', { error: String(error) });
      }
    } else {
      debugLog('[INFO] No monthly consolidation hash available');
    }
    
    // Download memory core if hash exists
    if (!input.continueWithoutMemory && memoryData?.memoryCoreHash && memoryData.memoryCoreHash !== emptyHash) {
      debugLog('[DOWNLOAD] Downloading memory core from storage', { 
        hash: memoryData.memoryCoreHash 
      });
      
      try {
        const result = await storageService.downloadJson(memoryData.memoryCoreHash);
        if (result.success && result.data) {
          historicalData.yearlyCore = result.data;
          debugLog('[SUCCESS] Memory core downloaded');
        } else {
          debugLog('[WARNING] Failed to download memory core', { error: result.error });
        }
      } catch (error) {
        debugLog('[ERROR] Error downloading memory core', { error: String(error) });
      }
    } else {
      debugLog('[INFO] No memory core hash available');
    }
    
    // 7. Calculate memory access based on intelligence level
    const intelligenceLevel = Number(parsedAgentData.intelligenceLevel || 0);
    const calculateMemoryAccess = (level: number): number => {
      if (level <= 5) return 1;
      if (level <= 10) return 3;
      if (level <= 20) return 6;
      return 12;
    };
    
    const getMemoryDepthString = (level: number): string => {
      if (level <= 5) return 'shallow';
      if (level <= 10) return 'moderate';
      if (level <= 20) return 'deep';
      return 'profound';
    };
    
    // 8. Build complete context with proper structure
    // Handle undefined personalityTraits with fallback to defaults
    const personalityData = personalityTraits || defaultAgentData.personality;
    
    const dreamContext: DreamContext = {
      userDream: input.dreamText,
      agentProfile: {
        name: parsedAgentData.agentName || effectiveAgentName,
        intelligenceLevel: intelligenceLevel,
        dreamCount: Number(parsedAgentData.dreamCount || 0),
        conversationCount: Number(parsedAgentData.conversationCount || 0)
      },
      // FIXED: personality at root level, not in agentProfile
      personality: {
        creativity: personalityData.creativity || 50,
        analytical: personalityData.analytical || 50,
        empathy: personalityData.empathy || 50,
        intuition: personalityData.intuition || 50,
        resilience: personalityData.resilience || 50,
        curiosity: personalityData.curiosity || 50,
        dominantMood: personalityData.dominantMood || 'neutral',
        responseStyle: 'responseStyle' in personalityData ? personalityData.responseStyle : 'balanced'
      },
      // FIXED: uniqueFeatures at root level
      uniqueFeatures: Array.isArray(uniqueFeatures) ? uniqueFeatures : [],
      memoryAccess: {
        monthsAccessible: calculateMemoryAccess(intelligenceLevel),
        memoryDepth: getMemoryDepthString(intelligenceLevel)
      },
      // FIXED: proper historicalData structure
      historicalData: {
        dailyDreams: historicalData.dailyDreams,
        monthlyConsolidations: historicalData.monthlyConsolidations,
        yearlyCore: historicalData.yearlyCore
      },
      // Add memoryData for file management
      memoryData: memoryData ? {
        memoryCoreHash: memoryData.memoryCoreHash || '',
        currentDreamDailyHash: memoryData.currentDreamDailyHash || '',
        currentConvDailyHash: memoryData.currentConvDailyHash || '',
        lastDreamMonthlyHash: memoryData.lastDreamMonthlyHash || '',
        lastConvMonthlyHash: memoryData.lastConvMonthlyHash || '',
        lastConsolidation: memoryData.lastConsolidation,
        currentMonth: memoryData.currentMonth,
        currentYear: memoryData.currentYear
      } : undefined
    };
    
    debugLog('[COMPLETE] REAL context built successfully', {
      agentName: dreamContext.agentProfile.name,
      dreamCount: dreamContext.agentProfile.dreamCount,
      intelligenceLevel: dreamContext.agentProfile.intelligenceLevel,
      memoryDepth: dreamContext.memoryAccess.memoryDepth,
      monthsAccessible: dreamContext.memoryAccess.monthsAccessible,
      personalityLoaded: !!personalityTraits,
      historicalDreamsCount: dreamContext.historicalData.dailyDreams.length,
      hasMonthlyData: dreamContext.historicalData.monthlyConsolidations.length > 0,
      hasYearlyCore: !!dreamContext.historicalData.yearlyCore
    });
    
    return dreamContext;
    
  } catch (error) {
    debugLog('[ERROR] Failed to fetch dream context', { error: String(error) });
    throw error;
  }
});

// Service: Build dream prompt
export const buildPromptService = fromPromise(async ({ input }: { input: { context: DreamContext } }) => {
  debugLog('Building advanced dream prompt with full consciousness');
  
  try {
    // Dynamic import to prevent circular dependencies
    const { buildAdvancedDreamPrompt } = await import('../services/advancedPromptBuilder');
    
    const promptResult = buildAdvancedDreamPrompt(input.context);
    
    // Combine system and user prompts into a single string for AI service
    const fullPrompt = `${promptResult.systemPrompt}\n\n${promptResult.userPrompt}`;
    
    debugLog('[DATA] Advanced prompt built', {
      promptLength: fullPrompt.length,
      hasHistoricalContext: input.context.historicalData?.dailyDreams?.length > 0,
      intelligenceLevel: input.context.agentProfile.intelligenceLevel,
      isEvolutionDream: promptResult.isEvolutionDream,
      dreamId: promptResult.dreamId
    });
    
    return fullPrompt;
  } catch (error) {
    debugLog('[ERROR] Failed to build prompt', { error: String(error) });
    throw error;
  }
});

// Service: AI analysis with different models
export const aiAnalysisService = fromPromise(async ({ input }: { input: { 
  prompt: string; 
  dreamCount: number;
  modelId?: string;
  walletAddress?: string;
} }) => {
  debugLog('Sending to AI for analysis');
  debugLog('[INFO] Dream analysis parameters', {
    modelId: input.modelId || 'default',
    dreamCount: input.dreamCount,
    promptLength: input.prompt.length
  });
  
  // Log full prompt for verification (only in test mode)
  if (process.env.NEXT_PUBLIC_DREAM_TEST === 'true') {
    debugLog('[FULL PROMPT FOR VERIFICATION - START]');
    debugLog('Full prompt: ' + input.prompt);
    debugLog('[FULL PROMPT FOR VERIFICATION - END]');
  }
  
  try {
    // Dynamic import to prevent circular dependencies
    const { sendDreamToAI } = await import('../services/apiService');
    
    // Calculate if this is an evolution dream (every 5th dream)
    const nextDreamId = input.dreamCount + 1;
    const isEvolutionDream = nextDreamId % 5 === 0;
    
    // Special logging for evolution dreams
    if (isEvolutionDream) {
      debugLog('🌟 ========================================');
      debugLog('🌟 EVOLUTION DREAM DETECTED!');
      debugLog('🌟 ========================================');
      debugLog('🌟 Dream #' + nextDreamId + ' will evolve personality!');
      debugLog('🌟 Current dream count: ' + input.dreamCount);
      debugLog('🌟 Agent will gain new traits and features!');
      debugLog('🌟 ========================================');
    }
    
    debugLog('[API] Calling real AI backend', { 
      modelId: input.modelId,
      promptLength: input.prompt.length,
      isEvolutionDream,
      dreamCount: input.dreamCount,
      nextDreamId
    });
    
    const aiResponse = await sendDreamToAI(
      input.prompt, 
      input.modelId || 'gemini-2.5-flash-auto',
      input.walletAddress,
      isEvolutionDream,
      input.dreamCount
    );
    
    debugLog('[SUCCESS] AI analysis complete', {
      hasFullAnalysis: !!aiResponse.fullAnalysis,
      hasDreamData: !!aiResponse.dreamData,
      personalityImpact: aiResponse.personalityImpact
    });
    
    // Log personality evolution details if present
    if (aiResponse.personalityImpact) {
      debugLog('🧬 ========================================');
      debugLog('🧬 PERSONALITY EVOLUTION DATA RECEIVED!');
      debugLog('🧬 ========================================');
      debugLog('🧬 Creativity change: ' + (aiResponse.personalityImpact.creativityChange > 0 ? '+' : '') + aiResponse.personalityImpact.creativityChange);
      debugLog('🧬 Analytical change: ' + (aiResponse.personalityImpact.analyticalChange > 0 ? '+' : '') + aiResponse.personalityImpact.analyticalChange);
      debugLog('🧬 Empathy change: ' + (aiResponse.personalityImpact.empathyChange > 0 ? '+' : '') + aiResponse.personalityImpact.empathyChange);
      debugLog('🧬 Intuition change: ' + (aiResponse.personalityImpact.intuitionChange > 0 ? '+' : '') + aiResponse.personalityImpact.intuitionChange);
      debugLog('🧬 Resilience change: ' + (aiResponse.personalityImpact.resilienceChange > 0 ? '+' : '') + aiResponse.personalityImpact.resilienceChange);
      debugLog('🧬 Curiosity change: ' + (aiResponse.personalityImpact.curiosityChange > 0 ? '+' : '') + aiResponse.personalityImpact.curiosityChange);
      debugLog('🧬 Mood shift: ' + aiResponse.personalityImpact.moodShift);
      debugLog('🧬 Evolution weight: ' + aiResponse.personalityImpact.evolutionWeight);
      if (aiResponse.personalityImpact.newFeatures && aiResponse.personalityImpact.newFeatures.length > 0) {
        debugLog('🧬 New features gained: ' + aiResponse.personalityImpact.newFeatures.length);
        aiResponse.personalityImpact.newFeatures.forEach(feature => {
          debugLog('🧬   - ' + feature.name + ' (Intensity: ' + feature.intensity + '%)');
        });
      }
      debugLog('🧬 ========================================');
    }
    
    return aiResponse;
  } catch (error) {
    debugLog('[ERROR] AI analysis failed', { error: String(error) });
    throw error;
  }
});