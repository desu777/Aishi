'use client';

import { useState } from 'react';
import { useStorageDownload } from '../storage/useStorageDownload';
import { useStorageUpload } from '../storage/useStorageUpload';
import { useWallet } from '../useWallet';
import { Contract, ethers } from 'ethers';
import frontendContracts from '../../abi/frontend-contracts.json';
import { DreamContextBuilder, DreamContext } from './services/dreamContextBuilder';
import { getProvider, getSigner } from '../../lib/0g/fees';

interface DreamState {
  dreamText: string;
  isProcessing: boolean;
  error: string | null;
  isLoadingContext: boolean;
  contextStatus: string;
  builtContext: DreamContext | null;
  isUploadingToStorage: boolean;
  uploadStatus: string;
  // NEW: STEP 6 - Contract operations
  isProcessingContract: boolean;
  contractStatus: string;
}

// Interface for dream data we save to storage
interface DreamStorageData {
  analysis: string;
  dreamData: {
    id: number;
    date: string;
    timestamp?: number;
    // Podstawowe dane
    emotions: string[];
    symbols: string[];
    themes?: string[];
    intensity: number;
    lucidity: number;  // ZMIANA z lucidity_level
    // Archetypy i wzorce  
    archetypes?: string[];
    recurring_from?: number[];
    // Analiza - będzie w głównym analysis
    // Wpływ na osobowość
    personality_impact?: {
      dominant_trait?: string;
      shift_direction?: string;
      intensity?: number;
    };
    // Metadane
    sleep_quality?: number;
    recall_clarity?: number;
    dream_type?: string;
  };
}

// NEW: STEP 6 - PersonalityImpact interface (from contract ABI)
interface PersonalityImpact {
  creativityChange: number;       // int8 (-128 to 127)
  analyticalChange: number;       // int8 (-128 to 127)
  empathyChange: number;          // int8 (-128 to 127)
  intuitionChange: number;        // int8 (-128 to 127)
  resilienceChange: number;       // int8 (-128 to 127)
  curiosityChange: number;        // int8 (-128 to 127)
  moodShift: string;             // REQUIRED - nie może być pusty
  evolutionWeight: number;        // uint8 (1-100)
  newFeatures: Array<{
    name: string;                 // REQUIRED - nie może być pusty
    description: string;          // REQUIRED - nie może być pusty
    intensity: number;            // uint8 (1-100)
    addedAt: number;             // timestamp
  }>;                            // max 2 features
}

