/**
 * @fileoverview Dream Command State Machine
 * @description Manages the complete dream analysis workflow using XState
 */

import { setup, assign, fromPromise, sendParent } from 'xstate';
import { createPublicClient, http } from 'viem';
import { galileoTestnet } from '../../config/chains';
import { getContractConfig } from '../services/contractService';
import { DreamContext, AIResponse, defaultAgentData } from '../types/contextTypes';
import { convertBigIntToString } from '../utils/jsonSerializer';
import { 
  buildMockDreamContext,
  sendMockDreamAnalysis,
  mockUploadToStorage,
  mockDownloadFromStorage,
  mockUpdateContract
} from '../mocks/dreamMocks';
import { executeDreamPersistenceProtocol, PersistenceProtocolInput } from '../services/dreamPersistenceOrchestrator';
import { manageDailyDreamsFile } from '../services/dreamFileManager';
import { uploadDreamDataSecurely } from '../services/dreamStorageUploader';
import { updateDreamContract } from '../services/dreamContractUpdater';
import { XStateStorageService } from '../services/xstateStorage';
import { TerminalLine } from './types';

// Debug logging
const debugLog = (message: string, data?: any) => {
  if (process.env.NEXT_PUBLIC_XSTATE_TERMINAL === 'true' || process.env.NEXT_PUBLIC_DREAM_TEST === 'true') {
    console.log(`[DreamMachine] ${message}`, data || '');
  }
};

// Dream machine context
export interface DreamMachineContext {
  // Agent data
  tokenId: number | null;
  agentName: string | null;
  
  // Dream flow data
  dreamInput: string;
  dreamContext: DreamContext | null;
  dreamPrompt: string | null;
  aiResponse: AIResponse | null;
  
  // Persistence data
  persistenceResult: any | null;
  storageRootHash: string | null;
  contractTxHash: string | null;
  
  // Status and errors
  statusMessage: string;
  errorMessage: string | null;
  
  // Confirmation state
  awaitingConfirmation: boolean;
  
  // AI configuration
  modelId?: string;
  walletAddress?: string;
}

// Dream machine events
export type DreamEvent =
  | { type: 'START'; modelId?: string; walletAddress?: string }
  | { type: 'SUBMIT_DREAM'; dreamText: string }
  | { type: 'CONFIRM_SAVE' }
  | { type: 'CANCEL_SAVE' }
  | { type: 'RETRY' }
  | { type: 'RESET' }
  // XState actor completion events
  | { type: 'xstate.done.actor.fetchContext'; output: DreamContext }
  | { type: 'xstate.done.actor.buildPrompt'; output: string }
  | { type: 'xstate.done.actor.analyzeWithAI'; output: AIResponse }
  | { type: 'xstate.done.actor.persistDream'; output: { persistenceResult: any; rootHash: string; txHash: string; isEvolutionDream: boolean } }
  | { type: 'xstate.done.actor.manageFile'; output: any }
  | { type: 'xstate.done.actor.uploadToStorage'; output: { rootHash: string } }
  | { type: 'xstate.done.actor.updateContract'; output: { txHash: string; isEvolutionDream: boolean } }
  // XState actor error events
  | { type: 'xstate.error.actor.fetchContext'; error: { message?: string } }
  | { type: 'xstate.error.actor.buildPrompt'; error: { message?: string } }
  | { type: 'xstate.error.actor.analyzeWithAI'; error: { message?: string } }
  | { type: 'xstate.error.actor.persistDream'; error: { message?: string } }
  | { type: 'xstate.error.actor.manageFile'; error: { message?: string } }
  | { type: 'xstate.error.actor.uploadToStorage'; error: { message?: string } }
  | { type: 'xstate.error.actor.updateContract'; error: { message?: string } };

