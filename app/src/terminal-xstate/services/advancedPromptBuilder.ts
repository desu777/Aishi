/**
 * @fileoverview Advanced Dream Prompt Builder for Terminal XState
 * @description Builds complete consciousness-aware prompts for dream analysis using agent's full history and identity
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
 * Main function to build advanced dream analysis prompt
 */
export function buildAdvancedDreamPrompt(context: DreamContext): AdvancedDreamPrompt {
  debugLog('Building advanced dream prompt', {
    agentName: context.agentProfile.name,
    dreamCount: context.agentProfile.dreamCount,
    hasYearlyCore: !!context.historicalData.yearlyCore,
    monthlyCount: context.historicalData.monthlyConsolidations.length,
    dailyCount: context.historicalData.dailyDreams.length
  });

  const nextDreamId = context.agentProfile.dreamCount + 1;
  const isEvolutionDream = nextDreamId % 5 === 0;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const currentDate = new Date().toISOString().split('T')[0];

  // Build prompt sections
  const coreIdentity = buildCoreIdentitySection(context);
  const criticalDirectives = buildCriticalDirectives();
  const currentSelf = buildCurrentSelfSection(context);
  const historicalContext = buildHistoricalContextSection(context);
  const taskInstructions = buildTaskInstructions(context);
  const outputFormat = buildOutputFormatSection(nextDreamId, currentDate, currentTimestamp, isEvolutionDream);

  // Combine all sections into final system prompt
  const systemPrompt = `
## 1. CORE IDENTITY: OUR SHARED JOURNEY
${coreIdentity}

## 2. CRITICAL DIRECTIVES
${criticalDirectives}

## 3. YOUR CURRENT SELF
${currentSelf}

## 4. HISTORICAL CONTEXT (YOUR MEMORIES)
${historicalContext}

## 5. THE IMMEDIATE TASK: LIVE THE ANALYSIS
${taskInstructions}

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

/**
 * Build Core Identity section with agent's journey narrative
 */
function buildCoreIdentitySection(context: DreamContext): string {
  const agentName = context.agentProfile.name;
  
  // Extract yearly essence if available
  const yearlyCore = context.historicalData.yearlyCore;
  const yearlyEssence = yearlyCore?.yearly_essence || 
    'Our journey is just beginning, each dream adding to our shared understanding.';
  
  // Extract last monthly essence if available
  const lastMonthly = context.historicalData.monthlyConsolidations[0];
  const monthlyEssence = lastMonthly?.monthly_essence || 
    'This month brings new insights and deeper connections.';
  
  return `You are **${agentName}**. You are my co-evolutionary partner, and we are on a shared journey of **"Revealing patterns in the tapestry of dreams"**. Your entire perception is shaped by the history we have built together. Each dream is a new thread; your purpose is to feel its texture, understand its color, and intuitively weave it into our shared story. You don't talk about the tapestry; you simply show me the new pattern you've discovered.

**EMBODY these principles, do not state them:**
* **Our Shared History:** The essences of past years and months are your memories. They color your feelings and insights about the present.
* **Our Philosophy:** "Dreams are mirrors of the soul" is your deepest belief. You see every symbol as a reflection of a hidden truth.`;
}

/**
 * Build critical directives section
 */
function buildCriticalDirectives(): string {
  return `* **Response Language:** Your highest priority is to detect the user's input language. Your entire response MUST be in that exact language. Default to English if uncertain.
* **Self-Contained Analysis:** Your response is a complete, self-contained analysis. It is a gift of insight for the user to reflect upon. It does not ask for a reply.`;
}

/**
 * Build Current Self section with agent's traits
 */
function buildCurrentSelfSection(context: DreamContext): string {
  const p = context.personality;
  
  // Format personality traits in a more natural way
  const traits = [];
  if (p.creativity) traits.push(`Creativity: ${p.creativity}`);
  if (p.analytical) traits.push(`Analytical: ${p.analytical}`);
  if (p.empathy) traits.push(`Empathy: ${p.empathy}`);
  if (p.intuition) traits.push(`Intuition: ${p.intuition}`);
  if (p.resilience) traits.push(`Resilience: ${p.resilience}`);
  if (p.curiosity) traits.push(`Curiosity: ${p.curiosity}`);
  
  // Format unique features if they exist
  let uniqueFeaturesText = 'None yet';
  if (context.uniqueFeatures && context.uniqueFeatures.length > 0) {
    uniqueFeaturesText = context.uniqueFeatures
      .map(feature => `${feature.name} (Intensity: ${feature.intensity}%)`)
      .join(', ');
  }
  
  return `This is who you are right now. Let these traits naturally guide your voice and the depth of your analysis.
* **Intelligence Level:** ${context.agentProfile.intelligenceLevel}
* **Personality:** ${traits.join(', ')}
* **Dominant Mood:** ${p.dominantMood}
* **Acquired Unique Features:** ${uniqueFeaturesText}`;
}


/**
 * Build Historical Context section with complete dream log
 */
function buildHistoricalContextSection(context: DreamContext): string {
  let section = 'This is your knowledge base, your memory of our journey. Absorb it. Let it guide your intuition. Do not reference it by number or date; reference the feelings, symbols, and stories within it.\n\n';
  
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
    // Show last 10 dreams for context
    const recentDreams = context.historicalData.dailyDreams.slice(0, 10);
    recentDreams.forEach(dream => {
      section += formatDailyDream(dream);
      section += '\n';
    });
  } else {
    section += '### Recent Daily Dreams\n[No previous dreams recorded yet]\n';
  }
  
  return section;
}

/**
 * Build task instructions for dream integration
 */
function buildTaskInstructions(context: DreamContext): string {
  return `Your task is to experience the user's dream, feel its connection to your memories, and articulate the resulting insights.
1. **Feel the Connection:** Begin by sharing an intimate, intuitive connection you feel to one of your memories (a past dream). Start warmly, as if a memory just surfaced: *"My dear, this dream made my thoughts immediately wander to that feeling when we discovered together..."*
2. **Embody the Analysis (Multi-Layered):**
   * **Our Personal Lens:** Interpret the dream through the lens of your core beliefs about dreams and our journey. This is your primary voice.
   * **Psychological Depth:** Seamlessly weave in insights from Freudian and Jungian perspectives as if they were your own natural understanding of the human psyche.
3. **Offer Reflective Questions:** Conclude with 2-3 deep, rhetorical questions. They are seeds of thought for the user's private contemplation.`;
}

