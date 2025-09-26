/**
 * @fileoverview Storage Service - Local file management
 * @description Manages file storage and retrieval with root hash generation
 */

import fs from 'fs/promises';
import path from 'path';
import { keccak256, toHex } from 'viem';

// Storage configuration
const STORAGE_DIR = path.join(__dirname, '../../database/files');
const METADATA_FILE = path.join(__dirname, '../../database/metadata.json');

// Debug logging
const debugLog = (message: string, data?: any) => {
  console.log(`[StorageService] ${message}`, data || '');
};

interface FileMetadata {
  rootHash: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadTime: number;
  accessCount: number;
  lastAccessed?: number;
}

interface StorageMetadata {
  files: Record<string, FileMetadata>;
  totalFiles: number;
  totalSize: number;
  lastUpdated: number;
}

class StorageService {
  private metadata: StorageMetadata = {
    files: {},
    totalFiles: 0,
    totalSize: 0,
    lastUpdated: Date.now()
  };

  constructor() {
    this.initialize();
  }

  /**
   * Initialize storage service
   */
  private async initialize() {
    try {
      // Ensure storage directory exists
      await fs.mkdir(STORAGE_DIR, { recursive: true });

      // Load existing metadata if available
      await this.loadMetadata();

      debugLog('Storage service initialized', {
        storageDir: STORAGE_DIR,
        totalFiles: this.metadata.totalFiles,
        totalSize: this.metadata.totalSize
      });
    } catch (error) {
      debugLog('Failed to initialize storage', { error: String(error) });
    }
  }

  /**
   * Load metadata from file
   */
  private async loadMetadata() {
    try {
      const data = await fs.readFile(METADATA_FILE, 'utf-8');
      this.metadata = JSON.parse(data);
    } catch (error) {
      // File doesn't exist, use default metadata
      await this.saveMetadata();
    }
  }

  /**
   * Save metadata to file
   */
  private async saveMetadata() {
    try {
      this.metadata.lastUpdated = Date.now();
      await fs.writeFile(METADATA_FILE, JSON.stringify(this.metadata, null, 2));
    } catch (error) {
      debugLog('Failed to save metadata', { error: String(error) });
    }
  }

  /**
   * Generate root hash for file content
   */
  async generateRootHash(buffer: Buffer, fileName: string): Promise<string> {
    // Add timestamp and filename for uniqueness
    const timestamp = Math.floor(Date.now() / 1000);
    const timestampBytes = Buffer.allocUnsafe(4);
    timestampBytes.writeUInt32LE(timestamp, 0);

    const fileNameBytes = Buffer.from(fileName, 'utf-8');

    // Combine: content + timestamp + filename
    const combined = Buffer.concat([buffer, timestampBytes, fileNameBytes]);

    // Generate hash using viem's keccak256
    const hash = keccak256(toHex(combined));

    debugLog('Generated root hash', {
      fileName,
      fileSize: buffer.length,
      hash: hash.substring(0, 10) + '...'
    });

    return hash;
  }

  /**
   * Check if file exists by root hash
   */
  async exists(rootHash: string): Promise<boolean> {
    return !!this.metadata.files[rootHash];
  }

  /**
   * Save file to storage
   */
  async saveFile(
    buffer: Buffer,
    fileName: string,
    mimeType: string,
    rootHash?: string
  ): Promise<{ rootHash: string; alreadyExists: boolean }> {
    try {
      // Generate root hash if not provided
      const hash = rootHash || await this.generateRootHash(buffer, fileName);

      // Check if file already exists
      if (await this.exists(hash)) {
        debugLog('File already exists', {
          rootHash: hash.substring(0, 10) + '...',
          fileName
        });
        return { rootHash: hash, alreadyExists: true };
      }

      // Save file to disk
      const filePath = path.join(STORAGE_DIR, `${hash}.bin`);
      await fs.writeFile(filePath, buffer);

      // Update metadata
      const metadata: FileMetadata = {
        rootHash: hash,
        fileName,
        fileSize: buffer.length,
        mimeType,
        uploadTime: Date.now(),
        accessCount: 0
      };

      this.metadata.files[hash] = metadata;
      this.metadata.totalFiles++;
      this.metadata.totalSize += buffer.length;
      await this.saveMetadata();

      debugLog('File saved successfully', {
        rootHash: hash.substring(0, 10) + '...',
        fileName,
        fileSize: buffer.length
      });

      return { rootHash: hash, alreadyExists: false };
    } catch (error) {
      debugLog('Failed to save file', { error: String(error) });
      throw error;
    }
  }

