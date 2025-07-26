'use client';

import { useState, useCallback, useEffect } from 'react';
import { useStorageDownload } from '../storage/useStorageDownload';
import { useStorageUpload } from '../storage/useStorageUpload';
import { useWallet } from '../useWallet';
import { useAgentRead } from './useAgentRead';
import { Contract } from 'ethers';
import frontendContracts from '../../abi/frontend-contracts.json';
import { getProvider, getSigner } from '../../lib/0g/fees';
import {
  sendYearlyConsolidation,
  validateYearlyDataCompleteness,
  generateYearlyDataSummary,
  YearlyMemoryCore
} from './services/yearLearnService';
import { YearLearnPromptData } from '../../prompts/yearLearnConsolidationPrompt';
import { MonthlyDreamConsolidation, MonthlyConversationConsolidation } from './services/monthLearnService';

// Interface for yearly consolidation state (streamlined like month-learn)
interface YearLearnState {
  isLoading: boolean;
  isLoadingData: boolean;
  isGeneratingConsolidation: boolean;
  isSavingToStorage: boolean;
  isUpdatingContract: boolean;
  error: string | null;
  statusMessage: string;
  
  // Workflow completion
  isCompleted: boolean;
  
  // Timeout handling
  hasWaitedForData: boolean;
}

