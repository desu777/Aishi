/**
 * @fileoverview Download API Handler - 0G Storage compatible
 * @description Handles file downloads by root hash
 */

import { Request, Response } from 'express';
import { storageService } from '../services/storage';

// Debug logging
const debugLog = (message: string, data?: any) => {
  console.log(`[Download API] ${message}`, data || '');
};

/**
 * Download handler - GET /api/storage/file?root={hash}
 * Compatible with 0G Storage API
 */
export async function downloadHandler(req: Request, res: Response) {
  try {
    const rootHash = req.query.root as string;

    debugLog('Download request received', {
      rootHash: rootHash?.substring(0, 10) + '...',
      hasRootHash: !!rootHash
    });

    // Validate root hash
    if (!rootHash) {
      return res.status(400).json({
        success: false,
        error: 'Root hash is required',
        code: 400
      });
    }

    // Retrieve file from storage
    const fileBuffer = await storageService.getFile(rootHash);

    if (!fileBuffer) {
      debugLog('File not found', { rootHash: rootHash.substring(0, 10) + '...' });

      // Return 0G-compatible error response
      return res.status(404).json({
        success: false,
        error: 'File not found',
        code: 101, // 0G Storage error code for not found
        message: `File with root hash "${rootHash.substring(0, 10)}...${rootHash.substring(rootHash.length - 10)}" does not exist in storage`
      });
    }

    // Get file metadata
    const metadata = storageService.getFileMetadata(rootHash);

    debugLog('File found, sending response', {
      rootHash: rootHash.substring(0, 10) + '...',
      fileName: metadata?.fileName,
      fileSize: fileBuffer.length,
      mimeType: metadata?.mimeType
    });

    // Set appropriate headers
    if (metadata) {
      res.setHeader('Content-Type', metadata.mimeType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `inline; filename="${metadata.fileName}"`);
      res.setHeader('X-Root-Hash', rootHash);
      res.setHeader('X-File-Size', fileBuffer.length.toString());
    }

    // Send file buffer (0G Storage sends raw binary data)
    return res.send(fileBuffer);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    debugLog('Download failed', { error: errorMessage });

    return res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
}

/**
 * Download metadata handler - GET /api/storage/metadata?root={hash}
 * Returns file metadata without downloading the file
 */
export async function metadataHandler(req: Request, res: Response) {
  try {
    const rootHash = req.query.root as string;

    if (!rootHash) {
      return res.status(400).json({
        success: false,
        error: 'Root hash is required'
      });
    }

    const metadata = storageService.getFileMetadata(rootHash);

    if (!metadata) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    debugLog('Metadata request', {
      rootHash: rootHash.substring(0, 10) + '...',
      fileName: metadata.fileName
    });

    return res.json({
      success: true,
      metadata
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    debugLog('Metadata request failed', { error: errorMessage });

    return res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
}

/**
 * Check file existence handler - HEAD /api/storage/file?root={hash}
 * Returns headers only to check if file exists
 */
export async function existsHandler(req: Request, res: Response) {
  try {
    const rootHash = req.query.root as string;

    if (!rootHash) {
      return res.status(400).end();
    }

    const exists = await storageService.exists(rootHash);

    if (!exists) {
      return res.status(404).end();
    }

    const metadata = storageService.getFileMetadata(rootHash);

    if (metadata) {
      res.setHeader('Content-Type', metadata.mimeType || 'application/octet-stream');
      res.setHeader('Content-Length', metadata.fileSize.toString());
      res.setHeader('X-Root-Hash', rootHash);
    }

    return res.status(200).end();

  } catch (error) {
    return res.status(500).end();
  }
}