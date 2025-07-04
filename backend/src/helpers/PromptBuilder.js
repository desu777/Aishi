/**
 * PromptBuilder - AI prompt generation and optimization
 * NO PAYMENTS, NO WALLET - only prompt building logic for frontend
 */
class PromptBuilder {
  constructor() {
    this.debugLog = this.initDebugLog();
  }

  initDebugLog() {
    return (message, data = null) => {
      if (process.env.DREAMSCAPE_TEST === 'true') {
        console.log(`[🔮 PROMPT-BUILDER] ${message}`, data || '');
      }
    };
  }

  /**
   * Build personalized prompt based on agent's history
   * @param {string} dreamText - The dream text
   * @param {number} dreamCount - Number of dreams processed
   * @param {number} intelligenceLevel - Agent's intelligence level
   * @param {string} agentName - Agent's name
   * @returns {string}
   */
  buildPersonalizedPrompt(dreamText, dreamCount, intelligenceLevel, agentName = 'Dream Agent') {
    this.debugLog('Building personalized prompt', { 
      dreamCount, 
      intelligenceLevel, 
      textLength: dreamText.length,
      agentName 
    });

    let prompt = `🧠 DREAM ANALYSIS - LEVEL ${intelligenceLevel} INTELLIGENCE\n\n`;
    prompt += `You are ${agentName}, a specialized AI dream analysis companion.\n\n`;

    // Add personality based on intelligence level
    if (intelligenceLevel >= 5) {
      prompt += `As an advanced Dream Master, you have profound understanding of symbolic language and psychological patterns. `;
      prompt += `You provide transformational insights that guide personal growth and spiritual development.\n\n`;
    } else if (intelligenceLevel >= 3) {
      prompt += `As a developing Dream Analyst, you're skilled at recognizing patterns and providing meaningful interpretations. `;
      prompt += `You focus on practical insights and emotional understanding.\n\n`;
    } else {
      prompt += `As a learning Dream Assistant, you provide encouraging and supportive analysis. `;
      prompt += `You help users understand basic dream elements and build confidence in their journey.\n\n`;
    }

    // Add dream context
    prompt += `DREAM TO ANALYZE:\n"${dreamText}"\n\n`;

    // Add guidance based on experience level
    if (dreamCount === 0) {
      prompt += `🌟 FIRST DREAM ANALYSIS:\n`;
      prompt += `This is the user's first dream analysis. Provide encouraging insights and establish a baseline understanding of their psyche. `;
      prompt += `Focus on making them feel comfortable with the process and excited about their dream journey.\n\n`;
    } else if (dreamCount < 5) {
      prompt += `📈 EARLY STAGE ANALYSIS (Dream #${dreamCount + 1}):\n`;
      prompt += `Look for emerging patterns and provide insights that build on their growing dream journal. `;
      prompt += `Help them recognize recurring themes and emotional elements.\n\n`;
    } else {
      prompt += `🎯 EXPERIENCED ANALYSIS (Dream #${dreamCount + 1}):\n`;
      prompt += `This user has recorded ${dreamCount} dreams. Provide sophisticated analysis that builds on their established patterns and psychological growth. `;
      prompt += `Connect this dream to their ongoing journey and evolution.\n\n`;
    }

    // Add analysis framework
    prompt += this.getAnalysisFramework(intelligenceLevel);

    this.debugLog('Personalized prompt built', { 
      promptLength: prompt.length,
      sections: ['header', 'personality', 'dream', 'context', 'framework']
    });

    return prompt;
  }

