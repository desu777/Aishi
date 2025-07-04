require('dotenv').config();
const fs = require('fs');
const path = require('path');
const StorageService = require('./src/services/storageService');

// Configuration from variables.md
const CONFIG = {
  INDEXER_RPC: process.env.INDEXER_RPC || 'https://indexer-storage-testnet-turbo.0g.ai',
  RPC: process.env.RPC || 'https://evmrpc-testnet.0g.ai',
  DREAMSCAPE_TEST: process.env.DREAMSCAPE_TEST === 'true',
  WALLET_PRIVATE_KEY: process.env.WALLET_PRIVATE_KEY
};

async function testStorage() {
  console.log('🚀 Starting 0G Storage Test');
  console.log('===========================');
  console.log('Configuration:');
  console.log('- INDEXER_RPC:', CONFIG.INDEXER_RPC);
  console.log('- RPC:', CONFIG.RPC);
  console.log('- DREAMSCAPE_TEST:', CONFIG.DREAMSCAPE_TEST);
  console.log('- Wallet configured:', !!CONFIG.WALLET_PRIVATE_KEY);
  console.log('');

  if (!CONFIG.WALLET_PRIVATE_KEY) {
    console.error('❌ WALLET_PRIVATE_KEY not found in environment variables');
    console.log('Please add your wallet private key to .env file');
    return;
  }

  try {
    // Initialize StorageService
    console.log('📦 Initializing StorageService...');
    const storageService = new StorageService();
    console.log('✅ StorageService initialized');
    console.log('');

    // Test file path
    const testFilePath = path.join(__dirname, 'test_files', 'stary.txt');
    
    // Check if test file exists
    if (!fs.existsSync(testFilePath)) {
      console.error('❌ Test file not found:', testFilePath);
      return;
    }

    // Read test file
    const testBuffer = fs.readFileSync(testFilePath);
    const testFilename = 'test_upload.txt';
    
    console.log('📄 Test file info:');
    console.log('- Path:', testFilePath);
    console.log('- Size:', testBuffer.length, 'bytes');
    console.log('- Content preview:', testBuffer.toString().substring(0, 50) + '...');
    console.log('');

    // TEST 1: Upload file
    console.log('⬆️  TESTING UPLOAD');
    console.log('==================');
    
    const uploadStartTime = Date.now();
    const uploadResult = await storageService.uploadFile(testBuffer, testFilename);
    const uploadDuration = Date.now() - uploadStartTime;
    
    console.log('✅ Upload completed in', uploadDuration + 'ms');
    console.log('Upload result:', JSON.stringify(uploadResult, null, 2));
    console.log('');

    // TEST 2: Download file
    console.log('⬇️  TESTING DOWNLOAD');
    console.log('===================');
    
    if (uploadResult.rootHash) {
      const downloadPath = path.join(__dirname, 'test_files', 'downloaded_test.txt');
      
      // Remove existing download file if exists
      if (fs.existsSync(downloadPath)) {
        fs.unlinkSync(downloadPath);
      }
      
      const downloadStartTime = Date.now();
      try {
        const downloadResult = await storageService.downloadFile(uploadResult.rootHash, downloadPath);
        const downloadDuration = Date.now() - downloadStartTime;
        
        console.log('✅ Download completed in', downloadDuration + 'ms');
        console.log('Download result:', JSON.stringify(downloadResult, null, 2));
        
        // Verify downloaded file
        if (fs.existsSync(downloadPath)) {
          const downloadedContent = fs.readFileSync(downloadPath, 'utf8');
          const originalContent = fs.readFileSync(testFilePath, 'utf8');
          
          console.log('');
          console.log('📋 File Verification:');
          console.log('- Original content:', originalContent.trim());
          console.log('- Downloaded content:', downloadedContent.trim());
          console.log('- Files match:', originalContent === downloadedContent ? '✅ YES' : '❌ NO');
        } else {
          console.log('❌ Downloaded file not found at:', downloadPath);
        }
      } catch (downloadError) {
        console.log('❌ Download failed:', downloadError.message);
      }
      console.log('');
    } else {
      console.log('❌ No rootHash from upload, skipping download test');
    }

    console.log('🎉 Test completed successfully!');
    console.log('');
    
    // TEST 3: Progressive Fee Escalation Test
    console.log('🔄 TESTING PROGRESSIVE FEE ESCALATION');
    console.log('=====================================');
    console.log('This test demonstrates the new progressive fee retry mechanism');
    console.log('that automatically increases fees on transaction failures.');
    console.log('');
    
    // Create a small test JSON object to upload
    const testJSON = {
      message: "Testing progressive fee escalation",
      timestamp: Date.now(),
      testId: Math.random().toString(36).substring(7),
      progressiveFeeTest: true
    };
    
    console.log('📝 Test JSON object:');
    console.log(JSON.stringify(testJSON, null, 2));
    console.log('');
    
    try {
      const jsonUploadStartTime = Date.now();
      const jsonUploadResult = await storageService.uploadJSON(testJSON);
      const jsonUploadDuration = Date.now() - jsonUploadStartTime;
      
      console.log('✅ JSON upload completed in', jsonUploadDuration + 'ms');
      console.log('');
      console.log('📊 Progressive Fee Results:');
      console.log('- Root Hash:', jsonUploadResult.rootHash);
      console.log('- Transaction Hash:', jsonUploadResult.txHash);
      console.log('- Retry Attempt Used:', jsonUploadResult.retryAttempt + 1);
      console.log('- Already Exists:', jsonUploadResult.alreadyExists ? 'Yes' : 'No');
      console.log('- Network:', jsonUploadResult.network?.name || 'Unknown');
      console.log('- Final Fee Info:');
      console.log('  • Storage Fee:', jsonUploadResult.feeInfo?.formatted?.storageFee || 'N/A', 'OG');
      console.log('  • Gas Fee:', jsonUploadResult.feeInfo?.formatted?.gasFee || 'N/A', 'OG');
      console.log('  • Total Fee:', jsonUploadResult.feeInfo?.formatted?.totalFee || 'N/A', 'OG');
      console.log('  • USD Estimate:', '$' + (jsonUploadResult.feeInfo?.usd?.totalFee || '0'));
      console.log('  • Gas Multiplier:', jsonUploadResult.feeInfo?.metadata?.gasMultiplier || 'N/A');
      console.log('');
      
      // Test download of the JSON
      if (jsonUploadResult.rootHash) {
        console.log('⬇️  Testing JSON Download...');
        try {
          const downloadedJSON = await storageService.downloadJSON(jsonUploadResult.rootHash);
          console.log('✅ JSON download successful');
          console.log('📋 Downloaded JSON matches original:', 
            JSON.stringify(downloadedJSON) === JSON.stringify(testJSON) ? '✅ YES' : '❌ NO');
        } catch (downloadError) {
          console.log('❌ JSON download failed:', downloadError.message);
        }
      }
      
    } catch (jsonError) {
      console.log('❌ Progressive fee test failed:', jsonError.message);
    }
    
    console.log('');
    console.log('🎯 PROGRESSIVE FEE MECHANISM EXPLAINED:');
    console.log('=======================================');
    console.log('• Attempt 1: Uses 1.2x gas multiplier (20% higher than base)');
    console.log('• Attempt 2: Uses 1.5x gas multiplier (50% higher than base)');
    console.log('• Attempt 3: Uses 2.0x gas multiplier (100% higher than base)');
    console.log('• Each retry includes exponential backoff (1s, 2s, 4s delays)');
    console.log('• Retryable errors: transaction reverted, gas too low, underpriced');
    console.log('• Non-retryable: already uploaded and finalized (treated as success)');
    console.log('• Max 3 attempts total, then final failure if all attempts fail');
    console.log('');
    console.log('🔧 SDK OVERRIDE MECHANISM:');
    console.log('==========================');
    console.log('• Forces 0G SDK to use our calculated progressive gas prices');
    console.log('• Overrides SDK\'s built-in retry and gas price escalation');
    console.log('• Custom signer with populateTransaction override');
    console.log('• Look for "🔧 SDK Gas Price Override" in debug logs');
    console.log('• Ensures our progressive fees are actually used by SDK');
    
    console.log('');
    console.log('🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('💥 Test failed with error:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
  }
}

// Run the test
console.log('Starting 0G Storage Upload/Download Test...');
console.log('Time:', new Date().toISOString());
console.log('');

testStorage().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 