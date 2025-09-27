// @ts-nocheck
/**
 * @fileoverview Dream Command State Machine
 * @description Main state machine definition for dream workflow
 */

import { setup, assign, sendParent } from 'xstate';
import { defaultAgentData } from '../types/contextTypes';
import { memoryGuards } from './shared/memory.guards';
import { memoryActions } from './shared/memory.actions';
import { storageActions } from './shared/storage.actions';
import { storageGuards } from './shared/storage.guards';
import { contextualTerminalActions } from './shared/terminal.actions';
import { evolutionDreamActions } from './dream.evolution.actions';
import { 
  fetchContextService, 
  buildPromptService, 
  aiAnalysisService 
} from './dreamServices';
import { 
  fileManagementService, 
  storageUploadService, 
  contractUpdateService, 
  dreamPersistenceService 
} from './dreamPersistenceServices';
import type { DreamContext, AIResponse } from '../types/contextTypes';
import type { TerminalLine } from './types';

// Debug logging
const debugLog = (message: string, data?: any) => {
  if (process.env.NEXT_PUBLIC_XSTATE_TERMINAL === 'true' || process.env.NEXT_PUBLIC_DREAM_TEST === 'true') {
    console.log(`[DreamMachine] ${message}`, data || '');
  }
};

// Dream machine context
export interface DreamMachineContext {
  // Agent data
  tokenId: number | null;
  agentName: string | null;
  
  // Dream flow data
  dreamInput: string;
  dreamContext: DreamContext | null;
  dreamPrompt: string | null;
  aiResponse: AIResponse | null;
  
  // Persistence data
  persistenceResult: any | null;
  storageRootHash: string | null;
  contractTxHash: string | null;
  
  // Status and errors
  statusMessage: string;
  errorMessage: string | null;
  
  // Confirmation state
  awaitingConfirmation: boolean;
  
  // AI configuration
  modelId?: string;
  walletAddress?: string;

  // Voice tracking
  wasVoiceInput: boolean;
  
  // Error handling and retry state
  retryCount: number;
  maxRetries: number;
  memoryDownloadError: string | null;
  storageUploadError: string | null;
  continueWithoutMemory: boolean;
}

// Dream machine events
export type DreamEvent =
  | { type: 'START'; modelId?: string; walletAddress?: string; tokenId?: number; agentName?: string; wasVoiceInput?: boolean }
  | { type: 'SUBMIT_DREAM'; dreamText: string; wasVoiceInput?: boolean }
  | { type: 'CONFIRM_SAVE' }
  | { type: 'CANCEL_SAVE' }
  | { type: 'RETRY' }
  | { type: 'RESET' }
  | { type: 'CONTINUE_WITHOUT_MEMORY' }
  | { type: 'RETRY_UPLOAD' }
  | { type: 'SKIP_UPLOAD' }
  | { type: 'CANCEL_DREAM' }
  // XState actor completion events
  | { type: 'xstate.done.actor.fetchContext'; output: DreamContext }
  | { type: 'xstate.done.actor.buildPrompt'; output: string }
  | { type: 'xstate.done.actor.analyzeWithAI'; output: AIResponse }
  | { type: 'xstate.done.actor.persistDream'; output: { persistenceResult: any; rootHash: string; txHash: string; isEvolutionDream: boolean } }
  | { type: 'xstate.done.actor.manageFile'; output: any }
  | { type: 'xstate.done.actor.uploadToStorage'; output: { rootHash: string } }
  | { type: 'xstate.done.actor.updateContract'; output: { txHash: string; isEvolutionDream: boolean } }
  // XState actor error events
  | { type: 'xstate.error.actor.fetchContext'; error: { message?: string } }
  | { type: 'xstate.error.actor.buildPrompt'; error: { message?: string } }
  | { type: 'xstate.error.actor.analyzeWithAI'; error: { message?: string } }
  | { type: 'xstate.error.actor.persistDream'; error: { message?: string } }
  | { type: 'xstate.error.actor.manageFile'; error: { message?: string } }
  | { type: 'xstate.error.actor.uploadToStorage'; error: { message?: string } }
  | { type: 'xstate.error.actor.updateContract'; error: { message?: string } }
  // General error event (required by XState v5)
  | { type: 'error'; error: { message?: string } };

// Initial context
const initialContext: DreamMachineContext = {
  tokenId: null,
  agentName: null,
  dreamInput: '',
  dreamContext: null,
  dreamPrompt: null,
  aiResponse: null,
  persistenceResult: null,
  storageRootHash: null,
  contractTxHash: null,
  statusMessage: '',
  errorMessage: null,
  awaitingConfirmation: false,
  modelId: undefined,
  walletAddress: undefined,
  wasVoiceInput: false,
  retryCount: 0,
  maxRetries: 3,
  memoryDownloadError: null,
  storageUploadError: null,
  continueWithoutMemory: false
};

