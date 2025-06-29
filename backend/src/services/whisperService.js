const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

class WhisperService {
  constructor() {
    // Initialize OpenAI client with API key from environment
    if (!process.env.WHISPER_API) {
      throw new Error('WHISPER_API environment variable is required');
    }
    
    this.openai = new OpenAI({
      apiKey: process.env.WHISPER_API
    });
    
    this.costTracker = {
      totalRequests: 0,
      totalCost: 0,
      lastRequestCost: 0
    };
    
    console.log('[WhisperService] Initialized with OpenAI API');
  }

  /**
   * Transcribes audio buffer using OpenAI Whisper
   * @param {Buffer} audioBuffer - Audio file buffer
   * @param {Object} options - Transcription options
   * @returns {Promise<{text: string, language: string, cost: number}>}
   */
  async transcribeAudio(audioBuffer, options = {}) {
    const DEBUG = process.env.DREAMSCAPE_TEST === 'true';
    
    try {
      if (DEBUG) console.log('[WhisperService] Starting transcription...');
      if (DEBUG) console.log('[WhisperService] Audio buffer size:', audioBuffer.length, 'bytes');
      
      // Validate audio buffer
      if (!audioBuffer || audioBuffer.length === 0) {
        throw new Error('Empty audio buffer provided');
      }
      
      // Create temporary file for OpenAI API
      const tempDir = path.join(__dirname, '../../temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      // Determine file extension based on audio format or use default
      const fileExtension = options.format || 'webm'; // Default for browser recordings
      const tempFilePath = path.join(tempDir, `whisper_${Date.now()}.${fileExtension}`);
      
      if (DEBUG) console.log('[WhisperService] Writing temp file:', tempFilePath);
      fs.writeFileSync(tempFilePath, audioBuffer);
      
      // Calculate estimated cost (OpenAI Whisper pricing: $0.006 per minute)
      const fileSizeMB = audioBuffer.length / (1024 * 1024);
      const estimatedMinutes = Math.max(1, Math.ceil(fileSizeMB * 2)); // Rough estimate
      const estimatedCost = estimatedMinutes * 0.006;
      
      if (DEBUG) console.log('[WhisperService] Estimated cost: $', estimatedCost.toFixed(4));
      
      // Prepare transcription parameters
      const transcriptionParams = {
        file: fs.createReadStream(tempFilePath),
        model: 'whisper-1',
        language: options.language || undefined, // Auto-detect if not specified
        prompt: options.prompt || 'This is a dream narrative or description.',
        response_format: 'verbose_json', // Get detailed response with language detection
        temperature: 0.1 // Lower temperature for more consistent transcription
      };
      
      if (DEBUG) console.log('[WhisperService] Calling OpenAI Whisper API...');
      
      const startTime = Date.now();
      const transcription = await this.openai.audio.transcriptions.create(transcriptionParams);
      const duration = Date.now() - startTime;
      
      if (DEBUG) console.log('[WhisperService] Transcription completed in', duration + 'ms');
      
      // Clean up temporary file
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
        if (DEBUG) console.log('[WhisperService] Cleaned up temp file');
      }
      
      // Calculate actual cost based on audio duration
      const actualDuration = transcription.duration || estimatedMinutes * 60;
      const actualMinutes = Math.ceil(actualDuration / 60);
      const actualCost = actualMinutes * 0.006;
      
      // Update cost tracking
      this.costTracker.totalRequests++;
      this.costTracker.lastRequestCost = actualCost;
      this.costTracker.totalCost += actualCost;
      
      if (DEBUG) {
        console.log('[WhisperService] Transcription result:');
        console.log('- Text length:', transcription.text.length, 'characters');
        console.log('- Language detected:', transcription.language);
        console.log('- Duration:', actualDuration, 'seconds');
        console.log('- Actual cost: $', actualCost.toFixed(4));
        console.log('- Total cost so far: $', this.costTracker.totalCost.toFixed(4));
      }
      
      // Log cost for monitoring
      console.log(`[WhisperService] Transcription cost: $${actualCost.toFixed(4)} (${actualMinutes} min)`);
      
      const result = {
        text: transcription.text.trim(),
        language: transcription.language || 'unknown',
        duration: actualDuration,
        cost: actualCost,
        segments: transcription.segments || [], // Detailed segment information
        words: transcription.words || [] // Word-level timestamps if available
      };
      
      return result;
      
    } catch (error) {
      console.error('[WhisperService] Transcription error:', error);
      
      // Clean up temp file in case of error
      const tempFiles = fs.readdirSync(path.join(__dirname, '../../temp'))
        .filter(file => file.startsWith('whisper_'))
        .forEach(file => {
          try {
            fs.unlinkSync(path.join(__dirname, '../../temp', file));
          } catch (cleanupError) {
            console.warn('[WhisperService] Failed to cleanup temp file:', file);
          }
        });
      
      throw new Error(`Whisper transcription failed: ${error.message}`);
    }
  }