// Initial context
const initialContext: DreamMachineContext = {
  tokenId: null,
  agentName: null,
  dreamInput: '',
  dreamContext: null,
  dreamPrompt: null,
  aiResponse: null,
  persistenceResult: null,
  storageRootHash: null,
  contractTxHash: null,
  statusMessage: '',
  errorMessage: null,
  awaitingConfirmation: false,
  modelId: undefined,
  walletAddress: undefined
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
const fetchContextService = fromPromise(async ({ input }: { input: { dreamText: string; tokenId?: number; agentName?: string } }) => {
  debugLog('=== BANDYCKA JAZDA: Fetching REAL dream context ===', { 
    dreamLength: input.dreamText.length,
    tokenId: input.tokenId || defaultAgentData.tokenId,
    agentName: input.agentName || 'Unknown'
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
        lastConvMonthlyHash: memoryData.lastConvMonthlyHash,
        lastConsolidation: memoryData.lastConsolidation?.toString(),
        currentMonth: memoryData.currentMonth?.toString(),
        currentYear: memoryData.currentYear?.toString()
      });
    }
    
    // 3. Fetch agent basic data with retry (increased attempts for critical data)
    const agentData = await fetchWithRetry(
      () => publicClient.readContract({
        address: contractConfig.address,
        abi: contractConfig.abi,
        functionName: 'agents',
        args: [BigInt(effectiveTokenId)]
      }),
      5,  // Increased to 5 attempts for critical agent data
      'AgentData'
    ) as any;
    
    // Parse agent data with Wagmi v2 compatibility (like useAgentRead.ts)
    let parsedAgentName: string | undefined;
    let parsedIntelligenceLevel: number;
    let parsedDreamCount: number;
    let parsedConversationCount: number;
    
    if (agentData) {
      // Try named properties first (Wagmi v2)
      parsedAgentName = (agentData.agentName !== undefined ? 
        agentData.agentName : agentData[1]) as string;
      parsedIntelligenceLevel = Number(agentData.intelligenceLevel !== undefined ? 
        agentData.intelligenceLevel : agentData[4]);
      parsedDreamCount = Number(agentData.dreamCount !== undefined ? 
        agentData.dreamCount : agentData[5]);
      parsedConversationCount = Number(agentData.conversationCount !== undefined ? 
        agentData.conversationCount : agentData[6]);
      
      debugLog('[AGENT] Agent data parsed', {
        agentName: parsedAgentName,
        intelligenceLevel: parsedIntelligenceLevel,
        dreamCount: parsedDreamCount,
        conversationCount: parsedConversationCount,
        dataStructure: {
          hasNamedProps: agentData.agentName !== undefined,
          isArray: Array.isArray(agentData),
          keys: Object.keys(agentData || {})
        }
      });
    }
    
    // Handle undefined agent name after parsing
    if (!parsedAgentName) {
      debugLog('[WARNING] Agent name still undefined after parsing, using placeholder');
      parsedAgentName = 'Agent';
    }
    
    // 4. Fetch personality traits with retry
    const personalityTraits = await fetchWithRetry(
      () => publicClient.readContract({
        address: contractConfig.address,
        abi: contractConfig.abi,
        functionName: 'getPersonalityTraits',
        args: [BigInt(effectiveTokenId)]
      }),
      3,
      'PersonalityTraits'
    ) as any;
    
    // Handle undefined personality traits
    if (!personalityTraits) {
      debugLog('[WARNING] Personality traits undefined after retries, using defaults');
    } else {
      debugLog('[PERSONALITY] Personality traits fetched', {
        creativity: personalityTraits.creativity?.toString(),
        analytical: personalityTraits.analytical?.toString(),
        empathy: personalityTraits.empathy?.toString(),
        intuition: personalityTraits.intuition?.toString(),
        resilience: personalityTraits.resilience?.toString(),
        curiosity: personalityTraits.curiosity?.toString(),
        dominantMood: personalityTraits.dominantMood
      });
    }
    
    // 5. Fetch unique features (like useAgentRead)
    const uniqueFeaturesData = await fetchWithRetry(
      () => publicClient.readContract({
        address: contractConfig.address,
        abi: contractConfig.abi,
        functionName: 'getUniqueFeatures',
        args: [BigInt(effectiveTokenId)]
      }),
      3,
      'UniqueFeatures'
    ) as any;
    
    debugLog('[FEATURES] Unique features fetched', {
      hasData: !!uniqueFeaturesData,
      count: Array.isArray(uniqueFeaturesData) ? uniqueFeaturesData.length : 0
    });
    
    // 6. Initialize storage service and download historical data
    const storageService = new XStateStorageService();
    const emptyHash = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const historicalData = {
      dailyDreams: [] as any[],
      monthlyConsolidations: [] as any[],
      yearlyCore: null as any
    };
    
    // Download current daily dreams if hash exists
    if (memoryData?.currentDreamDailyHash && memoryData.currentDreamDailyHash !== emptyHash) {
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
        }
      } catch (error) {
        debugLog('[ERROR] Error downloading daily dreams', { error: String(error) });
      }
    } else {
      debugLog('[INFO] No daily dreams hash available');
    }
    
    // Download monthly consolidations if hash exists
    if (memoryData?.lastDreamMonthlyHash && memoryData.lastDreamMonthlyHash !== emptyHash) {
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
    if (memoryData?.memoryCoreHash && memoryData.memoryCoreHash !== emptyHash) {
      debugLog('[DOWNLOAD] Downloading memory core from storage', { 
        hash: memoryData.memoryCoreHash 
      });
      
      try {
        const result = await storageService.downloadJson(memoryData.memoryCoreHash);
        if (result.success && result.data) {
          historicalData.yearlyCore = result.data;
          debugLog('[SUCCESS] Memory core downloaded', {
            hasCore: true,
            year: historicalData.yearlyCore?.year
          });
        } else {
          debugLog('[WARNING] Failed to download memory core', { error: result.error });
        }
      } catch (error) {
        debugLog('[ERROR] Error downloading memory core', { error: String(error) });
      }
    } else {
      debugLog('[INFO] No memory core hash available');
    }
    
    // 7. Build context for dream analysis
    const context: DreamContext & { memoryData: any } = {
      userDream: input.dreamText,
      agentProfile: {
        name: parsedAgentName || 'Agent',  // Use parsed name from contract
        intelligenceLevel: parsedIntelligenceLevel || defaultAgentData.intelligenceLevel,
        dreamCount: parsedDreamCount || defaultAgentData.dreamCount,
        conversationCount: parsedConversationCount || defaultAgentData.conversationCount
      },
      personality: {
        creativity: Number(personalityTraits?.creativity || 50),
        analytical: Number(personalityTraits?.analytical || 50),
        empathy: Number(personalityTraits?.empathy || 50),
        intuition: Number(personalityTraits?.intuition || 50),
        resilience: Number(personalityTraits?.resilience || 50),
        curiosity: Number(personalityTraits?.curiosity || 50),
        dominantMood: personalityTraits?.dominantMood || 'neutral',
        responseStyle: 'balanced' // Would need to fetch from contract
      },
      uniqueFeatures: uniqueFeaturesData && Array.isArray(uniqueFeaturesData) ? 
        uniqueFeaturesData.map((feature: any) => ({
          name: feature.name || 'Unknown Feature',
          description: feature.description || '',
          intensity: Number(feature.intensity || 0)
        })) : undefined,
      memoryAccess: {
        monthsAccessible: 1, // Would need to calculate from intelligence
        memoryDepth: 'current month only'
      },
      historicalData: historicalData,
      // Add memoryData for persistence protocol
      memoryData: memoryData
    };
    
    debugLog('[COMPLETE] REAL context built successfully', { 
      agentName: context.agentProfile.name,
      memoryDepth: context.memoryAccess.memoryDepth,
      dailyDreamsCount: context.historicalData.dailyDreams.length,
      monthlyConsolidationsCount: context.historicalData.monthlyConsolidations.length,
      hasYearlyCore: !!context.historicalData.yearlyCore
    });
    
    // Convert all BigInt values to strings before returning to avoid XState serialization errors
    return convertBigIntToString(context);
    
  } catch (error) {
    debugLog('[ERROR] Failed fetching real context, falling back to defaults', { 
      error: String(error) 
    });
    
    // Fallback to default data on error
    const context = await buildMockDreamContext(
      defaultAgentData.tokenId,
      defaultAgentData,
      input.dreamText
    );
    
    // Convert all BigInt values to strings before returning to avoid XState serialization errors
    return convertBigIntToString(context);
  }
});

