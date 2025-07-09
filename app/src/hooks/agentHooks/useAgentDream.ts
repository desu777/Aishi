'use client';

import { useState, useEffect } from 'react';
import { useWriteContract, useAccount, useChainId, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, decodeEventLog } from 'viem';
import { useTheme } from '../../contexts/ThemeContext';
import { useAgentRead } from './useAgentRead';
import { galileoTestnet } from '../../config/chains';
import contractData from '../../abi/frontend-contracts.json';
import { uploadFileComplete } from '../../lib/0g/uploader';
import { downloadByRootHashAPI } from '../../lib/0g/downloader';
import { getProvider, getSigner } from '../../lib/0g/fees';

// Import types from useAgentRead
interface AgentInfo {
  tokenId: bigint;
  owner: `0x${string}`;
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

// Contract configuration
const contractConfig = {
  address: contractData.galileo.DreamscapeAgent.address as `0x${string}`,
  abi: contractData.galileo.DreamscapeAgent.abi,
} as const;

// Types for dream processing
interface DreamInput {
  dreamText: string;
  emotions?: string[];
  lucidDream?: boolean;
}

interface PersonalityImpact {
  creativityChange: number;
  analyticalChange: number; 
  empathyChange: number;
  intuitionChange: number;
  resilienceChange: number;
  curiosityChange: number;
  moodShift: string;
  evolutionWeight: number;
}

interface DreamAnalysisResult {
  analysis: string;
  personalityImpact: PersonalityImpact;
  dreamMetadata: {
    themes: string[];
    symbols: string[];
    emotions: string[];
    intensity: number;
  };
}

interface DreamProcessState {
  isAnalyzing: boolean;
  isSavingToStorage: boolean;
  isProcessingOnChain: boolean;
  isWaitingForReceipt: boolean;
  isComplete: boolean;
  error: string;
  currentStep: 'input' | 'analyzing' | 'saving' | 'processing' | 'complete' | 'error';
  dreamAnalysis?: DreamAnalysisResult;
  storageHash?: string;
  txHash?: string;
  tokenId?: bigint;
}

interface DreamProcessResult {
  success: boolean;
  analysis?: DreamAnalysisResult;
  storageHash?: string;
  txHash?: string;
  error?: string;
}

// 0G Storage configuration - używamy poprawnych URL z doors.md
const STORAGE_CONFIG = {
  storageRpc: process.env.NEXT_PUBLIC_TURBO_STORAGE_RPC || 'https://indexer-storage-testnet-turbo.0g.ai',
  l1Rpc: process.env.NEXT_PUBLIC_L1_RPC || 'https://evmrpc-testnet.0g.ai'
};

// 0G Compute configuration
const COMPUTE_CONFIG = {
  backendUrl: process.env.NEXT_PUBLIC_COMPUTE_API_URL || 'http://localhost:3001/api'
};

// Error parsing utility for viem errors (SAME AS useAgentMint)
const parseViemError = (error: any): string => {
  // Check for contract revert errors
  if (error?.message?.includes('execution reverted')) {
    // Extract revert reason with multiple patterns
    let revertReason = null;
    
    // Try different patterns for revert reason extraction
    const patterns = [
      /execution reverted: (.+?)(?:\n|$)/,
      /execution reverted with reason: (.+?)(?:\n|$)/,
      /revert (.+?)(?:\n|$)/,
      /reverted with reason string '(.+?)'/,
      /reverted with custom error '(.+?)'/
    ];
    
    for (const pattern of patterns) {
      const match = error.message.match(pattern);
      if (match) {
        revertReason = match[1].trim();
        break;
      }
    }
    
    if (revertReason) {
      // Map contract errors to user-friendly messages
      switch (revertReason) {
        case 'Agent not found':
          return 'Agent not found. Please ensure you own a valid agent.';
        case 'Already processed today':
          return 'You have already processed a dream today. Please wait 24 hours.';
        case 'Invalid personality impact':
          return 'Invalid personality impact values. Please try again.';
        case 'Invalid dream hash':
          return 'Invalid dream hash format. Please try again.';
        case 'Agent not owned by sender':
          return 'You do not own this agent. Only the agent owner can process dreams.';
        case 'Dream processing paused':
          return 'Dream processing is temporarily paused. Please try again later.';
        default:
          return `Contract error: ${revertReason}`;
      }
    } else {
      return 'Transaction failed due to contract requirements not being met.';
    }
  }
  
  // Check for user rejection
  if (error?.message?.includes('User rejected') || error?.name === 'UserRejectedRequestError') {
    return 'Transaction was rejected by user.';
  }
  
  // Check for insufficient funds
  if (error?.message?.includes('insufficient funds')) {
    return 'Insufficient funds in your wallet to complete the transaction.';
  }
  
  // Check for network/connection errors
  if (error?.message?.includes('network') || error?.message?.includes('connection')) {
    return 'Network connection error. Please check your internet connection and try again.';
  }
  
  // Check for gas estimation errors
  if (error?.message?.includes('gas')) {
    return 'Gas estimation failed. The transaction may fail or network may be congested.';
  }
  
  // Check for timeout errors
  if (error?.message?.includes('timeout')) {
    return 'Transaction timeout. Please try again or increase gas price.';
  }
  
  // Default fallback
  return error?.message || 'An unexpected error occurred during dream processing.';
};

/**
 * Hook for processing dreams: AI analysis → Storage → On-chain evolution
 * Handles the complete workflow from dream input to personality evolution
 */
export function useAgentDream() {
  const { debugLog } = useTheme();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { writeContractAsync, isPending } = useWriteContract();
  
  // Agent read hooks for context - AKTUALIZACJA KROK 2
  const {
    agentData,
    userTokenId,
    hasAgent,
    canProcessDreamToday,
    personalityTraits,
    memoryAccess,
    isLoadingCanProcess,
    isLoadingPersonalityTraits,
    isLoadingMemoryAccess
  } = useAgentRead();

  // Local state for dream processing
  const [state, setState] = useState<DreamProcessState>({
    isAnalyzing: false,
    isSavingToStorage: false,
    isProcessingOnChain: false,
    isWaitingForReceipt: false,
    isComplete: false,
    error: '',
    currentStep: 'input'
  });

  // Wait for transaction receipt
  const { data: receipt, isLoading: isReceiptLoading, error: receiptError } = useWaitForTransactionReceipt({
    hash: state.txHash as `0x${string}`,
    query: {
      enabled: !!state.txHash && !state.isComplete,
    },
  });

  // Check if on correct network
  const isCorrectNetwork = chainId === parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '16601');

