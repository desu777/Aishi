const express = require('express');
const router = express.Router();
const StorageHelper = require('../helpers/StorageHelper');
const PromptBuilder = require('../helpers/PromptBuilder');

/**
 * Helper Routes - New API endpoints for frontend integration
 * These routes provide processing services without payments
 */

// Initialize helpers
const storageHelper = new StorageHelper();
const promptBuilder = new PromptBuilder();

// Debug logging
function debugLog(message, data = null) {
  if (process.env.DREAMSCAPE_TEST === 'true') {
    console.log(`[🔮 HELPER-ROUTES] ${message}`, data || '');
  }
}

// ===============================================
// STORAGE PREPARATION ENDPOINTS
// ===============================================

/**
 * POST /api/helper/prepare-mint-data
 * Prepare storage data for minting new agent
 */
router.post('/prepare-mint-data', async (req, res) => {
  try {
    debugLog('Preparing mint data', { 
      agentName: req.body.agentName,
      userAddress: req.body.userAddress 
    });

    const { agentName, userAddress } = req.body;

    // Validate input
    if (!agentName || !userAddress) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: agentName, userAddress'
      });
    }

    // Validate wallet address format
    if (!userAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address format'
      });
    }

    // Prepare mint data using StorageHelper
    const mintData = await storageHelper.prepareMintData(agentName, userAddress);

    debugLog('Mint data prepared successfully', {
      filesCount: mintData.files.length,
      totalSize: mintData.files.reduce((sum, f) => sum + f.buffer.length, 0),
      descriptionsCount: mintData.descriptions.length
    });

    res.json({
      success: true,
      data: {
        files: mintData.files.map(f => ({
          filename: f.name,
          size: f.buffer.length,
          hash: f.expectedHash
        })),
        descriptions: mintData.descriptions,
        metadata: mintData.metadata,
        estimatedCost: mintData.metadata.estimatedStorageCost
      },
      preparationTimestamp: new Date().toISOString()
    });

  } catch (error) {
    debugLog('Error preparing mint data', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to prepare mint data',
      details: error.message
    });
  }
});

/**
 * POST /api/helper/prepare-dream-data
 * Prepare dream data for storage upload
 */
router.post('/prepare-dream-data', async (req, res) => {
  try {
    debugLog('Preparing dream data', { 
      dreamTextLength: req.body.dreamText?.length,
      userAddress: req.body.userAddress 
    });

    const { dreamText, userAddress, agentName, analysisResult } = req.body;

    // Validate input
    if (!dreamText || !userAddress) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: dreamText, userAddress'
      });
    }

    // For demo purposes, use timestamp as tokenId (real app would get from contract)
    const mockTokenId = Date.now() % 1000; // Simple mock ID
    
    // Prepare dream data
    const dreamData = await storageHelper.prepareDreamData(
      dreamText, 
      mockTokenId, 
      userAddress
    );

    debugLog('Dream data prepared successfully', {
      fileSize: dreamData.file.buffer.length,
      fileName: dreamData.file.name
    });

    res.json({
      success: true,
      data: {
        files: [{
          filename: dreamData.file.name,
          size: dreamData.file.buffer.length,
          hash: dreamData.file.expectedHash
        }],
        descriptions: ['dream_text'],
        metadata: dreamData.metadata,
        estimatedCost: dreamData.metadata.estimatedStorageCost
      },
      preparationTimestamp: new Date().toISOString()
    });

  } catch (error) {
    debugLog('Error preparing dream data', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to prepare dream data',
      details: error.message
    });
  }
});

/**
 * POST /api/helper/prepare-analysis-data
 * Prepare analysis results for storage
 */
