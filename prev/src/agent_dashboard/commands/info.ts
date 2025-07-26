import { Command, CommandResult, CommandContext } from './types';
import { useAgentDashboard } from '../../hooks/useAgentDashboard';

export const agentInfoCommand: Command = {
  name: 'agent-info',
  description: 'Display core agent information in cyberpunk style',
  usage: 'agent-info',
  handler: async (args: string[], context: CommandContext): Promise<CommandResult> => {
    try {
      // Return special marker to trigger info display in terminal
      return {
        success: true,
        output: 'DIGITAL_ENTITY_REQUEST',
        type: 'info'
      };
    } catch (error) {
      return {
        success: false,
        output: `Error retrieving agent information: ${error instanceof Error ? error.message : String(error)}`,
        type: 'error'
      };
    }
  }
};

// Helper function to format agent info in cyberpunk style
export function formatAgentInfo(dashboardData: any): string {
  if (!dashboardData.agent.hasAgent || !dashboardData.agent.data) {
    return `╔══════════════════════════════════════════════╗
║              DIGITAL ENTITY                  ║
╠══════════════════════════════════════════════╣
║                                              ║
║  No agent found. Use 'mint <name>' to       ║
║  create your digital entity.                 ║
║                                              ║
╚══════════════════════════════════════════════╝`;
  }

  const agent = dashboardData.agent.data;
  
  // Format creation date
  const createdDate = new Date(Number(agent.createdAt || 0) * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Format last update - time ago
  const lastUpdated = Number(agent.lastUpdated || 0) * 1000;
  const now = Date.now();
  const timeDiff = now - lastUpdated;
  const daysAgo = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const timeAgo = daysAgo === 0 ? 'Today' : daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`;

  // Format shortened owner address
  const ownerShort = `${agent.owner.slice(0, 6)}...${agent.owner.slice(-4)}`;

  // Status indicator based on personality initialization
  const statusIcon = agent.personalityInitialized ? '●' : '○';
  
  // Format activity stats
  const dreamCount = Number(agent.dreamCount || 0);
  const conversationCount = Number(agent.conversationCount || 0);
  const totalEvolutions = Number(agent.totalEvolutions || 0);
  const intelligenceLevel = Number(agent.intelligenceLevel || 0);

  return `╔══════════════════════════════════════════════╗
║              DIGITAL ENTITY                  ║
╠══════════════════════════════════════════════╣
║                                              ║
║  NAME: ${agent.agentName.padEnd(20)} ID: #${String(dashboardData.agent.tokenId).padStart(3, '0')}     ║
║  OWNER: ${ownerShort.padEnd(18)} INT: ${String(intelligenceLevel).padStart(2)} LVL  ║
║  CREATED: ${createdDate.padEnd(17)} STATUS: ${statusIcon}    ║
║                                              ║
║  NEURAL ACTIVITY:                            ║
║  ├─ Dreams: ${String(dreamCount).padEnd(29)}║
║  ├─ Conversations: ${String(conversationCount).padEnd(23)}║
║  ├─ Evolutions: ${String(totalEvolutions).padEnd(26)}║
║  └─ Last Update: ${timeAgo.padEnd(24)}║
║                                              ║
╚══════════════════════════════════════════════╝`;
}