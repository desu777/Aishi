import express from 'express';
import virtualBrokers from '../services/virtualBrokers';
import aiService from '../services/aiService';
import masterWallet from '../services/masterWallet';
import queryManager from '../services/queryManager';
import consolidationChecker from '../services/consolidationChecker';
import DatabaseService from '../database/database';
import geminiService, { GeminiService } from '../services/geminiService';
import { 
  aiQueryLimiter, 
  brokerCreationLimiter, 
  costEstimationLimiter, 
  fundingLimiter,
  strictLimiter 
} from '../middleware/rateLimiter';

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
 * PROTECTED: Limited to 3 creations per hour per IP
 */
router.post('/create-broker', brokerCreationLimiter, async (req, res) => {
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
 * PROTECTED: Limited to 5 funding operations per 10 minutes per IP
 */
router.post('/fund', fundingLimiter, async (req, res) => {
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
 * POST /api/0g-compute
 * Main endpoint for 0G Network AI processing (dreams, chats, etc.)
 * PROTECTED: Limited to 20 AI queries per minute per IP
 * Accepts modelId from frontend for dynamic model selection
 */
router.post('/0g-compute', aiQueryLimiter, async (req, res) => {
  try {
    const { walletAddress, query, modelId } = req.body;
    
    if (!walletAddress || !query) {
      return res.status(400).json({
        success: false,
        error: 'walletAddress and query are required',
        timestamp: new Date().toISOString()
      });
    }

    // Use modelId from frontend if provided, fallback to env variable
    const selectedModel = modelId || process.env.MODEL_PICKED || 'llama-3.3-70b-instruct';
    
    if (process.env.TEST_ENV === 'true') {
      console.log(`🎯 API: Model selection - requested: ${modelId}, using: ${selectedModel}`);
    }
    
    const result = await queryManager.processQuery(
      walletAddress,
      query,
      selectedModel
    );
    
    if (process.env.TEST_ENV === 'true') {
      console.log(`🤖 API: AI analysis completed for ${walletAddress} using model: ${selectedModel}`);
    }

    // Include selected model in response for frontend feedback
    const enhancedResult = {
      ...result,
      modelUsed: selectedModel,
      modelSource: modelId ? 'frontend' : 'env_default'
    };

    handleSuccess(res, enhancedResult, 'AI processing completed successfully');
  } catch (error: any) {
    handleError(res, error, 'Failed to process AI query');
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
 * GET /api/models/discover
 * Discovers available models from 0G Network and includes Gemini
 */
router.get('/models/discover', async (req, res) => {
  try {
    // Get discovered services from 0G Network
    const discoveredServices = await aiService.discoverServices();
    
    // Format models for frontend
    const models = [
      // Decentralized models from 0G Network
      ...discoveredServices.map(service => ({
        id: service.model,
        name: service.model,
        provider: service.provider,
        providerAddress: service.provider, // Add providerAddress for backend execution
        type: 'decentralized',
        verifiability: service.verifiability,
        inputPrice: service.inputPrice.toString(),
        outputPrice: service.outputPrice.toString(),
        available: service.isAvailable,
        badge: service.verifiability === 'TeeML' ? 'Verified' : null
      })),
      // Centralized Gemini models with different profiles
      {
        id: 'gemini-2.5-flash-thinking',
        name: 'Gemini 2.5 Flash (Thinking)',
        provider: 'Google Vertex AI',
        providerAddress: null, // Centralized models don't have providerAddress
        type: 'centralized',
        verifiability: 'none',
        inputPrice: '0',
        outputPrice: '0',
        available: true,
        badge: 'Smart'
      },
      {
        id: 'gemini-2.5-flash-fast',
        name: 'Gemini 2.5 Flash (Fast)',
        provider: 'Google Vertex AI', 
        providerAddress: null, // Centralized models don't have providerAddress
        type: 'centralized',
        verifiability: 'none',
        inputPrice: '0',
        outputPrice: '0',
        available: true,
        badge: 'Speed'
      },
      {
        id: 'gemini-2.5-flash-auto',
        name: 'Gemini 2.5 Flash (Auto)',
        provider: 'Google Vertex AI',
        providerAddress: null, // Centralized models don't have providerAddress
        type: 'centralized', 
        verifiability: 'none',
        inputPrice: '0',
        outputPrice: '0',
        available: true,
        badge: 'Adaptive'
      }
    ];
    
    if (process.env.TEST_ENV === 'true') {
      console.log(`🔍 API: Discovered ${discoveredServices.length} decentralized models + Gemini`);
    }

    handleSuccess(res, { models }, 'Models discovered successfully');
  } catch (error: any) {
    // On error, still return Gemini as fallback
    console.error('Failed to discover 0G models, returning Gemini only:', error.message);
    
    const fallbackModels = [
      {
        id: 'gemini-2.5-flash-thinking',
        name: 'Gemini 2.5 Flash (Thinking)',
        provider: 'Google Vertex AI',
        providerAddress: null, // Centralized models don't have providerAddress
        type: 'centralized',
        verifiability: 'none',
        inputPrice: '0',
        outputPrice: '0',
        available: true,
        badge: 'Fallback'
      },
      {
        id: 'gemini-2.5-flash-fast',
        name: 'Gemini 2.5 Flash (Fast)',
        provider: 'Google Vertex AI',
        providerAddress: null, // Centralized models don't have providerAddress
        type: 'centralized',
        verifiability: 'none',
        inputPrice: '0',
        outputPrice: '0',
        available: true,
        badge: 'Fallback'
      },
      {
        id: 'gemini-2.5-flash-auto',
        name: 'Gemini 2.5 Flash (Auto)',
        provider: 'Google Vertex AI',
        providerAddress: null, // Centralized models don't have providerAddress
        type: 'centralized',
        verifiability: 'none',
        inputPrice: '0',
        outputPrice: '0',
        available: true,
        badge: 'Fallback'
      }
    ];
    
    handleSuccess(res, { models: fallbackModels }, 'Using fallback model');
  }
});

/**
 * GET /api/status
 * Gets service status and health check
 */
router.get('/status', async (req, res) => {
  try {
    const [aiStatus, brokersSummary, walletInfo, queueStatus] = await Promise.all([
      aiService.getServiceStatus(),
      virtualBrokers.getAllBrokers(),
      masterWallet.getWalletInfo(),
      Promise.resolve(queryManager.getQueueStatus())
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
      masterWallet: walletInfo,
      queryManager: queueStatus
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
 * PROTECTED: Limited to 20 cost estimations per 5 minutes per IP
 */
router.post('/estimate-cost', costEstimationLimiter, async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'query is required',
        timestamp: new Date().toISOString()
      });
    }

    // Backend zawsze używa MODEL_PICKED z .env
    const selectedModel = process.env.MODEL_PICKED || 'llama-3.3-70b-instruct';
    const cost = virtualBrokers.estimateQueryCost(query, selectedModel);
    
    if (process.env.TEST_ENV === 'true') {
      console.log(`💰 API: Cost estimation for query: ${cost} OG (model: ${selectedModel})`);
    }

    handleSuccess(res, { 
      estimatedCost: cost,
      model: selectedModel,
      queryLength: query.length,
      note: 'This is an approximate cost - actual cost may vary and will be calculated dynamically'
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
 * GET /api/queue-status
 * Gets query processing queue status
 */
router.get('/queue-status', (req, res) => {
  try {
    const queueStatus = queryManager.getQueueStatus();
    
    if (process.env.TEST_ENV === 'true') {
      console.log('📋 API: Queue status retrieved');
    }

    handleSuccess(res, queueStatus, 'Queue status retrieved successfully');
  } catch (error: any) {
    handleError(res, error, 'Failed to retrieve queue status');
  }
});

/**
 * GET /api/consolidation/:walletAddress
 * Gets consolidation status for a broker
 */
router.get('/consolidation/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'walletAddress is required',
        timestamp: new Date().toISOString()
      });
    }

    const consolidationStatus = DatabaseService.getConsolidationStatus(walletAddress);
    
    if (!consolidationStatus) {
      return res.status(404).json({
        success: false,
        error: 'Broker not found',
        timestamp: new Date().toISOString()
      });
    }

    if (process.env.TEST_ENV === 'true') {
      console.log(`📅 API: Consolidation status for ${walletAddress}`);
    }

    handleSuccess(res, consolidationStatus, 'Consolidation status retrieved successfully');
  } catch (error: any) {
    handleError(res, error, 'Failed to retrieve consolidation status');
  }
});

/**
 * POST /api/consolidation/check
 * Manually trigger consolidation check
 */
router.post('/consolidation/check', async (req, res) => {
  try {
    const results = await consolidationChecker.performConsolidationCheck();
    
    const summary = {
      totalBrokers: results.length,
      monthUpdates: results.filter(r => r.needsMonthLearning).length,
      yearUpdates: results.filter(r => r.needsYearLearning).length,
      updatedBrokers: results.filter(r => r.needsMonthLearning || r.needsYearLearning).map(r => r.walletAddress),
      details: results
    };

    if (process.env.TEST_ENV === 'true') {
      console.log(`🔍 API: Manual consolidation check completed - ${summary.monthUpdates} month, ${summary.yearUpdates} year updates`);
    }

    handleSuccess(res, summary, 'Consolidation check completed successfully');
  } catch (error: any) {
    handleError(res, error, 'Failed to perform consolidation check');
  }
});

/**
 * GET /api/consolidation/status
 * Gets consolidation checker service status
 */
router.get('/consolidation/status', (req, res) => {
  try {
    const status = consolidationChecker.getStatus();
    
    if (process.env.TEST_ENV === 'true') {
      console.log('📋 API: Consolidation checker status retrieved');
    }

    handleSuccess(res, status, 'Consolidation checker status retrieved successfully');
  } catch (error: any) {
    handleError(res, error, 'Failed to retrieve consolidation checker status');
  }
});

/**
 * POST /api/consolidation/start
 * Start the consolidation checker
 * PROTECTED: Sensitive system operation - Limited to 5 requests per 15 minutes per IP
 */
router.post('/consolidation/start', strictLimiter, (req, res) => {
  try {
    const { intervalMinutes } = req.body;
    const interval = intervalMinutes ? parseInt(intervalMinutes) : 60;
    
    consolidationChecker.startChecker(interval);
    
    if (process.env.TEST_ENV === 'true') {
      console.log(`▶️  API: Consolidation checker started with ${interval} minute interval`);
    }

    handleSuccess(res, { 
      isRunning: true, 
      intervalMinutes: interval 
    }, 'Consolidation checker started successfully');
  } catch (error: any) {
    handleError(res, error, 'Failed to start consolidation checker');
  }
});

/**
 * POST /api/consolidation/stop
 * Stop the consolidation checker
 * PROTECTED: Sensitive system operation - Limited to 5 requests per 15 minutes per IP
 */
router.post('/consolidation/stop', strictLimiter, (req, res) => {
  try {
    consolidationChecker.stopChecker();
    
    if (process.env.TEST_ENV === 'true') {
      console.log('⏹️  API: Consolidation checker stopped');
    }

    handleSuccess(res, { isRunning: false }, 'Consolidation checker stopped successfully');
  } catch (error: any) {
    handleError(res, error, 'Failed to stop consolidation checker');
  }
});

/**
 * POST /api/gemini
 * Modern Gemini endpoint with dynamic profile selection
 * Supports 3 profiles: thinking, fast, auto (no .env dependency)
 * PROTECTED: Limited to 20 AI queries per minute per IP
 */
router.post('/gemini', aiQueryLimiter, async (req, res) => {
  try {
    const { prompt, profile, modelId, temperature, maxTokens } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'prompt is required',
        timestamp: new Date().toISOString()
      });
    }

    // Ensure Gemini service is initialized
    if (!geminiService.isReady()) {
      return res.status(503).json({
        success: false,
        error: 'Gemini AI service is not ready',
        timestamp: new Date().toISOString()
      });
    }

    // Determine profile from explicit parameter or extract from modelId
    let selectedProfile = profile || 'auto'; // default to 'auto'
    
    if (modelId && !profile) {
      // Extract profile from modelId (e.g., "gemini-2.5-flash-thinking" → "thinking")
      selectedProfile = GeminiService.extractProfileFromModelId(modelId);
    }

    if (process.env.TEST_ENV === 'true') {
      console.log(`🤖 API: Gemini request received`);
      console.log(`   Prompt length: ${prompt.length}`);
      console.log(`   Profile: ${selectedProfile} ${modelId ? `(extracted from ${modelId})` : '(explicit/default)'}`);
      console.log(`   Temperature: ${temperature || 'default'}`);
    }

    // Forward request to modern Gemini service with profile
    const result = await geminiService.generateContentWithProfile(
      prompt,
      selectedProfile,
      {
        temperature,
        maxTokens
      }
    );

    if (process.env.TEST_ENV === 'true') {
      console.log(`✅ API: Gemini response received in ${result.metadata.responseTime}ms`);
      console.log(`   Profile used: ${result.metadata.profile}`);
      console.log(`   Thinking enabled: ${result.metadata.thinkingEnabled}`);
      if (result.metadata.thinkingBudget !== undefined) {
        console.log(`   Thinking budget: ${result.metadata.thinkingBudget}`);
      }
    }

    // Return enhanced response with profile metadata
    res.json({
      success: true,
      data: result.data,
      metadata: {
        ...result.metadata,
        selectedProfile,
        profileSource: modelId ? 'modelId' : (profile ? 'explicit' : 'default')
      },
      message: `Gemini response generated successfully using ${result.metadata.profile}`,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    handleError(res, error, 'Failed to generate Gemini response');
  }
});

/**
 * GET /api/gemini/profiles
 * Get available Gemini profiles information
 */
router.get('/gemini/profiles', (req, res) => {
  try {
    const profiles = geminiService.getAvailableProfiles();
    
    if (process.env.TEST_ENV === 'true') {
      console.log('📋 API: Gemini profiles requested');
    }

    handleSuccess(res, { 
      profiles,
      count: Object.keys(profiles).length,
      defaultProfile: 'auto'
    }, 'Gemini profiles retrieved successfully');
  } catch (error: any) {
    handleError(res, error, 'Failed to retrieve Gemini profiles');
  }
});

/**
 * GET /api/gemini/status
 * Check Gemini service status with profile information
 */
router.get('/gemini/status', (req, res) => {
  try {
    const status = geminiService.getStatus();
    
    if (process.env.TEST_ENV === 'true') {
      console.log('📋 API: Gemini service status retrieved');
    }

    handleSuccess(res, status, 'Gemini service status retrieved successfully');
  } catch (error: any) {
    handleError(res, error, 'Failed to retrieve Gemini service status');
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