router.post('/prepare-analysis-data', async (req, res) => {
  try {
    debugLog('Preparing analysis data', { 
      analysisLength: req.body.analysisResult?.length,
      userAddress: req.body.userAddress 
    });

    const { analysisResult, dreamText, userAddress, agentName } = req.body;

    // Validate input
    if (!analysisResult || !dreamText || !userAddress) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: analysisResult, dreamText, userAddress'
      });
    }

    // For demo purposes, use mock values
    const mockTokenId = Date.now() % 1000; // Simple mock ID
    const mockDreamHash = '0x' + Buffer.from(dreamText).toString('hex').substring(0, 64).padEnd(64, '0');
    
    // Prepare analysis data
    const analysisData = await storageHelper.prepareAnalysisData(
      analysisResult, 
      mockDreamHash, 
      mockTokenId
    );

    debugLog('Analysis data prepared successfully', {
      fileSize: analysisData.file.buffer.length,
      fileName: analysisData.file.name
    });

    res.json({
      success: true,
      data: {
        files: [{
          filename: analysisData.file.name,
          size: analysisData.file.buffer.length,
          hash: analysisData.file.expectedHash
        }],
        descriptions: ['ai_analysis'],
        metadata: analysisData.metadata,
        estimatedCost: analysisData.metadata.estimatedStorageCost
      },
      preparationTimestamp: new Date().toISOString()
    });

  } catch (error) {
    debugLog('Error preparing analysis data', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to prepare analysis data',
      details: error.message
    });
  }
});

// ===============================================
// PROMPT BUILDING ENDPOINTS
// ===============================================

/**
 * POST /api/helper/build-personalized-prompt
 * Build personalized AI prompt based on user's agent
 */
router.post('/build-personalized-prompt', async (req, res) => {
  try {
    debugLog('Building personalized prompt', { 
      dreamTextLength: req.body.dreamText?.length,
      intelligenceLevel: req.body.intelligenceLevel,
      dreamCount: req.body.dreamCount
    });

    const { dreamText, dreamCount, intelligenceLevel, agentName } = req.body;

    // Validate input
    if (!dreamText || typeof dreamCount !== 'number' || typeof intelligenceLevel !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid fields: dreamText, dreamCount, intelligenceLevel'
      });
    }

    // Validate intelligence level range
    if (intelligenceLevel < 1 || intelligenceLevel > 7) {
      return res.status(400).json({
        success: false,
        error: 'Intelligence level must be between 1 and 7'
      });
    }

    // Build personalized prompt
    const prompt = promptBuilder.buildPersonalizedPrompt(
      dreamText, 
      dreamCount, 
      intelligenceLevel, 
      agentName || 'Dream Agent'
    );

    // Get token estimation
    const tokenEstimation = promptBuilder.estimateTokens(prompt);

    debugLog('Personalized prompt built successfully', {
      promptLength: prompt.length,
      estimatedTokens: tokenEstimation.estimatedTokens
    });

    res.json({
      success: true,
      data: {
        prompt,
        agentName: agentName || 'Dream Agent',
        intelligenceLevel,
        dreamCount,
        tokenEstimation,
        buildTimestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    debugLog('Error building personalized prompt', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to build personalized prompt',
      details: error.message
    });
  }
});

/**
 * POST /api/helper/build-evolutionary-prompt
 * Build evolutionary prompt with dream history context
 */
