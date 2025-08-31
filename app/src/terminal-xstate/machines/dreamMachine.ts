/**
 * @fileoverview Dream Command State Machine
 * @description Main state machine definition for dream workflow
 */

import { setup, assign, sendParent } from 'xstate';
import { defaultAgentData } from '../types/contextTypes';
import { dreamActions, dreamGuards } from './dreamActions';
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
  
  // Error handling and retry state
  retryCount: number;
  maxRetries: number;
  memoryDownloadError: string | null;
  storageUploadError: string | null;
  continueWithoutMemory: boolean;
}

// Dream machine events
export type DreamEvent =
  | { type: 'START'; modelId?: string; walletAddress?: string; tokenId?: number; agentName?: string }
  | { type: 'SUBMIT_DREAM'; dreamText: string }
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
  | { type: 'xstate.error.actor.updateContract'; error: { message?: string } };

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
  actions: dreamActions,
  guards: dreamGuards
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
              actions: ['storeError', 'sendErrorToParent']
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
              actions: ['storeError', 'sendErrorToParent']
            }
          }
        },
        
        displayingAnalysis: {
          entry: 'sendLinesToParent',
          always: '#dream.awaitingSaveConfirmation'
        }
      }
    },
    
    awaitingSaveConfirmation: {
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
          ],
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
              actions: ['storeError', 'sendErrorToParent']
            }
          }
        },
        
        storageUpload: {
          entry: [
            assign({ statusMessage: ({ context }) => `${context.dreamContext?.agentProfile?.name || 'Agent'} is learning` }),
            'sendStatusToParent'
          ],
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
              ]
            },
            onError: {
              target: '#dream.error',
              actions: ['storeError', 'sendErrorToParent']
            }
          }
        }
      }
    },
    
    memoryDownloadFailed: {
      entry: 'displayMemoryErrorPrompt',
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
          ]
        }
      }
    },
    
    storageUploadFailed: {
      entry: 'displayUploadErrorPrompt',
      on: {
        CONFIRM_SAVE: [
          {
            target: 'savingDream.storageUpload',
            guard: 'canRetry',
            actions: 'incrementRetryCount'
          },
          {
            target: 'completed',
            actions: [
              assign({ statusMessage: 'Maximum retry attempts reached.' }),
              'sendStatusToParent'
            ]
          }
        ],
        CANCEL_SAVE: {
          target: 'completed',
          actions: [
            assign({ statusMessage: 'Dream saved locally but not uploaded to storage.' }),
            'sendStatusToParent'
          ]
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
      on: {
        RETRY: '#dream.idle',
        RESET: '#dream.idle'
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