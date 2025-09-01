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
  modelId: string;
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
  // Memory handling (like dream)
  memoryDownloadError: string | null;
  continueWithoutMemory: boolean;
}

export type ChatEvent =
  | { type: 'START_CHAT'; agentId: number; agentName: string; modelId: string }
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
  modelId: 'auto',
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
  lastError: null,
  memoryDownloadError: null,
  continueWithoutMemory: false
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
      modelId: ({ event }) => (event as any).modelId || 'auto',
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
    sendLinesToParent: sendParent(({ context }) => {
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
    }),

    // Memory error handling (like dream)
    storeMemoryError: assign({
      memoryDownloadError: ({ event }) => {
        if ('error' in event) {
          return event.error instanceof Error ? event.error.message : String(event.error);
        }
        return 'Failed to access memory from 0G Storage';
      },
      statusMessage: 'Memory download failed'
    }),

    displayMemoryErrorPrompt: sendParent(({ context }) => {
      const agentName = context.agentName || `Agent #${context.agentId}`;
      return {
        type: 'APPEND_LINES',
        lines: [{
          type: 'warning',
          content: `${agentName} can't access previous memory from 0G Storage. Check nodes status.`,
          timestamp: Date.now()
        }, {
          type: 'system',
          content: `Do u wanna continue? Agent won't remember previous conversations and dreams. Type y/n`,
          timestamp: Date.now() + 1
        }]
      };
    }),

    clearMemoryError: assign({
      continueWithoutMemory: true,
      memoryDownloadError: null
    })
  },
  actors: {
    // Load full agent context
    loadContext: fromPromise(async ({ input }: { input: { agentId: number; continueWithoutMemory?: boolean } }) => {
      debugLog('Loading full agent context', { 
        agentId: input.agentId,
        continueWithoutMemory: input.continueWithoutMemory || false
      });
      
      // Dynamic import to avoid circular dependencies
      const { fetchChatContext } = await import('./chatServices');
      const contextData = await fetchChatContext(input.agentId, input.continueWithoutMemory);
      
      debugLog('Context loaded successfully', {
        hasAgentData: !!contextData.agentContext,
        hasHistoricalData: !!contextData.historicalData
      });
      
      return contextData;
    }),

    // Process user message with AI
    processMessage: fromPromise(async ({ input }: { 
      input: {
        message: string;
        messages: ChatMessage[];
        agentContext: any;
        historicalData: any;
        agentName: string;
        modelId: string;
      }
    }) => {
      debugLog('Processing user message', {
        messageLength: input.message?.length,
        isFirstMessage: input.messages.length === 1,
        modelId: input.modelId
      });

      // Dynamic import to avoid circular dependencies
      const { sendChatMessage } = await import('./chatServices');
      const response = await sendChatMessage(
        input.message,
        input.messages,
        input.agentContext,
        input.historicalData,
        input.agentName,
        input.modelId
      );

      debugLog('AI response received', {
        responseLength: response.response?.length
      });

      return response;
    }),

    // Generate conversation summary
    generateSummary: fromPromise(async ({ input }: { 
      input: {
        currentTranscript: string;
        messages: ChatMessage[];
        agentId: number;
        modelId: string;
      }
    }) => {
      debugLog('Generating conversation summary', {
        messageCount: input.messages.length,
        transcriptLength: input.currentTranscript.length,
        modelId: input.modelId
      });

      // Dynamic import to avoid circular dependencies
      const { generateConversationSummary } = await import('./chatServices');
      const summary = await generateConversationSummary(
        input.currentTranscript,
        input.messages,
        input.agentId,
        input.modelId
      );

      debugLog('Summary generated', {
        hasSummary: !!summary.summary
      });

      return summary;
    }),

    // Persist conversation
    persistConversation: fromPromise(async ({ input }: { 
      input: {
        agentId: number;
        agentName: string;
        conversationSummary: any;
        currentTranscript: string;
      }
    }) => {
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
    },
    // Check if memory download error occurred (like dream)
    isMemoryDownloadError: ({ event }: { event: any }) => {
      if ('error' in event && event.error) {
        const errorMsg = event.error instanceof Error ? event.error.message : String(event.error);
        // Enhanced checks for various memory error patterns
        return errorMsg.includes('File not found') || 
               errorMsg.includes('code 101') ||
               errorMsg.includes('Download failed') ||
               errorMsg.includes('Failed to load') ||
               errorMsg.includes('does not exist in storage') ||
               errorMsg.includes('0G Storage') ||
               errorMsg.includes('root hash');
      }
      return false;
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
        input: ({ context }) => ({ 
          agentId: context.agentId,
          continueWithoutMemory: context.continueWithoutMemory
        }),
        onDone: {
          target: 'awaitingFirstMessage',
          actions: ['storeContext', 'sendStatusToParent']
        },
        onError: [
          {
            target: 'memoryDownloadFailed',
            guard: 'isMemoryDownloadError',
            actions: ['storeMemoryError']
          },
          {
            target: 'contextLoadFailed',
            actions: ['setError', 'sendStatusToParent']
          }
        ]
      }
    },

    contextLoadFailed: {
      entry: sendParent(({ context }) => ({
        type: 'APPEND_LINES',
        lines: [{
          type: 'error',
          content: context.retryCount < context.maxRetries 
            ? `Failed to load agent context: ${context.error}. Retrying in 2 seconds...`
            : `Failed to load agent context after ${context.maxRetries} attempts: ${context.error}`,
          timestamp: Date.now()
        }]
      })),
      // Removed 'always' transition to prevent synchronous infinite loop
      after: {
        2000: [
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
      entry: [
        assign({ 
          statusMessage: ({ context }) => `${context.agentName} is thinking...` 
        }),
        'sendStatusToParent'
      ],
      invoke: {
        src: 'processMessage',
        input: ({ context, event }) => ({
          message: (event as any).value || (event as any).message,
          messages: context.messages,
          agentContext: context.agentContext,
          historicalData: context.historicalData,
          agentName: context.agentName,
          modelId: context.modelId
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
            ? `Message processing failed: ${context.error}. Retrying in 2 seconds...`
            : `Message failed after ${context.maxRetries} attempts. Type to try again or END SESSION to exit.`,
          timestamp: Date.now()
        }]
      })),
      // Removed 'always' transition to prevent synchronous infinite loop
      after: {
        2000: [
          {
            target: 'processingMessage',
            guard: 'canRetry',
            actions: ['incrementRetry', 'sendStatusToParent']
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
      entry: [
        assign({ 
          statusMessage: ({ context }) => `${context.agentName} is learning...` 
        }),
        'sendStatusToParent'
      ],
      invoke: {
        src: 'generateSummary',
        input: ({ context }) => ({
          currentTranscript: context.currentTranscript,
          messages: context.messages,
          agentId: context.agentId,
          modelId: context.modelId
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
      entry: [
        assign({ 
          statusMessage: ({ context }) => `${context.agentName} is evolving...` 
        }),
        'sendStatusToParent'
      ],
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

    memoryDownloadFailed: {
      entry: 'displayMemoryErrorPrompt',
      on: {
        'INPUT.SUBMIT': [
          {
            guard: 'isYesInput',
            target: 'loadingContext',
            actions: 'clearMemoryError'
          },
          {
            guard: 'isNoInput',
            target: 'completed',
            actions: assign({ statusMessage: 'Chat cancelled.' })
          }
        ],
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