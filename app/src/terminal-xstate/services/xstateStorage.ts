/**
 * @fileoverview XState Storage Service for 0G Network Integration
 * @description Provides upload/download operations for blob storage using 0G Network infrastructure
 */

import { uploadFileComplete } from '../../lib/0g/uploader';
import { downloadByRootHashAPI } from '../../lib/0g/downloader';
import { getNetworkConfig, getDefaultNetworkType, NetworkType } from '../../lib/0g/network';
import { getProvider, getSigner } from '../../lib/0g/fees';
import { safeJsonStringifyPretty } from '../utils/jsonSerializer';

// Debug logging
const debugLog = (message: string, data?: any) => {
  if (process.env.NEXT_PUBLIC_XSTATE_TERMINAL === 'true' || process.env.NEXT_PUBLIC_DREAM_TEST === 'true') {
    console.log(`[xstateStorage] ${message}`, data || '');
  }
};

export interface UploadResult {
  success: boolean;
  rootHash?: string;
  txHash?: string;
  error?: string;
  alreadyExists?: boolean;
}

export interface DownloadResult {
  success: boolean;
  data?: ArrayBuffer;
  error?: string;
}

export interface StorageContext {
  networkType: NetworkType;
  walletAddress?: string;
}

/**
 * Storage service factory for XState machines
 */
export class XStateStorageService {
  private networkType: NetworkType;
  private networkConfig: ReturnType<typeof getNetworkConfig>;

  constructor(context?: StorageContext) {
    this.networkType = context?.networkType || getDefaultNetworkType();
    this.networkConfig = getNetworkConfig(this.networkType);
    
    debugLog('Storage service initialized', {
      networkType: this.networkType,
      storageRpc: this.networkConfig.storageRpc,
      l1Rpc: this.networkConfig.l1Rpc
    });
  }

  /**
   * Uploads a blob to 0G Storage
   */
  async uploadBlob(file: File): Promise<UploadResult> {
    try {
      debugLog('Starting blob upload', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      // Get provider and signer
      const [provider, providerErr] = await getProvider();
      if (!provider || providerErr) {
        throw new Error(`Provider error: ${providerErr?.message || 'No provider'}`);
      }

      const [signer, signerErr] = await getSigner(provider);
      if (!signer || signerErr) {
        throw new Error(`Signer error: ${signerErr?.message || 'No signer'}`);
      }

      // Upload using lib function
      const result = await uploadFileComplete(
        file,
        this.networkConfig.storageRpc,
        this.networkConfig.l1Rpc,
        signer
      );

      debugLog('Upload completed', {
        success: result.success,
        rootHash: result.rootHash,
        alreadyExists: result.alreadyExists
      });

      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      debugLog('Upload failed', { error: errorMsg });
      return {
        success: false,
        error: errorMsg
      };
    }
  }

  /**
   * Downloads a blob from 0G Storage by root hash
   */
  async downloadBlob(rootHash: string): Promise<DownloadResult> {
    try {
      debugLog('Starting blob download', { rootHash });

      if (!rootHash || !rootHash.trim()) {
        throw new Error('Root hash is required');
      }

      // Download using lib function
      const [fileData, downloadError] = await downloadByRootHashAPI(
        rootHash,
        this.networkConfig.storageRpc
      );

      if (downloadError || !fileData) {
        throw downloadError || new Error('Download failed - no data received');
      }

      debugLog('Download completed', {
        rootHash,
        dataSize: fileData.byteLength
      });

      return {
        success: true,
        data: fileData
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      debugLog('Download failed', { error: errorMsg });
      return {
        success: false,
        error: errorMsg
      };
    }
  }

  /**
   * Creates a File object from ArrayBuffer data
   */
  createFileFromBuffer(buffer: ArrayBuffer, fileName: string, mimeType = 'application/json'): File {
    const blob = new Blob([buffer], { type: mimeType });
    return new File([blob], fileName, { type: mimeType });
  }

  /**
   * Converts ArrayBuffer to JSON object
   */
  bufferToJson(buffer: ArrayBuffer): any {
    try {
      const decoder = new TextDecoder('utf-8');
      const text = decoder.decode(buffer);
      return JSON.parse(text);
    } catch (error) {
      debugLog('Failed to parse buffer as JSON', { error });
      throw new Error('Invalid JSON data in buffer');
    }
  }

  /**
   * Converts JSON object to File for upload
   */
  jsonToFile(data: any, fileName: string): File {
    const jsonString = safeJsonStringifyPretty(data);
    const blob = new Blob([jsonString], { type: 'application/json' });
    return new File([blob], fileName, { type: 'application/json' });
  }

  /**
   * Uploads JSON data as a file
   */
  async uploadJson(data: any, fileName: string): Promise<UploadResult> {
    const file = this.jsonToFile(data, fileName);
    return this.uploadBlob(file);
  }

  /**
   * Downloads and parses JSON data
   */
  async downloadJson(rootHash: string): Promise<{ success: boolean; data?: any; error?: string }> {
    const result = await this.downloadBlob(rootHash);
    
    if (!result.success || !result.data) {
      return { success: false, error: result.error };
    }

    try {
      const jsonData = this.bufferToJson(result.data);
      return { success: true, data: jsonData };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to parse JSON' 
      };
    }
  }

  /**
   * Gets current network configuration
   */
  getNetworkInfo() {
    return {
      networkType: this.networkType,
      networkName: this.networkConfig.name,
      storageRpc: this.networkConfig.storageRpc,
      l1Rpc: this.networkConfig.l1Rpc
    };
  }
}

/**
 * Factory function for creating storage service instances
 */
export function createStorageService(context?: StorageContext): XStateStorageService {
  return new XStateStorageService(context);
}

/**
 * XState service creator for use in machines with fromPromise
 */
export const storageServiceCreator = {
  uploadBlob: (file: File) => {
    const service = createStorageService();
    return service.uploadBlob(file);
  },
  
  downloadBlob: (rootHash: string) => {
    const service = createStorageService();
    return service.downloadBlob(rootHash);
  },
  
  uploadJson: (data: any, fileName: string) => {
    const service = createStorageService();
    return service.uploadJson(data, fileName);
  },
  
  downloadJson: (rootHash: string) => {
    const service = createStorageService();
    return service.downloadJson(rootHash);
  }
};