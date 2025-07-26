import { Command, CommandResult, CommandContext } from './types';

export const talkCommand: Command = {
  name: 'talk',
  description: 'Initialize neural interface connection with your AI agent',
  usage: 'talk',
  handler: async (args: string[], context: CommandContext): Promise<CommandResult> => {
    // Check if user has an agent
    const agentData = (window as any).__DREAMSCAPE_AGENT_DATA__;
    if (!agentData || !agentData.hasAgent) {
      return {
        success: false,
        output: 'No agent found. Use "mint <name>" to create one first.',
        type: 'error'
      };
    }

    // Signal to terminal that neural sync should start
    return {
      success: true,
      output: '__NEURAL_SYNC_START__', // Special marker for terminal
      type: 'system'
    };
  }
};