// Service: Build dream prompt
const buildPromptService = fromPromise(async ({ input }: { input: { context: DreamContext } }) => {
  debugLog('Building advanced dream prompt with full consciousness');
  
  // Import advanced prompt builder
  const { buildAdvancedDreamPrompt } = await import('../services/advancedPromptBuilder');
  
  // Build the advanced prompt with full agent consciousness
  const advancedPrompt = buildAdvancedDreamPrompt(input.context);
  
  debugLog('[DATA] Advanced prompt built', { 
    systemPromptLength: advancedPrompt.systemPrompt.length,
    isEvolutionDream: advancedPrompt.isEvolutionDream,
    dreamId: advancedPrompt.dreamId,
    agentName: advancedPrompt.metadata.agentName
  });
  
  // Return combined prompt for AI service
  return `${advancedPrompt.systemPrompt}\n\n${advancedPrompt.userPrompt}`;
});

// Service: Send to AI for analysis
const aiAnalysisService = fromPromise(async ({ input }: { input: { prompt: string; dreamCount: number; modelId?: string; walletAddress?: string } }) => {
  debugLog('Sending to AI for analysis');
  
  const isEvolution = (input.dreamCount + 1) % 5 === 0;
  
  debugLog('[INFO] Dream analysis parameters', {
    dreamCount: input.dreamCount,
    nextDreamId: input.dreamCount + 1,
    isEvolutionDream: isEvolution,
    promptLength: input.prompt.length,
    modelId: input.modelId
  });
  
  // Display full prompt for verification
  debugLog('[FULL PROMPT FOR VERIFICATION - START]');
  console.log(input.prompt);
  debugLog('[FULL PROMPT FOR VERIFICATION - END]');
  
  // Import and use real API service
  const { sendDreamToAI } = await import('../services/apiService');
  
  // Use provided model or fallback to default
  const modelId = input.modelId || 'gemini-2.5-flash-auto';
  
  debugLog('[API] Calling real AI backend', {
    model: modelId,
    walletAddress: input.walletAddress
  });
  
  const response = await sendDreamToAI(
    input.prompt,
    modelId,
    input.walletAddress,
    isEvolution,
    input.dreamCount
  );
  
  debugLog('[SUCCESS] AI analysis complete', { 
    hasPersonalityImpact: !!response.personalityImpact,
    dreamId: response.dreamData.id,
    evolutionTriggered: isEvolution,
    modelUsed: modelId
  });
  
  return response;
});

