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
  
  // Format wallet status - TYLKO PRAWDZIWE DANE
  const walletStatus = system.wallet.isConnected ? '[✓] Connected' : '[X] Disconnected';
  const walletAddress = system.wallet.isConnected ? system.wallet.shortAddress : 'Not connected';
  const walletBalance = system.wallet.isConnected ? 'Available' : 'N/A'; // Balance needs to be fetched separately
  
  // Format network status - TYLKO PRAWDZIWE DANE
  const networkStatus = system.network.isConnected ? '[✓] 0G Galileo Testnet' : '[X] Wrong network';
  
  // Format contract status - TYLKO PRAWDZIWE DANE
  const contractStatus = system.wallet.isConnected && system.network.isConnected ? '[✓] Active' : '[X] Inactive';
  const contractNetwork = system.network.isConnected ? 'Galileo Testnet' : 'Unknown';
  
  // Format services status
  const storageStatus = system.services.storage ? '[✓] Available' : '[X] Unavailable';
  const aiProcessingStatus = system.services.aiProcessing ? '[✓] Available' : '[X] Unavailable';
  const memorySystemStatus = system.services.memorySystem ? '[✓] Active' : '[X] Inactive';
  const dreamProcessingStatus = system.services.dreamProcessing ? '[✓] Ready' : '[X] Not ready';
  
  // Format permissions
  const mintPermission = system.wallet.isConnected && system.network.isConnected ? '[✓] Granted' : '[X] Denied';
  const dreamPermission = agent.hasAgent ? '[✓] Granted' : '[X] No agent';
  const memoryPermission = agent.hasAgent ? '[✓] Full Access' : '[X] No access';

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
├─ Network: ${contractNetwork}
└─ Chain ID: ${system.network.chainId || 'Unknown'}

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