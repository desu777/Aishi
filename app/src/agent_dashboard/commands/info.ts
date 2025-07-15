import { Command, CommandResult, CommandContext } from './types';
import { useAgentDashboard } from '../../hooks/useAgentDashboard';

export const infoCommand: Command = {
  name: 'info',
  description: 'Display comprehensive agent information',
  usage: 'info',
  handler: async (args: string[], context: CommandContext): Promise<CommandResult> => {
    try {
      // Return special marker to trigger info display in terminal
      return {
        success: true,
        output: 'AGENT_INFO_REQUEST',
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

// Helper function to format agent info (will be used in terminal)
export function formatAgentInfo(dashboardData: any): string {
  if (!dashboardData.agent.hasAgent || !dashboardData.agent.data) {
    return `═══════════════════════════════════════
           AGENT INFORMATION
═══════════════════════════════════════

No agent found. Type 'mint <name>' to create your agent.`;
  }

  const agent = dashboardData.agent.data;
  const personality = agent.personality || {};
  const memory = dashboardData.memory.access || {};
  
  // Format creation date
  const createdDate = new Date(Number(agent.createdAt) * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Format personality traits
  const traits = [
    { name: 'Creativity', value: personality.creativity || 0 },
    { name: 'Analytical', value: personality.analytical || 0 },
    { name: 'Empathy', value: personality.empathy || 0 },
    { name: 'Intuition', value: personality.intuition || 0 },
    { name: 'Resilience', value: personality.resilience || 0 },
    { name: 'Curiosity', value: personality.curiosity || 0 }
  ];

  // Format unique features
  const uniqueFeatures = personality.uniqueFeatures || [];
  const uniqueFeaturesCount = uniqueFeatures.length;

  // Format memory info
  const memoryAccess = memory.monthsAccessible || 0;
  const memoryDepth = memory.memoryDepth || 'Unknown';
  const currentDailyHash = agent.memory?.currentDreamDailyHash || 'None';
  const lastConsolidation = agent.memory?.lastConsolidation ? 
    new Date(Number(agent.memory.lastConsolidation) * 1000).toLocaleDateString() : 'Never';

  // Format activity stats
  const dreamCount = Number(agent.dreamCount || 0);
  const conversationCount = Number(agent.conversationCount || 0);
  const totalEvolutions = Number(agent.totalEvolutions || 0);
  const lastDream = personality.lastDreamDate ? 
    new Date(Number(personality.lastDreamDate) * 1000).toLocaleDateString() : 'Never';

  return `═══════════════════════════════════════
           AGENT INFORMATION
═══════════════════════════════════════
Agent Name: ${agent.agentName}
Token ID: ${dashboardData.agent.tokenId}
Owner: ${agent.owner}
Created: ${createdDate}
Intelligence: ${Number(agent.intelligenceLevel)} lvl

PERSONALITY TRAITS:
├─ Creativity: ${traits[0].value}/100
├─ Analytical: ${traits[1].value}/100
├─ Empathy: ${traits[2].value}/100
├─ Intuition: ${traits[3].value}/100
├─ Resilience: ${traits[4].value}/100
└─ Curiosity: ${traits[5].value}/100

Dominant Mood: ${personality.dominantMood || 'Unknown'}
Unique Features: ${uniqueFeaturesCount} active
Evolution Level: ${totalEvolutions > 5 ? 'Advanced' : totalEvolutions > 2 ? 'Intermediate' : 'Beginner'}

MEMORY SYSTEM:
├─ Memory Access: ${memoryAccess} months
├─ Memory Depth: ${memoryDepth}
├─ Current Daily Hash: ${currentDailyHash.slice(0, 10)}...
└─ Last Consolidation: ${lastConsolidation}

ACTIVITY:
├─ Dreams Processed: ${dreamCount}
├─ Conversations: ${conversationCount}
├─ Total Evolutions: ${totalEvolutions}
└─ Last Dream: ${lastDream}`;
}