router.post('/build-evolutionary-prompt', async (req, res) => {
  try {
    debugLog('Building evolutionary prompt', { 
      dreamTextLength: req.body.dreamText?.length,
      intelligenceLevel: req.body.intelligenceLevel,
      dreamCount: req.body.dreamCount,
      historyLength: req.body.dreamHistory?.length
    });

    const { dreamText, dreamCount, intelligenceLevel, dreamHistory, agentName } = req.body;

    // Validate input
    if (!dreamText || typeof dreamCount !== 'number' || typeof intelligenceLevel !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid fields: dreamText, dreamCount, intelligenceLevel'
      });
    }

    // Validate intelligence level range
    if (intelligenceLevel < 1 || intelligenceLevel > 7) {
      return res.status(400).json({
        success: false,
        error: 'Intelligence level must be between 1 and 7'
      });
    }

    // Build evolutionary prompt
    const prompt = promptBuilder.buildEvolutionaryPrompt(
      dreamText, 
      dreamCount, 
      intelligenceLevel, 
      dreamHistory || [], 
      agentName || 'Dream Agent'
    );

    // Get token estimation
    const tokenEstimation = promptBuilder.estimateTokens(prompt);

    // Analyze patterns if history provided
    let patterns = null;
    if (dreamHistory && dreamHistory.length > 0) {
      patterns = promptBuilder.analyzeHistoricalPatterns(dreamHistory);
    }

    debugLog('Evolutionary prompt built successfully', {
      promptLength: prompt.length,
      estimatedTokens: tokenEstimation.estimatedTokens,
      patternsFound: patterns ? Object.keys(patterns).length : 0
    });

    res.json({
      success: true,
      data: {
        prompt,
        agentName: agentName || 'Dream Agent',
        intelligenceLevel,
        dreamCount,
        dreamHistoryLength: dreamHistory?.length || 0,
        patterns,
        tokenEstimation,
        buildTimestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    debugLog('Error building evolutionary prompt', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to build evolutionary prompt',
      details: error.message
    });
  }
});

/**
 * POST /api/helper/build-conversation-prompt
 * Build conversation prompt for agent chat
 */
router.post('/build-conversation-prompt', async (req, res) => {
  try {
    debugLog('Building conversation prompt', { 
      messageLength: req.body.userMessage?.length,
      intelligenceLevel: req.body.intelligenceLevel,
      conversationCount: req.body.conversationCount
    });

    const { userMessage, agentName, intelligenceLevel, conversationCount } = req.body;

    // Validate input
    if (!userMessage || !agentName || typeof intelligenceLevel !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid fields: userMessage, agentName, intelligenceLevel'
      });
    }

    // Validate intelligence level range
    if (intelligenceLevel < 1 || intelligenceLevel > 7) {
      return res.status(400).json({
        success: false,
        error: 'Intelligence level must be between 1 and 7'
      });
    }

    // Build conversation prompt
    const prompt = promptBuilder.buildConversationPrompt(
      userMessage, 
      agentName, 
      intelligenceLevel, 
      conversationCount || 0
    );

    // Get token estimation
    const tokenEstimation = promptBuilder.estimateTokens(prompt);

    debugLog('Conversation prompt built successfully', {
      promptLength: prompt.length,
      estimatedTokens: tokenEstimation.estimatedTokens
    });

    res.json({
      success: true,
      data: {
        prompt,
        agentName,
        intelligenceLevel,
        conversationCount: conversationCount || 0,
        tokenEstimation,
        buildTimestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    debugLog('Error building conversation prompt', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to build conversation prompt',
      details: error.message
    });
  }
});

// ===============================================
// OPTIMIZATION & ANALYSIS ENDPOINTS
// ===============================================

/**
 * POST /api/helper/optimize-prompt
 * Optimize prompt for specific AI provider
 */
router.post('/optimize-prompt', async (req, res) => {
  try {
    debugLog('Optimizing prompt for provider', { 
      promptLength: req.body.prompt?.length,
      provider: req.body.provider
    });

    const { prompt, provider } = req.body;

    // Validate input
    if (!prompt || !provider) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: prompt, provider'
      });
    }

    // Optimize prompt
    const optimizedPrompt = promptBuilder.optimizeForProvider(prompt, provider);

    // Get token estimations for both versions
    const originalTokens = promptBuilder.estimateTokens(prompt);
    const optimizedTokens = promptBuilder.estimateTokens(optimizedPrompt);

    debugLog('Prompt optimized successfully', {
      originalLength: prompt.length,
      optimizedLength: optimizedPrompt.length,
      provider
    });

    res.json({
      success: true,
      data: {
        originalPrompt: prompt,
        optimizedPrompt,
        provider,
        originalTokens,
        optimizedTokens,
        sizeDifference: optimizedPrompt.length - prompt.length,
        optimizationTimestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    debugLog('Error optimizing prompt', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to optimize prompt',
      details: error.message
    });
  }
});

