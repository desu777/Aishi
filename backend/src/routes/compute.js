const express = require('express');
const ComputeService = require('../services/computeService');

const router = express.Router();

// Initialize compute service
const computeService = new ComputeService();

/**
 * GET /api/compute/test-connection
 * Test basic connection to 0G Compute Network
 */
router.get('/test-connection', async (req, res) => {
  console.log('=== Compute Test Connection Endpoint Called ===');
  
  try {
    const connectionTest = await computeService.testConnection();
    
    console.log('✅ Connection test successful');
    
    res.status(200).json({
      success: true,
      message: 'Connection to 0G Compute Network successful',
      ...connectionTest
    });
    
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    
    res.status(500).json({
      success: false,
      error: 'Connection test failed',
      details: error.message
    });
  }
});

/**
 * GET /api/compute/services
 * List available AI services
 */
router.get('/services', async (req, res) => {
  console.log('=== List Compute Services Endpoint Called ===');
  
  try {
    const services = await computeService.listServices();
    
    console.log(`✅ Found ${services.length} available services`);
    
    // Convert BigInt values to strings for JSON serialization
    const serializedServices = services.map(service => ({
      ...service,
      inputPrice: service.inputPrice?.toString(),
      outputPrice: service.outputPrice?.toString(),
      // Keep the formatted versions
      inputPriceOG: service.inputPriceOG,
      outputPriceOG: service.outputPriceOG
    }));
    
    res.status(200).json({
      success: true,
      count: services.length,
      services: serializedServices
    });
    
  } catch (error) {
    console.error('❌ Failed to list services:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to list services',
      details: error.message
    });
  }
});

/**
 * GET /api/compute/balance
 * Check ledger balance and cost stats
 */
router.get('/balance', async (req, res) => {
  console.log('=== Check Compute Balance Endpoint Called ===');
  
  try {
    const balance = await computeService.checkBalance();
    const costStats = computeService.getCostStats();
    
    console.log(`✅ Current balance: ${balance.balanceOG} OG`);
    
    // Serialize BigInt values
    const serializedBalance = {
      ...balance,
      ledgerInfo: balance.ledgerInfo ? {
        ...balance.ledgerInfo,
        ledgerInfo: balance.ledgerInfo.ledgerInfo?.map(item => 
          typeof item === 'bigint' ? item.toString() : item
        )
      } : null
    };
    
    res.status(200).json({
      success: true,
      balance: serializedBalance,
      costStats: costStats
    });
    
  } catch (error) {
    console.error('❌ Failed to check balance:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to check balance',
      details: error.message
    });
  }
});

/**
 * POST /api/compute/simple-test
 * Send simple test query to AI
 */
router.post('/simple-test', async (req, res) => {
  console.log('=== Simple Compute Test Endpoint Called ===');
  
  try {
    const { text, provider } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text parameter is required'
      });
    }
    
    console.log(`📝 Test query: "${text.substring(0, 100)}..."`);
    
    const result = await computeService.sendSimpleQuery(text, provider);
    
    console.log('✅ Simple query test successful');
    
    res.status(200).json({
      success: true,
      query: text,
      result: result,
      costStats: computeService.getCostStats()
    });
    
  } catch (error) {
    console.error('❌ Simple query test failed:', error);
    
    res.status(500).json({
      success: false,
      error: 'Simple query test failed',
      details: error.message
    });
  }
});

module.exports = router; 