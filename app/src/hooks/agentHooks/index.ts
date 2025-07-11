/**
 * Agent Hooks for Dreamscape iNFT Smart Contract
 * Provides hooks for minting, reading, and managing Dream Agents
 */

export { useAgentMint } from './useAgentMint';
export { useAgentRead } from './useAgentRead';
export { useAgentDream } from './useAgentDream';
export { useAgentChat } from './useAgentChat';
export { useAgentPrompt } from './useAgentPrompt';
export { useAgentConversationPrompt } from './useAgentConversationPrompt';
export { useAgentAI } from './useAgentAI';

// Language detection utilities
export { 
  detectLanguage, 
  getLanguageInstructions, 
  formatDetectionResult,
  detectAndGetInstructions,
  getLanguageName,
  isLanguageSupported,
  getSupportedLanguages
} from './utils/languageDetection';

// Future exports:
// export { useAgentDream } from './useAgentDream';
// export { useAgentConversation } from './useAgentConversation'; 