import { setup, assign } from 'xstate';
import { TerminalContext, TerminalEvent, TerminalLine } from './types';

// Initial context
const initialContext: TerminalContext = {
  lines: [],
  welcomeLines: [],
  currentInput: '',
  commandHistory: [],
  historyIndex: -1,
  isInitialized: false
};

// Terminal machine definition
export const terminalMachine = setup({
  types: {} as {
    context: TerminalContext;
    events: TerminalEvent;
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
      lines: ({ context }) => {
        const timestamp = Date.now();
        const newLines: TerminalLine[] = [
          ...context.lines,
          {
            type: 'input',
            content: `$ ${context.currentInput}`,
            timestamp
          },
          {
            type: 'info',
            content: 'Command not implemented yet. This is the new XState terminal MVP.',
            timestamp: timestamp + 1
          }
        ];
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
            type: 'success' as const,
            content: 'XState Terminal v2.0 - MVP',
            timestamp
          },
          {
            type: 'info' as const,
            content: 'Terminal is running on new architecture',
            timestamp: timestamp + 1
          },
          {
            type: 'system' as const,
            content: '',
            timestamp: timestamp + 2
          },
          {
            type: 'system' as const,
            content: 'Type any command (commands not implemented yet)',
            timestamp: timestamp + 3
          }
        ];
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
          actions: 'initialize'
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
      always: 'idle' // Immediately return to idle after processing
    }
  }
});