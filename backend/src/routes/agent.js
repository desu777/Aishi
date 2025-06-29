const express = require('express');
const INFTAgentService = require('../services/inftAgentService');

const router = express.Router();

// Initialize iNFT Agent Service
const inftAgentService = new INFTAgentService();

/**
 * POST /api/agent/create
 * Create a new dream agent for a user
 */
router.post('/create', async (req, res) => {
  const DEBUG = process.env.DREAMSCAPE_TEST === 'true';
  
  try {
    const { userAddress } = req.body;
    
    if (!userAddress) {
      return res.status(400).json({
        success: false,
        error: 'userAddress is required'
      });
    }

    if (DEBUG) console.log(`[Agent] Creating agent for: ${userAddress}`);

    // Check if user already has an agent
    const existingAgent = await inftAgentService.getUserAgent(userAddress);
    
    if (existingAgent.hasAgent) {
      return res.status(400).json({
        success: false,
        error: 'User already has a dream agent',
        agentTokenId: existingAgent.tokenId
      });
    }

    // Create new agent
    const result = await inftAgentService.createDreamAgent(userAddress);

    if (DEBUG) console.log(`[Agent] Agent created successfully: tokenId ${result.tokenId}`);

    res.status(200).json({
      success: true,
      message: 'Dream agent created successfully!',
      agentTokenId: result.tokenId,
      agentData: {
        personalityHash: result.personalityHash,
        patternsHash: result.patternsHash,
        emotionsHash: result.emotionsHash,
        txHash: result.txHash
      }
    });

  } catch (error) {
    console.error('[Agent] Failed to create agent:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/agent/info/:tokenId
 * Get agent information
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

    const agentInfo = await inftAgentService.getAgentInfo(tokenId);

    res.status(200).json({
      success: true,
      agent: agentInfo
    });

  } catch (error) {
    console.error('[Agent] Failed to get agent info:', error);
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
    
    const userAgent = await inftAgentService.getUserAgent(userAddress);

    if (!userAgent.hasAgent) {
      return res.status(200).json({
        success: true,
        hasAgent: false,
        message: 'User does not have a dream agent yet'
      });
    }

    // Get detailed agent info
    const agentInfo = await inftAgentService.getAgentInfo(userAgent.tokenId);

    res.status(200).json({
      success: true,
      hasAgent: true,
      agent: agentInfo
    });

  } catch (error) {
    console.error('[Agent] Failed to get user agent:', error);
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
  const DEBUG = process.env.DREAMSCAPE_TEST === 'true';
  
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

    if (DEBUG) console.log(`[Agent] Processing dream for agent ${tokenId}`);

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

    if (DEBUG) {
      console.log(`[🧠 Evolution] Dream processed successfully for agent ${tokenId}`);
      console.log(`[🧠 Evolution] Historical context: ${result.evolutionaryData.historicalContext} dreams`);
      if (result.agentEvolution.evolved) {
        console.log(`[🧠 Evolution] 🎉 Agent evolved: Level ${result.agentEvolution.oldIntelligence} → ${result.agentEvolution.newIntelligence}`);
      }
    }

    res.status(200).json({
      success: true,
      message: result.agentEvolution.evolved ? 
        '🧠 Dream processed with agent evolution!' : 
        'Dream processed with evolutionary analysis!',
      analysis: result.analysis,
      dreamHash: result.dreamHash,
      analysisHash: result.analysisHash,
      agentEvolution: result.agentEvolution,
      evolutionaryData: result.evolutionaryData,
      cost: result.cost
    });

  } catch (error) {
    console.error('[Agent] Failed to process dream:', error);
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

/**
 * GET /api/agent/stats
 * Get contract and system statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await inftAgentService.getContractStats();
    
    res.status(200).json({
      success: true,
      stats: stats
    });

  } catch (error) {
    console.error('[Agent] Failed to get stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router; 