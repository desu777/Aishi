import { Command, CommandResult, CommandContext } from './types';

export const createBrokerCommand: Command = {
  name: 'create-broker',
  description: 'Create a new 0G compute broker',
  usage: 'create-broker',
  handler: async (args: string[], context: CommandContext): Promise<CommandResult> => {
    // Use current user (wallet address) - same as compute page
    const walletAddress = context.currentUser;
    
    if (!walletAddress) {
      return {
        success: false,
        output: 'Wallet not connected. Please connect your wallet first.',
        type: 'error'
      };
    }

    const API_URL = process.env.NEXT_PUBLIC_COMPUTE_API_URL || 'http://localhost:3001/api';
    
    try {
      context.setLoading(true);
      
      const response = await fetch(`${API_URL}/create-broker`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress })
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          output: `Failed to create broker: ${data.error || 'Unknown error'}`,
          type: 'error'
        };
      }

      if (data.success) {
        const broker = data.data;
        const output = [
          '═══════════════════════════════════════',
          '       [✓] BROKER CREATED SUCCESSFULLY!',
          '═══════════════════════════════════════',
          `├─ Address: ${broker.walletAddress}`,
          `├─ Balance: ${broker.balance} 0G`,
          `└─ Created: ${new Date(broker.createdAt).toLocaleString()}`,
          '',
          '[TIP] Use "fund-broker <amount>" to add funds to your broker'
        ].join('\n');

        if (process.env.TEST_ENV === 'true') {
          console.log(`Broker created for ${walletAddress}`);
        }

        return {
          success: true,
          output,
          type: 'success'
        };
      } else {
        return {
          success: false,
          output: `Failed to create broker: ${data.error || 'Unknown error'}`,
          type: 'error'
        };
      }

    } catch (error: any) {
      return {
        success: false,
        output: `Network error: ${error.message}`,
        type: 'error'
      };
    } finally {
      context.setLoading(false);
    }
  }
};