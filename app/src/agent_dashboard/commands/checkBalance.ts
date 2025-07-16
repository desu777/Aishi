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
        const output = [
          '💰 Broker Balance Information',
          '═'.repeat(40),
          `Address: ${balance.walletAddress}`,
          `Current Balance: ${balance.balance} 0G`,
          `Master Wallet: ${balance.masterWalletAddress}`,
          `Last Updated: ${new Date(balance.lastUpdated).toLocaleString()}`,
          ''
        ];

        // Add recent transactions if available
        if (balance.transactions && balance.transactions.length > 0) {
          output.push('📜 Recent Transactions:');
          output.push('─'.repeat(40));
          
          balance.transactions.slice(0, 5).forEach((tx: any, index: number) => {
            const date = new Date(tx.timestamp).toLocaleString();
            const typeIcon = tx.type === 'funding' ? '💵' : '🤖';
            const amountDisplay = tx.type === 'funding' ? `+${tx.amount}` : `-${tx.amount}`;
            
            output.push(`${typeIcon} ${amountDisplay} 0G - ${tx.type} (${date})`);
            if (tx.txHash) {
              output.push(`   TX: ${tx.txHash.slice(0, 10)}...${tx.txHash.slice(-8)}`);
            }
            if (index < Math.min(4, balance.transactions.length - 1)) {
              output.push('');
            }
          });
          
          if (balance.transactions.length > 5) {
            output.push('');
            output.push(`... and ${balance.transactions.length - 5} more transactions`);
          }
        } else {
          output.push('📜 No transactions yet');
          output.push('');
          output.push('💡 Use "fund-broker <amount>" to add funds');
        }

        if (process.env.TEST_ENV === 'true') {
          console.log(`📊 Balance check for ${walletAddress}: ${balance.balance} 0G`);
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