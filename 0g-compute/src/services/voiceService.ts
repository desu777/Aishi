/**
 * @fileoverview Unified Voice Service for Complete Audio Pipeline
 * @description Orchestrates STT → Intent → Command Execution → TTS workflow
 */

import speechToTextService, { STTResult } from './speechToTextService';
import textToSpeechService, { TTSResult } from './textToSpeechService';
import voiceIntentService, { VoiceIntent } from './voiceIntentService';

// Debug logging
const debugLog = (message: string, data?: any) => {
  if (process.env.TEST_ENV === 'true') {
    console.log(`[VoiceService] ${message}`, data || '');
  }
};

export interface VoiceInteractionRequest {
  audioBuffer: Buffer;
  inputFormat: 'webm' | 'wav' | 'mp3' | 'ogg';
  selectedVoice?: string;
  userWalletAddress?: string;
}

export interface VoiceInteractionResult {
  // STT Results
  transcript: string;
  detectedLanguage: string;
  languageCode: string;

  // Intent Analysis
  intent: VoiceIntent;

  // Command Execution
  commandResult?: any;

  // TTS Results
  responseText: string;
  responseAudio: Buffer;
  audioFormat: string;

  // Metadata
  totalProcessingTime: number;
  stages: {
    stt: number;
    intent: number;
    command?: number;
    tts: number;
  };
}

export class VoiceService {
  /**
   * Process complete voice interaction pipeline
   */
  async processVoiceInteraction(params: VoiceInteractionRequest): Promise<VoiceInteractionResult> {
    const pipelineStartTime = Date.now();

    debugLog('Starting complete voice interaction pipeline', {
      audioSize: params.audioBuffer.length,
      inputFormat: params.inputFormat,
      selectedVoice: params.selectedVoice || 'aria',
      hasWallet: !!params.userWalletAddress
    });

    try {
      // STAGE 1: Speech-to-Text with language detection
      const sttStartTime = Date.now();
      const sttResult = await speechToTextService.transcribeAudio({
        audioBuffer: params.audioBuffer,
        inputFormat: params.inputFormat,
        enableLanguageDetection: true
      });
      const sttTime = Date.now() - sttStartTime;

      debugLog('STT stage completed', {
        transcript: sttResult.transcript.substring(0, 100),
        detectedLanguage: sttResult.detectedLanguage,
        languageCode: sttResult.languageCode,
        confidence: sttResult.confidence,
        processingTime: sttTime
      });

      // STAGE 2: Intent Recognition
      const intentStartTime = Date.now();
      const intent = await voiceIntentService.analyzeIntent(sttResult.transcript);
      const intentTime = Date.now() - intentStartTime;

      debugLog('Intent analysis completed', {
        command: intent.command,
        confidence: intent.confidence,
        detectedLanguage: intent.detectedLanguage,
        followUpAction: intent.followUpAction,
        processingTime: intentTime
      });

      // STAGE 3: Command Execution (if needed)
      let commandResult = null;
      let commandTime = 0;
      let responseText = intent.suggestedResponse;

      if (intent.followUpAction === 'execute_command' && params.userWalletAddress) {
        const commandStartTime = Date.now();

        debugLog('Executing terminal command', {
          command: intent.command,
          walletAddress: params.userWalletAddress
        });

        try {
          commandResult = await this.executeTerminalCommand(
            intent.command,
            intent.parameters,
            params.userWalletAddress
          );

          if (commandResult && commandResult.response) {
            responseText = commandResult.response;
          }

          commandTime = Date.now() - commandStartTime;

          debugLog('Command execution completed', {
            command: intent.command,
            hasResult: !!commandResult,
            processingTime: commandTime
          });

        } catch (commandError) {
          debugLog('Command execution failed', { error: String(commandError) });

          // Fallback to intent response if command fails
          responseText = `Sorry, I couldn't execute that command right now. ${intent.suggestedResponse}`;
        }
      }

      // STAGE 4: Text-to-Speech
      const ttsStartTime = Date.now();
      const selectedVoice = params.selectedVoice ||
        textToSpeechService.getRecommendedVoice(intent.command);

      const ttsResult = await textToSpeechService.synthesizeSpeech({
        text: responseText,
        voiceId: selectedVoice,
        detectedLanguage: intent.detectedLanguage,
        languageCode: intent.languageCode,
        emotionalTone: this.getEmotionalToneForCommand(intent.command),
        speed: 1.0
      });
      const ttsTime = Date.now() - ttsStartTime;

      debugLog('TTS synthesis completed', {
        responseLength: responseText.length,
        voiceUsed: ttsResult.voiceUsed,
        audioSize: ttsResult.audioBuffer.length,
        processingTime: ttsTime
      });

      const totalProcessingTime = Date.now() - pipelineStartTime;

      debugLog('Complete voice pipeline finished', {
        totalTime: totalProcessingTime,
        stages: { stt: sttTime, intent: intentTime, command: commandTime, tts: ttsTime }
      });

      return {
        // STT Results
        transcript: sttResult.transcript,
        detectedLanguage: sttResult.detectedLanguage,
        languageCode: sttResult.languageCode,

        // Intent Analysis
        intent,

        // Command Execution
        commandResult,

        // TTS Results
        responseText,
        responseAudio: ttsResult.audioBuffer,
        audioFormat: ttsResult.format,

        // Metadata
        totalProcessingTime,
        stages: {
          stt: sttTime,
          intent: intentTime,
          command: commandTime,
          tts: ttsTime
        }
      };

    } catch (error) {
      debugLog('Voice pipeline failed', { error: String(error) });

      // Return error response with empty audio
      return {
        transcript: '[transcription failed]',
        detectedLanguage: 'English',
        languageCode: 'en',
        intent: {
          command: 'unknown',
          confidence: 0.0,
          detectedLanguage: 'English',
          languageCode: 'en',
          parameters: { needsMoreInfo: true },
          suggestedResponse: 'Sorry, I encountered an error processing your voice input.',
          followUpAction: 'request_more_info'
        },
        responseText: 'Sorry, I encountered an error processing your voice input.',
        responseAudio: Buffer.alloc(0),
        audioFormat: 'wav',
        totalProcessingTime: Date.now() - pipelineStartTime,
        stages: { stt: 0, intent: 0, command: 0, tts: 0 }
      };
    }
  }

