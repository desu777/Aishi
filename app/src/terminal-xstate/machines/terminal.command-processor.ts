/**
 * @fileoverview Terminal Command Processor
 * @description Command processing logic for terminal machine
 */

import { assign } from 'xstate';
import { parseCommand, validateCommandArgs } from '../services/commandParser';
import type { TerminalContext, TerminalLine } from './types';

/**
 * Process and validate command input
 * Returns lines to display for simple commands or null for complex ones
 */
export const processCommand = (context: TerminalContext): TerminalLine[] | null => {
  const timestamp = Date.now();
  const parsed = parseCommand(context.currentInput);
  
  // Handle invalid command
  if (!parsed.isValid) {
    return [{
      type: 'error',
      content: parsed.error || 'Invalid command',
      timestamp
    }];
  }
  
  // Validate command arguments
  const validation = validateCommandArgs(parsed.command as any, parsed.args);
  if (!validation.valid) {
    return [{
      type: 'error',
      content: validation.error || 'Invalid arguments',
      timestamp
    }];
  }
  
  // Handle simple commands that don't need actors
  switch (parsed.command) {
    case 'clear':
      // Clear command is handled by action
      return [];
      
    case 'dream':
    case 'chat':
      // These are handled by state transitions
      return null;
      
    case 'personality':
    case 'unique-features':
    case 'stats':
    case 'help':
      // These need async actors
      return null;
      
    case 'memory':
      // Handled by async actor
      return null;
      
    default:
      // Unimplemented command
      return [{
        type: 'info',
        content: `Command '${parsed.command}' recognized but not yet implemented.`,
        timestamp
      }];
  }
};

/**
 * Debug logging helper
 */
const debugLog = (message: string, data?: any) => {
  if (process.env.NEXT_PUBLIC_XSTATE_TERMINAL === 'true') {
    console.log(`[Terminal] ${message}`, data || '');
  }
};

/**
 * Command processor action that adds input line and processes command
 */
export const submitCommandAction = assign({
  lines: ({ context }: { context: TerminalContext }) => {
    const timestamp = Date.now();
    const newLines: TerminalLine[] = [
      ...context.lines,
      {
        type: 'input',
        content: `$ ${context.currentInput}`,
        timestamp
      }
    ];
    
    // Process command for simple results
    const commandResult = processCommand(context);
    if (commandResult !== null) {
      newLines.push(...commandResult);
    }
    
    return newLines;
  },
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
  lastParsedCommand: ({ context }: { context: TerminalContext }) => {
    const parsed = parseCommand(context.currentInput);
    debugLog('Parsing command', { 
      input: context.currentInput, 
      parsed: parsed,
      command: parsed.command 
    });
    return parsed.isValid ? parsed.command : null;
  },
  currentInput: '',
  historyIndex: -1
});

/**
 * Helper to get agent data from context
 */
export const getAgentData = (context: TerminalContext) => {
  const agentState = context.agentRef?.getSnapshot();
  return {
    tokenId: agentState?.context?.tokenId,
    agentName: agentState?.context?.agentName || 'agent',
    walletAddress: agentState?.context?.walletAddress
  };
};

/**
 * Helper to get model data from context
 */
export const getModelData = (context: TerminalContext) => {
  const modelState = context.modelRef?.getSnapshot();
  return {
    selectedModel: modelState?.context?.selectedModel || 'gemini-2.5-flash-auto'
  };
};

/**
 * Actions for starting workflows with proper context
 */
export const workflowActions = {
  /**
   * Start dream workflow with context
   */
  startDreamWorkflow: ({ context }: { context: TerminalContext }) => {
    if (context.dreamRef) {
      const { selectedModel } = getModelData(context);
      const { walletAddress, tokenId, agentName } = getAgentData(context);

      debugLog('[workflowActions] Starting dream workflow', {
        tokenId,
        agentName,
        wasVoiceInput: context.wasVoiceInput,
        selectedModel
      });

      context.dreamRef.send({
        type: 'START',
        modelId: selectedModel,
        walletAddress,
        tokenId,
        agentName,
        wasVoiceInput: context.wasVoiceInput
      });
    }
  },

  /**
   * Start chat workflow with context
   */
  startChatWorkflow: ({ context }: { context: TerminalContext }) => {
    if (context.chatRef) {
      const { tokenId, agentName } = getAgentData(context);
      const { selectedModel } = getModelData(context);

      debugLog('[workflowActions] Starting chat workflow', {
        tokenId,
        agentName,
        wasVoiceInput: context.wasVoiceInput,
        selectedModel
      });

      context.chatRef.send({
        type: 'START_CHAT',
        agentId: tokenId || 1,
        agentName,
        modelId: selectedModel,
        wasVoiceInput: context.wasVoiceInput
      });
    }
  },

  /**
   * Send dream input
   */
  sendDreamInput: ({ context }: { context: TerminalContext }) => {
    const input = context.currentInput.trim().toLowerCase();
    if (context.dreamRef) {
      if (input === 'y' || input === 'yes') {
        context.dreamRef.send({ type: 'CONFIRM_SAVE' });
      } else if (input === 'n' || input === 'no') {
        context.dreamRef.send({ type: 'CANCEL_SAVE' });
      } else {
        context.dreamRef.send({ 
          type: 'SUBMIT_DREAM', 
          dreamText: context.currentInput 
        });
      }
    }
  },

  /**
   * Send chat input
   */
  sendChatInput: ({ context }: { context: TerminalContext }) => {
    if (context.chatRef) {
      context.chatRef.send({ 
        type: 'INPUT.SUBMIT', 
        value: context.currentInput 
      });
    }
  }
};