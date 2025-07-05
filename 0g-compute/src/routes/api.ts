import express from 'express';
import virtualBrokers from '../services/virtualBrokers';
import aiService from '../services/aiService';
import masterWallet from '../services/masterWallet';

const router = express.Router();

// Helper function for error responses
const handleError = (res: express.Response, error: any, defaultMessage: string) => {
  const message = error.message || defaultMessage;
  const statusCode = error.statusCode || 500;
  
  console.error('API Error:', message);
  res.status(statusCode).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  });
};

// Helper function for success responses
const handleSuccess = (res: express.Response, data: any, message?: string) => {
  res.json({
    success: true,
    data: data,
    message: message,
    timestamp: new Date().toISOString()
  });
};

/**
 * POST /api/create-broker
 * Creates a new virtual broker for user
 */
router.post('/create-broker', async (req, res) => {
  try {
    const { walletAddress } = req.body;
    
    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'walletAddress is required',
        timestamp: new Date().toISOString()
      });
    }

    const broker = await virtualBrokers.createBroker(walletAddress);
    
    if (process.env.TEST_ENV === 'true') {
      console.log(`🆕 API: Created broker for ${walletAddress}`);
    }

    handleSuccess(res, broker, 'Virtual broker created successfully');
  } catch (error: any) {
    handleError(res, error, 'Failed to create virtual broker');
  }
});

/**
 * POST /api/fund
 * Funds a virtual broker account
 */
router.post('/fund', async (req, res) => {
  try {
    const { walletAddress, amount, txHash } = req.body;
    
    if (!walletAddress || !amount) {
      return res.status(400).json({
        success: false,
        error: 'walletAddress and amount are required',
        timestamp: new Date().toISOString()
      });
    }

    const broker = await virtualBrokers.fundBroker({
      walletAddress,
      amount: parseFloat(amount),
      txHash
    });
    
    if (process.env.TEST_ENV === 'true') {
      console.log(`💰 API: Funded broker ${walletAddress} with ${amount} OG`);
    }

    handleSuccess(res, broker, 'Broker funded successfully');
  } catch (error: any) {
    handleError(res, error, 'Failed to fund broker');
  }
});

/**
 * GET /api/balance/:walletAddress
 * Checks broker balance and transaction history
 */
router.get('/balance/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'walletAddress is required',
        timestamp: new Date().toISOString()
      });
    }

    const balance = await virtualBrokers.checkBalance(walletAddress);
    
    if (process.env.TEST_ENV === 'true') {
      console.log(`📊 API: Balance check for ${walletAddress}: ${balance.balance} OG`);
    }

    handleSuccess(res, balance, 'Balance retrieved successfully');
  } catch (error: any) {
    handleError(res, error, 'Failed to retrieve balance');
  }
});

/**
 * POST /api/analyze-dream
 * Main endpoint for AI dream analysis
 */
router.post('/analyze-dream', async (req, res) => {
  try {
    const { walletAddress, query, model } = req.body;
    
    if (!walletAddress || !query) {
      return res.status(400).json({
        success: false,
        error: 'walletAddress and query are required',
        timestamp: new Date().toISOString()
      });
    }

    const result = await aiService.analyzeDream({
      userWalletAddress: walletAddress,
      query: query,
      model: model || 'llama-3.3-70b-instruct'
    });
    
    if (process.env.TEST_ENV === 'true') {
      console.log(`🤖 API: AI analysis completed for ${walletAddress}`);
    }

    handleSuccess(res, result, 'Dream analysis completed successfully');
  } catch (error: any) {
    handleError(res, error, 'Failed to analyze dream');
  }
});

/**
 * GET /api/models
 * Gets available AI models and services
 */
router.get('/models', async (req, res) => {
  try {
    const models = await aiService.getAvailableModels();
    
    if (process.env.TEST_ENV === 'true') {
      console.log(`🔍 API: Retrieved ${models.models.length} available models`);
    }

    handleSuccess(res, models, 'Available models retrieved successfully');
  } catch (error: any) {
    handleError(res, error, 'Failed to retrieve available models');
  }
});

/**
 * GET /api/status
 * Gets service status and health check
 */
router.get('/status', async (req, res) => {
  try {
    const [aiStatus, brokersSummary, walletInfo] = await Promise.all([
      aiService.getServiceStatus(),
      virtualBrokers.getAllBrokers(),
      masterWallet.getWalletInfo()
    ]);

    const status = {
      service: {
        name: 'Dreamscape 0G Compute',
        version: '1.0.0',
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        isReady: aiStatus.isReady
      },
      ai: aiStatus,
      brokers: brokersSummary,
      masterWallet: walletInfo
    };

    if (process.env.TEST_ENV === 'true') {
      console.log('📋 API: Service status retrieved');
    }

    handleSuccess(res, status, 'Service status retrieved successfully');
  } catch (error: any) {
    handleError(res, error, 'Failed to retrieve service status');
  }
});

/**
 * GET /api/master-wallet-address
 * Gets the Master Wallet address for funding
 */
router.get('/master-wallet-address', async (req, res) => {
  try {
    const address = masterWallet.getWalletAddress();
    
    if (process.env.TEST_ENV === 'true') {
      console.log(`🔑 API: Master wallet address requested: ${address}`);
    }

    handleSuccess(res, { address }, 'Master wallet address retrieved successfully');
  } catch (error: any) {
    handleError(res, error, 'Failed to retrieve master wallet address');
  }
});

/**
 * POST /api/estimate-cost
 * Estimates cost for AI query
 */
router.post('/estimate-cost', async (req, res) => {
  try {
    const { query, model } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'query is required',
        timestamp: new Date().toISOString()
      });
    }

    const cost = virtualBrokers.estimateQueryCost(query);
    
    if (process.env.TEST_ENV === 'true') {
      console.log(`💰 API: Cost estimation for query: ${cost} OG`);
    }

    handleSuccess(res, { 
      estimatedCost: cost,
      model: model || 'llama-3.3-70b-instruct',
      queryLength: query.length
    }, 'Cost estimated successfully');
  } catch (error: any) {
    handleError(res, error, 'Failed to estimate cost');
  }
});

/**
 * GET /api/transactions/:walletAddress
 * Gets transaction history for a wallet
 */
router.get('/transactions/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;
    
    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'walletAddress is required',
        timestamp: new Date().toISOString()
      });
    }

    const balance = await virtualBrokers.checkBalance(walletAddress);
    
    if (process.env.TEST_ENV === 'true') {
      console.log(`📜 API: Transaction history for ${walletAddress}`);
    }

    handleSuccess(res, {
      walletAddress: balance.walletAddress,
      transactions: balance.transactions.slice(0, limit)
    }, 'Transaction history retrieved successfully');
  } catch (error: any) {
    handleError(res, error, 'Failed to retrieve transaction history');
  }
});

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default router; 