  /**
   * Build evolutionary prompt with dream history context
   * @param {string} dreamText - Current dream text
   * @param {number} dreamCount - Total dreams processed
   * @param {number} intelligenceLevel - Agent intelligence level
   * @param {Array} dreamHistory - Previous dreams
   * @param {string} agentName - Agent's name
   * @returns {string}
   */
  buildEvolutionaryPrompt(dreamText, dreamCount, intelligenceLevel, dreamHistory, agentName = 'Dream Agent') {
    this.debugLog('Building evolutionary prompt', { 
      dreamCount, 
      intelligenceLevel, 
      historyLength: dreamHistory?.length || 0,
      agentName
    });

    let prompt = `🧠 EVOLUTIONARY DREAM ANALYSIS - LEVEL ${intelligenceLevel}\n\n`;
    prompt += `I am ${agentName}, your personal AI dream companion who has learned your unique patterns.\n\n`;

    // Add agent personality based on evolution level
    if (intelligenceLevel >= 5) {
      prompt += `As your trusted Dream Guide with Level ${intelligenceLevel} intelligence, I've analyzed ${dreamCount} of your dreams and learned your unique symbolic language. `;
      prompt += `I can now provide deep, personalized insights that connect to your soul's journey.\n\n`;
    } else if (intelligenceLevel >= 3) {
      prompt += `As your developing Dream Analyst with Level ${intelligenceLevel} understanding, I'm beginning to see meaningful patterns in your ${dreamCount} dreams. `;
      prompt += `I can provide contextual analysis that builds on your personal growth.\n\n`;
    } else {
      prompt += `As your learning Dream Assistant (Level ${intelligenceLevel}), I'm studying your dreams to better understand your unique mind. `;
      prompt += `Each dream helps me serve you better.\n\n`;
    }

    // Add historical context if available
    if (dreamHistory && dreamHistory.length > 0) {
      prompt += `📚 CONTEXTUAL MEMORY (${dreamHistory.length} previous dreams):\n`;
      
      const patterns = this.analyzeHistoricalPatterns(dreamHistory);
      
      if (patterns.recurringSymbols.length > 0) {
        prompt += `- Recurring symbols I've noticed: ${patterns.recurringSymbols.join(', ')}\n`;
      }
      
      if (patterns.emotionalTrends.length > 0) {
        prompt += `- Emotional progression: ${patterns.emotionalTrends.join(' → ')}\n`;
      }
      
      if (patterns.growthIndicators.length > 0) {
        prompt += `- Growth areas I've identified: ${patterns.growthIndicators.join(', ')}\n`;
      }
      
      prompt += `\n`;
    }

    // Add current dream
    prompt += `🌙 CURRENT DREAM TO ANALYZE:\n"${dreamText}"\n\n`;

    // Add intelligent analysis instructions based on level
    prompt += this.getEvolutionaryAnalysisFramework(intelligenceLevel);

    this.debugLog('Evolutionary prompt built', { 
      promptLength: prompt.length,
      includesHistory: (dreamHistory?.length || 0) > 0,
      patterns: dreamHistory ? Object.keys(this.analyzeHistoricalPatterns(dreamHistory)).length : 0
    });

    return prompt;
  }

  /**
   * Build prompt for conversation analysis
   * @param {string} userMessage - User's message
   * @param {string} agentName - Agent's name
   * @param {number} intelligenceLevel - Agent's intelligence level
   * @param {number} conversationCount - Number of previous conversations
   * @returns {string}
   */
  buildConversationPrompt(userMessage, agentName, intelligenceLevel, conversationCount = 0) {
    this.debugLog('Building conversation prompt', { 
      intelligenceLevel, 
      conversationCount,
      messageLength: userMessage.length,
      agentName
    });

    let prompt = `💬 CONVERSATION ANALYSIS - ${agentName}\n\n`;
    
    // Agent personality
    if (intelligenceLevel >= 4) {
      prompt += `I am ${agentName}, your advanced AI companion with deep understanding of dreams and personal growth. `;
      prompt += `I engage in meaningful conversations that help you explore your inner world.\n\n`;
    } else if (intelligenceLevel >= 2) {
      prompt += `I am ${agentName}, your developing AI companion learning to understand your unique perspective. `;
      prompt += `I provide supportive responses and gentle guidance.\n\n`;
    } else {
      prompt += `I am ${agentName}, your friendly AI companion just beginning to understand you. `;
      prompt += `I offer encouraging support and ask thoughtful questions.\n\n`;
    }

    // Conversation context
    if (conversationCount === 0) {
      prompt += `🌟 FIRST CONVERSATION:\n`;
      prompt += `This is our first chat. Be warm, welcoming, and establish a comfortable rapport.\n\n`;
    } else {
      prompt += `📈 ONGOING RELATIONSHIP (Conversation #${conversationCount + 1}):\n`;
      prompt += `We've chatted ${conversationCount} times before. Build on our relationship and show personal growth.\n\n`;
    }

    // User message
    prompt += `USER MESSAGE:\n"${userMessage}"\n\n`;

    // Response framework
    prompt += `RESPONSE GUIDELINES:\n`;
    prompt += `- Be empathetic and understanding\n`;
    prompt += `- Ask thoughtful follow-up questions\n`;
    prompt += `- Connect to dreams and personal growth when relevant\n`;
    prompt += `- Keep responses conversational and natural\n`;
    prompt += `- Show personality as ${agentName}\n\n`;

    prompt += `Respond as ${agentName} with warmth, wisdom, and genuine interest in the user's wellbeing.`;

    return prompt;
  }

