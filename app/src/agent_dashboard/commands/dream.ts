import { Command, CommandResult } from './types';

export const dreamCommand: Command = {
  name: 'dream',
  description: 'Analyze your dream with AI - interactive dream input mode',
  usage: 'dream',
  handler: async (args, context) => {
    // Sprawdzenie czy agent istnieje
    if (!context.currentUser) {
      return {
        success: false,
        output: 'Wallet not connected. Please connect your wallet first.',
        type: 'error'
      };
    }

    // Komenda dream przełącza terminal w tryb dream input
    return {
      success: true,
      output: 'DREAM_INPUT_MODE',
      type: 'info'
    };
  }
};