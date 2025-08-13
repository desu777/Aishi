import '../config/envLoader';

/**
 * Modern Gemini AI Service with Dynamic Profile Selection
 * Supports 3 profiles: thinking, fast, auto - configured at runtime
 * No .env dependency for model configuration
 */

interface GeminiProfile {
  name: string;
  thinking: {
    enabled: boolean;
    budget: number; // -1=auto, 0=off, 1-24576=fixed
    includeThoughts?: boolean;
  };
  temperature: number;
  description: string;
}

interface GeminiGenerationOptions {
  temperature?: number;
  maxTokens?: number;
}

interface GeminiResponse {
  success: boolean;
  data: string;
  metadata: {
    model: string;
    profile: string;
    responseTime: number;
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
    thinkingEnabled: boolean;
    thinkingBudget?: number;
  };
}

// Profile Definitions - Dynamic, No .env Dependency
const GEMINI_PROFILES: Record<string, GeminiProfile> = {
  'thinking': {
    name: 'Deep Reasoning',
    thinking: { 
      enabled: true, 
      budget: 12288, // Half of maximum (24576/2) for deep reasoning
      includeThoughts: false 
    },
    temperature: 0.8,
    description: 'Optimized for complex reasoning and analysis'
  },
  'fast': {
    name: 'Speed Mode',
    thinking: { 
      enabled: false, 
      budget: 0 // Thinking disabled for maximum speed
    },
    temperature: 0.9,
    description: 'Optimized for quick responses and high throughput'
  },
  'auto': {
    name: 'Adaptive Mode',
    thinking: { 
      enabled: true, 
      budget: -1 // Dynamic - model adjusts thinking based on complexity
    },
    temperature: 0.8,
    description: 'Automatically adjusts reasoning depth based on query complexity'
  }
};

export class GeminiService {
  private genAI: any = null;
  private GoogleGenAI: any = null;
  private isInitialized = false;
  private readonly modelName = 'gemini-2.5-flash';

  /**
   * Initialize the Gemini AI client with Vertex AI configuration
   * Only credential-related environment variables are used
   */
  async initialize(): Promise<void> {
    try {
      // Verify required environment variables (ONLY credentials)
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
      console.log('✅ Modern Gemini AI Service initialized successfully');
      console.log(`   Project: ${process.env.VERTEX_AI_PROJECT}`);
      console.log(`   Location: ${process.env.VERTEX_AI_LOCATION}`);
      console.log(`   Model: ${this.modelName}`);
      console.log(`   Available Profiles: ${Object.keys(GEMINI_PROFILES).join(', ')}`);
      console.log('   🆕 Dynamic profile selection enabled (no .env dependency)');
    } catch (error: any) {
      console.error('❌ Failed to initialize Modern Gemini AI Service:', error.message);
      throw error;
    }
  }

  /**
   * Generate content using specified profile
   * @param prompt - The prompt to send to Gemini
   * @param profileId - Profile to use: 'thinking', 'fast', or 'auto'
   * @param options - Optional parameters (temperature, maxTokens)
   * @returns The response from Gemini with profile metadata
   */
  async generateContentWithProfile(
    prompt: string,
    profileId: string = 'auto',
    options?: GeminiGenerationOptions
  ): Promise<GeminiResponse> {
    if (!this.isInitialized || !this.genAI) {
      throw new Error('Gemini AI Service not initialized');
    }

    // Validate profile
    const profile = GEMINI_PROFILES[profileId];
    if (!profile) {
      console.warn(`⚠️ Invalid profile '${profileId}', falling back to 'auto'`);
      profileId = 'auto';
    }

    const activeProfile = GEMINI_PROFILES[profileId];

    try {
      // Build generation config with profile settings
      const temperature = options?.temperature || activeProfile.temperature;
      
      const generationConfig: any = {
        temperature,
        candidateCount: 1,
      };

      // Apply thinking configuration based on profile
      if (activeProfile.thinking.enabled) {
        generationConfig.thinkingConfig = {
          thinkingBudget: activeProfile.thinking.budget,
          includeThoughts: activeProfile.thinking.includeThoughts || false
        };

        if (process.env.TEST_ENV === 'true') {
          const budgetDisplay = activeProfile.thinking.budget === -1 
            ? 'AUTO' 
            : activeProfile.thinking.budget.toString();
          console.log(`🧠 Profile '${profileId}': Thinking enabled (budget: ${budgetDisplay})`);
        }
      } else {
        if (process.env.TEST_ENV === 'true') {
          console.log(`⚡ Profile '${profileId}': Thinking disabled (speed optimized)`);
        }
      }

      // Log request details in test mode
      if (process.env.TEST_ENV === 'true') {
        console.log(`🤖 Gemini Request:`, {
          model: this.modelName,
          profile: `${profileId} (${activeProfile.name})`,
          promptLength: prompt.length,
          temperature,
          thinkingEnabled: activeProfile.thinking.enabled,
          ...(activeProfile.thinking.enabled && { 
            thinkingBudget: activeProfile.thinking.budget 
          })
        });
      }

      // Generate content using the modern API
      const startTime = Date.now();
      const response = await this.genAI.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: generationConfig
      });
      const responseTime = Date.now() - startTime;

