'use client';

import { useState, useEffect } from 'react';
import { useWriteContract, useAccount, useChainId } from 'wagmi';
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

/**
 * Hook for processing dreams: AI analysis → Storage → On-chain evolution
 * Handles the complete workflow from dream input to personality evolution
 */
export function useAgentDream() {
  const { debugLog } = useTheme();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { writeContractAsync, isPending } = useWriteContract();
  
  // Agent read hooks for context
  const {
    userAgent,
    userTokenId,
    hasAgent,
    getDreamHistory,
    getAgentInfo
  } = useAgentRead();

  // Local state for dream processing
  const [state, setState] = useState<DreamProcessState>({
    isAnalyzing: false,
    isSavingToStorage: false,
    isProcessingOnChain: false,
    isComplete: false,
    error: '',
    currentStep: 'input'
  });

  // Check if on correct network
  const isCorrectNetwork = chainId === parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '16601');

  // Reset processing state
  const resetProcessing = () => {
    setState({
      isAnalyzing: false,
      isSavingToStorage: false,
      isProcessingOnChain: false,
      isComplete: false,
      error: '',
      currentStep: 'input'
    });
    debugLog('Dream processing state reset');
  };

  // Step 1: Build context from agent history and level
  const buildDreamContext = async (tokenId: bigint): Promise<string> => {
    try {
      debugLog('Building dream context', { tokenId: tokenId.toString() });

      // Get agent info for level and personality
      const { data: agentInfoData } = getAgentInfo(tokenId);
      const agentInfo = agentInfoData as AgentInfo | undefined;
      
      // Get dream history (last 5 dreams)
      const { data: dreamHashesData } = getDreamHistory(tokenId, BigInt(5));
      const dreamHashes = dreamHashesData as string[] | undefined;
      
      let context = `Agent Context:\n`;
      
      if (agentInfo) {
        context += `- Intelligence Level: ${agentInfo.intelligenceLevel}\n`;
        context += `- Dream Count: ${agentInfo.dreamCount}\n`;
        context += `- Conversation Count: ${agentInfo.conversationCount}\n`;
        context += `- Total Evolutions: ${agentInfo.totalEvolutions}\n`;
        
        if (agentInfo.personality) {
          context += `- Current Personality:\n`;
          context += `  * Creativity: ${agentInfo.personality.creativity}/100\n`;
          context += `  * Analytical: ${agentInfo.personality.analytical}/100\n`;
          context += `  * Empathy: ${agentInfo.personality.empathy}/100\n`;
          context += `  * Intuition: ${agentInfo.personality.intuition}/100\n`;
          context += `  * Resilience: ${agentInfo.personality.resilience}/100\n`;
          context += `  * Curiosity: ${agentInfo.personality.curiosity}/100\n`;
          context += `  * Dominant Mood: ${agentInfo.personality.dominantMood}\n`;
        }
      }

      // Add recent dreams context if available
      if (dreamHashes && dreamHashes.length > 0) {
        context += `\nRecent Dreams: ${dreamHashes.length} previous dreams recorded\n`;
        // Note: In real implementation, we'd fetch and include dream content from storage
      } else {
        context += `\nThis is the agent's first dream.\n`;
      }

      context += `\nPlease analyze the new dream considering this context.\n`;
      
      debugLog('Dream context built', { contextLength: context.length });
      return context;
    } catch (error) {
      debugLog('Error building dream context', { error });
      return 'Agent Context: Unable to load previous context.\n';
    }
  };

  // Step 2: AI Analysis via 0G Compute
  const analyzeDreamWithAI = async (dreamInput: DreamInput, context: string): Promise<DreamAnalysisResult> => {
    try {
      const prompt = `
You are a multilingual dream analysis expert integrated into the Dreamscape platform. Your task is to analyze a dream provided by an agent's owner.

**Instructions:**
1.  **Detect Language:** First, identify the language of the user's dream description.
2.  **Analyze in Detected Language:** The main "analysis" text MUST be in the same language you detected.
3.  **Provide Structured Data in English:** The \`personalityImpact\` and \`dreamMetadata\` JSON fields and their values (themes, symbols, emotions) MUST be in English, as this data is used by the smart contract.

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

  // Step 3: Save to 0G Storage
  const saveDreamToStorage = async (dreamInput: DreamInput, analysis: DreamAnalysisResult): Promise<string> => {
    try {
      debugLog('Saving dream to 0G Storage');

      // Create dream data object
      const dreamData = {
        timestamp: new Date().toISOString(),
        agentTokenId: userTokenId?.toString(),
        walletAddress: address,
        dreamInput,
        analysis,
        version: '1.0'
      };

      // Convert to JSON and create file
      const jsonString = JSON.stringify(dreamData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const file = new File([blob], `dream-${Date.now()}.json`, { type: 'application/json' });

      debugLog('Uploading to 0G Storage', {
        storageRpc: STORAGE_CONFIG.storageRpc,
        l1Rpc: STORAGE_CONFIG.l1Rpc,
        fileSize: jsonString.length
      });

      // Get provider and signer (SAME AS useStorageUpload)
      const [provider, providerErr] = await getProvider();
      if (!provider || providerErr) {
        throw new Error(`Provider error: ${providerErr?.message}`);
      }

      const [signer, signerErr] = await getSigner(provider);
      if (!signer || signerErr) {
        throw new Error(`Signer error: ${signerErr?.message}`);
      }

      // Upload to 0G Storage with proper ethers signer
      const uploadResult = await uploadFileComplete(
        file,
        STORAGE_CONFIG.storageRpc,
        STORAGE_CONFIG.l1Rpc,
        signer // Używamy ethers signer (jak useStorageUpload)
      );

      if (!uploadResult.success) {
        throw new Error(`Storage upload failed: ${uploadResult.error}`);
      }

      const rootHash = uploadResult.rootHash!;
      
      debugLog('Dream saved to storage', { 
        rootHash,
        dataSize: jsonString.length 
      });

      return rootHash;
    } catch (error) {
      debugLog('Storage save error', { error });
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
        analysisHash
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

      debugLog('Sending transaction with hashes', {
        dreamHash: properDreamHash,
        analysisHash: properAnalysisHash,
        dreamHashLength: properDreamHash.length,
        analysisHashLength: properAnalysisHash.length
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

      debugLog('Dream processing transaction sent', { txHash });
      return txHash;
    } catch (error) {
      debugLog('On-chain processing error', { error });
      throw error;
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

      const context = await buildDreamContext(userTokenId as bigint);
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
        userTokenId as bigint,
        storageHash,
        storageHash, // Using same hash for both dream and analysis
        analysis.personalityImpact
      );

      setState(prev => ({ 
        ...prev, 
        isProcessingOnChain: false,
        isComplete: true,
        currentStep: 'complete',
        txHash,
        tokenId: userTokenId as bigint
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
      const errorMessage = error.message || 'Dream processing failed';
      
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        isSavingToStorage: false,
        isProcessingOnChain: false,
        error: errorMessage,
        currentStep: 'error'
      }));

      debugLog('Dream processing failed', { error: errorMessage });

      return {
        success: false,
        error: errorMessage
      };
    }
  };

  // Check if agent can process dream today (from contract)
  const canProcessDreamToday = async (): Promise<boolean> => {
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

  return {
    // State
    isAnalyzing: state.isAnalyzing,
    isSavingToStorage: state.isSavingToStorage,
    isProcessingOnChain: state.isProcessingOnChain || isPending,
    isComplete: state.isComplete,
    error: state.error,
    currentStep: state.currentStep,
    dreamAnalysis: state.dreamAnalysis,
    storageHash: state.storageHash,
    txHash: state.txHash,

    // Actions
    processDream,
    resetProcessing,
    canProcessDreamToday,

    // Utility
    buildDreamContext,

    // Agent context
    hasAgent,
    userAgent,
    userTokenId,
    
    // Configuration
    storageConfig: STORAGE_CONFIG,
    computeConfig: COMPUTE_CONFIG,
  };
} 