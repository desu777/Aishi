import { Command, CommandResult, CommandContext } from './types';

export const statsCommand: Command = {
  name: 'stats',
  description: 'Display comprehensive agent statistics',
  usage: 'stats',
  handler: async (args: string[], context: CommandContext): Promise<CommandResult> => {
    try {
      // Return special marker to trigger stats display in terminal
      return {
        success: true,
        output: 'AGENT_STATS_REQUEST',
        type: 'info'
      };
    } catch (error) {
      return {
        success: false,
        output: `Error retrieving agent statistics: ${error instanceof Error ? error.message : String(error)}`,
        type: 'error'
      };
    }
  }
};

// Helper function to format agent stats (will be used in terminal)
export function formatAgentStats(dashboardData: any): string {
  if (!dashboardData.agent.hasAgent || !dashboardData.agent.data) {
    return `═══════════════════════════════════════
           AGENT STATISTICS
═══════════════════════════════════════

No agent found. Type 'mint <name>' to create your agent.`;
  }

  const agent = dashboardData.agent.data;
  const stats = dashboardData.stats;
  const evolutionStats = stats.evolutionStats || {};
  const milestones = stats.milestones || [];
  const consolidationStreak = stats.consolidationStreak || 0;
  const pendingRewards = stats.pendingRewards || {};

  // Format evolution metrics - TYLKO PRAWDZIWE DANE Z KONTRAKTU
  const totalEvolutions = Number(agent.totalEvolutions || 0);
  const dreamCount = Number(agent.dreamCount || 0);
  const evolutionRate = dreamCount > 0 ? (totalEvolutions / dreamCount).toFixed(2) : '0.00';
  const lastEvolution = agent.lastEvolutionDate ? 
    new Date(Number(agent.lastEvolutionDate) * 1000).toLocaleDateString() : 'Never';

  // Calculate trend based on real data
  const evolutionTrend = evolutionRate > 0.5 ? '↗ Increasing' : 
                        evolutionRate > 0.2 ? '→ Steady' : '↘ Decreasing';

  // Format performance metrics - TYLKO PRAWDZIWE DANE
  const conversationCount = Number(agent.conversationCount || 0);
  const intelligenceLevel = Number(agent.intelligenceLevel || 0);
  
  // Format consolidation info - TYLKO PRAWDZIWE DANE
  const consolidationReward = stats.pendingRewards || {};
  const intelligenceBonus = Number(consolidationReward.intelligenceBonus || 0);
  
  // Format milestones - TYLKO PRAWDZIWE DANE Z KONTRAKTU
  const achievedMilestones = milestones.filter((m: any) => m.achieved);
  const pendingMilestones = milestones.filter((m: any) => !m.achieved);

  let milestonesText = '';
  
  // Add achieved milestones - PRAWDZIWE DANE
  achievedMilestones.slice(0, 2).forEach((milestone: any) => {
    const achievedDate = milestone.achievedAt ? 
      new Date(milestone.achievedAt * 1000).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      }) : 'Unknown';
    milestonesText += `[✓] ${formatMilestoneName(milestone.milestoneName)} (achieved ${achievedDate})\n`;
  });

  // Add pending milestones - BEZ MOCK PROGRESS
  pendingMilestones.slice(0, 2).forEach((milestone: any) => {
    milestonesText += `[...] ${formatMilestoneName(milestone.milestoneName)} (in progress)\n`;
  });

  return `═══════════════════════════════════════
           AGENT STATISTICS
═══════════════════════════════════════
EVOLUTION METRICS:
├─ Total Evolutions: ${totalEvolutions}
├─ Evolution Rate: ${evolutionRate}/dream
├─ Last Evolution: ${lastEvolution}
└─ Evolution Trend: ${evolutionTrend}

PERFORMANCE:
├─ Dream Processing: ${dreamCount} total
├─ Conversation Count: ${conversationCount}
├─ Intelligence Level: ${intelligenceLevel}
└─ Personality Initialized: ${agent.personalityInitialized ? 'Yes' : 'No'}

CONSOLIDATION:
├─ Current Streak: ${consolidationStreak} months
├─ Pending Intelligence Bonus: +${intelligenceBonus}
└─ Agent Created: ${new Date(Number(agent.createdAt) * 1000).toLocaleDateString()}

MILESTONES:
${milestonesText.trim() || 'No milestones data available'}`;
}

// Helper function to format milestone names
function formatMilestoneName(milestoneName: string): string {
  const nameMap: { [key: string]: string } = {
    'empathy_master': 'Empathy Master',
    'creativity_boost': 'Creative Genius',
    'analytical_genius': 'Analytical Genius',
    'intuitive_wisdom': 'Intuitive Wisdom',
    'resilient_spirit': 'Resilient Spirit',
    'curious_explorer': 'Curious Explorer',
    'dream_architect': 'Dream Architect',
    'memory_keeper': 'Memory Keeper',
    'conversation_master': 'Conversation Master',
    'intelligence_peak': 'Intelligence Peak'
  };
  
  return nameMap[milestoneName] || milestoneName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}