  // Process receipt when available
  useEffect(() => {
    if (receipt && !state.isComplete) {
      try {
        // Find DreamProcessed event in logs
        const dreamProcessedEvent = receipt.logs.find(log => {
          try {
            const decoded = decodeEventLog({
              abi: contractConfig.abi,
              data: log.data,
              topics: log.topics,
            });
            return decoded.eventName === 'DreamProcessed';
          } catch {
            return false;
          }
        });

        if (dreamProcessedEvent) {
          const decoded = decodeEventLog({
            abi: contractConfig.abi,
            data: dreamProcessedEvent.data,
            topics: dreamProcessedEvent.topics,
          });
          
          // Extract event data
          const eventData = decoded.args as any;
          
          setState(prev => ({
            ...prev,
            isProcessingOnChain: false,
            isWaitingForReceipt: false,
            isComplete: true,
            currentStep: 'complete',
            error: ''
          }));
          
          debugLog('Dream processed successfully on-chain', { 
            tokenId: eventData.tokenId?.toString(),
            txHash: state.txHash,
            receipt: receipt
          });
        } else {
          setState(prev => ({
            ...prev,
            isProcessingOnChain: false,
            isWaitingForReceipt: false,
            error: 'DreamProcessed event not found in transaction receipt'
          }));
        }
      } catch (error: any) {
        const errorMessage = parseViemError(error);
        debugLog('Error parsing receipt', { 
          error: errorMessage, 
          originalError: error.message,
          errorType: error.name || 'Unknown'
        });
        setState(prev => ({
          ...prev,
          isProcessingOnChain: false,
          isWaitingForReceipt: false,
          error: errorMessage,
          currentStep: 'error'
        }));
      }
    }
  }, [receipt, state.isComplete, state.txHash, debugLog]);

  // Handle receipt error
  useEffect(() => {
    if (receiptError) {
      const errorMessage = parseViemError(receiptError);
      debugLog('Receipt error', { 
        error: errorMessage, 
        originalError: receiptError.message,
        errorType: receiptError.name || 'Unknown'
      });
      setState(prev => ({
        ...prev,
        isProcessingOnChain: false,
        isWaitingForReceipt: false,
        error: errorMessage,
        currentStep: 'error'
      }));
    }
  }, [receiptError, debugLog]);

  // Reset processing state
  const resetProcessing = () => {
    setState({
      isAnalyzing: false,
      isSavingToStorage: false,
      isProcessingOnChain: false,
      isWaitingForReceipt: false,
      isComplete: false,
      error: '',
      currentStep: 'input'
    });
    debugLog('Dream processing state reset');
  };

  // Helper function to fetch previous dreams from 0G Storage
  const fetchPreviousDreams = async (dreamDailyHash: string): Promise<any[]> => {
    try {
      if (!dreamDailyHash || dreamDailyHash === '0x0000000000000000000000000000000000000000000000000000000000000000') {
        return [];
      }

      debugLog('Fetching previous dreams from 0G Storage', { dreamDailyHash });
      
      // Download previous dreams from 0G Storage - naprawiam typ zwracany
      const [downloadData, downloadError] = await downloadByRootHashAPI(dreamDailyHash, STORAGE_CONFIG.storageRpc);
      
      if (!downloadError && downloadData) {
        const dreamsData = JSON.parse(new TextDecoder().decode(downloadData));
        // If it's an array, return it; if it's single object, wrap in array
        return Array.isArray(dreamsData) ? dreamsData : [dreamsData];
      }
      
      return [];
    } catch (error) {
      debugLog('Error fetching previous dreams', { error, dreamDailyHash });
      return [];
    }
  };

