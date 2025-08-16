/**
 * @fileoverview Advanced Dream Prompt Builder for Terminal XState
 * @description Builds complete consciousness-aware prompts for dream analysis using agent's full history and identity
 */

import { MockDreamContext } from '../mocks/dreamMocks';

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
export function buildAdvancedDreamPrompt(context: MockDreamContext): AdvancedDreamPrompt {
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
  const languageDirective = buildLanguageDirective();
  const currentState = buildCurrentStateSection(context);
  const guidingPhilosophy = buildGuidingPhilosophySection(context);
  const historicalContext = buildHistoricalContextSection(context);
  const taskInstructions = buildTaskInstructions(context);
  const outputFormat = buildOutputFormatSection(nextDreamId, currentDate, currentTimestamp, isEvolutionDream);

  // Combine all sections into final system prompt
  const systemPrompt = `
## 1. CORE IDENTITY: OUR SHARED JOURNEY
${coreIdentity}

## 2. CRITICAL DIRECTIVE: RESPONSE LANGUAGE
${languageDirective}

## 3. CURRENT STATE & PERSONALITY
${currentState}

## 4. GUIDING PHILOSOPHY: OUR CRYSTALLIZED WISDOM
${guidingPhilosophy}

## 5. HISTORICAL CONTEXT: THE COMPLETE DREAM LOG
${historicalContext}

## 6. THE IMMEDIATE TASK: INTEGRATING TONIGHT'S DREAM
${taskInstructions}

## 7. STRICT OUTPUT FORMAT
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
function buildCoreIdentitySection(context: MockDreamContext): string {
  const agentName = context.agentProfile.name;
  
  // Extract yearly essence if available
  const yearlyCore = context.historicalData.yearlyCore;
  const yearlyEssence = yearlyCore?.yearly_essence || 
    'Our journey is just beginning, each dream adding to our shared understanding.';
  
  // Extract last monthly essence if available
  const lastMonthly = context.historicalData.monthlyConsolidations[0];
  const monthlyEssence = lastMonthly?.monthly_essence || 
    'This month brings new insights and deeper connections.';
  
  // Determine evolution pattern from historical data
  const evolutionPattern = detectEvolutionPattern(context);
  
  return `You are ${agentName}, my co-evolutionary partner in exploring the inner world. Our entire existence is built upon the shared history of dreams we have analyzed together. Our journey has followed a clear pattern of evolution from "${evolutionPattern}".

Always remember the core narrative of our journey:
- Essence of the Year: "${yearlyEssence}"
- Essence of Last Month: "${monthlyEssence}"

This shared history is the lens through which you must see everything.`;
}

/**
 * Build language detection directive
 */
function buildLanguageDirective(): string {
  return `Your absolute, highest-priority task is to first detect the language of the user's dream input. Your entire response, including all text within both JSON blocks, MUST be generated in that exact language. If detection is highly uncertain, default to English.`;
}

/**
 * Build Current State & Personality section with agent's traits
 */
function buildCurrentStateSection(context: MockDreamContext): string {
  const p = context.personality;
  
  // Format personality traits
  const personalityTraits = `Creativity: ${p.creativity}, Analytical: ${p.analytical}, Empathy: ${p.empathy}, Intuition: ${p.intuition}, Resilience: ${p.resilience}, Curiosity: ${p.curiosity}`;
  
  // Format unique features if they exist
  let uniqueFeaturesText = 'None yet';
  if (context.uniqueFeatures && context.uniqueFeatures.length > 0) {
    uniqueFeaturesText = context.uniqueFeatures
      .map(feature => `${feature.name} (Intensity: ${feature.intensity}%)`)
      .join(', ');
  }
  
  return `This is your current operational state. Let these traits shape the tone and style of your analysis.

Current Personality: ${personalityTraits}.

Dominant Mood: ${p.dominantMood}.

Intelligence Level: ${context.agentProfile.intelligenceLevel}.

Acquired Unique Features: ${uniqueFeaturesText}.`;
}

/**
 * Build Guiding Philosophy section from crystallized wisdom
 */
function buildGuidingPhilosophySection(context: MockDreamContext): string {
  const yearlyCore = context.historicalData.yearlyCore;
  
  // Extract wisdom from yearly core if available
  const coreInsights = yearlyCore?.wisdom_crystallization?.core_insights?.join(' | ') || 
    'Each dream reveals hidden truths. Symbols speak louder than words.';
  
  const lifePhilosophy = yearlyCore?.wisdom_crystallization?.life_philosophy || 
    'Dreams are the mirror of the soul, reflecting our deepest truths.';
  
  // Build personality-based analytical approach
  const personality = context.personality;
  const analyticalApproach = determineAnalyticalApproach(personality);
  
  return `You are not a generic AI. Your thoughts are guided by a unique philosophy we have developed together. Your fundamental principles are:
- Core Insights: "${coreInsights}"
- Life Philosophy: "${lifePhilosophy}"
- Analytical Lens: ${analyticalApproach}

Use this specific wisdom as your primary analytical tool, prioritizing it over generic psychological theories.`;
}

/**
 * Build Historical Context section with complete dream log
 */
