/**
 * @fileoverview Text-to-Speech Service using Google Cloud Text-to-Speech API
 * @description Converts text to natural speech with voice selection and Gemini Flash Lite language detection
 */

import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import geminiAudioService from './geminiAudioService';

// Initialize Google Cloud Text-to-Speech client (auto-uses GOOGLE_APPLICATION_CREDENTIALS)
const ttsClient = new TextToSpeechClient();

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
  supportedLanguages: 'all';
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

// Voice profiles with language-specific Google Cloud voice mapping
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

// Language-specific voice mapping to Google Cloud Neural2 voices
const VOICE_MAPPING: Record<string, Record<string, { name: string; languageCode: string; ssmlGender: string }>> = {
  'en': {
    'aria': { name: 'en-US-Neural2-F', languageCode: 'en-US', ssmlGender: 'FEMALE' },
    'nova': { name: 'en-US-Neural2-H', languageCode: 'en-US', ssmlGender: 'FEMALE' },
    'atlas': { name: 'en-US-Neural2-D', languageCode: 'en-US', ssmlGender: 'MALE' },
    'echo': { name: 'en-US-Neural2-A', languageCode: 'en-US', ssmlGender: 'NEUTRAL' }
  },
  'pl': {
    'aria': { name: 'pl-PL-Wavenet-A', languageCode: 'pl-PL', ssmlGender: 'FEMALE' },
    'nova': { name: 'pl-PL-Wavenet-B', languageCode: 'pl-PL', ssmlGender: 'FEMALE' },
    'atlas': { name: 'pl-PL-Wavenet-C', languageCode: 'pl-PL', ssmlGender: 'MALE' },
    'echo': { name: 'pl-PL-Wavenet-D', languageCode: 'pl-PL', ssmlGender: 'MALE' }
  },
  'ja': {
    'aria': { name: 'ja-JP-Neural2-B', languageCode: 'ja-JP', ssmlGender: 'FEMALE' },
    'nova': { name: 'ja-JP-Neural2-C', languageCode: 'ja-JP', ssmlGender: 'FEMALE' },
    'atlas': { name: 'ja-JP-Neural2-D', languageCode: 'ja-JP', ssmlGender: 'MALE' },
    'echo': { name: 'ja-JP-Neural2-A', languageCode: 'ja-JP', ssmlGender: 'NEUTRAL' }
  },
  'de': {
    'aria': { name: 'de-DE-Neural2-F', languageCode: 'de-DE', ssmlGender: 'FEMALE' },
    'nova': { name: 'de-DE-Neural2-A', languageCode: 'de-DE', ssmlGender: 'FEMALE' },
    'atlas': { name: 'de-DE-Neural2-D', languageCode: 'de-DE', ssmlGender: 'MALE' },
    'echo': { name: 'de-DE-Neural2-B', languageCode: 'de-DE', ssmlGender: 'MALE' }
  },
  'fr': {
    'aria': { name: 'fr-FR-Neural2-A', languageCode: 'fr-FR', ssmlGender: 'FEMALE' },
    'nova': { name: 'fr-FR-Neural2-B', languageCode: 'fr-FR', ssmlGender: 'MALE' },
    'atlas': { name: 'fr-FR-Neural2-C', languageCode: 'fr-FR', ssmlGender: 'FEMALE' },
    'echo': { name: 'fr-FR-Neural2-D', languageCode: 'fr-FR', ssmlGender: 'MALE' }
  },
  'es': {
    'aria': { name: 'es-ES-Neural2-A', languageCode: 'es-ES', ssmlGender: 'FEMALE' },
    'nova': { name: 'es-ES-Neural2-B', languageCode: 'es-ES', ssmlGender: 'MALE' },
    'atlas': { name: 'es-ES-Neural2-C', languageCode: 'es-ES', ssmlGender: 'FEMALE' },
    'echo': { name: 'es-ES-Neural2-D', languageCode: 'es-ES', ssmlGender: 'FEMALE' }
  }
};

