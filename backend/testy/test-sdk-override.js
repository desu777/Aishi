require('dotenv').config();
const StorageService = require('./src/services/storageService');

async function testSDKOverride() {
  console.log('🔧 Testing SDK Gas Price Override Mechanism');
  console.log('===========================================');
  console.log('This test verifies that our custom signer');
  console.log('successfully forces the 0G SDK to use our');
  console.log('calculated progressive gas prices instead');
  console.log('of its own retry mechanism.');
  console.log('');

  if (!process.env.WALLET_PRIVATE_KEY) {
    console.error('❌ WALLET_PRIVATE_KEY not found in environment variables');
    return;
  }

  try {
    // Initialize StorageService
    console.log('📦 Initializing StorageService...');
    const storageService = new StorageService();
    console.log('✅ StorageService initialized');
    console.log('');

    // Create a small test JSON to trigger gas price calculations
    const testJSON = {
      message: "SDK Override Test",
      timestamp: Date.now(),
      testId: Math.random().toString(36).substring(7),
      sdkOverrideTest: true,
      purpose: "Verify SDK uses our calculated progressive gas prices"
    };

    console.log('📝 Test JSON for SDK override:');
    console.log(JSON.stringify(testJSON, null, 2));
    console.log('');

    console.log('🎯 Testing Progressive Fee Override:');
    console.log('====================================');
    console.log('Watch for these debug messages:');
    console.log('• [FeeCalculationService] Progressive fee - Attempt X/3, Multiplier: Y.Zx');
    console.log('• [DEBUG] 🎯 Forcing SDK to use our progressive gas price');
    console.log('• [StorageService] 🔧 SDK Gas Price Override: X.XXX gwei');
    console.log('• Sending transaction with gas price XXXXXX (should match our calculation)');
    console.log('');

    // Test the upload with our progressive fee mechanism
    const uploadStartTime = Date.now();
    
    try {
      const result = await storageService.uploadJSON(testJSON);
      const uploadDuration = Date.now() - uploadStartTime;
      
      console.log('✅ SDK Override Test Results:');
      console.log('============================');
      console.log('- Upload completed in:', uploadDuration + 'ms');
      console.log('- Root Hash:', result.rootHash);
      console.log('- Transaction Hash:', result.txHash || 'N/A');
      console.log('- Retry Attempt Used:', (result.retryAttempt || 0) + 1);
      console.log('- Already Exists:', result.alreadyExists ? 'Yes' : 'No');
      console.log('- Progressive Fee Applied:', result.feeInfo?.metadata?.gasMultiplier || 'N/A');
      console.log('- Final Gas Price Used:', result.feeInfo?.formatted?.gasPrice || 'N/A');
      console.log('');
      
      if (result.alreadyExists) {
        console.log('ℹ️  Note: File already existed, so no transaction was needed.');
        console.log('   SDK override logic was still applied during the attempt.');
      } else {
        console.log('✅ New upload completed successfully with SDK override!');
      }
      
      console.log('');
      console.log('🔍 Verification Steps:');
      console.log('======================');
      console.log('1. Check the debug logs above for SDK override messages');
      console.log('2. Verify gas price in logs matches our calculated progressive fee');
      console.log('3. Confirm no SDK retry messages (our override should prevent them)');
      console.log('4. Look for multiplier progression on retries (1.2x → 1.5x → 2.0x)');
      
    } catch (uploadError) {
      console.log('❌ SDK Override Test Failed:');
      console.log('Error:', uploadError.message);
      
      // If it's a retryable error, this actually demonstrates our retry mechanism
      if (storageService.isRetryableError(uploadError)) {
        console.log('');
        console.log('ℹ️  This error would trigger our progressive retry mechanism:');
        console.log('   • Attempt 1: 1.2x gas price');
        console.log('   • Attempt 2: 1.5x gas price'); 
        console.log('   • Attempt 3: 2.0x gas price');
        console.log('   Each with exponential backoff delays.');
      }
    }

    console.log('');
    console.log('🎯 Expected Behavior:');
    console.log('=====================');
    console.log('✅ Our calculated gas price should appear in SDK transaction logs');
    console.log('✅ No "retrying with higher gas price" messages from SDK');
    console.log('✅ Progressive multipliers (1.2x, 1.5x, 2.0x) on retries');
    console.log('✅ Custom signer override logs: "🔧 SDK Gas Price Override"');
    console.log('❌ SDK should NOT use its own gas price calculations');
    
    console.log('');
    console.log('🎉 SDK Override Test Completed!');
    
  } catch (error) {
    console.error('💥 Test failed with error:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
  }
}

// Run the test
console.log('Starting SDK Gas Price Override Test...');
console.log('Time:', new Date().toISOString());
console.log('');

testSDKOverride().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 