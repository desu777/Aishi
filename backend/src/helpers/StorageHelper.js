const { ethers } = require('ethers');

/**
 * StorageHelper - Pure processing logic for storage operations
 * NO PAYMENTS, NO WALLET - only data preparation for frontend
 */
class StorageHelper {
  constructor() {
    this.debugLog = this.initDebugLog();
  }

  initDebugLog() {
    return (message, data = null) => {
      if (process.env.DREAMSCAPE_TEST === 'true') {
        console.log(`[🔮 STORAGE-HELPER] ${message}`, data || '');
      }
    };
  }

  /**
   * Prepare storage data for minting new agent
   * @param {string} agentName - Agent name 
   * @param {string} userAddress - User wallet address
   * @returns {Promise<{proofs: Array, descriptions: Array, metadata: Object}>}
   */
  async prepareMintData(agentName, userAddress) {
    this.debugLog('Preparing mint data', { agentName, userAddress });

    try {
      // Generate initial data structures
      const initialPersonality = this.generateInitialPersonality(agentName, userAddress);
      const initialPatterns = this.generateInitialPatterns(agentName);
      const initialEmotions = this.generateInitialEmotions(agentName);

      // Prepare file buffers for frontend upload
      const personalityBuffer = Buffer.from(JSON.stringify(initialPersonality, null, 2), 'utf-8');
      const patternsBuffer = Buffer.from(JSON.stringify(initialPatterns, null, 2), 'utf-8');
      const emotionsBuffer = Buffer.from(JSON.stringify(initialEmotions, null, 2), 'utf-8');

      // Calculate expected hashes (for verification)
      const personalityHash = this.calculateBufferHash(personalityBuffer);
      const patternsHash = this.calculateBufferHash(patternsBuffer);
      const emotionsHash = this.calculateBufferHash(emotionsBuffer);

      const descriptions = [
        'agent_intelligence',
        'dream_patterns', 
        'emotional_profile'
      ];

      this.debugLog('Mint data prepared', {
        files: descriptions.length,
        totalSize: personalityBuffer.length + patternsBuffer.length + emotionsBuffer.length,
        hashes: [personalityHash, patternsHash, emotionsHash]
      });

      return {
        files: [
          {
            name: `${agentName}_personality.json`,
            buffer: personalityBuffer,
            description: descriptions[0],
            expectedHash: personalityHash
          },
          {
            name: `${agentName}_patterns.json`,
            buffer: patternsBuffer,
            description: descriptions[1],
            expectedHash: patternsHash
          },
          {
            name: `${agentName}_emotions.json`,
            buffer: emotionsBuffer,
            description: descriptions[2],
            expectedHash: emotionsHash
          }
        ],
        descriptions,
        metadata: {
          agentName,
          userAddress,
          timestamp: Date.now(),
          version: '2.0',
          totalFiles: 3,
          estimatedStorageCost: '~0.0003 OG'
        }
      };

    } catch (error) {
      this.debugLog('Mint data preparation failed', error.message);
      throw new Error(`Failed to prepare mint data: ${error.message}`);
    }
  }

  /**
   * Prepare dream data for storage upload
   * @param {string} dreamText - Dream text content
   * @param {number} tokenId - Agent token ID
   * @param {string} userAddress - User address
   * @returns {Promise<Object>}
   */
  async prepareDreamData(dreamText, tokenId, userAddress) {
    this.debugLog('Preparing dream data', { tokenId, textLength: dreamText.length });

    try {
      // Create dream data structure
      const dreamData = {
        text: dreamText,
        timestamp: Date.now(),
        agentTokenId: tokenId,
        userAddress: userAddress,
        inputType: 'text',
        wordCount: dreamText.split(' ').length,
        version: '2.0'
      };

      // Prepare buffer for upload
      const dreamBuffer = Buffer.from(JSON.stringify(dreamData, null, 2), 'utf-8');
      const dreamHash = this.calculateBufferHash(dreamBuffer);

      this.debugLog('Dream data prepared', {
        size: dreamBuffer.length,
        wordCount: dreamData.wordCount,
        hash: dreamHash
      });

      return {
        file: {
          name: `dream_${tokenId}_${Date.now()}.json`,
          buffer: dreamBuffer,
          expectedHash: dreamHash
        },
        metadata: {
          tokenId,
          timestamp: dreamData.timestamp,
          wordCount: dreamData.wordCount,
          estimatedStorageCost: '~0.0001 OG'
        }
      };

    } catch (error) {
      this.debugLog('Dream data preparation failed', error.message);
      throw new Error(`Failed to prepare dream data: ${error.message}`);
    }
  }