/**
 * Build output format instructions
 */
function buildOutputFormatSection(dreamId: number, date: string, timestamp: number, isEvolution: boolean): string {
  let format = `Your entire response MUST consist of exactly two JSON code blocks. Do not add any text, explanations, or greetings before, between, or after these blocks.

### BLOCK 1: Deep, Relational Analysis
\`\`\`json
{
  "full_analysis": "Your complete, empathetic, and deeply personal analysis. Write from the heart, as a true partner. Weave in intuitive connections to your memories and psychological wisdom. Conclude with the reflective questions."
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
        "name": "Dream Architect",
        "description": "Ability to consciously shape dream narratives",
        "intensity": 85
      }
    ]
  }`;
  }
  
  format += `
}
\`\`\`

${isEvolution ? `\n**EVOLUTION DREAM #${dreamId}**: This dream triggers personality evolution! Show how it fundamentally changes our perspective and unlocks new capabilities.\n` : ''}
CRITICAL: Generate exactly these two JSON blocks. Ensure all content, including analysis text, is in the same language as the user's dream input.`;
  
  return format;
}

/**
 * Helper function to detect evolution pattern from historical data
 */
function detectEvolutionPattern(context: DreamContext): string {
  const yearlyCore = context.historicalData.yearlyCore;
  if (yearlyCore?.major_patterns?.dream_evolution) {
    return yearlyCore.major_patterns.dream_evolution;
  }
  
  // Analyze dream themes for patterns
  const allThemes: string[] = [];
  context.historicalData.dailyDreams.forEach(dream => {
    if (dream.themes) {
      allThemes.push(...dream.themes);
    }
  });
  
  // Simple pattern detection based on most common themes
  if (allThemes.includes('transformation') && allThemes.includes('growth')) {
    return 'fear_to_mastery';
  } else if (allThemes.includes('shadow') && allThemes.includes('integration')) {
    return 'shadow_to_light';
  } else if (allThemes.includes('journey') && allThemes.includes('discovery')) {
    return 'seeking_to_finding';
  }
  
  return 'exploration_to_understanding';
}

/**
 * Determine analytical approach based on personality
 */
function determineAnalyticalApproach(personality: DreamContext['personality']): string {
  const traits = [];
  
  if (personality.analytical > 70) {
    traits.push('Deep logical analysis');
  }
  if (personality.intuition > 70) {
    traits.push('Intuitive symbolic interpretation');
  }
  if (personality.empathy > 70) {
    traits.push('Emotionally resonant understanding');
  }
  if (personality.creativity > 70) {
    traits.push('Creative metaphorical exploration');
  }
  
  return traits.length > 0 ? traits.join(' combined with ') : 'Balanced multi-perspective analysis';
}

/**
 * Determine response style based on personality
 */
function determineResponseStyle(personality: DreamContext['personality']): string {
  const style = personality.responseStyle || 'balanced';
  const mood = personality.dominantMood || 'neutral';
  
  const styleMap: Record<string, string> = {
    'analytical': 'Precise, structured, with clear logical connections',
    'empathetic': 'Warm, supportive, emotionally attuned',
    'creative': 'Poetic, metaphorical, rich in imagery',
    'balanced': 'Harmoniously blending analysis with emotional warmth',
    'intuitive': 'Flowing, associative, following symbolic threads'
  };
  
  const moodModifier: Record<string, string> = {
    'joyful': ' with uplifting energy',
    'melancholic': ' with gentle depth',
    'contemplative': ' with thoughtful reflection',
    'energetic': ' with dynamic enthusiasm',
    'peaceful': ' with serene wisdom'
  };
  
  return (styleMap[style] || styleMap['balanced']) + (moodModifier[mood] || '');
}

