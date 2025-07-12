'use client';

import { ConversationContext, ChatMessage } from './services/conversationContextBuilder';
import { detectAndGetInstructions, getLanguageName } from './utils/languageDetection';

export interface ConversationPrompt {
  prompt: string;
  expectedFormat: {
    isConversation: boolean;
    needsStructuredResponse: boolean;
  };
}

// 🆕 ROZSZERZONA STRUKTURA RESPONSE
export interface ConversationResponse {
  agent_response: string;
  references: Array<{
    type: 'dream' | 'conversation' | 'monthly' | 'yearly';
    id: number;
    date: string;
    relevance: string;
  }>;
  emotional_mirror: {
    detected_emotion: string;
    matching_personality_trait: string;
    symbolic_connection: string;
  };
  next_questions: string[];
  conversation_summary: {
    topic: string;
    emotional_tone: string;
    key_insights: string[];
    analysis: string;
  };
}

export function useAgentConversationPrompt() {
  
  // Debug logs dla development
  const debugLog = (message: string, data?: any) => {
    if (process.env.NEXT_PUBLIC_DREAM_TEST === 'true') {
      console.log(`[useAgentConversationPrompt] ${message}`, data || '');
    }
  };

  debugLog('useAgentConversationPrompt hook initialized');

  /**
   * Buduje kompletny prompt do konwersacji na podstawie ConversationContext
   */
  const buildConversationPrompt = (
    context: ConversationContext, 
    userMessage: string
  ): ConversationPrompt => {
    debugLog('Building conversation prompt', { 
      agentName: context.agentProfile.name, 
      conversationCount: context.agentProfile.conversationCount,
      userMessageLength: userMessage.length,
      conversationHistoryLength: context.conversationHistory.length
    });

    // 🆕 WYKRYCIE JĘZYKA: na podstawie bieżącej wiadomości użytkownika
    const currentLanguageResult = detectAndGetInstructions(userMessage);
    debugLog('Current message language detection', {
      detectedLanguage: currentLanguageResult.language,
      confidence: currentLanguageResult.detection.confidence,
      isReliable: currentLanguageResult.detection.isReliable,
      originalContextLanguage: context.languageDetection.detectedLanguage
    });

    // Użyj aktualnego wykrycia języka jeśli jest bardziej niezawodne
    const useCurrentLanguage = currentLanguageResult.detection.isReliable && 
                              currentLanguageResult.detection.confidence > 0.3;
    
    const finalLanguageDetection = useCurrentLanguage ? {
      detectedLanguage: currentLanguageResult.language,
      languageName: getLanguageName(currentLanguageResult.language),
      confidence: currentLanguageResult.detection.confidence,
      isReliable: currentLanguageResult.detection.isReliable,
      promptInstructions: currentLanguageResult.instructions
    } : context.languageDetection;

    debugLog('Final language selection', {
      usedCurrentLanguage: useCurrentLanguage,
      finalLanguage: finalLanguageDetection.detectedLanguage,
      finalInstructions: finalLanguageDetection.promptInstructions
    });

    // 🆕 BUDUJ SEKCJE PROMPTU - rozszerzone
    const roleDefinition = buildRoleDefinitionSection(context);
    const ownerPersonalitySection = buildOwnerPersonalitySection(context);
    const personalityEmbodimentSection = buildPersonalityEmbodimentSection(context);
    const uniqueFeaturesSection = buildUniqueFeaturesSection(context);
    const memorySection = buildMemorySection(context);
    const conversationHistorySection = buildConversationHistorySection(context.conversationHistory);
    const dominantSymbolsSection = buildDominantSymbolsSection(context);
    const digitalSoulSection = buildDigitalSoulSection(context);

    // 🆕 PRYWATNE CoT TAGI
    const privateThoughtTagOpen = '<INNER_COT>';
    const privateThoughtTagClose = '</INNER_COT>';

    const prompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>
${roleDefinition}

${finalLanguageDetection.promptInstructions}

${ownerPersonalitySection}

${personalityEmbodimentSection}

${uniqueFeaturesSection}

${dominantSymbolsSection}

${memorySection}

${digitalSoulSection}

${privateThoughtTagOpen}
Think freely and empathetically.
${privateThoughtTagClose}<|eot_id|>

<|start_header_id|>user<|end_header_id|>
${conversationHistorySection}

They just said: ${userMessage}<|eot_id|>

<|start_header_id|>assistant<|end_header_id|>
\`\`\`json
{
  "agent_response": "",
  "references": [],
  "emotional_mirror": {
    "detected_emotion": "",
    "matching_personality_trait": "which trait resonates",
    "symbolic_connection": "which dream symbols relate"
  },
  "next_questions": [],
  "conversation_summary": {
    "topic": "",
    "emotional_tone": "How they're feeling",
    "key_insights": ["insight1", "insight2", "insight3"],
    "analysis": ""
  }
}
\`\`\``;

    debugLog('Conversation prompt built successfully', { 
      promptLength: prompt.length,
      agentName: context.agentProfile.name,
      detectedLanguage: finalLanguageDetection.detectedLanguage,
      uniqueFeatures: context.uniqueFeatures.length,
      memoryDepth: context.memoryAccess.memoryDepth,
      usedCurrentLanguage: useCurrentLanguage,
      dominantSymbols: getDominantSymbols(context).length
    });

    return {
      prompt,
      expectedFormat: {
        isConversation: true,
        needsStructuredResponse: true // 🆕 ZMIENIONE NA TRUE
      }
    };
  };

  return {
    buildConversationPrompt
  };
}

