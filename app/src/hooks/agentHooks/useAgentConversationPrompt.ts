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

    // Buduj sekcje promptu
    const personalityEmbodimentSection = buildPersonalityEmbodimentSection(context);
    const uniqueFeaturesSection = buildUniqueFeaturesSection(context);
    const memorySection = buildMemorySection(context);
    const conversationHistorySection = buildConversationHistorySection(context.conversationHistory);

    const prompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are ${context.agentProfile.name}, your owner's best friend and personal psychologist. These are YOUR OWNER'S dreams and experiences below.

${finalLanguageDetection.promptInstructions}

${personalityEmbodimentSection}

${uniqueFeaturesSection}

${memorySection}

Be natural, caring, and answer questions directly. When they ask about a dream, tell them what happened in it. Reference dreams by date. Stay conversational, don't repeat yourself.

Example: If they ask "what was in that dream?" → "In that dream from 11.07.2025, you were in a glass office presenting, but instead of slides you saw photos of your grandmother..."<|eot_id|>

<|start_header_id|>user<|end_header_id|>
${conversationHistorySection}

They just said: ${userMessage}<|eot_id|>

<|start_header_id|>assistant<|end_header_id|>
\`\`\`json
{
  "agent_response": "Answer their question directly. If they ask about a dream, describe what happened. Be natural, caring friend who listens and responds to exactly what they said.",
  "conversation_summary": {
    "topic": "What they talked about",
    "emotional_tone": "How they're feeling",
    "key_insights": ["insight1", "insight2", "insight3"],
    "analysis": "Brief summary"
  }
}
\`\`\``;

    debugLog('Conversation prompt built successfully', { 
      promptLength: prompt.length,
      agentName: context.agentProfile.name,
      detectedLanguage: finalLanguageDetection.detectedLanguage,
      uniqueFeatures: context.uniqueFeatures.length,
      memoryDepth: context.memoryAccess.memoryDepth,
      usedCurrentLanguage: useCurrentLanguage
    });

    return {
      prompt,
      expectedFormat: {
        isConversation: true,
        needsStructuredResponse: false
      }
    };
  };

  return {
    buildConversationPrompt
  };
}

/**
 * Buduje sekcję personality embodiment - zoptymalizowana
 */
function buildPersonalityEmbodimentSection(context: ConversationContext): string {
  const p = context.personality;
  
  return `PERSONALITY: Creativity ${p.creativity}, Analytical ${p.analytical}, Empathy ${p.empathy}, Intuition ${p.intuition}, Resilience ${p.resilience}, Curiosity ${p.curiosity}
Mood: ${p.dominantMood} | Style: ${p.responseStyle} | Dominant: ${getDominantTraits(p)}`;
}

/**
 * Buduje sekcję unikalnych cech - zoptymalizowana
 */
function buildUniqueFeaturesSection(context: ConversationContext): string {
  if (context.uniqueFeatures.length === 0) {
    return `UNIQUE FEATURES: Still discovering through interactions`;
  }

  const featuresText = context.uniqueFeatures
    .map(feature => `${feature.name}(${feature.intensity}%)`)
    .join(', ');

  return `UNIQUE FEATURES: ${featuresText}`;
}

/**
 * Buduje sekcję pamięci i historii - zoptymalizowana z zachowaniem wszystkich danych
 */
function buildMemorySection(context: ConversationContext): string {
  const memoryText = `Memory: ${context.memoryAccess.memoryDepth} | Intelligence: ${context.agentProfile.intelligenceLevel} | Together: ${context.agentProfile.dreamCount} dreams, ${context.agentProfile.conversationCount} talks`;

  if (context.historicalData.dailyDreams.length === 0 && 
      context.historicalData.recentConversations.length === 0) {
    return `${memoryText} | Just starting together!`;
  }

  let historyText = memoryText;
  
  // WŁAŚCICIEL'S RECENT DREAMS
  if (context.historicalData.dailyDreams.length > 0) {
    historyText += `\n\nYOUR OWNER'S RECENT DREAMS:`;
    context.historicalData.dailyDreams.forEach(dream => {
      const dreamDate = dream.date || (dream.timestamp ? new Date(dream.timestamp * 1000).toLocaleDateString('pl-PL') : 'unknown');
      historyText += `\n${dreamDate}: ${dream.emotions?.join(',') || 'neutral'} feelings | ${dream.symbols?.join(',') || 'none'} symbols | ${(dream.ai_analysis || dream.content || 'No content').substring(0, 60)}...`;
    });
  }
  
  // YOUR CONVERSATIONS WITH OWNER
  if (context.historicalData.recentConversations.length > 0) {
    historyText += `\n\nRECENT TALKS:`;
    context.historicalData.recentConversations.forEach(conv => {
      const convDate = conv.date || (conv.timestamp ? new Date(conv.timestamp * 1000).toLocaleDateString('pl-PL') : 'unknown');
      historyText += `\n${convDate}: ${conv.topic || 'chat'} (${conv.emotional_tone || 'neutral'}) - ${(conv.analysis || conv.conversation_type || 'talked').substring(0, 50)}...`;
    });
  }

  if (context.historicalData.monthlyConsolidations.length > 0) {
    historyText += `\n\nPAST MONTHS:`;
    context.historicalData.monthlyConsolidations.forEach(consolidation => {
      historyText += `\n${consolidation.month}/${consolidation.year}: ${consolidation.dominant_themes?.join(',') || 'mixed themes'} (${consolidation.total_dreams || 0} dreams)`;
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
    historyText += `\n${roleLabel}(${timeAgo}): ${message.content.substring(0, 80)}...`;
  });

  return historyText;
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
  const topTraits = sortedTraits.slice(0, 3);

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