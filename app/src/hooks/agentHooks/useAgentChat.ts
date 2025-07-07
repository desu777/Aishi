'use client';

import { useState, useEffect } from 'react';
import { useWriteContract, useAccount, useChainId, useWaitForTransactionReceipt } from 'wagmi';
import { decodeEventLog } from 'viem';
import { useTheme } from '../../contexts/ThemeContext';
import { useAgentRead } from './useAgentRead';
import { useStorageDownload } from '../storage/useStorageDownload';
import { galileoTestnet } from '../../config/chains';

// Import modular components
import { 
  AgentInfo, 
  ChatState, 
  ConversationResult, 
  ContextType,
  SaveConversationResult
} from './types/agentChatTypes';
import { contractConfig, STORAGE_CONFIG, COMPUTE_CONFIG, NETWORK_CONFIG } from './config/agentChatConfig';
import { parseViemError, detectContextType, ensureProperHex } from './utils/agentChatUtils';
import { buildChatContext, chatWithAI, saveChatToStorage } from './services/agentChatService';

/**
 * Hook for agent conversations: Context → AI Chat → Storage → Blockchain
 * 
 * PRZEPŁYW DZIAŁANIA:
 * 1. Context Building: Zbiera dane agenta, historię konwersacji i snów
 * 2. AI Chat: Wysyła prompt do AI i otrzymuje odpowiedź
 * 3. Storage (opcjonalnie): Zapisuje konwersację w 0G Storage
 * 4. Blockchain (opcjonalnie): Rejestruje hash konwersacji w kontrakcie
 * 
 * Bazuje na wzorcu useAgentDream.ts ale dla recordConversation()
 */
