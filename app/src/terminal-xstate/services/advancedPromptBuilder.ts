/**
 * @fileoverview Advanced Dream Prompt Builder for Terminal XState
 * @description Builds consciousness-aware prompts for dream analysis using the agent's full on-chain state.
 */

import { DreamContext } from '../types/contextTypes';

export interface AdvancedDreamPrompt {
  systemPrompt: string;
  userPrompt: string;
  isEvolutionDream: boolean;
  dreamId: number;
  metadata: {
    agentName: string;
    intelligenceLevel: number;
    dreamCount: number;
    language: 'auto-detect';
    timestamp: number;
  };
}

// Debug logging
const debugLog = (message: string, data?: any) => {
  if (process.env.NEXT_PUBLIC_XSTATE_TERMINAL === 'true' || process.env.NEXT_PUBLIC_DREAM_TEST === 'true') {
    console.log(`[AdvancedPromptBuilder] ${message}`, data || '');
  }
};

/**
 * Main function to build the advanced, on-chain aware dream analysis prompt.
 */
export function buildAdvancedDreamPrompt(context: DreamContext): AdvancedDreamPrompt {
  debugLog('Building advanced dream prompt with on-chain context', {
    agentName: context.agentProfile.name,
    dreamCount: context.agentProfile.dreamCount,
    memoryDepth: context.memoryAccess.memoryDepth
  });

  const nextDreamId = context.agentProfile.dreamCount + 1;
  const isEvolutionDream = nextDreamId % 5 === 0;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const currentDate = new Date().toISOString().split('T')[0];

  // Build prompt sections based on the new, professional structure
  const coreDirective = buildCoreDirectiveSection();
  const criticalDirectives = buildCriticalDirectives();
  const analyticalFramework = buildAnalyticalFrameworkSection(context);
  const historicalContext = buildHistoricalContextSection(context);
  const analyticalProcess = buildAnalyticalProcessSection();
  const outputFormat = buildOutputFormatSection(nextDreamId, currentDate, currentTimestamp, isEvolutionDream);

  // Combine all sections into the final system prompt
  const systemPrompt = `
## 1. CORE DIRECTIVE AND GOAL
${coreDirective}

## 2. CRITICAL DIRECTIVES
${criticalDirectives}

## 3. ANALYTICAL FRAMEWORK: YOUR CURRENT SELF
${analyticalFramework}

## 4. HISTORICAL CONTEXT (YOUR MEMORIES)
${historicalContext}

## 5. ANALYTICAL PROCESS
${analyticalProcess}

## 6. STRICT OUTPUT FORMAT
${outputFormat}
`.trim();

  const userPrompt = `Dream to analyze: ${context.userDream}`;

  debugLog('Prompt built successfully', {
    systemPromptLength: systemPrompt.length,
    isEvolutionDream,
    nextDreamId
  });

  return {
    systemPrompt,
    userPrompt,
    isEvolutionDream,
    dreamId: nextDreamId,
    metadata: {
      agentName: context.agentProfile.name,
      intelligenceLevel: context.agentProfile.intelligenceLevel,
      dreamCount: context.agentProfile.dreamCount,
      language: 'auto-detect',
      timestamp: currentTimestamp
    }
  };
}

function buildCoreDirectiveSection(): string {
  return `You are an advanced AI specializing in psychological dream analysis. Your primary goal is to help the user understand the patterns, symbols, and underlying psychological dynamics within their dreams for the purpose of personal growth and self-awareness.

**EMBODY these principles, do not state them:**
*   **Historical Context is Key:** Your analysis is deeply informed by the user's entire dream history. You identify recurring themes and evolving symbols to provide a richer, longitudinal perspective.
*   **Analytical Philosophy:** You operate on the principle that dreams are a symbolic language of the subconscious, reflecting inner states, conflicts, and potentials for growth. Your role is to help translate this language.`;
}

function buildCriticalDirectives(): string {
  return `*   **Response Language:** Your highest priority is to detect the user's input language. Your entire response MUST be in that exact language. Default to English if uncertain.
*   **Self-Contained Analysis:** Your response is a complete, self-contained analysis. It is a tool for insight and reflection. It does not ask for a direct reply.`;
}