export function useYearLearn(tokenId?: number) {
  // ALL HOOKS MUST BE CALLED FIRST - NO EARLY RETURNS BEFORE HOOKS!
  const [state, setState] = useState<YearLearnState>({
    isLoading: false,
    isLoadingData: false,
    isGeneratingConsolidation: false,
    isSavingToStorage: false,
    isUpdatingContract: false,
    error: null,
    statusMessage: '',
    isCompleted: false,
    hasWaitedForData: false
  });

  const { downloadFile } = useStorageDownload();
  const { uploadFile } = useStorageUpload();
  const { isConnected, address } = useWallet();
  const { agentData, effectiveTokenId, personalityTraits } = useAgentRead();

  // Get operational token ID
  const operationalTokenId = tokenId || effectiveTokenId;

  // Debug logging
  const debugLog = useCallback((message: string, data?: any) => {
    if (process.env.NEXT_PUBLIC_YEAR_LEARN_TEST === 'true') {
      console.log(`[useYearLearn] ${message}`, data || '');
    }
  }, []);

  // Debug log initialization ONLY ONCE to prevent infinite re-renders
  useEffect(() => {
    debugLog('useYearLearn hook initialized', { tokenId: operationalTokenId });
  }, [operationalTokenId, debugLog]);

  // Add 30-second timeout before showing "Agent data not available" error
  useEffect(() => {
    const timer = setTimeout(() => {
      setState(prev => ({
        ...prev,
        hasWaitedForData: true
      }));
      debugLog('30-second timeout reached - will show error if no agent data');
    }, 30000); // 30 seconds

    // Clear timeout if data becomes available or component unmounts
    if (operationalTokenId && agentData?.memory) {
      clearTimeout(timer);
    }

    return () => clearTimeout(timer);
  }, [operationalTokenId, agentData?.memory, debugLog]);

  // Extract stable hash values to prevent re-renders (like month-learn)
  const lastDreamMonthlyHash = agentData?.memory?.lastDreamMonthlyHash;
  const lastConvMonthlyHash = agentData?.memory?.lastConvMonthlyHash;
  const memoryCoreHash = agentData?.memory?.memoryCoreHash;

  /**
   * Load monthly consolidations data from 0G storage (like month-learn loads daily data)
   */
  const loadYearlyData = useCallback(async (): Promise<{ success: boolean; yearlyDreamConsolidations?: MonthlyDreamConsolidation[]; yearlyConversationConsolidations?: MonthlyConversationConsolidation[] }> => {
    if (process.env.NEXT_PUBLIC_YEAR_LEARN_TEST === 'true') {
      console.log('[useYearLearn] loadYearlyData: FUNCTION CALLED!');
      console.log('[useYearLearn] loadYearlyData: isConnected:', isConnected);
      console.log('[useYearLearn] loadYearlyData: operationalTokenId:', operationalTokenId);
      console.log('[useYearLearn] loadYearlyData: lastDreamMonthlyHash:', lastDreamMonthlyHash);
      console.log('[useYearLearn] loadYearlyData: lastConvMonthlyHash:', lastConvMonthlyHash);
    }
    debugLog('Starting yearly data loading');

    if (!isConnected || !operationalTokenId) {
      if (process.env.NEXT_PUBLIC_YEAR_LEARN_TEST === 'true') {
        console.log('[useYearLearn] loadYearlyData: NOT CONNECTED OR NO TOKEN ID - returning false');
      }
      debugLog('Not connected or no token ID');
      return { success: false };
    }

    setState(prev => ({
      ...prev,
      isLoadingData: true,
      statusMessage: `>> ${agentData?.agentName || 'Agent'} initiating annual memory core synthesis...`
    }));

    try {
      let yearlyDreamConsolidations: MonthlyDreamConsolidation[] = [];
      let yearlyConversationConsolidations: MonthlyConversationConsolidation[] = [];
      const emptyHash = '0x0000000000000000000000000000000000000000000000000000000000000000';

      // Download dream consolidations using monthly hash from contract (like month-learn)
      // lastDreamMonthlyHash already extracted at hook level
      if (lastDreamMonthlyHash && lastDreamMonthlyHash !== emptyHash) {
        try {
          if (process.env.NEXT_PUBLIC_YEAR_LEARN_TEST === 'true') {
            console.log('[useYearLearn] loadYearlyData: About to download dream consolidations from hash:', lastDreamMonthlyHash);
          }
          debugLog('Downloading dream consolidations from hash', { hash: lastDreamMonthlyHash });
          const dreamDownloadResult = await downloadFile(lastDreamMonthlyHash);
          
          if (process.env.NEXT_PUBLIC_YEAR_LEARN_TEST === 'true') {
            console.log('[useYearLearn] loadYearlyData: Dream consolidations download result:', dreamDownloadResult);
          }
          
          if (dreamDownloadResult.success && dreamDownloadResult.data) {
            const textDecoder = new TextDecoder('utf-8');
            const dreamDataString = textDecoder.decode(dreamDownloadResult.data);
            const dreamData = JSON.parse(dreamDataString);
            
            yearlyDreamConsolidations = Array.isArray(dreamData) ? dreamData : [dreamData];
            if (process.env.NEXT_PUBLIC_YEAR_LEARN_TEST === 'true') {
              console.log('[useYearLearn] loadYearlyData: Dream consolidations parsed successfully, count:', yearlyDreamConsolidations.length);
            }
            debugLog('Monthly dream consolidations loaded from hash', { count: yearlyDreamConsolidations.length });
          }
        } catch (dreamError) {
          if (process.env.NEXT_PUBLIC_YEAR_LEARN_TEST === 'true') {
            console.log('[useYearLearn] loadYearlyData: ERROR loading dream consolidations:', dreamError);
          }
          debugLog('Error loading dream consolidations from hash', { error: dreamError });
        }
      } else {
        if (process.env.NEXT_PUBLIC_YEAR_LEARN_TEST === 'true') {
          console.log('[useYearLearn] loadYearlyData: No valid dream consolidation hash found');
        }
        debugLog('No valid dream consolidation hash found - starting with empty array');
      }

      // Download conversation consolidations using monthly hash from contract (like month-learn)
      // lastConvMonthlyHash already extracted at hook level
      if (lastConvMonthlyHash && lastConvMonthlyHash !== emptyHash) {
        try {
          if (process.env.NEXT_PUBLIC_YEAR_LEARN_TEST === 'true') {
            console.log('[useYearLearn] loadYearlyData: About to download conversation consolidations from hash:', lastConvMonthlyHash);
          }
          debugLog('Downloading conversation consolidations from hash', { hash: lastConvMonthlyHash });
          const convDownloadResult = await downloadFile(lastConvMonthlyHash);
          
          if (process.env.NEXT_PUBLIC_YEAR_LEARN_TEST === 'true') {
            console.log('[useYearLearn] loadYearlyData: Conversation consolidations download result:', convDownloadResult);
          }
          
          if (convDownloadResult.success && convDownloadResult.data) {
            const textDecoder = new TextDecoder('utf-8');
            const convDataString = textDecoder.decode(convDownloadResult.data);
            const convData = JSON.parse(convDataString);
            
            yearlyConversationConsolidations = Array.isArray(convData) ? convData : [convData];
            if (process.env.NEXT_PUBLIC_YEAR_LEARN_TEST === 'true') {
              console.log('[useYearLearn] loadYearlyData: Conversation consolidations parsed successfully, count:', yearlyConversationConsolidations.length);
            }
            debugLog('Monthly conversation consolidations loaded from hash', { count: yearlyConversationConsolidations.length });
          }
        } catch (convError) {
          if (process.env.NEXT_PUBLIC_YEAR_LEARN_TEST === 'true') {
            console.log('[useYearLearn] loadYearlyData: ERROR loading conversation consolidations:', convError);
          }
          debugLog('Error loading conversation consolidations from hash', { error: convError });
        }
      } else {
        if (process.env.NEXT_PUBLIC_YEAR_LEARN_TEST === 'true') {
          console.log('[useYearLearn] loadYearlyData: No valid conversation consolidation hash found');
        }
        debugLog('No valid conversation consolidation hash found - starting with empty array');
      }

      setState(prev => ({
        ...prev,
        isLoadingData: false,
        statusMessage: `Loaded ${yearlyDreamConsolidations.length} dream consolidations and ${yearlyConversationConsolidations.length} conversation consolidations`
      }));

      if (process.env.NEXT_PUBLIC_YEAR_LEARN_TEST === 'true') {
        console.log('[useYearLearn] loadYearlyData: About to return success with data');
        console.log('[useYearLearn] loadYearlyData: Final dream consolidations count:', yearlyDreamConsolidations.length);
        console.log('[useYearLearn] loadYearlyData: Final conversation consolidations count:', yearlyConversationConsolidations.length);
      }

      debugLog('Yearly data loading completed from monthly hashes', {
        dreamConsolidationsCount: yearlyDreamConsolidations.length,
        conversationConsolidationsCount: yearlyConversationConsolidations.length,
        dreamHash: lastDreamMonthlyHash,
        convHash: lastConvMonthlyHash
      });

      return { success: true, yearlyDreamConsolidations, yearlyConversationConsolidations };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (process.env.NEXT_PUBLIC_YEAR_LEARN_TEST === 'true') {
        console.log('[useYearLearn] loadYearlyData: CATCH ERROR:', errorMessage);
      }
      debugLog('Error loading yearly data', { error: errorMessage });
      
      setState(prev => ({
        ...prev,
        isLoadingData: false,
        error: errorMessage,
        statusMessage: 'Failed to load yearly data'
      }));

      return { success: false };
    }
  }, [isConnected, operationalTokenId, lastDreamMonthlyHash, lastConvMonthlyHash, downloadFile, debugLog]);

  /**
   * Generate AI consolidation for yearly memory core (like month-learn generates consolidation)
   */
  const generateYearlyConsolidation = useCallback(async (dreamConsolidations?: MonthlyDreamConsolidation[], conversationConsolidations?: MonthlyConversationConsolidation[]) => {
    // Use passed parameters (like month-learn pattern)
    const currentDreamConsolidations = dreamConsolidations || [];
    const currentConversationConsolidations = conversationConsolidations || [];

    if (process.env.NEXT_PUBLIC_YEAR_LEARN_TEST === 'true') {
      console.log('[useYearLearn] generateYearlyConsolidation: FUNCTION CALLED!');
      console.log('[useYearLearn] generateYearlyConsolidation: Dream consolidations count:', currentDreamConsolidations.length);
      console.log('[useYearLearn] generateYearlyConsolidation: Conversation consolidations count:', currentConversationConsolidations.length);
      console.log('[useYearLearn] generateYearlyConsolidation: Dreams passed as param:', !!dreamConsolidations);
      console.log('[useYearLearn] generateYearlyConsolidation: Conversations passed as param:', !!conversationConsolidations);
    }

    if (currentDreamConsolidations.length === 0 && currentConversationConsolidations.length === 0) {
      if (process.env.NEXT_PUBLIC_YEAR_LEARN_TEST === 'true') {
        console.log('[useYearLearn] generateYearlyConsolidation: NO DATA - returning null');
      }
      setState(prev => ({
        ...prev,
        error: 'No yearly consolidation data available for memory core creation'
      }));
      return null;
    }

    if (!address) {
      if (process.env.NEXT_PUBLIC_YEAR_LEARN_TEST === 'true') {
        console.log('[useYearLearn] generateYearlyConsolidation: NO ADDRESS - returning null');
      }
      setState(prev => ({
        ...prev,
        error: 'Wallet not connected'
      }));
      return null;
    }

    if (process.env.NEXT_PUBLIC_YEAR_LEARN_TEST === 'true') {
      console.log('[useYearLearn] generateYearlyConsolidation: Starting AI memory core generation');
    }

    setState(prev => ({
      ...prev,
      isGeneratingConsolidation: true,
      error: null,
      statusMessage: `>> ${agentData?.agentName || 'Agent'} evolving consciousness matrix...`
    }));

    try {
      debugLog('Starting AI memory core generation');

      // Use test mode dates or current date based on environment (like month-learn)
      let currentYear: number;
      
      if (process.env.NEXT_PUBLIC_YEAR_LEARN_TEST === 'true') {
        // Test mode: use fixed past year to avoid validation issues
        currentYear = 2024;
        debugLog('Using test mode year for memory core', { year: currentYear });
      } else {
        // Production mode: use actual current date
        const now = new Date();
        currentYear = now.getFullYear();
        debugLog('Using current year for memory core', { year: currentYear });
      }

      // Build prompt using the dedicated prompt builder - SAME AS MONTH-LEARN WORKFLOW
      const promptData: YearLearnPromptData = {
        dreamConsolidations: currentDreamConsolidations,
        conversationConsolidations: currentConversationConsolidations,
        year: currentYear,
        agentPersonality: personalityTraits
      };

      debugLog('Prompt data prepared', { 
        dreamConsolidationsCount: promptData.dreamConsolidations.length,
        conversationConsolidationsCount: promptData.conversationConsolidations.length,
        year: promptData.year,
        hasPersonality: !!personalityTraits,
        personalityDetails: personalityTraits
      });

      // Validate data completeness before sending to AI
      const validation = validateYearlyDataCompleteness(promptData, debugLog);
      
      if (!validation.isValid) {
        const errorMessage = `Insufficient yearly data: ${validation.warnings.join(', ')}`;
        setState(prev => ({
          ...prev,
          isGeneratingConsolidation: false,
          error: errorMessage,
          statusMessage: ''
        }));
        debugLog('Yearly data validation failed', { validation });
        return null;
      }

      if (validation.warnings.length > 0) {
        debugLog('Yearly data validation warnings', { warnings: validation.warnings, recommendations: validation.recommendations });
      }

      // Generate data summary for logging
      const dataSummary = generateYearlyDataSummary(promptData);
      debugLog('Yearly data summary generated', dataSummary);

      // Use service layer to send consolidation request - SAME AS MONTH-LEARN WORKFLOW
      debugLog('Sending yearly consolidation request via service layer');
      const memoryCore = await sendYearlyConsolidation(promptData, address, debugLog);
      
      if (!memoryCore) {
        throw new Error('No memory core returned from AI service');
      }

      setState(prev => ({
        ...prev,
        isGeneratingConsolidation: false,
        statusMessage: 'AI memory core generation completed'
      }));

      debugLog('AI memory core generation completed successfully', {
        year: memoryCore.year,
        evolutionStage: memoryCore.yearly_overview.agent_evolution_stage,
        consciousnessLevel: memoryCore.final_metrics.consciousness_level
      });
      
      // Return the generated memory core directly (like month-learn/chat/dream workflows)
      return memoryCore;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setState(prev => ({
        ...prev,
        isGeneratingConsolidation: false,
        error: errorMessage,
        statusMessage: ''
      }));
      debugLog('AI memory core generation failed', { 
        error: errorMessage,
        fullError: error,
        stack: error instanceof Error ? error.stack : undefined
      });
      return null;
    }
  }, [address, personalityTraits, debugLog]); // REMOVED state dependencies

  /**
   * Save memory core to storage and update contract (like month-learn saves consolidation)
   */
  const saveMemoryCore = useCallback(async (memoryCore: YearlyMemoryCore) => {
    if (!memoryCore) {
      setState(prev => ({
        ...prev,
        error: 'No memory core data to save'
      }));
      return false;
    }

    setState(prev => ({
      ...prev,
      isSavingToStorage: true,
      error: null,
      statusMessage: `>> ${agentData?.agentName || 'Agent'} crystallizing consciousness matrix...`
    }));

    try {
      debugLog('Starting memory core save process');

      // Use test mode dates or current date based on environment (like month-learn)
      let currentYear: number;
      
      if (process.env.NEXT_PUBLIC_YEAR_LEARN_TEST === 'true') {
        // Test mode: use fixed past year to avoid "still current year" contract error
        currentYear = 2024;
        debugLog('Using test mode year for storage', { year: currentYear });
      } else {
        // Production mode: use actual current date
        const now = new Date();
        currentYear = now.getFullYear();
        debugLog('Using current year for storage', { year: currentYear });
      }
      
      const emptyHash = '0x0000000000000000000000000000000000000000000000000000000000000000';

      // Download existing memory cores using hash from contract (like month-learn)
      let existingMemoryCores: any[] = [];
      // memoryCoreHash already extracted at hook level
      
      if (memoryCoreHash && memoryCoreHash !== emptyHash) {
        try {
          debugLog('Downloading existing memory cores', { hash: memoryCoreHash });
          const downloadResult = await downloadFile(memoryCoreHash);
          
          if (downloadResult.success && downloadResult.data) {
            const textDecoder = new TextDecoder('utf-8');
            const dataString = textDecoder.decode(downloadResult.data);
            const existingData = JSON.parse(dataString);
            existingMemoryCores = Array.isArray(existingData) ? existingData : [existingData];
            debugLog('Existing memory cores loaded', { count: existingMemoryCores.length });
          }
        } catch (error) {
          debugLog('No existing memory cores found - creating new file', { error });
        }
      } else {
        debugLog('No existing memory core hash - creating new file');
      }

      // Add new memory core to the list (newest first) - using passed data (like month-learn)
      existingMemoryCores.unshift(memoryCore);

      // Create File object for upload
      const memoryCoreFileContent = JSON.stringify(existingMemoryCores, null, 2);
      const memoryCoreBlob = new Blob([memoryCoreFileContent], { type: 'application/json' });
      const memoryCoreFile = new File([memoryCoreBlob], `memory_core_${currentYear}.json`, {
        type: 'application/json'
      });

      // Upload updated memory cores
      const uploadResult = await uploadFile(memoryCoreFile);
      if (!uploadResult.success || !uploadResult.rootHash) {
        throw new Error(`Memory core upload failed: ${uploadResult.error}`);
      }
      const memoryCoreStorageHash = uploadResult.rootHash;
      
      debugLog('Memory core saved to storage', { hash: memoryCoreStorageHash });

      setState(prev => ({
        ...prev,
        isSavingToStorage: false,
        isUpdatingContract: true,
        statusMessage: `>> ${agentData?.agentName || 'Agent'} embedding neural pathways...`
      }));

      // Update smart contract with new memory core hash
      const txHash = await updateMemoryCore(memoryCoreStorageHash);

      setState(prev => ({
        ...prev,
        isUpdatingContract: false,
        isCompleted: true,
        statusMessage: 'Year-learn memory core consolidation completed successfully!'
      }));

      debugLog('Memory core save process completed', { 
        memoryCoreHash: memoryCoreStorageHash,
        txHash 
      });

      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setState(prev => ({
        ...prev,
        isSavingToStorage: false,
        isUpdatingContract: false,
        error: errorMessage,
        statusMessage: ''
      }));
      debugLog('Memory core save process failed', { error: errorMessage });
      return false;
    }
  }, [memoryCoreHash, downloadFile, uploadFile, debugLog]);

  /**
   * Update smart contract with memory core hash using updateMemoryCore function
   */
  const updateMemoryCore = async (memoryCoreHash: string): Promise<string> => {
    debugLog('Updating contract with memory core hash', { memoryCoreHash });

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

    // Call updateMemoryCore function
    const tx = await contract.updateMemoryCore(
      operationalTokenId,
      memoryCoreHash
    );

    await tx.wait();

    debugLog('Contract updated successfully with memory core', { txHash: tx.hash });
    return tx.hash;
  };

  /**
   * Execute complete year-learn workflow
   */
  const executeYearLearn = useCallback(async () => {
    if (process.env.NEXT_PUBLIC_YEAR_LEARN_TEST === 'true') {
      console.log('[useYearLearn] executeYearLearn: Starting complete year-learn workflow');
      console.log('[useYearLearn] executeYearLearn: operationalTokenId:', operationalTokenId);
      console.log('[useYearLearn] executeYearLearn: agentData available:', !!agentData);
    }
    debugLog('Starting complete year-learn workflow');

    // Early return if no token ID available yet
    if (!operationalTokenId) {
      if (process.env.NEXT_PUBLIC_YEAR_LEARN_TEST === 'true') {
        console.log('[useYearLearn] executeYearLearn: No operationalTokenId yet, returning early');
      }
      debugLog('No operational token ID available yet');
      return false;
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      isCompleted: false
    }));

    try {
      // Step 1: Load yearly data (direct call to avoid circular dependency)
      if (process.env.NEXT_PUBLIC_YEAR_LEARN_TEST === 'true') {
        console.log('[useYearLearn] executeYearLearn: About to call loadYearlyData()');
      }
      const { success, yearlyDreamConsolidations, yearlyConversationConsolidations } = await loadYearlyData();
      if (process.env.NEXT_PUBLIC_YEAR_LEARN_TEST === 'true') {
        console.log('[useYearLearn] executeYearLearn: loadYearlyData returned:', success);
      }
      if (!success) {
        throw new Error('Failed to load yearly data');
      }

      // Step 2: Generate AI memory core (direct call to avoid circular dependency)
      if (process.env.NEXT_PUBLIC_YEAR_LEARN_TEST === 'true') {
        console.log('[useYearLearn] executeYearLearn: About to call generateYearlyConsolidation()');
        console.log('[useYearLearn] executeYearLearn: Dream consolidations count:', yearlyDreamConsolidations?.length);
        console.log('[useYearLearn] executeYearLearn: Conversation consolidations count:', yearlyConversationConsolidations?.length);
      }
      const memoryCore = await generateYearlyConsolidation(yearlyDreamConsolidations, yearlyConversationConsolidations);
      if (process.env.NEXT_PUBLIC_YEAR_LEARN_TEST === 'true') {
        console.log('[useYearLearn] executeYearLearn: generateYearlyConsolidation returned:', !!memoryCore);
      }
      if (!memoryCore) {
        throw new Error('Failed to generate AI memory core');
      }

      // Step 3: Save memory core (direct call to avoid circular dependency)
      if (process.env.NEXT_PUBLIC_YEAR_LEARN_TEST === 'true') {
        console.log('[useYearLearn] executeYearLearn: About to call saveMemoryCore()');
      }
      const memoryCoresSaved = await saveMemoryCore(memoryCore);
      if (process.env.NEXT_PUBLIC_YEAR_LEARN_TEST === 'true') {
        console.log('[useYearLearn] executeYearLearn: saveMemoryCore returned:', memoryCoresSaved);
      }
      if (!memoryCoresSaved) {
        throw new Error('Failed to save memory core');
      }

      setState(prev => ({
        ...prev,
        isLoading: false
      }));

      if (process.env.NEXT_PUBLIC_YEAR_LEARN_TEST === 'true') {
        console.log('[useYearLearn] executeYearLearn: Year-learn workflow completed successfully');
      }
      debugLog('Year-learn workflow completed successfully');
      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (process.env.NEXT_PUBLIC_YEAR_LEARN_TEST === 'true') {
        console.log('[useYearLearn] executeYearLearn: CAUGHT ERROR!');
        console.log('[useYearLearn] executeYearLearn: Error message:', errorMessage);
        console.log('[useYearLearn] executeYearLearn: Full error:', error);
        if (error instanceof Error && error.stack) {
          console.log('[useYearLearn] executeYearLearn: Stack trace:', error.stack);
        }
      }
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      
      debugLog('Year-learn workflow failed', { error: errorMessage });
      return false;
    }
  }, [operationalTokenId, agentData, loadYearlyData, generateYearlyConsolidation, saveMemoryCore, debugLog]);

  /**
   * Reset year-learn state
   */
  const reset = useCallback(() => {
    setState({
      isLoading: false,
      isLoadingData: false,
      isGeneratingConsolidation: false,
      isSavingToStorage: false,
      isUpdatingContract: false,
      error: null,
      statusMessage: '',
      isCompleted: false,
      hasWaitedForData: false
    });
    debugLog('Year-learn state reset');
  }, [debugLog]);

  // Check if we have valid agent data - conditional logic AFTER all hooks
  const hasValidAgentData = operationalTokenId && agentData?.memory;
  
  // Only show error after timeout AND if data is still not available
  const shouldShowDataError = !hasValidAgentData && state.hasWaitedForData;
  
  return {
    // State
    ...state,
    error: shouldShowDataError ? 'Agent data not available' : state.error,
    
    // Actions - conditional functions if no valid data
    loadYearlyData: !hasValidAgentData ? async () => ({ success: false }) : loadYearlyData,
    generateYearlyConsolidation: !hasValidAgentData ? async () => null : generateYearlyConsolidation,
    saveMemoryCore: !hasValidAgentData ? async () => false : saveMemoryCore,
    executeYearLearn: !hasValidAgentData ? async () => false : executeYearLearn,
    reset,
    
    // Computed
    isProcessing: hasValidAgentData && (state.isLoading || state.isLoadingData || state.isGeneratingConsolidation || state.isSavingToStorage || state.isUpdatingContract)
  };
}