export function useAgentChat() {
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
    getConversationHistory,
  } = useAgentRead();

  // Storage download hook
  const { downloadFile } = useStorageDownload();

  // Get conversation history data (hooks at top level)
  const { data: conversationHashesData, isLoading: conversationHashesLoading } = getConversationHistory(
    userTokenId as bigint, 
    BigInt(5)
  );

  // Get dream history data (hooks at top level)
  const { data: dreamHashesData, isLoading: dreamHashesLoading } = getDreamHistory(
    userTokenId as bigint, 
    BigInt(3)
  );

  // Local state for conversation processing
  const [state, setState] = useState<ChatState>({
    isLoadingContext: false,
    isProcessingWithAI: false,
    isSavingToStorage: false,
    isRecordingOnChain: false,
    isWaitingForReceipt: false,
    isComplete: false,
    error: '',
    currentStep: 'input',
    // 🆕 Lokalna sesja konwersacji
    localConversationHistory: [],
    sessionStartTime: new Date().toISOString()
  });

  // Wait for transaction receipt
  const { data: receipt, isLoading: isReceiptLoading, error: receiptError } = useWaitForTransactionReceipt({
    hash: state.txHash as `0x${string}`,
    query: {
      enabled: !!state.txHash && !state.isComplete,
    },
  });

  // Check if on correct network
  const isCorrectNetwork = chainId === NETWORK_CONFIG.chainId;

  // Debug logging helper (używa NEXT_PUBLIC_DREAM_TEST)
  const testLog = (message: string, data?: any) => {
    if (process.env.NEXT_PUBLIC_DREAM_TEST === 'true') {
      console.log(`[🔮 AGENT CHAT] ${message}`, data || '');
      debugLog(`[AGENT CHAT] ${message}`, data);
    }
  };

  // Process receipt when available
  useEffect(() => {
    if (receipt && !state.isComplete) {
      try {
        // Find AgentConversation event in logs
        const conversationEvent = receipt.logs.find(log => {
          try {
            const decoded = decodeEventLog({
              abi: contractConfig.abi,
              data: log.data,
              topics: log.topics,
            });
            return decoded.eventName === 'AgentConversation';
          } catch {
            return false;
          }
        });

        if (conversationEvent) {
          testLog('🎉 Transaction confirmed on-chain!', {
            txHash: state.txHash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed?.toString()
          });
          
          setState(prev => ({
            ...prev,
            isRecordingOnChain: false,
            isWaitingForReceipt: false,
            isComplete: true,
            currentStep: 'complete',
            error: ''
          }));
          
          debugLog('Conversation recorded successfully on-chain', { 
            txHash: state.txHash,
            receipt: receipt
          });
        } else {
          setState(prev => ({
            ...prev,
            isRecordingOnChain: false,
            isWaitingForReceipt: false,
            error: 'AgentConversation event not found in transaction receipt'
          }));
        }
      } catch (error: any) {
        const errorMessage = parseViemError(error);
        debugLog('Error parsing receipt', { 
          error: errorMessage, 
          originalError: error.message
        });
        setState(prev => ({
          ...prev,
          isRecordingOnChain: false,
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
        originalError: receiptError.message
      });
      setState(prev => ({
        ...prev,
        isRecordingOnChain: false,
        isWaitingForReceipt: false,
        error: errorMessage,
        currentStep: 'error'
      }));
    }
  }, [receiptError, debugLog]);

  // Reset processing state
  const resetChat = () => {
    testLog('🔄 Resetting chat state');
    setState({
      isLoadingContext: false,
      isProcessingWithAI: false,
      isSavingToStorage: false,
      isRecordingOnChain: false,
      isWaitingForReceipt: false,
      isComplete: false,
      error: '',
      currentStep: 'input',
      // 🆕 Lokalna sesja konwersacji - zachowaj historię!
      localConversationHistory: state.localConversationHistory,
      sessionStartTime: state.sessionStartTime
    });
    debugLog('Chat processing state reset');
  };

  // 🆕 Nowa funkcja: Wyczyść całą sesję (nowa sesja chatu)
  const clearSessionHistory = () => {
    testLog('🗑️ Clearing session history - starting new session');
    setState(prev => ({
      ...prev,
      localConversationHistory: [],
      sessionStartTime: new Date().toISOString(),
      error: '',
      currentStep: 'input'
    }));
    debugLog('Session history cleared - new session started');
  };

  // Step 4: Record conversation on-chain
  const recordConversationOnChain = async (
    tokenId: bigint,
    conversationHash: string,
    contextType: ContextType
  ): Promise<string> => {
    try {
      debugLog('Recording conversation on-chain', {
        tokenId: tokenId.toString(),
        conversationHash,
        contextType
      });

      const properHash = ensureProperHex(conversationHash);

      debugLog('Sending recordConversation transaction', {
        tokenId: tokenId.toString(),
        conversationHash: properHash,
        contextType: contextType,
        contractAddress: contractConfig.address,
        walletAddress: address,
        networkId: chainId
      });

      const txHash = await writeContractAsync({
        ...contractConfig,
        functionName: 'recordConversation',
        account: address,
        chain: galileoTestnet,
        args: [
          tokenId,
          properHash,
          contextType
        ]
      });

      debugLog('Conversation recording transaction sent', { 
        txHash,
        tokenId: tokenId.toString(),
        conversationHash: properHash
      });

      return txHash;
    } catch (error: any) {
      const errorMessage = parseViemError(error);
      debugLog('On-chain recording error', { 
        error: errorMessage, 
        originalError: error?.message || error,
        tokenId: tokenId.toString(),
        conversationHash
      });
      throw new Error(errorMessage);
    }
  };

  // Save current conversation to storage and blockchain
  const saveCurrentConversation = async (): Promise<SaveConversationResult> => {
    if (!state.lastConversation) {
      throw new Error('No conversation to save');
    }

    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    if (!isCorrectNetwork) {
      throw new Error('Wrong network. Please switch to 0G Galileo Testnet');
    }

    if (!hasAgent || !userTokenId) {
      throw new Error('No agent found. Please mint an agent first.');
    }

    try {
      testLog('💾 Starting conversation save process', {
        hasConversation: !!state.lastConversation,
        conversationPreview: state.lastConversation?.userMessage?.substring(0, 50) + '...',
        tokenId: userTokenId?.toString()
      });

      // Step 1: Save to Storage
      setState(prev => ({ 
        ...prev, 
        isSavingToStorage: true,
        currentStep: 'storage',
        error: ''
      }));

      testLog('🗄️ Saving to 0G Storage...');
      const storageHash = await saveChatToStorage(
        state.lastConversation, 
        userTokenId as bigint, 
        address, 
        debugLog
      );

      testLog('✅ Storage save completed', { storageHash });

      setState(prev => ({ 
        ...prev, 
        isSavingToStorage: false,
        storageHash
      }));

      // Step 2: Record on-chain
      setState(prev => ({ 
        ...prev, 
        isRecordingOnChain: true,
        currentStep: 'blockchain'
      }));

      testLog('⛓️ Recording on blockchain...', {
        tokenId: userTokenId?.toString(),
        storageHash,
        contextType: state.lastConversation.contextType
      });

      const txHash = await recordConversationOnChain(
        userTokenId as bigint,
        storageHash,
        state.lastConversation.contextType
      );

      testLog('🚀 Transaction sent', { txHash });

      setState(prev => ({ 
        ...prev, 
        isRecordingOnChain: false,
        isWaitingForReceipt: true,
        currentStep: 'blockchain',
        txHash
      }));

      testLog('🎯 Conversation save process completed!', {
        storageHash,
        txHash,
        contextType: state.lastConversation.contextType,
        tokenId: userTokenId?.toString()
      });

      debugLog('Conversation saved successfully', {
        storageHash,
        txHash,
        contextType: state.lastConversation.contextType,
        tokenId: userTokenId?.toString()
      });

      return { storageHash, txHash };

    } catch (error: any) {
      const errorMessage = parseViemError(error);
      
      testLog('❌ Conversation save failed', {
        error: errorMessage,
        originalError: error?.message || error,
        step: state.currentStep,
        hasConversation: !!state.lastConversation
      });
      
      setState(prev => ({
        ...prev,
        isSavingToStorage: false,
        isRecordingOnChain: false,
        isWaitingForReceipt: false,
        error: errorMessage,
        currentStep: 'error'
      }));

      debugLog('Conversation save failed', { 
        error: errorMessage,
        originalError: error?.message || error
      });

      throw new Error(errorMessage);
    }
  };

  // Main conversation function (ORCHESTRATOR)
  const sendMessage = async (userMessage: string, contextType?: ContextType): Promise<ConversationResult> => {
    if (!isConnected || !address) {
      const error = 'Wallet not connected';
      setState(prev => ({ ...prev, error, currentStep: 'error' }));
      throw new Error(error);
    }

    if (!isCorrectNetwork) {
      const error = 'Wrong network. Please switch to 0G Galileo Testnet';
      setState(prev => ({ ...prev, error, currentStep: 'error' }));
      throw new Error(error);
    }

    if (!hasAgent || !userTokenId) {
      const error = 'No agent found. Please mint an agent first.';
      setState(prev => ({ ...prev, error, currentStep: 'error' }));
      throw new Error(error);
    }

    if (!userMessage?.trim()) {
      const error = 'Message cannot be empty';
      setState(prev => ({ ...prev, error, currentStep: 'error' }));
      throw new Error(error);
    }

    try {
      testLog('🚀 Starting conversation process', {
        userMessage: userMessage.substring(0, 100) + (userMessage.length > 100 ? '...' : ''),
        hasAgent: !!userAgent,
        agentName: userAgent?.agentName,
        tokenId: userTokenId?.toString()
      });

      // Step 1: Build Context
      setState(prev => ({ 
        ...prev, 
        isLoadingContext: true, 
        currentStep: 'context',
        error: ''
      }));

      testLog('🧠 Building chat context...');
      
      // 🆕 Sprawdź czy to pierwsza wiadomość w sesji
      const isFirstMessageInSession = state.localConversationHistory.length === 0;
      
      const context = await buildChatContext(
        userAgent as AgentInfo | undefined,
        state.localConversationHistory,
        isFirstMessageInSession,
        conversationHashesData as string[] | undefined,
        dreamHashesData as string[] | undefined,
        downloadFile,
        debugLog
      );

      testLog('📝 Context built - showing prompt preview', {
        contextLength: context.length,
        promptPreview: context.substring(0, 300) + (context.length > 300 ? '...' : ''),
        conversationHistoryCount: Array.isArray(conversationHashesData) ? conversationHashesData.length : 0,
        dreamHistoryCount: Array.isArray(dreamHashesData) ? dreamHashesData.length : 0
      });

      // Step 2: AI Response
      setState(prev => ({ 
        ...prev, 
        isLoadingContext: false,
        isProcessingWithAI: true,
        currentStep: 'ai'
      }));

      testLog('🤖 Sending message to AI...', {
        userMessage,
        promptLength: context.length + userMessage.length
      });

      const aiResponse = await chatWithAI(userMessage, context, address, debugLog);

      testLog('✅ AI response received', {
        responseLength: aiResponse.length,
        responsePreview: aiResponse.substring(0, 200) + (aiResponse.length > 200 ? '...' : '')
      });

      // Detect context type if not provided
      const detectedContextType = contextType || detectContextType(userMessage);

      const conversationResult: ConversationResult = {
        userMessage,
        aiResponse,
        contextType: detectedContextType,
        timestamp: new Date().toISOString()
      };

      setState(prev => ({ 
        ...prev, 
        isProcessingWithAI: false,
        lastConversation: conversationResult,
        currentStep: 'complete',
        isComplete: true,
        // 🆕 Dodaj konwersację do lokalnej historii sesji
        localConversationHistory: [...prev.localConversationHistory, conversationResult]
      }));

      testLog('🎉 Conversation completed successfully!', {
        contextType: detectedContextType,
        contextTypeName: ContextType[detectedContextType],
        tokenId: userTokenId?.toString(),
        finalResult: {
          userMessage: conversationResult.userMessage,
          aiResponse: conversationResult.aiResponse.substring(0, 100) + '...',
          timestamp: conversationResult.timestamp
        }
      });

      debugLog('Conversation processed successfully (without auto-save)', {
        contextType: detectedContextType,
        tokenId: userTokenId?.toString()
      });

      return conversationResult;

    } catch (error: any) {
      const errorMessage = parseViemError(error);
      
      testLog('❌ Conversation processing failed', {
        error: errorMessage,
        originalError: error?.message || error,
        step: state.currentStep,
        userMessage: userMessage.substring(0, 50) + '...'
      });
      
      setState(prev => ({
        ...prev,
        isLoadingContext: false,
        isProcessingWithAI: false,
        isSavingToStorage: false,
        isRecordingOnChain: false,
        isWaitingForReceipt: false,
        error: errorMessage,
        currentStep: 'error'
      }));

      debugLog('Conversation processing failed', { 
        error: errorMessage,
        originalError: error?.message || error
      });

      throw new Error(errorMessage);
    }
  };

  return {
    // State
    isLoadingContext: state.isLoadingContext || conversationHashesLoading || dreamHashesLoading,
    isProcessingWithAI: state.isProcessingWithAI,
    isSavingToStorage: state.isSavingToStorage,
    isRecordingOnChain: state.isRecordingOnChain || isPending,
    isWaitingForReceipt: state.isWaitingForReceipt || isReceiptLoading,
    isComplete: state.isComplete,
    error: state.error,
    currentStep: state.currentStep,
    lastConversation: state.lastConversation,
    storageHash: state.storageHash,
    txHash: state.txHash,

    // Main Actions
    sendMessage,
    resetChat,
    clearSessionHistory,
    saveCurrentConversation,

    // Agent context
    hasAgent,
    userAgent,
    userTokenId,
    
    // 🆕 Session info
    localConversationHistory: state.localConversationHistory,
    sessionStartTime: state.sessionStartTime,
    
    // Configuration
    storageConfig: STORAGE_CONFIG,
    computeConfig: COMPUTE_CONFIG,
    
    // Network check
    isCorrectNetwork,
    isConnected,
    
    // Context types
    ContextType
  };
} 