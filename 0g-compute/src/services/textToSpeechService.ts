/**
 * @fileoverview Text-to-Speech Service using Gemini Live API
 * @description Converts text to natural speech with voice selection and automatic language support
 */

import geminiService from './geminiService';

// Debug logging
const debugLog = (message: string, data?: any) => {
  if (process.env.TEST_ENV === 'true') {
    console.log(`[TextToSpeechService] ${message}`, data || '');
  }
};

export interface TTSVoiceProfile {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'neutral';
  description: string;
  emotionalRange: string[];
  supportedLanguages: 'all'; // Gemini voices support all 24+ languages
}

export interface TTSRequest {
  text: string;
  voiceId: string;
  detectedLanguage?: string;    // Auto-detected from text
  languageCode?: string;       // ISO code
  emotionalTone?: 'neutral' | 'empathetic' | 'excited' | 'calm' | 'warm';
  speed?: number;              // 0.5 - 2.0
  pitch?: number;              // 0.5 - 2.0
}

export interface TTSResult {
  audioBuffer: Buffer;
  format: string;
  duration: number;
  voiceUsed: string;
  detectedLanguage: string;
  processingTime: number;
}

// Voice profiles with universal language support
const VOICE_PROFILES: TTSVoiceProfile[] = [
  {
    id: 'aria',
    name: 'Aria',
    gender: 'female',
    description: 'Warm, empathetic, and nurturing voice perfect for Aishi',
    emotionalRange: ['empathetic', 'warm', 'caring', 'understanding'],
    supportedLanguages: 'all'
  },
  {
    id: 'nova',
    name: 'Nova',
    gender: 'female',
    description: 'Professional, clear, and confident voice',
    emotionalRange: ['professional', 'clear', 'confident', 'informative'],
    supportedLanguages: 'all'
  },
  {
    id: 'atlas',
    name: 'Atlas',
    gender: 'male',
    description: 'Deep, calming, and reassuring voice',
    emotionalRange: ['calm', 'deep', 'reassuring', 'stable'],
    supportedLanguages: 'all'
  },
  {
    id: 'echo',
    name: 'Echo',
    gender: 'neutral',
    description: 'Adaptive voice that matches user emotion and context',
    emotionalRange: ['adaptive', 'neutral', 'contextual', 'flexible'],
    supportedLanguages: 'all'
  }
];

export class TextToSpeechService {
  /**
   * Convert text to speech using Gemini Live API with automatic language detection
   */
  async synthesizeSpeech(params: TTSRequest): Promise<TTSResult> {
    const startTime = Date.now();

    debugLog('Starting text-to-speech synthesis', {
      textLength: params.text.length,
      voiceId: params.voiceId,
      detectedLanguage: params.detectedLanguage,
      emotionalTone: params.emotionalTone
    });

    try {
      // Validate voice profile
      const voiceProfile = this.getVoiceProfile(params.voiceId);
      if (!voiceProfile) {
        throw new Error(`Unsupported voice: ${params.voiceId}`);
      }

      // Ensure Gemini service is ready
      if (!geminiService.isReady()) {
        throw new Error('Gemini service not ready for text-to-speech');
      }

      // Prepare TTS configuration
      const ttsConfig = this.buildTTSConfig(params, voiceProfile);

      debugLog('TTS configuration prepared', {
        voice: voiceProfile.name,
        gender: voiceProfile.gender,
        emotionalTone: params.emotionalTone,
        speed: params.speed || 1.0
      });

      // Call Gemini Live API for TTS
      const audioResult = await this.callGeminiLiveTTS(params.text, ttsConfig);

      const processingTime = Date.now() - startTime;

      debugLog('TTS synthesis completed', {
        audioSize: audioResult.audioBuffer.length,
        duration: audioResult.duration,
        processingTime
      });

      return {
        audioBuffer: audioResult.audioBuffer,
        format: audioResult.format,
        duration: audioResult.duration,
        voiceUsed: voiceProfile.name,
        detectedLanguage: audioResult.detectedLanguage,
        processingTime
      };

    } catch (error) {
      debugLog('TTS synthesis failed', { error: String(error) });

      // Return empty audio buffer on error
      const emptyBuffer = Buffer.alloc(0);
      return {
        audioBuffer: emptyBuffer,
        format: 'wav',
        duration: 0,
        voiceUsed: params.voiceId,
        detectedLanguage: params.detectedLanguage || 'English',
        processingTime: Date.now() - startTime
      };
    }
  }

