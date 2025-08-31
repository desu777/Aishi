/**
 * @fileoverview Dream Machine Actions
 * @description All actions for the dream state machine
 */

import { assign, sendParent, type ActionFunction } from 'xstate';
import { DreamMachineContext, DreamEvent } from './dreamMachine';
import { defaultAgentData } from '../types/contextTypes';
import { TerminalLine } from './types';

// Debug logging
const debugLog = (message: string, data?: any) => {
  if (process.env.NEXT_PUBLIC_XSTATE_TERMINAL === 'true' || process.env.NEXT_PUBLIC_DREAM_TEST === 'true') {
    console.log(`[DreamMachine] ${message}`, data || '');
  }
};

export const dreamActions = {
  // Initialize dream session
  initializeDream: assign({
    tokenId: ({ event }) => event.type === 'START' && event.tokenId ? event.tokenId : defaultAgentData.tokenId,
    agentName: ({ event }) => event.type === 'START' && event.agentName ? event.agentName : '',
    statusMessage: 'Describe your dream...', // This will be used for placeholder
    errorMessage: null,
    modelId: ({ event }) => event.type === 'START' ? event.modelId : undefined,
    walletAddress: ({ event }) => event.type === 'START' ? event.walletAddress : undefined
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
      // buildPromptService now returns a string directly
      return (event as any).output;
    },
    statusMessage: ({ context }) => `${context.dreamContext?.agentProfile?.name || 'Agent'} is thinking`
  }),
  
  // Store AI response
  storeAIResponse: assign({
    aiResponse: ({ event }) => {
      return (event as any).output;
    },
    statusMessage: 'Waiting for your response...',
    awaitingConfirmation: true
  }),
  
  // Store persistence result
  storePersistenceResult: assign({
    persistenceResult: ({ event }) => {
      return (event as any).output.persistenceResult;
    },
    storageRootHash: ({ event }) => {
      return (event as any).output.rootHash;
    },
    contractTxHash: ({ event }) => {
      return (event as any).output.txHash;
    },
    statusMessage: ({ event }) => {
      const output = (event as any).output;
      return output.isEvolutionDream ? 
        'Evolution dream persisted! Agent has evolved.' :
        'Dream persisted successfully!';
    }
  }),
  
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
      // Display AI analysis with formatted agent name
      lines.push({
        type: 'info',
        content: `~ ${context.agentName} : ${context.aiResponse.fullAnalysis}`,
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
  }),
  
  // Memory download error handling
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
    // Try multiple sources for agent name
    const agentName = context.agentName || 
                     context.dreamContext?.agentProfile?.name || 
                     'Your agent';
    
    return {
      type: 'APPEND_LINES',
      lines: [{
        type: 'warning',
        content: `*${agentName}* can't access previous memory from 0G Storage.`,
        timestamp: Date.now()
      }, {
        type: 'system',
        content: `Do u wanna continue? Agent won't remember previous dreams. Type y/n`,
        timestamp: Date.now() + 1
      }]
    };
  }),
  
  clearMemoryHash: assign({
    continueWithoutMemory: true,
    memoryDownloadError: null
  }),
  
  // Storage upload error handling
  storeUploadError: assign({
    storageUploadError: ({ event }) => {
      if ('error' in event) {
        return event.error instanceof Error ? event.error.message : String(event.error);
      }
      return 'Failed to upload to 0G Storage';
    },
    statusMessage: 'Storage upload failed'
  }),
  
  displayUploadErrorPrompt: sendParent(({ context }) => ({
    type: 'APPEND_LINES',
    lines: [{
      type: 'error',
      content: `0G Network storage error: ${context.storageUploadError}`,
      timestamp: Date.now()
    }, {
      type: 'system',
      content: 'Do u wanna try uploading again? Type y/n',
      timestamp: Date.now() + 1
    }]
  })),
  
  incrementRetryCount: assign({
    retryCount: ({ context }) => context.retryCount + 1
  })
};

export const dreamGuards = {
  // Check if memory download error occurred
  isMemoryDownloadError: ({ event }: { event: any }) => {
    if ('error' in event && event.error) {
      const errorMsg = event.error instanceof Error ? event.error.message : String(event.error);
      return errorMsg.includes('File not found') || 
             errorMsg.includes('code 101') ||
             errorMsg.includes('Download failed');
    }
    return false;
  },
  
  // Check if we have a valid root hash for contract update
  hasValidRootHash: ({ context }: { context: DreamMachineContext }) => {
    const hash = context.storageRootHash;
    return !!hash && hash !== '0x0' && hash.length === 66;
  },
  
  // Check if we can retry
  canRetry: ({ context }: { context: DreamMachineContext }) => {
    return context.retryCount < context.maxRetries;
  }
};