/**
 * @fileoverview Dream Evolution Actions
 * @description Actions specific to evolution dreams (every 5th dream)
 */

import { assign, sendParent, sendTo, enqueueActions } from 'xstate';
import type { TerminalLine } from './types';
import type { DreamMachineContext } from './dreamMachine';

// Debug logging
const debugLog = (message: string, data?: any) => {
  if (process.env.NEXT_PUBLIC_XSTATE_TERMINAL === 'true' || process.env.NEXT_PUBLIC_DREAM_TEST === 'true') {
    console.log(`[DreamMachine] ${message}`, data || '');
  }
};

/**
 * Actions related to evolution dream detection and handling
 */
export const evolutionDreamActions = {
  /**
   * Send lines to parent with evolution dream awareness
   */
  sendDreamAnalysisWithEvolution: enqueueActions(({ context, enqueue }: any) => {
    debugLog('[EVOLUTION] sendDreamAnalysisWithEvolution triggered', {
      wasVoiceInput: context.wasVoiceInput,
      hasAiResponse: !!context.aiResponse,
      agentName: context.agentName
    });

    // First action: send lines to parent
    enqueue(sendParent(() => {
      const lines: TerminalLine[] = [];
      const timestamp = Date.now();

      if (context.aiResponse) {
        // Check if this is an evolution dream
        const dreamCount = context.dreamContext?.agentProfile?.dreamCount || 0;
        const nextDreamId = dreamCount + 1;
        const isEvolutionDream = nextDreamId % 5 === 0;

        // Add evolution dream notification
        if (isEvolutionDream && context.aiResponse.personalityImpact) {
          lines.push({
            type: 'system',
            content: `[EVOLUTION DETECTED] Dream #${nextDreamId} - Personality evolution sequence initiated`,
            timestamp: timestamp - 1
          });
        }

        // Display AI analysis - check if voice or text
        if (context.wasVoiceInput) {
          // For voice input, prepare for voice output (audio will be added after TTS)
          lines.push({
            type: 'info',
            content: `~ ${context.agentName} : [Processing voice response...]`,
            timestamp
          });
        } else {
          // For text input, display regular text
          lines.push({
            type: 'info',
            content: `~ ${context.agentName} : ${context.aiResponse.fullAnalysis}`,
            timestamp
          });
        }

        // Ask for confirmation with evolution notice
        if (isEvolutionDream && context.aiResponse.personalityImpact) {
          lines.push({
            type: 'system',
            content: `Do u wanna evolve ${context.agentName} with this evolution dream? Type y/n`,
            timestamp: timestamp + 1
          });
        } else {
          lines.push({
            type: 'system',
            content: `Do u wanna train ${context.agentName} with your dream? Type y/n`,
            timestamp: timestamp + 1
          });
        }
      }

      return { type: 'APPEND_LINES', lines };
    }));

    // Second action: send TTS request if voice input
    debugLog('[TTS DECISION] Analyzing TTS trigger conditions', {
      wasVoiceInput: context.wasVoiceInput,
      hasAiResponse: !!context.aiResponse,
      hasFullAnalysis: !!(context.aiResponse?.fullAnalysis),
      fullAnalysisLength: context.aiResponse?.fullAnalysis?.length || 0,
      agentName: context.agentName,
      willTriggerTTS: context.wasVoiceInput && context.aiResponse?.fullAnalysis
    });

    if (context.wasVoiceInput && context.aiResponse?.fullAnalysis) {
      debugLog('[EVOLUTION] ✅ TRIGGERING TTS - Voice input detected with AI response', {
        textLength: context.aiResponse.fullAnalysis.length,
        textPreview: context.aiResponse.fullAnalysis.substring(0, 100),
        agentName: context.agentName
      });
      enqueue(sendParent(() => ({
        type: 'VOICE.SYNTHESIZE_RESPONSE',
        text: context.aiResponse.fullAnalysis,
        agentName: context.agentName
      })));
    } else {
      debugLog('[EVOLUTION] ❌ NO TTS TRIGGERED - Conditions not met', {
        wasVoiceInput: context.wasVoiceInput,
        hasAiResponse: !!context.aiResponse,
        hasFullAnalysis: !!(context.aiResponse?.fullAnalysis),
        reason: !context.wasVoiceInput ? 'Not voice input' :
                !context.aiResponse ? 'No AI response' :
                !context.aiResponse.fullAnalysis ? 'No fullAnalysis in response' : 'Unknown'
      });
    }
  }),

  /**
   * Store persistence result with evolution awareness
   */
  storePersistenceWithEvolution: assign({
    persistenceResult: ({ event }: any) => {
      return event.output.persistenceResult;
    },
    storageRootHash: ({ event }: any) => {
      return event.output.rootHash;
    },
    contractTxHash: ({ event }: any) => {
      return event.output.txHash;
    },
    statusMessage: ({ event }: any) => {
      const output = event.output;
      if (output.isEvolutionDream) {
        debugLog('========================================');
        debugLog('[EVOLUTION COMPLETE] Dream workflow finalized');
        debugLog('========================================');
        debugLog('Agent personality permanently evolved');
        debugLog('New traits committed to blockchain');
        debugLog('View agent stats to observe evolution changes');
        debugLog('========================================');
        return 'Evolution dream persisted! Agent has evolved.';
      }
      return 'Dream persisted successfully!';
    }
  })
};