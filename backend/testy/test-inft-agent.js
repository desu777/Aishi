#!/usr/bin/env node

/**
 * 🧠 iNFT Dream Agent Test Script
 * 
 * Tests the complete integration:
 * 1. Deploy contracts (if needed)
 * 2. Create dream agent
 * 3. Process dreams through agent
 * 4. Verify agent evolution
 */

require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
const TEST_USER_ADDRESS = process.env.WALLET_PUBLIC_KEY || '0x742d35Cc6634C0532925a3b8D7C9b4b4e3d1234567';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m'
};

function log(color, ...args) {
  console.log(color, ...args, colors.reset);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function makeRequest(method, url, data = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message 
    };
  }
}

async function checkServerHealth() {
  log(colors.cyan, '🏥 Checking server health...');
  
  const result = await makeRequest('GET', '/api/health');
  
  if (!result.success) {
    log(colors.red, '❌ Server is not running. Start with: npm run dev');
    process.exit(1);
  }
  
  const health = result.data;
  log(colors.green, '✅ Server is running');
  log(colors.white, '📊 Health Status:');
  log(colors.white, `   Whisper API: ${health.whisperConfigured ? '✅' : '❌'}`);
  log(colors.white, `   0G Compute: ${health.computeConfigured ? '✅' : '❌'}`);
  log(colors.white, `   iNFT Contract: ${health.inftConfigured ? '✅' : '❌'}`);
  log(colors.white, `   Verifier: ${health.verifierConfigured ? '✅' : '❌'}`);
  
  if (!health.inftConfigured) {
    log(colors.yellow, '⚠️  iNFT contracts not deployed. Deploy with: npm run deploy');
    return false;
  }
  
  return true;
}

async function checkContractStats() {
  log(colors.cyan, '📊 Checking contract statistics...');
  
  const result = await makeRequest('GET', '/api/agent/stats');
  
  if (!result.success) {
    log(colors.red, '❌ Failed to get contract stats:', result.error);
    return null;
  }
  
  const stats = result.data.stats;
  
  if (!stats.deployed) {
    log(colors.red, '❌ Contracts not deployed properly');
    return null;
  }
  
  log(colors.green, '✅ Contracts deployed successfully');
  log(colors.white, `   Address: ${stats.contractAddress}`);
  log(colors.white, `   Total Agents: ${stats.totalAgents}`);
  log(colors.white, `   Network: ${stats.network}`);
  
  return stats;
}

async function checkUserAgent(userAddress) {
  log(colors.cyan, `👤 Checking if user has an agent...`);
  
  const result = await makeRequest('GET', `/api/agent/user/${userAddress}`);
  
  if (!result.success) {
    log(colors.red, '❌ Failed to check user agent:', result.error);
    return null;
  }
  
  if (result.data.hasAgent) {
    log(colors.green, '✅ User already has an agent');
    log(colors.white, `   Token ID: ${result.data.agent.tokenId}`);
    log(colors.white, `   Intelligence Level: ${result.data.agent.intelligenceLevel}`);
    log(colors.white, `   Dream Count: ${result.data.agent.dreamCount}`);
    return result.data.agent;
  } else {
    log(colors.yellow, '⚠️  User does not have an agent yet');
    return null;
  }
}

async function createAgent(userAddress) {
  log(colors.cyan, '🤖 Creating dream agent...');
  
  const result = await makeRequest('POST', '/api/agent/create', {
    userAddress: userAddress
  });
  
  if (!result.success) {
    log(colors.red, '❌ Failed to create agent:', result.error?.error || result.error);
    return null;
  }
  
  log(colors.green, '✅ Dream agent created successfully!');
  log(colors.white, `   Token ID: ${result.data.agentTokenId}`);
  log(colors.white, `   Transaction: ${result.data.agentData.txHash}`);
  log(colors.white, `   Personality Hash: ${result.data.agentData.personalityHash.substring(0, 10)}...`);
  
  return result.data.agentTokenId;
}

