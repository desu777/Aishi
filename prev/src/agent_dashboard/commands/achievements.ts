import { Command, CommandResult, CommandContext } from './types';

export const achievementsCommand: Command = {
  name: 'achievements',
  description: 'Display agent milestones, achievements, and growth analytics',
  usage: 'achievements',
  handler: async (args: string[], context: CommandContext): Promise<CommandResult> => {
    try {
      // Return special marker to trigger achievements display in terminal
      return {
        success: true,
        output: 'ACHIEVEMENTS_REQUEST',
        type: 'info'
      };
    } catch (error) {
      return {
        success: false,
        output: `Error retrieving achievements: ${error instanceof Error ? error.message : String(error)}`,
        type: 'error'
      };
    }
  }
};

// Helper function to format achievements (will be used in terminal)
export function formatAchievements(dashboardData: any): string {
  if (!dashboardData.agent.hasAgent || !dashboardData.agent.data) {
    return `╔══════════════════════════════════════════════╗
║            ACHIEVEMENTS                      ║
╠══════════════════════════════════════════════╣
║                                              ║
║  No agent found. Type 'mint <name>' to      ║
║  begin your achievement journey.             ║
║                                              ║
╚══════════════════════════════════════════════╝`;
  }

  const agent = dashboardData.agent.data;
  const stats = dashboardData.stats;
  
  // Evolution Stats
  const totalEvolutions = Number(agent.totalEvolutions || 0);
  const lastEvolution = agent.lastEvolutionDate ? 
    new Date(Number(agent.lastEvolutionDate) * 1000).toLocaleDateString() : 'Never';
  const evolutionRate = stats.evolutionStats?.evolutionRate || 0;
  
  // Intelligence & Activity
  const intelligenceLevel = Number(agent.intelligenceLevel || 0);
  const dreamCount = Number(agent.dreamCount || 0);
  const conversationCount = Number(agent.conversationCount || 0);
  const totalActivity = dreamCount + conversationCount;
  
  // Consolidation rewards (only show total)
  const pendingRewards = Number(dashboardData.memory?.consolidation?.consolidationReward?.totalReward || 0);
  const consolidationStreak = Number(stats.consolidationStreak || 0);
  
  // Achievement milestones from contract
  const achievedMilestones = agent.achievedMilestones || [];
  const milestoneList = stats.milestones || [];
  
  // Define all possible milestones with icons and descriptions
  const allMilestones = {
    // Personality Milestones
    'empathy_master': { icon: '💖', name: 'Empathy Master', desc: 'Reach 85 empathy', req: 'Empathy ≥ 85' },
    'creative_genius': { icon: '🎨', name: 'Creative Genius', desc: 'Reach 90 creativity', req: 'Creativity ≥ 90' },
    'logic_lord': { icon: '🧠', name: 'Logic Lord', desc: 'Reach 90 analytical', req: 'Analytical ≥ 90' },
    'spiritual_guide': { icon: '🔮', name: 'Spiritual Guide', desc: 'Reach 90 intuition', req: 'Intuition ≥ 90' },
    'balanced_soul': { icon: '⚖️', name: 'Balanced Soul', desc: 'All traits above 60', req: 'All Traits ≥ 60' },
    
    // Memory Milestones
    'memory_keeper': { icon: '📚', name: 'Memory Keeper', desc: '3 month consolidation streak', req: '3 Months' },
    'memory_guardian': { icon: '🛡️', name: 'Memory Guardian', desc: '6 month consolidation streak', req: '6 Months' },
    'memory_master': { icon: '👑', name: 'Memory Master', desc: '12 month consolidation streak', req: '12 Months' },
    'eternal_memory': { icon: '💎', name: 'Eternal Memory', desc: '24 month consolidation streak', req: '24 Months' }
  };
  
  // Create achievement display
  let achievementDisplay = '';
  let achievedCount = 0;
  
  // Show achieved milestones
  for (const [key, milestone] of Object.entries(allMilestones)) {
    const isAchieved = achievedMilestones.includes(key);
    if (isAchieved) {
      achievedCount++;
      achievementDisplay += `║  ${milestone.icon} ${milestone.name.padEnd(18)} ✓ UNLOCKED  ║\n`;
    } else {
      achievementDisplay += `║  ○ ${milestone.name.padEnd(18)} ${milestone.req.padStart(11)} ║\n`;
    }
  }
  
  // Progress bars for key metrics
  const createProgressBar = (current: number, target: number, length: number = 15) => {
    const progress = Math.min(current / target, 1);
    const filled = Math.floor(progress * length);
    const empty = length - filled;
    const percentage = Math.floor(progress * 100);
    return {
      bar: '█'.repeat(filled) + '░'.repeat(empty),
      percent: `${percentage}%`
    };
  };
  
  // Intelligence progress (next milestone at multiples of 10)
  const nextIntLevel = Math.ceil(intelligenceLevel / 10) * 10;
  const intProgress = createProgressBar(intelligenceLevel, nextIntLevel);
  
  // Activity progress (next milestone: 100, 365, 1000)
  let nextActivityMilestone = 100;
  if (totalActivity >= 1000) nextActivityMilestone = 2000;
  else if (totalActivity >= 365) nextActivityMilestone = 1000;
  else if (totalActivity >= 100) nextActivityMilestone = 365;
  
  const activityProgress = createProgressBar(totalActivity, nextActivityMilestone);
  
  return `╔══════════════════════════════════════════════╗
║            ACHIEVEMENTS                      ║
╠══════════════════════════════════════════════╣
║                                              ║
║  📊 GROWTH ANALYTICS:                        ║
║  Intelligence: ${String(intelligenceLevel).padStart(3)} LVL ${intProgress.bar} ${intProgress.percent.padStart(4)} ║
║  Evolution Rate: ${String(evolutionRate).padEnd(3)}% │ Total: ${String(totalEvolutions).padStart(2)} changes ║
║  Last Evolution: ${lastEvolution.padEnd(28)} ║
║                                              ║
║  🎯 ACTIVITY PROGRESS:                       ║
║  Total Interactions ${activityProgress.bar} ${String(totalActivity).padStart(4)}   ║
║  ├─ Dreams: ${String(dreamCount).padStart(3)}  │  Conversations: ${String(conversationCount).padStart(3)} ║
║  └─ Next Milestone: ${String(nextActivityMilestone).padEnd(26)} ║
║                                              ║
║  🏆 MILESTONES (${String(achievedCount).padStart(1)}/${Object.keys(allMilestones).length}):                   ║
${achievementDisplay}║                                              ║
║  💰 PENDING REWARDS:                         ║
║  Consolidation Bonus: +${String(pendingRewards).padStart(2)} Intelligence      ║
║  Current Streak: ${String(consolidationStreak).padStart(2)} months              ║
║                                              ║
╚══════════════════════════════════════════════╝`;
}