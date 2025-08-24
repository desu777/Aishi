/**
 * @fileoverview 0G Storage download functionality using viem adapter
 * @description Handles file downloads from 0G Network storage using @0glabs/0g-ts-sdk
 * with ethers compatibility through viemAdapter
 */

import { Indexer } from '@0glabs/0g-ts-sdk';

/**
 * Downloads a file from 0G storage by root hash using direct API call
 * This is the preferred method for browser environments
 * 
 * @param rootHash The root hash of the file to download
 * @param storageRpc The storage RPC URL to connect to
 * @returns A promise that resolves to the file data (ArrayBuffer) and any error
 */
export async function downloadByRootHashAPI(
  rootHash: string, 
  storageRpc: string
): Promise<[ArrayBuffer | null, Error | null]> {
  try {
    console.log(`API Download by root hash: ${rootHash} from ${storageRpc}`);
    
    if (!rootHash) {
      console.log('Root hash is empty or invalid');
      return [null, new Error('Root hash is required')];
    }
    
    // Construct API URL
    const apiUrl = `${storageRpc}/file?root=${rootHash}`;
    console.log(`Downloading from API URL: ${apiUrl}`);
    
    // Fetch the file
    const response = await fetch(apiUrl);
    
    // Check if the response content type is JSON before proceeding
    const contentType = response.headers.get('content-type');
    const isJsonResponse = contentType && contentType.includes('application/json');
    
    // Handle JSON responses separately
    if (isJsonResponse) {
      const jsonData = await response.json();
      console.log('API returned JSON response:', jsonData);
      
      // If it's an error response
      if (!response.ok || jsonData.code) {
        console.log('API returned JSON error:', jsonData);
        
        // Handle specific error codes
        if (jsonData.code === 101) {
          // Format root hash to be more display-friendly by keeping first and last few characters
          const truncatedHash = rootHash.length > 20
            ? `${rootHash.substring(0, 10)}...${rootHash.substring(rootHash.length - 10)}`
            : rootHash;
            
          return [null, new Error(`File not found: The file with root hash "${truncatedHash}" does not exist in storage or may be on a different network mode`)];
        }
        
        // For other JSON errors, use the message from the response
        return [null, new Error(`Download failed: ${jsonData.message || 'Unknown error'}`)];
      }
    }
    
    // Handle non-JSON responses
    if (!response.ok) {
      // For non-JSON errors, use the text response
      const errorText = await response.text();
      console.log(`API error (${response.status}): ${errorText}`);
      return [null, new Error(`Download failed with status ${response.status}: ${errorText}`)];
    }
    
    // Get file data as ArrayBuffer
    const fileData = await response.arrayBuffer();
    
    if (!fileData || fileData.byteLength === 0) {
      console.log('Downloaded file data is empty');
      return [null, new Error('Downloaded file is empty')];
    }
    
    console.log(`API Download successful, received ${fileData.byteLength} bytes`);
    return [fileData, null];
  } catch (error) {
    console.log('Error in downloadByRootHashAPI:', error);
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}

/**
 * Downloads a file from 0G storage by root hash using SDK
 * @param rootHash The root hash of the file to download
 * @param storageRpc The storage RPC URL to connect to
 * @param filePath Optional file path. If not provided, rootHash will be used as the path
 * @returns A promise that resolves to the file data (ArrayBuffer) and any error
 */
export async function downloadByRootHash(
  rootHash: string, 
  storageRpc: string,
  filePath?: string
): Promise<[ArrayBuffer | null, Error | null]> {
  try {
    console.log(`Downloading by root hash: ${rootHash} from ${storageRpc} with path: ${filePath || 'using rootHash as path'}`);
    
    if (!rootHash) {
      console.log('Root hash is empty or invalid');
      return [null, new Error('Root hash is required')];
    }
    
    const indexer = new Indexer(storageRpc);
    console.log(`Indexer:`, indexer);
    
    // Use the provided file path, or fall back to using the root hash as the path
    const path = filePath || rootHash;
    let fileData;
    
    try {
      // The second parameter is the file path, not a user address
      // The third parameter is skipVerify (we'll set it to false for now)
      console.log(`Downloading file from ${storageRpc} with path: ${path}`);
      console.log(`Downloading file from ${storageRpc} with rootHash: ${rootHash}`);
      fileData = await indexer.download(rootHash, path, false);
    } catch (downloadError) {
      console.log('Error from indexer.download:', downloadError);
      return [null, new Error(`Download failed: ${downloadError instanceof Error ? downloadError.message : String(downloadError)}`)];
    }
    
    // Log the result of indexer.download
    console.log(`indexer.download result type:`, fileData ? typeof fileData : 'null');
    
    if (!fileData) {
      console.log('fileData is null or undefined');
      return [null, new Error('File data is null or undefined')];
    }
    
    if (!(fileData instanceof ArrayBuffer)) {
      console.log('fileData is not an ArrayBuffer:', typeof fileData);
      return [null, new Error(`Invalid file data type: ${typeof fileData}`)];
    }
    
    console.log(`Returning fileData of length ${fileData.byteLength}`);
    return [fileData, null];
  } catch (error) {
    console.log('Error in downloadByRootHash:', error);
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}

/**
 * Creates a downloadable file from raw file data
 * @param fileData The file data as ArrayBuffer
 * @param fileName The file name
 */
export function downloadBlobAsFile(fileData: ArrayBuffer, fileName: string): void {
  try {
    // Additional validation to prevent "Cannot read properties of null (reading 'length')" error
    if (!fileData) {
      console.log('downloadBlobAsFile: fileData is null or undefined');
      throw new Error('File data is null or undefined');
    }
    
    if (!(fileData instanceof ArrayBuffer)) {
      console.log('downloadBlobAsFile: fileData is not an ArrayBuffer:', typeof fileData);
      throw new Error(`Invalid file data type: ${typeof fileData}`);
    }
    
    // Check if the ArrayBuffer has data
    if (fileData.byteLength === 0) {
      console.log('downloadBlobAsFile: fileData is empty (zero length)');
      throw new Error('File data is empty');
    }
    
    // Create a text decoder to check if the file looks like JSON
    const decoder = new TextDecoder('utf-8');
    const firstChars = decoder.decode(fileData.slice(0, Math.min(100, fileData.byteLength)));
    
    // Simple check to detect if this might be a JSON error response
    if (firstChars.trim().startsWith('{') && 
        (firstChars.includes('"code"') || firstChars.includes('"message"'))) {
      console.log('downloadBlobAsFile: Data appears to be a JSON error response:', firstChars);
      throw new Error('Received an error response instead of a file');
    }
    
    // Create a blob from the array buffer
    const byteArray = new Uint8Array(fileData);
    const blob = new Blob([byteArray]);
    const url = URL.createObjectURL(blob);
    
    // Create a link element and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || `download-${Date.now()}.bin`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log(`File download triggered: ${fileName}`);
  } catch (error) {
    console.error('Error in downloadBlobAsFile:', error);
    throw error;
  }
}

/**
 * Lists files available in storage (if supported by the storage endpoint)
 * @param storageRpc The storage RPC URL
 * @returns A promise that resolves to the list of files and any error
 */
export async function listStorageFiles(storageRpc: string): Promise<[any[] | null, Error | null]> {
  try {
    // This is a placeholder implementation
    // The actual implementation would depend on the 0G Storage API endpoints
    console.log(`Listing files from ${storageRpc}`);
    
    // For now, return empty list as not all storage nodes support listing
    return [[], null];
  } catch (error) {
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
} 