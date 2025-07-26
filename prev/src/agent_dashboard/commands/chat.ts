import { Command, CommandResult } from './types';

export const chatCommand: Command = {
  name: 'chat',
  description: 'Start a conversation with your AI agent - interactive chat mode',
  usage: 'chat',
  handler: async (args, context) => {
    // Sprawdzenie czy agent istnieje
    if (!context.currentUser) {
      return {
        success: false,
        output: 'Wallet not connected. Please connect your wallet first.',
        type: 'error'
      };
    }

    // Komenda chat przełącza terminal w tryb chat input
    return {
      success: true,
      output: 'CHAT_INPUT_MODE',
      type: 'info'
    };
  }
};