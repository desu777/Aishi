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
  | 'error';

interface SessionContext {
  agentId: number;
  agentName: string;
  agentContext: any | null;
  historicalData: any | null;
}

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

      setSessionContext({
        agentId,
        agentName,
        agentContext: contextData.agentContext,
        historicalData: contextData.historicalData
      });

      setState('ready');
      debugLog('Session initialized successfully', {
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

  return {
    state,
    messages,
    error,
    sessionContext,
    initializeSession,
    sendMessage,
    resetSession,
    cancelRequest
  };
};
