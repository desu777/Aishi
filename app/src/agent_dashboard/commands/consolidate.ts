import { Command, CommandResult } from './types';

export const consolidateCommand: Command = {
  name: 'consolidate',
  description: 'Trigger monthly consolidation - process dreams and conversations into monthly essence',
  usage: 'consolidate',
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

    // Command triggers consolidation mode in terminal
    return {
      success: true,
      output: 'CONSOLIDATION_MODE',
      type: 'info'
    };
  }
};