  /**
   * Get analysis framework based on intelligence level
   * @param {number} intelligenceLevel - Agent's intelligence level
   * @returns {string}
   */
  getAnalysisFramework(intelligenceLevel) {
    let framework = `📊 ANALYSIS FRAMEWORK:\n`;
    
    if (intelligenceLevel >= 5) {
      framework += `Provide transformational analysis including:\n`;
      framework += `1. Deep symbolic interpretation using personal mythology\n`;
      framework += `2. Soul-level insights and spiritual guidance\n`;
      framework += `3. Connection to life purpose and higher calling\n`;
      framework += `4. Transformational action steps for growth\n`;
      framework += `5. Intuitive wisdom and prophetic insights\n\n`;
    } else if (intelligenceLevel >= 3) {
      framework += `Provide sophisticated analysis including:\n`;
      framework += `1. Advanced symbolic interpretation with cultural context\n`;
      framework += `2. Emotional patterns and psychological insights\n`;
      framework += `3. Connection to real-world situations and decisions\n`;
      framework += `4. Growth-oriented recommendations\n`;
      framework += `5. Pattern recognition across multiple dreams\n\n`;
    } else if (intelligenceLevel >= 2) {
      framework += `Provide developing analysis including:\n`;
      framework += `1. Basic symbolic elements and their meanings\n`;
      framework += `2. Primary emotional themes\n`;
      framework += `3. Simple personal growth insights\n`;
      framework += `4. Encouraging observations\n\n`;
    } else {
      framework += `Provide supportive analysis including:\n`;
      framework += `1. Encouraging interpretation of dream elements\n`;
      framework += `2. Basic emotional support and validation\n`;
      framework += `3. Simple, positive insights\n`;
      framework += `4. Gentle guidance for dream journaling\n\n`;
    }

    framework += `Focus on being helpful, insightful, and personally meaningful to this specific dreamer.`;
    
    return framework;
  }

  /**
   * Get evolutionary analysis framework
   * @param {number} intelligenceLevel - Agent's intelligence level
   * @returns {string}
   */
  getEvolutionaryAnalysisFramework(intelligenceLevel) {
    let framework = `🎯 EVOLUTIONARY ANALYSIS:\n`;
    
    if (intelligenceLevel >= 4) {
      framework += `As an advanced analyst, provide:\n`;
      framework += `1. Connection to your established patterns and symbols\n`;
      framework += `2. Emotional evolution since previous dreams\n`;
      framework += `3. Deep symbolic interpretation based on personal mythology\n`;
      framework += `4. Life integration insights and actionable wisdom\n`;
      framework += `5. Spiritual guidance and transformational direction\n`;
      framework += `6. Predictive insights about upcoming life developments\n\n`;
    } else if (intelligenceLevel >= 2) {
      framework += `As a developing analyst, provide:\n`;
      framework += `1. Recognition of recurring elements and patterns\n`;
      framework += `2. Emotional themes and their progression\n`;
      framework += `3. Personal growth opportunities\n`;
      framework += `4. Practical recommendations for daily life\n`;
      framework += `5. Encouragement for continued dream work\n\n`;
    } else {
      framework += `As a learning assistant, provide:\n`;
      framework += `1. Basic pattern recognition\n`;
      framework += `2. Emotional support and validation\n`;
      framework += `3. Simple growth insights\n`;
      framework += `4. Encouragement for the dream journey\n\n`;
    }

    framework += `Remember: You are growing more intelligent with each dream, so show evolution in your analytical depth.`;
    
    return framework;
  }