export function useAgentDream() {
  const [dreamState, setDreamState] = useState<DreamState>({
    dreamText: '',
    isProcessing: false,
    error: null,
    isLoadingContext: false,
    contextStatus: '',
    builtContext: null,
    isUploadingToStorage: false,
    uploadStatus: '',
    // NEW: STEP 6 - Contract operations
    isProcessingContract: false,
    contractStatus: ''
  });

  const { downloadFile } = useStorageDownload();
  const { uploadFile } = useStorageUpload();
  const { isConnected } = useWallet();

  // Debug logs dla development
  const debugLog = (message: string, data?: any) => {
    if (process.env.NEXT_PUBLIC_DREAM_TEST === 'true') {
      console.log(`[useAgentDream] ${message}`, data || '');
    }
  };

  debugLog('useAgentDream hook initialized');

  const setDreamText = (text: string) => {
    setDreamState(prev => ({ ...prev, dreamText: text }));
    debugLog('Dream text updated', { length: text.length });
  };

  const resetDream = () => {
    setDreamState({
      dreamText: '',
      isProcessing: false,
      error: null,
      isLoadingContext: false,
      contextStatus: '',
      builtContext: null,
      isUploadingToStorage: false,
      uploadStatus: '',
      // NEW: STEP 6 - Contract operations
      isProcessingContract: false,
      contractStatus: ''
    });
    debugLog('Dream state reset');
  };

  /**
   * Builds dream analysis context
   */
  const buildDreamContext = async (
    tokenId: number,
    agentData?: any, // Optional pre-loaded agent data from useAgentRead
    dreamTextOverride?: string // Optional dream text to override state
  ): Promise<DreamContext | null> => {
    if (!isConnected) {
      const error = 'Wallet not connected';
      setDreamState(prev => ({ ...prev, error }));
      debugLog('Context building failed - wallet not connected');
      return null;
    }

    const effectiveDreamText = dreamTextOverride || dreamState.dreamText;
    if (!effectiveDreamText.trim()) {
      const error = 'Dream text is required';
      setDreamState(prev => ({ ...prev, error }));
      debugLog('Context building failed - no dream text', { 
        dreamTextOverride, 
        dreamStateDreamText: dreamState.dreamText,
        effectiveDreamText 
      });
      return null;
    }

    setDreamState(prev => ({ 
      ...prev, 
      isLoadingContext: true, 
      error: null,
      contextStatus: 'Initializing...' 
    }));

    try {
      debugLog('Starting context building', { 
        tokenId, 
        dreamLength: effectiveDreamText.length,
        hasPreloadedData: !!agentData,
        usingDreamTextOverride: !!dreamTextOverride
      });

      if (agentData) {
        // Use pre-loaded data from useAgentRead (Wagmi v2 compatible)
        setDreamState(prev => ({ ...prev, contextStatus: 'Using pre-loaded agent data...' }));
        
        // Create a dummy contract for the context builder (not used when agentData is provided)
        const contextBuilder = new DreamContextBuilder(null as any, debugLog);
        
        // Build context with pre-loaded data
        const context = await contextBuilder.buildContext(
          tokenId,
          effectiveDreamText,
          downloadFile,
          agentData
        );

        setDreamState(prev => ({ 
          ...prev, 
          isLoadingContext: false,
          contextStatus: 'Context built successfully from pre-loaded data!',
          builtContext: context
        }));

        debugLog('Context building completed with pre-loaded data', {
          agentName: context.agentProfile.name,
          intelligenceLevel: context.agentProfile.intelligenceLevel,
          memoryDepth: context.memoryAccess.memoryDepth,
          uniqueFeatures: context.uniqueFeatures.length,
          historicalItems: context.historicalData.dailyDreams.length + context.historicalData.monthlyConsolidations.length
        });

        return context;

      } else {
        // Fallback to contract calls (backward compatibility)
        setDreamState(prev => ({ ...prev, contextStatus: 'Connecting to provider...' }));

        const [provider, providerErr] = await getProvider();
        if (!provider || providerErr) {
          throw new Error(`Provider error: ${providerErr?.message}`);
        }

        const [signer, signerErr] = await getSigner(provider);
        if (!signer || signerErr) {
          throw new Error(`Signer error: ${signerErr?.message}`);
        }

        debugLog('Provider and signer connected');

        setDreamState(prev => ({ ...prev, contextStatus: 'Connecting to contract...' }));

        const contractAddress = frontendContracts.galileo.DreamscapeAgent.address;
        const contractABI = frontendContracts.galileo.DreamscapeAgent.abi;
        const contract = new Contract(contractAddress, contractABI, signer);

        debugLog('Contract connected', { address: contractAddress });

        setDreamState(prev => ({ ...prev, contextStatus: 'Building context...' }));

        const contextBuilder = new DreamContextBuilder(contract, debugLog);

        const context = await contextBuilder.buildContext(
          tokenId,
          effectiveDreamText,
          downloadFile
        );

        setDreamState(prev => ({ 
          ...prev, 
          isLoadingContext: false,
          contextStatus: 'Context built successfully!',
          builtContext: context
        }));

        debugLog('Context building completed', {
          agentName: context.agentProfile.name,
          intelligenceLevel: context.agentProfile.intelligenceLevel,
          memoryDepth: context.memoryAccess.memoryDepth,
          uniqueFeatures: context.uniqueFeatures.length,
          historicalItems: context.historicalData.dailyDreams.length + context.historicalData.monthlyConsolidations.length
        });

        return context;
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setDreamState(prev => ({ 
        ...prev, 
        isLoadingContext: false,
        error: errorMessage,
        contextStatus: ''
      }));
      debugLog('Context building failed', { error: errorMessage });
      return null;
    }
  };

  /**
   * Saves dream data to storage using append-only pattern
   * Downloads existing file, adds new dream to top, uploads new file
   */
  const saveDreamToStorage = async (
    tokenId: number,
    dreamStorageData: DreamStorageData
  ): Promise<{ success: boolean; rootHash?: string; error?: string }> => {
    if (!isConnected) {
      const error = 'Wallet not connected';
      setDreamState(prev => ({ ...prev, error }));
      debugLog('Dream storage failed - wallet not connected');
      return { success: false, error };
    }

    setDreamState(prev => ({ 
      ...prev, 
      isUploadingToStorage: true, 
      error: null,
      uploadStatus: 'Preparing dream storage...' 
    }));

    try {
      debugLog('Starting dream storage', { 
        tokenId, 
        dreamId: dreamStorageData.dreamData.id,
        date: dreamStorageData.dreamData.date 
      });

      // 1. Get contract instance to read current memory
      setDreamState(prev => ({ ...prev, uploadStatus: 'Reading agent memory...' }));
      
      const [provider, providerErr] = await getProvider();
      if (!provider || providerErr) {
        throw new Error(`Provider error: ${providerErr?.message}`);
      }

      const [signer, signerErr] = await getSigner(provider);
      if (!signer || signerErr) {
        throw new Error(`Signer error: ${signerErr?.message}`);
      }

      const contractAddress = frontendContracts.galileo.DreamscapeAgent.address;
      const contractABI = frontendContracts.galileo.DreamscapeAgent.abi;
      const contract = new Contract(contractAddress, contractABI, signer);

      debugLog('Contract connected for storage');

      // 2. Get current memory structure
      const agentMemory = await contract.getAgentMemory(tokenId);
      const currentDreamHash = agentMemory.currentDreamDailyHash;
      const emptyHash = '0x0000000000000000000000000000000000000000000000000000000000000000';

      debugLog('Current dream hash from contract', { currentDreamHash });

      // 3. Download existing dreams file if it exists
      setDreamState(prev => ({ ...prev, uploadStatus: 'Downloading existing dreams...' }));
      
      let existingDreams: any[] = [];
      
      if (currentDreamHash && currentDreamHash !== emptyHash) {
        debugLog('Downloading existing dreams file', { hash: currentDreamHash });
        
        const downloadResult = await downloadFile(currentDreamHash);
        
        if (downloadResult.success && downloadResult.data) {
          try {
            // Convert ArrayBuffer to string and parse JSON
            const textDecoder = new TextDecoder('utf-8');
            const jsonText = textDecoder.decode(downloadResult.data);
            existingDreams = JSON.parse(jsonText);
            debugLog('Existing dreams loaded', { count: existingDreams.length });
          } catch (parseError) {
            debugLog('Failed to parse existing dreams, starting fresh', parseError);
            existingDreams = [];
          }
        } else {
          debugLog('Failed to download existing dreams, starting fresh', downloadResult.error);
          existingDreams = [];
        }
      } else {
        debugLog('No existing dreams file, starting fresh array');
      }

      // 4. Create new dream entry (optimized format) 
      const newDreamEntry: any = {
        id: dreamStorageData.dreamData.id,
        date: dreamStorageData.dreamData.date,
        timestamp: dreamStorageData.dreamData.timestamp || Math.floor(Date.now() / 1000),
        emotions: dreamStorageData.dreamData.emotions,
        symbols: dreamStorageData.dreamData.symbols,
        intensity: dreamStorageData.dreamData.intensity,
        lucidity: dreamStorageData.dreamData.lucidity,
        ai_analysis: dreamStorageData.analysis
      };

      // Add optional fields only if they exist and are not empty
      if (dreamStorageData.dreamData.themes && dreamStorageData.dreamData.themes.length > 0) {
        newDreamEntry.themes = dreamStorageData.dreamData.themes;
      }
      if (dreamStorageData.dreamData.archetypes && dreamStorageData.dreamData.archetypes.length > 0) {
        newDreamEntry.archetypes = dreamStorageData.dreamData.archetypes;
      }
      if (dreamStorageData.dreamData.recurring_from && dreamStorageData.dreamData.recurring_from.length > 0) {
        newDreamEntry.recurring_from = dreamStorageData.dreamData.recurring_from;
      }
      if (dreamStorageData.dreamData.personality_impact) {
        newDreamEntry.personality_impact = dreamStorageData.dreamData.personality_impact;
      }
      if (dreamStorageData.dreamData.sleep_quality !== undefined) {
        newDreamEntry.sleep_quality = dreamStorageData.dreamData.sleep_quality;
      }
      if (dreamStorageData.dreamData.recall_clarity !== undefined) {
        newDreamEntry.recall_clarity = dreamStorageData.dreamData.recall_clarity;
      }
      if (dreamStorageData.dreamData.dream_type) {
        newDreamEntry.dream_type = dreamStorageData.dreamData.dream_type;
      }

      // 5. Append new dream to TOP of array (newest first)
      const updatedDreams = [newDreamEntry, ...existingDreams];
      debugLog('Updated dreams array created', { totalDreams: updatedDreams.length });

      // 6. Create new file content
      setDreamState(prev => ({ ...prev, uploadStatus: 'Creating updated dreams file...' }));
      
      const fileContent = JSON.stringify(updatedDreams, null, 2);
      const blob = new Blob([fileContent], { type: 'application/json' });
      const file = new File([blob], `dream_essence_daily_${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}.json`, {
        type: 'application/json'
      });

      debugLog('New dreams file created', { 
        fileSize: file.size, 
        fileName: file.name,
        totalDreams: updatedDreams.length
      });

      // 7. Upload new file to storage
      setDreamState(prev => ({ ...prev, uploadStatus: 'Uploading to 0G Storage...' }));
      
      const uploadResult = await uploadFile(file);
      
      if (!uploadResult.success) {
        throw new Error(`Upload failed: ${uploadResult.error}`);
      }

      setDreamState(prev => ({ 
        ...prev, 
        isUploadingToStorage: false,
        uploadStatus: 'Dream saved to storage successfully!'
      }));

      debugLog('Dream storage completed successfully', {
        newRootHash: uploadResult.rootHash,
        totalDreams: updatedDreams.length,
        dreamId: dreamStorageData.dreamData.id
      });

      return {
        success: true,
        rootHash: uploadResult.rootHash
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setDreamState(prev => ({ 
        ...prev, 
        isUploadingToStorage: false,
        error: errorMessage,
        uploadStatus: ''
      }));
      debugLog('Dream storage failed', { error: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Extracts dream data from AI response and saves to storage
   * Works for both regular dreams and evolution dreams (extracts same data)
   */
  const extractAndSaveDreamData = async (
    tokenId: number,
    parsedAIResponse: any
  ): Promise<{ success: boolean; rootHash?: string; error?: string }> => {
    try {
      debugLog('Extracting dream data from AI response', {
        tokenId,
        hasAnalysis: !!parsedAIResponse.analysis,
        hasDreamData: !!parsedAIResponse.dreamData,
        hasPersonalityImpact: !!parsedAIResponse.personalityImpact
      });

      // Validate required data
      if (!parsedAIResponse.analysis || !parsedAIResponse.dreamData) {
        throw new Error('Missing required data: analysis or dreamData');
      }

      // Extract the data we need for storage (same for regular and evolution dreams)
      const dreamStorageData: DreamStorageData = {
        analysis: parsedAIResponse.analysis,
        dreamData: {
          id: parsedAIResponse.dreamData.id,
          date: parsedAIResponse.dreamData.date,
          timestamp: parsedAIResponse.dreamData.timestamp || Math.floor(Date.now() / 1000),
          // Podstawowe dane
          emotions: parsedAIResponse.dreamData.emotions || [],
          symbols: parsedAIResponse.dreamData.symbols || [],
          themes: parsedAIResponse.dreamData.themes || [],
          intensity: parsedAIResponse.dreamData.intensity || 5,
          lucidity: parsedAIResponse.dreamData.lucidity || 1,
          // Archetypy i wzorce
          archetypes: parsedAIResponse.dreamData.archetypes || [],
          recurring_from: parsedAIResponse.dreamData.recurring_from || [],
          // Wpływ na osobowość
          personality_impact: parsedAIResponse.dreamData.personality_impact || undefined,
          // Metadane
          sleep_quality: parsedAIResponse.dreamData.sleep_quality || undefined,
          recall_clarity: parsedAIResponse.dreamData.recall_clarity || undefined,
          dream_type: parsedAIResponse.dreamData.dream_type || undefined
        }
      };

      debugLog('Dream storage data extracted', {
        dreamId: dreamStorageData.dreamData.id,
        date: dreamStorageData.dreamData.date,
        timestamp: dreamStorageData.dreamData.timestamp,
        analysisLength: dreamStorageData.analysis.length,
        emotionsCount: dreamStorageData.dreamData.emotions.length,
        symbolsCount: dreamStorageData.dreamData.symbols.length,
        themesCount: dreamStorageData.dreamData.themes?.length || 0,
        archetypesCount: dreamStorageData.dreamData.archetypes?.length || 0,
        intensity: dreamStorageData.dreamData.intensity,
        lucidity: dreamStorageData.dreamData.lucidity,
        dreamType: dreamStorageData.dreamData.dream_type,
        sleepQuality: dreamStorageData.dreamData.sleep_quality,
        recallClarity: dreamStorageData.dreamData.recall_clarity
      });

      // Save to storage
      const result = await saveDreamToStorage(tokenId, dreamStorageData);
      
      if (result.success) {
        debugLog('Dream data saved to storage successfully', {
          rootHash: result.rootHash,
          dreamId: dreamStorageData.dreamData.id
        });
      }

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      debugLog('Failed to extract and save dream data', { error: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  /**
   * NEW: STEP 6 - Creates PersonalityImpact based on dream type
   * For regular dreams: uses current personality data (neutral)
   * For evolution dreams (%5==0): uses AI response data
   */
  const createPersonalityImpact = (
    builtContext: DreamContext,
    parsedAIResponse: any,
    dreamCount: number
  ): PersonalityImpact => {
    const isEvolutionDream = dreamCount > 0 && dreamCount % 5 === 0;
    
    debugLog('Creating PersonalityImpact', {
      dreamCount,
      isEvolutionDream,
      hasAIPersonalityImpact: !!parsedAIResponse.personalityImpact
    });

    if (isEvolutionDream && parsedAIResponse.personalityImpact) {
      // Evolution dream - use AI response data
      const aiImpact = parsedAIResponse.personalityImpact;
      
      debugLog('Using AI PersonalityImpact for evolution dream', aiImpact);
      
      return {
        creativityChange: aiImpact.creativityChange || 0,
        analyticalChange: aiImpact.analyticalChange || 0,
        empathyChange: aiImpact.empathyChange || 0,
        intuitionChange: aiImpact.intuitionChange || 0,
        resilienceChange: aiImpact.resilienceChange || 0,
        curiosityChange: aiImpact.curiosityChange || 0,
        moodShift: aiImpact.moodShift || 'neutral',
        evolutionWeight: aiImpact.evolutionWeight || 75,
        newFeatures: (aiImpact.newFeatures || []).map((feature: any) => ({
          name: feature.name,
          description: feature.description,
          intensity: feature.intensity || 50,
          addedAt: Math.floor(Date.now() / 1000)
        }))
      };
    } else {
      // Regular dream - use current personality data (neutral impact)
      const currentPersonality = builtContext.personality;
      
      debugLog('Using neutral PersonalityImpact for regular dream', {
        currentMood: currentPersonality.dominantMood
      });
      
      return {
        creativityChange: 0,
        analyticalChange: 0,
        empathyChange: 0,
        intuitionChange: 0,
        resilienceChange: 0,
        curiosityChange: 0,
        moodShift: currentPersonality.dominantMood || 'neutral',
        evolutionWeight: 50,
        newFeatures: []
      };
    }
  };

  /**
   * NEW: STEP 6 - Calls processDailyDream on contract
   * Updates dream hash and personality (if evolution dream)
   */
  const callProcessDailyDream = async (
    tokenId: number,
    dreamHash: string,
    personalityImpact: PersonalityImpact
  ): Promise<{ success: boolean; txHash?: string; error?: string }> => {
    if (!isConnected) {
      const error = 'Wallet not connected';
      setDreamState(prev => ({ ...prev, error }));
      debugLog('Contract call failed - wallet not connected');
      return { success: false, error };
    }

    setDreamState(prev => ({ 
      ...prev, 
      isProcessingContract: true, 
      error: null,
      contractStatus: 'Preparing contract transaction...' 
    }));

    try {
      debugLog('Starting processDailyDream contract call', { 
        tokenId, 
        dreamHash,
        personalityImpact: {
          moodShift: personalityImpact.moodShift,
          evolutionWeight: personalityImpact.evolutionWeight,
          newFeaturesCount: personalityImpact.newFeatures.length
        }
      });

      // 1. Get contract instance
      setDreamState(prev => ({ ...prev, contractStatus: 'Connecting to contract...' }));
      
      const [provider, providerErr] = await getProvider();
      if (!provider || providerErr) {
        throw new Error(`Provider error: ${providerErr?.message}`);
      }

      const [signer, signerErr] = await getSigner(provider);
      if (!signer || signerErr) {
        throw new Error(`Signer error: ${signerErr?.message}`);
      }

      const contractAddress = frontendContracts.galileo.DreamscapeAgent.address;
      const contractABI = frontendContracts.galileo.DreamscapeAgent.abi;
      const contract = new Contract(contractAddress, contractABI, signer);

      debugLog('Contract connected for processDailyDream');

      // 2. Use dreamHash directly (already in correct bytes32 format from 0G Storage)
      const dreamHashBytes32 = dreamHash; // 0G Storage returns hex string "0x..." which is valid bytes32
      
      debugLog('Using root hash from storage as bytes32', { 
        originalHash: dreamHash,
        bytes32Hash: dreamHashBytes32
      });

      // 3. Call processDailyDream
      setDreamState(prev => ({ ...prev, contractStatus: 'Calling processDailyDream...' }));
      
      const tx = await contract.processDailyDream(
        tokenId,
        dreamHashBytes32,
        personalityImpact
      );

      debugLog('processDailyDream transaction sent', { 
        txHash: tx.hash,
        tokenId,
        dreamHash: dreamHashBytes32
      });

      // 4. Wait for transaction confirmation
      setDreamState(prev => ({ ...prev, contractStatus: 'Waiting for confirmation...' }));
      
      const receipt = await tx.wait();
      
      debugLog('processDailyDream transaction confirmed', {
        txHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      });

      setDreamState(prev => ({ 
        ...prev, 
        isProcessingContract: false,
        contractStatus: 'Dream processed successfully!'
      }));

      return {
        success: true,
        txHash: receipt.transactionHash
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setDreamState(prev => ({ 
        ...prev, 
        isProcessingContract: false,
        error: errorMessage,
        contractStatus: ''
      }));
      debugLog('processDailyDream failed', { error: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  /**
   * NEW: STEP 6 - Main function combining STEP 5 + STEP 6
   * Processes storage upload AND contract write operations
   */
  const processStorageAndContract = async (
    tokenId: number,
    parsedAIResponse: any
  ): Promise<{ success: boolean; txHash?: string; rootHash?: string; error?: string }> => {
    if (!dreamState.builtContext) {
      const error = 'Context not built - call buildDreamContext first';
      setDreamState(prev => ({ ...prev, error }));
      debugLog('processStorageAndContract failed - no context');
      return { success: false, error };
    }

    try {
      debugLog('Starting storage and contract processing', {
        tokenId,
        hasBuiltContext: !!dreamState.builtContext,
        currentDreamCount: dreamState.builtContext.agentProfile.dreamCount
      });

      // STEP 5: Extract and save dream data to storage
      const storageResult = await extractAndSaveDreamData(tokenId, parsedAIResponse);
      
      if (!storageResult.success) {
        throw new Error(`Storage failed: ${storageResult.error}`);
      }

      debugLog('Storage processing completed', {
        rootHash: storageResult.rootHash
      });

      // STEP 6: Create PersonalityImpact and call contract
      const currentDreamCount = dreamState.builtContext.agentProfile.dreamCount + 1; // +1 for new dream
      const personalityImpact = createPersonalityImpact(
        dreamState.builtContext,
        parsedAIResponse,
        currentDreamCount
      );

      // Call processDailyDream with new root hash
      const contractResult = await callProcessDailyDream(
        tokenId,
        storageResult.rootHash!,
        personalityImpact
      );

      if (!contractResult.success) {
        // Storage succeeded but contract failed
        debugLog('Contract failed after successful storage', {
          storageRootHash: storageResult.rootHash,
          contractError: contractResult.error
        });
        throw new Error(`Contract failed: ${contractResult.error}`);
      }

      debugLog('Storage and contract processing completed successfully', {
        rootHash: storageResult.rootHash,
        txHash: contractResult.txHash,
        dreamCount: currentDreamCount,
        isEvolutionDream: currentDreamCount % 5 === 0
      });

      return {
        success: true,
        rootHash: storageResult.rootHash,
        txHash: contractResult.txHash
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      debugLog('processStorageAndContract failed', { error: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  return {
    dreamText: dreamState.dreamText,
    isProcessing: dreamState.isProcessing,
    error: dreamState.error,
    isLoadingContext: dreamState.isLoadingContext,
    contextStatus: dreamState.contextStatus,
    builtContext: dreamState.builtContext,
    isUploadingToStorage: dreamState.isUploadingToStorage,
    uploadStatus: dreamState.uploadStatus,
    // NEW: STEP 6 exports
    isProcessingContract: dreamState.isProcessingContract,
    contractStatus: dreamState.contractStatus,
    setDreamText,
    resetDream,
    buildDreamContext,
    saveDreamToStorage,
    extractAndSaveDreamData,
    // NEW: STEP 6 functions
    createPersonalityImpact,
    callProcessDailyDream,
    processStorageAndContract
  };
}
