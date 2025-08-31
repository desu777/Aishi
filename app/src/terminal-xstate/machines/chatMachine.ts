/**
 * @fileoverview Chat Machine for Terminal XState
 * @description Manages interactive chat sessions between users and their AI agents
 */

import { setup, assign, sendParent, fromPromise } from 'xstate';
import { TerminalLine } from './types';

// Debug logging
const debugLog = (message: string, data?: any) => {
  if (process.env.NEXT_PUBLIC_XSTATE_TERMINAL === 'true' || process.env.NEXT_PUBLIC_DREAM_TEST === 'true') {
    console.log(`[ChatMachine] ${message}`, data || '');
  }
};

// Chat-specific types
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatContext {
  agentId: number | null;
  agentName: string;
  sessionId: string | null;
  messages: ChatMessage[];
  currentTranscript: string;
  isInitialized: boolean;
  awaitingConfirmation: boolean;
  statusMessage: string;
  error: string | null;
  // Context data
  agentContext: any | null;
  historicalData: any | null;
  // Persistence
  conversationSummary: any | null;
  storageRootHash: string | null;
  contractTxHash: string | null;
  // Error handling
  retryCount: number;
  maxRetries: number;
  lastError: string | null;
}

export type ChatEvent =
  | { type: 'START_CHAT'; agentId: number; agentName: string }
  | { type: 'USER_MESSAGE'; message: string }
  | { type: 'AI_RESPONSE_SUCCESS'; response: string }
  | { type: 'AI_RESPONSE_ERROR'; error: string }
  | { type: 'END_SESSION' }
  | { type: 'CONFIRM_SAVE' }
  | { type: 'CANCEL_SAVE' }
  | { type: 'INPUT.SUBMIT'; value: string }
  | { type: 'EXIT' }
  | { type: 'RETRY' }
  | { type: 'SKIP_RETRY' };

// Initial context
const initialContext: ChatContext = {
  agentId: null,
  agentName: '',
  sessionId: null,
  messages: [],
  currentTranscript: '',
  isInitialized: false,
  awaitingConfirmation: false,
  statusMessage: 'Initializing chat...',
  error: null,
  agentContext: null,
  historicalData: null,
  conversationSummary: null,
  storageRootHash: null,
  contractTxHash: null,
  retryCount: 0,
  maxRetries: 3,
  lastError: null
};