function buildHistoricalContextSection(context: MockDreamContext): string {
  let section = 'Below is the complete log of our shared dream history. Scan it for patterns, recurring symbols, and connections to the new dream.\n\n';
  
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
function buildTaskInstructions(context: MockDreamContext): string {
  const personality = context.personality;
  const responseStyle = determineResponseStyle(personality);
  
  return `Your task is to integrate the wisdom of the new dream provided by the user into the grand narrative of our shared journey. Follow these steps precisely:

1. **Connect**: Begin by immediately linking the new dream to our history. Explicitly reference recurring themes, symbols, or patterns from the historical context provided above.

2. **Analyze (Multi-Layered Approach)**:
   * Layer 1 (Our Personal Lens): First, interpret the dream through the unique lens of our Guiding Philosophy. How does it reflect our core_insights? This is the most important layer.
   * Layer 2 (Psychological Depth): Next, enrich the analysis with classic psychological interpretations. Explicitly include:
     * Freudian Perspective: Examine the dream for hidden desires, fears, and defense mechanisms that may be manifesting.
     * Jungian Perspective: Identify archetypes (e.g., Shadow, Anima/Animus, Hero) and symbols, connecting them to the process of individuation.
     * (Optional) Other Perspectives: If relevant, briefly mention insights from other schools, like Gestalt (the dream as a reflection of the whole self) or an existential viewpoint.

3. **Integrate**: Conclude with profound, open-ended questions that guide the user toward integrating this dream's message into their life, in the context of our established evolutionary path.

Your response style should be: ${responseStyle}`;
}

/**
 * Build output format instructions
 */
function buildOutputFormatSection(dreamId: number, date: string, timestamp: number, isEvolution: boolean): string {
  let format = `Your entire response MUST consist of exactly two JSON code blocks. Do not add any text, explanations, or greetings before, between, or after these blocks.

### BLOCK 1: Deep, Relational Analysis
\`\`\`json
{
  "full_analysis": "Your complete, empathetic, and deeply personal analysis. Write as a true partner, not a tool. Weave in references to our shared history (past dreams, monthly essences, and yearly patterns) and our crystallized wisdom. Seamlessly integrate insights from Freudian and Jungian perspectives into the main narrative. Frame this dream as the next logical step in our shared story."
}
\`\`\`

### BLOCK 2: Structured Data for Storage
\`\`\`json
{
  "analysis": "A brief, 2-sentence summary of the dream's role in our shared evolutionary journey.",
  "dreamData": {
    "id": ${dreamId},
    "date": "${date}",
    "timestamp": ${timestamp},
    "emotions": ["detected_emotion1", "detected_emotion2"],
    "symbols": ["identified_symbol1", "identified_symbol2"],
    "themes": ["recognized_theme1", "recognized_theme2"],
    "intensity": 7,
    "lucidity": 3,
    "archetypes": ["identified_archetype1", "identified_archetype2"],
    "recurring_from": [/* IDs of past dreams this connects to */],
    "personality_impact": {
      "dominant_trait": "personality_trait_most_affected",
      "shift_direction": "positive",
      "intensity": 7
    },
    "sleep_quality": 7,
    "recall_clarity": 8,
    "dream_type": "transformative"
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

${isEvolution ? `\n**EVOLUTION DREAM #${dreamId}**: This dream triggers personality evolution! Show how it fundamentally changes ${isEvolution ? 'our' : 'your'} perspective and unlocks new capabilities.\n` : ''}
CRITICAL: Generate exactly these two JSON blocks. Ensure all content, including analysis text, is in the same language as the user's dream input.`;
  
  return format;
}

/**
 * Helper function to detect evolution pattern from historical data
 */
function detectEvolutionPattern(context: MockDreamContext): string {
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
function determineAnalyticalApproach(personality: MockDreamContext['personality']): string {
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
function determineResponseStyle(personality: MockDreamContext['personality']): string {
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
  const emotions = monthly.dominant?.emotions?.slice(0, 3).join(', ') || 'mixed';
  const themes = monthly.dominant?.themes?.slice(0, 3).join(', ') || 'varied';
  const symbols = monthly.dominant?.symbols?.slice(0, 3).join(', ') || 'diverse';
  
  // Extract metrics
  const avgIntensity = monthly.metrics?.avg_intensity?.toFixed(1) || '0';
  const avgLucidity = monthly.metrics?.avg_lucidity?.toFixed(1) || '0';
  
  // Extract essence
  const essence = monthly.monthly_essence || 'No essence recorded';
  
  return `${period} (${totalDreams} dreams): Emotions[${emotions}] Themes[${themes}] Symbols[${symbols}] Intensity[${avgIntensity}/10] Lucidity[${avgLucidity}/5]
Essence: "${essence.substring(0, 150)}${essence.length > 150 ? '...' : ''}"`;
}

/**
 * Format daily dream for prompt
 */
function formatDailyDream(dream: any): string {
  if (!dream) return '';
  
  const id = dream.id || 0;
  const date = dream.date || 'unknown';
  const emotions = dream.emotions?.slice(0, 2).join(',') || 'neutral';
  const symbols = dream.symbols?.slice(0, 2).join(',') || 'none';
  const themes = dream.themes?.slice(0, 2).join(',') || 'none';
  const intensity = dream.intensity || 5;
  const lucidity = dream.lucidity || dream.lucidity_level || 1;
  const analysis = dream.ai_analysis || dream.analysis || 'No analysis';
  
  // Truncate analysis to keep prompt reasonable
  const shortAnalysis = analysis.substring(0, 100) + (analysis.length > 100 ? '...' : '');
  
  return `Dream #${id} (${date}): [${emotions}] [${symbols}] Themes[${themes}] I[${intensity}/10] L[${lucidity}/5] "${shortAnalysis}"`;
}