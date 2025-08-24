/**
 * @fileoverview 0G Storage upload functionality using viem adapter
 * @description Handles file uploads to 0G Network storage using @0glabs/0g-ts-sdk
 * with ethers compatibility through viemAdapter
 */

import { Indexer, Blob, ZgFile } from '@0glabs/0g-ts-sdk';
import { Contract } from 'ethers';
import { getEthersSignerForZeroG, getEthersProviderForZeroG } from './adapter/viemAdapter';

/**
 * Submits a transaction to the flow contract
 * @param flowContract The flow contract
 * @param submission The submission object
 * @param value The value to send with the transaction
 * @returns A promise that resolves to the transaction result and any error
 */
export async function submitTransaction(
  flowContract: Contract, 
  submission: any, 
  value: bigint
): Promise<[any | null, Error | null]> {
  try {
    const tx = await flowContract.submit(submission, { value });
    const receipt = await tx.wait();
    return [{ tx, receipt }, null];
  } catch (error) {
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}

/**
 * Uploads a file to 0G storage (like 0gdrive-main implementation)
 * @param blob The blob to upload
 * @param storageRpc The storage RPC URL
 * @param l1Rpc The L1 RPC URL
 * @param signer The signer (now using adapter)
 * @param uniqueTag Optional unique tag for upload
 * @returns A promise that resolves to upload result and any error
 */
export async function uploadToStorage(
  blob: Blob, 
  storageRpc: string, 
  l1Rpc: string, 
  signer: any,
  uniqueTag?: string
): Promise<[{ success: boolean; txHash?: string; alreadyExists: boolean } | null, Error | null]> {
  try {
    console.log('[uploadToStorage] Starting upload to 0G storage...');
    console.log('[uploadToStorage] Storage RPC:', storageRpc);
    console.log('[uploadToStorage] Unique tag:', uniqueTag);
    
    const indexer = new Indexer(storageRpc);
    
    const uploadOptions = {
      taskSize: 10,
      expectedReplica: 1,
      finalityRequired: true,
      tags: uniqueTag || '0x',
      skipTx: true, // Skip transaction like 0gdrive-main
      fee: BigInt(0)
    };
    
    console.log('[uploadToStorage] Upload options:', uploadOptions);
    
    const uploadResult = await indexer.upload(blob, l1Rpc, signer, uploadOptions);
    console.log('[uploadToStorage] Upload result:', uploadResult);
    
    // Handle different result formats (like 0gdrive-main)
    if (Array.isArray(uploadResult) && uploadResult.length === 2) {
      const [result, error] = uploadResult;
      
      if (error) {
        // Check if it's "Data already exists" error
        if (error.message && error.message.includes('Data already exists')) {
          console.log('[uploadToStorage] Data already exists - successful upload');
          return [{ 
            success: true, 
            alreadyExists: true 
          }, null];
        } else {
          return [null, error];
        }
      } else if (result) {
        return [{ 
          success: true, 
          txHash: result,
          alreadyExists: false 
        }, null];
      }
    }
    
    // Default success case
    return [{ 
      success: true, 
      alreadyExists: false 
    }, null];
  } catch (error) {
    console.error('[uploadToStorage] Upload error:', error);
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}

/**
 * Creates a 0G SDK blob from file data
 * @param file The file to convert
 * @returns A promise that resolves to the 0G SDK blob and any error
 */
export async function createBlobFromFile(file: File): Promise<[Blob | null, Error | null]> {
  try {
    // Create 0G SDK Blob directly from File object
    // This is the correct way - 0G SDK Blob constructor takes File directly
    const blob = new Blob(file);
    return [blob, null];
  } catch (error) {
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}

/**
 * Creates a ZgFile from file path (for Node.js environments)
 * @param filePath Path to the file
 * @returns A promise that resolves to the ZgFile and any error
 */
export async function createZgFileFromPath(filePath: string): Promise<[ZgFile | null, Error | null]> {
  try {
    const zgFile = await ZgFile.fromFilePath(filePath);
    return [zgFile, null];
  } catch (error) {
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}

// Note: generateMerkleTree function removed - 0G SDK Blob has built-in merkleTree() method

/**
 * Complete upload flow for a file with viem adapter integration
 * @param file The file to upload
 * @param l1Rpc The L1 RPC URL  
 * @param storageRpc The storage RPC URL
 * @param signer Optional ethers signer (deprecated, will be ignored)
 * @returns Upload result with root hash and transaction info
 */
export async function uploadFileComplete(
  file: File,
  storageRpc: string,
  l1Rpc: string,
  signer?: any // Deprecated parameter for backward compatibility
): Promise<{
  success: boolean;
  rootHash?: string;
  txHash?: string;
  error?: string;
  alreadyExists?: boolean;
}> {
  try {
    console.log('[uploadFileComplete] Starting complete upload flow');
    console.log('[uploadFileComplete] File:', file.name, 'Size:', file.size);

    // 1. Create 0G SDK Blob from file
    const [blob, blobErr] = await createBlobFromFile(file);
    if (!blob || blobErr) {
      return { success: false, error: `Failed to create blob: ${blobErr?.message}` };
    }
    console.log('[uploadFileComplete] 0G SDK Blob created successfully');

    // 2. Generate unique tag for upload (like 0gdrive-main)
    const [merkleTree, merkleErr] = await blob.merkleTree();
    if (!merkleTree || merkleErr) {
      return { success: false, error: `Failed to create merkle tree: ${merkleErr?.message}` };
    }
    const rootHashHex = merkleTree.rootHash();
    if (!rootHashHex) {
      return { success: false, error: 'Failed to get root hash from merkle tree' };
    }
    const uniqueTag = rootHashHex; // Already includes 0x prefix
    console.log('[uploadFileComplete] Root hash generated:', uniqueTag);

    // 3. Get signer using adapter (ignore deprecated parameter)
    console.log('[uploadFileComplete] Getting signer via adapter...');
    if (signer) {
      console.log('[uploadFileComplete] Warning: signer parameter is deprecated and will be ignored');
    }
    const adapterSigner = await getEthersSignerForZeroG();
    console.log('[uploadFileComplete] Signer obtained');

    // 4. Upload to 0G storage
    const [uploadResult, uploadErr] = await uploadToStorage(
      blob, 
      storageRpc, 
      l1Rpc, 
      adapterSigner,
      uniqueTag
    );
    
    if (!uploadResult || uploadErr) {
      return { 
        success: false, 
        error: `Upload failed: ${uploadErr?.message}` 
      };
    }

    // 5. Return success with root hash
    return {
      success: true,
      rootHash: uniqueTag,
      txHash: uploadResult.txHash,
      alreadyExists: uploadResult.alreadyExists
    };
    
  } catch (error) {
    console.error('[uploadFileComplete] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}