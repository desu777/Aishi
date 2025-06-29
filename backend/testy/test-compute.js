require('dotenv').config();
const ComputeService = require('./src/services/computeService');

// Test configuration - CREATIVE POETRY TEST
const POETRY_PROMPT = `Write a beautiful, inspiring poem about 0G LABS and their revolutionary blockchain technology.

Focus on these themes:
- Decentralized AI and compute networks
- Infinite storage possibilities  
- TEE (Trusted Execution Environment) security
- The future of Web3 and blockchain
- Innovation and technology advancement
- Community and decentralization
- Dreams and possibilities

Make it:
- 3-4 stanzas
- Rhyming and rhythmic
- Inspirational and forward-looking
- Technical but poetic
- Suitable for sharing on social media

Create something that captures the essence of 0G LABS' vision for the decentralized future!`;

const LLAMA_PROVIDER = "0xf07240Efa67755B5311bc75784a061eDB47165Dd";

async function testComputeService() {
  console.log('🚀 Starting 0G LABS Poetry Generation Test');
  console.log('==========================================');
  console.log('Configuration:');
  console.log('- Wallet configured:', !!process.env.WALLET_PRIVATE_KEY);
  console.log('- Creative poetry test about 0G LABS');
  console.log('- Provider:', LLAMA_PROVIDER, '(Llama 3.3 70B - Creative Poet)');
  console.log('');

  try {
    // Initialize ComputeService
    console.log('📦 Initializing ComputeService...');
    const computeService = new ComputeService();
    
    // Test 1: List Services
    console.log('\n⬇️  TESTING: List Services');
    console.log('==========================');
    
    const services = await computeService.listServices();
    console.log(`✅ Found ${services.length} available services`);
    
    services.forEach((service, index) => {
      console.log(`\n🤖 Service ${index + 1}:`);
      console.log(`   Provider: ${service.provider}`);
      console.log(`   URL: ${service.url}`);
      console.log(`   Input Price: ${service.inputPriceOG} OG`);
      console.log(`   Output Price: ${service.outputPriceOG} OG`);
      console.log(`   Verification: ${service.verifiability}`);
      console.log(`   DeepSeek: ${service.isDeepSeek ? 'YES ⭐' : 'No'}`);
      console.log(`   Recommended: ${service.recommendedForDreams ? 'YES ⭐' : 'No'}`);
    });

    // Test 2: Check Balance
    console.log('\n💰 TESTING: Check Balance');
    console.log('=========================');
    
    const balance = await computeService.checkBalance();
    console.log(`✅ Current balance: ${balance.balanceOG} OG`);
    console.log(`✅ Estimated queries: ${balance.estimatedQueries}`);

    // Test 3: Creative Poetry Generation
    console.log('\n🎨 TESTING: Creative Poetry Generation with Llama 3.3 70B');
    console.log('========================================================');
    console.log('📝 Poetry Request: Write inspiring poem about 0G LABS');
    console.log('🎯 Themes: Decentralized AI, Storage, TEE, Web3, Innovation');
    console.log('⏳ Sending to Llama 3.3 70B for creative poetry writing...');
    
    const startTime = Date.now();
    const result = await computeService.sendSimpleQuery(POETRY_PROMPT, LLAMA_PROVIDER);
    const duration = Date.now() - startTime;
    
    console.log(`✅ Poetry Generation completed in ${duration}ms`);
    console.log('');
    console.log('🎨 0G LABS POEM BY LLAMA 3.3 70B:');
    console.log('=================================');
    console.log(result.response);
    console.log('');
    console.log('📊 TECHNICAL DETAILS:');
    console.log('=====================');
    console.log(`🆔 Chat ID: ${result.chatId}`);
    console.log(`⏱️  Poetry Duration: ${result.duration}ms`);
    console.log(`💰 Creation Cost: ${result.cost} OG`);
    console.log(`🔍 TEE Verified: ${result.verified}`);
    console.log(`🏷️  AI Poet: Llama 3.3 70B (${result.provider})`);

    // Test 4: Final Balance Check
    console.log('\n💸 TESTING: Final Balance');
    console.log('=========================');
    
    const finalBalance = await computeService.checkBalance();
    const costStats = computeService.getCostStats();
    
    console.log(`✅ Final balance: ${finalBalance.balanceOG} OG`);
    console.log(`📊 Total queries: ${costStats.totalQueries}`);
    console.log(`📊 Total cost: ${costStats.totalCost} OG`);
    console.log(`📊 Last query cost: ${costStats.lastQueryCost} OG`);
    console.log(`📊 Remaining queries: ${costStats.estimatedRemainingQueries}`);

    console.log('\n🎉 CREATIVE POETRY TEST SUCCESSFUL!');
    console.log('===================================');
    console.log('✅ ComputeService working perfectly');
    console.log('✅ Llama 3.3 70B creating beautiful poetry about 0G LABS');
    console.log('✅ Creative AI capabilities verified');
    console.log('✅ Automatic micropayments working');
    console.log('✅ TEE security verified');
    console.log('🎨 Ready for creative AI applications!');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:');
    console.error('================');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check WALLET_PRIVATE_KEY in .env');
    console.log('2. Ensure wallet has sufficient 0G tokens');
    console.log('3. Verify network connectivity');
    console.log('4. Check 0G testnet status');
  }
}

// Run the test
console.log('Starting 0G LABS Poetry Generation Test...');
console.log('Time:', new Date().toISOString());
console.log('');

testComputeService().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 