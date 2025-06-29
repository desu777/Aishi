const { ethers } = require('ethers');
const StorageService = require('./storageService');
const ComputeService = require('./computeService');

// ABI for DreamAgentNFT (simplified for key functions)
const DREAM_AGENT_NFT_ABI = [
  "function mint(bytes[] calldata proofs, string[] calldata descriptions, address to) external payable returns (uint256 tokenId)",
  "function update(uint256 tokenId, bytes[] calldata proofs) external",
  "function transfer(address to, uint256 tokenId, bytes[] calldata proofs) external",
  "function clone(address to, uint256 tokenId, bytes[] calldata proofs) external payable returns (uint256 newTokenId)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function getAgentInfo(uint256 tokenId) external view returns (address owner, uint256 intelligenceLevel, uint256 dreamCount, uint256 lastUpdated, string[] memory dataDescriptions)",
  "function totalAgents() external view returns (uint256)",
  "event DreamProcessed(uint256 indexed tokenId, bytes32 dreamHash, uint256 newIntelligenceLevel)",
  "event AgentEvolved(uint256 indexed tokenId, uint256 oldLevel, uint256 newLevel)"
];

class INFTAgentService {
  constructor() {
    this.storageService = new StorageService();
    this.computeService = new ComputeService();
    
    // Initialize contract connection
    this.provider = new ethers.JsonRpcProvider("https://evmrpc-testnet.0g.ai");
    this.signer = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY, this.provider);
    