// Main Dream State Machine
export const dreamMachine = setup({
  types: {} as {
    context: DreamMachineContext;
    events: DreamEvent;
  },
  actors: {
    fetchContext: fetchContextService,
    buildPrompt: buildPromptService,
    aiAnalysis: aiAnalysisService,
    dreamPersistence: dreamPersistenceService,
    fileManagement: fileManagementService,
    storageUpload: storageUploadService,
    contractUpdate: contractUpdateService
  },
  actions: {
    // Initialize dream session
    initializeDream: assign({
      tokenId: ({ event }) => {
        if (event.type === 'START') {
          debugLog('[INIT] Dream session starting', {
            tokenId: event.tokenId,
            agentName: event.agentName,
            wasVoiceInput: event.wasVoiceInput
          });
          return event.tokenId ? event.tokenId : defaultAgentData.tokenId;
        }
        return defaultAgentData.tokenId;
      },
      agentName: ({ event }) => event.type === 'START' && event.agentName ? event.agentName : '',
      statusMessage: 'Describe your dream...',
      errorMessage: null,
      modelId: ({ event }) => event.type === 'START' ? event.modelId : undefined,
      walletAddress: ({ event }) => event.type === 'START' ? event.walletAddress : undefined,
      wasVoiceInput: ({ event }) => event.type === 'START' ? event.wasVoiceInput || false : false
    }),
    
    // Send dream instruction to parent
    sendDreamInstruction: sendParent(() => ({
      type: 'APPEND_LINES',
      lines: [{
        type: 'info',
        content: '~ Now u can describe your dream! Add your sleep quality review 1-10 if u want agent to know that!',
        timestamp: Date.now()
      }]
    })),
    
    // Store dream input
    storeDreamInput: assign({
      dreamInput: ({ event, context }) => {
        if (event.type === 'SUBMIT_DREAM') {
          debugLog('[INPUT] Dream text submitted', {
            textLength: event.dreamText.length,
            wasVoiceInput: event.wasVoiceInput // Log the incoming voice flag
          });
          return event.dreamText;
        }
        return '';
      },
      wasVoiceInput: ({ event }) => {
        // Preserve wasVoiceInput from the SUBMIT_DREAM event
        if (event.type === 'SUBMIT_DREAM') {
          debugLog('[INPUT] Setting wasVoiceInput from event', {
            wasVoiceInput: event.wasVoiceInput
          });
          return event.wasVoiceInput || false;
        }
        return false;
      },
      statusMessage: ({ context }) => `${context.agentName} is thinking . . .`
    }),
    
    // Store context and update agent name
    storeContext: assign({
      dreamContext: ({ event }) => {
        return (event as any).output;
      },
      agentName: ({ event }) => {
        return ((event as any).output)?.agentProfile?.name || 'Agent';
      },
      statusMessage: 'Building dream analysis prompt...'
    }),
    
    // Store prompt
    storePrompt: assign({
      dreamPrompt: ({ event }) => {
        return (event as any).output;
      },
      statusMessage: ({ context }) => `${context.dreamContext?.agentProfile?.name || 'Agent'} is thinking`
    }),
    
    // Store AI response
    storeAIResponse: assign({
      aiResponse: ({ event }) => {
        return (event as any).output;
      },
      // Keep thinking status - will be reset later after display
      statusMessage: ({ context }) => context.statusMessage,
      awaitingConfirmation: true
    }),
    
    // Store persistence result with evolution awareness
    storePersistenceResult: evolutionDreamActions.storePersistenceWithEvolution,
    
    // Mark as completed
    markCompleted: assign({
      statusMessage: ({ context }) => `${context.dreamContext?.agentProfile?.name || 'Agent'} has learned from your dream!`,
      awaitingConfirmation: false
    }),
    
    // Store error
    storeError: assign({
      errorMessage: ({ event }) => {
        if ('error' in event) {
          return event.error instanceof Error ? event.error.message : String(event.error);
        }
        return 'An unknown error occurred';
      },
      statusMessage: null, // Clear status to allow new input
      awaitingConfirmation: false // Reset confirmation state
    }),
    
    // Reset confirmation
    resetConfirmation: assign({
      awaitingConfirmation: false,
      statusMessage: 'Dream not saved.'
    }),
    
    // Send lines to parent with evolution awareness
    sendLinesToParent: evolutionDreamActions.sendDreamAnalysisWithEvolution,
    
    // Import shared terminal actions
    sendStatusToParent: contextualTerminalActions.sendStatusFromContext,
    sendErrorToParent: contextualTerminalActions.sendErrorFromContext,
    
    // Import shared memory actions
    storeMemoryError: memoryActions.storeMemoryError,
    displayMemoryErrorPrompt: memoryActions.displayMemoryErrorPrompt,
    clearMemoryHash: memoryActions.clearMemoryError,
    
    // Import shared storage actions
    storeUploadError: storageActions.storeUploadError,
    displayUploadErrorPrompt: storageActions.displayUploadErrorPrompt,
    incrementRetryCount: storageActions.incrementRetryCount,
    storeDreamFileData: storageActions.storeDreamFileData,
    storeStorageResult: storageActions.storeStorageResult
  },
  guards: {
    // Import shared memory guards
    isMemoryDownloadError: memoryGuards.isMemoryDownloadError,
    
    // Import shared storage guards
    hasValidRootHash: storageGuards.hasValidRootHash,
    canRetry: storageGuards.canRetry,
    hasExceededMaxRetries: storageGuards.hasExceededMaxRetries,
    shouldRetry: storageGuards.shouldRetry,
    shouldAbortAfterMaxRetries: storageGuards.shouldAbortAfterMaxRetries,
    isYesInput: storageGuards.isYesInput,
    isNoInput: storageGuards.isNoInput
  }
}).createMachine({
  id: 'dream',
  initial: 'idle',
  context: initialContext,
  
  states: {
    idle: {
      on: {
        START: {
          target: 'awaitingDreamInput',
          actions: ['initializeDream', 'sendDreamInstruction', 'sendStatusToParent']
        }
      }
    },
    
    awaitingDreamInput: {
      on: {
        SUBMIT_DREAM: {
          target: 'processingDream',
          actions: ['storeDreamInput', 'sendStatusToParent']
        }
      }
    },
    
    processingDream: {
      initial: 'fetchingContext',
      states: {
        fetchingContext: {
          invoke: {
            src: 'fetchContext',
            input: ({ context }) => ({ 
              dreamText: context.dreamInput,
              continueWithoutMemory: context.continueWithoutMemory,
              tokenId: context.tokenId || undefined,
              agentName: context.agentName || undefined
            }),
            onDone: {
              target: 'buildingPrompt',
              actions: ['storeContext', 'sendStatusToParent']
            },
            onError: [
              {
                target: '#dream.memoryDownloadFailed',
                guard: 'isMemoryDownloadError',
                actions: ['storeMemoryError']
              },
              {
                target: '#dream.error',
                actions: ['storeError', 'sendErrorToParent']
              }
            ]
          }
        },
        
        buildingPrompt: {
          invoke: {
            src: 'buildPrompt',
            input: ({ context }) => ({ context: context.dreamContext! }),
            onDone: {
              target: 'analyzingWithAI',
              actions: ['storePrompt', 'sendStatusToParent']
            },
            onError: {
              target: '#dream.error',
              actions: ['storeError', 'sendErrorToParent'] as const
            }
          }
        },
        
        analyzingWithAI: {
          invoke: {
            src: 'aiAnalysis',
            input: ({ context }) => ({ 
              prompt: context.dreamPrompt!,
              dreamCount: context.dreamContext?.agentProfile?.dreamCount || 0,
              modelId: context.modelId,
              walletAddress: context.walletAddress
            }),
            onDone: {
              target: 'displayingAnalysis',
              actions: ['storeAIResponse', 'sendStatusToParent']
            },
            onError: {
              target: '#dream.error',
              actions: ['storeError', 'sendErrorToParent'] as const
            }
          }
        },
        
        displayingAnalysis: {
          entry: 'sendLinesToParent' as const,
          always: '#dream.awaitingSaveConfirmation'
        }
      }
    },
    
    awaitingSaveConfirmation: {
      entry: [
        // Reset thinking status after AI response is displayed
        sendParent({ type: 'UPDATE_STATUS', status: 'Waiting for your response...' })
      ],
      on: {
        CONFIRM_SAVE: {
          target: 'savingDream',
          actions: 'sendStatusToParent'
        },
        CANCEL_SAVE: {
          target: 'completed',
          actions: ['resetConfirmation', 'sendStatusToParent']
        }
      }
    },
    
    savingDream: {
      initial: 'fileManagement',
      states: {
        fileManagement: {
          entry: [
            assign({ statusMessage: ({ context }) => `${context.dreamContext?.agentProfile?.name || 'Agent'} is learning` }),
            'sendStatusToParent'
          ] as const,
          invoke: {
            src: 'fileManagement',
            input: ({ context }) => {
              const memoryData = (context.dreamContext as any)?.memoryData;
              const currentRootHash = memoryData?.currentDreamDailyHash;
              
              return {
                aiResponse: context.aiResponse!,
                agentName: context.dreamContext?.agentProfile?.name || 'Agent',
                currentRootHash: currentRootHash
              };
            },
            onDone: {
              target: 'storageUpload',
              actions: assign({
                persistenceResult: ({ event }) => {
                  return ({ fileData: (event as any).output });
                }
              })
            },
            onError: {
              target: '#dream.error',
              actions: ['storeError', 'sendErrorToParent'] as const
            }
          }
        },
        
        storageUpload: {
          entry: [
            assign({ statusMessage: ({ context }) => `${context.dreamContext?.agentProfile?.name || 'Agent'} is learning` }),
            'sendStatusToParent'
          ] as const,
          invoke: {
            src: 'storageUpload',
            input: ({ context }) => {
              const fileData = (context.persistenceResult as any)?.fileData;
              return {
                data: fileData?.data || [],
                fileName: fileData?.fileName || 'unknown'
              };
            },
            onDone: [
              {
                target: 'contractUpdate',
                guard: 'hasValidRootHash',
                actions: assign({
                  storageRootHash: ({ event }) => {
                    return (event as any).output.rootHash;
                  },
                  persistenceResult: ({ context, event }) => ({
                    ...context.persistenceResult,
                    storageData: (event as any).output
                  })
                })
              },
              {
                target: '#dream.storageUploadFailed',
                actions: ['storeUploadError']
              }
            ],
            onError: {
              target: '#dream.storageUploadFailed',
              actions: ['storeUploadError']
            }
          }
        },
        
        contractUpdate: {
          entry: [
            assign({ statusMessage: ({ context }) => `${context.dreamContext?.agentProfile?.name || 'Agent'} is evolving` }),
            'sendStatusToParent'
          ],
          invoke: {
            src: 'contractUpdate',
            input: ({ context }) => ({
              tokenId: context.tokenId!,
              rootHash: context.storageRootHash!,
              personalityImpact: context.aiResponse?.personalityImpact,
              dreamCount: context.dreamContext?.agentProfile?.dreamCount || 0
            }),
            onDone: {
              target: '#dream.completed',
              actions: [
                assign({
                  contractTxHash: ({ event }) => {
                    return (event as any).output.txHash;
                  },
                  persistenceResult: ({ context, event }) => ({
                    ...context.persistenceResult,
                    contractData: (event as any).output,
                    isEvolutionDream: (event as any).output.isEvolutionDream
                  })
                }),
                'markCompleted',
                'sendStatusToParent'
              ] as const
            },
            onError: {
              target: '#dream.error',
              actions: ['storeError', 'sendErrorToParent'] as const
            }
          }
        }
      }
    },
    
    memoryDownloadFailed: {
      entry: 'displayMemoryErrorPrompt' as const,
      on: {
        CONFIRM_SAVE: {
          target: 'processingDream.fetchingContext',
          actions: 'clearMemoryHash'
        },
        CANCEL_SAVE: {
          target: 'completed',
          actions: [
            assign({ statusMessage: 'Dream cancelled.' }),
            'sendStatusToParent'
          ] as const
        }
      }
    },
    
    storageUploadFailed: {
      entry: 'displayUploadErrorPrompt' as const,
      on: {
        CONFIRM_SAVE: [
          {
            target: 'savingDream.storageUpload',
            guard: 'shouldRetry',
            actions: 'incrementRetryCount'
          },
          {
            target: 'completed',
            guard: 'shouldAbortAfterMaxRetries',
            actions: storageActions.setMaxRetriesExceededStatus as any
          },
          {
            target: 'completed',
            guard: 'isNoInput',
            actions: storageActions.setUploadCancelledStatus as any
          }
        ],
        CANCEL_SAVE: {
          target: 'completed',
          actions: storageActions.setUploadCancelledStatus as any
        }
      }
    },
    
    completed: {
      type: 'final',
      entry: [
        () => debugLog('Dream workflow completed'),
        sendParent({ type: 'DREAM.COMPLETE' })
      ]
    },
    
    error: {
      // Automatically transition to completed after showing error
      entry: sendParent(() => ({
        type: 'UPDATE_STATUS',
        status: null // Clear status for new input
      })),
      always: {
        target: 'completed' // Immediately go to completed to exit workflow
      }
    }
  },
  
  on: {
    RESET: {
      target: '#dream.idle',
      actions: assign(initialContext)
    }
  }
});