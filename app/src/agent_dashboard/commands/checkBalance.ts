import { Command, CommandResult, CommandContext } from './types';

export const checkBalanceCommand: Command = {
  name: 'check-balance',
  description: 'Check 0G compute broker balance and transaction history',
  usage: 'check-balance',
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
      
      const response = await fetch(`${API_URL}/balance/${walletAddress}`);
      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          output: `Failed to check balance: ${data.error || 'Unknown error'}`,
          type: 'error'
        };
      }

      if (data.success) {
        const balance = data.data;
        
        // Format date properly
        const lastUpdated = balance.lastUpdated ? 
          new Date(balance.lastUpdated).toLocaleString() : 
          'Not available';
        
        const output = [
          '═══════════════════════════════════════',
          '         BROKER BALANCE INFORMATION',
          '═══════════════════════════════════════',
          `├─ Address: ${balance.walletAddress}`,
          `├─ Current Balance: ${balance.balance} 0G`,
          `└─ Last Updated: ${lastUpdated}`,
          '',
          '[TIP] Use "fund-broker <amount>" to add funds'
        ];

        if (process.env.TEST_ENV === 'true') {
          console.log(`Balance check for ${walletAddress}: ${balance.balance} 0G`);
        }

        return {
          success: true,
          output: output.join('\n'),
          type: 'info'
        };
      } else {
        return {
          success: false,
          output: `Failed to check balance: ${data.error || 'Unknown error'}`,
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