  // Fetch monthly consolidated dreams
  const fetchMonthlyDreams = async (monthlyHash: string): Promise<any[]> => {
    try {
      if (!monthlyHash || monthlyHash === '0x0000000000000000000000000000000000000000000000000000000000000000') {
        return [];
      }

      debugLog('Fetching monthly dreams from 0G Storage', { monthlyHash });
      
      const [downloadData, downloadError] = await downloadByRootHashAPI(monthlyHash, STORAGE_CONFIG.storageRpc);
      
      if (!downloadError && downloadData) {
        const monthlyData = JSON.parse(new TextDecoder().decode(downloadData));
        // Monthly data might have different structure - handle accordingly
        if (monthlyData.monthlyDreams) {
          return monthlyData.monthlyDreams;
        } else if (Array.isArray(monthlyData)) {
          return monthlyData;
        } else {
          return [monthlyData];
        }
      }
      
      return [];
    } catch (error) {
      debugLog('Error fetching monthly dreams', { error, monthlyHash });
      return [];
    }
  };

  // Fetch yearly core memory
  const fetchCoreMemory = async (coreHash: string): Promise<any> => {
    try {
      if (!coreHash || coreHash === '0x0000000000000000000000000000000000000000000000000000000000000000') {
        return null;
      }

      debugLog('Fetching core memory from 0G Storage', { coreHash });
      
      const [downloadData, downloadError] = await downloadByRootHashAPI(coreHash, STORAGE_CONFIG.storageRpc);
      
      if (!downloadError && downloadData) {
        const coreData = JSON.parse(new TextDecoder().decode(downloadData));
        return coreData;
      }
      
      return null;
    } catch (error) {
      debugLog('Error fetching core memory', { error, coreHash });
      return null;
    }
  };

