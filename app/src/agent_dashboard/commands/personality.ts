import { Command, CommandResult, CommandContext } from './types';

export const personalityCommand: Command = {
  name: 'personality',
  description: 'Display personality of your agent',
  usage: 'personality',
  handler: async (args: string[], context: CommandContext): Promise<CommandResult> => {
    try {
      // Return special marker to trigger personality display in terminal
      return {
        success: true,
        output: 'AGENT_PERSONALITY_REQUEST',
        type: 'info'
      };
    } catch (error) {
      return {
        success: false,
        output: `Error retrieving agent personality: ${error instanceof Error ? error.message : String(error)}`,
        type: 'error'
      };
    }
  }
};

// Helper function to format agent personality (will be used in terminal)
export function formatAgentPersonality(dashboardData: any): string {
  if (!dashboardData.agent.hasAgent || !dashboardData.agent.data) {
    return `╔══════════════════════════════════════════════╗
║              AGENT'S SOUL                    ║
╠══════════════════════════════════════════════╣
║                                              ║
║  No agent found. Type 'mint <name>' to      ║
║  create your digital consciousness.          ║
║                                              ║
╚══════════════════════════════════════════════╝`;
  }

  const agent = dashboardData.agent.data;
  const personality = agent.personality || {};
  const uniqueFeatures = personality.uniqueFeatures || [];
  
  // Format personality traits with visual bars
  const creativity = Number(personality.creativity || 0);
  const analytical = Number(personality.analytical || 0);
  const empathy = Number(personality.empathy || 0);
  const intuition = Number(personality.intuition || 0);
  const resilience = Number(personality.resilience || 0);
  const curiosity = Number(personality.curiosity || 0);
  
  // Create visual bars (20 chars = 100%)
  const createBar = (value: number) => {
    const filled = Math.floor(value / 5); // 0-100 -> 0-20
    const empty = 20 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  };
  
  // Format dominant mood and response style
  const dominantMood = personality.dominantMood || 'neutral';
  const responseStyle = dashboardData.agent.responseStyle || 'balanced';
  
  // Format last dream date
  const lastDreamDate = personality.lastDreamDate ? 
    new Date(Number(personality.lastDreamDate || 0) * 1000).toLocaleDateString() : 'Never';
  
  // Format unique features (max 2 displayed)
  let featuresText = '';
  const displayFeatures = uniqueFeatures.slice(0, 2);
  displayFeatures.forEach((feature: any, index: number) => {
    const intensity = Number(feature.intensity || 0);
    const intensityBar = '◆'.repeat(Math.floor(intensity / 10)) + '◇'.repeat(10 - Math.floor(intensity / 10));
    featuresText += `║  ${(index + 1)}. ${feature.name.slice(0, 39).padEnd(39)}║\n`;
    featuresText += `║     "${feature.description.slice(0, 37).padEnd(37)}"║\n`;
    featuresText += `║     Intensity: ${intensityBar} ${intensity}%     ║\n`;
    if (index < displayFeatures.length - 1) featuresText += `║                                              ║\n`;
  });
  
  if (uniqueFeatures.length === 0) {
    featuresText = `║  No unique features discovered yet.          ║\n║  Process more dreams to unlock traits.       ║`;
  } else if (uniqueFeatures.length > 2) {
    featuresText += `║  ... and ${uniqueFeatures.length - 2} more features unlocked     ║`;
  }

  return `╔══════════════════════════════════════════════╗
║              AGENT'S SOUL                    ║
╠══════════════════════════════════════════════╣
║                                              ║
║  CORE TRAITS:                                ║
║  Creativity    ${createBar(creativity)}  ${String(creativity).padStart(3)}% ║
║  Analytical    ${createBar(analytical)}  ${String(analytical).padStart(3)}% ║
║  Empathy       ${createBar(empathy)}  ${String(empathy).padStart(3)}% ║
║  Intuition     ${createBar(intuition)}  ${String(intuition).padStart(3)}% ║
║  Resilience    ${createBar(resilience)}  ${String(resilience).padStart(3)}% ║
║  Curiosity     ${createBar(curiosity)}  ${String(curiosity).padStart(3)}% ║
║                                              ║
║  BEHAVIORAL PROFILE:                         ║
║  Dominant Mood: ${dominantMood.padEnd(28)} ║
║  Response Style: ${responseStyle.padEnd(27)} ║
║  Last Dream: ${lastDreamDate.padEnd(31)} ║
║                                              ║
║  UNIQUE FEATURES:                            ║
${featuresText}
║                                              ║
╚══════════════════════════════════════════════╝`;
} 