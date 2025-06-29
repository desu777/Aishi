const express = require('express');
const FeeCalculationService = require('../services/feeCalculationService');

const router = express.Router();

/**
 * GET /api/storage/fee-estimate/:size
 * Calculate storage fees for given data size
 */
router.get('/fee-estimate/:size', async (req, res) => {
  try {
    const dataSize = parseInt(req.params.size);
    
    if (isNaN(dataSize) || dataSize <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid data size. Provide size in bytes as positive integer.'
      });
    }
    
    const feeService = new FeeCalculationService();
    
    // Calculate fees
    const feeInfo = await feeService.calculateUploadFees(dataSize, {
      urgency: req.query.urgency || 'normal'
    });
    
    // Get network recommendation
    const recommendation = feeService.getNetworkRecommendation(dataSize, req.query.urgency);
    
    res.json({
      success: true,
      dataSize,
      feeInfo,
      recommendation,
      networks: feeService.networkConfigs
    });
    
  } catch (error) {
    console.error('[Storage] Fee estimation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Fee estimation failed',
      details: error.message
    });
  }
});

/**
 * GET /api/storage/network-compare/:size
 * Compare costs between standard and turbo networks
 */
router.get('/network-compare/:size', async (req, res) => {
  try {
    const dataSize = parseInt(req.params.size);
    
    if (isNaN(dataSize) || dataSize <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid data size'
      });
    }
    
    const feeService = new FeeCalculationService();
    const comparison = {};
    
    // Calculate for both networks
    for (const networkType of ['standard', 'turbo']) {
      feeService.switchNetwork(networkType);
      
      try {
        const feeInfo = await feeService.calculateUploadFees(dataSize);
        comparison[networkType] = {
          ...feeInfo,
          savings: null // Will calculate after both are done
        };
      } catch (error) {
        comparison[networkType] = {
          error: error.message,
          fallback: true
        };
      }
    }
    
    // Calculate savings
    if (comparison.standard && comparison.turbo && !comparison.standard.error && !comparison.turbo.error) {
      const standardCost = parseFloat(comparison.standard.formatted.totalFee);
      const turboCost = parseFloat(comparison.turbo.formatted.totalFee);
      
      comparison.standard.savings = {
        vs_turbo: `${((turboCost - standardCost) / standardCost * 100).toFixed(2)}% cheaper`,
        absolute: `${(turboCost - standardCost).toFixed(6)} OG saved`
      };
      
      comparison.turbo.savings = {
        vs_standard: `${((standardCost - turboCost) / turboCost * 100).toFixed(2)}% more expensive`,
        absolute: `${(turboCost - standardCost).toFixed(6)} OG extra cost`
      };
    }
    
    res.json({
      success: true,
      dataSize,
      comparison,
      recommendation: feeService.getNetworkRecommendation(dataSize)
    });
    
  } catch (error) {
    console.error('[Storage] Network comparison failed:', error);
    res.status(500).json({
      success: false,
      error: 'Network comparison failed',
      details: error.message
    });
  }
});

/**
 * POST /api/storage/switch-network
 * Switch storage network for future uploads
 */
router.post('/switch-network', async (req, res) => {
  try {
    const { network } = req.body;
    
    if (!network || !['standard', 'turbo'].includes(network)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid network. Use "standard" or "turbo".'
      });
    }
    
    // Update environment variable (for current session)
    process.env.STORAGE_NETWORK = network;
    
    const feeService = new FeeCalculationService();
    const config = feeService.networkConfigs[network];
    
    res.json({
      success: true,
      message: `Switched to ${network} network`,
      network: {
        type: network,
        ...config
      },
      note: 'Network switch applies to new uploads. Restart server to persist.'
    });
    
  } catch (error) {
    console.error('[Storage] Network switch failed:', error);
    res.status(500).json({
      success: false,
      error: 'Network switch failed',
      details: error.message
    });
  }
});

/**
 * GET /api/storage/config
 * Get current storage configuration and network info
 */
router.get('/config', async (req, res) => {
  try {
    const feeService = new FeeCalculationService();
    
    res.json({
      success: true,
      config: {
        currentNetwork: feeService.currentNetwork,
        networks: feeService.networkConfigs,
        settings: {
          waitForFinality: process.env.STORAGE_WAIT_FINALITY !== 'false',
          gasMultiplier: process.env.STORAGE_GAS_MULTIPLIER || '1.2',
          ogPriceUSD: process.env.OG_PRICE_USD || '0.10'
        }
      }
    });
    
  } catch (error) {
    console.error('[Storage] Config retrieval failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get storage config',
      details: error.message
    });
  }
});

module.exports = router; 