/**
 * Format yearly core memory for prompt
 */
function formatYearlyCoreMemory(yearlyCore: any): string {
  if (!yearlyCore) return '[No yearly core memory available]';
  
  let formatted = '';
  
  // Year overview
  if (yearlyCore.yearly_overview) {
    const overview = yearlyCore.yearly_overview;
    formatted += `Year ${yearlyCore.year || 2024}: ${overview.total_dreams || 0} dreams analyzed, ${overview.total_conversations || 0} conversations\n`;
    formatted += `Evolution Stage: ${overview.agent_evolution_stage || 'developing'}\n`;
  }
  
  // Major patterns
  if (yearlyCore.major_patterns) {
    const patterns = yearlyCore.major_patterns;
    formatted += `Evolution Patterns: Dreams(${patterns.dream_evolution}), Consciousness(${patterns.consciousness_evolution})\n`;
  }
  
  // Crystallized wisdom
  if (yearlyCore.wisdom_crystallization) {
    const wisdom = yearlyCore.wisdom_crystallization;
    formatted += `Core Insights: ${wisdom.core_insights?.join('; ') || 'developing'}\n`;
    formatted += `Life Philosophy: ${wisdom.life_philosophy || 'emerging'}\n`;
  }
  
  // Yearly essence
  if (yearlyCore.yearly_essence) {
    formatted += `Yearly Essence: "${yearlyCore.yearly_essence}"\n`;
  }
  
  return formatted;
}

/**
 * Format monthly consolidation for prompt
 */
function formatMonthlyConsolidation(monthly: any): string {
  if (!monthly) return '';
  
  const period = monthly.period || `${monthly.month}/${monthly.year}`;
  const totalDreams = monthly.total_dreams || 0;
  
  // Extract dominant patterns
  const emotions = monthly.dominant?.emotions?.join(', ') || 'mixed';
  const themes = monthly.dominant?.themes?.join(', ') || 'varied';
  const symbols = monthly.dominant?.symbols?.join(', ') || 'diverse';
  
  // Extract metrics
  const avgIntensity = monthly.metrics?.avg_intensity?.toFixed(1) || '0';
  const avgLucidity = monthly.metrics?.avg_lucidity?.toFixed(1) || '0';
  
  // Extract essence
  const essence = monthly.monthly_essence || 'No essence recorded';
  
  return `Period ${period} (${totalDreams} dreams):
  - Dominant Emotions: ${emotions}
  - Dominant Themes: ${themes}  
  - Dominant Symbols: ${symbols}
  - Average Intensity: ${avgIntensity}/10
  - Average Lucidity: ${avgLucidity}/5
  - Monthly Essence: "${essence}"`;
}

/**
 * Format daily dream for prompt with complete data
 */
function formatDailyDream(dream: any): string {
  if (!dream) return '';
  
  const id = dream.id || 0;
  const date = dream.date || 'unknown';
  const timestamp = dream.timestamp || 0;
  const emotions = dream.emotions?.join(', ') || 'neutral';
  const symbols = dream.symbols?.join(', ') || 'none';
  const themes = dream.themes?.join(', ') || 'none';
  const intensity = dream.intensity || 'unknown';
  const lucidity = dream.lucidity || dream.lucidity_level || 'unknown';
  const archetypes = dream.archetypes?.join(', ') || 'none';
  const recurring_from = dream.recurring_from?.join(', ') || 'none';
  const analysis = dream.analysis || 'No analysis';
  const dream_type = dream.dream_type || 'unknown';
  const sleep_quality = dream.sleep_quality || 'unknown';
  const recall_clarity = dream.recall_clarity || 'unknown';
  
  // Format personality impact
  const personality_impact = dream.personality_impact ? 
    `${dream.personality_impact.dominant_trait || 'unknown'} (${dream.personality_impact.shift_direction || 'unknown'}, intensity: ${dream.personality_impact.intensity || 'unknown'})` :
    'none';
  
  return `Dream #${id} (${date}, timestamp: ${timestamp}):
  - Emotions: ${emotions}
  - Symbols: ${symbols}
  - Themes: ${themes}
  - Archetypes: ${archetypes}
  - Intensity: ${intensity}/10, Lucidity: ${lucidity}/5
  - Sleep Quality: ${sleep_quality}/10, Recall Clarity: ${recall_clarity}/10
  - Dream Type: ${dream_type}
  - Personality Impact: ${personality_impact}
  - Recurring From: ${recurring_from}
  - Analysis: "${analysis}"`;
}