/**
 * @fileoverview Speech-to-Text Service using Gemini Live API
 * @description Converts audio input to text with automatic language detection
 */

import geminiService from './geminiService';

// Debug logging
const debugLog = (message: string, data?: any) => {
  if (process.env.TEST_ENV === 'true') {
    console.log(`[SpeechToTextService] ${message}`, data || '');
  }
};

export interface STTResult {
  transcript: string;
  detectedLanguage: string;     // "Polish", "English", "Japanese", etc.
  languageCode: string;        // "pl", "en", "ja", etc.
  confidence: number;
  processingTime: number;
}

export interface STTRequest {
  audioBuffer: Buffer;
  inputFormat: 'webm' | 'wav' | 'mp3' | 'ogg';
  enableLanguageDetection?: boolean;
}

export class SpeechToTextService {
  /**
   * Convert audio to text using Gemini Live API with automatic language detection
   */
  async transcribeAudio(params: STTRequest): Promise<STTResult> {
    const startTime = Date.now();

    debugLog('Starting audio transcription', {
      audioSize: params.audioBuffer.length,
      format: params.inputFormat,
      enableLanguageDetection: params.enableLanguageDetection !== false
    });

    try {
      // Ensure Gemini service is ready
      if (!geminiService.isReady()) {
        throw new Error('Gemini service not ready for audio transcription');
      }

      // Convert audio to compatible format if needed
      const compatibleAudio = await this.convertToCompatibleFormat(
        params.audioBuffer,
        params.inputFormat
      );

      debugLog('Audio converted to compatible format', {
        originalSize: params.audioBuffer.length,
        convertedSize: compatibleAudio.length
      });

      // Use Gemini Live API for transcription with automatic language detection
      // NOTE: This is a placeholder implementation - will need actual Gemini Live API integration
      const transcriptionResult = await this.callGeminiLiveSTT(compatibleAudio);

      const processingTime = Date.now() - startTime;

      debugLog('Transcription completed', {
        transcript: transcriptionResult.transcript.substring(0, 100),
        detectedLanguage: transcriptionResult.detectedLanguage,
        confidence: transcriptionResult.confidence,
        processingTime
      });

      return {
        transcript: transcriptionResult.transcript,
        detectedLanguage: transcriptionResult.detectedLanguage,
        languageCode: transcriptionResult.languageCode,
        confidence: transcriptionResult.confidence,
        processingTime
      };

    } catch (error) {
      debugLog('Audio transcription failed', { error: String(error) });

      // For now, return a fallback indicating transcription failure
      return {
        transcript: '[Audio transcription failed]',
        detectedLanguage: 'English',
        languageCode: 'en',
        confidence: 0.0,
        processingTime: Date.now() - startTime
      };
    }
  }

  /**
   * Convert audio to Gemini-compatible format (16kHz PCM)
   * @private
   */
  private async convertToCompatibleFormat(audioBuffer: Buffer, inputFormat: string): Promise<Buffer> {
    debugLog('Converting audio format', {
      inputFormat,
      size: audioBuffer.length
    });

    // For now, return the original buffer
    // TODO: Implement actual audio format conversion using ffmpeg or similar
    // Gemini Live API expects: Raw 16-bit PCM audio at 16kHz, little-endian

    return audioBuffer;
  }

  /**
   * Call Gemini Live API for speech-to-text
   * @private
   */
  private async callGeminiLiveSTT(audioBuffer: Buffer): Promise<{
    transcript: string;
    detectedLanguage: string;
    languageCode: string;
    confidence: number;
  }> {
    // TODO: Implement actual Gemini Live API STT call
    // For now, this is a placeholder that simulates the API call

    debugLog('Calling Gemini Live API for STT', {
      audioSize: audioBuffer.length
    });

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500));

    // Return mock result - will be replaced with actual Gemini Live API call
    return {
      transcript: '[Simulated transcription - Gemini Live API integration needed]',
      detectedLanguage: 'English',
      languageCode: 'en',
      confidence: 0.95
    };
  }

  /**
   * Get supported audio formats
   */
  getSupportedFormats(): string[] {
    return ['webm', 'wav', 'mp3', 'ogg'];
  }

  /**
   * Validate audio format
   */
  isFormatSupported(format: string): boolean {
    return this.getSupportedFormats().includes(format.toLowerCase());
  }

  /**
   * Get service status
   */
  getStatus(): {
    isReady: boolean;
    geminiReady: boolean;
    supportedFormats: string[];
  } {
    return {
      isReady: geminiService.isReady(),
      geminiReady: geminiService.isReady(),
      supportedFormats: this.getSupportedFormats()
    };
  }
}

// Export singleton instance
export default new SpeechToTextService();