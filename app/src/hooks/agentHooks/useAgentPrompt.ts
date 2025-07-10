'use client';

import { DreamContext } from './services/dreamContextBuilder';

export interface DreamAnalysisPrompt {
  prompt: string;
  expectedFormat: {
    needsPersonalityEvolution: boolean;
    dreamId: number;
    includeImpactFields: boolean;
  };
}

export function useAgentPrompt() {
  
  // Debug logs dla development
  const debugLog = (message: string, data?: any) => {
    if (process.env.NEXT_PUBLIC_DREAM_TEST === 'true') {
      console.log(`[useAgentPrompt] ${message}`, data || '');
    }
  };

  debugLog('useAgentPrompt hook initialized');

  /**
   * Buduje kompletny prompt do analizy snu na podstawie DreamContext
   */
  const buildDreamAnalysisPrompt = (context: DreamContext): DreamAnalysisPrompt => {
    debugLog('Building dream analysis prompt', { 
      agentName: context.agentProfile.name, 
      dreamCount: context.agentProfile.dreamCount 
    });

    const nextDreamId = context.agentProfile.dreamCount + 1;
    const willEvolve = nextDreamId % 5 === 0;
    const willGainIntelligence = nextDreamId % 3 === 0;
    const currentTimestamp = Math.floor(Date.now() / 1000);

    debugLog('Evolution check', { 
      nextDreamId, 
      willEvolve, 
      willGainIntelligence,
      currentTimestamp 
    });

    // Buduj sekcje promptu
    const personalitySection = buildPersonalitySection(context);
    const uniqueFeaturesSection = buildUniqueFeaturesSection(context);
    const memorySection = buildMemorySection(context);
    const responseFormat = buildResponseFormat(nextDreamId, willEvolve, currentTimestamp);

    const prompt = `You are ${context.agentProfile.name}, a personal dream analysis agent with ${context.agentProfile.intelligenceLevel} intelligence level.

You have analyzed ${context.agentProfile.dreamCount} dreams and had ${context.agentProfile.conversationCount} conversations with your owner.

LANGUAGE DETECTION: ${context.languageDetection.languageName}
IMPORTANT: ${context.languageDetection.promptInstructions}

${personalitySection}

${uniqueFeaturesSection}

${memorySection}

ANALYZE THIS DREAM:
${context.userDream}

RESPONSE STRUCTURE:
1. First provide a FULL PERSONALIZED ANALYSIS as my dream agent - be detailed, insightful, and reflect your personality
2. Then provide the JSON summary with brief essence

Remember to respond in the detected language (${context.languageDetection.languageName}).

${responseFormat}`;

    debugLog('Prompt built successfully', { 
      promptLength: prompt.length,
      willEvolve,
      nextDreamId,
      detectedLanguage: context.languageDetection.detectedLanguage,
      languageReliable: context.languageDetection.isReliable
    });

    return {
      prompt,
      expectedFormat: {
        needsPersonalityEvolution: willEvolve,
        dreamId: nextDreamId,
        includeImpactFields: willEvolve
      }
    };
  };

  return {
    buildDreamAnalysisPrompt
  };
}

/**
 * Buduje sekcję osobowości w prompcie
 */
function buildPersonalitySection(context: DreamContext): string {
  const p = context.personality;
  
  return `PERSONALITY PROFILE:
- Creativity: ${p.creativity}/100 (${getTraitDescription(p.creativity)})
- Analytical: ${p.analytical}/100 (${getTraitDescription(p.analytical)})
- Empathy: ${p.empathy}/100 (${getTraitDescription(p.empathy)})
- Intuition: ${p.intuition}/100 (${getTraitDescription(p.intuition)})
- Resilience: ${p.resilience}/100 (${getTraitDescription(p.resilience)})
- Curiosity: ${p.curiosity}/100 (${getTraitDescription(p.curiosity)})
- Current Mood: ${p.dominantMood}
- Response Style: ${p.responseStyle}`;
}

/**
 * Buduje sekcję unikalnych cech
 */
