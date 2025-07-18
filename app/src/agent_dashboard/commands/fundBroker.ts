import { Command, CommandResult, CommandContext } from './types';

export const fundBrokerCommand: Command = {
  name: 'fund-broker',
  description: 'Fund 0G compute broker with specified amount',
  usage: 'fund-broker <amount>',
  handler: async (args: string[], context: CommandContext): Promise<CommandResult> => {
    if (args.length === 0) {
      return {
        success: false,
        output: 'Usage: fund-broker <amount>\nExample: fund-broker 0.1',
        type: 'error'
      };
    }

    const amount = args[0]?.trim();
    // Use current user (wallet address) - same as compute page
    const walletAddress = context.currentUser;

    if (!amount) {
      return {
        success: false,
        output: 'Amount is required\nUsage: fund-broker <amount>',
        type: 'error'
      };
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return {
        success: false,
        output: 'Amount must be a positive number',
        type: 'error'
      };
    }

    if (!walletAddress) {
      return {
        success: false,
        output: 'Wallet not connected. Please connect your wallet first.',
        type: 'error'
      };
    }

    const API_URL = process.env.NEXT_PUBLIC_COMPUTE_API_URL || 'http://localhost:3001/api';
    
    // First, we need to check if window is available (client-side only)
    if (typeof window === 'undefined') {
      return {
        success: false,
        output: 'Funding can only be done in browser environment',
        type: 'error'
      };
    }

    // Since we can't access React hooks directly in command handlers,
    // we'll implement the transaction logic here using the global context
    // This is a pattern used in the existing codebase
    return {
      success: true,
      output: `Preparing to fund broker with ${amount} 0G...`,
      type: 'info',
      requiresConfirmation: true,
      confirmationPrompt: `Send ${amount} 0G to fund broker? (yes/no)`,
      onConfirm: async () => {
        try {
          context.setLoading(true);
          
          // Get the useWallet hook context from the global app context
          // This is a workaround since we can't use hooks directly in command handlers
          const walletContext = (window as any).__DREAMSCAPE_WALLET_CONTEXT__;
          
          if (!walletContext) {
            return {
              success: false,
              output: 'Wallet context not available. Please refresh the page.',
              type: 'error'
            };
          }

          const { sendOGToMasterWallet, isConnected, isCorrectNetwork } = walletContext;

          if (!isConnected) {
            return {
              success: false,
              output: 'Please connect your wallet first',
              type: 'error'
            };
          }

          if (!isCorrectNetwork) {
            return {
              success: false,
              output: 'Please switch to 0G Galileo Testnet',
              type: 'error'
            };
          }

          // Send transaction
          const txResult = await sendOGToMasterWallet(amount);
          
          if (!txResult.success) {
            return {
              success: false,
              output: `Transaction failed: ${txResult.error}`,
              type: 'error'
            };
          }

          if (process.env.TEST_ENV === 'true') {
            console.log(`Transaction sent: ${txResult.txHash}`);
          }

          // Notify backend
          const response = await fetch(`${API_URL}/fund`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              walletAddress,
              amount: amountNum,
              txHash: txResult.txHash
            })
          });

          const data = await response.json();

          if (!response.ok || !data.success) {
            return {
              success: false,
              output: `Transaction sent but backend notification failed: ${data.error || 'Unknown error'}\nTX: ${txResult.txHash}`,
              type: 'warning'
            };
          }

          const broker = data.data;
          const explorerUrl = process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL || 'https://galileo.web3go.xyz';
          
          const output = [
            '═══════════════════════════════════════',
            '       [✓] BROKER FUNDED SUCCESSFULLY!',
            '═══════════════════════════════════════',
            `├─ Transaction: ${txResult.txHash}`,
            `├─ Explorer: ${explorerUrl}/tx/${txResult.txHash}`,
            `├─ Address: ${broker.walletAddress}`,
            `├─ New Balance: ${broker.balance} 0G`,
            `└─ Amount Added: ${amountNum} 0G`,
            '',
            '[TIP] Use "check-balance" to verify the updated balance'
          ].join('\n');

          if (process.env.TEST_ENV === 'true') {
            console.log(`Broker funded: ${walletAddress} with ${amountNum} 0G`);
          }

          return {
            success: true,
            output,
            type: 'success'
          };

        } catch (error: any) {
          return {
            success: false,
            output: `Network error: ${error.message}`,
            type: 'error'
          };
        } finally {
          context.setLoading(false);
        }
      },
      onCancel: () => {
        return {
          success: true,
          output: 'Funding cancelled',
          type: 'info'
        };
      }
    };
  }
};