#!/usr/bin/env node

/**
 * 💰 Fee System Comparison Test
 * 
 * Compares:
 * 1. Old system: fee: BigInt(0), skipTx: true, finalityRequired: false  
 * 2. New system: Dynamic fee calculation based on 0gdrive approach
 */

require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Test scenarios with different file sizes
const TEST_SCENARIOS = [
  { name: 'Small Text (Dream)', size: 500, description: 'Short dream text ~500 chars' },
  { name: 'Medium Text (Dream)', size: 2000, description: 'Detailed dream ~2KB' },
  { name: 'Large Text (Dream)', size: 8000, description: 'Very detailed dream ~8KB' },
  { name: 'Audio Transcript', size: 15000, description: 'Whisper transcript ~15KB' },
  { name: 'Metadata JSON', size: 1024, description: 'Dream metadata ~1KB' }
];

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(color, ...args) {
  console.log(color, ...args, colors.reset);
}

async function makeRequest(method, url, data = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (data) config.data = data;
    
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
  
  log(colors.green, '✅ Server is running');
  return true;
}

async function testFeeEstimation(scenario) {
  log(colors.blue, `\n📊 Testing: ${scenario.name} (${scenario.size} bytes)`);
  
  const result = await makeRequest('GET', `/api/storage/fee-estimate/${scenario.size}`);
  
  if (!result.success) {
    log(colors.red, `❌ Fee estimation failed: ${result.error}`);
    return null;
  }
  
  const { feeInfo, recommendation } = result.data;
  
  // Display fee breakdown
  log(colors.white, `📈 Fee Breakdown:`);
  log(colors.white, `   Storage Fee: ${feeInfo.formatted.storageFee} OG (~$${feeInfo.usd.storageFee})`);
  log(colors.white, `   Gas Fee: ${feeInfo.formatted.gasFee} OG (~$${feeInfo.usd.gasFee})`);
  log(colors.bold + colors.yellow, `   Total Fee: ${feeInfo.formatted.totalFee} OG (~$${feeInfo.usd.totalFee})`);
  
  // Display recommendation
  log(colors.green, `💡 Recommendation: ${recommendation.network} network (${recommendation.reason})`);
  
  // Display old vs new comparison
  log(colors.cyan, `📋 Old vs New System:`);
  log(colors.white, `   Old System: fee: BigInt(0) = $0.000000 (free but unreliable)`);
  log(colors.white, `   New System: fee: ${feeInfo.formatted.storageFee} OG = $${feeInfo.usd.totalFee} (reliable + transparent)`);
  
  return feeInfo;
}

async function testNetworkComparison(scenario) {
  log(colors.magenta, `\n🌐 Network Comparison: ${scenario.name}`);
  
  const result = await makeRequest('GET', `/api/storage/network-compare/${scenario.size}`);
  
  if (!result.success) {
    log(colors.red, `❌ Network comparison failed: ${result.error}`);
    return null;
  }
  
  const { comparison, recommendation } = result.data;
  
  if (comparison.standard?.error || comparison.turbo?.error) {
    log(colors.yellow, '⚠️  Some networks failed fee calculation (contract issues)');
    return null;
  }
  
  // Display comparison
  log(colors.white, `📊 Standard Network:`);
  log(colors.white, `   Total: ${comparison.standard.formatted.totalFee} OG (~$${comparison.standard.usd.totalFee})`);
  log(colors.white, `   ${comparison.standard.networkConfig.description}`);
  
  log(colors.white, `📊 Turbo Network:`);
  log(colors.white, `   Total: ${comparison.turbo.formatted.totalFee} OG (~$${comparison.turbo.usd.totalFee})`);
  log(colors.white, `   ${comparison.turbo.networkConfig.description}`);
  
  if (comparison.standard.savings) {
    log(colors.green, `💰 Savings Analysis:`);
    log(colors.white, `   Standard: ${comparison.standard.savings.vs_turbo}`);
    log(colors.white, `   Turbo: ${comparison.turbo.savings.vs_standard}`);
  }
  
  log(colors.cyan, `🎯 Best Choice: ${recommendation.network} network (${recommendation.reason})`);
  
  return comparison;
}

async function testStorageConfig() {
  log(colors.cyan, '\n⚙️  Current Storage Configuration:');
  
  const result = await makeRequest('GET', '/api/storage/config');
  
  if (!result.success) {
    log(colors.red, `❌ Config retrieval failed: ${result.error}`);
    return;
  }
  
  const { config } = result.data;
  
  log(colors.white, `🌐 Current Network: ${config.currentNetwork}`);
  log(colors.white, `⏱️  Wait for Finality: ${config.settings.waitForFinality}`);
  log(colors.white, `⛽ Gas Multiplier: ${config.settings.gasMultiplier}`);
  log(colors.white, `💲 0G Price (USD): $${config.settings.ogPriceUSD}`);
  
  log(colors.white, `📡 Available Networks:`);
  Object.entries(config.networks).forEach(([name, net]) => {
    log(colors.white, `   ${name}: ${net.description}`);
    log(colors.white, `      RPC: ${net.storageRpc}`);
  });
}