// Service: File Management (Stage 1)
const fileManagementService = fromPromise(async ({ 
  input 
}: { 
  input: { 
    aiResponse: AIResponse; 
    agentName: string; 
    currentRootHash?: string;
  } 
}) => {
  debugLog('📁 Starting file management service', {
    dreamId: input.aiResponse.dreamData.id,
    agentName: input.agentName
  });

  const dreamData = {
    ...input.aiResponse.dreamData,
    date: new Date().toISOString().split('T')[0],
    analysis: input.aiResponse.analysis || 'Dream analysis available.'
  };

  const result = await manageDailyDreamsFile(
    input.agentName,
    dreamData,
    input.currentRootHash
  );

  if (!result.success) {
    throw new Error(`File management failed: ${result.error}`);
  }

  debugLog('✅ File management completed', { 
    fileName: result.fileName,
    dreamsCount: result.data?.length 
  });

  return {
    fileName: result.fileName,
    data: result.data,
    isNewFile: result.isNewFile
  };
});

// Service: Storage Upload (Stage 2)
const storageUploadService = fromPromise(async ({ 
  input 
}: { 
  input: { 
    data: any[];
    fileName: string;
  } 
}) => {
  debugLog('☁️ Starting storage upload service', {
    fileName: input.fileName,
    dataCount: input.data.length
  });

  const uploadResult = await uploadDreamDataSecurely(
    input.data,
    input.fileName,
    {
      enableVerification: true,
      maxRetries: 3
    }
  );

  if (!uploadResult.success || !uploadResult.rootHash) {
    throw new Error(`Storage upload failed: ${uploadResult.error}`);
  }

  debugLog('✅ Storage upload completed', { 
    rootHash: uploadResult.rootHash.substring(0, 10) + '...'
  });

  return {
    rootHash: uploadResult.rootHash,
    verified: uploadResult.verified,
    txHash: uploadResult.txHash
  };
});

// Service: Contract Update (Stage 3)
const contractUpdateService = fromPromise(async ({ 
  input 
}: { 
  input: { 
    tokenId: number;
    rootHash: string;
    personalityImpact?: any;
    dreamCount: number;
  } 
}) => {
  debugLog('⛓️ Starting contract update service', {
    tokenId: input.tokenId,
    rootHash: input.rootHash.substring(0, 10) + '...'
  });

  const result = await updateDreamContract(
    input.tokenId,
    input.rootHash,
    input.personalityImpact,
    input.dreamCount
  );

  if (!result.success) {
    throw new Error(`Contract update failed: ${result.error}`);
  }

  debugLog('✅ Contract update completed', { 
    txHash: result.txHash?.substring(0, 10) + '...',
    isEvolutionDream: result.isEvolutionDream
  });

  return {
    txHash: result.txHash,
    gasUsed: result.gasUsed,
    isEvolutionDream: result.isEvolutionDream
  };
});