// Chat machine definition
export const chatMachine = setup({
  types: {} as {
    context: ChatContext;
    events: ChatEvent;
    input: {
      agentId: number;
      agentName: string;
    };
  },
  actions: {
    // Initialize chat session
    initializeSession: assign({
      agentId: ({ event }) => (event as any).agentId,
      agentName: ({ event }) => (event as any).agentName,
      sessionId: () => `chat_${Date.now()}`,
      statusMessage: ({ event }) => `Starting chat with ${(event as any).agentName}...`,
      messages: () => [],
      currentTranscript: () => ''
    }),

    // Store context data
    storeContext: assign({
      agentContext: ({ event }) => (event as any).output.agentContext,
      historicalData: ({ event }) => (event as any).output.historicalData,
      isInitialized: true,
      statusMessage: ({ context }) => `Chat ready with ${context.agentName}`
    }),

    // Add user message
    addUserMessage: assign({
      messages: ({ context, event }) => {
        const userMessage: ChatMessage = {
          role: 'user',
          content: (event as any).message || (event as any).value,
          timestamp: Date.now()
        };
        return [...context.messages, userMessage];
      },
      currentTranscript: ({ context, event }) => {
        const message = (event as any).message || (event as any).value;
        return context.currentTranscript + 
               `User: ${message}\n`;
      },
      statusMessage: ({ context }) => `${context.agentName} is thinking...`
    }),

    // Add AI response
    addAIResponse: assign({
      messages: ({ context, event }) => {
        const aiMessage: ChatMessage = {
          role: 'assistant',
          content: (event as any).output.response,
          timestamp: Date.now()
        };
        return [...context.messages, aiMessage];
      },
      currentTranscript: ({ context, event }) => {
        return context.currentTranscript + 
               `${context.agentName}: ${(event as any).output.response}\n`;
      },
      statusMessage: 'Type your message...'
    }),

    // Set awaiting save confirmation
    setAwaitingConfirmation: assign({
      awaitingConfirmation: true,
      statusMessage: 'Save this conversation to memory?'
    }),

    // Store conversation summary
    storeConversationSummary: assign({
      conversationSummary: ({ event }) => (event as any).output.summary,
      statusMessage: 'Saving conversation...'
    }),

    // Store persistence result
    storePersistenceResult: assign({
      storageRootHash: ({ event }) => (event as any).output.rootHash,
      contractTxHash: ({ event }) => (event as any).output.txHash,
      statusMessage: 'Conversation saved successfully!'
    }),

    // Set error
    setError: assign({
      error: ({ event }) => (event as any).error || 'An error occurred',
      lastError: ({ event }) => (event as any).error || 'Unknown error',
      statusMessage: ({ event }) => `Error: ${(event as any).error || 'Unknown error'}`
    }),

    // Clear error
    clearError: assign({
      error: null,
      lastError: null,
      retryCount: 0
    }),
    
    // Increment retry count
    incrementRetry: assign({
      retryCount: ({ context }) => context.retryCount + 1,
      statusMessage: ({ context }) => `Retrying... (Attempt ${context.retryCount + 1}/${context.maxRetries})`
    }),
    
    // Reset retry count
    resetRetry: assign({
      retryCount: 0,
      lastError: null
    }),

    // Send lines to parent (terminal)
    sendLinesToParent: sendParent(({ context, event }) => {
      const lines: TerminalLine[] = [];
      const timestamp = Date.now();

      if (event.type === 'AI_RESPONSE_SUCCESS') {
        // Display AI response
        lines.push({
          type: 'info',
          content: `~ ${context.agentName}: ${(event as any).output.response}`,
          timestamp
        });
      }

      return { type: 'APPEND_LINES', lines };
    }),

    // Send save confirmation prompt
    sendSavePrompt: sendParent(() => {
      const lines: TerminalLine[] = [{
        type: 'system',
        content: 'Do you want to save this conversation to agent memory? (y/n)',
        timestamp: Date.now()
      }];
      return { type: 'APPEND_LINES', lines };
    }),

    // Send status to parent
    sendStatusToParent: sendParent(({ context }) => ({
      type: 'UPDATE_STATUS',
      status: context.statusMessage
    })),

    // Send completion to parent
    sendCompletionToParent: sendParent(({ context }) => {
      const lines: TerminalLine[] = [{
        type: 'success',
        content: context.statusMessage,
        timestamp: Date.now()
      }];
      return { type: 'APPEND_LINES', lines };
    })
  },
  actors: {
    // Load full agent context
    loadContext: fromPromise(async ({ input }: { input: { agentId: number } }) => {
      debugLog('Loading full agent context', { agentId: input.agentId });
      
      // Dynamic import to avoid circular dependencies
      const { fetchChatContext } = await import('./chatServices');
      const contextData = await fetchChatContext(input.agentId);
      
      debugLog('Context loaded successfully', {
        hasAgentData: !!contextData.agentContext,
        hasHistoricalData: !!contextData.historicalData
      });
      
      return contextData;
    }),

    // Process user message with AI
    processMessage: fromPromise(async ({ input }: { input: any }) => {
      debugLog('Processing user message', {
        messageLength: input.message?.length,
        isFirstMessage: input.messages.length === 1
      });

      // Dynamic import to avoid circular dependencies
      const { sendChatMessage } = await import('./chatServices');
      const response = await sendChatMessage(
        input.message,
        input.messages,
        input.agentContext,
        input.historicalData,
        input.agentName
      );

      debugLog('AI response received', {
        responseLength: response.response?.length
      });

      return response;
    }),

    // Generate conversation summary
    generateSummary: fromPromise(async ({ input }: { input: any }) => {
      debugLog('Generating conversation summary', {
        messageCount: input.messages.length,
        transcriptLength: input.currentTranscript.length
      });

      // Dynamic import to avoid circular dependencies
      const { generateConversationSummary } = await import('./chatServices');
      const summary = await generateConversationSummary(
        input.currentTranscript,
        input.messages,
        input.agentId
      );

      debugLog('Summary generated', {
        hasSummary: !!summary.summary
      });

      return summary;
    }),

    // Persist conversation
    persistConversation: fromPromise(async ({ input }: { input: any }) => {
      debugLog('Persisting conversation', {
        agentId: input.agentId,
        hasSummary: !!input.conversationSummary
      });

      // Dynamic import to avoid circular dependencies
      const { persistChatConversation } = await import('./chatServices');
      const result = await persistChatConversation(
        input.agentId,
        input.agentName,
        input.conversationSummary,
        input.currentTranscript
      );

      debugLog('Conversation persisted', {
        rootHash: result.rootHash,
        txHash: result.txHash
      });

      return result;
    })
  },
  guards: {
    isYesInput: ({ event }) => {
      if (event.type !== 'INPUT.SUBMIT') return false;
      const value = (event as any).value?.toLowerCase().trim();
      return value === 'y' || value === 'yes';
    },
    isNoInput: ({ event }) => {
      if (event.type !== 'INPUT.SUBMIT') return false;
      const value = (event as any).value?.toLowerCase().trim();
      return value === 'n' || value === 'no';
    },
    canRetry: ({ context }) => {
      return context.retryCount < context.maxRetries;
    },
    hasExceededRetries: ({ context }) => {
      return context.retryCount >= context.maxRetries;
    }
  }
}).createMachine({
  id: 'chatMachine',
  initial: 'idle',
  context: initialContext,
  states: {
    idle: {
      on: {
        START_CHAT: {
          target: 'loadingContext',
          actions: ['initializeSession', 'sendStatusToParent']
        }
      }
    },

    loadingContext: {
      entry: 'clearError',
      invoke: {
        src: 'loadContext',
        input: ({ context }) => ({ agentId: context.agentId }),
        onDone: {
          target: 'awaitingFirstMessage',
          actions: ['storeContext', 'sendStatusToParent']
        },
        onError: {
          target: 'contextLoadFailed',
          actions: ['setError', 'sendStatusToParent']
        }
      }
    },

    contextLoadFailed: {
      entry: sendParent(({ context }) => ({
        type: 'APPEND_LINES',
        lines: [{
          type: 'error',
          content: context.retryCount < context.maxRetries 
            ? `Failed to load agent context: ${context.error}. Retrying...`
            : `Failed to load agent context after ${context.maxRetries} attempts: ${context.error}`,
          timestamp: Date.now()
        }]
      })),
      always: [
        {
          target: 'loadingContext',
          guard: 'canRetry',
          actions: ['incrementRetry', 'sendStatusToParent']
        },
        {
          target: 'completed',
          actions: sendParent(() => ({
            type: 'APPEND_LINES',
            lines: [{
              type: 'error',
              content: 'Unable to start chat session. Please try again later.',
              timestamp: Date.now()
            }]
          }))
        }
      ],
      after: {
        2000: [
          {
            target: 'loadingContext',
            guard: 'canRetry',
            actions: ['incrementRetry']
          }
        ]
      },
      on: {
        RETRY: {
          target: 'loadingContext',
          actions: ['resetRetry']
        },
        EXIT: 'completed'
      }
    },

    awaitingFirstMessage: {
      entry: sendParent(({ context }) => ({
        type: 'APPEND_LINES',
        lines: [{
          type: 'system',
          content: `Chat session started with ${context.agentName}. Type your message:`,
          timestamp: Date.now()
        }]
      })),
      on: {
        'INPUT.SUBMIT': {
          target: 'processingMessage',
          actions: ['addUserMessage', 'sendStatusToParent']
        },
        END_SESSION: 'confirmingSave',
        EXIT: 'completed'
      }
    },

    processingMessage: {
      invoke: {
        src: 'processMessage',
        input: ({ context, event }) => ({
          message: (event as any).value || (event as any).message,
          messages: context.messages,
          agentContext: context.agentContext,
          historicalData: context.historicalData,
          agentName: context.agentName
        }),
        onDone: {
          target: 'displayingResponse',
          actions: ['addAIResponse']
        },
        onError: {
          target: 'messageFailed',
          actions: ['setError', 'sendStatusToParent']
        }
      }
    },

    displayingResponse: {
      entry: ['sendLinesToParent', 'sendStatusToParent'],
      always: 'chatting'
    },

    chatting: {
      on: {
        'INPUT.SUBMIT': {
          target: 'processingMessage',
          actions: ['addUserMessage', 'sendStatusToParent']
        },
        END_SESSION: 'confirmingSave',
        EXIT: 'completed'
      }
    },

    messageFailed: {
      entry: sendParent(({ context }) => ({
        type: 'APPEND_LINES',
        lines: [{
          type: 'error',
          content: context.retryCount < context.maxRetries
            ? `Message processing failed: ${context.error}. Retrying...`
            : `Message failed after ${context.maxRetries} attempts. Type to try again or END SESSION to exit.`,
          timestamp: Date.now()
        }]
      })),
      always: [
        {
          target: 'processingMessage',
          guard: 'canRetry',
          actions: ['incrementRetry', 'sendStatusToParent']
        }
      ],
      after: {
        2000: [
          {
            target: 'processingMessage',
            guard: 'canRetry',
            actions: ['incrementRetry']
          }
        ]
      },
      on: {
        'INPUT.SUBMIT': {
          target: 'processingMessage',
          actions: ['addUserMessage', 'resetRetry', 'sendStatusToParent']
        },
        RETRY: {
          target: 'processingMessage',
          actions: ['resetRetry']
        },
        END_SESSION: 'confirmingSave',
        EXIT: 'completed'
      }
    },

    confirmingSave: {
      entry: ['setAwaitingConfirmation', 'sendSavePrompt', 'sendStatusToParent'],
      on: {
        'INPUT.SUBMIT': [
          {
            guard: 'isYesInput',
            target: 'summarizingConversation'
          },
          {
            guard: 'isNoInput',
            target: 'completed'
          }
        ],
        CONFIRM_SAVE: 'summarizingConversation',
        CANCEL_SAVE: 'completed',
        EXIT: 'completed'
      }
    },

    summarizingConversation: {
      entry: assign({ statusMessage: 'Generating conversation summary...' }),
      invoke: {
        src: 'generateSummary',
        input: ({ context }) => ({
          currentTranscript: context.currentTranscript,
          messages: context.messages,
          agentId: context.agentId
        }),
        onDone: {
          target: 'savingConversation',
          actions: ['storeConversationSummary', 'sendStatusToParent']
        },
        onError: {
          target: 'saveFailed',
          actions: ['setError', 'sendStatusToParent']
        }
      }
    },

    savingConversation: {
      invoke: {
        src: 'persistConversation',
        input: ({ context }) => ({
          agentId: context.agentId,
          agentName: context.agentName,
          conversationSummary: context.conversationSummary,
          currentTranscript: context.currentTranscript
        }),
        onDone: {
          target: 'completed',
          actions: ['storePersistenceResult', 'sendCompletionToParent']
        },
        onError: {
          target: 'saveFailed',
          actions: ['setError', 'sendStatusToParent']
        }
      }
    },

    saveFailed: {
      entry: sendParent(({ context }) => ({
        type: 'APPEND_LINES',
        lines: [{
          type: 'error',
          content: `Failed to save conversation: ${context.error}`,
          timestamp: Date.now()
        }]
      })),
      on: {
        EXIT: 'completed'
      }
    },

    completed: {
      type: 'final',
      entry: sendParent(() => ({
        type: 'CHAT_COMPLETED'
      }))
    }
  }
});