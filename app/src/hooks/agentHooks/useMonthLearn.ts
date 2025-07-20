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
  MonthLearnAPIResponse,
  MonthlyDreamConsolidation,
  MonthlyConversationConsolidation
} from './services/monthLearnService';
import { 
  MonthLearnPromptData, 
  buildMonthLearnConsolidationPrompt 
} from '../../prompts/monthLearnConsolidationPrompt';
import { parseMonthLearnResponse } from '../../prompts/monthLearnResponseParser';

// Interface for monthly consolidation state
interface MonthLearnState {
  isLoading: boolean;
  isLoadingData: boolean;
  isGeneratingConsolidation: boolean;
  isSavingToStorage: boolean;
  isUpdatingContract: boolean;
  error: string | null;
  statusMessage: string;
  
  // Data
  monthlyDreams: any[];
  monthlyConversations: any[];
  dreamConsolidation: any | null;
  conversationConsolidation: any | null;
  
  // Results
  dreamStorageHash: string | null;
  conversationStorageHash: string | null;
  contractTxHash: string | null;
  isCompleted: boolean;
  
  // Timeout handling
  hasWaitedForData: boolean;
}

export function useMonthLearn(tokenId?: number) {
  // ALL HOOKS MUST BE CALLED FIRST - NO EARLY RETURNS BEFORE HOOKS!
  const [state, setState] = useState<MonthLearnState>({
    isLoading: false,
    isLoadingData: false,
    isGeneratingConsolidation: false,
    isSavingToStorage: false,
    isUpdatingContract: false,
    error: null,
    statusMessage: '',
    monthlyDreams: [],
    monthlyConversations: [],
    dreamConsolidation: null,
    conversationConsolidation: null,
    dreamStorageHash: null,
    conversationStorageHash: null,
    contractTxHash: null,
    isCompleted: false,
    hasWaitedForData: false
  });

  const { downloadFile } = useStorageDownload();
  const { uploadFile } = useStorageUpload();
  const { isConnected, address } = useWallet();
  const { agentData, effectiveTokenId, personalityTraits } = useAgentRead();

  // Get operational token ID
  const operationalTokenId = tokenId || effectiveTokenId;

  // Extract stable hash values to prevent re-renders
  const currentDreamHash = agentData?.memory?.currentDreamDailyHash;
  const currentConvHash = agentData?.memory?.currentConvDailyHash;
  const lastDreamMonthlyHash = agentData?.memory?.lastDreamMonthlyHash;
  const lastConvMonthlyHash = agentData?.memory?.lastConvMonthlyHash;

  // Debug logging
  const debugLog = useCallback((message: string, data?: any) => {
    if (process.env.NEXT_PUBLIC_CONSOLIDATION_TEST === 'true') {
      console.log(`[useMonthLearn] ${message}`, data || '');
    }
  }, []);

  // Debug log initialization ONLY ONCE to prevent infinite re-renders
  useEffect(() => {
    debugLog('useMonthLearn hook initialized', { tokenId: operationalTokenId });
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

  /**
   * Load monthly dreams and conversations data from 0G storage
   */
  const loadMonthlyData = useCallback(async (): Promise<{ success: boolean; monthlyDreams?: any[]; monthlyConversations?: any[] }> => {
    if (process.env.NEXT_PUBLIC_CONSOLIDATION_TEST === 'true') {
      console.log('[useMonthLearn] loadMonthlyData: FUNCTION CALLED!');
      console.log('[useMonthLearn] loadMonthlyData: isConnected:', isConnected);
      console.log('[useMonthLearn] loadMonthlyData: operationalTokenId:', operationalTokenId);
      console.log('[useMonthLearn] loadMonthlyData: currentDreamHash:', currentDreamHash);
      console.log('[useMonthLearn] loadMonthlyData: currentConvHash:', currentConvHash);
    }
    debugLog('Starting monthly data loading');

    if (!isConnected || !operationalTokenId) {
      if (process.env.NEXT_PUBLIC_CONSOLIDATION_TEST === 'true') {
        console.log('[useMonthLearn] loadMonthlyData: NOT CONNECTED OR NO TOKEN ID - returning false');
      }
      debugLog('Not connected or no token ID');
      return { success: false };
    }

    setState(prev => ({
      ...prev,
      isLoadingData: true,
      statusMessage: 'Loading monthly data from storage...'
    }));

    try {
      let monthlyDreams: any[] = [];
      let monthlyConversations: any[] = [];
      const emptyHash = '0x0000000000000000000000000000000000000000000000000000000000000000';

      // Download dreams data using root hash from contract
      // currentDreamHash already extracted at hook level
      if (currentDreamHash && currentDreamHash !== emptyHash) {
        try {
          if (process.env.NEXT_PUBLIC_CONSOLIDATION_TEST === 'true') {
            console.log('[useMonthLearn] loadMonthlyData: About to download dreams from hash:', currentDreamHash);
          }
          debugLog('Downloading dreams from hash', { hash: currentDreamHash });
          const dreamDownloadResult = await downloadFile(currentDreamHash);
          
          if (process.env.NEXT_PUBLIC_CONSOLIDATION_TEST === 'true') {
            console.log('[useMonthLearn] loadMonthlyData: Dream download result:', dreamDownloadResult);
          }
          
          if (dreamDownloadResult.success && dreamDownloadResult.data) {
            const textDecoder = new TextDecoder('utf-8');
            const dreamDataString = textDecoder.decode(dreamDownloadResult.data);
            const dreamData = JSON.parse(dreamDataString);
            
            monthlyDreams = Array.isArray(dreamData) ? dreamData : [dreamData];
            if (process.env.NEXT_PUBLIC_CONSOLIDATION_TEST === 'true') {
              console.log('[useMonthLearn] loadMonthlyData: Dreams parsed successfully, count:', monthlyDreams.length);
            }
            debugLog('Monthly dreams loaded from hash', { count: monthlyDreams.length });
          }
        } catch (dreamError) {
          if (process.env.NEXT_PUBLIC_CONSOLIDATION_TEST === 'true') {
            console.log('[useMonthLearn] loadMonthlyData: ERROR loading dreams:', dreamError);
          }
          debugLog('Error loading dreams from hash', { error: dreamError });
        }
      } else {
        if (process.env.NEXT_PUBLIC_CONSOLIDATION_TEST === 'true') {
          console.log('[useMonthLearn] loadMonthlyData: No valid dream hash found');
        }
        debugLog('No valid dream hash found - starting with empty array');
      }

      // Download conversations data using root hash from contract
      // currentConvHash already extracted at hook level
      if (currentConvHash && currentConvHash !== emptyHash) {
        try {
          if (process.env.NEXT_PUBLIC_CONSOLIDATION_TEST === 'true') {
            console.log('[useMonthLearn] loadMonthlyData: About to download conversations from hash:', currentConvHash);
          }
          debugLog('Downloading conversations from hash', { hash: currentConvHash });
          const convDownloadResult = await downloadFile(currentConvHash);
          
          if (process.env.NEXT_PUBLIC_CONSOLIDATION_TEST === 'true') {
            console.log('[useMonthLearn] loadMonthlyData: Conversation download result:', convDownloadResult);
          }
          
          if (convDownloadResult.success && convDownloadResult.data) {
            const textDecoder = new TextDecoder('utf-8');
            const convDataString = textDecoder.decode(convDownloadResult.data);
            const convData = JSON.parse(convDataString);
            
            monthlyConversations = Array.isArray(convData) ? convData : [convData];
            if (process.env.NEXT_PUBLIC_CONSOLIDATION_TEST === 'true') {
              console.log('[useMonthLearn] loadMonthlyData: Conversations parsed successfully, count:', monthlyConversations.length);
            }
            debugLog('Monthly conversations loaded from hash', { count: monthlyConversations.length });
          }
        } catch (convError) {
          if (process.env.NEXT_PUBLIC_CONSOLIDATION_TEST === 'true') {
            console.log('[useMonthLearn] loadMonthlyData: ERROR loading conversations:', convError);
          }
          debugLog('Error loading conversations from hash', { error: convError });
        }
      } else {
        if (process.env.NEXT_PUBLIC_CONSOLIDATION_TEST === 'true') {
          console.log('[useMonthLearn] loadMonthlyData: No valid conversation hash found');
        }
        debugLog('No valid conversation hash found - starting with empty array');
      }

      setState(prev => ({
        ...prev,
        isLoadingData: false,
        monthlyDreams,
        monthlyConversations,
        statusMessage: `Loaded ${monthlyDreams.length} dreams and ${monthlyConversations.length} conversations from storage`
      }));

      if (process.env.NEXT_PUBLIC_CONSOLIDATION_TEST === 'true') {
        console.log('[useMonthLearn] loadMonthlyData: About to return success with data');
        console.log('[useMonthLearn] loadMonthlyData: Final dreams count:', monthlyDreams.length);
        console.log('[useMonthLearn] loadMonthlyData: Final conversations count:', monthlyConversations.length);
      }

      debugLog('Monthly data loading completed from root hashes', {
        dreamsCount: monthlyDreams.length,
        conversationsCount: monthlyConversations.length,
        dreamHash: currentDreamHash,
        convHash: currentConvHash
      });

      return { success: true, monthlyDreams, monthlyConversations };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (process.env.NEXT_PUBLIC_CONSOLIDATION_TEST === 'true') {
        console.log('[useMonthLearn] loadMonthlyData: CATCH ERROR:', errorMessage);
      }
      debugLog('Error loading monthly data', { error: errorMessage });
      
      setState(prev => ({
        ...prev,
        isLoadingData: false,
        error: errorMessage,
        statusMessage: 'Failed to load monthly data'
      }));

      return { success: false };
    }
  }, [isConnected, operationalTokenId, currentDreamHash, currentConvHash, downloadFile, debugLog]);

  /**
   * Generate AI consolidation for dreams and conversations
   */
  const generateConsolidation = useCallback(async (dreams?: any[], conversations?: any[]) => {
    // Use passed parameters or current state
    const currentDreams = dreams || state.monthlyDreams;
    const currentConversations = conversations || state.monthlyConversations;

    if (process.env.NEXT_PUBLIC_CONSOLIDATION_TEST === 'true') {
      console.log('[useMonthLearn] generateConsolidation: FUNCTION CALLED!');
      console.log('[useMonthLearn] generateConsolidation: Dreams count:', currentDreams.length);
      console.log('[useMonthLearn] generateConsolidation: Conversations count:', currentConversations.length);
      console.log('[useMonthLearn] generateConsolidation: Dreams passed as param:', !!dreams);
      console.log('[useMonthLearn] generateConsolidation: Conversations passed as param:', !!conversations);
    }

    if (currentDreams.length === 0 && currentConversations.length === 0) {
      if (process.env.NEXT_PUBLIC_CONSOLIDATION_TEST === 'true') {
        console.log('[useMonthLearn] generateConsolidation: NO DATA - returning false');
      }
      setState(prev => ({
        ...prev,
        error: 'No monthly data available for consolidation'
      }));
      return null;
    }

    if (!address) {
      if (process.env.NEXT_PUBLIC_CONSOLIDATION_TEST === 'true') {
        console.log('[useMonthLearn] generateConsolidation: NO ADDRESS - returning false');
      }
      setState(prev => ({
        ...prev,
        error: 'Wallet not connected'
      }));
      return null;
    }

    if (process.env.NEXT_PUBLIC_CONSOLIDATION_TEST === 'true') {
      console.log('[useMonthLearn] generateConsolidation: Starting AI consolidation generation');
    }

    setState(prev => ({
      ...prev,
      isGeneratingConsolidation: true,
      error: null,
      statusMessage: 'Generating AI consolidation...'
    }));

    try {
      debugLog('Starting AI consolidation generation');

      // Use test mode dates or current date based on environment
      let currentYear: number;
      let currentMonth: number;
      
      if (process.env.NEXT_PUBLIC_CONSOLIDATION_TEST === 'true') {
        // Test mode: use fixed past month to avoid "still current month" contract error
        currentYear = 2024;
        currentMonth = 1; // January 2024
        debugLog('Using test mode dates', { year: currentYear, month: currentMonth });
      } else {
        // Production mode: use actual current date
        const now = new Date();
        currentYear = now.getFullYear();
        currentMonth = now.getMonth() + 1;
        debugLog('Using current date', { year: currentYear, month: currentMonth });
      }

      // Build unified prompt using the new prompt builder - SAME AS DREAM WORKFLOW
      const promptData: MonthLearnPromptData = {
        dreams: currentDreams,
        conversations: currentConversations,
        month: currentMonth,
        year: currentYear,
        agentPersonality: personalityTraits
      };

      debugLog('Prompt data prepared', { 
        dreamsCount: promptData.dreams.length,
        conversationsCount: promptData.conversations.length,
        month: promptData.month,
        year: promptData.year,
        hasPersonality: !!personalityTraits,
        personalityDetails: personalityTraits
      });

      const prompt = buildMonthLearnConsolidationPrompt(promptData);
      
      debugLog('Prompt built successfully', { 
        promptLength: prompt.length,
        dreamsCount: promptData.dreams.length,
        conversationsCount: promptData.conversations.length,
        hasPersonality: !!personalityTraits
      });

      // Send single request to AI - SAME AS DREAM/CHAT WORKFLOW
      debugLog('Sending to AI', { promptLength: prompt.length });
      
      const apiUrl = process.env.NEXT_PUBLIC_COMPUTE_API_URL || 'http://localhost:3001/api';
      
      const response = await fetch(`${apiUrl}/analyze-dream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: address,
          query: prompt
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const apiResult = await response.json();
      
      if (!apiResult.success) {
        throw new Error(apiResult.error || 'AI consolidation failed');
      }

      const aiResponse = apiResult.data.response;
      
      debugLog('AI response received', {
        model: apiResult.data.model,
        cost: apiResult.data.cost,
        responseTime: apiResult.data.responseTime,
        responseLength: aiResponse.length
      });

      // Parse the unified response - SAME AS DREAM WORKFLOW
      const parseResult = parseMonthLearnResponse(aiResponse);
      
      if (!parseResult.success) {
        throw new Error(`Failed to parse AI response: ${parseResult.error}`);
      }

      debugLog('Response parsed successfully', {
        hasDreamConsolidation: !!parseResult.dreamConsolidation,
        hasConversationConsolidation: !!parseResult.conversationConsolidation
      });

      setState(prev => ({
        ...prev,
        isGeneratingConsolidation: false,
        dreamConsolidation: parseResult.dreamConsolidation,
        conversationConsolidation: parseResult.conversationConsolidation,
        statusMessage: 'AI consolidation completed'
      }));

      debugLog('AI consolidation generation completed successfully');
      
      // Return the generated consolidation data directly (like dream/chat workflows)
      return {
        dreamConsolidation: parseResult.dreamConsolidation,
        conversationConsolidation: parseResult.conversationConsolidation
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setState(prev => ({
        ...prev,
        isGeneratingConsolidation: false,
        error: errorMessage,
        statusMessage: ''
      }));
      debugLog('AI consolidation generation failed', { 
        error: errorMessage,
        fullError: error,
        stack: error instanceof Error ? error.stack : undefined
      });
      return null;
    }
  }, [address, personalityTraits, debugLog]); // REMOVED state.monthlyDreams, state.monthlyConversations

  /**
   * Save consolidation to storage and update contract - now accepts data directly
   */
  const saveConsolidation = useCallback(async (dreamConsolidation: any, conversationConsolidation: any) => {
    if (!dreamConsolidation && !conversationConsolidation) {
      setState(prev => ({
        ...prev,
        error: 'No consolidation data to save'
      }));
      return false;
    }

    if (!lastDreamMonthlyHash && !lastConvMonthlyHash) {
      setState(prev => ({
        ...prev,
        error: 'No existing monthly consolidation hashes available'
      }));
      return false;
    }

    setState(prev => ({
      ...prev,
      isSavingToStorage: true,
      error: null,
      statusMessage: 'Saving consolidation to storage...'
    }));

    try {
      debugLog('Starting consolidation save process');

      // Use test mode dates or current date based on environment
      let currentYear: number;
      let currentMonth: number;
      
      if (process.env.NEXT_PUBLIC_CONSOLIDATION_TEST === 'true') {
        // Test mode: use fixed past month to avoid "still current month" contract error
        currentYear = 2024;
        currentMonth = 1; // January 2024
        debugLog('Using test mode dates for storage', { year: currentYear, month: currentMonth });
      } else {
        // Production mode: use actual current date
        const now = new Date();
        currentYear = now.getFullYear();
        currentMonth = now.getMonth() + 1;
        debugLog('Using current date for storage', { year: currentYear, month: currentMonth });
      }
      
      const emptyHash = '0x0000000000000000000000000000000000000000000000000000000000000000';

      let dreamStorageHash: string | null = null;
      let conversationStorageHash: string | null = null;

      // Save dream consolidation (using passed data instead of state)
      if (dreamConsolidation) {
        setState(prev => ({ ...prev, statusMessage: 'Processing dream consolidation...' }));
        
        // Download existing monthly dream consolidations using root hash
        let existingDreamConsolidations: any[] = [];
        // lastDreamMonthlyHash already extracted at hook level
        
        if (lastDreamMonthlyHash && lastDreamMonthlyHash !== emptyHash) {
          try {
            debugLog('Downloading existing dream consolidations', { hash: lastDreamMonthlyHash });
            const downloadResult = await downloadFile(lastDreamMonthlyHash);
            
            if (downloadResult.success && downloadResult.data) {
              const textDecoder = new TextDecoder('utf-8');
              const dataString = textDecoder.decode(downloadResult.data);
              const existingData = JSON.parse(dataString);
              existingDreamConsolidations = Array.isArray(existingData) ? existingData : [existingData];
              debugLog('Existing dream consolidations loaded', { count: existingDreamConsolidations.length });
            }
          } catch (error) {
            debugLog('No existing dream consolidations found - creating new file', { error });
          }
        } else {
          debugLog('No existing dream consolidations hash - creating new file');
        }

        // Add new consolidation to the list (newest first) - using passed data
        existingDreamConsolidations.unshift(dreamConsolidation);

        // Create File object for upload
        const dreamFileContent = JSON.stringify(existingDreamConsolidations, null, 2);
        const dreamBlob = new Blob([dreamFileContent], { type: 'application/json' });
        const dreamFile = new File([dreamBlob], `dream_essence_monthly_${currentYear}-${currentMonth.toString().padStart(2, '0')}.json`, {
          type: 'application/json'
        });

        // Upload updated consolidations
        const dreamUploadResult = await uploadFile(dreamFile);
        if (!dreamUploadResult.success || !dreamUploadResult.rootHash) {
          throw new Error(`Dream consolidation upload failed: ${dreamUploadResult.error}`);
        }
        dreamStorageHash = dreamUploadResult.rootHash;
        
        debugLog('Dream consolidation saved to storage', { hash: dreamStorageHash });
      }

      // Save conversation consolidation (using passed data instead of state)
      if (conversationConsolidation) {
        setState(prev => ({ ...prev, statusMessage: 'Processing conversation consolidation...' }));
        
        // Download existing monthly conversation consolidations using root hash
        let existingConversationConsolidations: any[] = [];
        // lastConvMonthlyHash already extracted at hook level
        
        if (lastConvMonthlyHash && lastConvMonthlyHash !== emptyHash) {
          try {
            debugLog('Downloading existing conversation consolidations', { hash: lastConvMonthlyHash });
            const downloadResult = await downloadFile(lastConvMonthlyHash);
            
            if (downloadResult.success && downloadResult.data) {
              const textDecoder = new TextDecoder('utf-8');
              const dataString = textDecoder.decode(downloadResult.data);
              const existingData = JSON.parse(dataString);
              existingConversationConsolidations = Array.isArray(existingData) ? existingData : [existingData];
              debugLog('Existing conversation consolidations loaded', { count: existingConversationConsolidations.length });
            }
          } catch (error) {
            debugLog('No existing conversation consolidations found - creating new file', { error });
          }
        } else {
          debugLog('No existing conversation consolidations hash - creating new file');
        }

        // Add new consolidation to the list (newest first) - using passed data
        existingConversationConsolidations.unshift(conversationConsolidation);

        // Create File object for upload
        const convFileContent = JSON.stringify(existingConversationConsolidations, null, 2);
        const convBlob = new Blob([convFileContent], { type: 'application/json' });
        const convFile = new File([convBlob], `conversation_essence_monthly_${currentYear}-${currentMonth.toString().padStart(2, '0')}.json`, {
          type: 'application/json'
        });

        // Upload updated consolidations
        const convUploadResult = await uploadFile(convFile);
        if (!convUploadResult.success || !convUploadResult.rootHash) {
          throw new Error(`Conversation consolidation upload failed: ${convUploadResult.error}`);
        }
        conversationStorageHash = convUploadResult.rootHash;
        
        debugLog('Conversation consolidation saved to storage', { hash: conversationStorageHash });
      }

      setState(prev => ({
        ...prev,
        isSavingToStorage: false,
        isUpdatingContract: true,
        dreamStorageHash,
        conversationStorageHash,
        statusMessage: 'Updating smart contract...'
      }));

      // Update smart contract with new hashes
      const txHash = await updateContract(dreamStorageHash, conversationStorageHash, currentMonth, currentYear);

      // Debug: Check if daily hashes were cleared after consolidation
      if (process.env.NEXT_PUBLIC_CONSOLIDATION_TEST === 'true') {
        try {
          const [provider] = await getProvider();
          const [signer] = await getSigner(provider!);
          const contractAddress = frontendContracts.galileo.DreamscapeAgent.address;
          const contractABI = frontendContracts.galileo.DreamscapeAgent.abi;
          const contract = new Contract(contractAddress, contractABI, signer);
          
          // Wait a bit for transaction to be mined
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const memoryAfterConsolidation = await contract.getAgentMemory(operationalTokenId);
          debugLog('Memory state after consolidation', {
            currentDreamDailyHash: memoryAfterConsolidation.currentDreamDailyHash,
            currentConvDailyHash: memoryAfterConsolidation.currentConvDailyHash,
            lastDreamMonthlyHash: memoryAfterConsolidation.lastDreamMonthlyHash,
            lastConvMonthlyHash: memoryAfterConsolidation.lastConvMonthlyHash,
            shouldBeEmpty: memoryAfterConsolidation.currentDreamDailyHash === '0x0000000000000000000000000000000000000000000000000000000000000000'
          });
        } catch (debugError) {
          debugLog('Debug check failed', { error: debugError });
        }
      }

      setState(prev => ({
        ...prev,
        isUpdatingContract: false,
        contractTxHash: txHash,
        isCompleted: true,
        statusMessage: 'Month-learn consolidation completed successfully!'
      }));

      debugLog('Consolidation save process completed', { 
        dreamHash: dreamStorageHash,
        conversationHash: conversationStorageHash,
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
      debugLog('Consolidation save process failed', { error: errorMessage });
      return false;
    }
  }, [lastDreamMonthlyHash, lastConvMonthlyHash, downloadFile, uploadFile, debugLog]);

  /**
   * Update smart contract with consolidation hashes
   */
  const updateContract = async (dreamHash: string | null, conversationHash: string | null, month: number, year: number): Promise<string> => {
    debugLog('Updating contract with consolidation hashes', { dreamHash, conversationHash, month, year });

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

    // Call consolidateMonth function
    const tx = await contract.consolidateMonth(
      operationalTokenId,
      dreamHash || '0x0000000000000000000000000000000000000000000000000000000000000000',
      conversationHash || '0x0000000000000000000000000000000000000000000000000000000000000000',
      month,
      year
    );

    await tx.wait();

    debugLog('Contract updated successfully', { txHash: tx.hash });
    return tx.hash;
  };

  /**
   * Execute complete month-learn workflow
   */
  const executeMonthLearn = useCallback(async () => {
    if (process.env.NEXT_PUBLIC_CONSOLIDATION_TEST === 'true') {
      console.log('[useMonthLearn] executeMonthLearn: Starting complete month-learn workflow');
      console.log('[useMonthLearn] executeMonthLearn: operationalTokenId:', operationalTokenId);
      console.log('[useMonthLearn] executeMonthLearn: agentData available:', !!agentData);
    }
    debugLog('Starting complete month-learn workflow');

    // Early return if no token ID available yet
    if (!operationalTokenId) {
      if (process.env.NEXT_PUBLIC_CONSOLIDATION_TEST === 'true') {
        console.log('[useMonthLearn] executeMonthLearn: No operationalTokenId yet, returning early');
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
      // Step 1: Load monthly data (direct call to avoid circular dependency)
      if (process.env.NEXT_PUBLIC_CONSOLIDATION_TEST === 'true') {
        console.log('[useMonthLearn] executeMonthLearn: About to call loadMonthlyData()');
      }
      const { success, monthlyDreams, monthlyConversations } = await loadMonthlyData();
      if (process.env.NEXT_PUBLIC_CONSOLIDATION_TEST === 'true') {
        console.log('[useMonthLearn] executeMonthLearn: loadMonthlyData returned:', success);
      }
      if (!success) {
        throw new Error('Failed to load monthly data');
      }

      // Step 2: Generate AI consolidation (direct call to avoid circular dependency)
      if (process.env.NEXT_PUBLIC_CONSOLIDATION_TEST === 'true') {
        console.log('[useMonthLearn] executeMonthLearn: About to call generateConsolidation()');
        console.log('[useMonthLearn] executeMonthLearn: Current state dreams count:', monthlyDreams.length);
        console.log('[useMonthLearn] executeMonthLearn: Current state conversations count:', monthlyConversations.length);
      }
      const consolidationData = await generateConsolidation(monthlyDreams, monthlyConversations);
      if (process.env.NEXT_PUBLIC_CONSOLIDATION_TEST === 'true') {
        console.log('[useMonthLearn] executeMonthLearn: generateConsolidation returned:', consolidationData);
      }
      if (!consolidationData) {
        throw new Error('Failed to generate AI consolidation');
      }

      // Step 3: Save consolidation (direct call to avoid circular dependency)
      if (process.env.NEXT_PUBLIC_CONSOLIDATION_TEST === 'true') {
        console.log('[useMonthLearn] executeMonthLearn: About to call saveConsolidation()');
        console.log('[useMonthLearn] executeMonthLearn: Passing dreamConsolidation:', !!consolidationData.dreamConsolidation);
        console.log('[useMonthLearn] executeMonthLearn: Passing conversationConsolidation:', !!consolidationData.conversationConsolidation);
      }
      const consolidationSaved = await saveConsolidation(
        consolidationData.dreamConsolidation, 
        consolidationData.conversationConsolidation
      );
      if (process.env.NEXT_PUBLIC_CONSOLIDATION_TEST === 'true') {
        console.log('[useMonthLearn] executeMonthLearn: saveConsolidation returned:', consolidationSaved);
      }
      if (!consolidationSaved) {
        throw new Error('Failed to save consolidation');
      }

      setState(prev => ({
        ...prev,
        isLoading: false
      }));

      if (process.env.NEXT_PUBLIC_CONSOLIDATION_TEST === 'true') {
        console.log('[useMonthLearn] executeMonthLearn: Month-learn workflow completed successfully');
      }
      debugLog('Month-learn workflow completed successfully');
      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (process.env.NEXT_PUBLIC_CONSOLIDATION_TEST === 'true') {
        console.log('[useMonthLearn] executeMonthLearn: CAUGHT ERROR!');
        console.log('[useMonthLearn] executeMonthLearn: Error message:', errorMessage);
        console.log('[useMonthLearn] executeMonthLearn: Full error:', error);
        if (error instanceof Error && error.stack) {
          console.log('[useMonthLearn] executeMonthLearn: Stack trace:', error.stack);
        }
      }
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      
      debugLog('Month-learn workflow failed', { error: errorMessage });
      return false;
    }
  }, [operationalTokenId, agentData, loadMonthlyData, generateConsolidation, saveConsolidation, debugLog]);

  /**
   * Reset month-learn state
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
      monthlyDreams: [],
      monthlyConversations: [],
      dreamConsolidation: null,
      conversationConsolidation: null,
      dreamStorageHash: null,
      conversationStorageHash: null,
      contractTxHash: null,
      isCompleted: false,
      hasWaitedForData: false
    });
    debugLog('Month-learn state reset');
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
    loadMonthlyData: !hasValidAgentData ? async () => ({ success: false }) : loadMonthlyData,
    generateConsolidation: !hasValidAgentData ? async () => null : generateConsolidation,
    saveConsolidation: !hasValidAgentData ? async () => false : saveConsolidation,
    executeMonthLearn: !hasValidAgentData ? async () => false : executeMonthLearn,
    reset,
    
    // Computed
    hasData: hasValidAgentData && (state.monthlyDreams.length > 0 || state.monthlyConversations.length > 0),
    isProcessing: hasValidAgentData && (state.isLoading || state.isLoadingData || state.isGeneratingConsolidation || state.isSavingToStorage || state.isUpdatingContract)
  };
}