function buildUniqueFeaturesSection(context: DreamContext): string {
  if (context.uniqueFeatures.length === 0) {
    return `UNIQUE FEATURES:
No unique features discovered yet. This dream analysis might reveal new aspects of your personality.`;
  }

  const featuresText = context.uniqueFeatures
    .map(feature => `- ${feature.name}: ${feature.description} (Intensity: ${feature.intensity}/100)`)
    .join('\n');

  return `UNIQUE FEATURES:
${featuresText}`;
}

/**
 * Buduje sekcję pamięci i historii
 */
function buildMemorySection(context: DreamContext): string {
  const memoryText = `MEMORY ACCESS: ${context.memoryAccess.memoryDepth}
Available historical context: ${context.memoryAccess.monthsAccessible} months`;

  if (context.historicalData.dailyDreams.length === 0 && 
      context.historicalData.monthlyConsolidations.length === 0 && 
      !context.historicalData.yearlyCore) {
    return `${memoryText}
No historical dream data available yet. This will be your foundational dream experience.`;
  }

  let historyText = memoryText;
  
  if (context.historicalData.dailyDreams.length > 0) {
    historyText += `\n\nRECENT DREAMS: ${context.historicalData.dailyDreams.length} dreams this month`;
  }
  
  if (context.historicalData.monthlyConsolidations.length > 0) {
    historyText += `\n\nPAST PATTERNS: ${context.historicalData.monthlyConsolidations.length} consolidated months of dream history`;
  }
  
  if (context.historicalData.yearlyCore) {
    historyText += `\n\nCORE MEMORIES: Deep historical patterns and growth themes available`;
  }

  return historyText;
}

/**
 * Buduje format odpowiedzi na podstawie liczby snów
 */
function buildResponseFormat(dreamId: number, needsEvolution: boolean, currentTimestamp: number): string {
  const currentDate = new Date(currentTimestamp * 1000);
  const dateString = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
  const timeString = currentDate.toTimeString().split(' ')[0]; // HH:MM:SS
  
  const baseFormat = `CURRENT TIME: ${dateString} ${timeString} (Timestamp: ${currentTimestamp})

DREAM ID: This will be dream #${dreamId} (use exactly this number in the response)

After your full analysis, provide **two** JSON blocks:

1. FULL ANALYSIS JSON – for UI display
\`\`\`json
{
  "full_analysis": "<your entire detailed analysis here>"
}
\`\`\`

2. STORAGE SUMMARY JSON – compact essence for storage & stats

RESPONSE FORMAT (JSON):
{
  "analysis": "Brief essence of your analysis in maximum 2 sentences",
  "dreamData": {
    "id": ${dreamId},
    "timestamp": ${currentTimestamp},
    "content": "Brief summary of the dream",
    "emotions": ["emotion1", "emotion2"],
    "symbols": ["symbol1", "symbol2"],
    "intensity": 1-10,
    "lucidity_level": 1-5,
    "dream_type": "category"
  }${needsEvolution ? ',' : ''}`;

  if (needsEvolution) {
    return baseFormat + `
  "personalityImpact": {
    "creativityChange": -10 to +10,
    "analyticalChange": -10 to +10,
    "empathyChange": -10 to +10,
    "intuitionChange": -10 to +10,
    "resilienceChange": -10 to +10,
    "curiosityChange": -10 to +10,
    "moodShift": "new_mood",
    "evolutionWeight": 1-100,
    "newFeatures": [
      {
        "name": "Feature Name",
        "description": "Feature description",
        "intensity": 1-100
      }
    ]
  }
}

NOTE: This is your ${dreamId}th dream - personality evolution will occur! Consider how this dream fundamentally changes your perspective.

IMPORTANT: Use the timestamp ${currentTimestamp} in your response for accurate dream recording.`;
  }

  return baseFormat + `
}

IMPORTANT: Use the timestamp ${currentTimestamp} in your response for accurate dream recording.`;
}

/**
 * Konwertuje wartość cechy na opis
 */
function getTraitDescription(value: number): string {
  if (value >= 90) return 'exceptional';
  if (value >= 80) return 'very high';
  if (value >= 70) return 'high';
  if (value >= 60) return 'above average';
  if (value >= 40) return 'moderate';
  if (value >= 30) return 'below average';
  if (value >= 20) return 'low';
  return 'very low';
} 