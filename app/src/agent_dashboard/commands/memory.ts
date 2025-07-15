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

  // Format storage info (mock calculations)
  const dreamCount = Number(agent.dreamCount || 0);
  const conversationCount = Number(agent.conversationCount || 0);
  const dreamStorageKB = dreamCount * 50; // Mock: 50KB per dream
  const conversationStorageKB = conversationCount * 80; // Mock: 80KB per conversation
  const memoryCoreKB = 856; // Mock memory core size
  const totalStorageKB = dreamStorageKB + conversationStorageKB + memoryCoreKB;

  // Format consolidation info
  const consolidationStreak = consolidation.consolidationStreak || 0;
  const isUpToDate = consolidation.needsConsolidation !== true;
  const consolidationStatus = isUpToDate ? '✅ Up to date' : '⚠️ Needs consolidation';
  const nextDue = '25 days'; // Mock - should be calculated from current date
  const pendingRewards = consolidation.consolidationReward?.totalReward || 0;

  // Format recent activity
  const canProcessToday = agent.canProcessDreamToday || false;
  const dreamsTodayAvailable = canProcessToday ? '1' : '0';
  const dreamsTodayUsed = canProcessToday ? '0' : '1';
  const lastDreamDate = agent.personality?.lastDreamDate ? 
    new Date(Number(agent.personality.lastDreamDate) * 1000).toLocaleDateString() : 'Never';
  const activeConversations = 3; // Mock data
  const memoryUpdates = 12; // Mock data

  return `═══════════════════════════════════════
           MEMORY SYSTEM
═══════════════════════════════════════
ACCESS LEVELS:
├─ Memory Depth: ${memoryDepth} (${monthsAccessible} months)
├─ Available Months: ${monthsAccessible}
├─ Intelligence Level: ${intelligenceLevel}
└─ Access Tier: ${accessTier}

STORAGE:
├─ Dream Storage: ${(dreamStorageKB / 1024).toFixed(1)} MB used
├─ Conversation Storage: ${(conversationStorageKB / 1024).toFixed(1)} MB used
├─ Memory Core: ${memoryCoreKB} KB used
└─ Total Usage: ${(totalStorageKB / 1024).toFixed(3)} MB

CONSOLIDATION:
├─ Status: ${consolidationStatus}
├─ Next Due: ${nextDue}
├─ Current Streak: ${consolidationStreak} months
└─ Pending Rewards: +${pendingRewards} Intelligence

RECENT ACTIVITY:
├─ Dreams Today: ${dreamsTodayUsed}/${dreamsTodayAvailable} available
├─ Last Dream: ${lastDreamDate}
├─ Active Conversations: ${activeConversations}
└─ Memory Updates: ${memoryUpdates} this month`;
}