/**
 * @fileoverview Terminal State Machine
 * @description Main terminal machine using XState v5 with modular architecture
 */

import { setup, assign } from 'xstate';
import { TerminalContext, TerminalEvent } from './types';
import { brokerMachine } from './brokerMachine';
import { modelMachine } from './modelMachine';
import { agentMachine } from './agentMachine';
import { dreamMachine } from './dreamMachine';
import { chatMachine } from './chatMachine';
import { commandExecutors } from './terminal.command-executors';
import { terminalActions } from './terminal.actions';
import { terminalGuards } from './terminal.guards';
import { 
  submitCommandAction, 
  workflowActions, 
  getAgentData 
} from './terminal.command-processor';

// Initial context
const initialContext: TerminalContext = {
  lines: [],
  welcomeLines: [],
  currentInput: '',
  commandHistory: [],
  historyIndex: -1,
  isInitialized: false,
  brokerRef: null,
  modelRef: null,
  agentRef: null,
  dreamRef: null,
  chatRef: null,
  selectedModel: null,
  isDreamActive: false,
  isChatActive: false,
  dreamStatus: null,
  chatStatus: null,
  lastParsedCommand: null
};

// Terminal machine definition
export const terminalMachine = setup({
  types: {} as {
    context: TerminalContext;
    events: TerminalEvent;
  },
  actors: {
    // Child machines
    brokerActor: brokerMachine,
    modelActor: modelMachine,
    agentActor: agentMachine,
    dreamActor: dreamMachine,
    chatActor: chatMachine,
    // Command executors
    ...commandExecutors
  },
  actions: {
    // Import all terminal actions
    ...terminalActions,
    // Command processing
    submitCommand: submitCommandAction,
    // Workflow actions
    ...workflowActions,
    // Command execution status update
    updateCommandStatus: assign({
      lines: ({ context, event }: any) => {
        if (event.agentName) {
          // Show "thinking" status for async commands
          return [...context.lines, {
            type: 'system',
            content: `${event.agentName} is thinking...`,
            timestamp: Date.now()
          }];
        }
        return context.lines;
      }
    })
  },
  guards: terminalGuards
}).createMachine({
  id: 'terminal',
  initial: 'uninitialized',
  context: initialContext,
  
  states: {
    uninitialized: {
      on: {
        INITIALIZE: {
          target: 'idle',
          actions: ['initialize', 'spawnActors']
        }
      }
    },
    
    idle: {
      on: {
        'INPUT.CHANGE': {
          actions: 'updateInput'
        },
        'INPUT.SUBMIT': {
          target: 'processing'
        },
        'HISTORY.UP': {
          actions: 'navigateHistoryUp'
        },
        'HISTORY.DOWN': {
          actions: 'navigateHistoryDown'
        },
        CLEAR: {
          actions: 'clearTerminal'
        },
        'APPEND_LINES': {
          actions: 'appendLines'
        },
        'UPDATE_STATUS': {
          actions: 'updateDreamStatus'
        }
      }
    },
    
    processing: {
      entry: ['submitCommand'],
      always: [
        // Dream command
        {
          target: 'dreamWorkflow',
          guard: 'isDreamCommand',
          actions: 'spawnDreamMachine'
        },
        // Chat command with agent
        {
          target: 'chatWorkflow',
          guard: 'isChatCommandWithAgent',
          actions: 'spawnChatMachine'
        },
        // Chat command without agent
        {
          target: 'idle',
          guard: 'isChatCommandWithoutAgent',
          actions: 'displayNoChatAgentError'
        },
        // Clear command
        {
          target: 'idle',
          guard: 'isClearCommand',
          actions: 'clearTerminal'
        },
        // Help command
        {
          target: 'executingHelp',
          guard: 'isHelpCommand'
        },
        // Commands that need agent
        {
          target: 'checkingAgent',
          guard: 'isAgentRequiredCommand'
        },
        // Default: return to idle
        {
          target: 'idle'
        }
      ]
    },
    
    checkingAgent: {
      always: [
        // Has agent - proceed to execution
        {
          target: 'executingCommand',
          guard: 'hasAgent'
        },
        // No agent - show error
        {
          target: 'idle',
          actions: 'displayNoAgentError'
        }
      ]
    },
    
    executingCommand: {
      initial: 'determining',
      states: {
        determining: {
          always: [
            {
              target: 'personality',
              guard: ({ context }) => context.lastParsedCommand === 'personality'
            },
            {
              target: 'uniqueFeatures',
              guard: ({ context }) => context.lastParsedCommand === 'unique-features'
            },
            {
              target: 'stats',
              guard: ({ context }) => context.lastParsedCommand === 'stats'
            }
          ]
        },
        
        personality: {
          entry: ({ context, self }) => {
            const { agentName } = getAgentData(context);
            self.send({ type: 'UPDATE_STATUS', status: `${agentName} is thinking...` });
          },
          invoke: {
            src: 'personalityExecutor',
            input: ({ context }) => {
              const { tokenId, agentName } = getAgentData(context);
              return { tokenId: tokenId!, agentName };
            },
            onDone: {
              target: '#terminal.idle',
              actions: [
                assign({ lastParsedCommand: null }),
                ({ self }) => self.send({ type: 'UPDATE_STATUS', status: null }),
                'displayCommandResult'
              ]
            },
            onError: {
              target: '#terminal.idle',
              actions: [
                assign({ lastParsedCommand: null }),
                ({ self }) => self.send({ type: 'UPDATE_STATUS', status: null }),
                'displayCommandError'
              ]
            }
          }
        },
        
        uniqueFeatures: {
          entry: ({ context, self }) => {
            const { agentName } = getAgentData(context);
            self.send({ type: 'UPDATE_STATUS', status: `${agentName} is thinking...` });
          },
          invoke: {
            src: 'uniqueFeaturesExecutor',
            input: ({ context }) => {
              const { tokenId, agentName } = getAgentData(context);
              return { tokenId: tokenId!, agentName };
            },
            onDone: {
              target: '#terminal.idle',
              actions: [
                assign({ lastParsedCommand: null }),
                ({ self }) => self.send({ type: 'UPDATE_STATUS', status: null }),
                'displayCommandResult'
              ]
            },
            onError: {
              target: '#terminal.idle',
              actions: [
                assign({ lastParsedCommand: null }),
                ({ self }) => self.send({ type: 'UPDATE_STATUS', status: null }),
                'displayCommandError'
              ]
            }
          }
        },
        
        stats: {
          entry: ({ context, self }) => {
            const { agentName } = getAgentData(context);
            self.send({ type: 'UPDATE_STATUS', status: `${agentName} is thinking...` });
          },
          invoke: {
            src: 'statsExecutor',
            input: ({ context }) => {
              const { tokenId, agentName } = getAgentData(context);
              return { tokenId: tokenId!, agentName };
            },
            onDone: {
              target: '#terminal.idle',
              actions: [
                assign({ lastParsedCommand: null }),
                ({ self }) => self.send({ type: 'UPDATE_STATUS', status: null }),
                'displayCommandResult'
              ]
            },
            onError: {
              target: '#terminal.idle',
              actions: [
                assign({ lastParsedCommand: null }),
                ({ self }) => self.send({ type: 'UPDATE_STATUS', status: null }),
                'displayCommandError'
              ]
            }
          }
        }
      }
    },
    
    executingHelp: {
      invoke: {
        src: 'helpExecutor',
        input: ({ context }) => {
          const parsed = context.lastParsedCommand === 'help' ? 
            { args: [] } : { args: [] };
          return parsed;
        },
        onDone: {
          target: 'idle',
          actions: [
            assign({ lastParsedCommand: null }),
            'displayCommandResult'
          ]
        },
        onError: {
          target: 'idle',
          actions: [
            assign({ lastParsedCommand: null }),
            'displayCommandError'
          ]
        }
      }
    },
    
    dreamWorkflow: {
      entry: [
        'clearInput',
        'startDreamWorkflow'
      ],
      on: {
        'INPUT.SUBMIT': {
          actions: [
            'addDreamUserInput',
            'sendDreamInput',
            'clearInput'
          ]
        },
        'INPUT.CHANGE': {
          actions: 'updateInput'
        },
        'APPEND_LINES': {
          actions: 'appendLines'
        },
        'UPDATE_STATUS': {
          actions: 'updateDreamStatus'
        },
        'DREAM.COMPLETE': {
          target: 'idle',
          actions: 'completeDream'
        },
        'HISTORY.UP': {
          actions: 'navigateHistoryUp'
        },
        'HISTORY.DOWN': {
          actions: 'navigateHistoryDown'
        }
      }
    },
    
    chatWorkflow: {
      entry: [
        'clearInput',
        'startChatWorkflow'
      ],
      on: {
        'INPUT.SUBMIT': {
          actions: [
            'addChatUserInput',
            'sendChatInput',
            'clearInput'
          ]
        },
        'INPUT.CHANGE': {
          actions: 'updateInput'
        },
        'APPEND_LINES': {
          actions: 'appendLines'
        },
        'UPDATE_STATUS': {
          actions: 'updateChatStatus'
        },
        'END_SESSION': {
          actions: ({ context }) => {
            if (context.chatRef) {
              context.chatRef.send({ type: 'END_SESSION' });
            }
          }
        },
        'CHAT_COMPLETED': {
          target: 'idle',
          actions: 'completeChat'
        },
        'HISTORY.UP': {
          actions: 'navigateHistoryUp'
        },
        'HISTORY.DOWN': {
          actions: 'navigateHistoryDown'
        }
      }
    }
  }
});