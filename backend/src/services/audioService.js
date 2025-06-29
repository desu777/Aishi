const ffmpeg = require('fluent-ffmpeg');
const path = require('path');

class AudioService {
  constructor() {
    // Set FFmpeg path based on DREAMSCAPE_TEST environment
    if (process.env.DREAMSCAPE_TEST === 'true') {
      const ffmpegPath = path.join(__dirname, '../../../ffmpeg/bin/ffmpeg.exe');
      const ffprobePath = path.join(__dirname, '../../../ffmpeg/bin/ffprobe.exe');
      
      console.log('[AudioService] Using local FFmpeg binaries');
      console.log('- FFmpeg path:', ffmpegPath);
      console.log('- FFprobe path:', ffprobePath);
      
      ffmpeg.setFfmpegPath(ffmpegPath);
      ffmpeg.setFfprobePath(ffprobePath);
    } else {
      console.log('[AudioService] Using system FFmpeg binaries');
    }
  }

  /**
   * Validates if buffer contains valid audio file
   * @param {Buffer} buffer - Audio file buffer
   * @returns {Promise<{isValid: boolean, format?: string, error?: string}>}
   */
  async validateAudioFile(buffer) {
    const DEBUG = process.env.DREAMSCAPE_TEST === 'true';
    
    try {
      if (DEBUG) console.log('[AudioService] Starting audio validation...');
      
      // Check buffer size
      if (!buffer || buffer.length === 0) {
        return { isValid: false, error: 'Empty buffer provided' };
      }
      
      if (DEBUG) console.log('[AudioService] Buffer size:', buffer.length, 'bytes');
      
      // Write buffer to temporary file for ffprobe analysis
      const fs = require('fs');
      const tempDir = path.join(__dirname, '../../temp');
      
      // Ensure temp directory exists
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      const tempFilePath = path.join(tempDir, `audio_validation_${Date.now()}.tmp`);
      fs.writeFileSync(tempFilePath, buffer);
      
      if (DEBUG) console.log('[AudioService] Created temp file:', tempFilePath);
      
      // Use ffprobe to validate and get metadata
      const metadata = await this.probeAudioFile(tempFilePath);
      
      // Clean up temp file
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
        if (DEBUG) console.log('[AudioService] Cleaned up temp file');
      }
      
      // Check if it's a valid audio file
      if (!metadata.format || !metadata.format.format_name) {
        return { isValid: false, error: 'Invalid audio format detected' };
      }
      
      // Check supported formats
      const supportedFormats = ['mp3', 'wav', 'webm', 'm4a', 'mp4', 'ogg', 'aac'];
      const formatName = metadata.format.format_name.toLowerCase();
      
      const isSupported = supportedFormats.some(format => 
        formatName.includes(format)
      );
      
      if (!isSupported) {
        return { 
          isValid: false, 
          error: `Unsupported audio format: ${formatName}. Supported: ${supportedFormats.join(', ')}` 
        };
      }
      
      if (DEBUG) console.log('[AudioService] Audio validation successful:', formatName);
      
      return { 
        isValid: true, 
        format: formatName 
      };
      
    } catch (error) {
      console.error('[AudioService] Audio validation error:', error);
      return { 
        isValid: false, 
        error: `Validation failed: ${error.message}` 
      };
    }
  }

  /**
   * Gets detailed audio metadata including duration
   * @param {Buffer} buffer - Audio file buffer
   * @returns {Promise<{duration: number, format: string, size: number, bitrate?: number}>}
   */
  async getAudioMetadata(buffer) {
    const DEBUG = process.env.DREAMSCAPE_TEST === 'true';
    
    try {
      if (DEBUG) console.log('[AudioService] Getting audio metadata...');
      
      // Write buffer to temporary file
      const fs = require('fs');
      const tempDir = path.join(__dirname, '../../temp');
      
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      const tempFilePath = path.join(tempDir, `audio_metadata_${Date.now()}.tmp`);
      fs.writeFileSync(tempFilePath, buffer);
      
      // Get metadata using ffprobe
      const metadata = await this.probeAudioFile(tempFilePath);
      
      // Clean up temp file
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      
      const result = {
        duration: parseFloat(metadata.format.duration) || 0,
        format: metadata.format.format_name || 'unknown',
        size: buffer.length,
        bitrate: parseInt(metadata.format.bit_rate) || undefined
      };
      
      if (DEBUG) console.log('[AudioService] Metadata extracted:', result);
      
      return result;
      
    } catch (error) {
      console.error('[AudioService] Metadata extraction error:', error);
      throw new Error(`Failed to extract audio metadata: ${error.message}`);
    }
  }

  /**
   * Checks if audio duration is under specified limit
   * @param {Buffer} buffer - Audio file buffer
   * @param {number} maxDurationSeconds - Maximum duration in seconds (default: 300 = 5 minutes)
   * @returns {Promise<{isValid: boolean, duration: number, error?: string}>}
   */
  async validateDuration(buffer, maxDurationSeconds = 300) {
    const DEBUG = process.env.DREAMSCAPE_TEST === 'true';
    
    try {
      const metadata = await this.getAudioMetadata(buffer);
      const duration = metadata.duration;
      
      if (DEBUG) console.log(`[AudioService] Duration check: ${duration}s (max: ${maxDurationSeconds}s)`);
      
      if (duration > maxDurationSeconds) {
        return {
          isValid: false,
          duration: duration,
          error: `Audio duration ${Math.round(duration)}s exceeds maximum ${maxDurationSeconds}s`
        };
      }
      
      return {
        isValid: true,
        duration: duration
      };
      
    } catch (error) {
      console.error('[AudioService] Duration validation error:', error);
      return {
        isValid: false,
        duration: 0,
        error: `Duration validation failed: ${error.message}`
      };
    }
  }

  /**
   * Probes audio file using ffprobe
   * @param {string} filePath - Path to audio file
   * @returns {Promise<Object>} - FFprobe metadata
   */
  async probeAudioFile(filePath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(new Error(`FFprobe error: ${err.message}`));
        } else {
          resolve(metadata);
        }
      });
    });
  }

  /**
   * Complete audio validation pipeline
   * @param {Buffer} buffer - Audio file buffer
   * @param {number} maxDurationSeconds - Maximum duration (default: 300s)
   * @returns {Promise<{isValid: boolean, metadata?: Object, error?: string}>}
   */
  async validateAudio(buffer, maxDurationSeconds = 300) {
    const DEBUG = process.env.DREAMSCAPE_TEST === 'true';
    
    try {
      if (DEBUG) console.log('[AudioService] Starting complete audio validation...');
      
      // Step 1: Validate format
      const formatValidation = await this.validateAudioFile(buffer);
      if (!formatValidation.isValid) {
        return formatValidation;
      }
      
      // Step 2: Get metadata
      const metadata = await this.getAudioMetadata(buffer);
      
      // Step 3: Validate duration
      const durationValidation = await this.validateDuration(buffer, maxDurationSeconds);
      if (!durationValidation.isValid) {
        return durationValidation;
      }
      
      if (DEBUG) console.log('[AudioService] Complete validation successful');
      
      return {
        isValid: true,
        metadata: {
          ...metadata,
          formatValid: formatValidation.format,
          durationValid: true
        }
      };
      
    } catch (error) {
      console.error('[AudioService] Complete validation error:', error);
      return {
        isValid: false,
        error: `Audio validation failed: ${error.message}`
      };
    }
  }
}

module.exports = AudioService; 