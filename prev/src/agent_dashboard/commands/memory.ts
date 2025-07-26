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
    return `╔══════════════════════════════════════════════╗
║               MEMORY CORE                    ║
╠══════════════════════════════════════════════╣
║                                              ║
║  No agent found. Type 'mint <name>' to      ║
║  initialize memory core.                     ║
║                                              ║
╚══════════════════════════════════════════════╝`;
  }

  const agent = dashboardData.agent.data;
  const memory = dashboardData.memory;
  const memoryAccess = memory?.access || {};
  const consolidation = memory?.consolidation || {};
  
  // Format access levels based on intelligence
  const memoryDepth = memoryAccess.memoryDepth || 'Unknown';
  const monthsAccessible = Number(memoryAccess.monthsAccessible || 0);
  
  // Format consolidation data
  const consolidationStreak = Number(dashboardData.stats?.consolidationStreak || 0);
  const isUpToDate = consolidation.needsConsolidation !== true;
  const consolidationStatus = isUpToDate ? '✓ SYNCHRONIZED' : '! NEEDS SYNC';
  const pendingRewards = Number(consolidation.consolidationReward?.totalReward || 0);
  
  // Memory hashes from contract
  const currentDreamHash = agent.memory?.currentDreamDailyHash || '';
  const currentConvHash = agent.memory?.currentConvDailyHash || '';
  const memoryCoreHash = agent.memory?.memoryCoreHash || '';
  const lastConsolidationDate = agent.memory?.lastConsolidation ? 
    new Date(Number(agent.memory.lastConsolidation) * 1000).toLocaleDateString() : 'Never';
  const currentMonth = agent.memory?.currentMonth ? Number(agent.memory.currentMonth) : new Date().getMonth() + 1;
  const currentYear = agent.memory?.currentYear ? Number(agent.memory.currentYear) : new Date().getFullYear();

  // Create visual memory access bar (months accessible / 60 max)
  const createAccessBar = (months: number, maxMonths: number = 60) => {
    const filled = Math.floor((months / maxMonths) * 20); // 0-20 chars
    const empty = 20 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  };

  // Format hash preview (first 8 chars or show status)
  const formatHash = (hash: string, label: string) => {
    if (!hash || hash === '0x0000000000000000000000000000000000000000000000000000000000000000') {
      return `${label}: [EMPTY]`.padEnd(32);
    }
    const preview = hash.startsWith('0x') ? hash.slice(2, 10) : hash.slice(0, 8);
    return `${label}: ${preview.toUpperCase()}`.padEnd(32);
  };

  // Create consolidation streak indicator with cyberpunk symbols
  const createStreakIndicator = (streak: number) => {
    if (streak >= 24) return '◆◆◆◆◆'; // Eternal Memory
    if (streak >= 12) return '◆◆◆◆◇'; // Memory Master  
    if (streak >= 6) return '◆◆◆◇◇';  // Memory Guardian
    if (streak >= 3) return '◆◆◇◇◇';  // Memory Keeper
    if (streak >= 1) return '◆◇◇◇◇';  // Active
    return '◇◇◇◇◇';                  // Inactive
  };

  // Memory hierarchy status indicators
  const dailyStatus = (currentDreamHash && currentConvHash) ? '●' : '◐';
  const monthlyStatus = consolidation.needsConsolidation ? '◐' : '●';
  const yearlyStatus = memoryCoreHash ? '●' : '○';

  return `╔══════════════════════════════════════════════╗
║               MEMORY CORE                    ║
╠══════════════════════════════════════════════╣
║                                              ║
║  MEMORY ACCESS MATRIX:                       ║
║  Depth Range: ${memoryDepth.padEnd(30)} ║
║  Access Level ${createAccessBar(monthsAccessible)} ${String(monthsAccessible).padStart(2)}/60 ║
║                                              ║
║  HIERARCHY STATUS:                           ║
║  ${dailyStatus} Daily Layer    │ Current period active      ║
║  ${monthlyStatus} Monthly Layer  │ ${String(currentMonth).padStart(2)}/${currentYear} consolidation     ║
║  ${yearlyStatus} Yearly Core    │ Long-term memory archive  ║
║                                              ║
║  STORAGE FRAGMENTS:                          ║
║  ${formatHash(memoryCoreHash, 'CORE')}║
║  ${formatHash(currentDreamHash, 'DREAMS')}║
║  ${formatHash(currentConvHash, 'CONVOS')}║
║                                              ║
║  CONSOLIDATION ENGINE:                       ║
║  Status: ${consolidationStatus.padEnd(31)} ║
║  Streak: ${createStreakIndicator(consolidationStreak)} ${String(consolidationStreak).padStart(2)} months    ║
║  Rewards: +${String(pendingRewards)} INT pending             ║
║  Last Sync: ${lastConsolidationDate.padEnd(28)} ║
║                                              ║
╚══════════════════════════════════════════════╝`;
}