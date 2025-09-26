/**
 * @fileoverview Upload API Handler - 0G Storage compatible
 * @description Handles file uploads and returns root hash
 */

import { Request, Response } from 'express';
import { storageService } from '../services/storage';

// Debug logging
const debugLog = (message: string, data?: any) => {
  console.log(`[Upload API] ${message}`, data || '');
};

/**
 * Upload handler - POST /api/storage/upload
 * Compatible with 0G Storage API
 */
export async function uploadHandler(req: Request, res: Response) {
  try {
    debugLog('Upload request received', {
      hasFile: !!req.file,
      fileName: req.file?.originalname || req.body?.fileName,
      fileSize: req.file?.size,
      mimeType: req.file?.mimetype
    });

    // Validate file upload
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file provided'
      });
    }

    const file = req.file;
    const fileName = file.originalname || req.body.fileName || 'unknown';
    const mimeType = file.mimetype || 'application/octet-stream';
    const buffer = file.buffer;

    // Save file to storage
    const { rootHash, alreadyExists } = await storageService.saveFile(
      buffer,
      fileName,
      mimeType
    );

    debugLog('Upload successful', {
      rootHash: rootHash.substring(0, 10) + '...',
      fileName,
      fileSize: buffer.length,
      alreadyExists
    });

    // Return 0G-compatible response
    res.json({
      success: true,
      rootHash,
      alreadyExists,
      // Optional metadata for debugging
      metadata: {
        fileName,
        fileSize: buffer.length,
        mimeType,
        uploadTime: Date.now()
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    debugLog('Upload failed', { error: errorMessage });

    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
}

/**
 * Batch upload handler - POST /api/storage/upload/batch
 * For uploading multiple files at once
 */
export async function batchUploadHandler(req: Request, res: Response) {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files provided'
      });
    }

    debugLog('Batch upload request', { fileCount: files.length });

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const file of files) {
      try {
        const { rootHash, alreadyExists } = await storageService.saveFile(
          file.buffer,
          file.originalname,
          file.mimetype || 'application/octet-stream'
        );

        results.push({
          success: true,
          fileName: file.originalname,
          rootHash,
          alreadyExists
        });
        successCount++;
      } catch (error) {
        results.push({
          success: false,
          fileName: file.originalname,
          error: error instanceof Error ? error.message : String(error)
        });
        errorCount++;
      }
    }

    debugLog('Batch upload completed', {
      total: files.length,
      success: successCount,
      errors: errorCount
    });

    res.json({
      success: errorCount === 0,
      results,
      summary: {
        total: files.length,
        success: successCount,
        errors: errorCount
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    debugLog('Batch upload failed', { error: errorMessage });

    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
}