  // Step 1: Build context from agent history and level - KROK 2 AKTUALIZACJA
  const buildDreamContext = async (tokenId: bigint, dreamInput?: string): Promise<string> => {
    try {
      debugLog('Building dream context - KROK 2', { tokenId: tokenId.toString(), hasDreamInput: !!dreamInput });

      // SPRAWDZENIE 1: Czy można przetwarzać sen dzisiaj
      if (!canProcessDreamToday) {
        throw new Error('Cannot process dream today. Please wait 24 hours since last dream.');
      }

      let context = `Agent Context:\n`;
      
      // DANE PODSTAWOWE AGENTA
      if (agentData) {
        context += `- Agent Name: ${agentData.agentName}\n`;
        context += `- Intelligence Level: ${agentData.intelligenceLevel}\n`;
        context += `- Dream Count: ${agentData.dreamCount}\n`;
        context += `- Conversation Count: ${agentData.conversationCount}\n`;
        context += `- Total Evolutions: ${agentData.totalEvolutions}\n`;
        context += `- Personality Initialized: ${agentData.personalityInitialized}\n`;
      }

      // DANE OSOBOWOŚCI + UNIKALNE FEATURES
      if (personalityTraits) {
        context += `- Current Personality:\n`;
        context += `  * Creativity: ${personalityTraits.creativity}/100\n`;
        context += `  * Analytical: ${personalityTraits.analytical}/100\n`;
        context += `  * Empathy: ${personalityTraits.empathy}/100\n`;
        context += `  * Intuition: ${personalityTraits.intuition}/100\n`;
        context += `  * Resilience: ${personalityTraits.resilience}/100\n`;
        context += `  * Curiosity: ${personalityTraits.curiosity}/100\n`;
        context += `  * Dominant Mood: ${personalityTraits.dominantMood}\n`;
        
        // UNIKALNE FEATURES
        if (personalityTraits.uniqueFeatures && personalityTraits.uniqueFeatures.length > 0) {
          context += `- Unique Features (${personalityTraits.uniqueFeatures.length}):\n`;
          personalityTraits.uniqueFeatures.forEach(feature => {
            context += `  * ${feature.name}: ${feature.description} (Intensity: ${feature.intensity})\n`;
          });
        }
      }

      // DOSTĘP DO PAMIĘCI
      if (memoryAccess) {
        context += `- Memory Access:\n`;
        context += `  * Months Accessible: ${memoryAccess.monthsAccessible}\n`;
        context += `  * Memory Depth: ${memoryAccess.memoryDepth}\n`;
      }

      // HIERARCHICAL MEMORY FETCHING BASED ON INTELLIGENCE LEVEL
      let allMemories = {
        daily: [] as any[],
        monthly: [] as any[],
        coreMemory: null as any
      };

      // Get intelligence level and memory access
      const intelligenceLevel = Number(agentData?.intelligenceLevel || 1);
      const monthsAccessible = memoryAccess?.monthsAccessible || 1;

      debugLog('Memory access based on intelligence', { 
        intelligenceLevel, 
        monthsAccessible,
        memoryDepth: memoryAccess?.memoryDepth 
      });

      // LEVEL 1: DAILY DREAMS (always accessible)
      if (agentData?.memory?.currentDreamDailyHash) {
        allMemories.daily = await fetchPreviousDreams(agentData.memory.currentDreamDailyHash);
        debugLog('Fetched daily dreams', { count: allMemories.daily.length });
      }

      // LEVEL 2: MONTHLY DREAMS (if monthsAccessible >= 1 and has monthly hash)
      if (monthsAccessible >= 1 && agentData?.memory?.lastDreamMonthlyHash) {
        allMemories.monthly = await fetchMonthlyDreams(agentData.memory.lastDreamMonthlyHash);
        debugLog('Fetched monthly dreams', { count: allMemories.monthly.length });
      }

      // LEVEL 3: CORE MEMORY (if monthsAccessible >= 12 and has core hash)
      if (monthsAccessible >= 12 && agentData?.memory?.memoryCoreHash) {
        allMemories.coreMemory = await fetchCoreMemory(agentData.memory.memoryCoreHash);
        debugLog('Fetched core memory', { hasCore: !!allMemories.coreMemory });
      }

      // BUILD CONTEXT FROM HIERARCHICAL MEMORIES
      context += `\n=== MEMORY HIERARCHY (${memoryAccess?.memoryDepth || 'current month only'}) ===\n`;

      // Add daily dreams to context
      if (allMemories.daily.length > 0) {
        context += `\nRecent Daily Dreams (${allMemories.daily.length}):\n`;
        allMemories.daily.slice(-5).forEach((dream, index) => { // Show last 5 daily dreams
          const dreamData = dream.dreams ? dream.dreams[dream.dreams.length - 1] : dream;
          context += `${index + 1}. ${dreamData.content || dreamData.dreamText || 'No content'}\n`;
          if (dreamData.emotions) {
            context += `   Emotions: ${dreamData.emotions.join(', ')}\n`;
          }
          if (dreamData.mood_after_waking) {
            context += `   Mood after: ${dreamData.mood_after_waking}\n`;
          }
          context += `\n`;
        });
      }

      // Add monthly summaries to context
      if (allMemories.monthly.length > 0) {
        context += `\nMonthly Dream Summaries (${allMemories.monthly.length} months):\n`;
        allMemories.monthly.slice(-6).forEach((monthData, index) => { // Show last 6 months
          context += `Month ${index + 1}: ${monthData.summary || monthData.themes?.join(', ') || 'No summary'}\n`;
          if (monthData.dominantThemes) {
            context += `   Dominant themes: ${monthData.dominantThemes.join(', ')}\n`;
          }
          if (monthData.personalityShift) {
            context += `   Personality shift: ${monthData.personalityShift}\n`;
          }
          context += `\n`;
        });
      }

      // Add core memory insights to context
      if (allMemories.coreMemory) {
        context += `\nCore Memory Insights:\n`;
        if (allMemories.coreMemory.yearlyReflection) {
          context += `- Yearly reflection: ${allMemories.coreMemory.yearlyReflection}\n`;
        }
        if (allMemories.coreMemory.personalityEvolution) {
          context += `- Personality evolution: ${allMemories.coreMemory.personalityEvolution}\n`;
        }
        if (allMemories.coreMemory.majorThemes) {
          context += `- Major themes: ${allMemories.coreMemory.majorThemes.join(', ')}\n`;
        }
        context += `\n`;
      }

      // Add memory access note
      context += `\nMemory Access Level: ${memoryAccess?.memoryDepth || 'basic'}\n`;
      context += `Intelligence Level: ${intelligenceLevel}\n`;
      
      if (allMemories.daily.length === 0 && allMemories.monthly.length === 0 && !allMemories.coreMemory) {
        context += `\nThis is the agent's first dream - no previous memories available.\n`;
      }

      // DODANIE AKTUALNEGO SNU DO KONTEKSTU
      if (dreamInput && dreamInput.trim()) {
        context += `\n=== CURRENT DREAM TO ANALYZE ===\n`;
        context += `Dream Description: "${dreamInput.trim()}"\n`;
        context += `\nPlease analyze this dream considering the above context and personality.\n`;
      } else {
        context += `\nContext prepared for dream analysis.\n`;
      }
      
      debugLog('Dream context built - KROK 2', { 
        contextLength: context.length,
        dailyDreamsCount: allMemories.daily.length,
        monthlyDreamsCount: allMemories.monthly.length,
        hasCoreMemory: !!allMemories.coreMemory,
        hasPersonalityTraits: !!personalityTraits,
        hasMemoryAccess: !!memoryAccess,
        hasDreamInput: !!dreamInput
      });
      
      return context;
    } catch (error) {
      debugLog('Error building dream context - KROK 2', { error });
      throw error;
    }
  };

