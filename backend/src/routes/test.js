const express = require('express');
const StorageService = require('../services/storageService');

const router = express.Router();
const storageService = new StorageService();

// POST /api/test/upload endpoint
router.post('/upload', async (req, res) => {
  console.log('=== Test Upload Endpoint Called ===');
  
  try {
    // Check if file was uploaded
    if (!req.file) {
      console.log('Error: No file provided');
      return res.status(400).json({ 
        success: false, 
        error: 'No file provided' 
      });
    }

    const { buffer, originalname, size } = req.file;
    console.log(`Processing file: ${originalname}, size: ${size} bytes`);

    // Upload to 0G Storage using storageService
    console.log('Uploading to 0G Storage...');
    const uploadResult = await storageService.uploadFile(buffer, originalname);
    
    console.log('Upload successful:', uploadResult);
    
    // Return success response
    const response = {
      success: true,
      rootHash: uploadResult.rootHash,
      filename: uploadResult.filename,
      size: size,
      txHash: uploadResult.txHash
    };
    
    console.log('=== SENDING SUCCESS RESPONSE ===');
    console.log('Response:', JSON.stringify(response, null, 2));
    
    res.status(200).json(response);
    console.log('=== RESPONSE SENT ===');

  } catch (error) {
    console.error('Upload failed:', error);
    
    // Return error response
    res.status(500).json({
      success: false,
      error: error.message || 'Upload failed',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// GET /api/test/download/:rootHash endpoint
router.get('/download/:rootHash', async (req, res) => {
  console.log('=== Test Download Endpoint Called ===');
  
  try {
    const { rootHash } = req.params;
    const filename = req.query.filename || `downloaded_${Date.now()}`;
    
    console.log(`Downloading file with root hash: ${rootHash}`);
    console.log(`Output filename: ${filename}`);

    // Create temp output path
    const path = require('path');
    const outputPath = path.join(__dirname, '../../temp', `download_${Date.now()}_${filename}`);
    
    // Download from 0G Storage using storageService
    console.log('Downloading from 0G Storage...');
    const downloadResult = await storageService.downloadFile(rootHash, outputPath);
    
    console.log('Download successful:', downloadResult);
    
    // Stream file back to client
    const fs = require('fs');
    if (fs.existsSync(outputPath)) {
      const fileStats = fs.statSync(outputPath);
      
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Length', fileStats.size);
      
      const fileStream = fs.createReadStream(outputPath);
      fileStream.pipe(res);
      
      // Clean up temp file after streaming
      fileStream.on('end', () => {
        try {
          fs.unlinkSync(outputPath);
          console.log('Temp download file cleaned up');
        } catch (cleanupError) {
          console.warn('Failed to cleanup temp download file:', cleanupError);
        }
      });
    } else {
      throw new Error('Downloaded file not found');
    }

  } catch (error) {
    console.error('Download failed:', error);
    
    // Return error response
    res.status(500).json({
      success: false,
      error: error.message || 'Download failed',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router; 