/**
 * POST /api/helper/analyze-patterns
 * Analyze patterns from dream history
 */
router.post('/analyze-patterns', async (req, res) => {
  try {
    debugLog('Analyzing dream patterns', { 
      historyLength: req.body.dreamHistory?.length
    });

    const { dreamHistory } = req.body;

    // Validate input
    if (!dreamHistory || !Array.isArray(dreamHistory)) {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid dreamHistory array'
      });
    }

    if (dreamHistory.length === 0) {
      return res.json({
        success: true,
        data: {
          patterns: {
            recurringSymbols: [],
            emotionalTrends: [],
            growthIndicators: []
          },
          analysisMessage: 'No dreams to analyze yet. Start recording dreams to see patterns.',
          dreamCount: 0
        }
      });
    }

    // Analyze patterns
    const patterns = promptBuilder.analyzeHistoricalPatterns(dreamHistory);

    debugLog('Patterns analyzed successfully', {
      recurringSymbols: patterns.recurringSymbols.length,
      emotionalTrends: patterns.emotionalTrends.length,
      growthIndicators: patterns.growthIndicators.length
    });

    res.json({
      success: true,
      data: {
        patterns,
        dreamCount: dreamHistory.length,
        analysisMessage: `Analyzed ${dreamHistory.length} dreams and found ${patterns.recurringSymbols.length} recurring symbols.`,
        analysisTimestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    debugLog('Error analyzing patterns', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze patterns',
      details: error.message
    });
  }
});

// ===============================================
// BROKER ACCOUNT MANAGEMENT ENDPOINTS
// ===============================================

/**
 * POST /api/helper/create-broker
 * Create broker account for user wallet
 */
router.post('/create-broker', async (req, res) => {
  try {
    debugLog('Creating broker account', { 
      userAddress: req.body.userAddress,
      initialFunding: req.body.initialFunding 
    });

    const { userAddress, initialFunding } = req.body;

    // Validate input
    if (!userAddress) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: userAddress'
      });
    }

    // Validate wallet address format
    if (!userAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address format'
      });
    }

    const fundingAmount = parseFloat(initialFunding) || 0.1; // Default 0.1 OG

    // Validate funding amount
    if (fundingAmount < 0.01 || fundingAmount > 10) {
      return res.status(400).json({
        success: false,
        error: 'Initial funding must be between 0.01 and 10 OG'
      });
    }

    debugLog('Broker creation parameters validated', {
      userAddress,
      fundingAmount
    });

    res.json({
      success: true,
      data: {
        userAddress,
        requiredFunding: fundingAmount,
        estimatedQueries: Math.floor(fundingAmount * 10000), // ~10k queries per OG
        instructions: {
          step1: `User should create broker account with their wallet`,
          step2: `Fund broker with ${fundingAmount} OG for ~${Math.floor(fundingAmount * 10000)} AI queries`,
          step3: `Backend will use this broker for all compute operations`,
          frontendAction: 'Call createZGComputeNetworkBroker(userWallet) then broker.ledger.addLedger(amount)'
        },
        creationTimestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    debugLog('Error creating broker account', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to create broker account',
      details: error.message
    });
  }
});

/**
 * POST /api/helper/check-broker-status
 * Check if user has broker account and get balance
 */
