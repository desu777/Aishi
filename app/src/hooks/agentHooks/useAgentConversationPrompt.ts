'use client';

import { ConversationContext, ChatMessage } from './services/conversationContextBuilder';
import { 
  buildConversationPrompt as buildConversationPromptFromFile,
  buildConversationSummaryPrompt,
  ConversationPrompt,
  ConversationResponse
} from '../../prompts/conversationPrompts';

// Re-export types for compatibility
export type { ConversationPrompt, ConversationResponse };

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

