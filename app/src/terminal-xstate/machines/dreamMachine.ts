/**
 * @fileoverview Dream Command State Machine
 * @description Manages the complete dream analysis workflow using XState
 */

import { setup, assign, fromPromise, sendParent } from 'xstate';
import { 
  mockAgentData,
  buildMockDreamContext,
  buildMockPrompt,
  sendMockDreamAnalysis,
  mockUploadToStorage,
  mockDownloadFromStorage,
  mockUpdateContract,
  MockDreamContext,
  MockAIResponse
} from '../mocks/dreamMocks';
import { XStateStorageService } from '../services/xstateStorage';
import { TerminalLine } from './types';

// Debug logging
const debugLog = (message: string, data?: any) => {
  if (process.env.NEXT_PUBLIC_XSTATE_TERMINAL === 'true' || process.env.NEXT_PUBLIC_DREAM_TEST === 'true') {
    console.log(`[DreamMachine] ${message}`, data || '');
  }
};

// Dream machine context
export interface DreamContext {
  // Agent data
  tokenId: number | null;
  agentName: string | null;
  
  // Dream flow data
  dreamInput: string;
  dreamContext: MockDreamContext | null;
  dreamPrompt: string | null;
  aiResponse: MockAIResponse | null;
  
  // Storage data
  storageRootHash: string | null;
  
  // Status and errors
  statusMessage: string;
  errorMessage: string | null;
  
  // Confirmation state
  awaitingConfirmation: boolean;
}

// Dream machine events
export type DreamEvent =
  | { type: 'START' }
  | { type: 'SUBMIT_DREAM'; dreamText: string }
  | { type: 'CONFIRM_SAVE' }
  | { type: 'CANCEL_SAVE' }
  | { type: 'RETRY' }
  | { type: 'RESET' };

// Initial context
const initialContext: DreamContext = {
  tokenId: null,
  agentName: null,
  dreamInput: '',
  dreamContext: null,
  dreamPrompt: null,
  aiResponse: null,
  storageRootHash: null,
  statusMessage: '',
  errorMessage: null,
  awaitingConfirmation: false
};

// Service: Fetch dream context
const fetchContextService = fromPromise(async ({ input }: { input: { dreamText: string } }) => {
  debugLog('Fetching dream context', { dreamLength: input.dreamText.length });
  
  // In real implementation, this would fetch from blockchain
  const context = await buildMockDreamContext(
    mockAgentData.tokenId,
    mockAgentData,
    input.dreamText
  );
  
  debugLog('Context built successfully', { 
    agentName: context.agentProfile.name,
    memoryDepth: context.memoryAccess.memoryDepth 
  });
  
  return context;
});

// Service: Build dream prompt
const buildPromptService = fromPromise(async ({ input }: { input: { context: MockDreamContext } }) => {
  debugLog('Building dream prompt');
  
  // In real implementation, this would use language detection and complex prompt building
  const prompt = buildMockPrompt(input.context);
  
  debugLog('Prompt built', { promptLength: prompt.length });
  
  return prompt;
});

// Service: Send to AI for analysis
const aiAnalysisService = fromPromise(async ({ input }: { input: { prompt: string; dreamCount: number } }) => {
  debugLog('Sending to AI for analysis');
  
  const isEvolution = (input.dreamCount + 1) % 5 === 0;
  const response = await sendMockDreamAnalysis(input.prompt, isEvolution);
  
  debugLog('AI analysis complete', { 
    hasPersonalityImpact: !!response.personalityImpact,
    dreamId: response.dreamData.id 
  });
  
  return response;
});

// Service: Upload to storage
const storageUploadService = fromPromise(async ({ input }: { input: { aiResponse: MockAIResponse } }) => {
  debugLog('Uploading dream to storage');
  
  // In real implementation, would download existing, append, and upload
  const existingDreams = await mockDownloadFromStorage('mock-hash');
  const updatedDreams = [input.aiResponse.dreamData, ...(existingDreams || [])];
  
  const result = await mockUploadToStorage(updatedDreams);
  
  debugLog('Storage upload complete', { rootHash: result.rootHash });
  
  return result.rootHash;
});

// Service: Update contract
const contractUpdateService = fromPromise(async ({ 
  input 
}: { 
  input: { tokenId: number; rootHash: string; personalityImpact: any } 
}) => {
  debugLog('Updating contract', { tokenId: input.tokenId, hasImpact: !!input.personalityImpact });
  
  const result = await mockUpdateContract(
    input.tokenId,
    input.rootHash,
    input.personalityImpact
  );
  
  debugLog('Contract updated', { txHash: result.txHash });
  
  return result;
});