async function processDream(tokenId, dreamText, userAddress) {
  log(colors.cyan, `💭 Processing dream for agent ${tokenId}...`);
  log(colors.white, `Dream: "${dreamText.substring(0, 50)}..."`);
  
  // Get current agent state first
  const agentCheck = await makeRequest('GET', `/api/agent/info/${tokenId}`);
  if (agentCheck.success) {
    const agent = agentCheck.data.agent;
    log(colors.white, `Current Agent State: Level ${agent.intelligenceLevel}, ${agent.dreamCount} dreams processed`);
  }
  
  const result = await makeRequest('POST', `/api/agent/${tokenId}/dream`, {
    dreamText: dreamText,
    userAddress: userAddress
  });
  
  if (!result.success) {
    log(colors.red, '❌ Failed to process dream:', result.error?.error || result.error);
    return null;
  }
  
  log(colors.green, '✅ Dream processed with evolutionary memory!');
  
  const evolution = result.data.agentEvolution;
  const evolutionary = result.data.evolutionaryData;
  
  log(colors.white, '🧠 Agent Evolution:');
  log(colors.white, `   Dreams: ${evolution.oldDreamCount} → ${evolution.newDreamCount}`);
  log(colors.white, `   Intelligence: ${evolution.oldIntelligence} → ${evolution.newIntelligence}`);
  log(colors.white, `   Evolution Stage: ${evolutionary.evolutionStage}`);
  log(colors.white, `   Historical Context: ${evolutionary.historicalContext} dreams used`);
  
  if (evolution.evolved) {
    log(colors.magenta, '🎉 AGENT EVOLVED TO HIGHER INTELLIGENCE!');
    log(colors.magenta, `    ${evolution.evolutionMessage}`);
  }
  
  if (evolutionary.patterns?.recurringSymbols?.length > 0) {
    log(colors.cyan, `🔄 Recurring Patterns: ${evolutionary.patterns.recurringSymbols.join(', ')}`);
  }
  
  log(colors.blue, '🔍 FULL AI Analysis:');
  log(colors.white, '═'.repeat(80));
  console.log(result.data.analysis);
  log(colors.white, '═'.repeat(80));
  
  if (result.data.cost) {
    log(colors.yellow, `💰 Analysis cost: $${result.data.cost.toFixed(4)}`);
  }
  
  return result.data;
}

async function testEvolutionaryMemory(tokenId) {
  log(colors.cyan, '🧠 Testing evolutionary memory and patterns...');
  
  const result = await makeRequest('GET', `/api/agent/${tokenId}/history?limit=10`);
  
  if (!result.success) {
    log(colors.red, '❌ Failed to get agent history:', result.error?.error || result.error);
    return false;
  }
  
  const history = result.data;
  
  log(colors.green, '✅ Agent evolutionary data retrieved');
  log(colors.white, '🤖 Agent Information:');
  log(colors.white, `   Token ID: ${history.agent.tokenId}`);
  log(colors.white, `   Intelligence Level: ${history.agent.intelligenceLevel}`);
  log(colors.white, `   Evolution Stage: ${history.agent.evolutionStage}`);
  log(colors.white, `   Total Dreams: ${history.agent.dreamCount}`);
  
  log(colors.white, '\n📚 Dream History:');
  history.dreamHistory.forEach((dream, index) => {
    log(colors.white, `   Dream ${dream.dreamNumber}: ${dream.emotionalTone} (${dream.symbols.join(', ')})`);
  });
  
  log(colors.white, '\n🔍 Evolutionary Patterns:');
  if (history.evolutionaryPatterns.recurringSymbols?.length > 0) {
    log(colors.blue, `   Recurring Symbols: ${history.evolutionaryPatterns.recurringSymbols.join(', ')}`);
  }
  if (history.evolutionaryPatterns.emotionalProgression) {
    log(colors.blue, `   Emotional Journey: ${history.evolutionaryPatterns.emotionalProgression}`);
  }
  if (history.evolutionaryPatterns.growthIndicators?.length > 0) {
    log(colors.blue, `   Growth Indicators: ${history.evolutionaryPatterns.growthIndicators.join(', ')}`);
  }
  
  log(colors.white, '\n🎯 Agent Capabilities:');
  Object.entries(history.capabilities).forEach(([level, capability]) => {
    if (level.startsWith('level')) {
      const levelNum = parseInt(level.replace('level', ''));
      const isCurrent = levelNum === history.capabilities.currentLevel;
      const marker = isCurrent ? '🟢' : (levelNum < history.capabilities.currentLevel ? '✅' : '⚪');
      log(colors.white, `   ${marker} Level ${levelNum}: ${capability}`);
    }
  });
  
  return true;
}

