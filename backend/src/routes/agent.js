const express = require('express');
const INFTAgentService = require('../services/inftAgentService');

const router = express.Router();

// Debug logging helper
const debugLog = (message, data = null) => {
  if (process.env.DREAMSCAPE_TEST === 'true') {
    console.log(`[🔮 AGENT API] ${message}`, data || '');
  }
};

// Initialize iNFT Agent Service
const inftAgentService = new INFTAgentService();

/**
 * GET /api/agent/fee-info
 * Get minting fee information
 */
router.get('/fee-info', async (req, res) => {
  try {
    debugLog('Getting minting fee information');

    const feeInfo = await inftAgentService.getMintingFeeInfo();

    res.status(200).json({
      success: true,
      feeInfo: {
        ...feeInfo,
        description: 'Minting fee for creating a personalized dream agent',
        benefits: [
          'Unique agent name (reserved forever)',
          'Personalized AI that learns from your dreams',
          'Unlimited dream analysis and conversations',
          'Agent evolution and personality development',
          'Decentralized storage on 0G network'
        ]
      }
    });

  } catch (error) {
    console.error('[Agent API] Failed to get fee info:', error);
    debugLog('Fee info retrieval failed', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/agent/create
 * Create a new personalized dream agent for a user (with fee payment)
 */
router.post('/create', async (req, res) => {
  try {
    const { userAddress, agentName } = req.body;
    
    if (!userAddress) {
      return res.status(400).json({
        success: false,
        error: 'userAddress is required'
      });
    }

    if (!agentName || agentName.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'agentName is required'
      });
    }

    // Validate agent name length
    if (agentName.length > 32) {
      return res.status(400).json({
        success: false,
        error: 'Agent name must be 32 characters or less'
      });
    }

    debugLog(`Creating personalized agent with fee payment`, { userAddress, agentName });

    // Get fee information first to inform user
    let feeInfo;
    try {
      feeInfo = await inftAgentService.getMintingFeeInfo();
      debugLog('Minting fee required', { 
        fee: feeInfo.mintingFeeEther + ' OG',
        treasury: feeInfo.treasury 
      });
    } catch (error) {
      debugLog('Failed to get fee info', error.message);
      return res.status(500).json({
        success: false,
        error: 'Unable to retrieve minting fee information. Please try again.'
      });
    }

    // Check if name is available first
    try {
      const nameAvailable = await inftAgentService.isNameAvailable(agentName);
      if (!nameAvailable) {
        return res.status(400).json({
          success: false,
          error: `Agent name "${agentName}" is already taken. Please choose another name.`,
          feeInfo: {
            required: feeInfo.mintingFeeEther + ' OG',
            treasury: feeInfo.treasury
          }
        });
      }
    } catch (error) {
      debugLog('Name availability check failed', error.message);
      // Continue with creation - let the contract handle the check
    }

    // Check if user already has an agent
    const existingAgent = await inftAgentService.getUserAgent(userAddress);
    
    if (existingAgent.hasAgent) {
      return res.status(400).json({
        success: false,
        error: 'User already has a dream agent',
        agentTokenId: existingAgent.tokenId,
        feeInfo: {
          note: 'No fee required - user already has an agent'
        }
      });
    }

    // Create new personalized agent with fee payment
    const result = await inftAgentService.createDreamAgent(userAddress, agentName);

    debugLog(`Personalized agent created with fee payment`, { 
      tokenId: result.tokenId, 
      agentName: result.agentName,
      feePaid: result.feeInfo.feePaid + ' OG'
    });

    res.status(200).json({
      success: true,
      message: `Dream agent "${result.agentName}" created successfully!`,
      agentTokenId: result.tokenId,
      agentName: result.agentName,
      agentData: {
        personalityHash: result.personalityHash,
        patternsHash: result.patternsHash,
        emotionsHash: result.emotionsHash,
        txHash: result.txHash
      },
      feeInfo: result.feeInfo,
      pricing: {
        feePaid: result.feeInfo.feePaid + ' OG',
        feeUSD: '$' + result.feeInfo.feeUSD,
        treasury: result.feeInfo.treasury,
        benefits: [
          'Personalized AI companion',
          'Unlimited dream analysis',
          'Agent evolution system',
          'Decentralized storage'
        ]
      }
    });

  } catch (error) {
    console.error('[Agent API] Failed to create agent:', error);
    debugLog('Agent creation failed', error.message);
    
    // Handle specific error types with fee context
    if (error.message.includes('already taken')) {
      res.status(400).json({
        success: false,
        error: error.message,
        note: 'No fee charged for failed name validation'
      });
    } else if (error.message.includes('Maximum number')) {
      res.status(400).json({
        success: false,
        error: 'All 1000 dream agents have been minted. No more agents available.',
        remainingSupply: 0,
        note: 'No fee charged - supply exhausted'
      });
    } else if (error.message.includes('Insufficient payment')) {
      res.status(400).json({
        success: false,
        error: 'Insufficient payment for minting. Required: 0.1 OG',
        feeRequired: '0.1 OG',
        note: 'Please ensure your wallet has enough OG tokens for the minting fee'
      });
    } else if (error.message.includes('Treasury payment failed')) {
      res.status(500).json({
        success: false,
        error: 'Treasury payment failed. Please try again.',
        note: 'The minting fee could not be processed. No tokens were charged.'
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
});

/**
 * POST /api/agent/check-name
 * Check if agent name is available (includes fee info)
 */
router.post('/check-name', async (req, res) => {
  try {
    const { agentName } = req.body;
    
    if (!agentName || agentName.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'agentName is required'
      });
    }

    if (agentName.length > 32) {
      return res.status(400).json({
        success: false,
        available: false,
        error: 'Agent name must be 32 characters or less'
      });
    }

    debugLog('Checking name availability with fee info', { agentName });

    const [available, feeInfo] = await Promise.all([
      inftAgentService.isNameAvailable(agentName),
      inftAgentService.getMintingFeeInfo()
    ]);

    res.status(200).json({
      success: true,
      agentName,
      available,
      feeInfo: available ? {
        required: feeInfo.mintingFeeEther + ' OG',
        requiredUSD: '$' + (parseFloat(feeInfo.mintingFeeEther) * (parseFloat(process.env.OG_PRICE_USD) || 0.1)).toFixed(4),
        treasury: feeInfo.treasury,
        note: available ? 'Fee will be charged upon successful minting' : 'No fee required for unavailable names'
      } : {
        note: 'Name not available - no fee required'
      }
    });

  } catch (error) {
    console.error('[Agent API] Failed to check name availability:', error);
    debugLog('Name availability check failed', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/agent/:tokenId/chat
 * Record a conversation with an agent
 */
router.post('/:tokenId/chat', async (req, res) => {
  try {
    const tokenId = parseInt(req.params.tokenId);
    const { message, userAddress } = req.body;
    
    if (isNaN(tokenId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid token ID'
      });
    }

    if (!message || !userAddress) {
      return res.status(400).json({
        success: false,
        error: 'message and userAddress are required'
      });
    }

    debugLog(`Recording conversation for agent ${tokenId}`);

    // Verify ownership
    const agentInfo = await inftAgentService.getAgentInfo(tokenId);
    
    if (agentInfo.owner.toLowerCase() !== userAddress.toLowerCase()) {
      return res.status(403).json({
        success: false,
        error: 'User does not own this agent'
      });
    }

    // Record conversation
    const conversationData = {
      userMessage: message,
      timestamp: Date.now(),
      agentName: agentInfo.agentName
    };

    const result = await inftAgentService.recordConversation(tokenId, conversationData);

    debugLog(`Conversation recorded for agent ${agentInfo.agentName}`, {
      tokenId,
      conversationHash: result.conversationHash
    });

    res.status(200).json({
      success: true,
      message: `Conversation recorded for ${agentInfo.agentName}`,
      conversationHash: result.conversationHash,
      txHash: result.txHash,
      agentName: agentInfo.agentName,
      note: 'No fee required for conversations - they are free!'
    });

  } catch (error) {
    console.error('[Agent API] Failed to record conversation:', error);
    debugLog('Conversation recording failed', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/agent/info/:tokenId
 * Get enhanced agent information
 */
router.get('/info/:tokenId', async (req, res) => {
  try {
    const tokenId = parseInt(req.params.tokenId);
    
    if (isNaN(tokenId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid token ID'
      });
    }

    debugLog('Getting enhanced agent info', { tokenId });

    const agentInfo = await inftAgentService.getAgentInfo(tokenId);

    res.status(200).json({
      success: true,
      agent: {
        ...agentInfo,
        isPersonalized: true,
        hasConversations: agentInfo.conversationCount > 0,
        features: {
          personalizedAI: true,
          unlimitedChats: true,
          dreamAnalysis: true,
          evolutionSystem: true,
          decentralizedStorage: true
        }
      }
    });

  } catch (error) {
    console.error('[Agent API] Failed to get agent info:', error);
    debugLog('Agent info retrieval failed', { tokenId: req.params.tokenId, error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/agent/user/:userAddress
 * Check if user has an agent and get basic info
 */
router.get('/user/:userAddress', async (req, res) => {
  try {
    const { userAddress } = req.params;
    
    debugLog('Checking user agent', { userAddress });

    const userAgent = await inftAgentService.getUserAgent(userAddress);

    if (!userAgent.hasAgent) {
      // Include fee info for users without agents
      const feeInfo = await inftAgentService.getMintingFeeInfo();
      
      return res.status(200).json({
        success: true,
        hasAgent: false,
        message: 'User does not have a dream agent yet',
        mintingInfo: {
          fee: feeInfo.mintingFeeEther + ' OG',
          feeUSD: '$' + (parseFloat(feeInfo.mintingFeeEther) * (parseFloat(process.env.OG_PRICE_USD) || 0.1)).toFixed(4),
          treasury: feeInfo.treasury,
          benefits: [
            'Personalized AI companion',
            'Unlimited dream analysis',
            'Agent evolution system',
            'Free conversations forever'
          ]
        }
      });
    }

    // Get detailed agent info
    const agentInfo = await inftAgentService.getAgentInfo(userAgent.tokenId);

    debugLog('User agent found', { 
      userAddress, 
      tokenId: userAgent.tokenId,
      agentName: agentInfo.agentName 
    });

    res.status(200).json({
      success: true,
      hasAgent: true,
      agent: {
        ...agentInfo,
        isPersonalized: true,
        hasConversations: agentInfo.conversationCount > 0,
        ownership: {
          mintingFeePaid: true,
          ownedSince: agentInfo.createdAt,
          freeFeatures: [
            'Unlimited conversations',
            'Dream analysis',
            'Agent evolution',
            'Personality development'
          ]
        }
      }
    });

  } catch (error) {
    console.error('[Agent API] Failed to get user agent:', error);
    debugLog('User agent check failed', { userAddress: req.params.userAddress, error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/agent/stats
 * Get contract statistics including fee and revenue information
 */
router.get('/stats', async (req, res) => {
  try {
    debugLog('Getting contract statistics with fee info');

    const result = await inftAgentService.getContractStats();
    
    if (!result.stats) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to get contract stats'
      });
    }

    const stats = result.stats;
    
    debugLog('Contract statistics with fees retrieved', stats);

    res.status(200).json({
      success: true,
      stats: {
        ...stats,
        supplyPercentage: Math.round((stats.totalAgents / stats.maxAgents) * 100),
        isLimitedEdition: true,
        personalizedAgents: true,
        
        // Enhanced revenue information
        revenue: {
          ...stats.feeSystem,
          averageAgentValue: stats.feeSystem.mintingFeeEther + ' OG',
          totalPotentialRevenue: stats.feeSystem.maxRevenuePotential + ' OG',
          revenuePercentage: stats.totalAgents > 0 ? 
            Math.round((parseFloat(stats.feeSystem.totalFeesEther) / parseFloat(stats.feeSystem.maxRevenuePotential)) * 100) : 0
        }
      }
    });

  } catch (error) {
    console.error('[Agent API] Failed to get contract stats:', error);
    debugLog('Contract stats retrieval failed', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/agent/:tokenId/dream
 * Process a dream through an agent (combines existing dream upload + agent evolution)
 */
router.post('/:tokenId/dream', async (req, res) => {
  try {
    const tokenId = parseInt(req.params.tokenId);
    const { dreamText, userAddress } = req.body;
    
    if (isNaN(tokenId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid token ID'
      });
    }

    if (!dreamText || !userAddress) {
      return res.status(400).json({
        success: false,
        error: 'dreamText and userAddress are required'
      });
    }

    debugLog(`Processing dream for agent ${tokenId}`);

    // Verify ownership
    const agentInfo = await inftAgentService.getAgentInfo(tokenId);
    
    if (agentInfo.owner.toLowerCase() !== userAddress.toLowerCase()) {
      return res.status(403).json({
        success: false,
        error: 'User does not own this agent'
      });
    }

    // Process dream through agent with EVOLUTIONARY MEMORY
    const result = await inftAgentService.processDreamWithEvolution(tokenId, {
      text: dreamText,
      timestamp: Date.now(),
      inputType: 'text'
    });

    debugLog(`Dream processed for ${agentInfo.agentName}`, {
      tokenId,
      evolved: result.agentEvolution.evolved,
      newIntelligence: result.agentEvolution.newIntelligence
    });

    res.status(200).json({
      success: true,
      message: result.agentEvolution.evolved ? 
        `🧠 ${agentInfo.agentName} processed your dream and evolved!` : 
        `${agentInfo.agentName} analyzed your dream with evolutionary insight!`,
      analysis: result.analysis,
      dreamHash: result.dreamHash,
      analysisHash: result.analysisHash,
      agentEvolution: result.agentEvolution,
      evolutionaryData: result.evolutionaryData,
      agentName: agentInfo.agentName,
      cost: result.cost,
      note: 'Dream analysis is free - no additional fees after minting!'
    });

  } catch (error) {
    console.error('[Agent API] Failed to process dream:', error);
    debugLog('Dream processing failed', { tokenId: req.params.tokenId, error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/agent/chat
 * Simple chat interface for agent interaction
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, userAddress } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Simple intent detection
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('create') || lowerMessage.includes('mint')) {
      return res.json({
        success: true,
        response: "I can help you create a dream agent! Use POST /api/agent/create with your wallet address.",
        action: "CREATE_AGENT",
        endpoint: "/api/agent/create"
      });
    }
    
    if (lowerMessage.includes('dream') && userAddress) {
      // Check if user has an agent
      const userAgent = await inftAgentService.getUserAgent(userAddress);
      
      if (!userAgent.hasAgent) {
        return res.json({
          success: true,
          response: "You need to create a dream agent first! Would you like me to create one for you?",
          action: "NEED_AGENT"
        });
      }
      
      return res.json({
        success: true,
        response: `I'm ready to analyze your dreams! You have Agent #${userAgent.tokenId}. Please share your dream text.`,
        action: "RECORD_DREAM",
        agentTokenId: userAgent.tokenId
      });
    }
    
    if (lowerMessage.includes('status') || lowerMessage.includes('info')) {
      const stats = await inftAgentService.getContractStats();
      
      return res.json({
        success: true,
        response: `Dream Agent System Status: ${stats.deployed ? 'Online' : 'Offline'}. Total Agents: ${stats.totalAgents || 0}`,
        action: "STATUS",
        stats: stats
      });
    }
    
    // Default response
    return res.json({
      success: true,
      response: "I'm your Dream Agent assistant! I can help you create agents, analyze dreams, and check status. What would you like to do?",
      action: "CHAT",
      commands: ["create agent", "analyze dream", "check status"]
    });

  } catch (error) {
    console.error('[Agent] Chat error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/agent/:tokenId/history
 * Get agent's dream history and evolutionary patterns
 */
router.get('/:tokenId/history', async (req, res) => {
  try {
    const tokenId = parseInt(req.params.tokenId);
    const limit = parseInt(req.query.limit) || 10;
    
    if (isNaN(tokenId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid token ID'
      });
    }

    // Get agent basic info
    const agentInfo = await inftAgentService.getAgentInfo(tokenId);
    
    // Get dream history
    const dreamHistory = await inftAgentService.getAgentDreamHistory(tokenId, limit);
    
    // Analyze current patterns
    const patterns = await inftAgentService.analyzeEvolutionaryPatterns(dreamHistory, "");
    
    res.status(200).json({
      success: true,
      agent: {
        tokenId: agentInfo.tokenId,
        intelligenceLevel: agentInfo.intelligenceLevel,
        dreamCount: agentInfo.dreamCount,
        evolutionStage: inftAgentService.determineEvolutionStage(agentInfo.intelligenceLevel, agentInfo.dreamCount)
      },
      dreamHistory: dreamHistory,
      evolutionaryPatterns: patterns,
      capabilities: {
        level1: "Basic dream interpretation",
        level2: "Pattern recognition and emotional analysis",
        level3: "Advanced symbolic interpretation",
        level4: "Deep psychological insights and growth guidance",
        level5: "Spiritual guidance and transformational wisdom",
        currentLevel: agentInfo.intelligenceLevel
      }
    });

  } catch (error) {
    console.error('[🧠 Evolution] Failed to get agent history:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router; 