// Dream state machine
export const dreamMachine = setup({
  types: {} as {
    context: DreamContext;
    events: DreamEvent;
  },
  actors: {
    fetchContext: fetchContextService,
    buildPrompt: buildPromptService,
    aiAnalysis: aiAnalysisService,
    storageUpload: storageUploadService,
    contractUpdate: contractUpdateService
  },
  actions: {
    // Initialize dream session
    initializeDream: assign({
      tokenId: mockAgentData.tokenId,
      agentName: mockAgentData.agentName,
      statusMessage: 'Describe your dream...', // This will be used for placeholder
      errorMessage: null
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
      dreamInput: ({ event }) => {
        if (event.type === 'SUBMIT_DREAM') {
          return event.dreamText;
        }
        return '';
      },
      statusMessage: ({ context }) => `${context.agentName} is thinking . . .`
    }),
    
    // Store context
    storeContext: assign({
      dreamContext: ({ event }) => event.output as MockDreamContext,
      statusMessage: 'Building dream analysis prompt...'
    }),
    
    // Store prompt
    storePrompt: assign({
      dreamPrompt: ({ event }) => event.output as string,
      statusMessage: 'Analyzing dream with AI...'
    }),
    
    // Store AI response
    storeAIResponse: assign({
      aiResponse: ({ event }) => event.output as MockAIResponse,
      statusMessage: 'Type y/n to confirm',
      awaitingConfirmation: true
    }),
    
    // Store upload result
    storeUploadResult: assign({
      storageRootHash: ({ event }) => event.output as string,
      statusMessage: 'Updating blockchain...'
    }),
    
    // Mark as completed
    markCompleted: assign({
      statusMessage: ({ context }) => `${context.agentName} has learned from your dream!`,
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
      statusMessage: 'Dream analysis failed'
    }),
    
    // Reset confirmation
    resetConfirmation: assign({
      awaitingConfirmation: false,
      statusMessage: 'Dream not saved.'
    }),
    
    // Send lines to parent (terminal)
    sendLinesToParent: sendParent(({ context }) => {
      const lines: TerminalLine[] = [];
      const timestamp = Date.now();
      
      if (context.aiResponse) {
        // Display AI analysis
        lines.push({
          type: 'info',
          content: `${context.agentName}: ${context.aiResponse.fullAnalysis}`,
          timestamp
        });
        
        // Ask for confirmation
        lines.push({
          type: 'system',
          content: `Do u wanna train ${context.agentName} with your dream? Type y/n`,
          timestamp: timestamp + 1
        });
      }
      
      return { type: 'APPEND_LINES', lines };
    }),
    
    // Send status to parent
    sendStatusToParent: sendParent(({ context }) => ({
      type: 'UPDATE_STATUS', 
      status: context.statusMessage 
    })),
    
    // Send error to parent
    sendErrorToParent: sendParent(({ context }) => {
      const errorLine: TerminalLine = {
        type: 'error',
        content: context.errorMessage || 'Unknown error occurred',
        timestamp: Date.now()
      };
      return { type: 'APPEND_LINES', lines: [errorLine] };
    })
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
            input: ({ context }) => ({ dreamText: context.dreamInput }),
            onDone: {
              target: 'buildingPrompt',
              actions: ['storeContext', 'sendStatusToParent']
            },
            onError: {
              target: '#dream.error',
              actions: ['storeError', 'sendErrorToParent']
            }
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
              dreamCount: mockAgentData.dreamCount 
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
      initial: 'uploadingToStorage',
      states: {
        uploadingToStorage: {
          entry: assign({ statusMessage: 'Saving dream to storage...' }),
          invoke: {
            src: 'storageUpload',
            input: ({ context }) => ({ aiResponse: context.aiResponse! }),
            onDone: {
              target: 'updatingContract',
              actions: ['storeUploadResult', 'sendStatusToParent']
            },
            onError: {
              target: '#dream.error',
              actions: ['storeError', 'sendErrorToParent']
            }
          }
        },
        
        updatingContract: {
          invoke: {
            src: 'contractUpdate',
            input: ({ context }) => ({
              tokenId: context.tokenId!,
              rootHash: context.storageRootHash!,
              personalityImpact: context.aiResponse?.personalityImpact || null
            }),
            onDone: {
              target: '#dream.completed',
              actions: ['markCompleted', 'sendStatusToParent']
            },
            onError: {
              target: '#dream.error',
              actions: ['storeError', 'sendErrorToParent']
            }
          }
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