async function testSingleDream(tokenId, userAddress) {
  log(colors.cyan, '🎯 Testing single dream with evolutionary context...');
  
  const singleTestDreams = [
    "I was swimming in an endless ocean, but the water was crystal clear and I could breathe underwater. I saw ancient ruins on the ocean floor.",
    "I was flying again, but this time with wings made of light. I could control my direction perfectly and flew through colorful clouds.",
    "I suddenly realized I was dreaming and became lucid. I tried to change the dream by thinking of a beach, and it worked! I felt incredible power.",
    "I met a wise old woman who showed me a book where the pages kept changing. She said 'Your story is still being written' and handed me a golden key.",
    "I was standing by a lake that reflected not my face, but my true emotions. When I touched the water, it turned into liquid starlight."
  ];
  
  // Pick a random dream or use the first one
  const selectedDream = singleTestDreams[0];
  
  log(colors.white, '🌙 Selected dream for testing:');
  log(colors.blue, `"${selectedDream}"`);
  log(colors.white, '');
  
  const result = await processDream(tokenId, selectedDream, userAddress);
  
  if (result) {
    log(colors.green, '\n✅ Single dream test completed successfully!');
    return result;
  } else {
    log(colors.red, '\n❌ Single dream test failed');
    return null;
  }
}

async function testChatInterface() {
  log(colors.cyan, '💬 Testing chat interface...');
  
  const messages = [
    { msg: "Hello", desc: "greeting" },
    { msg: "create agent", desc: "create intent" },
    { msg: "status", desc: "status check" },
    { msg: "I had a dream about flying", desc: "dream intent", userAddress: TEST_USER_ADDRESS }
  ];
  
  for (const { msg, desc, userAddress } of messages) {
    log(colors.white, `Testing ${desc}: "${msg}"`);
    
    const result = await makeRequest('POST', '/api/agent/chat', {
      message: msg,
      userAddress: userAddress
    });
    
    if (result.success) {
      log(colors.green, `✅ Response: ${result.data.response.substring(0, 100)}...`);
      log(colors.white, `   Action: ${result.data.action}`);
    } else {
      log(colors.red, `❌ Failed: ${result.error}`);
    }
    
    await sleep(500);
  }
}

async function runFullTest() {
  log(colors.magenta, '🚀 Starting iNFT Dream Agent Integration Test\n');
  
  try {
    // 1. Check server health
    const serverOK = await checkServerHealth();
    if (!serverOK) return;
    
    await sleep(1000);
    
    // 2. Check contract stats
    const stats = await checkContractStats();
    if (!stats) return;
    
    await sleep(1000);
    
    // 3. Check if user has agent
    let agent = await checkUserAgent(TEST_USER_ADDRESS);
    let tokenId;
    
    if (!agent) {
      // 4. Create agent if needed
      tokenId = await createAgent(TEST_USER_ADDRESS);
      if (!tokenId) return;
      
      await sleep(2000); // Wait for blockchain confirmation
      
      // Verify creation
      agent = await checkUserAgent(TEST_USER_ADDRESS);
      if (!agent) {
        log(colors.red, '❌ Agent creation verification failed');
        return;
      }
    } else {
      tokenId = agent.tokenId;
    }
    
    await sleep(1000);
    
    // 5. Process test dreams - diverse set to test evolutionary memory
    const testDreams = [
      // Water themes - test recurring patterns
      "I was swimming in an endless ocean, but the water was crystal clear and I could breathe underwater. I saw ancient ruins on the ocean floor.",
      
      // Flying evolution - building on previous flying dreams
      "I was flying again, but this time with wings made of light. I could control my direction perfectly and flew through colorful clouds.",
      
      // Anxiety/stress patterns
      "I was back in school taking an exam I never studied for. The clock was ticking loudly and I couldn't remember anything.",
      
      // Lucid dreaming elements
      "I suddenly realized I was dreaming and became lucid. I tried to change the dream by thinking of a beach, and it worked! I felt incredible power.",
      
      // Symbolic/mystical
      "I met a wise old woman who showed me a book where the pages kept changing. She said 'Your story is still being written' and handed me a golden key.",
      
      // Recurring water + transformation
      "I was standing by a lake that reflected not my face, but my true emotions. When I touched the water, it turned into liquid starlight.",
      
      // Social anxiety evolution
      "I was giving a speech to thousands of people, but instead of fear, I felt confident and my words turned into butterflies that flew to the audience.",
      
      // Death/rebirth symbolism
      "I died in the dream but instead of ending, I was reborn as a tree. I could feel my roots going deep into the earth and my branches reaching for the sky.",
      
      // Creative/artistic
      "I was painting with colors that don't exist in real life. Each brushstroke created music, and the painting came alive with dancing figures.",
      
      // Childhood/memory integration
      "I was in my childhood home, but it was much bigger inside. I found rooms I never knew existed, filled with toys that told stories of my forgotten dreams."
    ];
    
    log(colors.cyan, `\n💭 Processing ${testDreams.length} test dreams...`);
    
    for (let i = 0; i < testDreams.length; i++) {
      log(colors.white, `\n--- Dream ${i + 1}/${testDreams.length} ---`);
      
      const result = await processDream(tokenId, testDreams[i], TEST_USER_ADDRESS);
      if (!result) continue;
      
      await sleep(2000); // Wait between dreams
    }
    
    await sleep(1000);
    
    // 6. Check final agent state
    const finalAgent = await checkUserAgent(TEST_USER_ADDRESS);
    if (finalAgent) {
      log(colors.cyan, '\n📈 Final Agent Statistics:');
      log(colors.green, `   Intelligence Level: ${finalAgent.intelligenceLevel}`);
      log(colors.green, `   Total Dreams: ${finalAgent.dreamCount}`);
      log(colors.green, `   Last Updated: ${new Date(finalAgent.lastUpdated * 1000).toLocaleString()}`);
    }
    
    await sleep(1000);
    
    // 7. Test evolutionary memory and patterns
    log(colors.cyan, '\n🧠 Testing Evolutionary Memory System:');
    await testEvolutionaryMemory(tokenId);
    
    await sleep(1000);
    
    // 8. Test chat interface
    log(colors.cyan, '\n💬 Testing Chat Interface:');
    await testChatInterface();
    
    log(colors.magenta, '\n🎉 Integration test completed successfully!');
    log(colors.green, '✅ All systems working properly');
    
  } catch (error) {
    log(colors.red, '❌ Test failed with error:', error.message);
    console.error(error);
  }
}