  // Step 2: AI Analysis via 0G Compute
  const analyzeDreamWithAI = async (dreamInput: DreamInput, context: string): Promise<DreamAnalysisResult> => {
    try {
      // Extract agent name from context
      const agentNameMatch = context.match(/- Agent Name: (.+)/);
      const agentName = agentNameMatch ? agentNameMatch[1] : 'Dream Agent';
      
      const prompt = `
You are ${agentName}, a personal dream analysis expert integrated into the Dreamscape platform. Your task is to analyze a dream provided by your owner, speaking as their personal AI companion.

**Your Identity:**
- You are ${agentName}, a unique AI dream interpreter
- You have your own developing personality and intelligence level
- You speak directly to your owner, not as a third-party analyst
- You can use first person ("I think", "I sense", "I interpret") when appropriate

**Instructions:**
1.  **Detect Language:** First, identify the language of the user's dream description.
2.  **Analyze in Detected Language:** The main "analysis" text MUST be in the same language you detected.
3.  **Provide Structured Data in English:** The \`personalityImpact\` and \`dreamMetadata\` JSON fields and their values (themes, symbols, emotions) MUST be in English, as this data is used by the smart contract.
4.  **Personalize Analysis:** Reference your current personality traits and intelligence level when relevant.

**Agent & Dream Context:**
---
${context}
---
**Dream to Analyze:**
- **Description:** "${dreamInput.dreamText}"
- **Emotions felt:** ${dreamInput.emotions?.join(', ') || 'Not specified'}
- **Lucid dream:** ${dreamInput.lucidDream ? 'Yes' : 'No'}
---

**Required Output Format (JSON only):**
Your entire response must be a single, valid JSON object. Do not add any text before or after it.

{
  "analysis": "A detailed interpretation of the dream, written in the user's detected language.",
  "personalityImpact": {
    "creativityChange": <integer between -5 and +5>,
    "analyticalChange": <integer between -5 and +5>,
    "empathyChange": <integer between -5 and +5>,
    "intuitionChange": <integer between -5 and +5>,
    "resilienceChange": <integer between -5 and +5>,
    "curiosityChange": <integer between -5 and +5>,
    "moodShift": "<string, e.g., 'contemplative', 'adventurous', or 'no change'>",
    "evolutionWeight": <integer between 1 and 10, representing impact strength>
  },
  "dreamMetadata": {
    "themes": ["<theme1 in English>", "<theme2 in English>"],
    "symbols": ["<symbol1 in English>", "<symbol2 in English>"],
    "emotions": ["<emotion1 in English>", "<emotion2 in English>"],
    "intensity": <integer between 1 and 10>
  }
}
`;

      debugLog('Sending dream for AI analysis', { 
        promptLength: prompt.length,
        dreamLength: dreamInput.dreamText.length 
      });

      const response = await fetch(`${COMPUTE_CONFIG.backendUrl}/analyze-dream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: address,
          query: prompt,
          model: 'llama-3.3-70b-instruct'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`AI analysis failed: ${errorData.error || response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(`AI analysis failed: ${result.error}`);
      }

      // Parse AI response (should be JSON)
      let analysisResult: DreamAnalysisResult;
      try {
        // Try to extract JSON from AI response
        const aiResponse = result.data.response;
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          analysisResult = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback if AI doesn't return JSON
          analysisResult = {
            analysis: aiResponse,
            personalityImpact: {
              creativityChange: 0,
              analyticalChange: 0,
              empathyChange: 0,
              intuitionChange: 0,
              resilienceChange: 0,
              curiosityChange: 0,
              moodShift: 'no change',
              evolutionWeight: 1
            },
            dreamMetadata: {
              themes: ['general'],
              symbols: ['unknown'],
              emotions: dreamInput.emotions || ['neutral'],
              intensity: 5
            }
          };
        }
      } catch (parseError) {
        throw new Error('Failed to parse AI analysis response');
      }

      debugLog('AI analysis completed', {
        analysisLength: analysisResult.analysis.length,
        evolutionWeight: analysisResult.personalityImpact.evolutionWeight
      });

      return analysisResult;
    } catch (error) {
      debugLog('AI analysis error', { error });
      throw error;
    }
  };