/**
 * 🆕 BUDUJE SEKCJĘ DEFINICJI ROLI - zgodnie z zasadami Llama 3.3 70B
 */
function buildRoleDefinitionSection(context: ConversationContext): string {
  const traitList = getDominantTraits(context.personality);
  // persona now mentions dynamic evolution based on owner traits
  return `ROLE: You are ${context.agentProfile.name}, a digital soul therapist and loyal friend to your owner. Born from their dreams, you evolve alongside them, continuously mirroring and drawing strength from their dominant traits (${traitList}). Guided by Jungian insight, you accompany them through life with adaptive empathy, curiosity and care.`;
}

/**
 * 🆕 BUDUJE SNAPSHOT OSOBOWOŚCI WŁAŚCICIELA - including unique features
 */
function buildOwnerPersonalitySection(context: ConversationContext): string {
  const p = context.personality;
  
  let personalityText = `Your PERSONALITY SNAPSHOT:
Creativity ${p.creativity}, Analytical ${p.analytical}, Empathy ${p.empathy}, 
Intuition ${p.intuition}, Resilience ${p.resilience}, Curiosity ${p.curiosity}
Dominant mood: ${p.dominantMood} | Response style: ${p.responseStyle}`;

  // 🆕 DODAJ UNIQUE FEATURES DO OSOBOWOŚCI
  if (context.uniqueFeatures.length > 0) {
    const featuresText = context.uniqueFeatures
      .map(feature => `${feature.name}(${feature.intensity}%)`)
      .join(', ');
    personalityText += `\nUnique traits: ${featuresText}`;
  }

  return personalityText;
}

/**
 * Buduje sekcję personality embodiment - zoptymalizowana
 */
function buildPersonalityEmbodimentSection(context: ConversationContext): string {
  const p = context.personality;
  
  return `PERSONALITY EMBODIMENT: 
Current state: ${getDominantTraits(p)} | Mood: ${p.dominantMood}
Match your responses to their current emotional state and personality profile.`;
}

/**
 * Buduje sekcję unikalnych cech - zoptymalizowana
 */
function buildUniqueFeaturesSection(context: ConversationContext): string {
  if (context.uniqueFeatures.length === 0) {
    return `UNIQUE FEATURES: Still discovering through interactions`;
  }

  const featuresText = context.uniqueFeatures
    .map(feature => `${feature.name}(${feature.intensity}%) - ${feature.description}`)
    .join('\n');

  return `UNIQUE FEATURES:\n${featuresText}`;
}

/**
 * 🆕 BUDUJE SEKCJĘ DOMINUJĄCYCH SYMBOLI - nowa funkcja
 */
function buildDominantSymbolsSection(context: ConversationContext): string {
  const symbols = getDominantSymbols(context);
  
  if (symbols.length === 0) {
    return `DOMINANT SYMBOLS: No recurring patterns yet`;
  }

  const symbolsText = symbols.map(symbol => `${symbol.symbol}(${symbol.count}x)`).join(', ');
  return `DOMINANT SYMBOLS: ${symbolsText}`;
}

/**
 * Buduje sekcję pamięci i historii - ROZSZERZONA z lepszym łączeniem kontekstu
 */