export class TextToSpeechService {
  /**
   * Convert text to speech using Google Cloud TTS API with Gemini language detection
   */
  async synthesizeSpeech(params: TTSRequest): Promise<TTSResult> {
    const startTime = Date.now();

    debugLog('Starting Google Cloud TTS synthesis with Gemini language detection', {
      textLength: params.text.length,
      voiceId: params.voiceId,
      providedLanguage: params.detectedLanguage || params.languageCode
    });

    try {
      // Validate input
      if (!params.text || params.text.trim().length === 0) {
        throw new Error('Text input is required and cannot be empty');
      }

      if (params.text.length > 5000) {
        debugLog('Text too long, truncating', { originalLength: params.text.length });
        params.text = params.text.substring(0, 5000) + '...';
      }

      // Validate voice profile
      const voiceProfile = this.getVoiceProfile(params.voiceId);
      if (!voiceProfile) {
        throw new Error(`Unsupported voice: ${params.voiceId}`);
      }

      // Detect language using Gemini Flash Lite
      const detectedLanguageCode = await this.detectLanguageWithGemini(params.text);
      const languageCode = params.languageCode || detectedLanguageCode;

      debugLog('Language detection completed', {
        detectedLanguageCode,
        usedLanguageCode: languageCode
      });

      // Get Google Cloud voice configuration for detected language
      const voiceConfig = this.getVoiceConfig(params.voiceId, languageCode);

      debugLog('Voice configuration selected', {
        voiceId: params.voiceId,
        languageCode,
        googleVoiceName: voiceConfig.name,
        googleLanguageCode: voiceConfig.languageCode
      });

      // Build Google Cloud TTS request
      const request = {
        input: { text: params.text },
        voice: {
          languageCode: voiceConfig.languageCode,
          name: voiceConfig.name,
          ssmlGender: voiceConfig.ssmlGender as any
        },
        audioConfig: {
          audioEncoding: 'MP3' as any,
          sampleRateHertz: 24000,
          speakingRate: this.normalizeSpeed(params.speed || 1.0),
          pitch: this.normalizePitch(params.pitch || 1.0),
          volumeGainDb: 0.0,
          effectsProfileId: ['telephony-class-application']
        }
      };

      debugLog('Sending request to Google Cloud TTS', {
        languageCode: request.voice.languageCode,
        voiceName: request.voice.name
      });

      // Call Google Cloud Text-to-Speech API
      const [response] = await ttsClient.synthesizeSpeech(request);

      if (!response.audioContent) {
        throw new Error('No audio content received from Google Cloud TTS');
      }

      const audioBuffer = Buffer.from(response.audioContent as Uint8Array);
      const processingTime = Date.now() - startTime;
      const estimatedDuration = this.estimateAudioDuration(params.text, request.audioConfig.speakingRate);

      debugLog('TTS synthesis completed successfully', {
        audioSize: audioBuffer.length,
        estimatedDuration,
        processingTime,
        languageCode
      });

      return {
        audioBuffer,
        format: 'mp3',
        duration: estimatedDuration,
        voiceUsed: voiceProfile.name,
        detectedLanguage: this.getLanguageName(languageCode),
        processingTime
      };

    } catch (error) {
      debugLog('Google Cloud TTS synthesis failed', { error: String(error) });

      const emptyBuffer = Buffer.alloc(0);
      return {
        audioBuffer: emptyBuffer,
        format: 'mp3',
        duration: 0,
        voiceUsed: params.voiceId,
        detectedLanguage: 'English',
        processingTime: Date.now() - startTime
      };
    }
  }

  /**
   * Detect language using Gemini Audio Service
   * @private
   */
  private async detectLanguageWithGemini(text: string): Promise<string> {
    try {
      const result = await geminiAudioService.detectLanguageFromText(text);
      debugLog('Language detected by Gemini', { language: result.language, code: result.code });
      return result.code;
    } catch (error) {
      debugLog('Language detection failed, defaulting to English', { error: String(error) });
      return 'en';
    }
  }

  /**
   * Get voice configuration for language and voice ID
   * @private
   */
  private getVoiceConfig(voiceId: string, languageCode: string) {
    // Try to get language-specific mapping
    const languageMapping = VOICE_MAPPING[languageCode];

    if (!languageMapping) {
      debugLog('Language not in mapping, falling back to English', { languageCode });
      return VOICE_MAPPING['en'][voiceId] || VOICE_MAPPING['en']['aria'];
    }

    // Get voice for this language
    const voiceConfig = languageMapping[voiceId];
    if (!voiceConfig) {
      debugLog('Voice not available for language, using default', { voiceId, languageCode });
      return Object.values(languageMapping)[0];
    }

    return voiceConfig;
  }

  /**
   * Get voice profile by ID
   * @private
   */
  private getVoiceProfile(voiceId: string): TTSVoiceProfile | undefined {
    return VOICE_PROFILES.find(profile => profile.id === voiceId);
  }


  /**
   * Get readable language name from code
   * @private
   */
  private getLanguageName(languageCode: string): string {
    const languageNames: Record<string, string> = {
      'en': 'English',
      'pl': 'Polish',
      'ja': 'Japanese',
      'de': 'German',
      'fr': 'French',
      'es': 'Spanish'
    };

    return languageNames[languageCode] || 'English';
  }

  /**
   * Normalize speaking speed to Google Cloud TTS range
   * @private
   */
  private normalizeSpeed(speed: number): number {
    return Math.max(0.25, Math.min(4.0, speed)); // Google Cloud TTS range
  }

  /**
   * Normalize pitch to Google Cloud TTS range
   * @private
   */
  private normalizePitch(pitch: number): number {
    return Math.max(-20.0, Math.min(20.0, pitch)); // Google Cloud TTS range in semitones
  }

  /**
   * Estimate audio duration based on text length and speaking rate
   * @private
   */
  private estimateAudioDuration(text: string, speakingRate: number): number {
    // Average speaking rate: ~150 words per minute at normal speed
    const wordsPerMinute = 150 * speakingRate;
    const wordCount = text.split(/\s+/).length;
    return Math.max(1, (wordCount / wordsPerMinute) * 60); // Duration in seconds
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
      isReady: geminiAudioService.getStatus().isReady,
      geminiReady: geminiAudioService.getStatus().geminiReady,
      availableVoices: VOICE_PROFILES.length,
      supportedLanguages: '24+ languages (automatic detection)'
    };
  }
}

// Export singleton instance
export default new TextToSpeechService();