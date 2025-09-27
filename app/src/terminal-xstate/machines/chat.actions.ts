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
    currentTranscript: () => '',
    wasVoiceInput: ({ event }: any) => event.wasVoiceInput || false
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
    }
    // Removed statusMessage reset - will be handled after display
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
    contractTxHash: ({ event }: any) => event.output.txHash,
    statusMessage: 'Conversation saved successfully!',
    retryCount: 0 // Reset retry count on success
  }),

  /**
   * Set error
   */
  setError: assign({
    error: ({ event }: any) => event.error || 'An error occurred',
    lastError: ({ event }: any) => event.error || 'Unknown error',
    statusMessage: null, // Clear status for new input
    awaitingConfirmation: false // Reset any confirmation state
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
  sendLinesToParent: [
    sendParent(({ context }: { context: ChatContext }) => {
      const lines: TerminalLine[] = [];
      const timestamp = Date.now();

      // Get the last message (should be AI response)
      const lastMessage = context.messages[context.messages.length - 1];

      if (lastMessage && lastMessage.role === 'assistant') {
        // Display AI response - check if voice or text
        if (context.wasVoiceInput) {
          // For voice input, prepare for voice output
          lines.push({
            type: 'info',
            content: `~ ${context.agentName} : [Processing voice response...]`,
            timestamp
          });
        } else {
          // For text input, display regular text
          lines.push({
            type: 'info',
            content: `~ ${context.agentName} : ${lastMessage.content}`,
            timestamp
          });
        }
      }

      return { type: 'APPEND_LINES', lines };
    }),
    // Send TTS request if voice input
    sendParent(({ context }: { context: ChatContext }) => {
      const lastMessage = context.messages[context.messages.length - 1];
      if (context.wasVoiceInput && lastMessage && lastMessage.role === 'assistant') {
        return {
          type: 'VOICE.SYNTHESIZE_RESPONSE',
          text: lastMessage.content,
          agentName: context.agentName
        };
      }
      // Return a no-op event if not voice
      return { type: 'NOOP' };
    })
  ],

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
 * Note: Common guards like isYesInput, isNoInput, canRetry are now in shared/storage.guards.ts
 */
export const chatGuards = {
  // Keep this empty for now - all guards moved to shared modules
  // Add any chat-specific guards here in the future
};