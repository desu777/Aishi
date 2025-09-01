/**
 * @fileoverview Chat Machine for Terminal XState
 * @description Manages interactive chat sessions between users and their AI agents
 */

import { setup, assign, sendParent, fromPromise } from 'xstate';
import { TerminalLine } from './types';
import { memoryGuards } from './shared/memory.guards';
import { memoryActions } from './shared/memory.actions';
import { contextualTerminalActions } from './shared/terminal.actions';
import { chatActions, chatGuards } from './chat.actions';

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
    // Import actions from chat.actions.ts
    ...chatActions,
    
    // Import shared memory actions
    storeMemoryError: memoryActions.storeMemoryError,
    displayMemoryErrorPrompt: memoryActions.displayMemoryErrorPrompt,
    clearMemoryError: memoryActions.clearMemoryError,
    
    // Import shared terminal actions
    sendStatusToParent: contextualTerminalActions.sendStatusFromContext
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
    // Import guards from chat.actions.ts
    ...chatGuards,
    
    // Import shared memory guards
    isMemoryDownloadError: memoryGuards.isMemoryDownloadError
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
      entry: 'sendContextLoadError',
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
            actions: 'sendUnableToStart'
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
      entry: 'sendChatStartedMessage',
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
      entry: 'sendMessageError',
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
      entry: 'sendSaveError',
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
            actions: 'setCancelledStatus'
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