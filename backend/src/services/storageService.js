const { ZgFile, Indexer, Blob } = require('@0glabs/0g-ts-sdk');
const { ethers } = require('ethers');
const FeeCalculationService = require('./feeCalculationService');

class StorageService {
  constructor() {
    // Initialize Fee Calculation Service for dynamic pricing
    this.feeService = new FeeCalculationService();
    
    // Get current network configuration
    const currentNetwork = process.env.STORAGE_NETWORK || 'turbo';
    const networkConfig = this.feeService.networkConfigs[currentNetwork];
    
    // Initialize Indexer with network-specific endpoint
    this.indexer = new Indexer(networkConfig.storageRpc);
    this.rpcUrl = process.env.RPC || "https://evmrpc-testnet.0g.ai/";
    
    // Initialize wallet from environment
    const provider = new ethers.JsonRpcProvider(this.rpcUrl);
    this.signer = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY, provider);
    
    console.log(`[StorageService] Initialized with ${currentNetwork} network (${networkConfig.storageRpc})`);
  }

  /**
   * Check if error is retryable (can be solved with higher fees)
   * @param {Error} error - Error to check
   * @returns {boolean} - Whether error is retryable
   */
  isRetryableError(error) {
    if (!error) return false;
    
    const errorMessage = error.message?.toLowerCase() || '';
    const errorData = error.data?.toLowerCase() || '';
    
    // Common retryable errors
    const retryablePatterns = [
      'transaction execution reverted',
      'failed to submit transaction',
      'insufficient funds for gas',
      'replacement transaction underpriced',
      'transaction underpriced',
      'nonce too low',
      'already known',
      'gas price too low',
      'insufficient priority fee',
      'fee too low'
    ];
    
    // Check if error matches retryable patterns
    const isRetryable = retryablePatterns.some(pattern => 
      errorMessage.includes(pattern) || errorData.includes(pattern)
    );
    
    // Don't retry if already uploaded and finalized
    if (errorMessage.includes('already uploaded and finalized') || 
        errorData.includes('already uploaded and finalized')) {
      return false;
    }
    
    return isRetryable;
  }

  async uploadFile(buffer, filename) {
    return await this.uploadFileWithRetry(buffer, filename, 0);
  }

  async uploadFileWithRetry(buffer, filename, retryAttempt = 0) {
    const DEBUG = process.env.DREAMSCAPE_TEST === 'true';
    const fs = require('fs');
    const path = require('path');
    const MAX_RETRIES = 3;
    let file = null;
    let tempPath;
    
    try {
      
      if (DEBUG) console.log(`[DEBUG] Starting upload for ${filename} (attempt ${retryAttempt + 1}/${MAX_RETRIES}), buffer size: ${buffer.length}`);
      
      // Write buffer to temporary file first
      tempPath = path.join(__dirname, '../../temp', `${Date.now()}-${filename}`);
      const tempDir = path.dirname(tempPath);
      
      if (DEBUG) console.log(`[DEBUG] Temp file path: ${tempPath}`);
      
      // Ensure temp directory exists
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
        if (DEBUG) console.log(`[DEBUG] Created temp directory: ${tempDir}`);
      }
      
      fs.writeFileSync(tempPath, buffer);
      if (DEBUG) console.log(`[DEBUG] Written buffer to temp file, size: ${fs.statSync(tempPath).size}`);
      
      // Create ZgFile from file path
      if (DEBUG) console.log(`[DEBUG] Creating ZgFile from path...`);
      file = await ZgFile.fromFilePath(tempPath);
      if (DEBUG) console.log(`[DEBUG] ZgFile created successfully`);
      
      // Generate Merkle tree for verification
      if (DEBUG) console.log(`[DEBUG] Generating Merkle tree...`);
      const [tree, treeErr] = await file.merkleTree();
      if (treeErr !== null) {
        if (DEBUG) console.log(`[DEBUG] Merkle tree error:`, treeErr);
        throw new Error(`Merkle tree error: ${treeErr}`);
      }
      
      const rootHash = tree?.rootHash();
      if (DEBUG) console.log(`[DEBUG] Merkle tree generated. Root hash:`, rootHash);
      if (DEBUG) console.log(`[DEBUG] RPC URL:`, this.rpcUrl);
      if (DEBUG) console.log(`[DEBUG] Signer address:`, this.signer.address);
      
      console.log(`Uploading ${filename}, Root Hash:`, rootHash);
      
      // Upload to 0G Storage with progressive fee calculation
      if (DEBUG) console.log(`[DEBUG] Starting upload to 0G Storage with progressive fee calculation (attempt ${retryAttempt + 1})...`);
      
      // Get optimized upload options with calculated fees including retry attempt
      const optimizationResult = await this.feeService.getOptimizedUploadOptions(buffer.length, {
        waitForFinality: process.env.STORAGE_WAIT_FINALITY !== 'false', // Default true for reliability
        urgency: 'normal',
        retryAttempt: retryAttempt
      });
      
      const { uploadOptions, feeInfo, recommendation, network } = optimizationResult;
      
      if (DEBUG) {
        console.log(`[DEBUG] Progressive fee calculation completed:`);
        console.log(`  Network: ${network.name} (${network.description})`);
        console.log(`  Storage fee: ${feeInfo.formatted.storageFee} OG (~$${feeInfo.usd.storageFee})`);
        console.log(`  Gas fee: ${feeInfo.formatted.gasFee} OG (~$${feeInfo.usd.gasFee})`);
        console.log(`  Total fee: ${feeInfo.formatted.totalFee} OG (~$${feeInfo.usd.totalFee})`);
        console.log(`  Recommendation: ${recommendation.network} (${recommendation.reason})`);
        console.log(`  Upload options:`, uploadOptions);
      }
      
      // Log cost summary for monitoring
      console.log(`Uploading ${filename} (${buffer.length} bytes) - Estimated cost: ${feeInfo.formatted.totalFee} OG (~$${feeInfo.usd.totalFee}) [Attempt ${retryAttempt + 1}/${MAX_RETRIES}]`);
      
      // Create custom signer with our calculated gas price to override SDK
      const calculatedGasPrice = BigInt(feeInfo.raw.gasPrice);
      const customSigner = this.createCustomSignerWithFee(calculatedGasPrice);
      
      if (DEBUG) {
        console.log(`[DEBUG] 🎯 Forcing SDK to use our progressive gas price:`);
        console.log(`  Calculated: ${ethers.formatUnits(calculatedGasPrice, 'gwei')} gwei`);
        console.log(`  Multiplier: ${feeInfo.metadata?.gasMultiplier || 'N/A'}x`);
        console.log(`  Attempt: ${retryAttempt + 1}/${MAX_RETRIES}`);
      }
      
      const [tx, uploadErr] = await this.indexer.upload(file, this.rpcUrl, customSigner, uploadOptions);
      if (uploadErr !== null) {
        if (DEBUG) console.log(`[DEBUG] Upload error details:`, uploadErr);
        
        // Check if it's "already uploaded and finalized" - treat as success like 0gdrive
        if (uploadErr.message && uploadErr.message.includes('Invalid params: root') && 
            uploadErr.data && uploadErr.data.includes('already uploaded and finalized')) {
          if (DEBUG) console.log(`[DEBUG] File already exists in storage - treating as successful upload`);
          console.log(`File already exists in storage but upload process completed successfully`);
          
          return { 
            rootHash, 
            txHash: tx || 'already-exists', 
            filename,
            alreadyExists: true,
            feeInfo: feeInfo,
            network: network,
            retryAttempt: retryAttempt
          };
        }
        
        // Check if this is a transaction revert and we can retry
        if (this.isRetryableError(uploadErr) && retryAttempt < MAX_RETRIES - 1) {
          console.log(`[StorageService] Upload failed on attempt ${retryAttempt + 1}/${MAX_RETRIES}, retrying with higher fees...`);
          
          // Clean up current attempt
          if (file) {
            await file.close();
            file = null;
          }
          if (fs.existsSync(tempPath)) {
            fs.unlinkSync(tempPath);
          }
          
          // Wait before retry (exponential backoff)
          const retryDelay = Math.pow(2, retryAttempt) * 1000; // 1s, 2s, 4s
          if (DEBUG) console.log(`[DEBUG] Waiting ${retryDelay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          
          // Recursive retry with higher fees
          return await this.uploadFileWithRetry(buffer, filename, retryAttempt + 1);
        }
        
        throw new Error(`Upload error: ${uploadErr}`);
      }
      
      console.log(`Upload successful! TX: ${tx} [Attempt ${retryAttempt + 1}/${MAX_RETRIES}]`);
      
      // Clean up temp file
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
      
      return { 
        rootHash, 
        txHash: tx, 
        filename,
        feeInfo: feeInfo,
        network: network,
        alreadyExists: false,
        retryAttempt: retryAttempt
      };
      
    } catch (error) {
      // If this is our final attempt or non-retryable error, throw it
      if (retryAttempt >= MAX_RETRIES - 1 || !this.isRetryableError(error)) {
        throw error;
      }
      
      // Otherwise, retry with higher fees
      console.log(`[StorageService] Upload failed on attempt ${retryAttempt + 1}/${MAX_RETRIES}, retrying with higher fees...`);
      
      // Clean up current attempt
      if (file) {
        await file.close();
        file = null;
      }
      if (typeof tempPath !== 'undefined' && fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
      
      // Wait before retry (exponential backoff)
      const retryDelay = Math.pow(2, retryAttempt) * 1000; // 1s, 2s, 4s
      if (DEBUG) console.log(`[DEBUG] Waiting ${retryDelay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      
      // Recursive retry with higher fees
      return await this.uploadFileWithRetry(buffer, filename, retryAttempt + 1);
      
    } finally {
      // Always close file after operations
      if (file) {
        await file.close();
      }
      
      // Clean up temp file if exists
      if (typeof tempPath !== 'undefined' && fs.existsSync(tempPath)) {
        try {
          fs.unlinkSync(tempPath);
        } catch (cleanupError) {
          console.warn('Failed to cleanup temp file:', cleanupError);
        }
      }
    }
  }

  async downloadFile(rootHash, outputPath) {
    try {
      // Download with proof verification enabled
      const err = await this.indexer.download(rootHash, outputPath, true);
      if (err !== null) {
        throw new Error(`Download error: ${err}`);
      }
      
      console.log(`Download successful to: ${outputPath}`);
      return { success: true, outputPath };
      
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  }

  async uploadJSON(jsonObject) {
    return await this.uploadJSONWithRetry(jsonObject, 0);
  }

  async uploadJSONWithRetry(jsonObject, retryAttempt = 0) {
    const DEBUG = process.env.DREAMSCAPE_TEST === 'true';
    const fs = require('fs');
    const path = require('path');
    const MAX_RETRIES = 3;
    let file = null;
    let tempPath;
    
    try {
      if (DEBUG) console.log(`[DEBUG] Starting JSON upload (attempt ${retryAttempt + 1}/${MAX_RETRIES})...`);
      
      // Stringify JSON and convert to buffer
      const jsonString = JSON.stringify(jsonObject);
      const buffer = Buffer.from(jsonString, 'utf-8');
      
      if (DEBUG) console.log(`[DEBUG] JSON buffer size: ${buffer.length} bytes`);
      
      // Write buffer to temporary file (same approach as uploadFile)
      tempPath = path.join(__dirname, '../../temp', `metadata_${Date.now()}.json`);
      const tempDir = path.dirname(tempPath);
      
      // Ensure temp directory exists
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      fs.writeFileSync(tempPath, buffer);
      if (DEBUG) console.log(`[DEBUG] JSON written to temp file: ${tempPath}`);
      
      // Create ZgFile from file path
      file = await ZgFile.fromFilePath(tempPath);
      if (DEBUG) console.log(`[DEBUG] ZgFile created from JSON temp file`);
      
      // Generate Merkle tree
      const [tree, treeErr] = await file.merkleTree();
      if (treeErr !== null) {
        throw new Error(`JSON Merkle tree error: ${treeErr}`);
      }
      
      const rootHash = tree?.rootHash();
      console.log('Uploading JSON metadata, Root Hash:', rootHash);
      
      // Get optimized upload options for JSON metadata with retry attempt
      const optimizationResult = await this.feeService.getOptimizedUploadOptions(buffer.length, {
        waitForFinality: process.env.STORAGE_WAIT_FINALITY !== 'false',
        urgency: 'normal',
        retryAttempt: retryAttempt
      });
      
      const { uploadOptions, feeInfo, network } = optimizationResult;
      
      if (DEBUG) {
        console.log(`[DEBUG] Progressive JSON fee calculation:`);
        console.log(`  Storage fee: ${feeInfo.formatted.storageFee} OG (~$${feeInfo.usd.storageFee})`);
        console.log(`  Total fee: ${feeInfo.formatted.totalFee} OG (~$${feeInfo.usd.totalFee})`);
      }
      
      // Create custom signer with our calculated gas price to override SDK
      const calculatedGasPrice = BigInt(feeInfo.raw.gasPrice);
      const customSigner = this.createCustomSignerWithFee(calculatedGasPrice);
      
      if (DEBUG) {
        console.log(`[DEBUG] 🎯 Forcing SDK to use our progressive gas price for JSON:`);
        console.log(`  Calculated: ${ethers.formatUnits(calculatedGasPrice, 'gwei')} gwei`);
        console.log(`  Multiplier: ${feeInfo.metadata?.gasMultiplier || 'N/A'}x`);
        console.log(`  Attempt: ${retryAttempt + 1}/${MAX_RETRIES}`);
      }
      
      // Upload to 0G Storage with forced gas price
      const [tx, uploadErr] = await this.indexer.upload(file, this.rpcUrl, customSigner, uploadOptions);
      if (uploadErr !== null) {
        if (DEBUG) console.log(`[DEBUG] JSON upload error:`, uploadErr);
        
        // Check if it's "already uploaded and finalized" - treat as success
        if (uploadErr.message && uploadErr.message.includes('Invalid params: root') && 
            uploadErr.data && uploadErr.data.includes('already uploaded and finalized')) {
          if (DEBUG) console.log(`[DEBUG] JSON already exists in storage - treating as successful upload`);
          console.log(`JSON metadata already exists in storage but upload process completed successfully`);
          
          return { 
            rootHash, 
            txHash: tx || 'already-exists-json', 
            size: buffer.length,
            alreadyExists: true,
            feeInfo: feeInfo,
            network: network,
            retryAttempt: retryAttempt
          };
        }
        
        // Check if this is a transaction revert and we can retry
        if (this.isRetryableError(uploadErr) && retryAttempt < MAX_RETRIES - 1) {
          console.log(`[StorageService] JSON upload failed on attempt ${retryAttempt + 1}/${MAX_RETRIES}, retrying with higher fees...`);
          
          // Clean up current attempt
          if (file) {
            await file.close();
            file = null;
          }
          if (fs.existsSync(tempPath)) {
            fs.unlinkSync(tempPath);
          }
          
          // Wait before retry (exponential backoff)
          const retryDelay = Math.pow(2, retryAttempt) * 1000; // 1s, 2s, 4s
          if (DEBUG) console.log(`[DEBUG] Waiting ${retryDelay}ms before JSON retry...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          
          // Recursive retry with higher fees
          return await this.uploadJSONWithRetry(jsonObject, retryAttempt + 1);
        }
        
        throw new Error(`JSON upload error: ${uploadErr}`);
      }
      
      console.log(`JSON upload successful! TX: ${tx} [Attempt ${retryAttempt + 1}/${MAX_RETRIES}]`);
      
      // Clean up temp file
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
      
      return { 
        rootHash, 
        txHash: tx, 
        size: buffer.length,
        feeInfo: feeInfo,
        network: network,
        alreadyExists: false,
        retryAttempt: retryAttempt
      };
      
    } catch (error) {
      // If this is our final attempt or non-retryable error, throw it
      if (retryAttempt >= MAX_RETRIES - 1 || !this.isRetryableError(error)) {
        throw error;
      }
      
      // Otherwise, retry with higher fees
      console.log(`[StorageService] JSON upload failed on attempt ${retryAttempt + 1}/${MAX_RETRIES}, retrying with higher fees...`);
      
      // Clean up current attempt
      if (file) {
        await file.close();
        file = null;
      }
      if (typeof tempPath !== 'undefined' && fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
      
      // Wait before retry (exponential backoff)
      const retryDelay = Math.pow(2, retryAttempt) * 1000; // 1s, 2s, 4s
      if (DEBUG) console.log(`[DEBUG] Waiting ${retryDelay}ms before JSON retry...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      
      // Recursive retry with higher fees
      return await this.uploadJSONWithRetry(jsonObject, retryAttempt + 1);
      
    } finally {
      // Always close file after operations
      if (file) {
        await file.close();
      }
      
      // Clean up temp file if exists
      if (typeof tempPath !== 'undefined' && fs.existsSync(tempPath)) {
        try {
          fs.unlinkSync(tempPath);
        } catch (cleanupError) {
          console.warn('Failed to cleanup JSON temp file:', cleanupError);
        }
      }
    }
  }

  async downloadJSON(rootHash) {
    try {
      // Create temporary file path for download
      const tempPath = `/tmp/json_${Date.now()}.json`;
      
      // Download file
      const err = await this.indexer.download(rootHash, tempPath, true);
      if (err !== null) {
        throw new Error(`JSON download error: ${err}`);
      }
      
      // Read and parse JSON
      const fs = require('fs');
      const jsonString = fs.readFileSync(tempPath, 'utf-8');
      const jsonObject = JSON.parse(jsonString);
      
      // Clean up temporary file
      fs.unlinkSync(tempPath);
      
      console.log('JSON download and parse successful');
      return jsonObject;
      
    } catch (error) {
      console.error('JSON download failed:', error);
      throw error;
    }
  }

  /**
   * Create custom signer with forced gas price for SDK override
   * @param {BigInt} gasPrice - Forced gas price in wei
   * @returns {ethers.Wallet} - Custom signer with overridden gas price
   */
  createCustomSignerWithFee(gasPrice) {
    const customSigner = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY, this.signer.provider);
    
    // Override the populateTransaction method to force our gas price
    const originalPopulateTransaction = customSigner.populateTransaction.bind(customSigner);
    customSigner.populateTransaction = async (transaction) => {
      const populated = await originalPopulateTransaction(transaction);
      
      // Force our calculated gas price
      populated.gasPrice = gasPrice;
      
      // Log the override for debugging
      const DEBUG = process.env.DREAMSCAPE_TEST === 'true';
      if (DEBUG) {
        console.log(`[StorageService] 🔧 SDK Gas Price Override: ${ethers.formatUnits(gasPrice, 'gwei')} gwei`);
      }
      
      return populated;
    };
    
    return customSigner;
  }
}

module.exports = StorageService; 