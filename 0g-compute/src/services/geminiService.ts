import '../config/envLoader';

/**
 * Gemini AI Service for Vertex AI integration
 * Acts as a proxy between frontend and Google's Gemini models
 */
export class GeminiService {
  private genAI: any = null;
  private GoogleGenAI: any = null;
  private isInitialized = false;

  /**
   * Initialize the Gemini AI client with Vertex AI configuration
   */
  async initialize(): Promise<void> {
    try {
      // Verify required environment variables
      const requiredVars = [
        'GOOGLE_APPLICATION_CREDENTIALS',
        'VERTEX_AI_PROJECT',
        'VERTEX_AI_LOCATION'
      ];

      for (const varName of requiredVars) {
        if (!process.env[varName]) {
          throw new Error(`Missing required environment variable: ${varName}`);
        }
      }

      // Set up environment for Vertex AI
      process.env.GOOGLE_GENAI_USE_VERTEXAI = 'true';
      process.env.GOOGLE_CLOUD_PROJECT = process.env.VERTEX_AI_PROJECT;
      process.env.GOOGLE_CLOUD_LOCATION = process.env.VERTEX_AI_LOCATION;

      // Dynamic import for ESM module
      const genaiModule = await import('@google/genai');
      this.GoogleGenAI = genaiModule.GoogleGenAI;

      // Initialize GoogleGenAI client with Vertex AI parameters
      this.genAI = new this.GoogleGenAI({
        vertexai: true,
        project: process.env.VERTEX_AI_PROJECT,
        location: process.env.VERTEX_AI_LOCATION
      });
      
      this.isInitialized = true;
      console.log('✅ Gemini AI Service initialized successfully');
      console.log(`   Project: ${process.env.VERTEX_AI_PROJECT}`);
      console.log(`   Location: ${process.env.VERTEX_AI_LOCATION}`);
      console.log(`   Model: ${process.env.GEMINI_MODEL || 'gemini-2.5-flash'}`);
      console.log(`   Using service account: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`);
      
      // Log thinking configuration
      const enableThinking = process.env.GEMINI_ENABLE_THINKING === 'true';
      if (enableThinking) {
        const thinkingBudget = Math.max(0, Math.min(parseInt(process.env.GEMINI_THINKING_BUDGET || '0'), 24576));
        console.log(`   🧠 Thinking enabled: budget=${thinkingBudget} tokens`);
      } else {
        console.log(`   🧠 Thinking disabled (for maximum speed)`);
      }
    } catch (error: any) {
      console.error('❌ Failed to initialize Gemini AI Service:', error.message);
      throw error;
    }
  }

  /**
   * Generate content using Gemini model
   * @param prompt - The prompt to send to Gemini
   * @param options - Optional parameters (temperature, maxTokens)
   * @returns The response from Gemini
   */
  async generateContent(
    prompt: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<any> {
    if (!this.isInitialized || !this.genAI) {
      throw new Error('Gemini AI Service not initialized');
    }

    try {
      // Get model name from environment or use default
      const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
      
      // Get generation config from environment and options
      const temperature = options?.temperature || parseFloat(process.env.GEMINI_TEMPERATURE || '0.8');
      
      // Build generation config
      const generationConfig: any = {
        temperature,
        candidateCount: 1,
      };

      // OPTIONAL: Add thinking configuration if enabled (for speed optimization)
      const enableThinking = process.env.GEMINI_ENABLE_THINKING === 'true';
      if (enableThinking) {
        const thinkingBudget = parseInt(process.env.GEMINI_THINKING_BUDGET || '0');
        const includeThoughts = process.env.GEMINI_INCLUDE_THOUGHTS === 'true';
        
        // Validate thinking budget (0-24576 range for Gemini 2.5 Flash)
        const validatedBudget = Math.max(0, Math.min(thinkingBudget, 24576));
        
        generationConfig.thinkingConfig = {
          thinkingBudget: validatedBudget,
          includeThoughts
        };

        if (process.env.TEST_ENV === 'true') {
          console.log(`🧠 Thinking enabled: budget=${validatedBudget}, includeThoughts=${includeThoughts}`);
        }
      }

      // JSON Schema removed - using markdown fallback approach for reliability

      // Log request details in test mode
      if (process.env.TEST_ENV === 'true') {
        console.log(`🤖 Gemini Request:`, {
          model: modelName,
          promptLength: prompt.length,
          temperature,
          thinkingEnabled: enableThinking,
          ...(enableThinking && { thinkingConfig: generationConfig.thinkingConfig })
        });
      }

      // Generate content using the new API
      const startTime = Date.now();
      const response = await this.genAI.models.generateContent({
        model: modelName,
        contents: prompt,
        config: generationConfig
      });
      const responseTime = Date.now() - startTime;

      // Extract text from response - just pass it through
      let responseText = response.text;

      if (process.env.TEST_ENV === 'true') {
        console.log(`✅ Gemini Response received in ${responseTime}ms`);
      }

      return {
        success: true,
        data: responseText,
        metadata: {
          model: modelName,
          responseTime,
          promptTokenCount: response.usageMetadata?.promptTokenCount || 0,
          candidatesTokenCount: response.usageMetadata?.candidatesTokenCount || 0,
          totalTokenCount: response.usageMetadata?.totalTokenCount || 0,
        }
      };

    } catch (error: any) {
      console.error('❌ Gemini generation error:', error.message);
      
      // Handle specific error types
      if (error.message?.includes('PERMISSION_DENIED')) {
        throw new Error('Authentication failed. Please check your service account credentials.');
      } else if (error.message?.includes('INVALID_ARGUMENT')) {
        throw new Error('Invalid request parameters. Please check your prompt and configuration.');
      } else if (error.message?.includes('RESOURCE_EXHAUSTED')) {
        throw new Error('Quota exceeded. Please try again later.');
      } else {
        throw new Error(`Gemini AI error: ${error.message}`);
      }
    }
  }

  /**
   * Check if service is ready
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Get service status
   */
  getStatus(): {
    isReady: boolean;
    project: string | undefined;
    location: string | undefined;
    model: string | undefined;
    thinkingEnabled: boolean;
    thinkingBudget?: number;
  } {
    const enableThinking = process.env.GEMINI_ENABLE_THINKING === 'true';
    return {
      isReady: this.isInitialized,
      project: process.env.VERTEX_AI_PROJECT,
      location: process.env.VERTEX_AI_LOCATION,
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      thinkingEnabled: enableThinking,
      ...(enableThinking && { 
        thinkingBudget: Math.max(0, Math.min(parseInt(process.env.GEMINI_THINKING_BUDGET || '0'), 24576))
      })
    };
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    this.genAI = null;
    this.GoogleGenAI = null;
    this.isInitialized = false;
    console.log('🛑 Gemini AI Service cleaned up');
  }
}

// Export singleton instance
export default new GeminiService();