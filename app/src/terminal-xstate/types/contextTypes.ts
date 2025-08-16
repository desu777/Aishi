/**
 * @fileoverview Production types for Dream Analysis Context
 * @description Clean interfaces without mock references for production use
 */

export interface DreamContext {
  userDream: string;
  agentProfile: {
    name: string;
    intelligenceLevel: number;
    dreamCount: number;
    conversationCount: number;
  };
  personality: {
    creativity: number;
    analytical: number;
    empathy: number;
    intuition: number;
    resilience: number;
    curiosity: number;
    dominantMood: string;
    responseStyle: string;
  };
  uniqueFeatures?: Array<{
    name: string;
    description: string;
    intensity: number;
  }>;
  memoryAccess: {
    monthsAccessible: number;
    memoryDepth: string;
  };
  historicalData: {
    dailyDreams: any[];
    monthlyConsolidations: any[];
    yearlyCore: any;
  };
}

export interface AIResponse {
  fullAnalysis: string;
  dreamData: {
    id: number;
    timestamp: number;
    content: string;
    emotions: string[];
    symbols: string[];
    intensity: number;
    lucidity: number;
    dreamType: string;
  };
  analysis: string;
  personalityImpact?: {
    creativityChange: number;
    analyticalChange: number;
    empathyChange: number;
    intuitionChange: number;
    resilienceChange: number;
    curiosityChange: number;
    moodShift: string;
    evolutionWeight: number;
    newFeatures: Array<{
      name: string;
      description: string;
      intensity: number;
    }>;
  };
}

export interface DefaultAgentData {
  tokenId: number;
  agentName: string;
  intelligenceLevel: number;
  dreamCount: number;
  conversationCount: number;
  personality: {
    creativity: number;
    analytical: number;
    empathy: number;
    intuition: number;
    resilience: number;
    curiosity: number;
    dominantMood: string;
  };
}

// Default values for fallback scenarios
export const defaultAgentData: DefaultAgentData = {
  tokenId: 1,
  agentName: 'Aurora',
  intelligenceLevel: 5,
  dreamCount: 12,
  conversationCount: 45,
  personality: {
    creativity: 50,
    analytical: 50,
    empathy: 50,
    intuition: 50,
    resilience: 50,
    curiosity: 50,
    dominantMood: 'neutral'
  }
};