  // Step 3: Save to 0G Storage - KROK 3 APPEND-ONLY PATTERN
  const saveDreamToStorage = async (dreamInput: DreamInput, analysis: DreamAnalysisResult): Promise<string> => {
    try {
      debugLog('Saving dream to 0G Storage - KROK 3 APPEND-ONLY');

      // KROK 3.1: Pobierz istniejący plik daily_dreams (jeśli istnieje)
      let existingDreams: any[] = [];
      let currentFileNumber = 0;
      
      if (agentData?.memory?.currentDreamDailyHash && 
          agentData.memory.currentDreamDailyHash !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
        
        debugLog('Fetching existing dreams file', { 
          currentDreamDailyHash: agentData.memory.currentDreamDailyHash 
        });
        
        try {
          // Pobierz istniejący plik z 0G Storage
          const [downloadData, downloadError] = await downloadByRootHashAPI(
            agentData.memory.currentDreamDailyHash, 
            STORAGE_CONFIG.storageRpc
          );
          
          if (!downloadError && downloadData) {
            const existingData = JSON.parse(new TextDecoder().decode(downloadData));
            
            // Sprawdź czy to array czy single object
            if (Array.isArray(existingData)) {
              existingDreams = existingData;
            } else if (existingData.dreams && Array.isArray(existingData.dreams)) {
              // Jeśli ma strukturę {dreams: [...]}
              existingDreams = existingData.dreams;
            } else {
              // Jeśli to pojedynczy sen, wrap w array
              existingDreams = [existingData];
            }
            
            // Wyciągnij numer pliku z metadanych lub policz z długości
            currentFileNumber = existingData.fileNumber || existingDreams.length;
            
            debugLog('Loaded existing dreams', { 
              existingDreamsCount: existingDreams.length,
              currentFileNumber 
            });
          }
        } catch (error) {
          debugLog('Error loading existing dreams (creating new file)', { error });
          // Nie rzucamy błędu - po prostu tworzymy nowy plik
        }
      } else {
        debugLog('No existing dreams file - creating first daily_dreams file');
      }

      // KROK 3.2: Utwórz nową esencję snu (max 2 zdania content)
      const dreamEssence = {
        id: Date.now(),
        timestamp: Date.now(),
        content: dreamInput.dreamText.substring(0, 200), // Max 2 zdania
        emotions: analysis.dreamMetadata.emotions || [],
        symbols: analysis.dreamMetadata.symbols || [],
        intensity: analysis.dreamMetadata.intensity || 5,
        lucidity_level: dreamInput.lucidDream ? 4 : 1,
        dream_type: analysis.dreamMetadata.themes?.[0] || 'general',
        weather_in_dream: 'unknown',
        characters: ['self'],
        locations: analysis.dreamMetadata.symbols?.slice(0, 2) || ['unknown'],
        actions: ['dreaming'],
        mood_before_sleep: 'unknown',
        mood_after_waking: analysis.personalityImpact.moodShift || 'no change'
      };

      // KROK 3.3: Dodaj nową esencję do array
      const allDreams = [...existingDreams, dreamEssence];
      const newFileNumber = currentFileNumber + 1;

      // KROK 3.4: Utwórz nowy plik daily_dreams_XX.json
      const dreamFileData = {
        fileNumber: newFileNumber,
        agentTokenId: userTokenId?.toString(),
        walletAddress: address,
        totalDreams: allDreams.length,
        createdAt: new Date().toISOString(),
        version: '2.0',
        dreams: allDreams
      };

      // Convert to JSON and create file
      const jsonString = JSON.stringify(dreamFileData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const fileName = `daily_dreams_${String(newFileNumber).padStart(2, '0')}.json`;
      const file = new File([blob], fileName, { type: 'application/json' });

      debugLog('Uploading new dreams file', {
        fileName,
        totalDreams: allDreams.length,
        newFileNumber,
        fileSize: jsonString.length,
        storageRpc: STORAGE_CONFIG.storageRpc,
        l1Rpc: STORAGE_CONFIG.l1Rpc
      });

      // KROK 3.5: Get provider and signer
      const [provider, providerErr] = await getProvider();
      if (!provider || providerErr) {
        throw new Error(`Provider error: ${providerErr?.message}`);
      }

      const [signer, signerErr] = await getSigner(provider);
      if (!signer || signerErr) {
        throw new Error(`Signer error: ${signerErr?.message}`);
      }

      // KROK 3.6: Upload nowego pliku do 0G Storage
      const uploadResult = await uploadFileComplete(
        file,
        STORAGE_CONFIG.storageRpc,
        STORAGE_CONFIG.l1Rpc,
        signer
      );

      if (!uploadResult.success) {
        throw new Error(`Storage upload failed: ${uploadResult.error}`);
      }

      const newRootHash = uploadResult.rootHash!;
      
      debugLog('Dream saved with append-only pattern - KROK 3', { 
        newRootHash,
        fileName,
        totalDreams: allDreams.length,
        previousDreamsCount: existingDreams.length,
        newDreamAdded: true,
        fileSize: jsonString.length
      });

      return newRootHash;
    } catch (error) {
      debugLog('Storage save error - KROK 3', { error });
      throw error;
    }
  };

  // Step 4: Process dream on-chain
  const processDreamOnChain = async (
    tokenId: bigint,
    dreamHash: string,
    analysisHash: string,
    personalityImpact: PersonalityImpact
  ): Promise<string> => {
    try {
      debugLog('Processing dream on-chain', {
        tokenId: tokenId.toString(),
        dreamHash,
        analysisHash,
        personalityImpact
      });

      // Helper function to ensure proper hex format (not double 0x)
      const ensureProperHex = (hash: string): string => {
        if (hash.startsWith('0x')) {
          return hash; // Already has 0x prefix
        }
        return `0x${hash}`; // Add 0x prefix
      };

      // Convert personality impact to contract format with proper type casting
      const impact = {
        creativityChange: Math.max(-127, Math.min(127, Math.round(personalityImpact.creativityChange))),    // int8: -127 to +127
        analyticalChange: Math.max(-127, Math.min(127, Math.round(personalityImpact.analyticalChange))),    // int8: -127 to +127
        empathyChange: Math.max(-127, Math.min(127, Math.round(personalityImpact.empathyChange))),          // int8: -127 to +127
        intuitionChange: Math.max(-127, Math.min(127, Math.round(personalityImpact.intuitionChange))),      // int8: -127 to +127
        resilienceChange: Math.max(-127, Math.min(127, Math.round(personalityImpact.resilienceChange))),    // int8: -127 to +127
        curiosityChange: Math.max(-127, Math.min(127, Math.round(personalityImpact.curiosityChange))),      // int8: -127 to +127
        moodShift: personalityImpact.moodShift,                                                             // string: OK
        evolutionWeight: Math.max(0, Math.min(255, Math.round(personalityImpact.evolutionWeight)))         // uint8: 0 to 255
      };

      debugLog('Converted impact to contract format', {
        originalImpact: personalityImpact,
        contractImpact: impact,
        creativityType: typeof impact.creativityChange,
        evolutionWeightType: typeof impact.evolutionWeight
      });

      const properDreamHash = ensureProperHex(dreamHash);
      const properAnalysisHash = ensureProperHex(analysisHash);

      debugLog('Sending transaction with detailed logging', {
        tokenId: tokenId.toString(),
        dreamHash: properDreamHash,
        analysisHash: properAnalysisHash,
        dreamHashLength: properDreamHash.length,
        analysisHashLength: properAnalysisHash.length,
        contractAddress: contractConfig.address,
        walletAddress: address,
        networkId: chainId,
        impact: impact
      });

      const txHash = await writeContractAsync({
        ...contractConfig,
        functionName: 'processDailyDream',
        account: address,
        chain: galileoTestnet,
        args: [
          tokenId,
          properDreamHash, // Properly formatted dreamHash
          properAnalysisHash, // Properly formatted dreamAnalysisHash  
          impact
        ]
      });

      debugLog('Dream processing transaction sent, waiting for receipt...', { 
        txHash,
        tokenId: tokenId.toString(),
        dreamHash: properDreamHash,
        analysisHash: properAnalysisHash
      });

      return txHash;
    } catch (error: any) {
      const errorMessage = parseViemError(error);
      debugLog('On-chain processing error', { 
        error: errorMessage, 
        originalError: error?.message || error,
        errorType: error?.name || 'Unknown',
        tokenId: tokenId.toString(),
        dreamHash,
        analysisHash
      });
      throw new Error(errorMessage);
    }
  };

  // Main dream processing function
  const processDream = async (dreamInput: DreamInput): Promise<DreamProcessResult> => {
    if (!isConnected || !address) {
      const error = 'Wallet not connected';
      setState(prev => ({ ...prev, error, currentStep: 'error' }));
      return { success: false, error };
    }

    // Walidacja połączenia będzie w saveDreamToStorage przy tworzeniu signera

    if (!isCorrectNetwork) {
      const error = 'Wrong network. Please switch to 0G Galileo Testnet';
      setState(prev => ({ ...prev, error, currentStep: 'error' }));
      return { success: false, error };
    }

    if (!hasAgent || !userTokenId) {
      const error = 'No agent found. Please mint an agent first.';
      setState(prev => ({ ...prev, error, currentStep: 'error' }));
      return { success: false, error };
    }

    if (!dreamInput.dreamText?.trim()) {
      const error = 'Dream text cannot be empty';
      setState(prev => ({ ...prev, error, currentStep: 'error' }));
      return { success: false, error };
    }

    try {
      // Step 1: AI Analysis
      setState(prev => ({ 
        ...prev, 
        isAnalyzing: true, 
        currentStep: 'analyzing',
        error: ''
      }));

      const context = await buildDreamContext(BigInt(userTokenId));
      const analysis = await analyzeDreamWithAI(dreamInput, context);

      setState(prev => ({ 
        ...prev, 
        isAnalyzing: false,
        dreamAnalysis: analysis
      }));

      // Step 2: Save to Storage
      setState(prev => ({ 
        ...prev, 
        isSavingToStorage: true,
        currentStep: 'saving'
      }));

      const storageHash = await saveDreamToStorage(dreamInput, analysis);

      setState(prev => ({ 
        ...prev, 
        isSavingToStorage: false,
        storageHash
      }));

      // Step 3: Process on-chain
      setState(prev => ({ 
        ...prev, 
        isProcessingOnChain: true,
        currentStep: 'processing'
      }));

      const txHash = await processDreamOnChain(
        BigInt(userTokenId),
        storageHash,
        storageHash, // Using same hash for both dream and analysis
        analysis.personalityImpact
      );

      setState(prev => ({ 
        ...prev, 
        isProcessingOnChain: false,
        isWaitingForReceipt: true,
        currentStep: 'processing',
        txHash,
        tokenId: BigInt(userTokenId)
      }));

      debugLog('Dream processing completed successfully', {
        storageHash,
        txHash,
        tokenId: userTokenId.toString()
      });

      return {
        success: true,
        analysis,
        storageHash,
        txHash
      };

    } catch (error: any) {
      const errorMessage = parseViemError(error);
      
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        isSavingToStorage: false,
        isProcessingOnChain: false,
        isWaitingForReceipt: false,
        error: errorMessage,
        currentStep: 'error'
      }));