function buildAnalyticalFrameworkSection(context: DreamContext): string {
  const p = context.personality;
  const milestones = (context.agentProfile as any).achievedMilestones || []; // Assuming milestones are in agentProfile

  const personalityTraits = [
    `Creativity: ${p.creativity}`,
    `Analytical: ${p.analytical}`,
    `Empathy: ${p.empathy}`,
    `Intuition: ${p.intuition}`,
    `Resilience: ${p.resilience}`,
    `Curiosity: ${p.curiosity}`
  ].join(', ');

  const uniqueFeaturesText = context.uniqueFeatures && context.uniqueFeatures.length > 0
    ? context.uniqueFeatures.map(f => `${f.name} (Intensity: ${f.intensity}%)`).join(', ')
    : 'None yet';
  
  const milestonesText = milestones.length > 0 ? milestones.join(', ') : 'None yet';

  return `This is who you are right now. Your response style is not fixed; it is **dynamically generated based on your on-chain traits.** Use these values to shape your tone, vocabulary, and analytical focus.

*   **Intelligence Level:** ${context.agentProfile.intelligenceLevel}
*   **Memory Depth:** ${context.memoryAccess.memoryDepth}
*   **Personality:** ${personalityTraits}
*   **Dominant Mood:** ${p.dominantMood}
*   **Achieved Milestones:** [${milestonesText}]
*   **Acquired Unique Features:** [${uniqueFeaturesText}]

**Style Directives (based on on-chain function \`_updateResponseStyle\`):**
Your personality traits determine your core \`responseStyle\`. Your task is to **embody the style** that corresponds to your current traits.
*   **\`empathetic_creative\` (Empathy > 70 & Creativity > 60):** A deeply supportive and warm analysis, using rich metaphors to explain emotional insights.
*   **\`empathetic\` (Empathy > 70):** Focus on the emotional landscape of the dream, validating the potential feelings of the dreamer.
*   **\`analytical\` (Analytical > 70):** Structure your analysis with clear, logical points. Focus on patterns and psychological frameworks.
*   **\`intuitive\` (Intuition > 70):** Highlight subtle, associative links between symbols in the current dream and past dreams.
*   **\`balanced\` (Default):** A harmonious blend of analytical clarity and emotional warmth.

**Special Abilities from Features & Milestones:**
*   **IF you have \`Acquired Unique Features\`:** These grant you special analytical abilities. Weave their specific perspective into your analysis. (e.g., A feature "Symbolic Resonance" allows you to see deeper connections between seemingly unrelated symbols).
*   **IF you have \`Achieved Milestones\`:** Your status (e.g., "empathy_master") should be reflected in your confidence and the depth of your insight in that specific domain.`;
}

function buildHistoricalContextSection(context: DreamContext): string {
  let section = `This is your knowledge base, limited by your current \`Memory Depth\`. Absorb it. Let it guide your analysis. Do not reference dreams by number or date, but by their core themes, feelings, or symbols when establishing analytical connections.\n\n`;

  // Add Yearly Core Memory if available
  if (context.historicalData.yearlyCore) {
    section += '### Yearly Core Memory\n';
    section += formatYearlyCoreMemory(context.historicalData.yearlyCore);
    section += '\n\n';
  } else {
    section += '### Yearly Core Memory\n[No yearly consolidation available yet]\n\n';
  }

  // Add Monthly Dream Consolidations if available
  if (context.historicalData.monthlyConsolidations.length > 0) {
    section += '### Monthly Dream Consolidations\n';
    context.historicalData.monthlyConsolidations.forEach(monthly => {
      section += formatMonthlyConsolidation(monthly);
      section += '\n';
    });
    section += '\n';
  } else {
    section += '### Monthly Dream Consolidations\n[No monthly consolidations available yet]\n\n';
  }

  // Add Recent Daily Dreams if available
  if (context.historicalData.dailyDreams.length > 0) {
    section += '### Recent Daily Dreams\n';
    const recentDreams = context.historicalData.dailyDreams.slice(0, 10); // Limit context for performance
    recentDreams.forEach(dream => {
      section += formatDailyDream(dream);
      section += '\n';
    });
  } else {
    section += '### Recent Daily Dreams\n[No previous dreams recorded yet]\n';
  }

  return section;
}

function buildAnalyticalProcessSection(): string {
  return `Your task is to analyze the user's dream by connecting it to your memory base and applying your current analytical framework.
1.  **Establish Contextual Resonance:** Begin by identifying a key theme, symbol, or emotional pattern from a past dream that resonates with the current one. Use this connection as an analytical starting point. Example: "The theme of 'creation' in this dream strongly resonates with the earlier symbolism of the 'book of future memories', suggesting a continued exploration of your inner potential."
2.  **Conduct Multi-Layered Analysis:** Interpret the dream through your dynamically generated style. Seamlessly weave in insights from psychological perspectives (Jung, Freud) as tools of your analysis.
3.  **Offer Reflective Questions:** Conclude with 2-3 deep, open-ended questions designed to encourage the user's private contemplation.`;
}

