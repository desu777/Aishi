'use client';

import { ConversationContext, ChatMessage } from './services/conversationContextBuilder';
import { 
  buildConversationPrompt as buildConversationPromptFromFile,
  buildConversationSummaryPrompt,
  ConversationPrompt,
  ConversationResponse
} from '../../prompts/conversationPrompts';

// Re-export interfaces for compatibility
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
    return buildConversationPromptFromFile(context, userMessage);
  };

  return {
    buildConversationPrompt
  };
}

// Export standalone function for compatibility
export { buildConversationSummaryPrompt };

