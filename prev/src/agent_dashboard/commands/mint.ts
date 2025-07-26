import { Command, CommandResult, CommandContext } from './types';

// Since we can't use hooks directly in command functions, we'll need to 
// pass the hook results through the context or implement differently
export const mintCommand: Command = {
  name: 'mint',
  description: 'Mint a new AI dream agent',
  usage: 'mint <name>',
  handler: async (args: string[], context: CommandContext): Promise<CommandResult> => {
    if (args.length === 0) {
      return {
        success: false,
        output: 'Usage: mint <name>\nExample: mint MyAgent',
        type: 'error'
      };
    }

    const agentName = args.join(' ').trim();
    
    if (!agentName) {
      return {
        success: false,
        output: 'Agent name cannot be empty',
        type: 'error'
      };
    }

    if (agentName.length > 50) {
      return {
        success: false,
        output: 'Agent name too long (max 50 characters)',
        type: 'error'
      };
    }

    // We'll need to implement the actual minting logic in the terminal component
    // since we can't use React hooks in this command handler
    return {
      success: true,
      output: `Ready to mint agent "${agentName}"`,
      type: 'info',
      requiresConfirmation: true,
      confirmationPrompt: 'are u sure? yes/no',
      onConfirm: async () => {
        // This will be implemented in the terminal component
        return {
          success: true,
          output: 'new era of your life begins now . . .',
          type: 'info'
        };
      },
      onCancel: () => {
        return {
          success: true,
          output: 'Mint cancelled',
          type: 'info'
        };
      }
    };
  }
};