router.post('/check-broker-status', async (req, res) => {
  try {
    debugLog('Checking broker status', { 
      userAddress: req.body.userAddress 
    });

    const { userAddress } = req.body;

    // Validate input
    if (!userAddress) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: userAddress'
      });
    }

    // Validate wallet address format
    if (!userAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address format'
      });
    }

    // For now, return mock data - real implementation would check user's broker
    // In production, this would use user's wallet to check their broker status
    const mockBrokerStatus = {
      exists: false, // User needs to create broker on frontend
      balance: 0,
      estimatedQueries: 0,
      needsCreation: true,
      needsFunding: true,
      recommendedFunding: 0.1,
      userAddress
    };

    debugLog('Broker status checked', mockBrokerStatus);

    res.json({
      success: true,
      data: {
        ...mockBrokerStatus,
        instructions: {
          createBroker: 'User must create broker account using their wallet on frontend',
          fundBroker: 'User should fund broker with 0.1 OG for AI features',
          minimumFunding: '0.01 OG (100 queries)',
          recommendedFunding: '0.1 OG (1000 queries)'
        },
        checkTimestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    debugLog('Error checking broker status', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to check broker status',
      details: error.message
    });
  }
});

/**
 * POST /api/helper/estimate-broker-costs
 * Estimate broker funding needed for user operations
 */
