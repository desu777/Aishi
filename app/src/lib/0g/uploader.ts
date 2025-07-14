import { Indexer, Blob, ZgFile } from '@0glabs/0g-ts-sdk';
import { ethers, Contract } from 'ethers';

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
 * @param signer The signer
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
 * Upload file with complete workflow like 0gdrive-main (create blob + upload)
 * @param file The file to upload
 * @param storageRpc Storage RPC URL
 * @param l1Rpc L1 RPC URL  
 * @param signer The signer
 * @returns Upload result with root hash and transaction info
 */
export async function uploadFileComplete(
  file: File,
  storageRpc: string,
  l1Rpc: string,
  signer: any
): Promise<{
  success: boolean;
  rootHash?: string;
  txHash?: string;
  error?: string;
  alreadyExists?: boolean;
}> {
  try {
    console.log('[uploadFileComplete] Starting upload process...');
    console.log('[uploadFileComplete] File:', file.name, 'Size:', file.size);

    // 1. Create 0G SDK Blob from file
    const [blob, blobErr] = await createBlobFromFile(file);
    if (!blob || blobErr) {
      return { success: false, error: `Failed to create blob: ${blobErr?.message}` };
    }
    console.log('[uploadFileComplete] 0G SDK Blob created successfully');

    // 2. Generate unique tag for upload (like 0gdrive-main)
    const timestamp = Date.now();
    const randomValue = Math.floor(Math.random() * 1000000);
    const combinedValue = timestamp + randomValue;
    const hexString = combinedValue.toString(16);
    const paddedHex = hexString.length % 2 === 0 ? hexString : '0' + hexString;
    const uniqueTag = '0x' + paddedHex;
    console.log('[uploadFileComplete] Generated unique tag:', uniqueTag);

    // 3. Upload to storage with options like 0gdrive-main
    const [uploadResult, uploadErr] = await uploadToStorage(blob, storageRpc, l1Rpc, signer, uniqueTag);
    if (!uploadResult || uploadErr) {
      return { success: false, error: `Upload failed: ${uploadErr?.message}` };
    }

    // 4. Get root hash from blob's merkle tree (like 0gdrive-main)
    let rootHash: string;
    try {
      const [merkleTree, merkleError] = await blob.merkleTree();
      if (merkleError || !merkleTree) {
        throw new Error('Failed to get merkle tree');
      }
      const hash = merkleTree.rootHash();
      if (!hash) {
        throw new Error('Root hash is null');
      }
      rootHash = hash;
      console.log('[uploadFileComplete] Got root hash from blob:', rootHash);
    } catch (rootHashError) {
      return { success: false, error: `Failed to get root hash: ${rootHashError.message}` };
    }

    return {
      success: true,
      rootHash,
      txHash: uploadResult.txHash || 'upload-success',
      alreadyExists: uploadResult.alreadyExists || false
    };
  } catch (error) {
    console.error('[uploadFileComplete] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
} 