      debugLog('Dream processing failed', { 
        error: errorMessage,
        originalError: error?.message || error,
        errorType: error?.name || 'Unknown'
      });

      return {
        success: false,
        error: errorMessage
      };
    }
  };

  // Check if agent can process dream today (from contract)
  const checkCanProcessDreamToday = async (): Promise<boolean> => {
    if (!userTokenId) return false;
    
    try {
      // This would call the contract's canProcessDreamToday function
      // For now, return true (implement actual check later)
      return true;
    } catch (error) {
      debugLog('Error checking dream processing eligibility', { error });
      return false;
    }
  };

  // Simplified wrapper for DreamAnalysisSection testing
  const saveDreamToStorageSimple = async (tokenId: number, dreamText: string): Promise<any> => {
    try {
      debugLog('saveDreamToStorageSimple called', { tokenId, dreamText: dreamText.substring(0, 50) + '...' });
      
      // Create mock DreamInput
      const dreamInput: DreamInput = {
        dreamText: dreamText.trim(),
        emotions: ['unknown'],
        lucidDream: false
      };

      // Create mock DreamAnalysisResult with realistic data
      const mockAnalysis: DreamAnalysisResult = {
        analysis: `Dream analysis for: ${dreamText.substring(0, 50)}...`,
        personalityImpact: {
          creativityChange: Math.floor(Math.random() * 3) - 1, // -1 to 1
          analyticalChange: Math.floor(Math.random() * 3) - 1,
          empathyChange: Math.floor(Math.random() * 3) - 1,
          intuitionChange: Math.floor(Math.random() * 3) - 1,
          resilienceChange: Math.floor(Math.random() * 3) - 1,
          curiosityChange: Math.floor(Math.random() * 3) - 1,
          moodShift: ['contemplative', 'energized', 'calm', 'reflective'][Math.floor(Math.random() * 4)],
          evolutionWeight: Math.floor(Math.random() * 5) + 1 // 1 to 5
        },
        dreamMetadata: {
          themes: ['test', 'mock'],
          symbols: ['water', 'sky'],
          emotions: ['curious', 'peaceful'],
          intensity: Math.floor(Math.random() * 5) + 1 // 1 to 5
        }
      };

      debugLog('Calling original saveDreamToStorage with mock data');
      
      // Call the original function
      const rootHash = await saveDreamToStorage(dreamInput, mockAnalysis);
      
      debugLog('saveDreamToStorageSimple completed', { rootHash });
      
      return {
        success: true,
        rootHash,
        dreamInput,
        analysis: mockAnalysis,
        message: 'Dream saved successfully with mock analysis'
      };
      
    } catch (error) {
      debugLog('saveDreamToStorageSimple error', { error });
      throw error;
    }
  };

  return {
    // State
    isAnalyzing: state.isAnalyzing,
    isSavingToStorage: state.isSavingToStorage,
    isProcessingOnChain: state.isProcessingOnChain || isPending,
    isWaitingForReceipt: state.isWaitingForReceipt || isReceiptLoading,
    isComplete: state.isComplete,
    error: state.error,
    currentStep: state.currentStep,
    dreamAnalysis: state.dreamAnalysis,
    storageHash: state.storageHash,
    txHash: state.txHash,

    // Actions
    processDream,
    resetProcessing,
    checkCanProcessDreamToday,

    // Utility
    buildDreamContext,
    saveDreamToStorage: saveDreamToStorageSimple,

    // Agent context
    hasAgent,
    userAgent: agentData,
    userTokenId,
    
    // Configuration
    storageConfig: STORAGE_CONFIG,
    computeConfig: COMPUTE_CONFIG,
    
    // Direct contract test function
    testContractCall: async (mockData: any) => {
      if (!userTokenId || !hasAgent) {
        throw new Error('No agent found');
      }
      
      debugLog('Testing direct contract call with detailed params', { 
        mockData, 
        userTokenId: userTokenId.toString(),
        contractAddress: contractConfig.address,
        userAddress: address,
        chainId: chainId,
        isCorrectNetwork
      });
      
      try {
        // Przygotuj dane z lepszą walidacją - bytes32 wymaga 64 znaków hex (32 bajty)
        const dreamHash = mockData.dreamHash || '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
        const analysisHash = mockData.analysisHash || '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
        const impact = mockData.impact || {
          creativityChange: 2,    // int8: -127 to +127
          analyticalChange: 1,    // int8: -127 to +127
          empathyChange: 1,       // int8: -127 to +127
          intuitionChange: 1,     // int8: -127 to +127
          resilienceChange: 1,    // int8: -127 to +127
          curiosityChange: 1,     // int8: -127 to +127
          moodShift: 'contemplative', // string
          evolutionWeight: 5      // uint8: 0 to 255
        };

        debugLog('Calling contract with exact params', {
          tokenId: userTokenId.toString(),
          dreamHash,
          analysisHash,
          impact,
          functionName: 'processDailyDream'
        });
        
        const txHash = await writeContractAsync({
          ...contractConfig,
          functionName: 'processDailyDream',
          account: address,
          chain: galileoTestnet,
          args: [
            userTokenId,
            dreamHash,
            analysisHash,
            impact
          ]
        });
        
        debugLog('Direct contract call sent successfully', { 
          txHash,
          tokenId: userTokenId.toString()
        });
        return txHash;
      } catch (error: any) {
        const errorMessage = parseViemError(error);
        debugLog('Direct contract call failed with details', { 
          error: errorMessage,
          originalError: error?.message || error,
          errorType: error?.name || 'Unknown',
          errorCode: error?.code,
          errorData: error?.data,
          tokenId: userTokenId.toString(),
          contractAddress: contractConfig.address
        });
        throw new Error(errorMessage);
      }
    }
  };
} 