  /**
   * Transcribes audio with enhanced formatting and punctuation
   * @param {Buffer} audioBuffer - Audio file buffer
   * @param {Object} options - Transcription options
   * @returns {Promise<{text: string, formattedText: string, language: string, cost: number}>}
   */
  async transcribeWithFormatting(audioBuffer, options = {}) {
    const DEBUG = process.env.DREAMSCAPE_TEST === 'true';
    
    try {
      if (DEBUG) console.log('[WhisperService] Starting enhanced transcription...');
      
      // Get basic transcription
      const transcription = await this.transcribeAudio(audioBuffer, {
        ...options,
        prompt: 'This is a dream narrative. Please include proper punctuation and formatting.'
      });
      
      // Apply additional formatting for dream narratives
      const formattedText = this.formatDreamText(transcription.text);
      
      if (DEBUG) console.log('[WhisperService] Applied dream-specific formatting');
      
      return {
        ...transcription,
        formattedText: formattedText
      };
      
    } catch (error) {
      console.error('[WhisperService] Enhanced transcription error:', error);
      throw error;
    }
  }

  /**
   * Formats dream text with better structure and punctuation
   * @param {string} text - Raw transcribed text
   * @returns {string} - Formatted dream text
   */
  formatDreamText(text) {
    if (!text || typeof text !== 'string') {
      return '';
    }
    
    let formatted = text.trim();
    
    // Capitalize first letter
    if (formatted.length > 0) {
      formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }
    
    // Ensure proper sentence ending
    if (formatted.length > 0 && !formatted.match(/[.!?]$/)) {
      formatted += '.';
    }
    
    // Basic sentence structure improvements
    formatted = formatted
      // Fix common transcription issues
      .replace(/\bi\b/g, 'I') // Capitalize "I"
      .replace(/\s+/g, ' ') // Multiple spaces to single space
      .replace(/\.\s*\./g, '.') // Double periods
      .replace(/([.!?])\s*([a-z])/g, (match, p1, p2) => `${p1} ${p2.toUpperCase()}`) // Capitalize after punctuation
      // Add common dream narrative improvements
      .replace(/\band then\b/gi, '. Then') // Better sentence flow
      .replace(/\bso then\b/gi, '. Then') // Better sentence flow
      .trim();
    
    return formatted;
  }

  /**
   * Gets current cost tracking information
   * @returns {Object} - Cost tracking stats
   */
  getCostStats() {
    return {
      totalRequests: this.costTracker.totalRequests,
      totalCost: parseFloat(this.costTracker.totalCost.toFixed(4)),
      lastRequestCost: parseFloat(this.costTracker.lastRequestCost.toFixed(4)),
      averageCostPerRequest: this.costTracker.totalRequests > 0 
        ? parseFloat((this.costTracker.totalCost / this.costTracker.totalRequests).toFixed(4))
        : 0
    };
  }

  /**
   * Validates audio format for Whisper compatibility
   * @param {string} format - Audio format
   * @returns {boolean} - Whether format is supported
   */
  isFormatSupported(format) {
    const supportedFormats = [
      'mp3', 'mp4', 'm4a', 'wav', 'webm', 'ogg', 'flac'
    ];
    
    return supportedFormats.some(supported => 
      format.toLowerCase().includes(supported)
    );
  }
}

module.exports = WhisperService; 