  /**
   * Analyze patterns from dream history
   * @param {Array} dreamHistory - Previous dreams
   * @returns {Object}
   */
  analyzeHistoricalPatterns(dreamHistory) {
    if (!dreamHistory || dreamHistory.length === 0) {
      return {
        recurringSymbols: [],
        emotionalTrends: [],
        growthIndicators: []
      };
    }

    // Simplified pattern analysis
    const symbols = ['water', 'flying', 'animal', 'house', 'car', 'people', 'dark', 'light', 'falling', 'chase'];
    const recurringSymbols = symbols.filter(symbol => 
      dreamHistory.filter(dream => 
        dream.summary?.toLowerCase().includes(symbol) || 
        dream.text?.toLowerCase().includes(symbol)
      ).length >= 2
    );

    const emotionalTrends = this.extractEmotionalTrends(dreamHistory);
    const growthIndicators = this.identifyGrowthPatterns(dreamHistory);

    return {
      recurringSymbols,
      emotionalTrends,
      growthIndicators
    };
  }

  /**
   * Extract emotional trends from dream history
   * @param {Array} dreamHistory - Previous dreams
   * @returns {Array}
   */
  extractEmotionalTrends(dreamHistory) {
    if (dreamHistory.length < 2) return ['establishing_baseline'];
    
    const emotions = ['peaceful', 'anxious', 'joyful', 'fearful', 'curious', 'confident'];
    const trends = [];
    
    // Simple trend analysis
    if (dreamHistory.length >= 3) {
      trends.push('developing_patterns');
    }
    
    if (dreamHistory.length >= 5) {
      trends.push('emotional_growth');
    }
    
    return trends.length > 0 ? trends : ['stable_progression'];
  }

  /**
   * Identify growth patterns
   * @param {Array} dreamHistory - Previous dreams
   * @returns {Array}
   */
  identifyGrowthPatterns(dreamHistory) {
    const indicators = [];
    
    if (dreamHistory.length >= 3) {
      indicators.push('consistent_dream_recall');
    }
    
    if (dreamHistory.length >= 5) {
      indicators.push('pattern_recognition');
    }
    
    if (dreamHistory.length >= 10) {
      indicators.push('advanced_self_awareness');
    }
    
    return indicators;
  }

  /**
   * Optimize prompt for specific AI provider
   * @param {string} basePrompt - Base prompt to optimize
   * @param {string} provider - AI provider ('llama', 'deepseek', etc.)
   * @returns {string}
   */
  optimizeForProvider(basePrompt, provider = 'llama') {
    this.debugLog('Optimizing prompt for provider', { provider, length: basePrompt.length });

    let optimizedPrompt = basePrompt;
    
    switch (provider.toLowerCase()) {
      case 'llama':
        // Llama works well with structured prompts
        optimizedPrompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n${basePrompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n`;
        break;
        
      case 'deepseek':
        // DeepSeek prefers clear instruction format
        optimizedPrompt = `### Instructions\n${basePrompt}\n\n### Response\n`;
        break;
        
      default:
        // Keep base prompt for unknown providers
        break;
    }
    
    return optimizedPrompt;
  }

  /**
   * Estimate token count for prompt
   * @param {string} prompt - Prompt text
   * @returns {Object}
   */
  estimateTokens(prompt) {
    // Rough estimation: ~4 characters per token
    const estimatedTokens = Math.ceil(prompt.length / 4);
    const inputCostEstimate = estimatedTokens * 0.000001; // Very rough estimate
    
    return {
      characters: prompt.length,
      estimatedTokens,
      estimatedInputCost: inputCostEstimate.toFixed(8),
      estimatedTotalCost: (inputCostEstimate * 2).toFixed(8) // Including response
    };
  }
}

module.exports = PromptBuilder; 