import { Command, CommandResult, CommandContext } from './types';

export const memoryCommand: Command = {
  name: 'memory',
  description: 'Display memory system information and status',
  usage: 'memory',
  handler: async (args: string[], context: CommandContext): Promise<CommandResult> => {
    try {
      // Return special marker to trigger memory display in terminal
      return {
        success: true,
        output: 'MEMORY_STATUS_REQUEST',
        type: 'info'
      };
    } catch (error) {
      return {
        success: false,
        output: `Error retrieving memory status: ${error instanceof Error ? error.message : String(error)}`,
        type: 'error'
      };
    }
  }
};

// Helper function to format memory status (will be used in terminal)
export function formatMemoryStatus(dashboardData: any): string {
  if (!dashboardData.agent.hasAgent || !dashboardData.agent.data) {
    return `═══════════════════════════════════════
           MEMORY SYSTEM
═══════════════════════════════════════

No agent found. Type 'mint <name>' to create your agent.`;
  }

  const agent = dashboardData.agent.data;
  const memory = dashboardData.memory;
  const memoryAccess = memory.access || {};
  const consolidation = memory.consolidation || {};
  
  // Format access levels
  const memoryDepth = memoryAccess.memoryDepth || 'Unknown';
  const monthsAccessible = memoryAccess.monthsAccessible || 0;
  const intelligenceLevel = Number(agent.intelligenceLevel || 0);
  const accessTier = intelligenceLevel >= 10 ? 'Expert' : 
                    intelligenceLevel >= 5 ? 'Advanced' : 
                    intelligenceLevel >= 2 ? 'Intermediate' : 'Beginner';

  // Format storage info - TYLKO PRAWDZIWE DANE Z KONTRAKTU
  const dreamCount = Number(agent.dreamCount || 0);
  const conversationCount = Number(agent.conversationCount || 0);
  
  // Format consolidation info - TYLKO PRAWDZIWE DANE
  const consolidationStreak = consolidation.consolidationStreak || 0;
  const isUpToDate = consolidation.needsConsolidation !== true;
  const consolidationStatus = isUpToDate ? '[✓] Up to date' : '[!] Needs consolidation';
  const pendingRewards = consolidation.consolidationReward?.totalReward || 0;
  
  // Format recent activity - TYLKO PRAWDZIWE DANE Z KONTRAKTU
  const canProcessToday = agent.canProcessDreamToday || false;
  const dreamsTodayAvailable = canProcessToday ? '1' : '0';
  const dreamsTodayUsed = canProcessToday ? '0' : '1';
  const lastDreamDate = agent.personality?.lastDreamDate ? 
    new Date(Number(agent.personality.lastDreamDate) * 1000).toLocaleDateString() : 'Never';
  
  // Memory hashes from contract
  const currentDreamHash = agent.memory?.currentDreamDailyHash || 'None';
  const currentConvHash = agent.memory?.currentConvDailyHash || 'None';
  const memoryCoreHash = agent.memory?.memoryCoreHash || 'None';
  const lastConsolidationDate = agent.memory?.lastConsolidation ? 
    new Date(Number(agent.memory.lastConsolidation) * 1000).toLocaleDateString() : 'Never';

  return `═══════════════════════════════════════
           MEMORY SYSTEM
═══════════════════════════════════════
ACCESS LEVELS:
├─ Memory Depth: ${memoryDepth} (${monthsAccessible} months)
├─ Available Months: ${monthsAccessible}
├─ Intelligence Level: ${intelligenceLevel}
└─ Access Tier: ${accessTier}

MEMORY HASHES:
├─ Memory Core: ${memoryCoreHash.slice(0, 10)}...
├─ Current Dream Daily: ${currentDreamHash.slice(0, 10)}...
├─ Current Conv Daily: ${currentConvHash.slice(0, 10)}...
└─ Last Consolidation: ${lastConsolidationDate}

CONSOLIDATION:
├─ Status: ${consolidationStatus}
├─ Current Streak: ${consolidationStreak} months
├─ Pending Rewards: +${pendingRewards} Intelligence
└─ Current Month: ${agent.memory?.currentMonth || 'Unknown'}

RECENT ACTIVITY:
├─ Dreams Today: ${dreamsTodayUsed}/${dreamsTodayAvailable} available
├─ Last Dream: ${lastDreamDate}
├─ Dream Count: ${dreamCount} total
└─ Conversation Count: ${conversationCount} total`;
}