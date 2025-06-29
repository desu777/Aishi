const express = require('express');
const AudioService = require('../services/audioService');
const WhisperService = require('../services/whisperService');
const StorageService = require('../services/storageService');

const router = express.Router();

// Initialize services
const audioService = new AudioService();
const whisperService = new WhisperService();
const storageService = new StorageService();

/**
 * POST /api/dreams/upload
 * Accepts either:
 * - 'audio' file (multipart) → transcribe → save text to storage
 * - 'text' field (json/form) → directly save text to storage
 * 
 * Returns: { dreamId, textHash, metadataHash, transcription?, cost? }
 */
router.post('/upload', async (req, res) => {
  const DEBUG = process.env.DREAMSCAPE_TEST === 'true';
  
  console.log('=== Dream Upload Endpoint Called ===');
  
  try {
    let dreamText = '';
    let transcriptionData = null;
    let inputType = 'text';
    
    // Check if we have audio file or text input
    if (req.file && req.file.fieldname === 'audio') {
      inputType = 'audio';
      console.log('Processing audio input...');
      
      const { buffer, originalname, size } = req.file;
      if (DEBUG) console.log(`Audio file: ${originalname}, size: ${size} bytes`);
      
      // STEP 1: Validate audio
      console.log('Validating audio file...');
      const audioValidation = await audioService.validateAudio(buffer);
      
      if (!audioValidation.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Invalid audio file',
          details: audioValidation.error
        });
      }
      
      if (DEBUG) console.log('Audio validation passed:', audioValidation.metadata);
      
      // STEP 2: Transcribe with Whisper
      console.log('Transcribing audio with Whisper...');
      
      try {
        const audioFormat = audioValidation.metadata.formatValid || 'webm';
        transcriptionData = await whisperService.transcribeWithFormatting(buffer, {
          format: audioFormat,
          language: req.body.language || undefined
        });
        
        dreamText = transcriptionData.formattedText || transcriptionData.text;
        
        console.log(`Transcription successful: ${dreamText.length} characters`);
        console.log(`Language detected: ${transcriptionData.language}`);
        console.log(`Cost: $${transcriptionData.cost.toFixed(4)}`);
        
      } catch (transcriptionError) {
        console.error('Transcription failed:', transcriptionError);
        return res.status(500).json({
          success: false,
          error: 'Audio transcription failed',
          details: transcriptionError.message
        });
      }
      
    } else if (req.body.text) {
      inputType = 'text';
      dreamText = req.body.text.trim();
      console.log(`Processing text input: ${dreamText.length} characters`);
      
      if (dreamText.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Empty text provided'
        });
      }
      
      if (dreamText.length > 10000) { // 10k character limit
        return res.status(400).json({
          success: false,
          error: 'Text too long (max 10,000 characters)'
        });
      }
      
    } else {
      return res.status(400).json({
        success: false,
        error: 'No audio file or text provided. Send either "audio" file or "text" field.'
      });
    }
    
    // STEP 3: Generate Dream ID and prepare metadata
    const dreamId = Date.now().toString();
    const timestamp = new Date().toISOString();
    
    const metadata = {
      dreamId: dreamId,
      timestamp: timestamp,
      inputType: inputType, // 'audio' or 'text'
      textLength: dreamText.length,
      language: transcriptionData?.language || 'unknown',
      
      // Audio-specific metadata
      ...(transcriptionData && {
        transcription: {
          originalText: transcriptionData.text,
          formattedText: transcriptionData.formattedText,
          language: transcriptionData.language,
          duration: transcriptionData.duration,
          cost: transcriptionData.cost,
          segments: transcriptionData.segments?.length || 0,
          words: transcriptionData.words?.length || 0
        }
      }),
      
      // User metadata
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      
      // Processing metadata
      createdAt: timestamp,
      version: '1.0',
      service: 'dreamscape-backend'
    };
    
    if (DEBUG) console.log('Generated metadata:', metadata);
    
    // STEP 4: Upload dream text to 0G Storage
    console.log('Uploading dream text to 0G Storage...');
    
    const textBuffer = Buffer.from(dreamText, 'utf-8');
    const textFilename = `dream_${dreamId}.txt`;
    
    try {
      const textUploadResult = await storageService.uploadFile(textBuffer, textFilename);
      console.log('Dream text uploaded successfully:', textUploadResult.rootHash);
      
      // STEP 5: Upload metadata to 0G Storage
      console.log('Uploading metadata to 0G Storage...');
      
      const metadataUploadResult = await storageService.uploadJSON(metadata);
      console.log('Metadata uploaded successfully:', metadataUploadResult.rootHash);
      
      // STEP 6: Prepare response
      const response = {
        success: true,
        dreamId: dreamId,
        textHash: textUploadResult.rootHash,
        metadataHash: metadataUploadResult.rootHash,
        timestamp: timestamp,
        inputType: inputType,
        textLength: dreamText.length,
        language: metadata.language
      };
      
      // Add transcription info if audio was processed
      if (transcriptionData) {
        response.transcription = {
          cost: transcriptionData.cost,
          duration: transcriptionData.duration,
          language: transcriptionData.language,
          costStats: whisperService.getCostStats()
        };
      }
      
      // Add storage info
      response.storage = {
        textUpload: {
          hash: textUploadResult.rootHash,
          txHash: textUploadResult.txHash,
          alreadyExists: textUploadResult.alreadyExists || false
        },
        metadataUpload: {
          hash: metadataUploadResult.rootHash,
          txHash: metadataUploadResult.txHash,
          size: metadataUploadResult.size
        }
      };
      
      console.log('=== DREAM UPLOAD SUCCESSFUL ===');
      console.log('Response:', JSON.stringify(response, null, 2));
      
      res.status(200).json(response);
      
    } catch (storageError) {
      console.error('Storage upload failed:', storageError);
      return res.status(500).json({
        success: false,
        error: 'Failed to store dream data',
        details: storageError.message
      });
    }
    
  } catch (error) {
    console.error('Dream upload failed:', error);
    
    res.status(500).json({
      success: false,
      error: 'Dream upload failed',
      details: process.env.NODE_ENV === 'development' ? error.stack : error.message
    });
  }
});

/**
 * GET /api/dreams/:dreamId
 * Retrieves dream data by dreamId
 */
router.get('/:dreamId', async (req, res) => {
  const DEBUG = process.env.DREAMSCAPE_TEST === 'true';
  
  console.log('=== Get Dream Endpoint Called ===');
  
  try {
    const { dreamId } = req.params;
    
    if (!dreamId) {
      return res.status(400).json({
        success: false,
        error: 'Dream ID is required'
      });
    }
    
    if (DEBUG) console.log('Retrieving dream:', dreamId);
    
    // For now, return a placeholder response
    // TODO: Implement actual retrieval from 0G Storage using KV or search
    res.status(501).json({
      success: false,
      error: 'Dream retrieval not yet implemented',
      dreamId: dreamId,
      note: 'This endpoint will be implemented in next phase with 0G KV storage'
    });
    
  } catch (error) {
    console.error('Get dream failed:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve dream',
      details: process.env.NODE_ENV === 'development' ? error.stack : error.message
    });
  }
});

/**
 * GET /api/dreams/stats/whisper
 * Returns Whisper cost statistics
 */
router.get('/stats/whisper', (req, res) => {
  try {
    const stats = whisperService.getCostStats();
    
    res.json({
      success: true,
      stats: stats,
      message: 'Whisper usage statistics'
    });
    
  } catch (error) {
    console.error('Failed to get Whisper stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get statistics'
    });
  }
});

module.exports = router; 