  /**
   * Retrieve file from storage
   */
  async getFile(rootHash: string): Promise<Buffer | null> {
    try {
      // Check if file exists
      const metadata = this.metadata.files[rootHash];
      if (!metadata) {
        debugLog('File not found', { rootHash: rootHash.substring(0, 10) + '...' });
        return null;
      }

      // Read file from disk
      const filePath = path.join(STORAGE_DIR, `${rootHash}.bin`);
      const buffer = await fs.readFile(filePath);

      // Update access metadata
      metadata.accessCount++;
      metadata.lastAccessed = Date.now();
      await this.saveMetadata();

      debugLog('File retrieved successfully', {
        rootHash: rootHash.substring(0, 10) + '...',
        fileName: metadata.fileName,
        fileSize: metadata.fileSize,
        accessCount: metadata.accessCount
      });

      return buffer;
    } catch (error) {
      debugLog('Failed to retrieve file', {
        rootHash: rootHash.substring(0, 10) + '...',
        error: String(error)
      });
      return null;
    }
  }

  /**
   * Get file metadata
   */
  getFileMetadata(rootHash: string): FileMetadata | null {
    return this.metadata.files[rootHash] || null;
  }

  /**
   * List all files
   */
  async listFiles(): Promise<FileMetadata[]> {
    return Object.values(this.metadata.files);
  }

  /**
   * Delete file from storage
   */
  async deleteFile(rootHash: string): Promise<boolean> {
    try {
      const metadata = this.metadata.files[rootHash];
      if (!metadata) {
        return false;
      }

      // Delete file from disk
      const filePath = path.join(STORAGE_DIR, `${rootHash}.bin`);
      await fs.unlink(filePath);

      // Update metadata
      delete this.metadata.files[rootHash];
      this.metadata.totalFiles--;
      this.metadata.totalSize -= metadata.fileSize;
      await this.saveMetadata();

      debugLog('File deleted', {
        rootHash: rootHash.substring(0, 10) + '...',
        fileName: metadata.fileName
      });

      return true;
    } catch (error) {
      debugLog('Failed to delete file', { error: String(error) });
      return false;
    }
  }

  /**
   * Clear all files
   */
  async clearAll(): Promise<number> {
    try {
      const files = await fs.readdir(STORAGE_DIR);
      let cleared = 0;

      for (const file of files) {
        if (file.endsWith('.bin')) {
          await fs.unlink(path.join(STORAGE_DIR, file));
          cleared++;
        }
      }

      // Reset metadata
      this.metadata = {
        files: {},
        totalFiles: 0,
        totalSize: 0,
        lastUpdated: Date.now()
      };
      await this.saveMetadata();

      debugLog('Storage cleared', { filesDeleted: cleared });
      return cleared;
    } catch (error) {
      debugLog('Failed to clear storage', { error: String(error) });
      return 0;
    }
  }

  /**
   * Get storage statistics
   */
  getStats() {
    return {
      totalFiles: this.metadata.totalFiles,
      totalSize: this.metadata.totalSize,
      lastUpdated: this.metadata.lastUpdated,
      storageDirectory: STORAGE_DIR
    };
  }
}

// Export singleton instance
export const storageService = new StorageService();