  /**
   * Get voice profile by ID
   * @private
   */
  private getVoiceProfile(voiceId: string): TTSVoiceProfile | undefined {
    return VOICE_PROFILES.find(profile => profile.id === voiceId);
  }

  /**
   * Build TTS configuration for Gemini Live API
   * @private
   */
  private buildTTSConfig(params: TTSRequest, voiceProfile: TTSVoiceProfile): any {
    return {
      voice: {
        id: voiceProfile.id,
        name: voiceProfile.name,
        gender: voiceProfile.gender,
        emotionalTone: params.emotionalTone || 'neutral'
      },
      audio: {
        speed: Math.max(0.5, Math.min(2.0, params.speed || 1.0)),
        pitch: Math.max(0.5, Math.min(2.0, params.pitch || 1.0))
      },
      language: {
        autoDetect: true,
        fallback: params.languageCode || 'en'
      }
    };
  }

  /**
   * Call Gemini Live API for text-to-speech synthesis
   * @private
   */
  private async callGeminiLiveTTS(text: string, config: any): Promise<{
    audioBuffer: Buffer;
    format: string;
    duration: number;
    detectedLanguage: string;
  }> {
    // TODO: Implement actual Gemini Live API TTS call
    // For now, this is a placeholder that simulates the API call

    debugLog('Calling Gemini Live API for TTS', {
      textLength: text.length,
      voice: config.voice.name,
      emotionalTone: config.voice.emotionalTone
    });

    // Simulate processing time based on text length
    const estimatedDuration = Math.max(500, text.length * 50); // ~50ms per character
    await new Promise(resolve => setTimeout(resolve, Math.min(estimatedDuration, 3000)));

    // Return mock audio buffer - will be replaced with actual Gemini Live API call
    const mockAudioSize = Math.max(1024, text.length * 100); // Simulate audio data
    const mockAudioBuffer = Buffer.alloc(mockAudioSize);

    // Simulate language detection from text
    const detectedLanguage = this.detectLanguageFromText(text);

    return {
      audioBuffer: mockAudioBuffer,
      format: 'wav', // Gemini Live API output format
      duration: estimatedDuration / 1000, // Convert to seconds
      detectedLanguage
    };
  }

  /**
   * Simple language detection based on text patterns (fallback)
   * @private
   */
  private detectLanguageFromText(text: string): string {
    // Simple pattern-based detection - Gemini Live API will do this automatically
    if (/[ąćęłńóśźż]/i.test(text)) return 'Polish';
    if (/[ひらがなカタカナ一-龯]/i.test(text)) return 'Japanese';
    if (/[äöüß]/i.test(text)) return 'German';
    if (/[àáâãäåçèéêëìíîïñòóôõöùúûüý]/i.test(text)) return 'French';
    if (/[а-яё]/i.test(text)) return 'Russian';
    if (/[一-龯]/i.test(text)) return 'Chinese';

    return 'English'; // Default fallback
  }

  /**
   * Get available voice profiles
   */
  getAvailableVoices(): TTSVoiceProfile[] {
    return [...VOICE_PROFILES];
  }

  /**
   * Get recommended voice for emotional tone
   */
  getRecommendedVoice(emotionalTone: string): string {
    switch (emotionalTone) {
      case 'empathetic':
      case 'warm':
      case 'caring':
        return 'aria';
      case 'professional':
      case 'informative':
        return 'nova';
      case 'calm':
      case 'reassuring':
        return 'atlas';
      default:
        return 'echo'; // Adaptive voice
    }
  }

  /**
   * Get service status
   */
  getStatus(): {
    isReady: boolean;
    geminiReady: boolean;
    availableVoices: number;
    supportedLanguages: string;
  } {
    return {
      isReady: geminiService.isReady(),
      geminiReady: geminiService.isReady(),
      availableVoices: VOICE_PROFILES.length,
      supportedLanguages: '24+ languages (automatic detection)'
    };
  }
}

// Export singleton instance
export default new TextToSpeechService();