'use client';

import { useState } from 'react';
import { useStorageDownload } from '../storage/useStorageDownload';
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
}

export function useAgentDream() {
  const [dreamState, setDreamState] = useState<DreamState>({
    dreamText: '',
    isProcessing: false,
    error: null,
    isLoadingContext: false,
    contextStatus: '',
    builtContext: null
  });

  const { downloadFile } = useStorageDownload();
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
      builtContext: null
    });
    debugLog('Dream state reset');
  };

  /**
   * Builds dream analysis context
   */
  const buildDreamContext = async (tokenId: number): Promise<DreamContext | null> => {
    if (!isConnected) {
      const error = 'Wallet not connected';
      setDreamState(prev => ({ ...prev, error }));
      debugLog('Context building failed - wallet not connected');
      return null;
    }

    if (!dreamState.dreamText.trim()) {
      const error = 'Dream text is required';
      setDreamState(prev => ({ ...prev, error }));
      debugLog('Context building failed - no dream text');
      return null;
    }

    setDreamState(prev => ({ 
      ...prev, 
      isLoadingContext: true, 
      error: null,
      contextStatus: 'Initializing...' 
    }));

    try {
      debugLog('Starting context building', { tokenId, dreamLength: dreamState.dreamText.length });

      // Update status
      setDreamState(prev => ({ ...prev, contextStatus: 'Connecting to provider...' }));

      // Get provider and signer
      const [provider, providerErr] = await getProvider();
      if (!provider || providerErr) {
        throw new Error(`Provider error: ${providerErr?.message}`);
      }

      const [signer, signerErr] = await getSigner(provider);
      if (!signer || signerErr) {
        throw new Error(`Signer error: ${signerErr?.message}`);
      }

      debugLog('Provider and signer connected');

      // Update status
      setDreamState(prev => ({ ...prev, contextStatus: 'Connecting to contract...' }));

      // Get contract instance
      const contractAddress = frontendContracts.galileo.DreamscapeAgent.address;
      const contractABI = frontendContracts.galileo.DreamscapeAgent.abi;
      const contract = new Contract(contractAddress, contractABI, signer);

      debugLog('Contract connected', { address: contractAddress });

      // Update status
      setDreamState(prev => ({ ...prev, contextStatus: 'Building context...' }));

      // Create context builder
      const contextBuilder = new DreamContextBuilder(contract, debugLog);

      // Build context
      const context = await contextBuilder.buildContext(
        tokenId,
        dreamState.dreamText,
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

  return {
    dreamText: dreamState.dreamText,
    isProcessing: dreamState.isProcessing,
    error: dreamState.error,
    isLoadingContext: dreamState.isLoadingContext,
    contextStatus: dreamState.contextStatus,
    builtContext: dreamState.builtContext,
    setDreamText,
    resetDream,
    buildDreamContext
  };
}
