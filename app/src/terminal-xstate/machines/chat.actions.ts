/**
 * @fileoverview Chat Machine Actions
 * @description All actions for the chat state machine
 */

import { assign, sendParent } from 'xstate';
import type { ChatMessage, ChatContext } from './chatMachine';
import type { TerminalLine } from './types';

// Debug logging
const debugLog = (message: string, data?: any) => {
  if (process.env.NEXT_PUBLIC_XSTATE_TERMINAL === 'true' || process.env.NEXT_PUBLIC_DREAM_TEST === 'true') {
    console.log(`[ChatMachine] ${message}`, data || '');
  }
};

export const chatActions = {
  /**
   * Initialize chat session
   */
  initializeSession: assign({
    agentId: ({ event }: any) => event.agentId,
    agentName: ({ event }: any) => event.agentName,
    modelId: ({ event }: any) => event.modelId || 'auto',
    sessionId: () => `chat_${Date.now()}`,
    statusMessage: ({ event }: any) => `Starting chat with ${event.agentName}...`,
    messages: () => [],
    currentTranscript: () => ''
  }),

  /**
   * Store context data
   */
  storeContext: assign({
    agentContext: ({ event }: any) => event.output.agentContext,
    historicalData: ({ event }: any) => event.output.historicalData,
    isInitialized: true,
    statusMessage: ({ context }: { context: ChatContext }) => `Chat ready with ${context.agentName}`
  }),

  /**
   * Add user message
   */
  addUserMessage: assign({
    messages: ({ context, event }: any) => {
      const userMessage: ChatMessage = {
        role: 'user',
        content: event.message || event.value,
        timestamp: Date.now()
      };
      return [...context.messages, userMessage];
    },
    currentTranscript: ({ context, event }: any) => {
      const message = event.message || event.value;
      return context.currentTranscript + 
             `User: ${message}\n`;
    },
    statusMessage: ({ context }: { context: ChatContext }) => `${context.agentName} is thinking...`
  }),

  /**
   * Add AI response
   */
  addAIResponse: assign({
    messages: ({ context, event }: any) => {
      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: event.output.response,
        timestamp: Date.now()
      };
      return [...context.messages, aiMessage];
    },
    currentTranscript: ({ context, event }: any) => {
      return context.currentTranscript + 
             `${context.agentName}: ${event.output.response}\n`;
    },
    statusMessage: 'Type your message...'
  }),

  /**
   * Set awaiting save confirmation
   */
  setAwaitingConfirmation: assign({
    awaitingConfirmation: true,
    statusMessage: 'Save this conversation to memory?'
  }),

  /**
   * Store conversation summary
   */
  storeConversationSummary: assign({
    conversationSummary: ({ event }: any) => event.output.summary,
    statusMessage: 'Saving conversation...'
  }),

  /**
   * Store persistence result
   */
  storePersistenceResult: assign({
    storageRootHash: ({ event }: any) => event.output.rootHash,
    contractTxHash: ({ event }: any) => event.output.txHash,
    statusMessage: 'Conversation saved successfully!'
  }),

  /**
   * Set error
   */
  setError: assign({
    error: ({ event }: any) => event.error || 'An error occurred',
    lastError: ({ event }: any) => event.error || 'Unknown error',
    statusMessage: ({ event }: any) => `Error: ${event.error || 'Unknown error'}`
  }),

  /**
   * Clear error
   */
  clearError: assign({
    error: null,
    lastError: null,
    retryCount: 0
  }),
  
  /**
   * Increment retry count
   */
  incrementRetry: assign({
    retryCount: ({ context }: { context: ChatContext }) => context.retryCount + 1,
    statusMessage: ({ context }: { context: ChatContext }) => 
      `Retrying... (Attempt ${context.retryCount + 1}/${context.maxRetries})`
  }),
  
  /**
   * Reset retry count
   */
  resetRetry: assign({
    retryCount: 0,
    lastError: null
  }),

  /**
   * Send lines to parent (terminal)
   */
  sendLinesToParent: sendParent(({ context }: { context: ChatContext }) => {
    const lines: TerminalLine[] = [];
    const timestamp = Date.now();

    // Get the last message (should be AI response)
    const lastMessage = context.messages[context.messages.length - 1];
    
    if (lastMessage && lastMessage.role === 'assistant') {
      // Display AI response
      lines.push({
        type: 'info',
        content: `~ ${context.agentName} : ${lastMessage.content}`,
        timestamp
      });
    }

    return { type: 'APPEND_LINES', lines };
  }),

  /**
   * Send save confirmation prompt
   */
  sendSavePrompt: sendParent(() => {
    const lines: TerminalLine[] = [{
      type: 'system',
      content: 'Do you want to save this conversation to agent memory? (y/n)',
      timestamp: Date.now()
    }];
    return { type: 'APPEND_LINES', lines };
  }),

  /**
   * Send completion to parent
   */
  sendCompletionToParent: sendParent(({ context }: { context: ChatContext }) => {
    const lines: TerminalLine[] = [{
      type: 'success',
      content: context.statusMessage,
      timestamp: Date.now()
    }];
    return { type: 'APPEND_LINES', lines };
  }),

  /**
   * Send chat started message
   */
  sendChatStartedMessage: sendParent(({ context }: { context: ChatContext }) => ({
    type: 'APPEND_LINES',
    lines: [{
      type: 'system',
      content: `Chat session started with ${context.agentName}. Type your message:`,
      timestamp: Date.now()
    }]
  })),

  /**
   * Send context load error with retry info
   */
  sendContextLoadError: sendParent(({ context }: { context: ChatContext }) => ({
    type: 'APPEND_LINES',
    lines: [{
      type: 'error',
      content: context.retryCount < context.maxRetries 
        ? `Failed to load agent context: ${context.error}. Retrying in 2 seconds...`
        : `Failed to load agent context after ${context.maxRetries} attempts: ${context.error}`,
      timestamp: Date.now()
    }]
  })),

  /**
   * Send unable to start message
   */
  sendUnableToStart: sendParent(() => ({
    type: 'APPEND_LINES',
    lines: [{
      type: 'error',
      content: 'Unable to start chat session. Please try again later.',
      timestamp: Date.now()
    }]
  })),

  /**
   * Send message processing error
   */
  sendMessageError: sendParent(({ context }: { context: ChatContext }) => ({
    type: 'APPEND_LINES',
    lines: [{
      type: 'error',
      content: context.retryCount < context.maxRetries
        ? `Message processing failed: ${context.error}. Retrying in 2 seconds...`
        : `Message failed after ${context.maxRetries} attempts. Type to try again or END SESSION to exit.`,
      timestamp: Date.now()
    }]
  })),

  /**
   * Send save failed error
   */
  sendSaveError: sendParent(({ context }: { context: ChatContext }) => ({
    type: 'APPEND_LINES',
    lines: [{
      type: 'error',
      content: `Failed to save conversation: ${context.error}`,
      timestamp: Date.now()
    }]
  })),

  /**
   * Set cancelled status
   */
  setCancelledStatus: assign({
    statusMessage: 'Chat cancelled.'
  })
};

/**
 * Chat-specific guards
 */
export const chatGuards = {
  /**
   * Check if input is yes
   */
  isYesInput: ({ event }: any) => {
    if (event.type !== 'INPUT.SUBMIT') return false;
    const value = event.value?.toLowerCase().trim();
    return value === 'y' || value === 'yes';
  },

  /**
   * Check if input is no
   */
  isNoInput: ({ event }: any) => {
    if (event.type !== 'INPUT.SUBMIT') return false;
    const value = event.value?.toLowerCase().trim();
    return value === 'n' || value === 'no';
  },

  /**
   * Check if can retry
   */
  canRetry: ({ context }: { context: ChatContext }) => {
    return context.retryCount < context.maxRetries;
  },

  /**
   * Check if exceeded retries
   */
  hasExceededRetries: ({ context }: { context: ChatContext }) => {
    return context.retryCount >= context.maxRetries;
  }
};