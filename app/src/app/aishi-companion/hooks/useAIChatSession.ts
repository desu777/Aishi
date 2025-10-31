/**
 * @fileoverview AI Chat Session Hook
 * @description Manages chat session lifecycle and integrates with terminal chat services
 */

import { useState, useCallback, useRef } from 'react';
import type { Live2DModelRef } from '@/components/live2d/utils/live2d-types';
import { sendToAI } from '@/terminal-xstate/services/apiService';
import { fetchChatContext } from '@/terminal-xstate/machines/chatServices';
import { buildLive2DChatPrompt } from '../services/live2dChatPromptBuilder';
import type { ChatMessage } from '@/terminal-xstate/machines/chatMachine';

// Debug logging
const debugLog = (message: string, data?: any) => {
  if (process.env.NEXT_PUBLIC_AISHI_COMPANION_DEBUG === 'true') {
    console.log(`[useAIChatSession] ${message}`, data || '');
  }
};

export type SessionState =
  | 'idle'
  | 'confirming'
  | 'initializing'
  | 'ready'
  | 'thinking'
  | 'animating'
  | 'speaking'
  | 'confirmingSave'
  | 'summarizing'
  | 'saving'
  | 'completed'
  | 'error';

interface SessionContext {
  agentId: number;
  agentName: string;
  agentContext: any | null;
  historicalData: any | null;
}

/**
 * Default Aishi personality for fallback when no agent NFT exists
 */
const DEFAULT_AISHI_PERSONALITY = {
  agentData: {
    intelligenceLevel: 1,
    dreamCount: 0,
    conversationCount: 0
  },
  personality: {
    creativity: 75,
    analytical: 60,
    empathy: 85,
    intuition: 70,
    resilience: 65,
    curiosity: 80,
    dominantMood: 'cheerful'
  },
  uniqueFeatures: [],
  memory: {}
};

/**
 * Hook for managing AI chat session with Live2D integration
 * Reuses terminal-xstate chat services for consistency
 */