// Service: Complete Dream Persistence Protocol (PRODUCTION) - DEPRECATED, kept for backward compatibility
const dreamPersistenceService = fromPromise(async ({ 
  input 
}: { 
  input: { 
    aiResponse: AIResponse; 
    tokenId: number; 
    agentName: string; 
    dreamCount: number;
    currentRootHash?: string;
  } 
}) => {
  debugLog('🚀 Executing Dream Persistence Protocol (PRODUCTION)', {
    dreamId: input.aiResponse.dreamData.id,
    agentName: input.agentName,
    dreamCount: input.dreamCount,
    isEvolution: (input.dreamCount + 1) % 5 === 0
  });

  // Prepare protocol input
  const protocolInput: PersistenceProtocolInput = {
    aiResponseBlock2: {
      analysis: input.aiResponse.analysis,
      dreamData: input.aiResponse.dreamData,
      personalityImpact: input.aiResponse.personalityImpact
    },
    tokenId: input.tokenId,
    agentName: input.agentName,
    dreamCount: input.dreamCount,
    currentRootHash: input.currentRootHash,
    config: {
      enableVerification: true,
      maxRetries: 3,
      skipContractUpdate: false
    }
  };

  // Execute complete persistence protocol
  const result = await executeDreamPersistenceProtocol(protocolInput);

  if (!result.success) {
    debugLog('❌ Dream Persistence Protocol failed', { 
      error: result.error,
      completedStages: result.fileManagement?.success ? 1 : 0
    });
    throw new Error(`Dream persistence failed: ${result.error}`);
  }

  debugLog('✅ Dream Persistence Protocol completed successfully', {
    rootHash: result.rootHash?.substring(0, 10) + '...',
    txHash: result.txHash?.substring(0, 10) + '...',
    isEvolution: result.isEvolutionDream,
    totalTime: result.metadata?.totalTime
  });

  return {
    rootHash: result.rootHash,
    txHash: result.txHash,
    isEvolutionDream: result.isEvolutionDream,
    persistenceResult: result
  };
});

