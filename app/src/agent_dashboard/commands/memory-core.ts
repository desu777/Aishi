import { Command, CommandResult } from './types';

export const memoryCoreCommand: Command = {
  name: 'memory-core',
  description: 'Create yearly memory core - consolidate 12 months into yearly essence (+5 INT)',
  usage: 'memory-core',
  handler: async (args, context) => {
    // Check if wallet is connected
    if (!context.currentUser) {
      return {
        success: false,
        output: 'Wallet not connected. Please connect your wallet first.',
        type: 'error'
      };
    }

    // Check if agent exists
    if (!context.effectiveTokenId) {
      return {
        success: false,
        output: 'No agent found. Please mint an agent first using: mint <name>',
        type: 'error'
      };
    }

    // Command triggers yearly memory core mode in terminal
    return {
      success: true,
      output: 'MEMORY_CORE_MODE',
      type: 'info'
    };
  }
};