router.post('/estimate-broker-costs', async (req, res) => {
  try {
    debugLog('Estimating broker costs', { 
      expectedDreams: req.body.expectedDreams,
      expectedChats: req.body.expectedChats 
    });

    const { expectedDreams, expectedChats } = req.body;

    const dreamsPerMonth = parseInt(expectedDreams) || 30; // Default 1 dream per day
    const chatsPerMonth = parseInt(expectedChats) || 60;   // Default 2 chats per day

    // Cost estimates (very rough)
    const dreamAnalysisCost = 0.0002; // OG per dream analysis
    const chatCost = 0.0001;          // OG per chat message

    const monthlyCost = (dreamsPerMonth * dreamAnalysisCost) + (chatsPerMonth * chatCost);
    const yearlyTotal = monthlyCost * 12;

    // Funding recommendations
    const fundingOptions = [
      {
        amount: 0.05,
        description: 'Light Usage',
        estimatedDuration: `${Math.floor(0.05 / monthlyCost)} months`,
        queries: Math.floor(0.05 * 10000)
      },
      {
        amount: 0.1,
        description: 'Recommended',
        estimatedDuration: `${Math.floor(0.1 / monthlyCost)} months`,
        queries: Math.floor(0.1 * 10000)
      },
      {
        amount: 0.25,
        description: 'Heavy Usage',
        estimatedDuration: `${Math.floor(0.25 / monthlyCost)} months`,
        queries: Math.floor(0.25 * 10000)
      }
    ];

    debugLog('Broker costs estimated', { 
      monthlyCost, 
      yearlyTotal,
      optionsCount: fundingOptions.length 
    });

    res.json({
      success: true,
      data: {
        usage: {
          expectedDreamsPerMonth: dreamsPerMonth,
          expectedChatsPerMonth: chatsPerMonth,
          totalOperationsPerMonth: dreamsPerMonth + chatsPerMonth
        },
        costs: {
          dreamAnalysisCostOG: dreamAnalysisCost,
          chatCostOG: chatCost,
          monthlyCostOG: monthlyCost,
          yearlyCostOG: yearlyTotal,
          monthlyCostUSD: (monthlyCost * 0.1).toFixed(4), // Assuming 0.1 USD per OG
          yearlyCostUSD: (yearlyTotal * 0.1).toFixed(2)
        },
        fundingOptions,
        recommendations: {
          newUser: 'Start with 0.1 OG to test all features',
          regularUser: '0.1-0.25 OG should last 2-4 months',
          powerUser: '0.5+ OG for unlimited analysis'
        },
        estimationTimestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    debugLog('Error estimating broker costs', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to estimate broker costs',
      details: error.message
    });
  }
});

/**
 * GET /api/helper/broker-funding-guide
 * Get guide for broker funding process
 */
router.get('/broker-funding-guide', (req, res) => {
  try {
    debugLog('Broker funding guide requested');

    const guide = {
      overview: 'Broker accounts enable AI compute operations on 0G Network',
      steps: [
        {
          step: 1,
          title: 'Create Broker Account',
          description: 'Use your wallet to create a broker account',
          technical: 'Call createZGComputeNetworkBroker(userWallet)',
          userAction: 'Frontend handles this automatically'
        },
        {
          step: 2,
          title: 'Fund Broker Account',
          description: 'Add OG tokens to your broker for AI operations',
          technical: 'Call broker.ledger.addLedger(amount)',
          userAction: 'User signs transaction to fund broker'
        },
        {
          step: 3,
          title: 'Use AI Features',
          description: 'Dream analysis and chat features are now available',
          technical: 'Backend uses broker for all compute operations',
          userAction: 'Enjoy unlimited AI-powered dream insights!'
        }
      ],
      costBreakdown: {
        dreamAnalysis: {
          costOG: 0.0002,
          costUSD: 0.00002,
          description: 'AI analysis of dream content with personalized insights'
        },
        agentChat: {
          costOG: 0.0001,
          costUSD: 0.00001,
          description: 'Natural conversation with your dream agent'
        },
        patternAnalysis: {
          costOG: 0.0001,
          costUSD: 0.00001,
          description: 'Advanced pattern recognition across dream history'
        }
      },
      fundingTips: [
        'Start with 0.1 OG for testing (1000+ operations)',
        'Monitor your balance in the dashboard',
        'Add more funds anytime without creating new broker',
        'Unused funds stay in your broker account',
        'No expiration on broker funds'
      ]
    };

    res.json({
      success: true,
      data: guide,
      guideTimestamp: new Date().toISOString()
    });

  } catch (error) {
    debugLog('Error generating broker funding guide', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to generate funding guide',
      details: error.message
    });
  }
});

// ===============================================
// UTILITY ENDPOINTS
// ===============================================

/**
 * GET /api/helper/estimate-costs
 * Estimate costs for various operations
 */
router.get('/estimate-costs', async (req, res) => {
  try {
    debugLog('Estimating costs for operations');

    // Create mock files for cost estimation
    const mockMintFiles = [
      { buffer: Buffer.alloc(400) }, // personality
      { buffer: Buffer.alloc(400) }, // patterns  
      { buffer: Buffer.alloc(400) }  // emotions
    ];
    const mockDreamFile = [{ buffer: Buffer.alloc(300) }];
    const mockAnalysisFile = [{ buffer: Buffer.alloc(400) }];

    // Sample estimations
    const estimations = {
      storage: {
        mintAgent: storageHelper.estimateStorageCosts(mockMintFiles).estimatedCostOG,
        dreamUpload: storageHelper.estimateStorageCosts(mockDreamFile).estimatedCostOG,
        analysisUpload: storageHelper.estimateStorageCosts(mockAnalysisFile).estimatedCostOG
      },
      compute: {
        basicAnalysis: '0.0001', // Basic AI analysis
        advancedAnalysis: '0.0005', // Advanced AI with history
        conversationRound: '0.0002' // Single conversation
      },
      contractGas: {
        mint: '0.001', // Minting gas estimate
        updateMetadata: '0.0005', // Update metadata gas
        transfer: '0.0003' // Transfer gas
      }
    };

    debugLog('Cost estimations calculated');

    res.json({
      success: true,
      data: {
        estimations,
        currency: 'OG',
        disclaimer: 'Estimates are approximate and may vary based on network conditions',
        estimationTimestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    debugLog('Error estimating costs', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to estimate costs',
      details: error.message
    });
  }
});

/**
 * GET /api/helper/health
 * Health check for helper services
 */
router.get('/health', (req, res) => {
  try {
    debugLog('Health check requested');

    const health = {
      status: 'healthy',
      services: {
        storageHelper: 'ready',
        promptBuilder: 'ready'
      },
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };

    res.json({
      success: true,
      data: health
    });

  } catch (error) {
    debugLog('Error in health check', error.message);
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      details: error.message
    });
  }
});

module.exports = router; 