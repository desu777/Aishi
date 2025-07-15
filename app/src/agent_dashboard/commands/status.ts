import { Command, CommandResult, CommandContext } from './types';

export const statusCommand: Command = {
  name: 'status',
  description: 'Display system health and connectivity status',
  usage: 'status',
  handler: async (args: string[], context: CommandContext): Promise<CommandResult> => {
    try {
      // Return special marker to trigger status display in terminal
      return {
        success: true,
        output: 'SYSTEM_STATUS_REQUEST',
        type: 'info'
      };
    } catch (error) {
      return {
        success: false,
        output: `Error retrieving system status: ${error instanceof Error ? error.message : String(error)}`,
        type: 'error'
      };
    }
  }
};

// Helper function to format system status (will be used in terminal)
export function formatSystemStatus(dashboardData: any): string {
  const system = dashboardData.system;
  const agent = dashboardData.agent;
  
  // Format wallet status
  const walletStatus = system.wallet.isConnected ? '✅ Connected' : '❌ Disconnected';
  const walletAddress = system.wallet.isConnected ? system.wallet.shortAddress : 'Not connected';
  const walletBalance = system.wallet.isConnected ? '1.25 OG' : 'N/A'; // Mock balance
  
  // Format network status
  const networkStatus = system.network.isConnected ? '✅ 0G Galileo Testnet' : '❌ Wrong network';
  
  // Format contract status
  const contractStatus = system.wallet.isConnected && system.network.isConnected ? '✅ Active' : '❌ Inactive';
  const contractVersion = 'v1.2.0'; // Mock version
  
  // Format services status
  const storageStatus = system.services.storage ? '✅ Available' : '❌ Unavailable';
  const aiProcessingStatus = system.services.aiProcessing ? '✅ Available' : '❌ Unavailable';
  const memorySystemStatus = system.services.memorySystem ? '✅ Active' : '❌ Inactive';
  const dreamProcessingStatus = system.services.dreamProcessing ? '✅ Ready' : '❌ Not ready';
  
  // Format permissions
  const mintPermission = system.wallet.isConnected && system.network.isConnected ? '✅ Granted' : '❌ Denied';
  const dreamPermission = agent.hasAgent ? '✅ Granted' : '❌ No agent';
  const memoryPermission = agent.hasAgent ? '✅ Full Access' : '❌ No access';

  return `═══════════════════════════════════════
           SYSTEM STATUS
═══════════════════════════════════════
WALLET:
├─ Status: ${walletStatus}
├─ Address: ${walletAddress}
├─ Balance: ${walletBalance}
└─ Network: ${networkStatus}

CONTRACTS:
├─ DreamscapeAgent: ${contractStatus}
├─ SimpleDreamVerifier: ${contractStatus}
└─ Contract Version: ${contractVersion}

SERVICES:
├─ 0G Storage: ${storageStatus}
├─ AI Processing: ${aiProcessingStatus}
├─ Memory System: ${memorySystemStatus}
└─ Dream Processing: ${dreamProcessingStatus}

PERMISSIONS:
├─ Mint Permission: ${mintPermission}
├─ Dream Processing: ${dreamPermission}
└─ Memory Access: ${memoryPermission}`;
}