    if (!process.env.DREAM_AGENT_NFT_ADDRESS) {
      console.warn('[INFTAgentService] Warning: DREAM_AGENT_NFT_ADDRESS not set. Deploy contracts first.');
      this.contract = null;
    } else {
      this.contract = new ethers.Contract(
        process.env.DREAM_AGENT_NFT_ADDRESS,
        DREAM_AGENT_NFT_ABI,
        this.signer
      );
      console.log('[INFTAgentService] Connected to DreamAgentNFT at:', process.env.DREAM_AGENT_NFT_ADDRESS);
    }
  }

  /**
   * Create a new dream agent for a user
   * @param {string} userAddress - User's wallet address
   * @returns {Promise<{tokenId: number, personalityHash: string}>}
   */
  async createDreamAgent(userAddress) {
    const DEBUG = process.env.DREAMSCAPE_TEST === 'true';
    
    if (!this.contract) {
      throw new Error('DreamAgentNFT contract not deployed. Run: npm run deploy');
    }

    try {
      if (DEBUG) console.log('[INFTAgentService] Creating dream agent for:', userAddress);

      // 1. Create initial agent personality
      const initialPersonality = {
        userId: userAddress,
        createdAt: Date.now(),
        dreamCount: 0,
        patterns: {},
        emotionalProfile: {
          dominant: [],
          triggers: [],
          improvements: []
        },
        intelligenceLevel: 1,
        personalizedPrompts: {
          basePrompt: "Analyze this dream with a focus on personal growth and emotional understanding.",
          contextMemory: []
        },
        version: "1.0"
      };

      if (DEBUG) console.log('[INFTAgentService] Initial personality created');

      // 2. Upload personality to 0G Storage
      const personalityUpload = await this.storageService.uploadJSON(initialPersonality);
      if (DEBUG) console.log('[INFTAgentService] Personality uploaded to 0G Storage:', personalityUpload.rootHash);

      // 3. Create initial empty patterns data
      const initialPatterns = {
        flyingDreams: 0,
        stressIndicators: 0,
        lucidDreamTriggers: 0,
        symbolicElements: {},
        emotionalTrends: []
      };

      const patternsUpload = await this.storageService.uploadJSON(initialPatterns);
      if (DEBUG) console.log('[INFTAgentService] Patterns uploaded to 0G Storage:', patternsUpload.rootHash);

      // 4. Create initial emotional profile
      const initialEmotions = {
        dominantEmotions: [],
        fearPatterns: [],
        joyTriggers: [],
        stressFactors: [],
        healingProgress: {}
      };

      const emotionsUpload = await this.storageService.uploadJSON(initialEmotions);
      if (DEBUG) console.log('[INFTAgentService] Emotions uploaded to 0G Storage:', emotionsUpload.rootHash);

      // 5. Prepare mint data
      const proofs = [
        personalityUpload.rootHash,  // Personality data
        patternsUpload.rootHash,     // Dream patterns
        emotionsUpload.rootHash      // Emotional profile
      ].map(hash => hash.startsWith('0x') ? hash.slice(2) : hash)
       .map(hash => '0x' + hash.padEnd(64, '0'))
       .map(hash => ethers.getBytes(hash));

      const descriptions = [
        "agent_intelligence",
        "dream_patterns", 
        "emotional_profile"
      ];

      if (DEBUG) console.log('[INFTAgentService] Minting agent with proofs:', proofs.length);

      // 6. Mint iNFT
      const tx = await this.contract.mint(proofs, descriptions, userAddress);
      const receipt = await tx.wait();
      
      // Find Minted event to get tokenId
      const mintedEvent = receipt.logs.find(log => {
        try {
          const parsed = this.contract.interface.parseLog(log);
          return parsed && parsed.name === 'Minted';
        } catch (e) {
          return false;
        }
      });

      if (!mintedEvent) {
        throw new Error('Minted event not found in transaction receipt');
      }

      const parsedEvent = this.contract.interface.parseLog(mintedEvent);
      const tokenId = parsedEvent.args._tokenId.toString();

      if (DEBUG) console.log('[INFTAgentService] Agent minted with tokenId:', tokenId);

      return {
        tokenId: parseInt(tokenId),
        personalityHash: personalityUpload.rootHash,
        patternsHash: patternsUpload.rootHash,
        emotionsHash: emotionsUpload.rootHash,
        txHash: tx.hash
      };

    } catch (error) {
      console.error('[INFTAgentService] Failed to create dream agent:', error);
      throw new Error(`Failed to create dream agent: ${error.message}`);
    }
  }

  /**
   * Process a dream for an agent (existing dream upload + agent evolution)
   * @param {number} tokenId - Agent token ID
   * @param {Object} dreamData - Dream data from existing upload
   * @returns {Promise<Object>}
   */
  async processDreamForAgent(tokenId, dreamData) {
    const DEBUG = process.env.DREAMSCAPE_TEST === 'true';

    if (!this.contract) {
      throw new Error('DreamAgentNFT contract not deployed. Run: npm run deploy');
    }

    try {
      if (DEBUG) console.log(`[INFTAgentService] Processing dream for agent ${tokenId}`);

      // 1. Get current agent info
      const agentInfo = await this.contract.getAgentInfo(tokenId);
      const currentDreamCount = parseInt(agentInfo.dreamCount.toString());
      const currentIntelligence = parseInt(agentInfo.intelligenceLevel.toString());

      if (DEBUG) console.log(`[INFTAgentService] Agent current state: ${currentDreamCount} dreams, level ${currentIntelligence}`);

      // 2. Store dream text (from existing dreamData)
      const dreamUpload = await this.storageService.uploadJSON({
        text: dreamData.text,
        timestamp: dreamData.timestamp || Date.now(),
        agentTokenId: tokenId,
        inputType: dreamData.inputType || 'text'
      });

      if (DEBUG) console.log('[INFTAgentService] Dream uploaded:', dreamUpload.rootHash);

      // 3. Build personalized analysis prompt based on agent history
      const personalizedPrompt = this.buildPersonalizedPrompt(dreamData.text, currentDreamCount, currentIntelligence);

      // 4. Get AI analysis using existing compute service
      if (DEBUG) console.log('[INFTAgentService] Getting AI analysis...');
      const analysis = await this.computeService.sendSimpleQuery(personalizedPrompt);

      // 5. Store analysis
      const analysisUpload = await this.storageService.uploadJSON({
        dreamHash: dreamUpload.rootHash,
        analysis: analysis.response,
        agentTokenId: tokenId,
        intelligenceLevel: currentIntelligence,
        dreamCount: currentDreamCount + 1,
        timestamp: Date.now()
      });

      // 6. Update agent with new data (this will trigger evolution)
      const updateProofs = [
        dreamUpload.rootHash,      // Updated intelligence with new dream
        dreamUpload.rootHash,      // Updated patterns
        analysisUpload.rootHash    // Updated emotional profile
      ].map(hash => hash.startsWith('0x') ? hash.slice(2) : hash)
       .map(hash => '0x' + hash.padEnd(64, '0'))
       .map(hash => ethers.getBytes(hash));

      if (DEBUG) console.log('[INFTAgentService] Updating agent on-chain...');
      const updateTx = await this.contract.update(tokenId, updateProofs);
      await updateTx.wait();

      // 7. Get updated agent info
      const updatedAgentInfo = await this.contract.getAgentInfo(tokenId);
      const newIntelligence = parseInt(updatedAgentInfo.intelligenceLevel.toString());
      const newDreamCount = parseInt(updatedAgentInfo.dreamCount.toString());

      const evolved = newIntelligence > currentIntelligence;

      if (DEBUG && evolved) {
        console.log(`[INFTAgentService] 🧠 Agent evolved! ${currentIntelligence} → ${newIntelligence}`);
      }

      return {
        success: true,
        analysis: analysis.response,
        dreamHash: dreamUpload.rootHash,
        analysisHash: analysisUpload.rootHash,
        agentEvolution: {
          tokenId: tokenId,
          oldIntelligence: currentIntelligence,
          newIntelligence: newIntelligence,
          oldDreamCount: currentDreamCount,
          newDreamCount: newDreamCount,
          evolved: evolved
        },
        cost: analysis.cost || 0
      };

    } catch (error) {
      console.error('[INFTAgentService] Failed to process dream for agent:', error);
      throw new Error(`Failed to process dream for agent: ${error.message}`);
    }
  }

  /**
   * Build personalized prompt based on agent's history
   * @param {string} dreamText - The dream text
   * @param {number} dreamCount - Number of dreams processed
   * @param {number} intelligenceLevel - Agent's intelligence level
   * @returns {string}
   */
  buildPersonalizedPrompt(dreamText, dreamCount, intelligenceLevel) {
    let prompt = `Analyze this dream with deep psychological insight:\n\n"${dreamText}"\n\n`;

    if (dreamCount === 0) {
      prompt += "This is the user's first dream analysis. Provide encouraging insights and establish a baseline understanding of their psyche.";
    } else if (dreamCount < 5) {
      prompt += `This is dream #${dreamCount + 1} for this user. Look for emerging patterns and provide insights that build on their growing dream journal.`;
    } else {
      prompt += `This user has recorded ${dreamCount} dreams (Intelligence Level ${intelligenceLevel}). Provide sophisticated analysis that builds on their established patterns and psychological growth.`;
    }

    prompt += "\n\nFocus on: emotional themes, symbolic elements, personal growth insights, and actionable recommendations.";

    return prompt;
  }

  /**
   * Get agent information
   * @param {number} tokenId - Agent token ID
   * @returns {Promise<Object>}
   */
  async getAgentInfo(tokenId) {
    if (!this.contract) {
      throw new Error('DreamAgentNFT contract not deployed');
    }

    try {
      const [owner, intelligenceLevel, dreamCount, lastUpdated, dataDescriptions] = 
        await this.contract.getAgentInfo(tokenId);

      return {
        tokenId: tokenId,
        owner: owner,
        intelligenceLevel: parseInt(intelligenceLevel.toString()),
        dreamCount: parseInt(dreamCount.toString()),
        lastUpdated: parseInt(lastUpdated.toString()),
        dataDescriptions: dataDescriptions,
        isActive: owner !== ethers.ZeroAddress
      };
    } catch (error) {
      console.error('[INFTAgentService] Failed to get agent info:', error);
      throw new Error(`Failed to get agent info: ${error.message}`);
    }
  }

  /**
   * Check if user owns an agent
   * @param {string} userAddress - User's wallet address
   * @returns {Promise<{hasAgent: boolean, tokenId?: number}>}
   */
  async getUserAgent(userAddress) {
    if (!this.contract) {
      return { hasAgent: false };
    }

    try {
      // Simple approach: check agents 1-100 (for testing)
      // In production, you'd maintain a mapping or emit events to track this
      const totalAgents = await this.contract.totalAgents();
      const maxCheck = Math.min(parseInt(totalAgents.toString()), 100);

      for (let tokenId = 1; tokenId <= maxCheck; tokenId++) {
        try {
          const owner = await this.contract.ownerOf(tokenId);
          if (owner.toLowerCase() === userAddress.toLowerCase()) {
            return { hasAgent: true, tokenId: tokenId };
          }
        } catch (e) {
          // Token doesn't exist, continue
          continue;
        }
      }

      return { hasAgent: false };
    } catch (error) {
      console.error('[INFTAgentService] Failed to check user agent:', error);
      return { hasAgent: false };
    }
  }

  /**
   * Get contract statistics
   * @returns {Promise<Object>}
   */
  async getContractStats() {
    if (!this.contract) {
      return { deployed: false };
    }

    try {
      const totalAgents = await this.contract.totalAgents();
      
      return {
        deployed: true,
        contractAddress: this.contract.target,
        totalAgents: parseInt(totalAgents.toString()),
        network: "0G Galileo Testnet"
      };
    } catch (error) {
      console.error('[INFTAgentService] Failed to get contract stats:', error);
      return { deployed: false, error: error.message };
    }
  }

  // =====================================================
  // 🧠 EVOLUTIONARY MEMORY FUNCTIONS - VERSION 2.0
  // =====================================================

  /**
   * Retrieve agent's complete dream history for contextual analysis
   * @param {number} tokenId - Agent token ID
   * @param {number} limit - Maximum number of recent dreams to retrieve
   * @returns {Promise<Array>}
   */
  async getAgentDreamHistory(tokenId, limit = 5) {
    const DEBUG = process.env.DREAMSCAPE_TEST === 'true';
    
    try {
      if (DEBUG) console.log(`[🧠 Evolution] Retrieving dream history for agent ${tokenId}, limit: ${limit}`);

      // Get agent info to find historical data
      const agentInfo = await this.contract.getAgentInfo(tokenId);
      const dreamCount = parseInt(agentInfo.dreamCount.toString());

      if (dreamCount === 0) {
        return [];
      }

      // In a real implementation, you'd track dream hashes and retrieve them
      // For now, we'll simulate retrieving the last few dreams
      const dreamHistory = [];
      
      // This is a simplified approach - in production you'd store dream hashes 
      // in agent metadata and retrieve actual dream content
      for (let i = Math.max(0, dreamCount - limit); i < dreamCount; i++) {
        dreamHistory.push({
          dreamNumber: i + 1,
          summary: `Previous dream analysis #${i + 1}`,
          emotionalTone: this.generateMockEmotionalTone(),
          symbols: this.generateMockSymbols(),
          timestamp: Date.now() - (dreamCount - i) * 24 * 60 * 60 * 1000 // Days ago
        });
      }

      if (DEBUG) console.log(`[🧠 Evolution] Retrieved ${dreamHistory.length} historical dreams`);
      return dreamHistory;

    } catch (error) {
      console.error('[🧠 Evolution] Failed to get dream history:', error);
      return [];
    }
  }

  /**
   * Analyze patterns from dream history and update agent intelligence
   * @param {Array} dreamHistory - Array of previous dreams
   * @param {string} currentDreamText - Current dream to analyze
   * @returns {Object}
   */
  async analyzeEvolutionaryPatterns(dreamHistory, currentDreamText) {
    const DEBUG = process.env.DREAMSCAPE_TEST === 'true';

    try {
      if (DEBUG) console.log('[🧠 Evolution] Analyzing evolutionary patterns...');

      const patterns = {
        recurringSymbols: this.findRecurringSymbols(dreamHistory, currentDreamText),
        emotionalProgression: this.analyzeEmotionalProgression(dreamHistory),
        thematicEvolution: this.analyzeThematicEvolution(dreamHistory, currentDreamText),
        growthIndicators: this.identifyGrowthIndicators(dreamHistory),
        personalInsights: this.generatePersonalInsights(dreamHistory, currentDreamText)
      };

      if (DEBUG) console.log('[🧠 Evolution] Pattern analysis complete:', patterns);
      return patterns;

    } catch (error) {
      console.error('[🧠 Evolution] Pattern analysis failed:', error);
      return { error: error.message };
    }
  }

  /**
   * Build enhanced personalized prompt with historical context
   * @param {string} dreamText - Current dream text
   * @param {number} dreamCount - Total dreams processed
   * @param {number} intelligenceLevel - Agent intelligence level
   * @param {Array} dreamHistory - Previous dreams
   * @returns {Promise<string>}
   */
  async buildEvolutionaryPrompt(dreamText, dreamCount, intelligenceLevel, dreamHistory) {
    const DEBUG = process.env.DREAMSCAPE_TEST === 'true';

    try {
      if (DEBUG) console.log('[🧠 Evolution] Building evolutionary prompt with historical context...');

      let prompt = `🧠 DREAM AGENT ANALYSIS - LEVEL ${intelligenceLevel} INTELLIGENCE\n\n`;

      // Add agent personality based on evolution level
      if (intelligenceLevel >= 5) {
        prompt += `As your trusted Dream Guide with Level ${intelligenceLevel} intelligence, I've analyzed ${dreamCount} of your dreams and learned your unique patterns.\n\n`;
      } else if (intelligenceLevel >= 3) {
        prompt += `As your developing Dream Analyst with Level ${intelligenceLevel} understanding, I'm beginning to see patterns in your ${dreamCount} dreams.\n\n`;
      } else {
        prompt += `As your learning Dream Assistant (Level ${intelligenceLevel}), I'm studying your dreams to better understand you.\n\n`;
      }

      // Add historical context if available
      if (dreamHistory && dreamHistory.length > 0) {
        prompt += `📚 CONTEXTUAL MEMORY:\n`;
        
        // Analyze patterns from history
        const patterns = await this.analyzeEvolutionaryPatterns(dreamHistory, dreamText);
        
        if (patterns.recurringSymbols && patterns.recurringSymbols.length > 0) {
          prompt += `- I notice you frequently dream about: ${patterns.recurringSymbols.join(', ')}\n`;
        }
        
        if (patterns.emotionalProgression) {
          prompt += `- Your emotional journey shows: ${patterns.emotionalProgression}\n`;
        }
        
        if (patterns.growthIndicators && patterns.growthIndicators.length > 0) {
          prompt += `- Growth areas I've identified: ${patterns.growthIndicators.join(', ')}\n`;
        }
        
        prompt += `\n`;
      }

      // Add current dream
      prompt += `🌙 CURRENT DREAM TO ANALYZE:\n"${dreamText}"\n\n`;

      // Add intelligent analysis instructions based on level
      prompt += `📊 ANALYSIS FRAMEWORK:\n`;
      
      if (intelligenceLevel >= 4) {
        prompt += `Provide sophisticated psychological analysis including:\n`;
        prompt += `1. Connection to your established patterns and symbols\n`;
        prompt += `2. Emotional evolution since previous dreams\n`;
        prompt += `3. Deep symbolic interpretation based on your personal mythology\n`;
        prompt += `4. Growth-oriented insights and actionable recommendations\n`;
        prompt += `5. Spiritual and transformational guidance\n`;
      } else if (intelligenceLevel >= 2) {
        prompt += `Provide analytical insights including:\n`;
        prompt += `1. Symbolic elements and their personal meaning\n`;
        prompt += `2. Emotional themes and patterns\n`;
        prompt += `3. Personal growth opportunities\n`;
        prompt += `4. Practical recommendations\n`;
      } else {
        prompt += `Provide encouraging analysis including:\n`;
        prompt += `1. Basic symbolic interpretation\n`;
        prompt += `2. Emotional support and validation\n`;
        prompt += `3. Simple growth insights\n`;
      }

      if (DEBUG) console.log('[🧠 Evolution] Evolutionary prompt generated with', dreamHistory?.length || 0, 'historical dreams');
      
      return prompt;

    } catch (error) {
      console.error('[🧠 Evolution] Failed to build evolutionary prompt:', error);
      return this.buildPersonalizedPrompt(dreamText, dreamCount, intelligenceLevel); // Fallback
    }
  }

  /**
   * Process dream with full evolutionary context and memory
   * @param {number} tokenId - Agent token ID
   * @param {Object} dreamData - Dream data
   * @returns {Promise<Object>}
   */
  async processDreamWithEvolution(tokenId, dreamData) {
    const DEBUG = process.env.DREAMSCAPE_TEST === 'true';

    if (!this.contract) {
      throw new Error('DreamAgentNFT contract not deployed. Run: npm run deploy');
    }

    try {
      if (DEBUG) console.log(`[🧠 Evolution] Processing dream with full evolutionary context for agent ${tokenId}`);

      // 1. Get current agent state
      const agentInfo = await this.contract.getAgentInfo(tokenId);
      const currentDreamCount = parseInt(agentInfo.dreamCount.toString());
      const currentIntelligence = parseInt(agentInfo.intelligenceLevel.toString());

      if (DEBUG) console.log(`[🧠 Evolution] Agent state: ${currentDreamCount} dreams, level ${currentIntelligence} intelligence`);

      // 2. Retrieve dream history for context
      const dreamHistory = await this.getAgentDreamHistory(tokenId, Math.min(currentIntelligence + 2, 10));

      // 3. Store current dream
      const dreamUpload = await this.storageService.uploadJSON({
        text: dreamData.text,
        timestamp: dreamData.timestamp || Date.now(),
        agentTokenId: tokenId,
        dreamNumber: currentDreamCount + 1,
        inputType: dreamData.inputType || 'text',
        intelligenceLevelAtTime: currentIntelligence
      });

      if (DEBUG) console.log('[🧠 Evolution] Dream stored:', dreamUpload.rootHash);

      // 4. Build evolutionary prompt with full context
      const evolutionaryPrompt = await this.buildEvolutionaryPrompt(
        dreamData.text, 
        currentDreamCount, 
        currentIntelligence, 
        dreamHistory
      );

      // 5. Get enhanced AI analysis
      if (DEBUG) console.log('[🧠 Evolution] Getting enhanced AI analysis with historical context...');
      const analysis = await this.computeService.sendSimpleQuery(evolutionaryPrompt);

      // 6. Analyze evolutionary patterns
      const evolutionaryPatterns = await this.analyzeEvolutionaryPatterns(dreamHistory, dreamData.text);

      // 7. Store comprehensive analysis with evolution data
      const analysisUpload = await this.storageService.uploadJSON({
        dreamHash: dreamUpload.rootHash,
        analysis: analysis.response,
        evolutionaryPatterns: evolutionaryPatterns,
        agentTokenId: tokenId,
        intelligenceLevel: currentIntelligence,
        dreamCount: currentDreamCount + 1,
        historicalContext: dreamHistory.length,
        evolutionStage: this.determineEvolutionStage(currentIntelligence, currentDreamCount + 1),
        timestamp: Date.now()
      });

      // 8. Update agent on-chain
      const updateProofs = [
        dreamUpload.rootHash,
        analysisUpload.rootHash,
        analysisUpload.rootHash
      ].map(hash => hash.startsWith('0x') ? hash.slice(2) : hash)
       .map(hash => '0x' + hash.padEnd(64, '0'))
       .map(hash => ethers.getBytes(hash));

      if (DEBUG) console.log('[🧠 Evolution] Updating agent on-chain with evolutionary data...');
      const updateTx = await this.contract.update(tokenId, updateProofs);
      await updateTx.wait();

      // 9. Check for evolution
      const updatedAgentInfo = await this.contract.getAgentInfo(tokenId);
      const newIntelligence = parseInt(updatedAgentInfo.intelligenceLevel.toString());
      const newDreamCount = parseInt(updatedAgentInfo.dreamCount.toString());
      const evolved = newIntelligence > currentIntelligence;

      if (DEBUG && evolved) {
        console.log(`[🧠 Evolution] 🎉 AGENT EVOLVED! ${currentIntelligence} → ${newIntelligence}`);
        console.log(`[🧠 Evolution] New capabilities unlocked at Level ${newIntelligence}!`);
      }

      return {
        success: true,
        analysis: analysis.response,
        dreamHash: dreamUpload.rootHash,
        analysisHash: analysisUpload.rootHash,
        evolutionaryData: {
          patterns: evolutionaryPatterns,
          historicalContext: dreamHistory.length,
          evolutionStage: this.determineEvolutionStage(newIntelligence, newDreamCount)
        },
        agentEvolution: {
          tokenId: tokenId,
          oldIntelligence: currentIntelligence,
          newIntelligence: newIntelligence,
          oldDreamCount: currentDreamCount,
          newDreamCount: newDreamCount,
          evolved: evolved,
          evolutionMessage: evolved ? `🧠 Your Dream Agent evolved to Level ${newIntelligence}! New analytical capabilities unlocked.` : null
        },
        cost: analysis.cost || 0
      };

    } catch (error) {
      console.error('[🧠 Evolution] Failed to process dream with evolution:', error);
      throw new Error(`Failed to process evolutionary dream: ${error.message}`);
    }
  }

  // =====================================================
  // 🔧 HELPER FUNCTIONS FOR EVOLUTIONARY ANALYSIS
  // =====================================================

  findRecurringSymbols(dreamHistory, currentDream) {
    // Simplified symbol detection - in production you'd use NLP
    const commonSymbols = ['water', 'flying', 'animal', 'house', 'car', 'people', 'dark', 'light', 'falling', 'chase'];
    const recurring = [];
    
    for (const symbol of commonSymbols) {
      const historyCount = dreamHistory.filter(d => d.summary?.toLowerCase().includes(symbol)).length;
      const currentHas = currentDream.toLowerCase().includes(symbol);
      
      if (historyCount >= 2 || (historyCount >= 1 && currentHas)) {
        recurring.push(symbol);
      }
    }
    
    return recurring;
  }

  analyzeEmotionalProgression(dreamHistory) {
    if (!dreamHistory || dreamHistory.length === 0) return "Establishing emotional baseline";
    
    const recentTone = dreamHistory[dreamHistory.length - 1]?.emotionalTone || "neutral";
    return `Recent emotional progression trending toward ${recentTone}`;
  }

  analyzeThematicEvolution(dreamHistory, currentDream) {
    // Simplified thematic analysis
    return {
      consistency: dreamHistory.length > 2 ? "moderate" : "establishing",
      newThemes: currentDream.length > 100 ? ["detailed_narrative"] : ["concise_imagery"],
      evolution: "developing"
    };
  }

  identifyGrowthIndicators(dreamHistory) {
    const indicators = [];
    
    if (dreamHistory.length >= 3) {
      indicators.push("consistent_dream_recall");
    }
    
    if (dreamHistory.length >= 5) {
      indicators.push("pattern_recognition");
    }
    
    return indicators;
  }

  generatePersonalInsights(dreamHistory, currentDream) {
    return {
      personalGrowth: dreamHistory.length > 0 ? "Building self-awareness through dream analysis" : "Beginning dream journey",
      uniqueElements: "Developing personal dream language",
      recommendations: "Continue regular dream journaling for deeper insights"
    };
  }

  determineEvolutionStage(intelligenceLevel, dreamCount) {
    if (intelligenceLevel >= 5) return "Advanced Guide";
    if (intelligenceLevel >= 3) return "Developing Analyst";
    if (intelligenceLevel >= 2) return "Learning Assistant";
    return "Novice Helper";
  }

  generateMockEmotionalTone() {
    const tones = ["peaceful", "anxious", "curious", "joyful", "reflective", "concerned"];
    return tones[Math.floor(Math.random() * tones.length)];
  }

  generateMockSymbols() {
    const symbols = ["water", "flying", "house", "animals", "people", "journey"];
    return symbols.slice(0, Math.floor(Math.random() * 3) + 1);
  }
}

module.exports = INFTAgentService; 