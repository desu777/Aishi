import { setup, assign, fromPromise } from 'xstate';
import { TerminalContext, TerminalEvent, TerminalLine } from './types';
import { brokerMachine } from './brokerMachine';
import { modelMachine } from './modelMachine';
import { agentMachine } from './agentMachine';
import { dreamMachine } from './dreamMachine';
import { 
  parseCommand, 
  validateCommandArgs, 
  getInteractiveHelp,
  getDetailedCommandHelp,
  COMMAND_TOOLTIPS 
} from '../services/commandParser';
import { ContractReaderService } from '../services/contractReader';

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
          const helpArg = parsed.args[0];
          
          // If help has an argument, show detailed help for that command
          if (helpArg) {
            const detailedHelp = getDetailedCommandHelp(helpArg);
            detailedHelp.forEach((line, index) => {
              newLines.push({
                type: 'help-command',
                content: line,
                timestamp: timestamp + 1 + index
              });
            });
          } else {
            // Show interactive help
            const interactiveHelp = getInteractiveHelp();
            
            interactiveHelp.forEach((line, index) => {
              // Parse lines with ⓘ for interactive elements
              const hasInfoIcon = line.includes('ⓘ');
              let lineType: TerminalLine['type'] = 'help-command';
              let command: string | undefined = undefined;
              let tooltip: string | undefined = undefined;
              
              if (hasInfoIcon) {
                lineType = 'help-interactive';
                // Extract command name from the line
                const match = line.match(/^\s*(\w+)/);
                if (match) {
                  command = match[1];
                  tooltip = COMMAND_TOOLTIPS[command];
                }
              }
              
              newLines.push({
                type: lineType,
                content: line,
                timestamp: timestamp + 1 + index,
                command,
                hasTooltip: hasInfoIcon,
                tooltip
              });
            });
          }
          
          return newLines;
        }
        
        if (parsed.command === 'clear') {
          return [];
        }
        
        // Handle personality command
        if (parsed.command === 'personality') {
          if (process.env.NEXT_PUBLIC_XSTATE_TERMINAL === 'true') {
            console.log('[Terminal] Processing personality command');
          }
          
          // Asynchronous fetch without spawn - proven pattern from dreamMachine
          setTimeout(async () => {
            try {
              const { formatPersonalityOutput } = await import('../services/formatHelpers.tsx');
              
              // Get token ID from agent machine
              const agentState = context.agentRef?.getSnapshot();
              const tokenId = agentState?.context?.tokenId;
              const agentName = agentState?.context?.agentName || 'agent';
              
              if (process.env.NEXT_PUBLIC_XSTATE_TERMINAL === 'true') {
                console.log('[Terminal] Token ID:', tokenId);
                console.log('[Terminal] Agent state:', agentState?.context);
              }
              
              if (!tokenId) {
                self.send({
                  type: 'APPEND_LINES',
                  lines: [{
                    type: 'error',
                    content: 'No agent found. Please connect your wallet first.',
                    timestamp: Date.now()
                  }]
                });
                return;
              }
              
              // Show thinking status
              self.send({
                type: 'UPDATE_STATUS',
                status: `${agentName} is thinking...`
              });
              
              // Fetch agent data
              const contractReader = new ContractReaderService();
              const agentData = await contractReader.getCompleteAgentData(tokenId);
              
              if (process.env.NEXT_PUBLIC_XSTATE_TERMINAL === 'true') {
                console.log('[Terminal] Agent data fetched:', !!agentData);
                if (agentData) {
                  console.log('[Terminal] Agent name:', agentData.basic?.agentName);
                  console.log('[Terminal] Intelligence:', agentData.basic?.intelligenceLevel);
                }
              }
              
              // Format and display
              const formattedLines = formatPersonalityOutput(agentData);
              
              if (process.env.NEXT_PUBLIC_XSTATE_TERMINAL === 'true') {
                console.log('[Terminal] Formatted lines:', formattedLines);
                console.log('[Terminal] Number of lines:', formattedLines.length);
                console.log('[Terminal] About to send APPEND_LINES event');
              }
              
              // Clear status and append formatted lines
              self.send({
                type: 'UPDATE_STATUS',
                status: null
              });
              
              self.send({
                type: 'APPEND_LINES',
                lines: formattedLines
              });
            } catch (error) {
              if (process.env.NEXT_PUBLIC_XSTATE_TERMINAL === 'true') {
                console.error('[Terminal] Error fetching personality:', error);
              }
              
              // Clear status on error
              self.send({
                type: 'UPDATE_STATUS',
                status: null
              });
              
              self.send({
                type: 'APPEND_LINES',
                lines: [{
                  type: 'error',
                  content: `Error: ${error instanceof Error ? error.message : String(error)}`,
                  timestamp: Date.now()
                }]
              });
            }
          }, 0);
          
          return newLines;
        }
        
        // Handle unique-features command
        if (parsed.command === 'unique-features') {
          if (process.env.NEXT_PUBLIC_XSTATE_TERMINAL === 'true') {
            console.log('[Terminal] Processing unique-features command');
          }
          
          // Asynchronous fetch without spawn - proven pattern from dreamMachine
          setTimeout(async () => {
            try {
              const { formatUniqueFeaturesOutput } = await import('../services/formatHelpers.tsx');
              
              // Get token ID from agent machine
              const agentState = context.agentRef?.getSnapshot();
              const tokenId = agentState?.context?.tokenId;
              const agentName = agentState?.context?.agentName || 'agent';
              
              if (process.env.NEXT_PUBLIC_XSTATE_TERMINAL === 'true') {
                console.log('[Terminal] Token ID:', tokenId);
                console.log('[Terminal] Agent state:', agentState?.context);
              }
              
              if (!tokenId) {
                self.send({
                  type: 'APPEND_LINES',
                  lines: [{
                    type: 'error',
                    content: 'No agent found. Please connect your wallet first.',
                    timestamp: Date.now()
                  }]
                });
                return;
              }
              
              // Show thinking status
              self.send({
                type: 'UPDATE_STATUS',
                status: `${agentName} is thinking...`
              });
              
              // Fetch agent data
              const contractReader = new ContractReaderService();
              const agentData = await contractReader.getCompleteAgentData(tokenId);
              
              if (process.env.NEXT_PUBLIC_XSTATE_TERMINAL === 'true') {
                console.log('[Terminal] Agent data fetched:', !!agentData);
                if (agentData) {
                  console.log('[Terminal] Features:', agentData.features);
                }
              }
              
              // Format and display
              const formattedLines = formatUniqueFeaturesOutput(agentData);
              
              if (process.env.NEXT_PUBLIC_XSTATE_TERMINAL === 'true') {
                console.log('[Terminal] Formatted lines:', formattedLines.length);
              }
              
              // Clear status and append formatted lines
              self.send({
                type: 'UPDATE_STATUS',
                status: null
              });
              
              self.send({
                type: 'APPEND_LINES',
                lines: formattedLines
              });
            } catch (error) {
              if (process.env.NEXT_PUBLIC_XSTATE_TERMINAL === 'true') {
                console.error('[Terminal] Error fetching unique features:', error);
              }
              
              // Clear status on error
              self.send({
                type: 'UPDATE_STATUS',
                status: null
              });
              
              self.send({
                type: 'APPEND_LINES',
                lines: [{
                  type: 'error',
                  content: `Error: ${error instanceof Error ? error.message : String(error)}`,
                  timestamp: Date.now()
                }]
              });
            }
          }, 0);
          
          return newLines;
        }
        
        // Handle stats command
        if (parsed.command === 'stats') {
          if (process.env.NEXT_PUBLIC_XSTATE_TERMINAL === 'true') {
            console.log('[Terminal] Processing stats command');
          }
          
          // Asynchronous fetch without spawn - proven pattern from dreamMachine
          setTimeout(async () => {
            try {
              const { formatStatsOutput } = await import('../services/formatHelpers.tsx');
              
              // Get token ID from agent machine
              const agentState = context.agentRef?.getSnapshot();
              const tokenId = agentState?.context?.tokenId;
              const agentName = agentState?.context?.agentName || 'agent';
              
              if (process.env.NEXT_PUBLIC_XSTATE_TERMINAL === 'true') {
                console.log('[Terminal] Token ID:', tokenId);
                console.log('[Terminal] Agent state:', agentState?.context);
              }
              
              if (!tokenId) {
                self.send({
                  type: 'APPEND_LINES',
                  lines: [{
                    type: 'error',
                    content: 'No agent found. Please connect your wallet first.',
                    timestamp: Date.now()
                  }]
                });
                return;
              }
              
              // Show thinking status
              self.send({
                type: 'UPDATE_STATUS',
                status: `${agentName} is thinking...`
              });
              
              // Fetch agent data
              const contractReader = new ContractReaderService();
              const agentData = await contractReader.getCompleteAgentData(tokenId);
              
              if (process.env.NEXT_PUBLIC_XSTATE_TERMINAL === 'true') {
                console.log('[Terminal] Agent data fetched:', !!agentData);
                if (agentData) {
                  console.log('[Terminal] Stats data:', agentData.basic);
                }
              }
              
              // Format and display
              const formattedLines = formatStatsOutput(agentData);
              
              if (process.env.NEXT_PUBLIC_XSTATE_TERMINAL === 'true') {
                console.log('[Terminal] Formatted lines:', formattedLines.length);
              }
              
              // Clear status and append formatted lines
              self.send({
                type: 'UPDATE_STATUS',
                status: null
              });
              
              self.send({
                type: 'APPEND_LINES',
                lines: formattedLines
              });
            } catch (error) {
              if (process.env.NEXT_PUBLIC_XSTATE_TERMINAL === 'true') {
                console.error('[Terminal] Error fetching stats:', error);
              }
              
              // Clear status on error
              self.send({
                type: 'UPDATE_STATUS',
                status: null
              });
              
              self.send({
                type: 'APPEND_LINES',
                lines: [{
                  type: 'error',
                  content: `Error: ${error instanceof Error ? error.message : String(error)}`,
                  timestamp: Date.now()
                }]
              });
            }
          }, 0);
          
          return newLines;
        }
        
        // Handle coming soon commands
        if (parsed.command === 'chat' || parsed.command === 'memory') {
          newLines.push({
            type: 'info',
            content: `Command '${parsed.command}' - coming soon...`,
            timestamp: timestamp + 1
          });
          return newLines;
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
          if (process.env.NEXT_PUBLIC_XSTATE_TERMINAL === 'true') {
            console.log('[Terminal] appendLines action triggered');
            console.log('[Terminal] Appending lines:', event.lines?.length);
            console.log('[Terminal] Current lines:', context.lines.length);
          }
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
        // Start the dream machine with model and wallet
        ({ context }) => {
          if (context.dreamRef) {
            // Get selected model from modelRef
            let selectedModel = 'gemini-2.5-flash-auto';
            if (context.modelRef) {
              const modelState = context.modelRef.getSnapshot();
              selectedModel = modelState?.context?.selectedModel || selectedModel;
            }
            
            // Get wallet address from agentRef
            let walletAddress: string | undefined;
            if (context.agentRef) {
              const agentState = context.agentRef.getSnapshot();
              walletAddress = agentState?.context?.walletAddress;
            }
            
            context.dreamRef.send({ 
              type: 'START',
              modelId: selectedModel,
              walletAddress: walletAddress
            });
          }
        }
      ],
      on: {
        'INPUT.SUBMIT': {
          actions: [
            // FIRST: Immediately add user message to view (IMMUTABLE!)
            assign({
              lines: ({ context }) => {
                const timestamp = Date.now();
                const input = context.currentInput.trim().toLowerCase();
                const isConfirmation = input === 'y' || input === 'yes' || input === 'n' || input === 'no';
                
                // Format according to specification
                const formattedContent = isConfirmation 
                  ? `> ${context.currentInput}`  // For y/n responses
                  : `~ you : ${context.currentInput}`; // For dream content
                
                // IMMUTABLE UPDATE - creates NEW array for React re-render
                return [...context.lines, {
                  type: 'input',
                  content: formattedContent,
                  timestamp
                }];
              }
            }),
            // SECOND: Send to dream machine
            ({ context }) => {
              const input = context.currentInput.trim().toLowerCase();
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
            },
            // THIRD: Clear the input
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