import { Command, CommandResult } from './types';

export const consolidationStatusCommand: Command = {
  name: 'consolidation-status',
  description: 'Check consolidation needs - monthly and yearly reflection availability',
  usage: 'consolidation-status',
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

    // Command triggers consolidation status check in terminal
    return {
      success: true,
      output: 'CONSOLIDATION_STATUS_MODE',
      type: 'info'
    };
  }
};