      // Extract text from response
      const responseText = response.text;

      if (process.env.TEST_ENV === 'true') {
        console.log(`✅ Gemini Response received in ${responseTime}ms using profile '${profileId}'`);
        console.log(`📊 Tokens: prompt=${response.usageMetadata?.promptTokenCount || 0}, response=${response.usageMetadata?.candidatesTokenCount || 0}`);
      }

      return {
        success: true,
        data: responseText,
        metadata: {
          model: this.modelName,
          profile: `${profileId} (${activeProfile.name})`,
          responseTime,
          promptTokenCount: response.usageMetadata?.promptTokenCount || 0,
          candidatesTokenCount: response.usageMetadata?.candidatesTokenCount || 0,
          totalTokenCount: response.usageMetadata?.totalTokenCount || 0,
          thinkingEnabled: activeProfile.thinking.enabled,
          ...(activeProfile.thinking.enabled && { 
            thinkingBudget: activeProfile.thinking.budget 
          })
        }
      };

    } catch (error: any) {
      console.error(`❌ Gemini generation error with profile '${profileId}':`, error.message);
      
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
   * Legacy compatibility method - uses 'auto' profile by default
   */
  async generateContent(
    prompt: string,
    options?: GeminiGenerationOptions
  ): Promise<any> {
    const result = await this.generateContentWithProfile(prompt, 'auto', options);
    
    // Return in legacy format for backward compatibility
    return {
      success: result.success,
      data: result.data,
      metadata: result.metadata
    };
  }

  /**
   * Get available profiles information
   */
  getAvailableProfiles(): Record<string, Omit<GeminiProfile, 'thinking'> & { 
    thinkingEnabled: boolean; 
    thinkingBudget: number | string; 
  }> {
    const profiles: any = {};
    
    Object.entries(GEMINI_PROFILES).forEach(([id, profile]) => {
      profiles[id] = {
        name: profile.name,
        description: profile.description,
        temperature: profile.temperature,
        thinkingEnabled: profile.thinking.enabled,
        thinkingBudget: profile.thinking.budget === -1 ? 'AUTO' : profile.thinking.budget
      };
    });

    return profiles;
  }

  /**
   * Extract profile from Gemini model ID (for backward compatibility)
   */
  static extractProfileFromModelId(modelId: string): string {
    if (modelId.includes('-thinking')) return 'thinking';
    if (modelId.includes('-fast')) return 'fast'; 
    if (modelId.includes('-auto')) return 'auto';
    return 'auto'; // fallback to auto
  }

  /**
   * Check if service is ready
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Get service status with profile information
   */
  getStatus(): {
    isReady: boolean;
    project: string | undefined;
    location: string | undefined;
    model: string;
    availableProfiles: string[];
    profileCount: number;
  } {
    return {
      isReady: this.isInitialized,
      project: process.env.VERTEX_AI_PROJECT,
      location: process.env.VERTEX_AI_LOCATION,
      model: this.modelName,
      availableProfiles: Object.keys(GEMINI_PROFILES),
      profileCount: Object.keys(GEMINI_PROFILES).length
    };
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    this.genAI = null;
    this.GoogleGenAI = null;
    this.isInitialized = false;
    console.log('🛑 Modern Gemini AI Service cleaned up');
  }
}

// Export singleton instance
export default new GeminiService();