  /**
   * Execute terminal command based on voice intent
   * @private
   */
  private async executeTerminalCommand(
    command: string,
    parameters: any,
    walletAddress: string
  ): Promise<any> {
    debugLog('Executing terminal command', { command, walletAddress });

    // TODO: Implement actual command execution bridge
    // This should map voice commands to existing terminal command executors

    switch (command) {
      case 'personality':
        return { response: 'Your personality traits are displayed below.' };
      case 'stats':
        return { response: 'Here are your current statistics and intelligence level.' };
      case 'help':
        return { response: 'I can help you with dreams, personality, stats, conversations, and memory management.' };
      default:
        return { response: `Command '${command}' is recognized but not yet implemented in voice mode.` };
    }
  }

  /**
   * Get appropriate emotional tone for command type
   * @private
   */
  private getEmotionalToneForCommand(command: string): 'neutral' | 'empathetic' | 'excited' | 'calm' | 'warm' {
    switch (command) {
      case 'dream':
        return 'empathetic';
      case 'chat':
        return 'warm';
      case 'personality':
      case 'unique-features':
        return 'calm';
      case 'stats':
      case 'memory':
        return 'neutral';
      case 'help':
        return 'warm';
      default:
        return 'neutral';
    }
  }

  /**
   * Get service status
   */
  getStatus(): {
    isReady: boolean;
    sttReady: boolean;
    ttsReady: boolean;
    intentReady: boolean;
    availableVoices: string[];
  } {
    const sttStatus = speechToTextService.getStatus();
    const ttsStatus = textToSpeechService.getStatus();
    const intentStatus = voiceIntentService.getStatus();

    return {
      isReady: sttStatus.isReady && ttsStatus.isReady && intentStatus.isReady,
      sttReady: sttStatus.isReady,
      ttsReady: ttsStatus.isReady,
      intentReady: intentStatus.isReady,
      availableVoices: textToSpeechService.getAvailableVoices().map(v => v.id)
    };
  }
}

// Export singleton instance
export default new VoiceService();