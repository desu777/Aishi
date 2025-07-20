import { Command, CommandResult } from './types';

export const monthLearnCommand: Command = {
  name: 'month-learn',
  description: 'Process monthly consolidation of dreams and conversations',
  usage: 'month-learn',
  handler: async (args, context) => {
    // Sprawdzenie czy agent istnieje
    if (!context.currentUser) {
      return {
        success: false,
        output: 'Wallet not connected. Please connect your wallet first.',
        type: 'error'
      };
    }

    // Komenda month-learn przełącza terminal w tryb month learn workflow
    return {
      success: true,
      output: 'MONTH_LEARN_MODE',
      type: 'info'
    };
  }
};