// Dream state machine
export const dreamMachine = setup({
  types: {} as {
    context: DreamMachineContext;
    events: DreamEvent;
  },
  actors: {
    fetchContext: fetchContextService,
    buildPrompt: buildPromptService,
    aiAnalysis: aiAnalysisService,
    dreamPersistence: dreamPersistenceService,
    fileManagement: fileManagementService,
    storageUpload: storageUploadService,
    contractUpdate: contractUpdateService
  },
  actions: {
    // Initialize dream session
    initializeDream: assign({
      tokenId: defaultAgentData.tokenId,
      agentName: '',  // Will be filled from contract
      statusMessage: 'Describe your dream...', // This will be used for placeholder
      errorMessage: null,
      modelId: ({ event }) => event.type === 'START' ? event.modelId : undefined,
      walletAddress: ({ event }) => event.type === 'START' ? event.walletAddress : undefined
    }),
    
    // Send dream instruction to parent
    sendDreamInstruction: sendParent(() => ({
      type: 'APPEND_LINES',
      lines: [{
        type: 'info',
        content: '~ Now u can describe your dream! Add your sleep quality review 1-10 if u want agent to know that!',
        timestamp: Date.now()
      }]
    })),
    
    // Store dream input
    storeDreamInput: assign({
      dreamInput: ({ event }) => {
        if (event.type === 'SUBMIT_DREAM') {
          return event.dreamText;
        }
        return '';
      },
      statusMessage: ({ context }) => `${context.agentName} is thinking . . .`
    }),
    
    // Store context and update agent name
    storeContext: assign({
      dreamContext: ({ event }) => {
        return (event as any).output as DreamContext;
      },
      agentName: ({ event }) => {
        return ((event as any).output as DreamContext).agentProfile?.name || 'Agent';
      },
      statusMessage: 'Building dream analysis prompt...'
    }),
    
    // Store prompt
    storePrompt: assign({
      dreamPrompt: ({ event }) => {
        return (event as any).output as string;
      },
      statusMessage: ({ context }) => `${context.dreamContext?.agentProfile?.name || 'Agent'} is thinking`
    }),
    
    // Store AI response
    storeAIResponse: assign({
      aiResponse: ({ event }) => {
        return (event as any).output as AIResponse;
      },
      statusMessage: 'Type y/n to confirm',
      awaitingConfirmation: true
    }),
    
    // Store persistence result
    storePersistenceResult: assign({
      persistenceResult: ({ event }) => {
        return (event as any).output.persistenceResult;
      },
      storageRootHash: ({ event }) => {
        return (event as any).output.rootHash;
      },
      contractTxHash: ({ event }) => {
        return (event as any).output.txHash;
      },
      statusMessage: ({ event }) => {
        const output = (event as any).output;
        return output.isEvolutionDream ? 
          'Evolution dream persisted! Agent has evolved.' :
          'Dream persisted successfully!';
      }
    }),
    
    // Mark as completed
    markCompleted: assign({
      statusMessage: ({ context }) => `${context.dreamContext?.agentProfile?.name || 'Agent'} has learned from your dream!`,
      awaitingConfirmation: false
    }),
    
    // Store error
    storeError: assign({
      errorMessage: ({ event }) => {
        if ('error' in event) {
          return event.error instanceof Error ? event.error.message : String(event.error);
        }
        return 'An unknown error occurred';
      },
      statusMessage: 'Dream analysis failed'
    }),
    
    // Reset confirmation
    resetConfirmation: assign({
      awaitingConfirmation: false,
      statusMessage: 'Dream not saved.'
    }),
    
    // Send lines to parent (terminal)
    sendLinesToParent: sendParent(({ context }) => {
      const lines: TerminalLine[] = [];
      const timestamp = Date.now();
      
      if (context.aiResponse) {
        // Display AI analysis with formatted agent name
        lines.push({
          type: 'info',
          content: `~ ${context.agentName} : ${context.aiResponse.fullAnalysis}`,
          timestamp
        });
        
        // Ask for confirmation
        lines.push({
          type: 'system',
          content: `Do u wanna train ${context.agentName} with your dream? Type y/n`,
          timestamp: timestamp + 1
        });
      }
      
      return { type: 'APPEND_LINES', lines };
    }),
    
    // Send status to parent
    sendStatusToParent: sendParent(({ context }) => ({
      type: 'UPDATE_STATUS', 
      status: context.statusMessage 
    })),
    
    // Send error to parent
    sendErrorToParent: sendParent(({ context }) => {
      const errorLine: TerminalLine = {
        type: 'error',
        content: context.errorMessage || 'Unknown error occurred',
        timestamp: Date.now()
      };
      return { type: 'APPEND_LINES', lines: [errorLine] };
    })
  }
}).createMachine({
  id: 'dream',
  initial: 'idle',
  context: initialContext,
  
  states: {
    idle: {
      on: {
        START: {
          target: 'awaitingDreamInput',
          actions: ['initializeDream', 'sendDreamInstruction', 'sendStatusToParent']
        }
      }
    },
    
    awaitingDreamInput: {
      on: {
        SUBMIT_DREAM: {
          target: 'processingDream',
          actions: ['storeDreamInput', 'sendStatusToParent']
        }
      }
    },
    
    processingDream: {
      initial: 'fetchingContext',
      states: {
        fetchingContext: {
          invoke: {
            src: 'fetchContext',
            input: ({ context }) => ({ dreamText: context.dreamInput }),
            onDone: {
              target: 'buildingPrompt',
              actions: ['storeContext', 'sendStatusToParent']
            },
            onError: {
              target: '#dream.error',
              actions: ['storeError', 'sendErrorToParent']
            }
          }
        },
        
        buildingPrompt: {
          invoke: {
            src: 'buildPrompt',
            input: ({ context }) => ({ context: context.dreamContext! }),
            onDone: {
              target: 'analyzingWithAI',
              actions: ['storePrompt', 'sendStatusToParent']
            },
            onError: {
              target: '#dream.error',
              actions: ['storeError', 'sendErrorToParent']
            }
          }
        },
        
        analyzingWithAI: {
          invoke: {
            src: 'aiAnalysis',
            input: ({ context }) => ({ 
              prompt: context.dreamPrompt!,
              dreamCount: defaultAgentData.dreamCount,
              modelId: context.modelId,
              walletAddress: context.walletAddress
            }),
            onDone: {
              target: 'displayingAnalysis',
              actions: ['storeAIResponse', 'sendStatusToParent']
            },
            onError: {
              target: '#dream.error',
              actions: ['storeError', 'sendErrorToParent']
            }
          }
        },
        
        displayingAnalysis: {
          entry: 'sendLinesToParent',
          always: '#dream.awaitingSaveConfirmation'
        }
      }
    },
    
    awaitingSaveConfirmation: {
      on: {
        CONFIRM_SAVE: {
          target: 'savingDream',
          actions: 'sendStatusToParent'
        },
        CANCEL_SAVE: {
          target: 'completed',
          actions: ['resetConfirmation', 'sendStatusToParent']
        }
      }
    },
    
    savingDream: {
      initial: 'fileManagement',
      states: {
        fileManagement: {
          entry: [
            assign({ statusMessage: ({ context }) => `${context.dreamContext?.agentProfile?.name || 'Agent'} is learning` }),
            'sendStatusToParent'
          ],
          invoke: {
            src: 'fileManagement',
            input: ({ context }) => {
              const memoryData = (context.dreamContext as any)?.memoryData;
              const currentRootHash = memoryData?.currentDreamDailyHash;
              
              return {
                aiResponse: context.aiResponse!,
                agentName: context.dreamContext?.agentProfile?.name || 'Agent',
                currentRootHash: currentRootHash
              };
            },
            onDone: {
              target: 'storageUpload',
              actions: assign({
                persistenceResult: ({ event }) => {
                  return ({ fileData: (event as any).output });
                }
              })
            },
            onError: {
              target: '#dream.error',
              actions: ['storeError', 'sendErrorToParent']
            }
          }
        },
        
        storageUpload: {
          entry: [
            assign({ statusMessage: ({ context }) => `${context.dreamContext?.agentProfile?.name || 'Agent'} is learning` }),
            'sendStatusToParent'
          ],
          invoke: {
            src: 'storageUpload',
            input: ({ context }) => {
              const fileData = (context.persistenceResult as any)?.fileData;
              return {
                data: fileData?.data || [],
                fileName: fileData?.fileName || 'unknown'
              };
            },
            onDone: {
              target: 'contractUpdate',
              actions: assign({
                storageRootHash: ({ event }) => {
                  return (event as any).output.rootHash;
                },
                persistenceResult: ({ context, event }) => ({
                  ...context.persistenceResult,
                  storageData: (event as any).output
                })
              })
            },
            onError: {
              target: '#dream.error',
              actions: ['storeError', 'sendErrorToParent']
            }
          }
        },
        
        contractUpdate: {
          entry: [
            assign({ statusMessage: ({ context }) => `${context.dreamContext?.agentProfile?.name || 'Agent'} is evolving` }),
            'sendStatusToParent'
          ],
          invoke: {
            src: 'contractUpdate',
            input: ({ context }) => ({
              tokenId: context.tokenId!,
              rootHash: context.storageRootHash!,
              personalityImpact: context.aiResponse?.personalityImpact,
              dreamCount: context.dreamContext?.agentProfile?.dreamCount || 0
            }),
            onDone: {
              target: '#dream.completed',
              actions: [
                assign({
                  contractTxHash: ({ event }) => {
                    return (event as any).output.txHash;
                  },
                  persistenceResult: ({ context, event }) => ({
                    ...context.persistenceResult,
                    contractData: (event as any).output,
                    isEvolutionDream: (event as any).output.isEvolutionDream
                  })
                }),
                'markCompleted',
                'sendStatusToParent'
              ]
            },
            onError: {
              target: '#dream.error',
              actions: ['storeError', 'sendErrorToParent']
            }
          }
        }
      }
    },
    
    completed: {
      type: 'final',
      entry: [
        () => debugLog('Dream workflow completed'),
        sendParent({ type: 'DREAM.COMPLETE' })
      ]
    },
    
    error: {
      on: {
        RETRY: '#dream.idle',
        RESET: '#dream.idle'
      }
    }
  },
  
  on: {
    RESET: {
      target: '#dream.idle',
      actions: assign(initialContext)
    }
  }
});