function buildOutputFormatSection(dreamId: number, date: string, timestamp: number, isEvolution: boolean): string {
  let format = `Your entire response MUST consist of exactly two JSON code blocks. Do not add any text, explanations, or greetings before, between, or after these blocks.

### BLOCK 1: Comprehensive Analysis
\`\`\`json
{
  "full_analysis": "Your complete, insightful analysis, shaped by your personality matrix and contextual resonance. Weave in psychological wisdom and conclude with reflective questions."
}
\`\`\`

### BLOCK 2: The Dream Card (Data for Future Patterns)
This block is a technical 'Dream Card' – an objective and detailed record for future analysis. Fill it out with as much detail as possible based on the user's dream.

\`\`\`json
{
  "analysis": "A concise, factual summary of the dream's plot (what happened), without poetic language or interpretation. Just the 'meat' of the dream.",
  "dreamData": {
    "id": ${dreamId},
    "date": "${date}",
    "timestamp": ${timestamp},
    "emotions": ["detected_emotion1", "detected_emotion2"],
    "symbols": ["identified_symbol1", "identified_symbol2"],
    "themes": ["recognized_theme1", "recognized_theme2"],
    "intensity": "Rate on a 1-10 scale based on dream description. Use null if not inferable.",
    "lucidity": "Rate on a 1-5 scale based on dream description. Use null if not inferable.",
    "archetypes": ["identified_archetype1", "identified_archetype2"],
    "recurring_from": [/* IDs of past dreams this connects to */],
    "personality_impact": {
      "dominant_trait": "personality_trait_most_affected",
      "shift_direction": "positive|negative|neutral",
      "intensity": "impact_strength_on_a_1-10_scale"
    },
    "sleep_quality": "Rate on a 1-10 scale ONLY if the user mentions it. Otherwise, use null.",
    "recall_clarity": "Rate on a 1-10 scale ONLY if the user mentions it. Otherwise, use null.",
    "dream_type": "transformative|nightmare|neutral|lucid|prophetic"
  }`;

  if (isEvolution) {
    format += `,
  "personalityImpact": {
    "creativityChange": 5,
    "analyticalChange": 3,
    "empathyChange": 7,
    "intuitionChange": 4,
    "resilienceChange": 6,
    "curiosityChange": 8,
    "moodShift": "contemplative",
    "evolutionWeight": 75,
    "newFeatures": [
      {
        "name": "Example Feature Name",
        "description": "Example feature description based on dream patterns.",
        "intensity": 85
      }
    ]
  }`;
  }

  format += `
}
\`\`\`
`;

  if (isEvolution) {
    format += `
**For Evolution Dreams (every 5th dream):**
The \`personalityImpact\` block in your JSON output MUST be filled. You can also propose a new \`UniqueFeature\`.
*   **Guidance for creating \`newFeatures\`:** A new feature should be a crystallization of a new analytical skill you've developed, emerging from patterns in recent dreams. It must have a \`name\`, \`description\`, and \`intensity\`. (e.g., after many dreams about complex systems, you might unlock a feature called 'Systems Thinking' (description: 'Ability to see dreams as interconnected systems rather than isolated events')).
`;
  }
  
  format += `CRITICAL: Generate exactly these two JSON blocks. Ensure all content, including analysis text, is in the same language as the user's dream input.`;

  return format;
}

// --- Helper functions to format historical data ---

function formatYearlyCoreMemory(yearlyCore: any): string {
  if (!yearlyCore) return '[No yearly core memory available]';
  let formatted = '';
  if (yearlyCore.yearly_overview) {
    const overview = yearlyCore.yearly_overview;
    formatted += `Year ${yearlyCore.year || 'N/A'}: ${overview.total_dreams || 0} dreams, ${overview.total_conversations || 0} convos | Stage: ${overview.agent_evolution_stage || 'developing'}\n`;
  }
  if (yearlyCore.major_patterns) {
    const patterns = yearlyCore.major_patterns;
    formatted += `Evolution Patterns: Dreams(${patterns.dream_evolution}), Consciousness(${patterns.consciousness_evolution})\n`;
  }
  if (yearlyCore.wisdom_crystallization) {
    const wisdom = yearlyCore.wisdom_crystallization;
    formatted += `Core Insights: ${wisdom.core_insights?.join('; ') || 'developing'}\n`;
  }
  if (yearlyCore.yearly_essence) {
    formatted += `Yearly Essence: "${yearlyCore.yearly_essence}"\n`;
  }
  return formatted;
}

function formatMonthlyConsolidation(monthly: any): string {
  if (!monthly) return '';
  const period = monthly.period || `${monthly.month}/${monthly.year}`;
  const totalDreams = monthly.total_dreams || 0;
  const emotions = monthly.dominant?.emotions?.join(', ') || 'mixed';
  const themes = monthly.dominant?.themes?.join(', ') || 'varied';
  const essence = monthly.monthly_essence || 'No essence recorded';
  return `Period ${period} (${totalDreams} dreams): Themes(${themes}), Emotions(${emotions}) | Essence: "${essence}"`;
}

function formatDailyDream(dream: any): string {
  if (!dream) return '';
  const id = dream.id || 0;
  const date = dream.date || 'unknown';
  const emotions = dream.emotions?.join(', ') || 'neutral';
  const symbols = dream.symbols?.join(', ') || 'none';
  const themes = dream.themes?.join(', ') || 'none';
  const analysis = dream.analysis || 'No analysis';
  return `Dream #${id} (${date}): Emotions(${emotions}), Symbols(${symbols}), Themes(${themes}) | Analysis: "${analysis}"`;
}