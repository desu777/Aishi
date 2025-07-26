'use client';

import { DreamContext } from './services/dreamContextBuilder';
import { 
  buildDreamAnalysisPrompt as buildDreamAnalysisPromptFromFile,
  DreamAnalysisPrompt 
} from '../../prompts/dreamAnalysisPrompt';

// Re-export type for compatibility
export type { DreamAnalysisPrompt };

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
    return buildDreamAnalysisPromptFromFile(context);
  };

  return {
    buildDreamAnalysisPrompt
  };
}

