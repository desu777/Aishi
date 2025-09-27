/**
 * @fileoverview AISHI Storage Microservice - Main Server
 * @description Local storage service emulating 0G Storage API for development
 */

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { uploadHandler } from './api/upload';
import { downloadHandler } from './api/download';
import { storageService } from './services/storage';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(cors({
  origin: ['http://localhost:3003', 'http://localhost:3001', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Debug logging middleware
app.use((req, _res, next) => {
  console.log(`[AISHI-Storage] ${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'aishi-storage',
    timestamp: new Date().toISOString(),
    storage: storageService.getStats()
  });
});

// Storage API endpoints (0G compatible)
app.post('/api/storage/upload', upload.single('file'), uploadHandler);
app.get('/api/storage/file', downloadHandler);

// List files endpoint (for debugging)
app.get('/api/storage/list', async (_req, res) => {
  try {
    const files = await storageService.listFiles();
    res.json({
      success: true,
      files,
      count: files.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list files'
    });
  }
});

// Delete file endpoint (for debugging)
app.delete('/api/storage/file/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    const success = await storageService.deleteFile(hash);
    res.json({ success });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete file'
    });
  }
});

// Clear all files endpoint (for debugging - use with caution!)
app.delete('/api/storage/clear', async (_req, res) => {
  try {
    const cleared = await storageService.clearAll();
    res.json({
      success: true,
      filesCleared: cleared
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to clear storage'
    });
  }
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[AISHI-Storage] Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AISHI Storage Microservice running on http://localhost:${PORT}`);
  console.log(`📁 Storage directory: ${path.join(__dirname, '../database/files')}`);
  console.log(`🔗 0G-compatible endpoints:`);
  console.log(`   POST /api/storage/upload - Upload file`);
  console.log(`   GET  /api/storage/file?root={hash} - Download file`);
  console.log(`🔧 Debug endpoints:`);
  console.log(`   GET  /api/storage/list - List all files`);
  console.log(`   DELETE /api/storage/file/{hash} - Delete file`);
  console.log(`   DELETE /api/storage/clear - Clear all files`);
});