export const useAIChatSession = (
  modelRef: React.RefObject<Live2DModelRef>,
  currentParameters: Map<string, number>
) => {
  const [state, setState] = useState<SessionState>('idle');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sessionContext, setSessionContext] = useState<SessionContext | null>(null);
  const [saveData, setSaveData] = useState<{
    summary: any | null;
    fileData: any | null;
    rootHash: string | null;
    txHash: string | null;
  }>({ summary: null, fileData: null, rootHash: null, txHash: null });

  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Initialize chat session
   * Loads agent context from blockchain and 0G storage (like terminal chat)
   */
  const initializeSession = useCallback(async (agentId: number = 1, agentName: string = 'Aishi') => {
    debugLog('Initializing chat session', { agentId, agentName });

    setState('initializing');
    setError(null);

    try {
      // Fetch context (reuse terminal chat service)
      const contextData = await fetchChatContext(agentId, false);

      // Extract agent name from contract data or use fallback
      const contractAgentName = contextData.agentContext?.agentData?.agentName || agentName;

      setSessionContext({
        agentId,
        agentName: contractAgentName,
        agentContext: contextData.agentContext,
        historicalData: contextData.historicalData
      });

      setState('ready');
      debugLog('Session initialized successfully', {
        agentName: contractAgentName,
        hasAgentContext: !!contextData.agentContext,
        hasHistoricalData: !!contextData.historicalData
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize session';
      setError(errorMessage);
      setState('error');
      debugLog('Session initialization failed', { error: errorMessage });
    }
  }, []);

  /**
   * Send user message and get AI response
   */
  const sendMessage = useCallback(async (userInput: string): Promise<string | null> => {
    if (!sessionContext) {
      debugLog('Cannot send message - session not initialized');
      return null;
    }

    debugLog('Sending user message', {
      messageLength: userInput.length,
      currentMessageCount: messages.length
    });

    setState('thinking');

    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: userInput,
      timestamp: Date.now()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    try {
      // Build prompt with Live2D parameter context
      const prompt = buildLive2DChatPrompt({
        userMessage: userInput,
        messages: updatedMessages,
        agentContext: sessionContext.agentContext,
        historicalData: sessionContext.historicalData,
        agentName: sessionContext.agentName,
        isFirstMessage: messages.length === 0,
        currentParameters
      });

      debugLog('Prompt built, sending to AI', {
        promptLength: prompt.length
      });

      // Send to AI (reuse terminal service)
      const aiResponse = await sendToAI(prompt, 'gemini-2.5-flash');

      debugLog('AI response received', {
        responseLength: aiResponse.length
      });

      // Add AI message to state
      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: aiResponse,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, aiMessage]);

      setState('ready');
      return aiResponse;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get AI response';
      setError(errorMessage);
      setState('error');
      debugLog('Send message failed', { error: errorMessage });
      return null;
    }
  }, [sessionContext, messages, currentParameters]);

  /**
   * Initialize session with fallback personality (no blockchain)
   * Used when user has no agent NFT or wallet not connected
   */
  const initializeSessionWithFallback = useCallback(async (agentName: string = 'Aishi') => {
    debugLog('Initializing session with fallback personality (no blockchain)');

    setState('initializing');
    setError(null);

    setSessionContext({
      agentId: 0,
      agentName,
      agentContext: DEFAULT_AISHI_PERSONALITY,
      historicalData: null
    });

    setState('ready');
    debugLog('Fallback session initialized successfully');
  }, []);

  /**
   * Reset session
   */
  const resetSession = useCallback(() => {
    setMessages([]);
    setSessionContext(null);
    setState('idle');
    setError(null);
    debugLog('Session reset');
  }, []);

  /**
   * Cancel ongoing AI request
   */
  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setState('ready');
      debugLog('AI request cancelled');
    }
  }, []);

  /**
   * End session - trigger save confirmation
   */
  const endSession = useCallback(() => {
    debugLog('Ending session, showing save confirmation');
    setState('confirmingSave');
  }, []);

  /**
   * Confirm save - execute full save workflow (1:1 from chatMachine)
   */
  const confirmSave = useCallback(async (shouldSave: boolean) => {
    if (!shouldSave || !sessionContext) {
      debugLog('Save cancelled, completing session');
      setState('completed');
      setTimeout(() => {
        resetSession();
      }, 500);
      return;
    }

    if (messages.length === 0) {
      debugLog('No messages to save');
      setState('completed');
      setTimeout(() => {
        resetSession();
      }, 500);
      return;
    }

    try {
      // Step 1: Generate conversation summary (like chatMachine summarizingConversation)
      debugLog('Generating conversation summary');
      setState('summarizing');

      const { generateConversationSummary } = await import('@/terminal-xstate/machines/chatServices');

      const transcript = messages
        .map(m => `${m.role === 'user' ? 'User' : sessionContext.agentName}: ${m.content}`)
        .join('\n');

      const summaryResult = await generateConversationSummary(
        transcript,
        messages,
        sessionContext.agentId,
        'gemini-2.5-flash'
      );

      setSaveData(prev => ({ ...prev, summary: summaryResult.summary }));
      debugLog('Summary generated', { summary: summaryResult.summary });

      // Step 2: Prepare conversation file (like chatMachine savingConversation.preparingFile)
      debugLog('Preparing conversation file');
      setState('saving');

      const { ConversationFileManager } = await import('@/terminal-xstate/services/conversationFileManager');
      const fileManager = new ConversationFileManager();

      const fileResult = await fileManager.manageConversationFile(
        sessionContext.agentId,
        sessionContext.agentName,
        summaryResult.summary
      );

      setSaveData(prev => ({ ...prev, fileData: fileResult }));
      debugLog('File prepared', { fileName: fileResult.fileName });

      // Step 3: Upload to 0G storage (like chatMachine savingConversation.uploadingToStorage)
      debugLog('Uploading to 0G storage');

      const { uploadToStorage } = await import('@/terminal-xstate/services/xstateStorage');

      const uploadResult = await uploadToStorage(
        fileResult.fileContent,
        fileResult.fileName,
        (status) => debugLog('Upload status', { status })
      );

      setSaveData(prev => ({ ...prev, rootHash: uploadResult.rootHash }));
      debugLog('Upload complete', { rootHash: uploadResult.rootHash });

      // Step 4: Update contract (like chatMachine savingConversation.updatingContract)
      debugLog('Updating blockchain contract');

      const { ConversationContractUpdater } = await import('@/terminal-xstate/services/conversationContractUpdater');
      const contractUpdater = new ConversationContractUpdater();

      const contractResult = await contractUpdater.updateConversationContract(
        sessionContext.agentId,
        uploadResult.rootHash,
        summaryResult.summary?.type || 'general_chat'
      );

      setSaveData(prev => ({ ...prev, txHash: contractResult.txHash }));
      debugLog('Contract updated', { txHash: contractResult.txHash });

      // Complete
      setState('completed');
      debugLog('Save workflow complete');

      // Reset after brief delay
      setTimeout(() => {
        resetSession();
        setSaveData({ summary: null, fileData: null, rootHash: null, txHash: null });
      }, 2000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save conversation';
      setError(errorMessage);
      setState('error');
      debugLog('Save workflow failed', { error: errorMessage });
    }
  }, [sessionContext, messages, resetSession]);

  return {
    state,
    messages,
    error,
    sessionContext,
    saveData,
    initializeSession,
    initializeSessionWithFallback,
    sendMessage,
    endSession,
    confirmSave,
    resetSession,
    cancelRequest
  };
};
