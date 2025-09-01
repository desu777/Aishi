/**
 * @fileoverview Terminal Machine Actions
 * @description All actions for the terminal state machine
 */

import { assign } from 'xstate';
import type { TerminalContext, TerminalLine } from './types';

/**
 * Terminal machine actions organized by category
 */
export const terminalActions = {
  /**
   * Input handling actions
   */
  updateInput: assign({
    currentInput: ({ event }: any) => {
      if (event.type === 'INPUT.CHANGE') {
        return event.value;
      }
      return '';
    }
  }),

  clearInput: assign({
    currentInput: ''
  }),

  /**
   * Command history actions
   */
  updateCommandHistory: assign({
    commandHistory: ({ context }: { context: TerminalContext }) => {
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
    historyIndex: -1
  }),

  navigateHistoryUp: assign({
    historyIndex: ({ context }: { context: TerminalContext }) => {
      if (context.commandHistory.length === 0) return -1;
      
      const newIndex = context.historyIndex === -1 
        ? context.commandHistory.length - 1 
        : Math.max(0, context.historyIndex - 1);
      
      return newIndex;
    },
    currentInput: ({ context }: { context: TerminalContext }) => {
      if (context.commandHistory.length === 0) return context.currentInput;
      
      const newIndex = context.historyIndex === -1 
        ? context.commandHistory.length - 1 
        : Math.max(0, context.historyIndex - 1);
      
      return context.commandHistory[newIndex] || '';
    }
  }),

  navigateHistoryDown: assign({
    historyIndex: ({ context }: { context: TerminalContext }) => {
      if (context.historyIndex === -1) return -1;
      
      const newIndex = context.historyIndex + 1;
      if (newIndex >= context.commandHistory.length) {
        return -1;
      }
      return newIndex;
    },
    currentInput: ({ context }: { context: TerminalContext }) => {
      if (context.historyIndex === -1) return '';
      
      const newIndex = context.historyIndex + 1;
      if (newIndex >= context.commandHistory.length) {
        return '';
      }
      return context.commandHistory[newIndex] || '';
    }
  }),

  /**
   * Terminal display actions
   */
  clearTerminal: assign({
    lines: [],
    currentInput: ''
  }),

  appendLines: assign({
    lines: ({ context, event }: any) => {
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

  appendInputLine: assign({
    lines: ({ context }: { context: TerminalContext }) => {
      const timestamp = Date.now();
      return [...context.lines, {
        type: 'input',
        content: `$ ${context.currentInput}`,
        timestamp
      }];
    }
  }),

  appendErrorLine: assign({
    lines: ({ context, event }: any) => {
      const timestamp = Date.now();
      const error = event.error || 'An error occurred';
      return [...context.lines, {
        type: 'error',
        content: error,
        timestamp
      }];
    }
  }),

  /**
   * Command parsing actions
   */
  clearLastParsedCommand: assign({
    lastParsedCommand: null
  }),

  /**
   * Initialization actions
   */
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

  /**
   * Actor spawning actions
   */
  spawnActors: assign({
    brokerRef: ({ spawn }: any) => spawn('brokerActor', { id: 'broker' }),
    modelRef: ({ spawn }: any) => spawn('modelActor', { id: 'model' }),
    agentRef: ({ spawn }: any) => spawn('agentActor', { id: 'agent' })
  }),

  spawnDreamMachine: assign({
    dreamRef: ({ spawn }: any) => spawn('dreamActor', { id: 'dream' }),
    isDreamActive: true,
    dreamStatus: 'Initializing dream workflow...',
    lastParsedCommand: null
  }),

  spawnChatMachine: assign({
    chatRef: ({ spawn, context }: any) => {
      // Get agent data from agentRef
      const agentState = context.agentRef?.getSnapshot();
      const agentId = agentState?.context?.tokenId || 1;
      const agentName = agentState?.context?.agentName || 'Agent';
      
      return spawn('chatActor', { 
        id: 'chat',
        input: { agentId, agentName }
      });
    },
    isChatActive: true,
    chatStatus: 'Initializing chat session...',
    lastParsedCommand: null
  }),

  /**
   * Status update actions
   */
  updateDreamStatus: assign({
    dreamStatus: ({ event }: any) => {
      if (event.type === 'UPDATE_STATUS') {
        return event.status;
      }
      return null;
    }
  }),

  updateChatStatus: assign({
    chatStatus: ({ event }: any) => {
      if (event.type === 'UPDATE_STATUS') {
        return event.status;
      }
      return null;
    }
  }),

  updateSelectedModel: assign({
    selectedModel: ({ event }: any) => {
      if (event.type === 'UPDATE_MODEL') {
        return event.modelId;
      }
      return null;
    }
  }),

  /**
   * Workflow completion actions
   */
  completeDream: assign({
    isDreamActive: false,
    dreamStatus: null,
    dreamRef: null
  }),

  completeChat: assign({
    isChatActive: false,
    chatRef: null,
    chatStatus: null
  }),

  /**
   * Command result display actions
   */
  displayCommandResult: assign({
    lines: ({ context, event }: any) => {
      if (event.output?.success && event.output?.lines) {
        return [...context.lines, ...event.output.lines];
      }
      return context.lines;
    }
  }),

  displayCommandError: assign({
    lines: ({ context, event }: any) => {
      const timestamp = Date.now();
      const error = event.output?.error || event.error || 'Command execution failed';
      
      return [...context.lines, {
        type: 'error',
        content: `Error: ${error}`,
        timestamp
      }];
    }
  }),

  /**
   * Agent-related error handling
   */
  displayNoAgentError: assign({
    lines: ({ context }: { context: TerminalContext }) => {
      const timestamp = Date.now();
      return [...context.lines, {
        type: 'error',
        content: 'No agent found. Please connect your wallet first.',
        timestamp
      }];
    }
  }),

  displayNoChatAgentError: assign({
    lines: ({ context }: { context: TerminalContext }) => {
      const timestamp = Date.now();
      return [...context.lines, {
        type: 'error',
        content: 'No agent selected. Use "info" or "stats" command to select an agent first.',
        timestamp
      }];
    },
    lastParsedCommand: null
  }),

  /**
   * Dream workflow specific actions
   */
  addDreamUserInput: assign({
    lines: ({ context }: { context: TerminalContext }) => {
      const timestamp = Date.now();
      const input = context.currentInput.trim().toLowerCase();
      const isConfirmation = input === 'y' || input === 'yes' || input === 'n' || input === 'no';
      
      const formattedContent = isConfirmation 
        ? `> ${context.currentInput}`
        : `~ you : ${context.currentInput}`;
      
      return [...context.lines, {
        type: 'input',
        content: formattedContent,
        timestamp
      }];
    }
  }),

  /**
   * Chat workflow specific actions
   */
  addChatUserInput: assign({
    lines: ({ context }: { context: TerminalContext }) => {
      const timestamp = Date.now();
      const input = context.currentInput.trim();
      
      let formattedContent = '';
      if (context.chatRef?.getSnapshot()?.context?.awaitingConfirmation) {
        formattedContent = `> ${context.currentInput}`;
      } else {
        formattedContent = `~ you: ${context.currentInput}`;
      }
      
      return [...context.lines, {
        type: 'input',
        content: formattedContent,
        timestamp
      }];
    }
  })
};