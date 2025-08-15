import { setup, assign } from 'xstate';
import { TerminalContext, TerminalEvent, TerminalLine } from './types';
import { brokerMachine } from './brokerMachine';
import { modelMachine } from './modelMachine';
import { agentMachine } from './agentMachine';
import { dreamMachine } from './dreamMachine';
import { parseCommand, validateCommandArgs } from '../services/commandParser';

// Initial context - extended with actor refs
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
  selectedModel: null,
  isDreamActive: false,
  dreamStatus: null,
  lastParsedCommand: null
};

// Terminal machine definition
export const terminalMachine = setup({
  types: {} as {
    context: TerminalContext;
    events: TerminalEvent;
  },
  actors: {
    brokerActor: brokerMachine,
    modelActor: modelMachine,
    agentActor: agentMachine,
    dreamActor: dreamMachine
  },
  actions: {
    updateInput: assign({
      currentInput: ({ event }) => {
        if (event.type === 'INPUT.CHANGE') {
          return event.value;
        }
        return '';
      }
    }),
    
    submitCommand: assign({
      lines: ({ context, self }) => {
        const timestamp = Date.now();
        const newLines: TerminalLine[] = [
          ...context.lines,
          {
            type: 'input',
            content: `$ ${context.currentInput}`,
            timestamp
          }
        ];
        
        // Parse the command
        const parsed = parseCommand(context.currentInput);
        
        if (!parsed.isValid) {
          newLines.push({
            type: 'error',
            content: parsed.error || 'Invalid command',
            timestamp: timestamp + 1
          });
          return newLines;
        }
        
        // Validate command arguments
        const validation = validateCommandArgs(parsed.command as any, parsed.args);
        if (!validation.valid) {
          newLines.push({
            type: 'error',
            content: validation.error || 'Invalid arguments',
            timestamp: timestamp + 1
          });
          return newLines;
        }
        
        // Handle dream command specially
        if (parsed.command === 'dream') {
          // Dream command will be handled by spawning dream machine
          // No additional message needed here as dream machine will handle it
          return newLines;
        }
        
        // Handle other commands
        if (parsed.command === 'help') {
          const helpLines = [
            '╔════════════════════════════════════════════════════╗',
            '║             aishiOS Terminal Commands              ║',
            '╚════════════════════════════════════════════════════╝',
            '',
            '[Agent Operations]',
            '  mint <name> - Create a new AI agent NFT',
            '  info - Display agent information',
            '  stats - Show agent statistics',
            '',
            '[Interactions]',
            '  dream - Process and analyze a dream',
            '  chat - Start a conversation',
            '',
            '[System]',
            '  help - Show this help message',
            '  clear - Clear terminal screen'
          ];
          
          helpLines.forEach((line, index) => {
            newLines.push({
              type: 'help-command',
              content: line,
              timestamp: timestamp + 1 + index
            });
          });
          
          return newLines;
        }
        
        if (parsed.command === 'clear') {
          return [];
        }
        
        // Default for unimplemented commands
        newLines.push({
          type: 'info',
          content: `Command '${parsed.command}' recognized but not yet implemented.`,
          timestamp: timestamp + 1
        });
        
        return newLines;
      },
      commandHistory: ({ context }) => {
        if (context.currentInput.trim()) {
          const newHistory = [...context.commandHistory];
          // Remove duplicates
          const index = newHistory.indexOf(context.currentInput);
          if (index > -1) {
            newHistory.splice(index, 1);
          }
          // Add to end
          newHistory.push(context.currentInput);
          // Keep max 50 entries
          return newHistory.slice(-50);
        }
        return context.commandHistory;
      },
      lastParsedCommand: ({ context }) => {
        const parsed = parseCommand(context.currentInput);
        return parsed.isValid ? parsed.command : null;
      },
      currentInput: '',
      historyIndex: -1
    }),
    
    navigateHistoryUp: assign({
      historyIndex: ({ context }) => {
        if (context.commandHistory.length === 0) return -1;
        
        const newIndex = context.historyIndex === -1 
          ? context.commandHistory.length - 1 
          : Math.max(0, context.historyIndex - 1);
        
        return newIndex;
      },
      currentInput: ({ context }) => {
        if (context.commandHistory.length === 0) return context.currentInput;
        
        const newIndex = context.historyIndex === -1 
          ? context.commandHistory.length - 1 
          : Math.max(0, context.historyIndex - 1);
        
        return context.commandHistory[newIndex] || '';
      }
    }),
    
    navigateHistoryDown: assign({
      historyIndex: ({ context }) => {
        if (context.historyIndex === -1) return -1;
        
        const newIndex = context.historyIndex + 1;
        if (newIndex >= context.commandHistory.length) {
          return -1;
        }
        return newIndex;
      },
      currentInput: ({ context }) => {
        if (context.historyIndex === -1) return '';
        
        const newIndex = context.historyIndex + 1;
        if (newIndex >= context.commandHistory.length) {
          return '';
        }
        return context.commandHistory[newIndex] || '';
      }
    }),
    
    clearTerminal: assign({
      lines: [],
      currentInput: ''
    }),
    
    initialize: assign({
      isInitialized: true,
      welcomeLines: () => {
        const timestamp = Date.now();
        return [
          {
            type: 'info' as const,
            content: 'syncing with agent',
            timestamp
          },
          {
            type: 'system' as const,
            content: '',
            timestamp: timestamp + 1
          }
        ];
      }
    }),
    
    spawnActors: assign({
      brokerRef: ({ spawn }) => spawn('brokerActor', { id: 'broker' }),
      modelRef: ({ spawn }) => spawn('modelActor', { id: 'model' }),
      agentRef: ({ spawn }) => spawn('agentActor', { id: 'agent' })
    }),
    
    spawnDreamMachine: assign({
      dreamRef: ({ spawn }) => spawn('dreamActor', { id: 'dream' }),
      isDreamActive: true,
      dreamStatus: 'Initializing dream workflow...',
      lastParsedCommand: null // Clear after use
    }),
    
    appendLines: assign({
      lines: ({ context, event }) => {
        if (event.type === 'APPEND_LINES') {
          return [...context.lines, ...event.lines];
        }
        return context.lines;
      }
    }),
    
    updateDreamStatus: assign({
      dreamStatus: ({ event }) => {
        if (event.type === 'UPDATE_STATUS') {
          return event.status;
        }
        return null;
      }
    }),
    
    completeDream: assign({
      isDreamActive: false,
      dreamStatus: null,
      dreamRef: null
    }),
    
    updateSelectedModel: assign({
      selectedModel: ({ event }) => {
        if (event.type === 'UPDATE_MODEL') {
          return event.modelId;
        }
        return null;
      }
    })
  }
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
        }
      }
    },
    processing: {
      entry: 'submitCommand',
      always: [
        {
          // Check if dream command was entered
          target: 'dreamWorkflow',
          guard: ({ context }) => {
            return context.lastParsedCommand === 'dream';
          },
          actions: 'spawnDreamMachine'
        },
        {
          // Otherwise return to idle
          target: 'idle'
        }
      ]
    },
    
    dreamWorkflow: {
      entry: [
        // Clear the input
        assign({ currentInput: '' }),
        // Start the dream machine
        ({ context }) => {
          if (context.dreamRef) {
            context.dreamRef.send({ type: 'START' });
          }
        }
      ],
      on: {
        'INPUT.SUBMIT': {
          actions: [
            ({ context, event }) => {
              // Check if it's y/n confirmation
              const input = context.currentInput.trim().toLowerCase();
              
              // If dream is waiting for input, send it to dream machine
              if (context.dreamRef) {
                if (input === 'y' || input === 'yes') {
                  context.dreamRef.send({ type: 'CONFIRM_SAVE' });
                } else if (input === 'n' || input === 'no') {
                  context.dreamRef.send({ type: 'CANCEL_SAVE' });
                } else {
                  // Otherwise it's the dream text
                  context.dreamRef.send({ 
                    type: 'SUBMIT_DREAM', 
                    dreamText: context.currentInput 
                  });
                }
              }
              
              // Add input to lines
              const timestamp = Date.now();
              context.lines.push({
                type: 'input',
                content: `~ ${context.currentInput}`,
                timestamp
              });
            },
            // Clear the input after submission
            assign({ currentInput: '' })
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
    }
  }
});