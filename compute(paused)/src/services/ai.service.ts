import { ethers } from 'ethers';
import OpenAI from 'openai';
import { OFFICIAL_PROVIDERS } from '../config/constants';
import { AIAnalysisResponse, ComputeBackendError, InsufficientFundsError } from '../types';
import { getBrokerSession, updateBrokerActivity } from '../utils/cache';
import { logOperation, logError } from '../utils/logger';
import { createZGComputeNetworkBroker } from '@0glabs/0g-serving-broker';
import { networkConfig } from '../config/env';

/**
 * AI Service - Handles AI inference operations
 * Based on working test-compute.ts implementation
 */
export class AIService {
  private provider: ethers.JsonRpcProvider;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(networkConfig.computeRpcUrl);
  }
  
  /**
   * Analyze dream text using AI (hybrid approach)
   * Uses real SDK for AI operations after broker is initialized
   */
  async analyzeDream(
    address: string, 
    dreamText: string, 
    model: 'llama' | 'deepseek' = 'llama'
  ): Promise<AIAnalysisResponse> {
    const startTime = Date.now();
    
    try {
      logOperation('ai_analysis_start', address, false, { 
        model, 
        dreamTextLength: dreamText.length 
      });

      // Get broker session
      const brokerSession = getBrokerSession(address);
      if (!brokerSession || !brokerSession.initialized) {
        throw new ComputeBackendError(
          'Broker not initialized. Please initialize broker first.',
          400,
          'BROKER_NOT_INITIALIZED'
        );
      }

      updateBrokerActivity(address);

      // Try to use real SDK for AI operations
      try {
        return await this.analyzeDreamWithRealSDK(address, dreamText, model);
      } catch (sdkError: any) {
        logError('Real SDK failed, falling back to custom implementation', sdkError, { address });
        // Fall back to custom implementation
        return await this.analyzeDreamWithCustomBroker(brokerSession, address, dreamText, model);
      }

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      logError('AI analysis failed', error as Error, { 
        address, 
        model, 
        responseTime,
        dreamTextLength: dreamText.length 
      });

      // Handle specific error types
      if ((error as Error).message.includes('insufficient')) {
        throw new InsufficientFundsError('Insufficient funds for AI analysis');
      }

      throw new ComputeBackendError(
        `AI analysis failed: ${(error as Error).message}`,
        500,
        'AI_ANALYSIS_FAILED'
      );
    }
  }

  /**
   * Analyze dream using real 0G SDK (preferred method)
   */
  private async analyzeDreamWithRealSDK(
    address: string,
    dreamText: string,
    model: 'llama' | 'deepseek'
  ): Promise<AIAnalysisResponse> {
    const startTime = Date.now();
    
    logOperation('ai_analysis_real_sdk_start', address, false, { model });

    // Create a temporary wallet for this operation
    // Note: This requires the user's private key, which we don't have
    // So we'll need to use a service account or implement a proxy pattern
    throw new Error('Real SDK requires private key - not available in delegated mode');
  }

  /**
   * Analyze dream using custom broker implementation (fallback)
   */
  private async analyzeDreamWithCustomBroker(
    brokerSession: any,
    address: string,
    dreamText: string,
    model: 'llama' | 'deepseek'
  ): Promise<AIAnalysisResponse> {
    const startTime = Date.now();

    // Select provider based on model
    const selectedProvider = model === 'deepseek' 
      ? OFFICIAL_PROVIDERS['deepseek-r1-70b']
      : OFFICIAL_PROVIDERS['llama-3.3-70b-instruct'];

    // Try to acknowledge provider (optional - don't fail if it doesn't work)
    try {
      await brokerSession.broker.inference.acknowledgeProviderSigner(selectedProvider);
      logOperation('provider_acknowledged', address, true, { provider: selectedProvider });
    } catch (error: any) {
      // Acknowledge failed - log warning but continue with AI query
      logError('Provider acknowledge failed, proceeding without it', error as Error, { 
        provider: selectedProvider,
        address,
        errorMessage: error.message
      });
      // Continue with AI query anyway - some providers might work without acknowledge
    }

    // Get service metadata (like in test-compute.ts)
    const { endpoint, modelName } = await brokerSession.broker.inference.getServiceMetadata(selectedProvider);
    
    logOperation('ai_service_metadata', address, true, { 
      endpoint, 
      model: modelName, 
      provider: selectedProvider 
    });

    // Generate authentication headers (like in test-compute.ts)
    const headers = await brokerSession.broker.inference.getRequestHeaders(selectedProvider, dreamText);

    // Create OpenAI client (like in test-compute.ts)
    const openai = new OpenAI({
      baseURL: endpoint,
      apiKey: "", // Empty string as per 0G docs
    });

    // Prepare headers for OpenAI client
    const requestHeaders: Record<string, string> = {};
    Object.entries(headers).forEach(([key, value]) => {
      if (typeof value === 'string') {
        requestHeaders[key] = value;
      }
    });

    // Send query to AI service (like in test-compute.ts)
    logOperation('ai_query_start', address, false, { model: modelName });
    
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: dreamText }],
      model: modelName,
    }, {
      headers: requestHeaders,
    });

    const aiResponse = completion.choices[0].message.content;
    const chatId = completion.id;
    const responseTime = Date.now() - startTime;

    logOperation('ai_query_success', address, true, { 
      model: modelName,
      responseTime,
      chatId
    });

    // Process response and handle payment (like in test-compute.ts)
    let isValid = false;
    try {
      isValid = await brokerSession.broker.inference.processResponse(
        selectedProvider,
        aiResponse || "",
        chatId
      );
    } catch (error) {
      logError('Payment processing failed', error as Error, { address, chatId });
      // Continue even if payment processing fails - response is still valid
    }

    // Get updated balance
    let remainingBalance = "0";
    try {
      const balanceInfo = await brokerSession.broker.ledger.getLedger();
      remainingBalance = ethers.formatEther(balanceInfo.ledgerInfo[0]);
    } catch (error) {
      logError('Failed to get updated balance', error as Error, { address });
    }

    // Parse AI response into structured analysis
    const analysis = this.parseAIResponse(aiResponse || "", model);

    logOperation('ai_analysis_complete', address, true, {
      model: modelName,
      responseTime,
      isValid,
      remainingBalance
    });

    return {
      success: true,
      analysis: {
        ...analysis,
        model: modelName,
        responseTime
      },
      cost: "0.000", // Testnet is free
      remainingBalance: `${remainingBalance} OG`
    };
  }

  /**
   * Parse AI response into structured dream analysis
   */
  private parseAIResponse(response: string, model: 'llama' | 'deepseek') {
    try {
      // Basic parsing - can be enhanced with more sophisticated NLP
      const interpretation = response;
      
      // Extract potential symbols (simple keyword matching)
      const symbolKeywords = [
        'water', 'flying', 'falling', 'animals', 'death', 'birth', 'fire', 'house', 
        'car', 'family', 'friends', 'chase', 'lost', 'naked', 'school', 'work',
        'money', 'love', 'fear', 'anger', 'joy', 'sadness'
      ];
      
      const symbols = symbolKeywords.filter(keyword => 
        response.toLowerCase().includes(keyword)
      );

      // Extract potential emotions
      const emotionKeywords = [
        'happy', 'sad', 'angry', 'fearful', 'anxious', 'excited', 'confused',
        'peaceful', 'stressed', 'lonely', 'loved', 'empowered', 'helpless'
      ];
      
      const emotions = emotionKeywords.filter(emotion => 
        response.toLowerCase().includes(emotion)
      );

      // Generate insights based on model type
      const insights = this.generateInsights(response, model);

      return {
        interpretation,
        symbols,
        emotions,
        insights
      };

    } catch (error) {
      logError('Failed to parse AI response', error as Error, { model });
      
      // Fallback parsing
      return {
        interpretation: response,
        symbols: [],
        emotions: [],
        insights: ['Analysis completed with basic interpretation']
      };
    }
  }

  /**
   * Generate insights based on AI response and model capabilities
   */
  private generateInsights(response: string, model: 'llama' | 'deepseek'): string[] {
    const insights: string[] = [];
    
    if (model === 'deepseek') {
      // DeepSeek is better for detailed analysis
      if (response.length > 500) {
        insights.push('Comprehensive analysis provided with detailed interpretations');
      }
      if (response.includes('symbol')) {
        insights.push('Symbolic elements identified and analyzed');
      }
      if (response.includes('meaning') || response.includes('represent')) {
        insights.push('Psychological meanings explored in depth');
      }
    } else {
      // LLAMA is faster and more conversational
      if (response.length > 200) {
        insights.push('Clear and concise interpretation provided');
      }
      if (response.includes('dream')) {
        insights.push('Dream elements directly addressed');
      }
    }

    // Common insights
    if (response.includes('emotion')) {
      insights.push('Emotional aspects of the dream analyzed');
    }
    if (response.includes('subconscious') || response.includes('psyche')) {
      insights.push('Subconscious elements explored');
    }
    if (response.includes('advice') || response.includes('suggest')) {
      insights.push('Practical guidance provided');
    }

    // Ensure at least one insight
    if (insights.length === 0) {
      insights.push('AI analysis completed successfully');
    }

    return insights;
  }

  /**
   * Get model capabilities and pricing info
   */
  getModelInfo(model: 'llama' | 'deepseek') {
    const modelConfigs = {
      llama: {
        name: 'LLAMA-3.3-70B-Instruct',
        provider: OFFICIAL_PROVIDERS['llama-3.3-70b-instruct'],
        strengths: ['Fast responses', 'Conversational', 'General-purpose'],
        averageResponseTime: '3-7 seconds',
        bestFor: 'Quick dream interpretations and general analysis'
      },
      deepseek: {
        name: 'DeepSeek-R1-70B',
        provider: OFFICIAL_PROVIDERS['deepseek-r1-70b'],
        strengths: ['Detailed analysis', 'Reasoning', 'Symbolic interpretation'],
        averageResponseTime: '15-25 seconds',
        bestFor: 'In-depth dream analysis and symbolic exploration'
      }
    };

    return modelConfigs[model];
  }
} 