async function calculateMonthlyCosts() {
  log(colors.bold + colors.magenta, '\n💰 Monthly Cost Analysis for Dreamscape');
  
  // Estimate monthly usage scenarios
  const monthlyScenarios = [
    { users: 100, dreamsPerUser: 10, avgSize: 2000, description: 'Small user base' },
    { users: 1000, dreamsPerUser: 15, avgSize: 2500, description: 'Growing user base' },
    { users: 10000, dreamsPerUser: 20, avgSize: 3000, description: 'Popular app' }
  ];
  
  for (const scenario of monthlyScenarios) {
    const totalDreams = scenario.users * scenario.dreamsPerUser;
    const totalBytes = totalDreams * scenario.avgSize;
    
    log(colors.cyan, `\n📈 Scenario: ${scenario.description}`);
    log(colors.white, `   Users: ${scenario.users}`);
    log(colors.white, `   Dreams per user/month: ${scenario.dreamsPerUser}`);
    log(colors.white, `   Total dreams/month: ${totalDreams}`);
    log(colors.white, `   Total data: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
    
    // Get fee estimation for total monthly data
    const result = await makeRequest('GET', `/api/storage/fee-estimate/${totalBytes}`);
    
    if (result.success) {
      const { feeInfo } = result.data;
      
      log(colors.yellow, `💸 Monthly Costs:`);
      log(colors.white, `   Old System: $0.00 (free but unreliable)`);
      log(colors.white, `   New System: ${feeInfo.formatted.totalFee} OG (~$${feeInfo.usd.totalFee})`);
      
      // Cost per user
      const costPerUser = parseFloat(feeInfo.usd.totalFee) / scenario.users;
      log(colors.white, `   Cost per user: $${costPerUser.toFixed(6)}/month`);
      
      // Cost per dream
      const costPerDream = parseFloat(feeInfo.usd.totalFee) / totalDreams;
      log(colors.white, `   Cost per dream: $${costPerDream.toFixed(6)}`);
    }
  }
}

async function demonstrateUpgradeValue() {
  log(colors.bold + colors.green, '\n🚀 Value of Fee System Upgrade:');
  
  log(colors.white, '\n❌ OLD SYSTEM Problems:');
  log(colors.red, '   • fee: BigInt(0) - No payment to network');
  log(colors.red, '   • skipTx: true - Bypasses transaction security');
  log(colors.red, '   • finalityRequired: false - Risk of data loss');
  log(colors.red, '   • No cost transparency for users');
  log(colors.red, '   • No network optimization options');
  log(colors.red, '   • Production deployment issues');
  
  log(colors.white, '\n✅ NEW SYSTEM Benefits:');
  log(colors.green, '   • Real-time market-based fee calculation');
  log(colors.green, '   • Proper gas estimation with fallbacks');
  log(colors.green, '   • Network selection (Standard vs Turbo)');
  log(colors.green, '   • Cost transparency with USD estimates');
  log(colors.green, '   • Production-ready reliability');
  log(colors.green, '   • User-friendly cost breakdowns');
  log(colors.green, '   • Automatic network recommendations');
  
  log(colors.white, '\n🎯 Migration Impact:');
  log(colors.cyan, '   • MVP → Production quality');
  log(colors.cyan, '   • Unreliable → Reliable uploads');
  log(colors.cyan, '   • Hidden costs → Transparent pricing');
  log(colors.cyan, '   • One network → Flexible network choice');
  log(colors.cyan, '   • No user feedback → Rich cost information');
}

async function runFullComparison() {
  console.clear();
  log(colors.bold + colors.magenta, '💰 DREAMSCAPE FEE SYSTEM COMPARISON');
  log(colors.bold + colors.magenta, '====================================');
  
  try {
    // 1. Health check
    await checkServerHealth();
    
    // 2. Storage configuration
    await testStorageConfig();
    
    // 3. Test fee estimation for each scenario
    log(colors.bold + colors.cyan, '\n📊 FEE ESTIMATION TESTS');
    for (const scenario of TEST_SCENARIOS) {
      await testFeeEstimation(scenario);
    }
    
    // 4. Network comparison tests
    log(colors.bold + colors.cyan, '\n🌐 NETWORK COMPARISON TESTS');
    for (const scenario of TEST_SCENARIOS.slice(0, 3)) { // Test first 3 scenarios
      await testNetworkComparison(scenario);
    }
    
    // 5. Monthly cost analysis
    await calculateMonthlyCosts();
    
    // 6. Upgrade value demonstration
    await demonstrateUpgradeValue();
    
    log(colors.bold + colors.green, '\n✅ Fee System Comparison Complete!');
    log(colors.white, '\nRecommendation: Deploy new fee system for production-ready reliability and cost transparency.');
    
  } catch (error) {
    log(colors.red, '\n❌ Comparison failed:', error.message);
  }
}

// Run the comparison
if (require.main === module) {
  runFullComparison();
}

module.exports = { runFullComparison }; 