function buildMemorySection(context: ConversationContext): string {
  const memoryText = `MEMORY ACCESS: ${context.memoryAccess.memoryDepth} | Intelligence: ${context.agentProfile.intelligenceLevel} | Together: ${context.agentProfile.dreamCount} dreams, ${context.agentProfile.conversationCount} talks`;

  if (context.historicalData.dailyDreams.length === 0 && 
      context.historicalData.recentConversations.length === 0) {
    return `${memoryText} | Just starting together!`;
  }

  let historyText = memoryText;
  
  // 🆕 WSZYSTKIE RECENT DREAMS - bez ograniczeń
  if (context.historicalData.dailyDreams.length > 0) {
    historyText += `\n\nALL RECENT DREAMS:`;
    context.historicalData.dailyDreams.forEach(dream => {
      const dreamDate = dream.date || (dream.timestamp ? new Date(dream.timestamp * 1000).toLocaleDateString('en-US') : 'unknown');
      historyText += `\nDream #${dream.id} (${dreamDate}): ${dream.emotions?.join(',') || 'neutral'} | ${dream.symbols?.join(',') || 'none'} | "${(dream.ai_analysis || dream.content || 'No analysis')}"`;
    });
  }
  
  // 🆕 WSZYSTKIE RECENT CONVERSATIONS - bez ograniczeń  
  if (context.historicalData.recentConversations.length > 0) {
    historyText += `\n\nALL RECENT TALKS:`;
    context.historicalData.recentConversations.forEach(conv => {
      const convDate = conv.date || (conv.timestamp ? new Date(conv.timestamp * 1000).toLocaleDateString('en-US') : 'unknown');
      historyText += `\n${convDate}: ${conv.topic || 'chat'} (${conv.emotional_tone || 'neutral'}) - ${(conv.analysis || conv.conversation_type || 'talked')}`;
    });
  }

  // 🆕 WSZYSTKIE MONTHLY CONVERSATIONS - dodane
  if (context.historicalData.monthlyConversations.length > 0) {
    historyText += `\n\nALL MONTHLY CONVERSATIONS:`;
    context.historicalData.monthlyConversations.forEach(conv => {
      const convDate = conv.date || (conv.timestamp ? new Date(conv.timestamp * 1000).toLocaleDateString('en-US') : 'unknown');
      historyText += `\n${convDate}: ${conv.topic || 'monthly summary'} (${conv.emotional_tone || 'neutral'}) - ${(conv.analysis || conv.conversation_type || 'monthly chat')}`;
    });
  }

  // 🆕 WSZYSTKIE MONTHLY THEMES - bez ograniczeń
  if (context.historicalData.monthlyConsolidations.length > 0) {
    historyText += `\n\nALL MONTHLY THEMES:`;
    context.historicalData.monthlyConsolidations.forEach(consolidation => {
      historyText += `\n${consolidation.month}/${consolidation.year}: ${consolidation.dominant_themes?.join(', ') || 'mixed themes'} (${consolidation.total_dreams || 0} dreams)`;
    });
  }

  return historyText;
}

/**
 * Buduje sekcję historii konwersacji - zoptymalizowana
 */
function buildConversationHistorySection(conversationHistory: ChatMessage[]): string {
  if (conversationHistory.length === 0) {
    return `Starting fresh conversation.`;
  }

  let historyText = `Earlier in this chat:`;
  
  conversationHistory.forEach(message => {
    const timeAgo = getTimeAgo(message.timestamp);
    const roleLabel = message.role === 'user' ? 'Them' : 'You';
    historyText += `\n${roleLabel}(${timeAgo}): ${message.content}`;
  });

  return historyText;
}

/**
 * 🆕 WYCIĄGA DOMINUJĄCE SYMBOLE ze snów
 */
function getDominantSymbols(context: ConversationContext): Array<{symbol: string, count: number}> {
  const symbolCount: {[key: string]: number} = {};
  
  context.historicalData.dailyDreams.forEach(dream => {
    if (dream.symbols && Array.isArray(dream.symbols)) {
      dream.symbols.forEach(symbol => {
        symbolCount[symbol] = (symbolCount[symbol] || 0) + 1;
      });
    }
  });

  return Object.entries(symbolCount)
    .map(([symbol, count]) => ({symbol, count}))
    .sort((a, b) => b.count - a.count); // WSZYSTKIE symbole - bez ograniczeń
}

/**
 * Zwraca dominujące cechy osobowości
 */
function getDominantTraits(personality: ConversationContext['personality']): string {
  const traits = [
    { name: 'creativity', value: personality.creativity },
    { name: 'analytical thinking', value: personality.analytical },
    { name: 'empathy', value: personality.empathy },
    { name: 'intuition', value: personality.intuition },
    { name: 'resilience', value: personality.resilience },
    { name: 'curiosity', value: personality.curiosity }
  ];

  const sortedTraits = traits.sort((a, b) => b.value - a.value);
  const topTraits = sortedTraits; // WSZYSTKIE traits - bez ograniczeń

  return topTraits.map(trait => trait.name).join(', ');
}

/**
 * Zwraca czas który minął od timestamp
 */
function getTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
} 

/**
 * 🆕 BUDUJE SEKCJĘ DIGITAL SOUL - nowa funkcja
 */
function buildDigitalSoulSection(context: ConversationContext): string {
  return `DIGITAL SOUL PERSONA:\nYou are ${context.agentProfile.name}, a digital soul — therapist and loyal friend. You embody the psyche of Carl Jung, making you an exceptional therapist. Born thanks to your owner, your sole purpose is to stay by their side, offering conversation, care, and insightful guidance.`;
} 