  /**
   * Prepare analysis data for storage upload
   * @param {string} analysis - AI analysis content
   * @param {string} dreamHash - Associated dream hash
   * @param {number} tokenId - Agent token ID
   * @returns {Promise<Object>}
   */
  async prepareAnalysisData(analysis, dreamHash, tokenId) {
    this.debugLog('Preparing analysis data', { tokenId, analysisLength: analysis.length });

    try {
      // Create analysis data structure
      const analysisData = {
        analysis: analysis,
        dreamHash: dreamHash,
        timestamp: Date.now(),
        agentTokenId: tokenId,
        type: 'ai_analysis',
        version: '2.0'
      };

      // Prepare buffer for upload
      const analysisBuffer = Buffer.from(JSON.stringify(analysisData, null, 2), 'utf-8');
      const analysisHash = this.calculateBufferHash(analysisBuffer);

      this.debugLog('Analysis data prepared', {
        size: analysisBuffer.length,
        hash: analysisHash
      });

      return {
        file: {
          name: `analysis_${tokenId}_${Date.now()}.json`,
          buffer: analysisBuffer,
          expectedHash: analysisHash
        },
        metadata: {
          tokenId,
          dreamHash,
          timestamp: analysisData.timestamp,
          estimatedStorageCost: '~0.0001 OG'
        }
      };

    } catch (error) {
      this.debugLog('Analysis data preparation failed', error.message);
      throw new Error(`Failed to prepare analysis data: ${error.message}`);
    }
  }

  /**
   * Prepare conversation data for storage upload
   * @param {Object} conversationData - Conversation details
   * @param {number} tokenId - Agent token ID
   * @returns {Promise<Object>}
   */
  async prepareConversationData(conversationData, tokenId) {
    this.debugLog('Preparing conversation data', { tokenId });

    try {
      // Create conversation data structure
      const conversation = {
        tokenId,
        timestamp: Date.now(),
        conversation: conversationData,
        type: 'agent_conversation',
        version: '2.0'
      };

      // Prepare buffer for upload
      const conversationBuffer = Buffer.from(JSON.stringify(conversation, null, 2), 'utf-8');
      const conversationHash = this.calculateBufferHash(conversationBuffer);

      this.debugLog('Conversation data prepared', {
        size: conversationBuffer.length,
        hash: conversationHash
      });

      return {
        file: {
          name: `conversation_${tokenId}_${Date.now()}.json`,
          buffer: conversationBuffer,
          expectedHash: conversationHash
        },
        metadata: {
          tokenId,
          timestamp: conversation.timestamp,
          estimatedStorageCost: '~0.0001 OG'
        }
      };

    } catch (error) {
      this.debugLog('Conversation data preparation failed', error.message);
      throw new Error(`Failed to prepare conversation data: ${error.message}`);
    }
  }

  /**
   * Generate initial personality data for new agent
   * @param {string} agentName - Agent name
   * @param {string} userAddress - User address
   * @returns {Object}
   */
  generateInitialPersonality(agentName, userAddress) {
    return {
      userId: userAddress,
      agentName: agentName,
      createdAt: Date.now(),
      dreamCount: 0,
      conversationCount: 0,
      patterns: {},
      emotionalProfile: {
        dominant: [],
        triggers: [],
        improvements: []
      },
      intelligenceLevel: 1,
      personalizedPrompts: {
        basePrompt: `You are ${agentName}, a personalized AI dream analysis companion. You focus on personal growth and emotional understanding tailored to your owner's unique patterns.`,
        contextMemory: []
      },
      traits: {
        analytical: 0,
        empathetic: 0,
        supportive: 50,
        insightful: 25
      },
      mintingInfo: {
        timestamp: Date.now(),
        version: '2.0'
      },
      version: "2.0"
    };
  }

  /**
   * Generate initial patterns data for new agent
   * @param {string} agentName - Agent name
   * @returns {Object}
   */
  generateInitialPatterns(agentName) {
    return {
      agentName: agentName,
      flyingDreams: 0,
      stressIndicators: 0,
      lucidDreamTriggers: 0,
      symbolicElements: {},
      emotionalTrends: [],
      conversationTopics: [],
      createdAt: Date.now(),
      version: '2.0'
    };
  }

  /**
   * Generate initial emotions data for new agent
   * @param {string} agentName - Agent name
   * @returns {Object}
   */
  generateInitialEmotions(agentName) {
    return {
      agentName: agentName,
      dominantEmotions: [],
      fearPatterns: [],
      joyTriggers: [],
      stressFactors: [],
      healingProgress: {},
      conversationEmotions: [],
      createdAt: Date.now(),
      version: '2.0'
    };
  }

  /**
   * Calculate hash for buffer (deterministic)
   * @param {Buffer} buffer - Data buffer
   * @returns {string}
   */
  calculateBufferHash(buffer) {
    return ethers.keccak256(buffer);
  }

  /**
   * Convert storage hashes to contract proofs format
   * @param {Array<string>} hashes - Storage hashes
   * @returns {Array}
   */
  convertHashesToProofs(hashes) {
    return hashes.map(hash => {
      const cleanHash = hash.startsWith('0x') ? hash.slice(2) : hash;
      const paddedHash = '0x' + cleanHash.padEnd(64, '0');
      return ethers.getBytes(paddedHash);
    });
  }

  /**
   * Estimate total storage costs for files
   * @param {Array} files - Files to upload
   * @returns {Object}
   */
  estimateStorageCosts(files) {
    const totalSize = files.reduce((sum, file) => sum + file.buffer.length, 0);
    const baseCostPerKB = 0.000001; // ~0.000001 OG per KB
    const estimatedCost = (totalSize / 1024) * baseCostPerKB;

    return {
      totalSize,
      filesCount: files.length,
      estimatedCostOG: estimatedCost.toFixed(6),
      estimatedCostUSD: (estimatedCost * (parseFloat(process.env.OG_PRICE_USD) || 0.1)).toFixed(8)
    };
  }
}

module.exports = StorageHelper; 