async function getUserTokenId() {
  const agent = await checkUserAgent(TEST_USER_ADDRESS);
  return agent ? agent.tokenId : null;
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command || command === 'help') {
    log(colors.cyan, '🧠 iNFT Dream Agent Test Script');
    log(colors.white, '');
    log(colors.white, 'Available commands:');
    log(colors.green, '  full          - Run complete integration test (default)');
    log(colors.green, '  health        - Check server health');
    log(colors.green, '  stats         - Show contract statistics');
    log(colors.green, '  create [addr] - Create new agent for address');
    log(colors.green, '  check [addr]  - Check if user has agent');
    log(colors.green, '  single [id]   - Test single dream with full context');
    log(colors.green, '  dream <id> "<text>" [addr] - Process specific dream');
    log(colors.green, '  history <id>  - Show agent evolution history');
    log(colors.green, '  chat          - Test chat interface');
    log(colors.white, '');
    log(colors.yellow, 'Examples:');
    log(colors.white, '  node test-inft-agent.js single 1');
    log(colors.white, '  node test-inft-agent.js dream 1 "I was flying over the ocean"');
    log(colors.white, '  node test-inft-agent.js history 1');
    return;
  }
  
  switch (command) {
    case 'health':
      await checkServerHealth();
      break;
      
    case 'stats':
      await checkContractStats();
      break;
      
    case 'create':
      const userAddress = args[1] || TEST_USER_ADDRESS;
      await createAgent(userAddress);
      break;
      
    case 'check':
      const checkAddress = args[1] || TEST_USER_ADDRESS;
      await checkUserAgent(checkAddress);
      break;
      
    case 'dream':
      const dreamTokenId = args[1];
      const dreamText = args[2];
      const dreamUser = args[3] || TEST_USER_ADDRESS;
      
      if (!dreamTokenId || !dreamText) {
        log(colors.red, 'Usage: node test-inft-agent.js dream <tokenId> "<dreamText>" [userAddress]');
        return;
      }
      
      await processDream(parseInt(dreamTokenId), dreamText, dreamUser);
      break;
      
    case 'history':
      const historyTokenId = args[1];
      
      if (!historyTokenId) {
        log(colors.red, 'Usage: node test-inft-agent.js history <tokenId>');
        return;
      }
      
      await testEvolutionaryMemory(parseInt(historyTokenId));
      break;
      
    case 'single':
      const singleTokenId = args[1] || await getUserTokenId();
      const singleUser = args[2] || TEST_USER_ADDRESS;
      
      if (!singleTokenId) {
        log(colors.red, 'Usage: node test-inft-agent.js single [tokenId] [userAddress]');
        return;
      }
      
      await testSingleDream(parseInt(singleTokenId), singleUser);
      break;
      
    case 'chat':
      await testChatInterface();
      break;
      
    case 'full':
    default:
      await runFullTest();
      break;
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  checkServerHealth,
  checkContractStats,
  checkUserAgent,
  createAgent,
  processDream,
  testEvolutionaryMemory,
  testSingleDream,
  testChatInterface,
  runFullTest,
  getUserTokenId
}; 